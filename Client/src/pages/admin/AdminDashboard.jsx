import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, IndianRupee, ShoppingBag, Users, TrendingUp, Minus, Inbox } from "lucide-react";

/* ---------- Helpers ---------- */
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const num = (n) => Number(n || 0).toLocaleString("en-IN");

const tidy = (s) => {
  const t = String(s ?? "").replace(/[_-]+/g, " ").trim().toLowerCase();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
};

const fmtDate = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? String(v) : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const timeAgo = (v) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const STATUS_STYLE = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Created: "bg-amber-50 text-amber-700 border-amber-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  "In progress": "bg-amber-50 text-amber-700 border-amber-200",
  New: "bg-sky-50 text-sky-700 border-sky-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_BAR = {
  Paid: "bg-emerald-500",
  Created: "bg-amber-500",
  Pending: "bg-amber-500",
  Failed: "bg-red-500",
  Refunded: "bg-slate-400",
};

/* ---------- Normalisers: accept a few common API shapes ---------- */
const asArray = (v) => (Array.isArray(v) ? v : []);

function normOrders(list) {
  return asArray(list).map((o, i) => ({
    id: o.orderId || o.orderNumber || o._id || o.id || `order-${i}`,
    student: o.student?.name || o.studentName || o.user?.name || o.student || "—",
    course: o.course?.title || o.courseTitle || o.course?.name || o.course || "—",
    amount: o.amount ?? o.total ?? 0,
    status: tidy(o.status) || "Created",
    date: fmtDate(o.createdAt || o.date),
  }));
}

function normEnquiries(list) {
  return asArray(list).map((e, i) => ({
    id: e._id || e.id || `enq-${i}`,
    name: e.name || "Unknown",
    subject: e.subject || e.message || "Enquiry",
    status: tidy(e.status) || "New",
    date: fmtDate(e.createdAt || e.date),
  }));
}

function normStudents(list) {
  return asArray(list).map((s, i) => ({
    id: s._id || s.id || `stu-${i}`,
    name: s.name || s.email || "Student",
    course: s.course?.title || s.courseTitle || s.course || "",
    joined: s.joined || timeAgo(s.createdAt),
  }));
}

function normStatus(v) {
  const entries = Array.isArray(v)
    ? v.map((x) => [x.status ?? x.label ?? x._id, x.count ?? x.total ?? 0])
    : v && typeof v === "object"
      ? Object.entries(v)
      : [];
  return entries
    .map(([k, c]) => ({ label: tidy(k), count: Number(c) || 0 }))
    .filter((x) => x.label);
}

/* ---------- UI pieces ---------- */
function Pill({ status, children }) {
  const style = STATUS_STYLE[status] ?? "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {children}
    </span>
  );
}

/* Card: header and body each own their padding, so everything lines up on one gutter */
function Card({ title, action, className = "", bodyClassName = "p-5", children }) {
  return (
    <section className={`flex flex-col overflow-hidden rounded-xl border border-line bg-surface ${className}`}>
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-sm font-semibold tracking-tight text-fg">{title}</h2>
        {action}
      </header>
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

function EmptyBlock({ text, loading, className = "py-10" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 px-5 text-center ${className}`}>
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" aria-hidden="true" />
      ) : (
        <Inbox className="h-6 w-6 text-fg-3" aria-hidden="true" />
      )}
      <p className="text-sm text-fg-3">{loading ? "Loading..." : text}</p>
    </div>
  );
}

const viewAll = (to) => (
  <Link to={to} className="text-xs font-medium text-pitch-700 hover:underline underline-offset-4">
    View all
  </Link>
);

function TrendNote({ trend, note }) {
  const color = trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-fg-3";
  return (
    <p className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${color}`}>
      {trend === "neutral" ? (
        <Minus className="h-3.5 w-3.5" />
      ) : (
        <TrendingUp className={`h-3.5 w-3.5 ${trend === "down" ? "rotate-180" : ""}`} />
      )}
      <span>{note}</span>
    </p>
  );
}

function StatCard({ label, value, note, trend, icon: Icon }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-fg-3">{label}</p>
          <p className="mt-2 truncate font-display text-2xl font-bold tracking-tight text-fg">{value}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-gold-400">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {note && <TrendNote trend={trend} note={note} />}
    </section>
  );
}

function Initials({ name }) {
  const text = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
      {text}
    </span>
  );
}

