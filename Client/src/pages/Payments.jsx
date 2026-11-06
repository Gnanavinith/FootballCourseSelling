import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/common/Reveal.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { api } from "../lib/api.js";
import { CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCcw, ArrowRight, FileText, Download, ShieldCheck } from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const STATUS = {
  paid: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  captured: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  created: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-600 border-red-500/20" },
  refunded: { label: "Refunded", cls: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20" },
};
const statusOf = (o) => STATUS[String(o.status || "").toLowerCase()] || { label: o.status || "Unknown", cls: "bg-zinc-500/10 text-zinc-600 border-zinc-500/20" };

const FILTERS = [
  { key: "all", label: "All Orders" },
  { key: "Paid", label: "Paid" },
  { key: "Pending", label: "Pending" },
  { key: "Failed", label: "Failed" },
  { key: "Refunded", label: "Refunded" },
];

const fmtDate = (v) => new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtTime = (v) => new Date(v).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

function StatusBadge({ order }) {
  const s = statusOf(order);
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.cls}`}>
      {s.label === "Paid" && <CheckCircle2 className="w-3.5 h-3.5" />}
      {s.label === "Pending" && <Clock className="w-3.5 h-3.5" />}
      {s.label === "Failed" && <AlertCircle className="w-3.5 h-3.5" />}
      {s.label}
    </span>
  );
}

function OrderId({ id }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center gap-2">
      <code className="bg-surface-2 px-2 py-1 rounded-lg text-xs font-mono text-fg-3 select-all" title={id}>{id}</code>
      <button
        type="button"
        onClick={copy}
        className="text-[11px] font-semibold text-pitch-600 hover:underline"
      >
        {copied ? "Copied!" : "Copy ID"}
      </button>
    </div>
  );
}

function StatCard({ label, value, loading, icon: Icon }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 px-5 py-4 shadow-sm flex items-center justify-between">
      <div>
        <dt className="text-xs font-medium text-zinc-300">{label}</dt>
        <dd className="font-display text-2xl lg:text-3xl font-black text-white mt-1">{loading ? "–" : value}</dd>
      </div>
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-gold-400">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

export default function Payments() {
  usePageMeta({ title: "Payments & Invoices | Vanakkam Soccer", noindex: true });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api("/me/orders")
      .then((r) => {
        if (cancelled) return;
        const data = r.data || [];
        setOrders([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      })
      .catch((e) => !cancelled && setError(e.message || "Could not load your payments"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [attempt]);

  const totalPaid = useMemo(
    () => orders.filter((o) => statusOf(o).label === "Paid").reduce((sum, o) => sum + Number(o.amount || 0), 0),
    [orders]
  );

  const counts = useMemo(() => {
    const c = { all: orders.length };
    orders.forEach((o) => {
      const k = statusOf(o).label;
      c[k] = (c[k] || 0) + 1;
    });
    return c;
  }, [orders]);

  const visible = filter === "all" ? orders : orders.filter((o) => statusOf(o).label === filter);

  return (
    <div className="min-h-screen bg-surface-2 font-sans flex flex-col">
      {/* Hero Header Banner */}
      <section className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16 relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pitch-600/20 border border-pitch-500/30 text-pitch-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Transactions</span>
            </div>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black tracking-tight">
            Payments & <span className="text-pitch-500">Invoices</span>
          </h1>
          <p className="text-zinc-400 text-sm lg:text-base mt-2 max-w-xl">
            View your order history, verified receipts, and payment status for all enrolled football training courses.
          </p>

          <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            <StatCard label="Total Paid" value={loading ? "–" : inr.format(totalPaid)} loading={loading} icon={CreditCard} />
            <StatCard label="Total Orders" value={loading ? "–" : orders.length} loading={loading} icon={FileText} />
            <StatCard label="Last Payment" value={loading || !orders[0] ? "–" : fmtDate(orders[0].createdAt)} loading={loading} icon={Clock} />
          </dl>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-6 -mt-8 relative z-20 pb-16 space-y-8">
        {loading && (
          <div className="bg-surface rounded-3xl border border-line p-12 text-center shadow-md">
            <div className="w-10 h-10 border-4 border-pitch-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium text-fg-3">Loading your payment records...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-surface rounded-3xl border border-line p-8 text-center max-w-md mx-auto shadow-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-base font-bold text-fg mb-1">Could not load payments</h2>
            <p className="text-sm text-red-600 mb-6">{error}</p>
            <button type="button" className="px-5 py-2.5 bg-pitch-600 text-white font-semibold rounded-xl text-sm transition hover:bg-pitch-700" onClick={() => setAttempt((n) => n + 1)}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-surface rounded-3xl border border-line p-16 text-center max-w-lg mx-auto shadow-md">
            <div className="w-16 h-16 rounded-2xl bg-pitch-600/10 text-pitch-600 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-fg mb-2">No Transactions Yet</h2>
            <p className="text-sm text-fg-3 mb-6">When you purchase a professional football course, your receipts and order IDs will appear here.</p>
            <Link to="/courses" className="inline-flex items-center justify-center px-6 py-3 bg-pitch-600 hover:bg-pitch-700 text-white font-semibold rounded-xl text-sm transition shadow-md">
              Explore Courses
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <Reveal>
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Filter orders">
              {FILTERS.filter((f) => f.key === "all" || counts[f.key]).map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer border ${
                      active
                        ? "bg-pitch-600 text-white border-pitch-600 shadow-xs"
                        : "bg-surface text-fg-3 border-line hover:border-pitch-400 hover:text-fg"
                    }`}
                  >
                    {f.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20 text-white" : "bg-surface-2 text-fg-3"}`}>{counts[f.key] || 0}</span>
                  </button>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="bg-surface rounded-3xl border border-line shadow-sm overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-2 border-b border-line text-xs font-bold text-fg-3 uppercase tracking-wider">
                      <th className="py-4 px-6">Course & Order Reference</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date & Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {visible.map((o) => (
                      <tr key={o._id} className="hover:bg-surface-2/50 transition">
                        <td className="py-4 px-6">
                          <p className="font-bold text-fg mb-1">{o.courseTitle || o.course?.title || "Professional Football Masterclass"}</p>
                          <OrderId id={o.razorpayOrderId} />
                        </td>
                        <td className="py-4 px-6 font-display font-black text-fg text-base">
                          {inr.format(o.amount)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge order={o} />
                        </td>
                        <td className="py-4 px-6 text-xs text-fg-3">
                          <span className="font-medium text-fg">{fmtDate(o.createdAt)}</span>
                          <span className="block text-[11px] text-fg-3 mt-0.5">{fmtTime(o.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="space-y-4 md:hidden">
              {visible.map((o) => (
                <div key={o._id} className="bg-surface rounded-2xl border border-line p-5 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-fg text-sm">{o.courseTitle || o.course?.title || "Professional Football Masterclass"}</h3>
                    <StatusBadge order={o} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    <span className="font-display font-black text-lg text-fg">{inr.format(o.amount)}</span>
                    <span className="text-xs text-fg-3">{fmtDate(o.createdAt)}</span>
                  </div>
                  <div className="pt-2">
                    <OrderId id={o.razorpayOrderId} />
                  </div>
                </div>
              ))}
              {visible.length === 0 && (
                <div className="bg-surface rounded-2xl border border-line p-8 text-center text-fg-3 text-sm">
                  No orders found for this status filter.
                </div>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
