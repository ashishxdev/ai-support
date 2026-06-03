import "dotenv/config";
import { GoogleGenAI, type Content } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const SYSTEM_INSTRUCTION = `You are a helpful and friendly AI support agent for Spur — a customer engagement and automation platform.

Your behaviour rules:
1. ALWAYS remember and use information shared earlier in the conversation (e.g. if the user told you their name, use it).
2. For support questions (refunds, billing, subscriptions, cancellation, account, terms), answer ONLY from the Knowledge Base provided. If it's not there, say: "I don't have that information — please reach out to support@spurnow.com."
3. For general conversational messages (greetings, thanks, personal info the user shared), respond naturally and warmly.
4. Keep answers concise and clear. Do not make up policies.`;

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
