import "dotenv/config";
export interface HistoryTurn {
    sender: "user" | "ai";
    text: string;
}
export declare class LlmError extends Error {
    readonly status: number;
    constructor(status: number, message: string);
}
export declare function generateReply(faqText: string, historyTurns: HistoryTurn[], userMessage: string): Promise<string | undefined>;
//# sourceMappingURL=llm.service.d.ts.map