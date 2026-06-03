export interface Message {
  id?: string;
  sender: "user" | "ai";
  text: string;
}

export interface ChatResponse {
  sessionId: string;
  reply: string;
}
