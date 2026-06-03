import { z } from "zod";
export const chatSchema = z.object({
    message: z
        .string()
        .min(1, "Message cannot be empty")
        .max(1000, "Message is too long"),
    sessionId: z.string().nullish().transform((v) => v ?? undefined),
});
//# sourceMappingURL=chat.schema.js.map