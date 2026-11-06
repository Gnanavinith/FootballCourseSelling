import { useEffect, useMemo, useState } from "react";
import { Download, RotateCcw, Search } from "lucide-react";
import { api } from "../../lib/api.js";

/* ---------- Map server Order → client order shape ---------- */
function toOrder(o) {
  const user = o.userId || {};
  const course = o.courseId || {};
  return {
    id: o._id,
    student: user.name || "Unknown",
    course: course.title || "Course",
    amount: o.amount || 0,
    status: o.status || "Created",
    date: o.createdAt,
    payment: o.razorpayPaymentId || "",
  };
}

/* ---------- Shared classes ---------- */
const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
const th = "px-4 py-3 text-xs font-medium text-fg-3 whitespace-nowrap";
const td = "px-4 py-3.5 whitespace-nowrap";

const PILL = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Created: "bg-amber-50 text-amber-700 border-amber-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUSES = ["Created", "Paid", "Failed", "Refunded"];
const COURSES = ["Football Basics", "Dribbling Mastery", "Advanced Tactics", "Goalkeeping Basics"];

const PAGE_SIZE = 6;

const IST = "Asia/Kolkata";
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const dayKey = (t) => new Date(t).toLocaleDateString("en-CA", { timeZone: IST });
const fmtDate = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
const fmtMonth = (key) => new Date(`${key}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
const fmtDay = (key) => new Date(`${key}T00:00:00`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function exportCsv(list) {
  const head = ["Order ID", "Date", "Student", "Course", "Amount (INR)", "Status", "Razorpay payment ID"];
  const lines = list.map((o) => [o.id, dayKey(o.date), o.student, o.course, o.amount, o.status, o.payment].map(csvCell).join(","));
  const blob = new Blob(["\uFEFF" + [head.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${dayKey(Date.now())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------- Revenue summary (counts Paid orders only) ---------- */
function Summary({ orders }) {
  const [by, setBy] = useState("day");
  const paid = useMemo(() => orders.filter((o) => o.status === "Paid"), [orders]);
  const total = useMemo(() => paid.reduce((s, o) => s + o.amount, 0), [paid]);

  const rows = useMemo(() => {
    const map = new Map();
    for (const o of paid) {
      const key = by === "day" ? dayKey(o.date) : by === "month" ? dayKey(o.date).slice(0, 7) : o.course;
      const cur = map.get(key) ?? { key, revenue: 0, count: 0 };
      cur.revenue += o.amount;
      cur.count += 1;
      map.set(key, cur);
    }
    const list = [...map.values()];
    if (by === "course") list.sort((a, b) => b.revenue - a.revenue);
    else list.sort((a, b) => (a.key < b.key ? 1 : -1));
    return by === "day" ? list.slice(0, 7) : list;
  }, [paid, by]);

  const max = Math.max(1, ...rows.map((r) => r.revenue));
  const label = (r) => (by === "day" ? fmtDay(r.key) : by === "month" ? fmtMonth(r.key) : r.key);

  return (
    <section className="rounded-xl border border-line bg-surface">
      <header className="flex flex-col gap-3 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-sm font-semibold tracking-tight text-fg">Revenue summary</h2>
        <div className="inline-flex self-start rounded-lg border border-line bg-surface-2/60 p-0.5 sm:self-auto" role="group" aria-label="Group revenue by">
          {[["day", "By day"], ["month", "By month"], ["course", "By course"]].map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={by === k}
              onClick={() => setBy(k)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                by === k ? "bg-surface text-fg shadow-sm" : "text-fg-3 hover:text-fg"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <div className="p-5">
        <p className="font-display text-3xl font-bold tracking-tight text-fg">{inr(total)}</p>
        <p className="mt-1 text-xs text-fg-3">
          From {paid.length} paid {paid.length === 1 ? "order" : "orders"} in the list below. Refunded orders are not counted.
        </p>

        {rows.length === 0 ? (
          <p className="mt-6 text-sm text-fg-3">No paid orders to summarise for these filters.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {rows.map((r) => (
              <li key={r.key} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_11rem]">
                <span className="truncate font-medium text-fg">{label(r)}</span>
                <span className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <span className="block h-full rounded-full bg-gold-400" style={{ width: `${(r.revenue / max) * 100}%` }} />
                </span>
                <span className="text-right tabular-nums">
                  <span className="font-semibold text-fg">{inr(r.revenue)}</span>
                  <span className="ml-2 text-xs text-fg-3">{r.count} {r.count === 1 ? "order" : "orders"}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ---------- Refund confirmation ---------- */
function ConfirmRefund({ order, onConfirm, onClose }) {
  const [done, setDone] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="refund-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <h2 id="refund-title" className="font-display text-lg font-bold tracking-tight text-fg">Mark {order.id} as refunded?</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          {order.student}’s access to {order.course} stops immediately. This only updates the order here. It does not send money back.
        </p>

        <label className="mt-5 flex items-start gap-3 rounded-lg border border-line bg-surface-2/60 p-4">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-fg" checked={done} onChange={(e) => setDone(e.target.checked)} />
          <span className="text-sm">
            <span className="block font-medium text-fg-body">I refunded this payment in Razorpay</span>
            <span className="block break-all text-xs text-fg-3">Payment ID: {order.payment}</span>
          </span>
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="button" disabled={!done} onClick={onConfirm} className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40">
            Mark as refunded
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [status, setStatus] = useState("All");
  const [course, setCourse] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [refunding, setRefunding] = useState(null);
  const [toast, setToast] = useState("");
  const [reload, setReload] = useState(0); // bump to fetch again
  const [courseOptions, setCourseOptions] = useState(COURSES);

  useEffect(() => setPage(1), [q, status, course, from, to]);

  // Wait until typing pauses before asking the server
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  /* The server returns up to 1000 matching orders (always page 1).
     Paging happens in this component, so the page number is NOT sent to the server. */
  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams();
        if (debouncedQ) params.set("search", debouncedQ);
        if (status !== "All") params.set("status", status);
        if (course !== "All") params.set("course", course);
        if (from) params.set("from", from);
        if (to) params.set("to", to);
        params.set("page", "1");
        params.set("limit", "1000");
        const res = await api(`/admin/orders?${params.toString()}`);
        if (!active) return;
        const list = (Array.isArray(res.data) ? res.data : []).map(toOrder);
        setOrders(list);
        // keep any course names found in real orders in the filter list
        setCourseOptions((prev) => [...new Set([...prev, ...list.map((o) => o.course)])]);
      } catch (err) {
        if (active) setError(err.message || "Failed to load orders");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [debouncedQ, status, course, from, to, reload]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(() => {
    const n = q.toLowerCase();
    return orders
      .filter((o) => {
        const d = dayKey(o.date);
        return (
          [o.id, o.student, o.payment].some((v) => v.toLowerCase().includes(n)) &&
          (status === "All" || o.status === status) &&
          (course === "All" || o.course === course) &&
          (!from || d >= from) &&
          (!to || d <= to)
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, q, status, course, from, to]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtersOn = q || status !== "All" || course !== "All" || from || to;

  const confirmRefund = async () => {
    if (!refunding) return;
    try {
      await api(`/admin/orders/${refunding.id}/refund`, { method: "PATCH" });
      setToast(`${refunding.id} marked as refunded. Access stopped.`);
      setReload((n) => n + 1);
    } catch (err) {
      setToast(err.message || "Refund failed");
    } finally {
      setRefunding(null);
    }
  };

  const clearFilters = () => { setQ(""); setStatus("All"); setCourse("All"); setFrom(""); setTo(""); };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-6 text-center" role="alert">
          <p className="text-sm font-semibold text-fg">Could not load orders</p>
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
              <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Orders</h1>
              <p className="mt-1 text-sm text-fg-3">
                {loading
                  ? "Loading…"
                  : `${orders.length} orders, ${orders.filter((o) => o.status === "Paid").length} paid, ${orders.filter((o) => o.status === "Refunded").length} refunded`}
              </p>
            </div>
            <button
              type="button"
              disabled={filtered.length === 0 || loading}
              onClick={() => { exportCsv(filtered); setToast(`Exported ${filtered.length} ${filtered.length === 1 ? "order" : "orders"}`); }}
              className={`${btnGhost} self-start sm:self-auto`}
            >
              <Download className="h-4 w-4" aria-hidden="true" />Export CSV
            </button>
          </div>

          <Summary orders={filtered} />

          {/* Table card with filters on top */}
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-[1fr_9rem_12rem_9.5rem_9.5rem]">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
                <input type="search" className={`${field} pl-9`} placeholder="Search order, student or payment ID" aria-label="Search orders" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className={field} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All statuses</option>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <select className={field} aria-label="Filter by course" value={course} onChange={(e) => setCourse(e.target.value)}>
                <option value="All">All courses</option>
                {courseOptions.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="date" className={field} aria-label="From date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
              <input type="date" className={field} aria-label="To date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-surface-2/60">
                  <tr>
                    <th className={`${th} pl-5`}>Order</th>
                    <th className={th}>Student</th>
                    <th className={th}>Course</th>
                    <th className={`${th} text-right`}>Amount</th>
                    <th className={th}>Status</th>
                    <th className={th}>Date</th>
                    <th className={`${th} pr-5 text-right`}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-surface-2/50">
                      <td className={`${td} pl-5`}>
                        <p className="font-medium text-fg">{o.id}</p>
                        <p className="text-xs text-fg-3">{o.payment || "No payment yet"}</p>
                      </td>
                      <td className={`${td} text-fg-body`}>{o.student}</td>
                      <td className={`${td} text-fg-body`}>{o.course}</td>
                      <td className={`${td} text-right font-medium tabular-nums text-fg`}>{inr(o.amount)}</td>
                      <td className={td}>
                        <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${PILL[o.status] ?? PILL.Refunded}`}>{o.status}</span>
                      </td>
                      <td className={`${td} text-fg-3`}>{fmtDate(o.date)}</td>
                      <td className={`${td} pr-5 text-right`}>
                        {o.status === "Paid" ? (
                          <button type="button" onClick={() => setRefunding(o)} className={`${btnGhost} !px-3 !py-1.5`}>
                            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />Mark as refunded
                          </button>
                        ) : (
                          <span className="text-fg-3" aria-label="No action available">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && rows.length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-fg-3" aria-busy="true">Loading orders…</div>
            )}

            {!loading && rows.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-fg">{filtersOn ? "No orders match these filters" : "No orders yet"}</p>
                <p className="mt-1 text-sm text-fg-3">{filtersOn ? "Try a different search or clear the filters." : "Orders appear here after a student starts a payment."}</p>
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
          </section>

          {refunding && <ConfirmRefund order={refunding} onConfirm={confirmRefund} onClose={() => setRefunding(null)} />}

          <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2">
            {toast && <div className="rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-surface shadow-lg">{toast}</div>}
          </div>
        </>
      )}
    </div>
  );
}