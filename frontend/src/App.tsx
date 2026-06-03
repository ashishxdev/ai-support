import { useState, useEffect, useRef, useCallback } from "react";
import ChatInput from "./components/ChatInput";
import ChatMessage from "./components/ChatMessage";
import TypingIndicator from "./components/TypingIndicator";
import api from "./services/chatApi";
import type { Message, ChatResponse } from "./types/chat";

// ── Storage keys ──────────────────────────────────────────
const ACTIVE_SESSION_KEY = "spur_active_session";
const ALL_SESSIONS_KEY = "spur_sessions"; // [{id, preview, createdAt}]

interface SessionMeta {
  id: string;
  preview: string;   // first user message (truncated)
  createdAt: number; // timestamp ms
}

function loadSessions(): SessionMeta[] {
  try {
    return JSON.parse(localStorage.getItem(ALL_SESSIONS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: SessionMeta[]) {
  localStorage.setItem(ALL_SESSIONS_KEY, JSON.stringify(sessions));
}

// ── Static data ───────────────────────────────────────────
const SUGGESTED = [
  "What's your refund policy?",
  "How do I cancel my subscription?",
  "How do I contact support?",
  "What happens to my AI credits?",
];

// ── Sub-components ────────────────────────────────────────
function SpurLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const sz = size === "sm" ? "w-6 h-6 rounded-md" : "w-8 h-8 rounded-lg";
  const icon = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  return (
    <div className={`${sz} bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-900/40`}>
      <svg className={`${icon} text-white`} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
      </svg>
    </div>
  );
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(
    () => localStorage.getItem(ACTIVE_SESSION_KEY)
  );
  const [sessions, setSessions] = useState<SessionMeta[]>(loadSessions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, loading, scrollToBottom]);

  // Load messages whenever the active session changes
  useEffect(() => {
    if (!activeSession) {
      setMessages([]);
      return;
    }
    setHistoryLoading(true);
    api.get(`/chat/${activeSession}`)
      .then((res) => {
        const history: Message[] = res.data.map((m: { sender: string; text: string }) => ({
          sender: m.sender as "user" | "ai",
          text: m.text,
        }));
        setMessages(history);
      })
      .catch(() => {
        // Session gone from server — remove it
        removeSession(activeSession);
        setActiveSession(null);
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      })
      .finally(() => setHistoryLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSession]);

  // ── Session helpers ──
  const removeSession = (id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveSessions(next);
      return next;
    });
  };

  const upsertSession = (id: string, preview: string) => {
    setSessions((prev) => {
      const exists = prev.find((s) => s.id === id);
      let next: SessionMeta[];
      if (exists) {
        next = prev; // don't update — keep original preview & timestamp
      } else {
        next = [{ id, preview: preview.slice(0, 60), createdAt: Date.now() }, ...prev];
      }
      saveSessions(next);
      return next;
    });
  };

  // ── Handlers ──
  const handleSend = async (text: string) => {
    setError(null);
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setLoading(true);
    try {
      const res = await api.post<ChatResponse>("/chat/message", {
        message: text,
        sessionId: activeSession,
      });
      setMessages((prev) => [...prev, { sender: "ai", text: res.data.reply }]);

      const newId = res.data.sessionId;
      setActiveSession(newId);
      localStorage.setItem(ACTIVE_SESSION_KEY, newId);
      upsertSession(newId, text); // use first user message as preview
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e?.response?.data?.error ?? "Something went wrong. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveSession(null);
    localStorage.removeItem(ACTIVE_SESSION_KEY);
    setMessages([]);
    setError(null);
    setSidebarOpen(false);
  };

  const handleSelectSession = (id: string) => {
    if (id === activeSession) { setSidebarOpen(false); return; }
    setActiveSession(id);
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
    setError(null);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeSession(id);
    if (id === activeSession) {
      const remaining = sessions.filter((s) => s.id !== id);
      const next = remaining[0] ?? null;
      setActiveSession(next?.id ?? null);
      if (next) {
        localStorage.setItem(ACTIVE_SESSION_KEY, next.id);
      } else {
        localStorage.removeItem(ACTIVE_SESSION_KEY);
      }
    }
  };

  const isEmpty = !historyLoading && messages.length === 0;

  // ── Sidebar content (shared between desktop + mobile) ──
  const SidebarContent = () => (
    <>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.05]">
        <SpurLogo />
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Spur Support</p>
          <p className="text-[11px] text-slate-500">AI-powered helpdesk</p>
        </div>
      </div>

      {/* New chat */}
      <div className="px-3 py-3">
        <button
          onClick={handleNewChat}
          id="new-chat-button"
          className="w-full flex items-center justify-center gap-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] hover:border-white/[0.14] rounded-lg py-2 transition-all"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New conversation
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sessions.length === 0 ? (
          <p className="text-[11px] text-slate-600 text-center mt-6">No conversations yet</p>
        ) : (
          <div className="space-y-0.5">
            <p className="text-[10px] font-medium text-slate-600 uppercase tracking-wider px-1 mb-2">Recent</p>
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelectSession(s.id)}
                className={`group w-full flex items-start gap-2 px-3 py-2.5 rounded-lg text-left transition-all ${
                  s.id === activeSession
                    ? "bg-indigo-600/20 border border-indigo-500/30 text-white"
                    : "hover:bg-white/[0.04] text-slate-400 hover:text-slate-200 border border-transparent"
                }`}
              >
                <SpurLogo size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium truncate leading-snug">
                    {s.preview || "New conversation"}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">{timeAgo(s.createdAt)}</p>
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-red-900/20 transition-all mt-0.5"
                  title="Delete conversation"
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/[0.05]">
        <p className="text-[10px] text-slate-600">Support</p>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0d0f17] overflow-hidden">

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar (desktop always visible, mobile as drawer) ── */}
      <aside className={`
        fixed md:relative z-30 inset-y-0 left-0
        flex flex-col w-64 flex-shrink-0
        bg-[#0a0b12] border-r border-white/[0.05]
        transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <SidebarContent />
      </aside>

      {/* ── Main Chat ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-[#0d0f17]">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <p className="text-sm font-semibold text-white">Spur AI</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 online block" />
                <span className="text-[11px] text-emerald-400">Online · Replies instantly</span>
              </div>
            </div>
          </div>

          {/* Mobile new chat shortcut */}
          <button
            onClick={handleNewChat}
            className="md:hidden flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.07] px-3 py-1.5 rounded-lg transition-all"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New
          </button>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="max-w-2xl mx-auto">

            {/* Skeleton */}
            {historyLoading && (
              <div className="space-y-5 animate-pulse">
                {[false, true, false, true].map((flip, i) => (
                  <div key={i} className={`flex gap-2.5 ${flip ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-white/[0.06] flex-shrink-0" />
                    <div className={`h-9 rounded-2xl bg-white/[0.05] ${flip ? "w-36" : "w-56"}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center text-center pt-16 pb-10">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center mb-5 shadow-xl shadow-indigo-900/40">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-white mb-1.5">Hi, I'm Spur AI 👋</h2>
                <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-8">
                  Ask me about refunds, billing, subscriptions, or anything else — I'm here to help.
                </p>
                <div className="flex flex-col gap-2 w-full max-w-sm">
                  {SUGGESTED.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      disabled={loading}
                      className="flex items-center justify-between gap-2 text-left text-sm text-slate-300 bg-[#1c1e2e] hover:bg-[#21243a] border border-white/[0.06] hover:border-indigo-500/30 px-4 py-3 rounded-xl transition-all group"
                    >
                      <span>{s}</span>
                      <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 flex-shrink-0 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {!historyLoading && messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}

            {loading && <TypingIndicator />}

            {/* Error */}
            {error && (
              <div className="msg-in flex items-start gap-2.5 bg-red-950/30 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm text-red-300">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="flex-1">{error}</span>
                <button onClick={() => setError(null)} className="text-red-400/70 hover:text-red-300 flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </main>

        {/* Input */}
        <div className="flex-shrink-0">
          <ChatInput onSend={handleSend} disabled={loading || historyLoading} />
        </div>
      </div>
    </div>
  );
}
