import { getConversationHistory } from "../services/chat.service.js";
export async function getHistory(req, res) {
    try {
        const sessionId = req.params.sessionId;
        if (!sessionId) {
            return res.status(400).json({
                error: "Session ID is required",
            });
        }
        const messages = await getConversationHistory(sessionId);
        res.json(messages);
    }
    catch (error) {
        res.status(404).json({
            error: "Conversation not found",
        });
    }
}
//# sourceMappingURL=history.controller.js.map