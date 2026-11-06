import { useEffect, useMemo, useState } from "react";
import { Download, Mail, Phone, Search, Trash2, X } from "lucide-react";
import { api } from "../../lib/api.js";

/* ---------- Constants ---------- */
const STATUSES = ["New", "In progress", "Replied", "Done"];
const DEFAULT_SOURCES = ["website", "Contact page", "Course page"];
const PAGE_SIZE = 6;

const IST = "Asia/Kolkata";
const fmtDate = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
const fmtDateTime = (t) =>
  new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }) + " IST";

/* ---------- Shared classes ---------- */
const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fg-3 transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400";
const th = "px-4 py-3 text-xs font-medium text-fg-3 whitespace-nowrap";
const td = "px-4 py-3.5";

const PILL = {
  New: "bg-sky-50 text-sky-700 border-sky-200",
  "In progress": "bg-amber-50 text-amber-700 border-amber-200",
  Replied: "bg-purple-50 text-purple-700 border-purple-200",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function csvCell(v) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function exportCsv(list) {
  const head = ["Date", "Name", "Email", "Mobile", "Source", "Course", "Subject", "Message", "Status", "Internal note"];
  const lines = list.map((e) =>
    [fmtDate(e.createdAt), e.name, e.email, e.phone, e.source, e.subject, e.subject, e.message, e.status, e.note].map(csvCell).join(",")
  );
  const blob = new Blob(["\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Reply Modal ---------- */
function ReplyModal({ enquiry, onClose, onSent }) {
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setSending(true);
    setErr("");
    try {
      const res = await api(`/admin/enquiries/${enquiry._id}/reply`, {
        method: "POST",
        body: JSON.stringify({ replyMessage }),
      });
      onSent(res.data);
    } catch (error) {
      setErr(error.message || "Failed to send email reply");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="reply-modal-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <div>
            <h2 id="reply-modal-title" className="font-display text-lg font-bold tracking-tight text-fg">Reply to enquiry</h2>
            <p className="text-xs text-fg-3">Sends an official email to {enquiry.name} ({enquiry.email})</p>
          </div>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        {err && <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{err}</div>}

        <form onSubmit={handleSend} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-fg-3">Subject</label>
            <input
              type="text"
              readOnly
              className={`${field} mt-1 bg-surface-2 cursor-not-allowed`}
              value={`Re: ${enquiry.subject || "Course Enquiry"}`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-fg-3">Original Message</label>
            <p className="mt-1 max-h-24 overflow-y-auto rounded-lg border border-line bg-surface-2/60 p-2.5 text-xs text-fg-body">
              {enquiry.message || "No message body"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-fg-3">Your Reply Message *</label>
            <textarea
              rows={5}
              required
              className={`${field} mt-1`}
              placeholder="Write your professional response to the student..."
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className={btnGhost} disabled={sending}>Cancel</button>
            <button type="submit" disabled={sending || !replyMessage.trim()} className={btnPrimary}>
              {sending ? "Sending..." : "Send Reply Email"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Detail drawer ---------- */
function EnquiryDrawer({ enquiry, onClose, onStatus, onSaveNote, onDelete, onReply }) {
  const [note, setNote] = useState(enquiry.note || "");
  const dirty = note !== (enquiry.note || "");

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="enq-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-5 sm:px-6">
          <div className="min-w-0">
            <h2 id="enq-title" className="truncate font-display text-base font-bold leading-tight tracking-tight text-fg">{enquiry.subject}</h2>
            <p className="text-xs text-fg-3">{fmtDateTime(enquiry.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Sender */}
          <section>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div><dt className="text-xs text-fg-3">Name</dt><dd className="mt-0.5 font-medium text-fg">{enquiry.name}</dd></div>
              <div>
                <dt className="text-xs text-fg-3">Came from</dt>
                <dd className="mt-0.5 font-medium text-fg">{enquiry.source}{enquiry.subject ? `: ${enquiry.subject}` : ""}</dd>
              </div>
              <div><dt className="text-xs text-fg-3">Email</dt><dd className="mt-0.5 break-all font-medium text-fg">{enquiry.email || "Not given"}</dd></div>
              <div><dt className="text-xs text-fg-3">Mobile</dt><dd className="mt-0.5 font-medium text-fg">{enquiry.phone || "Not given"}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {enquiry.email && (
                <button
                  type="button"
                  onClick={onReply}
                  className={`${btnPrimary} !py-1.5 !px-3 text-xs`}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />Reply by email
                </button>
              )}
              {enquiry.phone && (
                <a href={`tel:+91${enquiry.phone}`} className={`${btnGhost} no-underline hover:no-underline !py-1.5 !px-3 text-xs`}>
                  <Phone className="h-4 w-4" aria-hidden="true" />Call
                </a>
              )}
            </div>
          </section>

          {/* Message */}
          <section className="border-t border-line pt-6">
            <h3 className="mb-2 font-display text-sm font-semibold text-fg">Message</h3>
            <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface-2/60 p-4 text-sm leading-relaxed text-fg-body">{enquiry.message}</p>
          </section>

          {/* Replies history */}
          {enquiry.replies && enquiry.replies.length > 0 && (
            <section className="border-t border-line pt-4">
              <h3 className="mb-2 font-display text-sm font-semibold text-fg">Sent Replies ({enquiry.replies.length})</h3>
              <div className="space-y-3">
                {enquiry.replies.map((r, i) => (
                  <div key={i} className="rounded-lg border border-line bg-surface-2/40 p-3 text-xs">
                    <div className="flex justify-between font-medium text-fg-3 mb-1">
                      <span>By {r.repliedBy || "Admin"}</span>
                      <span>{fmtDateTime(r.repliedAt)}</span>
                    </div>
                    <p className="text-fg whitespace-pre-wrap">{r.replyMessage}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Status */}
          <section>
            <h3 className="mb-2 font-display text-sm font-semibold text-fg">Status</h3>
            <div className="inline-flex rounded-lg border border-line bg-surface-2/60 p-0.5" role="group" aria-label="Set status">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={enquiry.status === s}
                  onClick={() => onStatus(s)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    enquiry.status === s ? "bg-surface text-fg shadow-sm" : "text-fg-3 hover:text-fg"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          {/* Internal note */}
          <section>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-fg-body">Internal note</span>
              <textarea rows={4} className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only admins can see this." />
            </label>
            <button type="button" disabled={!dirty} onClick={() => onSaveNote(note)} className={`${btnPrimary} mt-3`}>Save note</button>
          </section>

          <section className="border-t border-line pt-5">
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              <Trash2 className="h-4 w-4" aria-hidden="true" />Delete enquiry
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Delete confirm ---------- */
function ConfirmDelete({ enquiry, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="enq-del-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <h2 id="enq-del-title" className="font-display text-lg font-bold tracking-tight text-fg">Delete this enquiry?</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          The message from {enquiry.name} (“{enquiry.subject}”) and its internal note will be removed. This cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1">
            Delete enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function AdminEnquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("All");
  const [source, setSource] = useState("All");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [replying, setReplying] = useState(null);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  const counts = useMemo(
    () => Object.fromEntries(["All", ...STATUSES].map((s) => [s, s === "All" ? items.length : items.filter((e) => e.status === s).length])),
    [items]
  );

  const sources = useMemo(() => [...new Set([...DEFAULT_SOURCES, ...items.map((e) => e.source).filter(Boolean)])], [items]);

  const filtered = useMemo(() => {
    const n = q.toLowerCase();
    return items
      .filter(
        (e) =>
          (tab === "All" || e.status === tab) &&
          (source === "All" || e.source === source) &&
          [e.name, e.email, e.phone, e.subject, e.message].some((v) => v && v.toLowerCase().includes(n))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, q, tab, source]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtersOn = q || tab !== "All" || source !== "All";
  const open = items.find((e) => e._id === openId) ?? null;

  useEffect(() => setPage(1), [q, tab, source]);

  /* Load everything once. Tabs, source and search are applied here in the page,
     so the tab counts stay correct no matter which tab is selected. */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api("/admin/enquiries?page=1&limit=1000");
        if (!cancelled) setItems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load enquiries");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (replying) setReplying(null);
      else if (deleting) setDeleting(null);
      else if (openId) setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [replying, deleting, openId]);
  useEffect(() => {
    document.body.style.overflow = openId || deleting || replying ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openId, deleting, replying]);

  /* API actions */
  const updateEnquiry = async (id, body) => {
    const res = await api(`/admin/enquiries/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    return res.data;
  };

  const deleteEnquiryApi = async (id) => {
    await api(`/admin/enquiries/${id}`, { method: "DELETE" });
  };

  const patch = (id, p) => setItems((xs) => xs.map((x) => (x._id === id ? { ...x, ...p } : x)));

  const confirmDelete = async () => {
    try {
      await deleteEnquiryApi(deleting._id);
      setItems((xs) => xs.filter((x) => x._id !== deleting._id));
      setToast("Enquiry deleted");
    } catch (err) {
      setToast(err.message || "Delete failed");
    } finally {
      setDeleting(null);
      setOpenId(null);
    }
  };

  const clearFilters = () => { setQ(""); setTab("All"); setSource("All"); };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-6 text-center" role="alert">
          <p className="text-sm font-semibold text-fg">Could not load enquiries</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
          <button type="button" className={`${btnPrimary} mx-auto mt-4`} onClick={() => setReload((n) => n + 1)}>
            Try again
          </button>
        </div>
      )}
      {!error && (
        <>
          {/* Page header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Enquiries</h1>
              <p className="mt-1 text-sm text-fg-3">
                {loading ? "Loading…" : `${counts.New} new, ${counts["In progress"]} in progress, ${counts.Done} done`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { exportCsv(filtered); setToast(`Exported ${filtered.length} ${filtered.length === 1 ? "enquiry" : "enquiries"}`); }}
              disabled={filtered.length === 0 || loading}
              className={`${btnGhost} self-start sm:self-auto`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />Export CSV
            </button>
          </div>

          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            {/* Status tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-line px-3" role="group" aria-label="Filter by status">
              {["All", ...STATUSES].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={tab === s}
                  onClick={() => setTab(s)}
                  className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    tab === s ? "border-gold-400 text-fg" : "border-transparent text-fg-3 hover:text-fg"
                  }`}
                >
                  {s}
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-fg-3">{counts[s]}</span>
                </button>
              ))}
            </div>

            {/* Search + source */}
            <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-[1fr_13rem]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
                <input type="search" className={`${field} pl-9`} placeholder="Search name, email, mobile or message" aria-label="Search enquiries" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className={field} aria-label="Filter by source" value={source} onChange={(e) => setSource(e.target.value)}>
                <option value="All">All sources</option>
                {sources.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {loading && (
              <div className="px-6 py-14 text-center text-sm text-fg-3" aria-busy="true">Loading enquiries…</div>
            )}

            {!loading && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[780px] text-left text-sm">
                    <thead className="bg-surface-2/60">
                      <tr>
                        <th className={`${th} pl-5`}>From</th>
                        <th className={th}>Message</th>
                        <th className={th}>Source</th>
                        <th className={th}>Status</th>
                        <th className={th}>Received</th>
                        <th className={`${th} pr-5 text-right`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((e) => (
                        <tr key={e._id} className="transition-colors hover:bg-surface-2/50">
                          <td className={`${td} pl-5`}>
                            <div className="flex items-start gap-2">
                              <span
                                aria-hidden="true"
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.status === "New" ? "bg-gold-400" : "bg-transparent"}`}
                              />
                              <div className="min-w-0">
                                <p className={`${e.status === "New" ? "font-semibold" : "font-medium"} text-fg`}>
                                  {e.name}
                                  {e.status === "New" && <span className="sr-only"> (new)</span>}
                                </p>
                                <p className="text-xs text-fg-3">{e.email || e.phone || "No contact given"}</p>
                              </div>
                            </div>
                          </td>
                          <td className={`${td} max-w-xs`}>
                            <p className="truncate font-medium text-fg">{e.subject}</p>
                            <p className="truncate text-xs text-fg-3">{e.message}</p>
                          </td>
                          <td className={`${td} text-fg-body`}>
                            {e.source}
                            {e.subject && <span className="block max-w-[10rem] truncate text-xs text-fg-3">{e.subject}</span>}
                          </td>
                          <td className={`${td} whitespace-nowrap`}>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PILL[e.status] ?? PILL.Done}`}>{e.status}</span>
                          </td>
                          <td className={`${td} whitespace-nowrap text-fg-3`}>{fmtDate(e.createdAt)}</td>
                          <td className={`${td} pr-5`}>
                            <div className="flex items-center justify-end gap-1">
                              {e.email && (
                                <button
                                  type="button"
                                  onClick={() => setReplying(e)}
                                  className={`${iconBtn} hover:text-gold-400`}
                                  title="Reply by email"
                                  aria-label={`Reply to ${e.name}`}
                                >
                                  <Mail className="h-4 w-4" />
                                </button>
                              )}
                              <button type="button" onClick={() => setOpenId(e._id)} className={`${btnGhost} !px-3 !py-1.5`}>Open</button>
                              <button type="button" onClick={() => setDeleting(e)} className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Delete" aria-label={`Delete enquiry from ${e.name}`}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rows.length === 0 && (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-fg">{filtersOn ? "No enquiries match these filters" : "No enquiries yet"}</p>
                    <p className="mt-1 text-sm text-fg-3">
                      {filtersOn ? "Try a different search or clear the filters." : "Messages from the enquiry form appear here."}
                    </p>
                    {filtersOn && <button type="button" onClick={clearFilters} className={`${btnGhost} mt-4`}>Clear filters</button>}
                  </div>
                )}

                {filtered.length > 0 && (
                  <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm sm:flex-row">
                    <p className="text-fg-3">Showing {(current - 1) * PAGE_SIZE + 1} to {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className={`${btnGhost} !px-3 !py-1.5`}>Previous</button>
                      <span className="px-2 text-fg-3">Page {current} of {pages}</span>
                      <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)} className={`${btnGhost} !px-3 !py-1.5`}>Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {open && (
            <EnquiryDrawer
              key={open._id}
              enquiry={open}
              onClose={() => setOpenId(null)}
              onStatus={async (s) => {
                try {
                  await updateEnquiry(open._id, { status: s });
                  patch(open._id, { status: s });
                  setToast(`Marked as ${s.toLowerCase()}`);
                } catch (err) {
                  setToast(err.message || "Status update failed");
                }
              }}
              onSaveNote={async (n) => {
                try {
                  await updateEnquiry(open._id, { note: n });
                  patch(open._id, { note: n });
                  setToast("Note saved");
                } catch (err) {
                  setToast(err.message || "Note save failed");
                }
              }}
              onDelete={() => setDeleting(open)}
              onReply={() => setReplying(open)}
            />
          )}
          {replying && (
            <ReplyModal
              enquiry={replying}
              onClose={() => setReplying(null)}
              onSent={(updated) => {
                patch(replying._id, {
                  status: "Replied",
                  replies: updated.replies,
                  note: updated.note,
                });
                setReplying(null);
                setToast("Reply email sent and enquiry marked as Replied");
              }}
            />
          )}
          {deleting && <ConfirmDelete enquiry={deleting} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />}

          <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[90] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2">
            {toast && <div className="rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-surface shadow-lg">{toast}</div>}
          </div>
        </>
      )}
    </div>
  );
}