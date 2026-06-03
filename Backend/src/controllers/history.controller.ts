import type { Request, Response } from "express";
import { getConversationHistory } from "../services/chat.service.js";

export async function getHistory(req: Request, res: Response) {
  try {
    const sessionId = req.params.sessionId as string;
    if (!sessionId) {
      return res.status(400).json({
        error: "Session ID is required",
      });
    }

    const messages = await getConversationHistory(sessionId);

    res.json(messages);
  } catch (error) {
    res.status(404).json({
      error: "Conversation not found",
    });
  }
}
