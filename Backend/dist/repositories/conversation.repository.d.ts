export declare class ConversationRepository {
    createConversation(): Promise<{
        id: string;
        createdAt: Date;
    }>;
    getConversation(id: string): Promise<({
        messages: {
            id: string;
            createdAt: Date;
            sender: string;
            text: string;
            conversationId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
    }) | null>;
    createMessage(conversationId: string, sender: string, text: string): Promise<{
        id: string;
        createdAt: Date;
        sender: string;
        text: string;
        conversationId: string;
    }>;
    getMessages(conversationId: string): Promise<{
        id: string;
        createdAt: Date;
        sender: string;
        text: string;
        conversationId: string;
    }[]>;
    getFaqs(): Promise<{
        id: string;
        question: string;
        answer: string;
    }[]>;
}
//# sourceMappingURL=conversation.repository.d.ts.map