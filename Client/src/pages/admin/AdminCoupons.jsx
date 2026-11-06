import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Mail,
  Plus,
  Search,
  Sparkles,
  Tag,
  Ticket,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../../lib/api.js";

const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
const th = "px-4 py-3 text-xs font-medium text-fg-3 whitespace-nowrap";
const td = "px-4 py-3.5 whitespace-nowrap";

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  courseId: "",
  usageLimit: "",
  perUserLimit: 1,
  expiresAt: "",
  isActive: true,
  notifyStudents: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [copiedId, setCopiedId] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [cpRes, crRes] = await Promise.all([
        api("/coupons"),
        api("/courses/admin/list"),
      ]);
      setCoupons(cpRes.coupons || []);
      setCourses(crRes.courses || []);
    } catch (err) {
      setError(err?.message || "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    return coupons.filter((c) => {
      const q = search.trim().toUpperCase();
      const matchesSearch = !q || c.code.includes(q) || (c.description || "").toUpperCase().includes(q);
      const isExpired = c.expiresAt && new Date() > new Date(c.expiresAt);

      if (statusFilter === "active") return matchesSearch && c.isActive && !isExpired;
      if (statusFilter === "inactive") return matchesSearch && !c.isActive;
      if (statusFilter === "expired") return matchesSearch && isExpired;
      return matchesSearch;
    });
  }, [coupons, search, statusFilter]);

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter((c) => c.isActive && (!c.expiresAt || new Date() <= new Date(c.expiresAt))).length;
    const redemptions = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
    return { total, active, redemptions };
  }, [coupons]);

  function copyCode(code, id) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleToggleStatus(coupon) {
    try {
      const res = await api(`/coupons/${coupon._id}/status`, { method: "PATCH" });
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? res.coupon : c)));
      showToast(res.message);
    } catch (err) {
      setError(err?.message || "Failed to update status.");
    }
  }

  async function handleDelete(coupon) {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) return;
    try {
      await api(`/coupons/${coupon._id}`, { method: "DELETE" });
      setCoupons((prev) => prev.filter((c) => c._id !== coupon._id));
      showToast("Coupon deleted successfully.");
    } catch (err) {
      setError(err?.message || "Failed to delete coupon.");
    }
  }

  function showToast(msg) {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.code.trim()) {
      alert("Please enter a coupon code.");
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      alert("Please enter a valid discount amount.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        courseId: form.courseId || null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        perUserLimit: Number(form.perUserLimit) || 1,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        isActive: form.isActive,
        notifyStudents: form.notifyStudents,
      };

      const res = await api("/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setModalOpen(false);
      setForm(EMPTY_FORM);
      showToast(res.message || "Coupon created successfully!");
      loadData();
    } catch (err) {
      setError(err?.message || "Failed to create coupon.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Coupons & Discounts
          </h1>
          <p className="mt-1 text-sm text-fg-3">
            Create coupon promo codes, manage percentage or flat discounts, and announce them to students.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM);
            setModalOpen(true);
          }}
          className={btnPrimary}
        >
          <Plus className="h-4 w-4" />
          Create coupon
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-pitch-200 bg-pitch-50 p-4 text-sm font-medium text-pitch-800 dark:border-pitch-900/50 dark:bg-pitch-950/40 dark:text-pitch-300">
          <Sparkles className="h-5 w-5 shrink-0 text-pitch-600 dark:text-pitch-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-medium text-danger-800 dark:border-danger-900/50 dark:bg-danger-950/40 dark:text-danger-300">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-danger-600 hover:text-danger-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 text-gold-600 dark:text-gold-400">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-3 uppercase tracking-wider">Total Coupons</p>
              <p className="font-display text-2xl font-black text-fg">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pitch-500/15 text-pitch-600 dark:text-pitch-400">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-3 uppercase tracking-wider">Active Codes</p>
              <p className="font-display text-2xl font-black text-fg">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink-500/15 text-ink-600 dark:text-ink-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-fg-3 uppercase tracking-wider">Total Redemptions</p>
              <p className="font-display text-2xl font-black text-fg">{stats.redemptions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
          <input
            type="text"
            placeholder="Search coupon code..."
            className={`${field} pl-9`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {["all", "active", "inactive", "expired"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                statusFilter === tab
                  ? "bg-gold-400 text-ink-950 font-bold"
                  : "bg-surface text-fg-3 border border-line hover:bg-surface-2"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-xs">
        <div className="overflow-x-auto admin-sidebar-scroll">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="border-b border-line bg-surface-2/60">
              <tr>
                <th className={`${th} pl-5`}>Coupon Code</th>
                <th className={th}>Discount</th>
                <th className={th}>Course</th>
                <th className={th}>Usage / Limit</th>
                <th className={th}>Expiry</th>
                <th className={th}>Status</th>
                <th className={`${th} pr-5 text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-fg-3">
                    Loading coupons...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-fg-3">
                    No coupons found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const isExpired = c.expiresAt && new Date() > new Date(c.expiresAt);
                  const isCopied = copiedId === c._id;
                  return (
                    <tr key={c._id} className="transition-colors hover:bg-surface-2/50">
                      <td className={`${td} pl-5 font-medium`}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold tracking-wider text-fg bg-surface-2 px-2.5 py-1 rounded-md border border-line">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyCode(c.code, c._id)}
                            className="p-1 rounded text-fg-3 hover:text-fg hover:bg-surface-2 transition"
                            title="Copy code"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-pitch-600" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                        {c.description && <p className="text-xs text-fg-3 mt-0.5">{c.description}</p>}
                      </td>
                      <td className={`${td} font-bold text-fg`}>
                        {c.discountType === "percentage" ? (
                          <span>
                            {c.discountValue}% OFF
                            {c.maxDiscount ? (
                              <span className="text-xs font-normal text-fg-3 ml-1">
                                (up to ₹{c.maxDiscount})
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span>₹{c.discountValue} OFF</span>
                        )}
                        {c.minOrderAmount > 0 && (
                          <p className="text-[11px] font-normal text-fg-3">Min order: ₹{c.minOrderAmount}</p>
                        )}
                      </td>
                      <td className={`${td} text-fg-body`}>
                        {c.courseId ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-fg">
                            {c.courseId.title || "Specific Course"}
                          </span>
                        ) : (
                          <span className="text-xs text-fg-3">All Courses</span>
                        )}
                      </td>
                      <td className={`${td} tabular-nums text-fg-body`}>
                        <span className="font-semibold text-fg">{c.usedCount || 0}</span>
                        <span className="text-fg-3"> / {c.usageLimit ? c.usageLimit : "∞"}</span>
                      </td>
                      <td className={`${td} text-xs text-fg-3`}>
                        {c.expiresAt ? (
                          <span className={isExpired ? "text-danger-600 font-semibold" : ""}>
                            {new Date(c.expiresAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {isExpired && " (Expired)"}
                          </span>
                        ) : (
                          "Never"
                        )}
                      </td>
                      <td className={td}>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition ${
                            !c.isActive
                              ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-900/40 dark:text-slate-400"
                              : isExpired
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                          }`}
                        >
                          {!c.isActive ? "Inactive" : isExpired ? "Expired" : "Active"}
                        </button>
                      </td>
                      <td className={`${td} pr-5 text-right`}>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-fg-3 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/30 transition"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-surface p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto admin-sidebar-scroll">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="font-display text-xl font-bold text-fg">Create New Coupon</h2>
                <p className="text-xs text-fg-3">Configure discount rate and student notifications.</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-fg-3 hover:bg-surface-2 hover:text-fg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-fg mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER50 or GOLD20"
                  className={`${field} font-mono uppercase`}
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg mb-1">Description (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Summer special training discount"
                  className={field}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">Discount Type</label>
                  <select
                    className={field}
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  >
                    <option value="percentage">Percentage (% off)</option>
                    <option value="fixed">Flat Amount (₹ off)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">
                    {form.discountType === "percentage" ? "Discount Percentage (%) *" : "Discount Amount (₹) *"}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={form.discountType === "percentage" ? "100" : undefined}
                    placeholder={form.discountType === "percentage" ? "20" : "500"}
                    className={field}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (Any order)"
                    className={field}
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">Max Discount Cap (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional ceiling (e.g. 1000)"
                    disabled={form.discountType === "fixed"}
                    className={`${field} disabled:opacity-40`}
                    value={form.maxDiscount}
                    onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-fg mb-1">Applicable Course</label>
                <select
                  className={field}
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                >
                  <option value="">All Published Courses</option>
                  {courses.map((c) => (
                    <option key={c._id || c.id} value={c._id || c.id}>
                      {c.title} (₹{c.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">Total Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    className={field}
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-fg mb-1">Expiry Date</label>
                  <input
                    type="date"
                    className={field}
                    value={form.expiresAt}
                    onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  />
                </div>
              </div>

              {/* Email announcement checkbox */}
              <div className="rounded-2xl border border-gold-300/60 bg-gold-50/50 p-4 dark:border-gold-500/20 dark:bg-gold-500/5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-line text-gold-500 focus:ring-gold-400"
                    checked={form.notifyStudents}
                    onChange={(e) => setForm({ ...form, notifyStudents: e.target.checked })}
                  />
                  <div>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-fg">
                      <Mail className="h-4 w-4 text-gold-600 dark:text-gold-400" />
                      Email this coupon to all registered students
                    </span>
                    <p className="text-[11px] text-fg-3 mt-0.5 leading-relaxed">
                      Sends an announcement email with the code, savings, and direct enrollment button to all active students in the background.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={btnGhost}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={btnPrimary}
                >
                  {saving ? "Creating..." : "Create & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

