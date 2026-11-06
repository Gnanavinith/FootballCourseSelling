import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  RefreshCcw,
  Search,
  Clock,
  Sparkles,
  Inbox,
  Filter,
} from "lucide-react";
import { api } from "../lib/api.js";
import { usePageMeta } from "../hooks/usePageMeta.js";

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function NotificationsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" aria-hidden="true">
      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-full bg-surface-2" />
          <div className="h-9 w-28 rounded-full bg-surface-2" />
          <div className="h-9 w-20 rounded-full bg-surface-2" />
        </div>
        <div className="h-10 w-full sm:w-64 rounded-2xl bg-surface-2" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-line bg-surface p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4"
          >
            <div className="w-10 h-10 rounded-2xl bg-surface-2 shrink-0" />
            <div className="flex-1 space-y-2.5">
              <div className="flex items-center justify-between gap-4">
                <div className="h-4 w-48 sm:w-64 rounded bg-surface-2" />
                <div className="h-3 w-16 rounded bg-surface-2/70" />
              </div>
              <div className="h-3 w-full max-w-lg rounded bg-surface-2/80" />
              <div className="h-3 w-3/4 max-w-sm rounded bg-surface-2/60" />
              <div className="h-6 w-24 rounded-lg bg-surface-2/70 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Notifications() {
  usePageMeta({ title: "Notifications | Vanakkam Soccer", noindex: true });

  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "unread" | "read"
  const [query, setQuery] = useState("");

  const loadNotifications = (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    Promise.all([
      api("/me/notifications").then((r) => r.data || []),
      api("/me/notifications/unread-count").then((r) => r.data?.count || 0),
    ])
      .then(([notifications, count]) => {
        setItems(notifications);
        setUnreadCount(count);
      })
      .catch((e) => setError(e.message || "Could not load notifications"))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api("/me/notifications/" + id + "/read", { method: "PATCH" });
      setItems((list) =>
        list.map((i) => (i._id === id ? { ...i, readAt: new Date().toISOString() } : i))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      window.dispatchEvent(new CustomEvent("athlete-notifications-updated"));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await api("/me/notifications/read-all", { method: "PATCH" });
      setItems((list) => list.map((i) => ({ ...i, readAt: new Date().toISOString() })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("athlete-notifications-updated"));
    } catch {
      // silent
    }
  };

  const handleCardClick = (n) => {
    if (!n.readAt) {
      markRead(n._id);
    }
    if (n.link) {
      if (n.link.startsWith("http://") || n.link.startsWith("https://")) {
        window.open(n.link, "_blank", "noopener,noreferrer");
      } else {
        navigate(n.link);
      }
    }
  };

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((n) => {
      const isRead = !!n.readAt;
      if (filter === "unread" && isRead) return false;
      if (filter === "read" && !isRead) return false;
      if (!q) return true;
      return (
        (n.title || "").toLowerCase().includes(q) ||
        (n.body || "").toLowerCase().includes(q)
      );
    });
  }, [items, filter, query]);

  const readCount = Math.max(0, items.length - unreadCount);

  const FILTERS = [
    { key: "all", label: "All Updates", count: items.length },
    { key: "unread", label: "Unread", count: unreadCount },
    { key: "read", label: "Read", count: readCount },
  ];

  return (
    <div className="min-h-screen bg-page text-fg-body font-sans flex flex-col transition-colors duration-300">
      {/* Header section with theme styling */}
      <section className="relative overflow-hidden bg-surface py-10 sm:py-14 border-b border-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-2 hover:text-fg bg-surface-2 hover:bg-surface px-3 py-1.5 rounded-xl border border-line transition no-underline"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Academy Hub</span>
                </Link>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider">
                  <Bell className="h-3.5 w-3.5" />
                  <span>Athlete Inbox</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 bg-gold-500/15 border border-gold-500/30 text-gold-600 dark:text-gold-400 text-xs font-extrabold rounded-full animate-pulse">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fg">
                Your <span className="text-gold-600 dark:text-gold-400">Notifications</span>
              </h1>
              <p className="mt-3 max-w-xl text-sm sm:text-base text-fg-3 leading-relaxed">
                Stay updated with new weekly training drills, academy progress milestones, and verified payment receipts.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => loadNotifications(true)}
                disabled={loading || refreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-fg-2 hover:text-fg bg-surface-2 hover:bg-surface border border-line rounded-xl transition disabled:opacity-50"
                title="Refresh notifications"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-ink-950 text-xs font-extrabold rounded-xl shadow-sm transition"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Notification Feed */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 flex-1">
        {loading ? (
          <NotificationsSkeleton />
        ) : error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center max-w-md mx-auto shadow-sm">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h2 className="text-base font-bold text-fg mb-1">Could not load notifications</h2>
            <p className="text-xs text-fg-3 mb-5 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={() => loadNotifications()}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-surface hover:bg-surface-2 text-fg border border-line rounded-xl transition"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Try again</span>
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-line bg-surface p-10 sm:p-14 text-center max-w-md mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gold-400/10 border border-gold-400/20 text-gold-500 dark:text-gold-400 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-fg mb-1">No Notifications Yet</h2>
            <p className="text-xs text-fg-3 leading-relaxed mb-6">
              When weekly modules are published or payments are confirmed, they will show up here.
            </p>
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-ink-950 font-bold text-xs shadow-sm transition no-underline"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Browse Masterclasses</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-line w-fit">
                {FILTERS.map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                        active
                          ? "bg-gold-500 text-ink-950 shadow-xs"
                          : "text-fg-3 hover:text-fg hover:bg-surface-2"
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          active ? "bg-black/20 text-ink-950" : "bg-surface-2 text-fg-3"
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-fg-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search updates..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-2xl border border-line bg-surface text-fg placeholder:text-fg-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
              </div>
            </div>

            {/* Notification Items List */}
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface p-8 text-center">
                <p className="text-xs text-fg-3">
                  No notifications match your current filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                  className="mt-3 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((n) => {
                  const isRead = !!n.readAt;
                  return (
                    <div
                      key={n._id}
                      onClick={() => handleCardClick(n)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardClick(n);
                        }
                      }}
                      className={`group relative rounded-2xl border p-4 sm:p-5 transition-all cursor-pointer shadow-xs hover:shadow-md flex items-start gap-3.5 sm:gap-4 ${
                        isRead
                          ? "bg-surface/70 border-line opacity-80 hover:opacity-100 hover:bg-surface"
                          : "bg-surface border-gold-500/30 hover:border-gold-500/60 ring-1 ring-gold-500/10 shadow-sm"
                      }`}
                    >
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 border transition ${
                          isRead
                            ? "bg-surface-2 text-fg-3 border-line"
                            : "bg-gold-500/10 text-gold-600 dark:text-gold-400 border-gold-500/25"
                        }`}
                      >
                        {isRead ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3
                            className={`text-sm sm:text-base font-bold truncate transition-colors ${
                              isRead
                                ? "text-fg-2 group-hover:text-fg"
                                : "text-fg font-black group-hover:text-gold-600 dark:group-hover:text-gold-400"
                            }`}
                          >
                            {n.title}
                          </h3>
                          <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-fg-3">
                            <Clock className="w-3 h-3" />
                            <span>{fmtTime(n.createdAt)}</span>
                          </div>
                        </div>

                        {n.body && (
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isRead ? "text-fg-3" : "text-fg-2 font-medium"
                            }`}
                          >
                            {n.body}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between gap-3 pt-1">
                          {n.link ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 group-hover:translate-x-0.5 transition-transform">
                              <span>View Details</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          ) : (
                            <span />
                          )}

                          {!isRead && (
                            <button
                              type="button"
                              onClick={(e) => markRead(n._id, e)}
                              className="text-[11px] font-semibold text-fg-3 hover:text-gold-600 dark:hover:text-gold-400 hover:underline px-2 py-0.5 rounded transition"
                              title="Mark this notification as read"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Unread gold beacon */}
                      {!isRead && (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-gold-500 ring-4 ring-gold-500/20 shrink-0 mt-2 shadow-xs"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
