export declare function getConversationHistory(sessionId: string): Promise<{
    id: string;
    createdAt: Date;
    sender: string;
    text: string;
    conversationId: string;
}[]>;
export declare function processMessage(message: string, sessionId?: string): Promise<{
    sessionId: string;
    reply: string | undefined;
}>;
//# sourceMappingURL=chat.service.d.ts.map