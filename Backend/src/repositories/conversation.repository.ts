import { prisma } from "../lib/prisma.js";

export class ConversationRepository {
  async createConversation() {
    return prisma.conversation.create({
      data: {},
    });
  }

  async getConversation(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: true,
      },
    });
  }

  async createMessage(conversationId: string, sender: string, text: string) {
    return prisma.message.create({
      data: {
        conversationId,
        sender,
        text,
      },
    });
  }

  async getMessages(conversationId: string) {
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