const axisTick = { fill: "#94a3b8", fontSize: 12 };
const tooltipStyle = { borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", fontSize: 12 };

const th = "px-5 py-3 text-xs font-medium text-fg-3 whitespace-nowrap";
const td = "px-5 py-3.5 whitespace-nowrap";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

/* ---------- Page ---------- */
export default function Dashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const adminName = readUser()?.name?.split(" ")[0] || "Admin";

  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    api("/admin/dashboard")
      .then((r) => setDash(r?.data ?? r ?? {}))
      .catch((e) => setError(e?.message || "Could not load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const d = dash || {};
  const orders = useMemo(() => normOrders(d.recentOrders), [d.recentOrders]);
  const enquiries = useMemo(() => normEnquiries(d.recentEnquiries), [d.recentEnquiries]);
  const students = useMemo(() => normStudents(d.newStudents), [d.newStudents]);
  const statusList = useMemo(() => normStatus(d.orderStatus), [d.orderStatus]);
  const revenue = asArray(d.revenueByMonth);
  const byLevel = asArray(d.ordersByLevel);

  const totalOrders = statusList.reduce((s, o) => s + o.count, 0);
  const dash_ = (v, fmt) => (dash && v != null ? fmt(v) : "—");

  const stats = [
    { label: "Total students", value: dash_(d.totalStudents, num), icon: Users },
    {
      label: "Total courses",
      value: dash_(d.totalCourses, num),
      note: d.publishedCourses != null ? `${num(d.publishedCourses)} published` : "",
      trend: "neutral",
      icon: BookOpen,
    },
    { label: "Total revenue", value: dash_(d.totalRevenue, inr), icon: IndianRupee },
    { label: "Orders this month", value: dash_(d.ordersThisMonth, num), icon: ShoppingBag },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">{greeting}, {adminName}</h1>
          <p className="mt-1 text-sm text-fg-3">Here is what is happening across your academy today.</p>
        </div>
        <Link
          to="/admin/orders"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-pitch-700 transition-colors hover:bg-surface-2"
        >
          <ShoppingBag className="h-4 w-4" />
          View all orders
        </Link>
      </div>

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={load} className="self-start rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-red-100 sm:self-auto">
            Try again
          </button>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card title="Revenue by month" className="lg:col-span-7">
          {revenue.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={axisTick} tickLine={false} axisLine={false} padding={{ left: 8, right: 8 }} />
                  <YAxis
                    width={48}
                    tick={axisTick}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v === 0 ? "0" : v >= 1000 ? `₹${v / 1000}k` : `₹${v}`)}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [inr(v), "Revenue"]} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyBlock loading={loading} text="No revenue recorded yet." className="h-72" />
          )}
        </Card>

        <Card title="Orders by level" className="lg:col-span-5">
          {byLevel.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byLevel} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="level" tick={axisTick} tickLine={false} axisLine={false} />
                  <YAxis width={32} tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} formatter={(v) => [v, "Orders"]} />
                  <Bar dataKey="orders" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyBlock loading={loading} text="No orders yet." className="h-72" />
          )}
        </Card>
      </div>

      {/* Orders + status */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card title="Recent orders" action={viewAll("/admin/orders")} className="lg:col-span-7" bodyClassName="p-0">
          {orders.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-2/60">
                  <tr>
                    <th className={th}>Order</th>
                    <th className={th}>Student</th>
                    <th className={th}>Course</th>
                    <th className={`${th} text-right`}>Amount</th>
                    <th className={th}>Status</th>
                    <th className={th}>Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-surface-2/50">
                      <td className={`${td} font-medium text-fg`}>{String(o.id).slice(-8).toUpperCase()}</td>
                      <td className={`${td} text-fg-body`}>{o.student}</td>
                      <td className={`${td} text-fg-body`}>{o.course}</td>
                      <td className={`${td} text-right font-medium tabular-nums text-fg`}>{inr(o.amount)}</td>
                      <td className={td}>
                        <Pill status={o.status}>{o.status}</Pill>
                      </td>
                      <td className={`${td} text-fg-3`}>{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyBlock loading={loading} text="No orders yet. New orders will appear here." />
          )}
        </Card>

        <Card title="Order status" className="lg:col-span-5">
          {totalOrders > 0 ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl font-bold tracking-tight text-fg">{totalOrders}</span>
                <span className="text-sm text-fg-3">orders in total</span>
              </div>

              {/* Stacked overview bar */}
              <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-surface-2">
                {statusList.map((s) => (
                  <div
                    key={s.label}
                    className={STATUS_BAR[s.label] ?? "bg-slate-300"}
                    style={{ width: `${(s.count / totalOrders) * 100}%` }}
                  />
                ))}
              </div>

              <ul className="mt-5 space-y-3">
                {statusList.map((s) => {
                  const pct = Math.round((s.count / totalOrders) * 100);
                  return (
                    <li key={s.label} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2.5 text-fg-body">
                        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_BAR[s.label] ?? "bg-slate-300"}`} />
                        {s.label}
                      </span>
                      <span className="tabular-nums text-fg">
                        <span className="font-medium">{s.count}</span>
                        <span className="ml-2 inline-block w-9 text-right text-xs text-fg-3">{pct}%</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <EmptyBlock loading={loading} text="No orders to summarise yet." />
          )}
        </Card>
      </div>

      {/* Enquiries + new students */}
      <div className="grid gap-4 lg:grid-cols-12">
        <Card title="Recent enquiries" action={viewAll("/admin/enquiries")} className="lg:col-span-7" bodyClassName="p-0">
          {enquiries.length ? (
            <ul className="divide-y divide-line">
              {enquiries.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-fg">{e.subject}</p>
                    <p className="mt-0.5 text-xs text-fg-3">
                      {e.name}{e.date ? ` · ${e.date}` : ""}
                    </p>
                  </div>
                  <Pill status={e.status}>{e.status}</Pill>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBlock loading={loading} text="No enquiries yet." />
          )}
        </Card>

        <Card title="New students" action={viewAll("/admin/students")} className="lg:col-span-5" bodyClassName="p-0">
          {students.length ? (
            <ul className="divide-y divide-line">
              {students.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                  <Initials name={s.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-fg">{s.name}</p>
                    {s.course && <p className="truncate text-xs text-fg-3">{s.course}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-fg-3">{s.joined}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyBlock loading={loading} text="No new students yet." />
          )}
        </Card>
      </div>
    </div>
  );
}