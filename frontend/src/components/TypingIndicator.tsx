export default function TypingIndicator() {
  return (
    <div className="msg-in flex gap-2.5 mb-5">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center mt-0.5 shadow-md shadow-indigo-900/40">
        <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-medium text-indigo-400 mb-1 ml-0.5">Spur AI</p>
        <div className="bg-[#1c1e2e] border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
          <span className="dot1 w-1.5 h-1.5 rounded-full bg-slate-400 block" />
          <span className="dot2 w-1.5 h-1.5 rounded-full bg-slate-400 block" />
          <span className="dot3 w-1.5 h-1.5 rounded-full bg-slate-400 block" />
        </div>
      </div>
    </div>
  );
}
