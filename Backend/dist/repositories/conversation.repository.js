import { prisma } from "../lib/prisma.js";
export class ConversationRepository {
    async createConversation() {
        return prisma.conversation.create({
            data: {},
        });
    }
    async getConversation(id) {
        return prisma.conversation.findUnique({
            where: { id },
            include: {
                messages: true,
            },
        });
    }
    async createMessage(conversationId, sender, text) {
        return prisma.message.create({
            data: {
                conversationId,
                sender,
                text,
            },
        });
    }
    async getMessages(conversationId) {
        return prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
    }
    async getFaqs() {
        return prisma.fAQ.findMany();
    }
}
//# sourceMappingURL=conversation.repository.js.map