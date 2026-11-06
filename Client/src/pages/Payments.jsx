import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Reveal from "../components/common/Reveal.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { api } from "../lib/api.js";
import { ThemeToggle } from "../components/layout/Navbar.jsx";
import {
  CreditCard, CheckCircle2, Clock, AlertCircle, RefreshCcw, ArrowRight,
  FileText, Download, ShieldCheck, Copy, Check, Search, ArrowLeft, ExternalLink,
  Receipt
} from "lucide-react";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const STATUS = {
  paid: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  captured: { label: "Paid", cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  created: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
  failed: { label: "Failed", cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  refunded: { label: "Refunded", cls: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
};
const statusOf = (o) => STATUS[String(o.status || "").toLowerCase()] || { label: o.status || "Unknown", cls: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" };

const FILTERS = [
  { key: "all", label: "All Transactions" },
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

  if (!id) return <span className="text-xs text-fg-3 font-mono">–</span>;

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
      <code className="bg-surface-2 px-2 py-1 rounded-lg text-xs font-mono text-fg-2 border border-line select-all" title={id}>{id}</code>
      <button
        type="button"
        onClick={copy}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-600 dark:text-gold-400 hover:underline cursor-pointer"
        title="Copy Razorpay Order ID"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

function StatCard({ label, value, loading, icon: Icon, tone = "" }) {
  return (
    <div className="bg-surface rounded-2xl border border-line p-5 shadow-sm flex items-center justify-between">
      <div>
        <dt className="text-xs font-semibold text-fg-3 uppercase tracking-wider">{label}</dt>
        {loading ? (
          <div className="h-8 w-24 rounded-lg bg-surface-2 animate-pulse mt-1.5" />
        ) : (
          <dd className={`font-display text-2xl lg:text-3xl font-black mt-1 tabular-nums ${tone || "text-fg"}`}>{value}</dd>
        )}
      </div>
      {Icon && (
        <div className="w-11 h-11 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-500 dark:text-gold-400 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}

function PaymentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse" aria-hidden="true">
      {/* Controls skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-full bg-surface-2" />
          <div className="h-9 w-20 rounded-full bg-surface-2" />
          <div className="h-9 w-24 rounded-full bg-surface-2" />
        </div>
        <div className="h-10 w-full sm:w-72 rounded-2xl bg-surface-2" />
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden md:block rounded-3xl border border-line bg-surface overflow-hidden shadow-sm">
        <div className="border-b border-line bg-surface-2/60 px-6 py-4 flex justify-between">
          <div className="h-4 w-40 rounded bg-surface-2" />
          <div className="h-4 w-24 rounded bg-surface-2" />
        </div>
        <div className="divide-y divide-line">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between gap-6">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/5 rounded bg-surface-2" />
                <div className="h-3 w-44 rounded bg-surface-2/70" />
              </div>
              <div className="h-6 w-20 rounded bg-surface-2" />
              <div className="h-6 w-24 rounded-full bg-surface-2" />
              <div className="space-y-1.5 text-right">
                <div className="h-3.5 w-24 rounded bg-surface-2" />
                <div className="h-3 w-14 rounded bg-surface-2/70 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Card Skeletons */}
      <div className="space-y-4 md:hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-line bg-surface p-5 shadow-sm space-y-3">
            <div className="flex justify-between items-start gap-3">
              <div className="h-4 w-44 rounded bg-surface-2" />
              <div className="h-5 w-16 rounded-full bg-surface-2" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-line">
              <div className="h-5 w-20 rounded bg-surface-2" />
              <div className="h-3 w-24 rounded bg-surface-2" />
            </div>
            <div className="h-7 w-36 rounded-lg bg-surface-2/70" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Payments() {
  usePageMeta({ title: "Payments & Invoices | Vanakkam Soccer", noindex: true });

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (filter !== "all" && statusOf(o).label !== filter) return false;
      if (!q) return true;
      const title = (o.courseTitle || o.course?.title || "").toLowerCase();
      const orderId = (o.razorpayOrderId || "").toLowerCase();
      const paymentId = (o.razorpayPaymentId || "").toLowerCase();
      return title.includes(q) || orderId.includes(q) || paymentId.includes(q);
    });
  }, [orders, filter, query]);

  return (
    <div className="min-h-screen bg-page text-fg-body font-sans flex flex-col">
      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-surface py-10 sm:py-14 border-b border-line">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
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
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Razorpay Gateway</span>
                </div>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-fg">
                Billing &amp; <span className="text-gold-600 dark:text-gold-400">Invoices</span>
              </h1>
              <p className="text-fg-3 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                View your confirmed receipts, payment status, and order reference numbers for all enrolled football training courses.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle compact />
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl">
            <StatCard label="Total Investment" value={loading ? "–" : inr.format(totalPaid)} loading={loading} icon={CreditCard} tone="text-gold-600 dark:text-gold-400" />
            <StatCard label="Total Invoices" value={loading ? "–" : orders.length} loading={loading} icon={FileText} />
            <StatCard label="Latest Transaction" value={loading || !orders[0] ? "–" : fmtDate(orders[0].createdAt)} loading={loading} icon={Clock} />
          </dl>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto px-6 py-8 sm:py-12 relative z-20 space-y-6">
        {loading && <PaymentsSkeleton />}

        {!loading && error && (
          <div className="bg-surface rounded-3xl border border-line p-8 sm:p-10 text-center max-w-md mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-danger-500/10 text-danger-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-display text-base font-bold text-fg mb-1">Could not load payment records</h2>
            <p className="text-sm text-danger-500 mb-6">{error}</p>
            <button type="button" className="btn btn-primary mx-auto" onClick={() => setAttempt((n) => n + 1)}>
              <RefreshCcw className="w-4 h-4 mr-2" /> Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-surface rounded-3xl border border-line p-12 sm:p-16 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-gold-400/10 text-gold-500 dark:text-gold-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Receipt className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-black text-fg mb-2">No Transactions Yet</h2>
            <p className="text-sm text-fg-3 leading-relaxed mb-6">
              When you enroll in a masterclass, your official Razorpay tax invoice and receipt will be logged here.
            </p>
            <Link to="/courses" className="btn btn-lg btn-primary mx-auto">
              Browse Masterclasses
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <Reveal className="space-y-6">
            {/* Controls: Status Filter Tabs + Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2" role="group" aria-label="Filter orders">
                {FILTERS.filter((f) => f.key === "all" || counts[f.key]).map((f) => {
                  const active = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setFilter(f.key)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition cursor-pointer border ${
                        active
                          ? "bg-gold-400 text-black border-gold-400 shadow-xs"
                          : "bg-surface text-fg-body border-line hover:border-gold-400/50 hover:text-fg"
                      }`}
                    >
                      {f.label} <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-black/20 text-black" : "bg-surface-2 text-fg-3"}`}>{counts[f.key] || 0}</span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full sm:w-72">
                <span className="sr-only">Search by course name or order reference</span>
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search order ID or course..."
                  className="w-full rounded-2xl border border-line bg-surface py-2.5 pl-10 pr-4 text-xs sm:text-sm text-fg placeholder:text-fg-3 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/30"
                />
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="bg-surface rounded-3xl border border-line shadow-sm overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-2/60 border-b border-line text-xs font-bold text-fg-3 uppercase tracking-wider">
                      <th className="py-4 px-6">Course &amp; Order Reference</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Date &amp; Time</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-sm">
                    {filtered.map((o) => (
                      <tr key={o._id} className="hover:bg-surface-2/40 transition">
                        <td className="py-4 px-6">
                          <p className="font-bold text-fg mb-1">{o.courseTitle || o.course?.title || "Professional Football Masterclass"}</p>
                          <OrderId id={o.razorpayOrderId} />
                        </td>
                        <td className="py-4 px-6 font-display font-black text-fg text-base tabular-nums">
                          {inr.format(o.amount)}
                        </td>
                        <td className="py-4 px-6">
                          <StatusBadge order={o} />
                        </td>
                        <td className="py-4 px-6 text-xs text-fg-3">
                          <span className="font-medium text-fg block">{fmtDate(o.createdAt)}</span>
                          <span className="text-[11px] text-fg-3 mt-0.5 block">{fmtTime(o.createdAt)}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {o.courseId ? (
                            <Link
                              to={`/watch/${o.courseId}`}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                            >
                              <span>Watch Drills</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          ) : (
                            <span className="text-xs text-fg-3 font-medium">Enrolled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="space-y-4 md:hidden">
              {filtered.map((o) => (
                <div key={o._id} className="bg-surface rounded-2xl border border-line p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-fg text-sm">{o.courseTitle || o.course?.title || "Professional Football Masterclass"}</h3>
                    <StatusBadge order={o} />
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-line">
                    <span className="font-display font-black text-lg text-fg tabular-nums">{inr.format(o.amount)}</span>
                    <span className="text-xs text-fg-3">{fmtDate(o.createdAt)} • {fmtTime(o.createdAt)}</span>
                  </div>
                  <div className="pt-2 flex items-center justify-between gap-2">
                    <OrderId id={o.razorpayOrderId} />
                    {o.courseId && (
                      <Link
                        to={`/watch/${o.courseId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-gold-600 dark:text-gold-400"
                      >
                        <span>Watch</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No matches for search */}
            {filtered.length === 0 && (
              <div className="bg-surface rounded-3xl border border-line p-10 text-center max-w-md mx-auto shadow-sm">
                <p className="font-display text-base font-bold text-fg">No transactions found</p>
                <p className="text-xs text-fg-3 mt-1">Try adjusting your filter or search keywords.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline mt-4 mx-auto"
                  onClick={() => { setFilter("all"); setQuery(""); }}
                >
                  Clear search
                </button>
              </div>
            )}
          </Reveal>
        )}
      </div>
    </div>
  );
}
