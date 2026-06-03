import { Router } from "express";
import { sendMessage } from "../controllers/chat.controller.js";
import { getHistory } from "../controllers/history.controller.js";
const router = Router();
router.post("/message", sendMessage);
router.get("/:sessionId", getHistory);
export default router;
//# sourceMappingURL=chat.routes.js.map