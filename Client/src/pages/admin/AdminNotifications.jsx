import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Filter,
  IndianRupee,
  MessageSquare,
  Receipt,
  RotateCcw,
  RotateCw,
  Search,
  ShoppingBag,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { api } from "../../lib/api.js";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1";

function formatIST(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

function timeAgo(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff) || diff < 0) return "Just now";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(value).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
  });
}

function getTypeMeta(type) {
  switch (type) {
    case "new_order":
      return {
        label: "Order",
        icon: ShoppingBag,
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      };
    case "enquiry":
      return {
        label: "Enquiry",
        icon: MessageSquare,
        badgeBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      };
    case "payment_request":
      return {
        label: "Manual Payment",
        icon: IndianRupee,
        badgeBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
      };
    case "payment_failed":
    case "admin_alert":
      return {
        label: "Alert",
        icon: AlertTriangle,
        badgeBg: "bg-danger-500/10 text-danger-600 dark:text-danger-400 border-danger-500/20",
        iconBg: "bg-danger-500/15 text-danger-600 dark:text-danger-400",
      };
    case "access_changed":
      return {
        label: "Account",
        icon: UserCheck,
        badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
      };
    default:
      return {
        label: "System",
        icon: Bell,
        badgeBg: "bg-gold-400/10 text-ink-950 dark:text-gold-300 border-gold-400/20",
        iconBg: "bg-gold-400/20 text-ink-950 dark:text-gold-300",
      };
  }
}

