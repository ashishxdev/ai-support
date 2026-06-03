import { ConversationRepository } from "../repositories/conversation.repository.js";
import { generateReply } from "./llm.service.js";
const repository = new ConversationRepository();
export async function getConversationHistory(sessionId) {
    const conversation = await repository.getConversation(sessionId);
    if (!conversation) {
        throw new Error("Conversation not found");
    }
    return conversation.messages;
}
export async function processMessage(message, sessionId) {
    let conversation;
    if (sessionId) {
        conversation = await repository.getConversation(sessionId);
        if (!conversation) {
            throw new Error("Conversation not found");
        }
    }
    else {
        conversation = await repository.createConversation();
    }
    await repository.createMessage(conversation.id, "user", message);
    // Fetch all messages, then exclude the last one (the user message we just saved)
    // so it isn't duplicated — it's passed separately as `userMessage`
    const allMessages = await repository.getMessages(conversation.id);
    const historyTurns = allMessages
        .slice(0, -1)
        .map((msg) => ({
        sender: msg.sender,
        text: msg.text,
    }));
    const faqs = await repository.getFaqs();
    const faqText = faqs
        .map((faq) => `${faq.question}: ${faq.answer}`)
        .join("\n");
    const reply = await generateReply(faqText, historyTurns, message);
    await repository.createMessage(conversation.id, "ai", reply || "");
    return {
        sessionId: conversation.id,
        reply,
    };
}
//# sourceMappingURL=chat.service.js.map