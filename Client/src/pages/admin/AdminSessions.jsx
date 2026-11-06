import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Download,
  ExternalLink,
  Mail,
  MessageSquare,
  Phone,
  RefreshCcw,
  Search,
  Send,
  User,
  Video,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Link as LinkIcon,
  Copy,
  Check,
  Edit3,
  CalendarCheck,
  ShieldCheck,
  X,
  IndianRupee,
} from "lucide-react";
import { api } from "../../lib/api.js";

const IST = "Asia/Kolkata";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const dayKey = (t) => (t ? new Date(t).toLocaleDateString("en-CA", { timeZone: IST }) : "");
const fmtDate = (t) =>
  t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST }) : "–";

const STATUS_PILL = {
  Scheduled: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Cancelled: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

const PAYMENT_PILL = {
  Paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  Created: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  Failed: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  Refunded: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
};

const fieldClass =
  "w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-xs sm:text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-400 px-4 py-2 text-xs sm:text-sm font-bold text-ink-950 transition hover:bg-gold-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50 cursor-pointer";
const btnGhost =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg-2 hover:text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:opacity-50 cursor-pointer";

function csvCell(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function exportCsv(list) {
  const head = [
    "Session ID",
    "Player Name",
    "Email",
    "Phone",
    "Service Format",
    "Booked Date",
    "Booked Time",
    "Session Status",
    "Payment Status",
    "Amount (INR)",
    "Payment ID",
    "Meeting Link",
    "Player Message",
    "Coach Notes",
    "Created Date",
  ];

  const lines = list.map((s) => {
    const b = s.bookingDetails || {};
    return [
      s._id,
      b.name || "Unknown",
      b.email || "",
      b.phone || "",
      b.serviceName || s.serviceId || "1-on-1",
      b.date || "",
      b.time || "",
      b.status || "Scheduled",
      s.status || "Created",
      s.amount || 0,
      s.razorpayPaymentId || "",
      b.meetingLink || "",
      b.message || "",
      b.coachNotes || "",
      dayKey(s.createdAt),
    ]
      .map(csvCell)
      .join(",");
  });

  const blob = new Blob(["\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `one-and-one-sessions-${dayKey(Date.now())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Filters
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // Selected session for details modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "Scheduled",
    meetingLink: "",
    coachNotes: "",
    date: "",
    time: "",
  });
  const [saving, setSaving] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const fetchSessions = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query.trim());
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (paymentFilter !== "All") params.append("paymentStatus", paymentFilter);
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await api(`/admin/sessions?${params.toString()}`);
      const data = res.data || {};
      setSessions(data.sessions || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err.message || "Failed to load 1-on-1 sessions");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [statusFilter, paymentFilter, from, to]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSessions(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const openSessionDetail = (s) => {
    setSelectedSession(s);
    const b = s.bookingDetails || {};
    setEditForm({
      status: b.status || "Scheduled",
      meetingLink: b.meetingLink || "",
      coachNotes: b.coachNotes || "",
      date: b.date || "",
      time: b.time || "",
    });
    setCopiedLink(false);
  };

  const handleSaveSession = async () => {
    if (!selectedSession) return;
    setSaving(true);
    try {
      const res = await api(`/admin/sessions/${selectedSession._id}`, {
        method: "PATCH",
        body: JSON.stringify(editForm),
      });
      const updated = res.data;
      setSessions((list) => list.map((s) => (s._id === updated._id ? updated : s)));
      setSelectedSession(updated);
      showToast("Session details updated successfully.");
    } catch (err) {
      showToast(`Error: ${err.message || "Could not update session"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSendReminder = async () => {
    if (!selectedSession) return;
    setSendingReminder(true);
    try {
      await api(`/admin/sessions/${selectedSession._id}/remind`, {
        method: "POST",
      });
      showToast(`Reminder email sent to ${selectedSession.bookingDetails?.email || "player"}`);
    } catch (err) {
      showToast(`Failed: ${err.message || "Could not send reminder"}`);
    } finally {
      setSendingReminder(false);
    }
  };

  const copyMeetLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setPaymentFilter("All");
    setFrom("");
    setTo("");
  };

  const filtersActive = query || statusFilter !== "All" || paymentFilter !== "All" || from || to;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold-400/25 bg-gold-400/10 px-3 py-1 text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Private Coaching</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-fg tracking-tight">1-on-1 Sessions</h1>
          <p className="text-xs sm:text-sm text-fg-3 mt-1 leading-relaxed max-w-2xl">
            Track private player bookings, review player tactical requirements, assign Google Meet links, and monitor payment verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchSessions(true)}
            disabled={loading || refreshing}
            className={btnGhost}
            title="Refresh session list"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => exportCsv(sessions)}
            disabled={sessions.length === 0}
            className={btnPrimary}
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-fg-3">Total Sessions</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-fg tabular-nums">
            {summary ? summary.totalBookings : "–"}
          </p>
          <p className="mt-1 text-[11px] text-fg-3">All scheduled & completed</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-fg-3">Confirmed Revenue</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-gold-600 dark:text-gold-400 tabular-nums">
            {summary ? inr(summary.totalRevenue) : "–"}
          </p>
          <p className="mt-1 text-[11px] text-fg-3">{summary ? `${summary.paidBookings} paid bookings` : ""}</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-fg-3">Upcoming / Scheduled</p>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
            {summary ? summary.scheduledCount : "–"}
          </p>
          <p className="mt-1 text-[11px] text-fg-3">Awaiting drill session</p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-4 sm:p-5 shadow-xs">
          <p className="text-xs font-medium text-fg-3">Completed Sessions</p>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            {summary ? summary.completedCount : "–"}
          </p>
          <p className="mt-1 text-[11px] text-fg-3">Successfully conducted</p>
        </div>
      </div>

      {/* Main Table Card with Search & Filters */}
      <div className="rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
        {/* Filters strip */}
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_0.9fr_0.9fr]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-fg-3" />
            <input
              type="search"
              placeholder="Search player, email, phone, service..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`${fieldClass} pl-9`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={fieldClass}
            aria-label="Filter by session status"
          >
            <option value="All">All Session Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={fieldClass}
            aria-label="Filter by payment status"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Created">Created (Unpaid)</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={fieldClass}
            aria-label="From date"
            title="From date"
          />

          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={fieldClass}
            aria-label="To date"
            title="To date"
          />
        </div>

        {/* Sessions Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60 text-xs font-semibold text-fg-3 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Athlete / Player</th>
                <th className="px-4 py-3.5">Training Format</th>
                <th className="px-4 py-3.5">Booked Slot</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Session Status</th>
                <th className="px-4 py-3.5">Meeting Link</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-fg-3">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCcw className="w-6 h-6 animate-spin text-gold-400" />
                      <p className="text-xs">Loading 1-on-1 sessions...</p>
                    </div>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="max-w-sm mx-auto">
                      <CalendarCheck className="w-10 h-10 text-fg-3 mx-auto mb-3 opacity-60" />
                      <p className="text-sm font-bold text-fg">
                        {filtersActive ? "No sessions match these filters" : "No 1-on-1 sessions booked yet"}
                      </p>
                      <p className="text-xs text-fg-3 mt-1 leading-relaxed">
                        {filtersActive
                          ? "Try clearing your search terms or date filters."
                          : "When athletes book a 1-on-1 mentorship session on the website, they appear here."}
                      </p>
                      {filtersActive && (
                        <button type="button" onClick={clearFilters} className={`${btnGhost} mt-4`}>
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const b = s.bookingDetails || {};
                  const sStatus = b.status || "Scheduled";
                  const pStatus = s.status || "Created";

                  return (
                    <tr key={s._id} className="transition-colors hover:bg-surface-2/40">
                      {/* Athlete column */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-600 dark:text-gold-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {(b.name || "U")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-fg truncate text-sm">{b.name || "Unknown Athlete"}</p>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-fg-3">
                              {b.email && (
                                <a
                                  href={`mailto:${b.email}`}
                                  className="hover:text-gold-600 dark:hover:text-gold-400 truncate max-w-[150px]"
                                  title={b.email}
                                >
                                  {b.email}
                                </a>
                              )}
                              {b.phone && (
                                <>
                                  <span>•</span>
                                  <a
                                    href={`tel:${b.phone}`}
                                    className="hover:text-gold-600 dark:hover:text-gold-400"
                                  >
                                    {b.phone}
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Service format */}
                      <td className="px-4 py-4">
                        <span className="font-medium text-fg text-xs sm:text-sm block">
                          {b.serviceName || s.serviceId || "1-on-1 Session"}
                        </span>
                        {b.message && (
                          <span className="text-[11px] text-fg-3 truncate max-w-[180px] block mt-0.5">
                            "{b.message}"
                          </span>
                        )}
                      </td>

                      {/* Booked Slot */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col text-xs">
                          <span className="font-semibold text-fg flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gold-500" />
                            {b.date || "Date unselected"}
                          </span>
                          <span className="text-fg-3 text-[11px] mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3" />
                            {b.time || "Flexible"}
                          </span>
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="font-black text-fg text-sm tabular-nums">{inr(s.amount)}</span>
                          <span
                            className={`inline-flex items-center gap-1 w-fit px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              PAYMENT_PILL[pStatus] || PAYMENT_PILL.Created
                            }`}
                          >
                            {pStatus === "Paid" && <CheckCircle2 className="w-3 h-3" />}
                            {pStatus}
                          </span>
                        </div>
                      </td>

                      {/* Session Status */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            STATUS_PILL[sStatus] || STATUS_PILL.Scheduled
                          }`}
                        >
                          {sStatus === "Completed" && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {sStatus === "Scheduled" && <Clock className="w-3.5 h-3.5" />}
                          {sStatus === "Cancelled" && <XCircle className="w-3.5 h-3.5" />}
                          {sStatus}
                        </span>
                      </td>

                      {/* Meeting Link */}
                      <td className="px-4 py-4">
                        {b.meetingLink ? (
                          <a
                            href={b.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline max-w-[130px] truncate"
                          >
                            <LinkIcon className="w-3 h-3 shrink-0" />
                            <span>Join Call</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-xs text-fg-3 italic">Not set</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openSessionDetail(s)}
                          className={btnGhost}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Detail & Management Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-up">
          <div className="relative w-full max-w-2xl rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-line pb-4 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400">
                  Session Management
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-fg">
                  {selectedSession.bookingDetails?.serviceName || "1-on-1 Mentorship Session"}
                </h2>
                <p className="text-xs text-fg-3 mt-0.5">Order ID: {selectedSession._id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="h-8 w-8 rounded-full border border-line flex items-center justify-center text-fg-3 hover:text-fg hover:bg-surface-2 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Athlete Info Strip */}
            <div className="rounded-2xl border border-line bg-surface-2/40 p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-medium text-fg-3">Athlete Name</p>
                  <p className="font-bold text-fg text-sm mt-0.5">
                    {selectedSession.bookingDetails?.name || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-fg-3">Email Address</p>
                  <a
                    href={`mailto:${selectedSession.bookingDetails?.email}`}
                    className="font-bold text-gold-600 dark:text-gold-400 text-sm mt-0.5 truncate block hover:underline"
                  >
                    {selectedSession.bookingDetails?.email || "–"}
                  </a>
                </div>
                <div>
                  <p className="text-[11px] font-medium text-fg-3">Phone Number</p>
                  <a
                    href={`tel:${selectedSession.bookingDetails?.phone}`}
                    className="font-bold text-fg text-sm mt-0.5 truncate block hover:underline"
                  >
                    {selectedSession.bookingDetails?.phone || "–"}
                  </a>
                </div>
              </div>

              {selectedSession.bookingDetails?.message && (
                <div className="mt-3 pt-3 border-t border-line">
                  <p className="text-[11px] font-medium text-fg-3">Athlete Goals & Notes</p>
                  <p className="text-xs text-fg-2 leading-relaxed mt-1 italic">
                    "{selectedSession.bookingDetails.message}"
                  </p>
                </div>
              )}
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-line bg-surface-2/20 p-4 mb-6 text-xs">
              <div>
                <span className="text-fg-3 block text-[11px]">Fee Paid</span>
                <span className="font-black text-fg text-sm">{inr(selectedSession.amount)}</span>
              </div>
              <div>
                <span className="text-fg-3 block text-[11px]">Payment Status</span>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-0.5 ${
                    PAYMENT_PILL[selectedSession.status] || PAYMENT_PILL.Created
                  }`}
                >
                  {selectedSession.status}
                </span>
              </div>
              <div>
                <span className="text-fg-3 block text-[11px]">Razorpay Payment ID</span>
                <span className="font-mono text-[11px] text-fg truncate block" title={selectedSession.razorpayPaymentId}>
                  {selectedSession.razorpayPaymentId || "None"}
                </span>
              </div>
              <div>
                <span className="text-fg-3 block text-[11px]">Booked Date</span>
                <span className="text-fg">{fmtDate(selectedSession.createdAt)}</span>
              </div>
            </div>

            {/* Editable Session Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-fg border-b border-line pb-2">Session Logistics</h3>

              {/* Status and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-fg-2 block mb-1">Session Status</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                    className={fieldClass}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-fg-2 block mb-1">Session Date</label>
                  <input
                    type="text"
                    value={editForm.date}
                    placeholder="e.g. 15 Nov 2026"
                    onChange={(e) => setEditForm((f) => ({ ...f, date: e.target.value }))}
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-fg-2 block mb-1">Preferred Time</label>
                  <input
                    type="text"
                    value={editForm.time}
                    placeholder="e.g. Morning (6 AM to 10 AM)"
                    onChange={(e) => setEditForm((f) => ({ ...f, time: e.target.value }))}
                    className={fieldClass}
                  />
                </div>
              </div>

              {/* Meeting Link input */}
              <div>
                <label className="text-xs font-semibold text-fg-2 block mb-1">
                  Online Meeting Link (Google Meet / Zoom / WhatsApp Call)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://meet.google.com/xyz-abc-def"
                    value={editForm.meetingLink}
                    onChange={(e) => setEditForm((f) => ({ ...f, meetingLink: e.target.value }))}
                    className={fieldClass}
                  />
                  {editForm.meetingLink && (
                    <>
                      <button
                        type="button"
                        onClick={() => copyMeetLink(editForm.meetingLink)}
                        className={btnGhost}
                        title="Copy meeting link"
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <a
                        href={editForm.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={btnGhost}
                        title="Open meeting"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Coach Notes */}
              <div>
                <label className="text-xs font-semibold text-fg-2 block mb-1">
                  Coach Tactical Notes &amp; Homework (Saved for record)
                </label>
                <textarea
                  rows={3}
                  placeholder="Record player technique notes, trial readiness observations, or recommended drills..."
                  value={editForm.coachNotes}
                  onChange={(e) => setEditForm((f) => ({ ...f, coachNotes: e.target.value }))}
                  className={fieldClass}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSendReminder}
                disabled={sendingReminder || !selectedSession.bookingDetails?.email}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-line bg-surface hover:bg-surface-2 text-xs font-bold text-fg transition cursor-pointer disabled:opacity-50"
              >
                <Send className={`w-3.5 h-3.5 ${sendingReminder ? "animate-spin" : ""}`} />
                <span>{sendingReminder ? "Sending..." : "Email Meeting Link to Player"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className={btnGhost}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSaveSession}
                  disabled={saving}
                  className={btnPrimary}
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? "Saving..." : "Save Session"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-ink-950 dark:bg-white text-white dark:text-ink-950 px-4 py-3 text-xs font-bold shadow-xl border border-white/10 animate-fade-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

