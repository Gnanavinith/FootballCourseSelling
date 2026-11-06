import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Search, X } from "lucide-react";
import { api } from "../lib/api.js";

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
const td = "px-4 py-3.5 whitespace-nowrap";

const PILL = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
};
const TABS = ["Pending", "Approved", "Rejected", "All"];
const PAGE_SIZE = 8;

const IST = "Asia/Kolkata";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (t) => (t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST }) : "-");
const fmtDateTime = (t) =>
  new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }) + " IST";

/* ---------- Map server PaymentRequest → client shape ---------- */
function toRequest(r) {
  const user = r.userId || {};
  const course = r.courseId || {};
  return {
    id: r._id,
    userId: user._id || (typeof r.userId === "string" ? r.userId : ""),
    courseId: course._id || (typeof r.courseId === "string" ? r.courseId : ""),
    student: user.name || "Unknown",
    email: user.email || "",
    course: course.title || "Course",
    price: course.price ?? null,
    amount: r.amount || 0,
    method: r.method || "UPI",
    reference: r.reference || "",
    paidOn: r.paidOn,
    payerName: r.payerName || "",
    mobile: r.mobile || "",
    note: r.note || "",
    screenshot: r.screenshotUrl || "",
    status: r.status || "Pending",
    reviewNote: r.reviewNote || "",
    createdAt: r.createdAt,
  };
}

