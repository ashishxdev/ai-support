import type { Message } from "../types/chat";

interface Props {
  message: Message;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.sender === "user";

  return (
    <div className={`msg-in flex gap-2.5 mb-5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center mt-0.5 shadow-md shadow-indigo-900/40">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[78%] sm:max-w-[68%]`}>
        {!isUser && (
          <p className="text-[11px] font-medium text-indigo-400 mb-1 ml-0.5">Spur AI</p>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? "bg-indigo-600 text-white rounded-br-sm"
              : "bg-[#1c1e2e] text-slate-200 border border-white/5 rounded-bl-sm"
          }`}
        >
          {message.text}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center mt-0.5">
          <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        </div>
      )}
    </div>
  );
}
