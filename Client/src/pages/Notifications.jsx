import { useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { Bell, CheckCheck, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function fmtTime(iso) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api("/me/notifications").then((r) => r.data || []),
      api("/me/notifications/unread-count").then((r) => r.data.count || 0),
    ])
      .then(([notifications, count]) => {
        if (cancelled) return;
        setItems(notifications);
        setUnreadCount(count);
      })
      .catch((e) => setError(e.message || "Could not load notifications"))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const markRead = async (id) => {
    try {
      await api("/me/notifications/" + id + "/read", { method: "PATCH" });
      setItems((list) => list.map((i) => (i._id === id ? { ...i, readAt: new Date() } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await api("/me/notifications/read-all", { method: "PATCH" });
      setItems((list) => list.map((i) => ({ ...i, readAt: new Date() })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-pitch-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-ink-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-ink-200 rounded-2xl p-6 text-center shadow-md">
          <AlertCircle className="w-10 h-10 text-danger-600 mx-auto mb-3" />
          <h2 className="text-base font-bold text-ink-950 mb-1">Error</h2>
          <p className="text-xs text-ink-600 mb-5">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 font-sans flex flex-col">
      {/* Top Banner Header */}
      <section className="section-dark hero-bg always-dark py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-gold-400/20 text-gold-300 border border-gold-400/30 text-[11px] font-bold uppercase rounded-full">
                Inbox
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-danger-600 text-white text-[11px] font-bold rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">Your Notifications</h1>
          </div>
          <div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition border border-white/15"
              >
                <CheckCheck className="w-4 h-4 text-gold-400" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content List */}
      <main className="max-w-4xl w-full mx-auto px-6 py-8 flex-1">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-ink-200 p-12 text-center shadow-sm max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-pitch-50 text-pitch-700 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-ink-950 mb-1">No Notifications Yet</h2>
            <p className="text-xs text-ink-600">You'll receive updates regarding your course access, weekly modules, and payments here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => {
              const isRead = !!n.readAt;
              return (
                <div
                  key={n._id}
                  onClick={() => {
                    if (!isRead) markRead(n._id);
                    if (n.link) window.location.href = n.link;
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (n.link) window.location.href = n.link;
                      else markRead(n._id);
                    }
                  }}
                  className={`group bg-white rounded-2xl border p-4 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-start gap-3.5 ${
                    isRead ? "border-ink-200 opacity-75" : "border-pitch-400 shadow-sm"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isRead ? "bg-ink-100 text-ink-500" : "bg-pitch-50 text-pitch-700"
                  }`}>
                    {isRead ? <CheckCircle2 className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className={`text-sm font-bold truncate ${isRead ? "text-ink-700" : "text-ink-950 font-extrabold"}`}>
                        {n.title}
                      </h3>
                      <span className="text-[11px] text-ink-400 shrink-0 font-medium">{fmtTime(n.createdAt)}</span>
                    </div>
                    {n.body && <p className={`text-xs leading-relaxed ${isRead ? "text-ink-500" : "text-ink-800"}`}>{n.body}</p>}
                    {n.link && (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-pitch-700 group-hover:underline">
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {!isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-pitch-600 shrink-0 mt-2 shadow-xs" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