/* ---------- Review drawer ---------- */
function ReviewDrawer({ req, duplicates, onClose, onApprove, onReject }) {
  const [checked, setChecked] = useState(false);
  const [startWeek, setStartWeek] = useState(1);
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState(false);

  const pending = req.status === "Pending";
  const mismatch = req.price != null && Number(req.amount) !== Number(req.price);

  const run = async (fn) => {
    setBusy(true);
    try { await fn(); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="pr-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-5 sm:px-6">
          <div className="min-w-0">
            <h2 id="pr-title" className="truncate font-display text-base font-bold leading-tight tracking-tight text-fg">{req.student}</h2>
            <p className="text-xs text-fg-3">Sent {fmtDateTime(req.createdAt)}</p>
          </div>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Warnings */}
          {mismatch && (
            <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>The student entered {inr(req.amount)}, but the course price is {inr(req.price)}. Check your bank or UPI app before you approve.</p>
            </div>
          )}
          {duplicates > 0 && (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <p>This transaction number appears in {duplicates} other {duplicates === 1 ? "request" : "requests"}. Make sure it is not used twice.</p>
            </div>
          )}

          {/* Payment details */}
          <section>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div><dt className="text-xs text-fg-3">Course</dt><dd className="mt-0.5 font-medium text-fg">{req.course}</dd></div>
              <div><dt className="text-xs text-fg-3">Amount entered</dt><dd className="mt-0.5 font-display text-lg font-bold text-fg">{inr(req.amount)}</dd></div>
              <div><dt className="text-xs text-fg-3">Method</dt><dd className="mt-0.5 font-medium text-fg">{req.method}</dd></div>
              <div><dt className="text-xs text-fg-3">Payment date</dt><dd className="mt-0.5 font-medium text-fg">{fmtDate(req.paidOn)}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-fg-3">Transaction / UTR number</dt><dd className="mt-0.5 break-all font-medium text-fg">{req.reference || "Not given"}</dd></div>
              <div><dt className="text-xs text-fg-3">Paid by</dt><dd className="mt-0.5 font-medium text-fg">{req.payerName}</dd></div>
              <div><dt className="text-xs text-fg-3">Mobile</dt><dd className="mt-0.5 font-medium text-fg">{req.mobile}</dd></div>
              <div className="col-span-2"><dt className="text-xs text-fg-3">Student email</dt><dd className="mt-0.5 break-all font-medium text-fg">{req.email || "Not given"}</dd></div>
            </dl>
          </section>

          {req.note && (
            <section className="border-t border-line pt-6">
              <h3 className="mb-2 font-display text-sm font-semibold text-fg">Student's note</h3>
              <p className="whitespace-pre-wrap rounded-lg border border-line bg-surface-2/60 p-4 text-sm text-fg-body">{req.note}</p>
            </section>
          )}

          {req.screenshot && (
            <section className="border-t border-line pt-6">
              <h3 className="mb-2 font-display text-sm font-semibold text-fg">Screenshot</h3>
              <a href={req.screenshot} target="_blank" rel="noopener noreferrer">
                <img src={req.screenshot} alt="Payment screenshot from the student" className="max-h-80 w-full rounded-lg border border-line object-contain bg-surface-2" />
              </a>
            </section>
          )}

          {/* Decision */}
          {pending ? (
            <section className="space-y-4 border-t border-line pt-6">
              {!rejecting ? (
                <>
                  <label className="flex items-start gap-3 rounded-lg border border-line bg-surface-2/60 p-4">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-fg" checked={checked} onChange={(e) => setChecked(e.target.checked)} />
                    <span className="text-sm">
                      <span className="block font-medium text-fg-body">I checked that {inr(req.amount)} reached my account</span>
                      <span className="block text-xs text-fg-3">Approving unlocks the course videos for this student.</span>
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    <label htmlFor="pr-week" className="text-sm font-medium text-fg-body">Start from week</label>
                    <input
                      id="pr-week"
                      type="number"
                      min="1"
                      className={`${field} !w-20`}
                      value={startWeek}
                      onChange={(e) => setStartWeek(Math.max(1, Number(e.target.value || 1)))}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={!checked || busy}
                      onClick={() => run(() => onApprove(req, startWeek))}
                      className={btnPrimary}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                      {busy ? "Approving…" : "Approve and unlock videos"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => setRejecting(true)} className={btnGhost}>
                      Reject
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-fg-body">Reason for rejecting</span>
                    <textarea
                      rows={3}
                      className={field}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="For example: the amount did not reach our account."
                    />
                    <span className="mt-1 block text-xs text-fg-3">The student can see this reason.</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={reason.trim().length < 3 || busy}
                      onClick={() => run(() => onReject(req, reason.trim()))}
                      className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {busy ? "Rejecting…" : "Reject request"}
                    </button>
                    <button type="button" disabled={busy} onClick={() => setRejecting(false)} className={btnGhost}>Back</button>
                  </div>
                </>
              )}
            </section>
          ) : (
            <section className="border-t border-line pt-6">
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PILL[req.status]}`}>{req.status}</span>
              {req.status === "Rejected" && req.reviewNote && <p className="mt-2 text-sm text-fg-body">Reason: {req.reviewNote}</p>}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function AdminPaymentRequests() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const [tab, setTab] = useState("Pending");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const res = await api("/admin/payment-requests?page=1&limit=1000");
        if (active) setItems((Array.isArray(res.data) ? res.data : []).map(toRequest));
      } catch (err) {
        if (active) setError(err.message || "Failed to load payment requests");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [reload]);

  useEffect(() => setPage(1), [tab, q]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setOpenId(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = openId ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [openId]);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t, t === "All" ? items.length : items.filter((r) => r.status === t).length])),
    [items]
  );

  const filtered = useMemo(() => {
    const n = q.toLowerCase();
    return items
      .filter(
        (r) =>
          (tab === "All" || r.status === tab) &&
          [r.student, r.email, r.reference, r.payerName, r.mobile, r.course].some((v) => v && v.toLowerCase().includes(n))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [items, tab, q]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const open = items.find((r) => r.id === openId) ?? null;
  const duplicatesOf = (r) =>
    r.reference ? items.filter((x) => x.id !== r.id && x.reference && x.reference.toLowerCase() === r.reference.toLowerCase()).length : 0;

  /* The server must create the enrollment (start week = startWeek) and mark the request Approved in one step. */
  const approve = async (r, startWeek) => {
    try {
      await api(`/admin/payment-requests/${r.id}/approve`, { method: "PATCH", body: JSON.stringify({ startWeek }) });
      setToast(`Approved. ${r.student} can now watch ${r.course}.`);
      setOpenId(null);
      setReload((n) => n + 1);
    } catch (err) {
      setToast(err.message || "Approval failed");
    }
  };

  const reject = async (r, reviewNote) => {
    try {
      await api(`/admin/payment-requests/${r.id}/reject`, { method: "PATCH", body: JSON.stringify({ reviewNote }) });
      setToast("Request rejected");
      setOpenId(null);
      setReload((n) => n + 1);
    } catch (err) {
      setToast(err.message || "Rejection failed");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-6 text-center" role="alert">
          <p className="text-sm font-semibold text-fg">Could not load payment requests</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
          <button type="button" className={`${btnPrimary} mx-auto mt-4`} onClick={() => setReload((n) => n + 1)}>Try again</button>
        </div>
      )}

      {!error && (
        <>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Manual payments</h1>
            <p className="mt-1 text-sm text-fg-3">
              {loading ? "Loading…" : `${counts.Pending} waiting for your check, ${counts.Approved} approved, ${counts.Rejected} rejected`}
            </p>
          </div>

          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-line px-3" role="group" aria-label="Filter by status">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tab === t}
                  onClick={() => setTab(t)}
                  className={`-mb-px inline-flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    tab === t ? "border-gold-400 text-fg" : "border-transparent text-fg-3 hover:text-fg"
                  }`}
                >
                  {t}
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs tabular-nums text-fg-3">{counts[t]}</span>
                </button>
              ))}
            </div>

            <div className="border-b border-line p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
                <input type="search" className={`${field} pl-9`} placeholder="Search by student, transaction number, mobile or course" aria-label="Search payment requests" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>

            {loading && <div className="px-6 py-14 text-center text-sm text-fg-3" aria-busy="true">Loading payment requests…</div>}

            {!loading && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left text-sm">
                    <thead className="bg-surface-2/60">
                      <tr>
                        <th className={`${th} pl-5`}>Student</th>
                        <th className={th}>Course</th>
                        <th className={`${th} text-right`}>Amount</th>
                        <th className={th}>Method</th>
                        <th className={th}>Transaction no.</th>
                        <th className={th}>Status</th>
                        <th className={`${th} pr-5 text-right`}>Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((r) => (
                        <tr key={r.id} className="transition-colors hover:bg-surface-2/50">
                          <td className={`${td} pl-5`}>
                            <p className="font-medium text-fg">{r.student}</p>
                            <p className="text-xs text-fg-3">Sent {fmtDate(r.createdAt)}</p>
                          </td>
                          <td className={`${td} text-fg-body`}>{r.course}</td>
                          <td className={`${td} text-right font-medium tabular-nums text-fg`}>{inr(r.amount)}</td>
                          <td className={`${td} text-fg-body`}>{r.method}</td>
                          <td className={`${td} max-w-[11rem] truncate text-fg-3`}>{r.reference || "-"}</td>
                          <td className={td}>
                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${PILL[r.status] ?? PILL.Rejected}`}>{r.status}</span>
                          </td>
                          <td className={`${td} pr-5 text-right`}>
                            <button type="button" onClick={() => setOpenId(r.id)} className={`${r.status === "Pending" ? btnPrimary : btnGhost} !px-3 !py-1.5`}>
                              {r.status === "Pending" ? "Review" : "View"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {rows.length === 0 && (
                  <div className="px-6 py-14 text-center">
                    <p className="text-sm font-semibold text-fg">{q || tab !== "All" ? "No requests found" : "No payment requests yet"}</p>
                    <p className="mt-1 text-sm text-fg-3">
                      {tab === "Pending" && !q ? "You have checked everything. New requests will appear here." : "Try a different search or tab."}
                    </p>
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
            <ReviewDrawer
              key={open.id}
              req={open}
              duplicates={duplicatesOf(open)}
              onClose={() => setOpenId(null)}
              onApprove={approve}
              onReject={reject}
            />
          )}

          <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[90] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2">
            {toast && <div className="rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-surface shadow-lg">{toast}</div>}
          </div>
        </>
      )}
    </div>
  );
}
