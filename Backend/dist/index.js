import express from "express";
import cors from "cors";
import "dotenv/config";
import { generateReply } from "./services/llm.service.js";
import chatRoutes from "./routes/chat.routes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/chat", chatRoutes);
app.get("/", (_, res) => {
    res.send("Backend Running");
});
app.get("/test-ai", async (_, res) => {
    try {
        const reply = await generateReply("", [], "Say hello");
        res.send(reply);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("AI Error");
    }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map