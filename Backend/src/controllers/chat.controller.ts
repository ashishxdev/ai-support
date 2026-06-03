import type { Request, Response } from "express";
import { processMessage } from "../services/chat.service.js";
import { chatSchema } from "../schemas/chat.schema.js";
import { ZodError } from "zod";
import { LlmError } from "../services/llm.service.js";

export async function sendMessage(req: Request, res: Response) {
  try {
    const validated = chatSchema.parse(req.body);
    const result = await processMessage(validated.message, validated.sessionId);
    res.json(result);
  } catch (error) {
    console.error(error);

    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message });
    }

    if (error instanceof LlmError) {
      return res.status(error.status === 429 ? 429 : 503).json({ error: error.message });
    }

    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
