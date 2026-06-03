import { z } from "zod";
export declare const chatSchema: z.ZodObject<{
    message: z.ZodString;
    sessionId: z.ZodPipe<z.ZodOptional<z.ZodNullable<z.ZodString>>, z.ZodTransform<string | undefined, string | null | undefined>>;
}, z.core.$strip>;
//# sourceMappingURL=chat.schema.d.ts.map