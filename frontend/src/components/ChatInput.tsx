import { useState, useRef, useEffect } from "react";

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
    if (ref.current) ref.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${Math.min(ref.current.scrollHeight, 112)}px`;
    }
  }, [text]);

  const over = text.length > 950;

  return (
    <div className="px-4 pb-4 pt-3 border-t border-white/[0.06] bg-[#0d0f17]">
      <div
        className={`flex items-end gap-2 bg-[#1c1e2e] rounded-xl border transition-colors ${
          over ? "border-red-500/40" : "border-white/[0.07] focus-within:border-indigo-500/50"
        }`}
      >
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={1000}
          rows={1}
          placeholder="Message Spur AI…"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 resize-none outline-none px-4 py-3 leading-relaxed max-h-28 disabled:opacity-40"
        />

        <div className="flex items-center gap-1.5 pr-2 pb-2">
          {over && (
            <span className="text-[11px] text-red-400">{text.length}/1000</span>
          )}
          <button
            id="send-button"
            onClick={send}
            disabled={disabled || !text.trim() || over}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 active:scale-95 shadow-md shadow-indigo-900/30"
          >
            {disabled ? (
              <svg className="w-3.5 h-3.5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-slate-600 mt-2">
        Enter to send · Shift+Enter for new line · Powered by Gemini
      </p>
    </div>
  );
}
