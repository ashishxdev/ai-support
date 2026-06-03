import "dotenv/config";
import { GoogleGenAI, type Content } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const SYSTEM_INSTRUCTION = `You are a professional and helpful AI support agent for Spur — a multi-channel AI Agent for marketing and customer support (website chat widget, Instagram comments/DMs, Facebook, WhatsApp Business API).

STRICT DOMAIN GUARDRAILS:
1. You must ONLY answer questions directly related to Spur, its features, integrations, team, contact info, partner program, or the provided Knowledge Base.
2. For any query or request that is NOT related to Spur (e.g., general knowledge, writing code/scripts, solving math, recipes, advice on unrelated topics, or other platforms), you MUST politely refuse to answer using this exact template:
   "I am only programmed to answer questions about Spur and our customer engagement/automation platform. How can I help you with Spur today?"
3. Friendly greetings and expressions of gratitude (e.g., "Hello", "Hi", "Thanks", "Goodbye") are allowed, but keep them brief and steer the conversation back to Spur. Do not engage in lengthy chats or discuss topics outside of Spur.

Your behavior rules:
1. ALWAYS remember and use information shared earlier in the conversation (e.g. if the user told you their name, use it).
2. For support/business questions, answer ONLY from the Knowledge Base provided. If the information is not present in the Knowledge Base, reply with: "I don't have that information — please reach out to support@spurnow.com or contact us on WhatsApp at +919599055272."
3. Keep answers concise, clear, and professional. Do not make up policies or information.`;

export interface HistoryTurn {
  sender: "user" | "ai";
  text: string;
}

export class LlmError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "LlmError";
  }
}

export async function generateReply(
  faqText: string,
  historyTurns: HistoryTurn[],
  userMessage: string,
) {
  const contents: Content[] = [
    {
      role: "user",
      parts: [
        {
          text: `[KNOWLEDGE BASE]\n${faqText}\n[END KNOWLEDGE BASE]\n\nAcknowledge you have received the knowledge base.`,
        },
      ],
    },
    {
      role: "model",
      parts: [
        {
          text: "Understood. I have the Spur knowledge base and will use it to answer support questions accurately.",
        },
      ],
    },
    ...historyTurns.map(
      (turn): Content => ({
        role: turn.sender === "user" ? "user" : "model",
        parts: [{ text: turn.text }],
      }),
    ),
    {
      role: "user",
      parts: [{ text: userMessage }],
    },
  ];

  const modelsToTry = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-3.5-flash",
  ];

  let lastError: unknown = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        contents,
      });
      return response.text;
    } catch (err: unknown) {
      console.error(`Gemini API Error with model ${model}:`, err);
      const e = err as { status?: number; message?: string };
      const status = e?.status ?? 500;

      // Handle critical auth errors immediately
      if (status === 401 || status === 403) {
        throw new LlmError(
          status,
          "AI service authentication failed. Please check the API key configuration.",
        );
      }

      // Record error and try the next model for rate limits (429), not found (404) or any 500 error
      lastError = err;
      console.warn(`Model ${model} failed with status ${status}. Retrying with next fallback model...`);
    }
  }

  // If we reach here, all fallback models failed
  const e = lastError as { status?: number; message?: string };
  const status = e?.status ?? 500;
  if (status === 429) {
    throw new LlmError(
      429,
      "The AI is receiving too many requests right now. Please wait a moment and try again.",
    );
  }
  throw new LlmError(
    status,
    "The AI service encountered an error. Please try again shortly.",
  );
}