export default function AdminNotifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'unread' | 'read'
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [actionBusy, setActionBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const showToast = (text, isError = false) => {
    setMsg({ text, isError });
    setTimeout(() => setMsg(null), 3500);
  };

  const fetchNotifications = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "15",
          paginated: "true",
        });
        if (statusFilter !== "all") query.set("status", statusFilter);
        if (typeFilter !== "all") query.set("type", typeFilter);
        if (search.trim()) query.set("search", search.trim());

        const res = await api(`/admin/notifications?${query.toString()}`);
        const data = res.data;

        if (data && data.items) {
          setItems(data.items);
          setTotalItems(data.total || 0);
          setUnreadCount(data.unreadCount ?? 0);
          setTotalPages(Math.max(1, Math.ceil((data.total || 0) / (data.limit || 15))));
        } else if (Array.isArray(data)) {
          setItems(data);
          setTotalItems(data.length);
          setTotalPages(1);
        }
      } catch (err) {
        showToast(err.message || "Failed to load notifications", true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, statusFilter, typeFilter, search]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const notifyGlobalUpdate = () => {
    window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
  };

  // Mark single as read / unread
  const toggleReadStatus = async (item, e) => {
    e?.stopPropagation();
    try {
      if (item.readAt) {
        await api(`/admin/notifications/${item._id}/unread`, { method: "PATCH" });
        setItems((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, readAt: null } : n))
        );
        setUnreadCount((c) => c + 1);
        showToast("Marked as unread");
      } else {
        await api(`/admin/notifications/${item._id}/read`, { method: "PATCH" });
        setItems((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
        showToast("Marked as read");
      }
      notifyGlobalUpdate();
    } catch (err) {
      showToast(err.message || "Failed to update notification", true);
    }
  };

  // Delete single notification
  const deleteSingle = async (id, e) => {
    e?.stopPropagation();
    try {
      await api(`/admin/notifications/${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((n) => n._id !== id));
      setTotalItems((t) => Math.max(0, t - 1));
      showToast("Notification deleted");
      notifyGlobalUpdate();
    } catch (err) {
      showToast(err.message || "Failed to delete notification", true);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || actionBusy) return;
    setActionBusy(true);
    try {
      await api("/admin/notifications/read-all", { method: "PATCH" });
      setItems((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
      showToast("All notifications marked as read");
      notifyGlobalUpdate();
    } catch (err) {
      showToast(err.message || "Failed to mark all as read", true);
    } finally {
      setActionBusy(false);
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    if (!window.confirm("Are you sure you want to delete all read notifications?")) return;
    setActionBusy(true);
    try {
      await api("/admin/notifications/clear-read", { method: "DELETE" });
      fetchNotifications(true);
      showToast("Read notifications cleared");
      notifyGlobalUpdate();
    } catch (err) {
      showToast(err.message || "Failed to clear read notifications", true);
    } finally {
      setActionBusy(false);
    }
  };

  // Batch toggle selected
  const toggleSelect = (id, e) => {
    e?.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllCurrent = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i._id)));
    }
  };

  const handleBulkMarkRead = async () => {
    if (selectedIds.size === 0) return;
    setActionBusy(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          api(`/admin/notifications/${id}/read`, { method: "PATCH" })
        )
      );
      setItems((prev) =>
        prev.map((n) =>
          selectedIds.has(n._id) ? { ...n, readAt: n.readAt || new Date().toISOString() } : n
        )
      );
      setSelectedIds(new Set());
      showToast(`Marked ${selectedIds.size} as read`);
      notifyGlobalUpdate();
    } catch (err) {
      showToast("Error updating selected notifications", true);
    } finally {
      setActionBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected notifications?`)) return;
    setActionBusy(true);
    try {
      await Promise.all(
        Array.from(selectedIds).map((id) =>
          api(`/admin/notifications/${id}`, { method: "DELETE" })
        )
      );
      setItems((prev) => prev.filter((n) => !selectedIds.has(n._id)));
      setSelectedIds(new Set());
      showToast("Selected notifications deleted");
      notifyGlobalUpdate();
    } catch (err) {
      showToast("Error deleting selected notifications", true);
    } finally {
      setActionBusy(false);
    }
  };

  const handleCardClick = (item) => {
    if (!item.readAt) {
      api(`/admin/notifications/${item._id}/read`, { method: "PATCH" }).catch(() => {});
      setItems((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      notifyGlobalUpdate();
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {msg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2 ${
            msg.isError
              ? "border-danger-500/30 bg-danger-500 text-white"
              : "border-line-strong bg-surface text-fg shadow-surface"
          }`}
        >
          {msg.isError ? (
            <AlertCircle className="h-4 w-4 shrink-0 text-white" />
          ) : (
            <CheckCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-fg sm:text-2xl">Notifications</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-danger-500 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-fg-3 sm:text-sm">
            Live updates on student orders, enquiries, payments, and system events.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchNotifications(true)}
            disabled={loading || refreshing}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-medium text-fg transition hover:bg-surface-2 ${focusRing} disabled:opacity-50`}
            title="Refresh notifications"
          >
            <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || actionBusy}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-medium text-fg transition hover:bg-surface-2 ${focusRing} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <CheckCheck className="h-3.5 w-3.5 text-pitch-700 dark:text-gold-400" />
            <span>Mark all read</span>
          </button>

          <button
            type="button"
            onClick={handleClearRead}
            disabled={actionBusy || items.length === 0}
            className={`inline-flex items-center gap-1.5 rounded-lg border border-line-strong bg-surface px-3 py-2 text-xs font-medium text-danger-500 transition hover:bg-danger-500/10 ${focusRing} disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear read</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "unread", label: "Unread", badge: unreadCount },
            { id: "read", label: "Read" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                statusFilter === tab.id
                  ? "bg-gold-400 font-bold text-ink-950 shadow-xs"
                  : "text-fg-3 hover:bg-surface-2 hover:text-fg"
              } ${focusRing}`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    statusFilter === tab.id
                      ? "bg-ink-950 text-gold-400"
                      : "bg-danger-500 text-white"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}

          {/* Type Filter dropdown */}
          <div className="ml-2 flex items-center gap-1 border-l border-line pl-3">
            <Filter className="h-3.5 w-3.5 text-fg-3" />
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by notification type"
              className={`rounded-lg border-0 bg-transparent py-1 pl-1 pr-7 text-xs font-medium text-fg outline-none focus:ring-1 focus:ring-gold-400`}
            >
              <option value="all">All Types</option>
              <option value="new_order">Orders</option>
              <option value="enquiry">Enquiries</option>
              <option value="payment_request">Manual Payments</option>
              <option value="payment_failed">Payment Alerts</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-fg-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search notifications..."
            className={`w-full rounded-lg border border-line-strong bg-surface py-1.5 pl-8 pr-8 text-xs text-fg placeholder:text-fg-3 focus:border-gold-400 ${focusRing}`}
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-fg-3 hover:text-fg"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk action toolbar when items selected */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-gold-400/40 bg-gold-400/10 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 font-semibold text-fg">
            <span>{selectedIds.size} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBulkMarkRead}
              className={`inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 font-medium text-fg shadow-xs hover:bg-surface-2 ${focusRing}`}
            >
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              <span>Mark Read</span>
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              className={`inline-flex items-center gap-1 rounded-lg bg-surface px-2.5 py-1 font-medium text-danger-500 shadow-xs hover:bg-danger-500/10 ${focusRing}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-fg-3 hover:text-fg ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Notification List */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 animate-pulse"
              >
                <div className="h-10 w-10 rounded-xl bg-surface-2" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-surface-2" />
                  <div className="h-3 w-1/2 rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-fg-3">
              <BellOff className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-fg">No notifications found</h3>
            <p className="mt-1 max-w-sm text-xs text-fg-3">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "No notifications match your current filter criteria. Try resetting filters."
                : "All caught up! New orders, enquiry requests, and system alerts will appear here."}
            </p>
            {(search || statusFilter !== "all" || typeFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setTypeFilter("all");
                  setSearch("");
                  setPage(1);
                }}
                className={`mt-4 inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold text-fg hover:bg-line ${focusRing}`}
              >
                <RotateCcw className="h-3 w-3" />
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
            {/* Select all header */}
            <div className="flex items-center justify-between border-b border-line bg-surface-2/40 px-4 py-2 text-xs text-fg-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={items.length > 0 && selectedIds.size === items.length}
                  onChange={selectAllCurrent}
                  className="rounded border-line-strong text-gold-400 focus:ring-gold-400"
                />
                <span className="font-medium">Select all on this page</span>
              </label>
              <span>{totalItems} total</span>
            </div>

            {items.map((item) => {
              const meta = getTypeMeta(item.type);
              const Icon = meta.icon;
              const isUnread = !item.readAt;
              const isSelected = selectedIds.has(item._id);

              return (
                <div
                  key={item._id}
                  onClick={() => handleCardClick(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleCardClick(item)}
                  className={`group relative flex items-start gap-3.5 p-4 text-left transition hover:bg-surface-2/80 cursor-pointer ${
                    isUnread
                      ? "bg-gold-400/[0.04] dark:bg-gold-400/[0.02]"
                      : "opacity-90 hover:opacity-100"
                  } ${isSelected ? "bg-gold-400/10" : ""}`}
                >
                  {/* Left accent bar for unread */}
                  {isUnread && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1 bg-gold-400"
                    />
                  )}

                  {/* Selection checkbox */}
                  <div
                    className="pt-1"
                    onClick={(e) => toggleSelect(item._id, e)}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-line-strong text-gold-400 focus:ring-gold-400"
                    />
                  </div>

                  {/* Category icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${meta.iconBg}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Body text & meta */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeBg}`}
                      >
                        {meta.label}
                      </span>
                      {isUnread && (
                        <span className="flex h-2 w-2 rounded-full bg-danger-500 ring-2 ring-surface" />
                      )}
                      <span
                        className="text-[11px] text-fg-3"
                        title={formatIST(item.createdAt)}
                      >
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>

                    <h4
                      className={`text-sm tracking-tight ${
                        isUnread ? "font-bold text-fg" : "font-medium text-fg-2"
                      }`}
                    >
                      {item.title}
                    </h4>

                    {item.body && (
                      <p className="mt-0.5 text-xs leading-relaxed text-fg-3 line-clamp-2">
                        {item.body}
                      </p>
                    )}

                    {item.link && (
                      <div className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-pitch-700 dark:text-gold-400 group-hover:underline">
                        <span>Go to {item.link.replace("/admin/", "")}</span>
                        <ArrowRight className="h-3 w-3" />
                      </div>
                    )}
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex shrink-0 items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => toggleReadStatus(item, e)}
                      title={isUnread ? "Mark as read" : "Mark as unread"}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-fg-3 transition hover:border-line hover:bg-surface hover:text-fg ${focusRing}`}
                    >
                      {isUnread ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => deleteSingle(item._id, e)}
                      title="Delete notification"
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-fg-3 transition hover:border-danger-500/30 hover:bg-danger-500/10 hover:text-danger-500 ${focusRing}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-line pt-4 text-xs">
          <p className="text-fg-3">
            Showing Page <span className="font-semibold text-fg">{page}</span> of{" "}
            <span className="font-semibold text-fg">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={`rounded-lg border border-line-strong bg-surface px-3 py-1.5 font-medium text-fg transition hover:bg-surface-2 ${focusRing} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={`rounded-lg border border-line-strong bg-surface px-3 py-1.5 font-medium text-fg transition hover:bg-surface-2 ${focusRing} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

