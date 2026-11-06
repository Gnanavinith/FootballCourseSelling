import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  Filter,
  Inbox,
  Mail,
  Moon,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Sliders,
  Smartphone,
  Sun,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api } from "../../lib/api.js";

/* ---------- Constants & Styles ---------- */
const IST = "Asia/Kolkata";
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: IST,
      })
    : "—";

const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: IST,
      }) + " IST"
    : "—";

const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fg-3 transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400";
const th = "px-4 py-3 text-xs font-medium text-fg-3 whitespace-nowrap";
const td = "px-4 py-3 text-sm";

const STATUS_PILLS = {
  queued: "bg-amber-50 text-amber-700 border-amber-200",
  sending: "bg-blue-50 text-blue-700 border-blue-200",
  sent: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  bounced: "bg-purple-50 text-purple-700 border-purple-200",
};

const CATEGORIES = [
  "AUTH",
  "PAYMENTS",
  "COURSE ACCESS",
  "ENQUIRIES AND BOOKINGS",
  "ADMIN AND SYSTEM",
  "ANNOUNCEMENTS",
];

export default function AdminEmails() {
  const [tab, setTab] = useState("overview"); // overview | templates | outbox | compose | settings
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("info"); // info | success | error

  const showToast = (msg, type = "info") => {
    setToast(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Email System</h1>
          <p className="mt-1 text-sm text-fg-3">
            Manage transactional email templates, inspect the delivery queue, broadcast announcements, and monitor SMTP health.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-line pb-px" role="tablist">
        {[
          { id: "overview", label: "Overview", icon: Sliders },
          { id: "templates", label: "Templates", icon: Edit2 },
          { id: "outbox", label: "Outbox & Logs", icon: Inbox },
          { id: "compose", label: "Compose Broadcast", icon: Send },
          { id: "settings", label: "Settings & SMTP", icon: Mail },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex shrink-0 items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              tab === id
                ? "border-gold-400 bg-surface text-fg font-semibold shadow-sm"
                : "border-transparent text-fg-3 hover:border-line hover:text-fg"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {tab === "overview" && <TabOverview onNavigateTab={setTab} showToast={showToast} />}
      {tab === "templates" && <TabTemplates showToast={showToast} />}
      {tab === "outbox" && <TabOutbox showToast={showToast} />}
      {tab === "compose" && <TabCompose showToast={showToast} />}
      {tab === "settings" && <TabSettings showToast={showToast} />}

      {/* Toast popup */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 left-1/2 z-[100] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2"
      >
        {toast && (
          <div
            className={`rounded-lg px-4 py-2.5 text-sm font-medium shadow-xl transition-all ${
              toastType === "error"
                ? "bg-red-600 text-white"
                : toastType === "success"
                ? "bg-emerald-600 text-white"
                : "bg-ink-950 text-white dark:bg-white dark:text-ink-950"
            }`}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   1. OVERVIEW TAB
   ========================================================================= */
function TabOverview({ onNavigateTab, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api("/admin/emails/overview");
      setData(res.data);
    } catch (err) {
      showToast(err.message || "Failed to load email overview", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRetry = async (logId) => {
    try {
      setRetryingId(logId);
      await api(`/admin/emails/logs/${logId}/retry`, { method: "POST" });
      showToast("Email re-queued successfully", "success");
      await load();
    } catch (err) {
      showToast(err.message || "Retry failed", "error");
    } finally {
      setRetryingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl border border-line bg-surface" />
        ))}
      </div>
    );
  }

  const { sentToday = 0, queued = 0, failed = 0, optedOut = 0, recentFailures = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-fg-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Sent Today</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-fg">{sentToday}</div>
          <p className="mt-1 text-xs text-fg-3">Delivered successfully since 00:00 IST</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-fg-3">
            <span className="text-xs font-semibold uppercase tracking-wider">In Queue</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-fg">{queued}</div>
          <p className="mt-1 text-xs text-fg-3">Processed every minute by the background worker</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-fg-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Failed</span>
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-red-600">{failed}</div>
          <p className="mt-1 text-xs text-fg-3">Emails that exceeded 4 retry attempts</p>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 shadow-xs">
          <div className="flex items-center justify-between text-fg-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Unsubscribed</span>
            <Users className="h-5 w-5 text-purple-500" />
          </div>
          <div className="mt-3 text-3xl font-bold tracking-tight text-fg">{optedOut}</div>
          <p className="mt-1 text-xs text-fg-3">Students who opted out from broadcasts</p>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => onNavigateTab("compose")} className={btnPrimary}>
          <Send className="h-4 w-4" /> Send Announcement
        </button>
        <button type="button" onClick={() => onNavigateTab("outbox")} className={btnGhost}>
          <Inbox className="h-4 w-4" /> View Outbox
        </button>
        <button type="button" onClick={() => onNavigateTab("settings")} className={btnGhost}>
          <Sliders className="h-4 w-4" /> Verify SMTP Server
        </button>
        <button type="button" onClick={load} className={`${btnGhost} ml-auto`} title="Refresh stats">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Recent Failures List */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-surface-2/40">
          <div>
            <h2 className="font-display text-sm font-semibold text-fg">Recent Failed Emails</h2>
            <p className="text-xs text-fg-3">Latest emails requiring attention or re-sending</p>
          </div>
          {failed > 0 && (
            <button
              type="button"
              onClick={() => onNavigateTab("outbox")}
              className="text-xs font-semibold text-gold-400 hover:underline flex items-center gap-1"
            >
              See all in Outbox <ArrowRight className="h-3 w-3" />
            </button>
          )}
        </div>

        {recentFailures.length === 0 ? (
          <div className="p-8 text-center text-sm text-fg-3">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-500/80 mb-2" />
            No delivery failures. The queue is healthy!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className={th}>To</th>
                  <th className={th}>Template</th>
                  <th className={th}>Subject</th>
                  <th className={th}>Error</th>
                  <th className={th}>Failed At</th>
                  <th className={`${th} text-right pr-5`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentFailures.map((log) => (
                  <tr key={log._id} className="hover:bg-surface-2/40">
                    <td className={td}>
                      <span className="font-medium text-fg">{log.to}</span>
                    </td>
                    <td className={td}>
                      <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-mono">{log.templateKey}</span>
                    </td>
                    <td className={`${td} max-w-xs truncate text-fg-2`}>{log.subject}</td>
                    <td className={`${td} max-w-xs truncate text-xs text-red-600`}>{log.error || "Delivery failed"}</td>
                    <td className={`${td} text-xs text-fg-3`}>{fmtDateTime(log.updatedAt || log.createdAt)}</td>
                    <td className={`${td} text-right pr-5`}>
                      <button
                        type="button"
                        disabled={retryingId === log._id}
                        onClick={() => handleRetry(log._id)}
                        className={`${btnGhost} !px-2.5 !py-1 text-xs`}
                      >
                        {retryingId === log._id ? "Re-queueing..." : "Retry"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   2. TEMPLATES TAB & DRAWER
   ========================================================================= */
function TabTemplates({ showToast }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [editingKey, setEditingKey] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api("/admin/emails/templates");
      setTemplates(res.data || []);
    } catch (err) {
      showToast(err.message || "Failed to load templates", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return templates.filter((t) => {
      const matchCat = selectedCategory === "ALL" || t.category === selectedCategory;
      const matchSearch =
        !q ||
        t.name?.toLowerCase().includes(q) ||
        t.key?.toLowerCase().includes(q) ||
        t.subject?.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [templates, search, selectedCategory]);

  return (
    <div className="space-y-5">
      {/* Search & Category filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
          <input
            type="search"
            className={`${field} pl-9`}
            placeholder="Search templates by name, key, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              selectedCategory === "ALL" ? "bg-gold-400 text-ink-950 font-bold" : "bg-surface-2 text-fg-3 hover:text-fg"
            }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                selectedCategory === cat ? "bg-gold-400 text-ink-950 font-bold" : "bg-surface-2 text-fg-3 hover:text-fg"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of templates */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-xl border border-line bg-surface" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-line bg-surface p-12 text-center text-fg-3">
          No templates match your search.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <div
              key={t.key}
              className="flex flex-col justify-between rounded-xl border border-line bg-surface p-5 shadow-xs transition hover:border-gold-400/60"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-fg-3">
                    {t.category}
                  </span>
                  {t.isCustomized ? (
                    <span className="text-[11px] font-medium text-gold-500 bg-gold-400/10 px-2 py-0.5 rounded">
                      DB Override
                    </span>
                  ) : (
                    <span className="text-[11px] text-fg-3 bg-surface-2 px-2 py-0.5 rounded">Default Code</span>
                  )}
                </div>

                <h3 className="mt-3 font-display text-base font-bold text-fg leading-tight">{t.name}</h3>
                <p className="mt-0.5 font-mono text-xs text-fg-3 truncate">{t.key}</p>

                <p className="mt-3 text-xs text-fg-2 line-clamp-2 bg-surface-2/40 p-2 rounded-lg border border-line">
                  <span className="font-semibold text-fg-3">Subject: </span>
                  {t.subject}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    t.enabled !== false ? "text-emerald-600" : "text-fg-3"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${t.enabled !== false ? "bg-emerald-500" : "bg-fg-3/50"}`}
                  />
                  {t.enabled !== false ? "Enabled" : "Disabled"}
                </span>

                <button
                  type="button"
                  onClick={() => setEditingKey(t.key)}
                  className={`${btnGhost} !px-3 !py-1.5 text-xs font-semibold`}
                >
                  <Edit2 className="h-3.5 w-3.5" /> Customize
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Edit Drawer */}
      {editingKey && (
        <TemplateEditDrawer
          templateKey={editingKey}
          onClose={() => setEditingKey(null)}
          onSaved={() => {
            load();
            setEditingKey(null);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

/* ---------- Template Edit Drawer with Live Preview & Block Editor ---------- */
function TemplateEditDrawer({ templateKey, onClose, onSaved, showToast }) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // Editor states
  const [subject, setSubject] = useState("");
  const [preheader, setPreheader] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [enabled, setEnabled] = useState(true);

  // Preview options
  const [previewDevice, setPreviewDevice] = useState("desktop"); // desktop | mobile
  const [previewTheme, setPreviewTheme] = useState("light"); // light | dark
  const [previewHtml, setPreviewHtml] = useState("");

  // Load template details
  useEffect(() => {
    let cancelled = false;
    async function fetchDetails() {
      try {
        setLoading(true);
        const res = await api(`/admin/emails/templates/${templateKey}`);
        if (cancelled) return;
        const t = res.data;
        setTemplate(t);
        setSubject(t.subject || "");
        setPreheader(t.preheader || "");
        setBlocks(Array.isArray(t.blocks) ? JSON.parse(JSON.stringify(t.blocks)) : []);
        setEnabled(t.enabled !== false);
      } catch (err) {
        if (!cancelled) showToast(err.message || "Failed to load template", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchDetails();
    return () => {
      cancelled = true;
    };
  }, [templateKey]);

  // Update live preview whenever subject, preheader or blocks change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!template) return;
      try {
        const res = await api(`/admin/emails/templates/${templateKey}/preview`, {
          method: "POST",
          body: {
            subject,
            preheader,
            blocks,
            data: template.sampleData || {},
          },
        });
        if (!cancelled) setPreviewHtml(res.data?.html || "");
      } catch (err) {
        console.error("Preview error:", err);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [subject, preheader, blocks, template, templateKey]);

  // Block manipulation
  const addBlock = (type) => {
    const newBlock = { type };
    if (type === "heading") newBlock.text = "New Heading";
    else if (type === "paragraph") newBlock.text = "Write your paragraph text here...";
    else if (type === "button") {
      newBlock.label = "Take Action";
      newBlock.url = "https://";
    } else if (type === "note") newBlock.text = "Important note or announcement...";
    else if (type === "details") {
      newBlock.items = [{ label: "Detail Item", value: "Value here" }];
    }
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (idx) => {
    setBlocks(blocks.filter((_, i) => i !== idx));
  };

  const updateBlock = (idx, patch) => {
    setBlocks(blocks.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  };

  const moveBlock = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;
    const next = [...blocks];
    const [moved] = next.splice(idx, 1);
    next.splice(targetIdx, 0, moved);
    setBlocks(next);
  };

  // Save handler
  const handleSave = async () => {
    try {
      setSaving(true);
      await api(`/admin/emails/templates/${templateKey}`, {
        method: "PUT",
        body: { subject, preheader, blocks, enabled },
      });
      showToast("Template customized and saved successfully", "success");
      onSaved();
    } catch (err) {
      showToast(err.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to revert to the default template code? Custom changes will be deleted.")) {
      return;
    }
    try {
      setResetting(true);
      await api(`/admin/emails/templates/${templateKey}`, { method: "DELETE" });
      showToast("Reverted to code default", "success");
      onSaved();
    } catch (err) {
      showToast(err.message || "Reset failed", "error");
    } finally {
      setResetting(false);
    }
  };

  // Send test email
  const handleSendTest = async () => {
    try {
      setTesting(true);
      await api(`/admin/emails/templates/${templateKey}/test`, {
        method: "POST",
        body: { to: testEmail || undefined },
      });
      showToast(`Test email queued for ${testEmail || "admin email"}`, "success");
    } catch (err) {
      showToast(err.message || "Test email failed", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-6xl flex-col bg-surface shadow-2xl">
        {/* Drawer Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-bold text-fg truncate">
              {template ? template.name : "Edit Template"}
            </h2>
            <p className="text-xs text-fg-3 font-mono">{templateKey}</p>
          </div>
          <div className="flex items-center gap-2">
            {template?.isCustomized && (
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting || saving}
                className={`${btnGhost} text-xs text-red-600 hover:bg-red-50`}
              >
                <RotateCcw className="h-3.5 w-3.5" /> Revert to Default
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || resetting}
              className={`${btnPrimary} text-xs`}
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
            <button type="button" onClick={onClose} className={iconBtn} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body (Two Columns: Editor Left, Live Preview Right) */}
        {loading ? (
          <div className="flex-1 p-8 text-center text-fg-3">Loading template details...</div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">
            {/* Left: Settings & Block Editor */}
            <div className="flex flex-col overflow-y-auto border-r border-line p-6 space-y-5">
              {/* Enable Switch */}
              <div className="flex items-center justify-between rounded-lg border border-line bg-surface-2/40 p-3">
                <div>
                  <span className="text-sm font-semibold text-fg">Enable this email</span>
                  <p className="text-xs text-fg-3">If disabled, the application will not dispatch this email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-5 w-5 rounded accent-gold-400"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-semibold text-fg mb-1">Subject Line</label>
                <input
                  type="text"
                  className={field}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject line..."
                />
              </div>

              {/* Preheader */}
              <div>
                <label className="block text-xs font-semibold text-fg mb-1">
                  Preheader Text <span className="text-fg-3 font-normal">(Snippet visible in mailbox list)</span>
                </label>
                <input
                  type="text"
                  className={field}
                  value={preheader}
                  onChange={(e) => setPreheader(e.target.value)}
                  placeholder="Preview snippet..."
                />
              </div>

              {/* Required Variables Notice */}
              {template?.requiredVariables && template.requiredVariables.length > 0 && (
                <div className="rounded-lg border border-line bg-surface-2/30 p-3">
                  <span className="text-xs font-semibold text-fg-3">Required Variables (must be present in template):</span>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {template.requiredVariables.map((v) => {
                      const exists =
                        subject.includes(`{{${v}}}`) ||
                        preheader.includes(`{{${v}}}`) ||
                        blocks.some(
                          (b) =>
                            (b.text && b.text.includes(`{{${v}}}`)) ||
                            (b.url && b.url.includes(`{{${v}}}`)) ||
                            (b.label && b.label.includes(`{{${v}}}`)) ||
                            (b.items && b.items.some((it) => it.value && it.value.includes(`{{${v}}}`)))
                        );
                      return (
                        <span
                          key={v}
                          className={`rounded px-2 py-0.5 font-mono text-xs ${
                            exists
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {"{{" + v + "}}"} {exists ? "✓" : "✗ missing"}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Block Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-fg">Email Body Blocks</h3>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => addBlock("paragraph")}
                      className={`${btnGhost} !px-2.5 !py-1 text-xs`}
                    >
                      <Plus className="h-3 w-3" /> Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("button")}
                      className={`${btnGhost} !px-2.5 !py-1 text-xs`}
                    >
                      <Plus className="h-3 w-3" /> Button
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("note")}
                      className={`${btnGhost} !px-2.5 !py-1 text-xs`}
                    >
                      <Plus className="h-3 w-3" /> Note
                    </button>
                    <button
                      type="button"
                      onClick={() => addBlock("divider")}
                      className={`${btnGhost} !px-2.5 !py-1 text-xs`}
                    >
                      <Plus className="h-3 w-3" /> Divider
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {blocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-line bg-surface p-3.5 space-y-2 shadow-2xs relative group"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-line text-xs">
                        <span className="font-semibold uppercase tracking-wider text-fg-3">{block.type}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveBlock(idx, -1)}
                            className="text-fg-3 hover:text-fg disabled:opacity-30 p-1"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            disabled={idx === blocks.length - 1}
                            onClick={() => moveBlock(idx, 1)}
                            className="text-fg-3 hover:text-fg disabled:opacity-30 p-1"
                            title="Move down"
                          >
                            ↓
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(idx)}
                            className="text-red-500 hover:text-red-700 p-1 ml-2"
                            title="Remove block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {block.type === "heading" && (
                        <input
                          type="text"
                          className={field}
                          value={block.text || ""}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                          placeholder="Heading text..."
                        />
                      )}

                      {block.type === "paragraph" && (
                        <textarea
                          rows={3}
                          className={field}
                          value={block.text || ""}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                          placeholder="Paragraph text..."
                        />
                      )}

                      {block.type === "note" && (
                        <textarea
                          rows={2}
                          className={field}
                          value={block.text || ""}
                          onChange={(e) => updateBlock(idx, { text: e.target.value })}
                          placeholder="Note text..."
                        />
                      )}

                      {block.type === "button" && (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            className={field}
                            value={block.label || ""}
                            onChange={(e) => updateBlock(idx, { label: e.target.value })}
                            placeholder="Button label..."
                          />
                          <input
                            type="text"
                            className={field}
                            value={block.url || ""}
                            onChange={(e) => updateBlock(idx, { url: e.target.value })}
                            placeholder="https://..."
                          />
                        </div>
                      )}

                      {block.type === "details" && (
                        <div className="space-y-2">
                          {(block.items || []).map((it, itemIdx) => (
                            <div key={itemIdx} className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                className={field}
                                value={it.label || ""}
                                onChange={(e) => {
                                  const nextItems = [...block.items];
                                  nextItems[itemIdx] = { ...it, label: e.target.value };
                                  updateBlock(idx, { items: nextItems });
                                }}
                                placeholder="Label"
                              />
                              <input
                                type="text"
                                className={field}
                                value={it.value || ""}
                                onChange={(e) => {
                                  const nextItems = [...block.items];
                                  nextItems[itemIdx] = { ...it, value: e.target.value };
                                  updateBlock(idx, { items: nextItems });
                                }}
                                placeholder="Value (or {{variable}})"
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {block.type === "divider" && (
                        <p className="text-xs text-fg-3 italic">Visual divider line</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Send Test Section */}
              <div className="border-t border-line pt-4 space-y-2">
                <span className="text-xs font-semibold text-fg">Send Live Test Email</span>
                <div className="flex gap-2">
                  <input
                    type="email"
                    className={field}
                    placeholder="Recipient email (defaults to admin)"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={testing}
                    className={`${btnGhost} whitespace-nowrap`}
                  >
                    {testing ? "Sending..." : "Send Test"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Live Preview */}
            <div className="flex flex-col bg-surface-2/40 overflow-hidden">
              {/* Preview Controls Bar */}
              <div className="flex items-center justify-between border-b border-line px-5 py-2.5 bg-surface">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`rounded p-1.5 transition ${
                      previewDevice === "desktop" ? "bg-gold-400 text-ink-950" : "text-fg-3 hover:text-fg"
                    }`}
                    title="Desktop Preview"
                  >
                    <Sliders className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`rounded p-1.5 transition ${
                      previewDevice === "mobile" ? "bg-gold-400 text-ink-950" : "text-fg-3 hover:text-fg"
                    }`}
                    title="Mobile Viewport (375px)"
                  >
                    <Smartphone className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-fg-3 font-medium">Dark Mode Preview:</span>
                  <button
                    type="button"
                    onClick={() => setPreviewTheme(previewTheme === "light" ? "dark" : "light")}
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface text-fg-3 hover:text-fg"
                  >
                    {previewTheme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Preview Canvas */}
              <div className="flex-1 overflow-y-auto p-4 flex justify-center items-start">
                <div
                  className={`transition-all duration-300 rounded-lg shadow-xl overflow-hidden border border-line ${
                    previewDevice === "mobile" ? "w-[375px]" : "w-full max-w-[650px]"
                  } ${previewTheme === "dark" ? "bg-[#141413]" : "bg-white"}`}
                >
                  <iframe
                    title="Email Preview"
                    srcDoc={previewHtml}
                    className="w-full min-h-[550px] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   3. OUTBOX & LOGS TAB
   ========================================================================= */
function TabOutbox({ showToast }) {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState("all");
  const [templateKey, setTemplateKey] = useState("all");
  const [search, setSearch] = useState("");
  const [retryingAll, setRetryingAll] = useState(false);
  const [activeLog, setActiveLog] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        status,
        templateKey,
        search,
      });
      const res = await api(`/admin/emails/logs?${params.toString()}`);
      setLogs(res.data?.logs || []);
      setTotal(res.data?.total || 0);
      setTotalPages(res.data?.totalPages || 1);
    } catch (err) {
      showToast(err.message || "Failed to load logs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status, templateKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const handleRetryAll = async () => {
    if (!window.confirm("Retry delivery for all currently failed emails?")) return;
    try {
      setRetryingAll(true);
      const res = await api("/admin/emails/logs/retry-failed", { method: "POST" });
      showToast(res.message || "Re-queued failed emails", "success");
      load();
    } catch (err) {
      showToast(err.message || "Retry all failed", "error");
    } finally {
      setRetryingAll(false);
    }
  };

  const handleRetrySingle = async (logId) => {
    try {
      await api(`/admin/emails/logs/${logId}/retry`, { method: "POST" });
      showToast("Email re-queued for delivery", "success");
      load();
      if (activeLog && activeLog._id === logId) {
        setActiveLog((prev) => ({ ...prev, status: "queued", attempts: 0 }));
      }
    } catch (err) {
      showToast(err.message || "Retry failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action / Filter bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" />
          <input
            type="search"
            className={`${field} pl-9`}
            placeholder="Search email recipient, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className={`${field} !w-auto`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="queued">Queued</option>
            <option value="sending">Sending</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
            <option value="bounced">Bounced</option>
          </select>

          <button
            type="button"
            onClick={handleRetryAll}
            disabled={retryingAll}
            className={`${btnGhost} text-xs font-semibold`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {retryingAll ? "Re-queueing..." : "Retry All Failed"}
          </button>

          <button
            type="button"
            onClick={load}
            className={`${btnGhost} !px-2.5`}
            title="Refresh logs"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Outbox Table */}
      <div className="rounded-xl border border-line bg-surface overflow-hidden shadow-xs">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-fg-3">Loading delivery logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-fg-3">No email logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-2/60">
                <tr>
                  <th className={th}>Status</th>
                  <th className={th}>Recipient</th>
                  <th className={th}>Template</th>
                  <th className={th}>Subject</th>
                  <th className={th}>Attempts</th>
                  <th className={th}>Created / Sent</th>
                  <th className={`${th} text-right pr-5`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    onClick={() => setActiveLog(log)}
                    className="cursor-pointer hover:bg-surface-2/50 transition-colors"
                  >
                    <td className={td}>
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${
                          STATUS_PILLS[log.status] || "bg-surface-2 text-fg-3"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="font-medium text-fg">{log.to}</div>
                      {log.toName && <div className="text-xs text-fg-3">{log.toName}</div>}
                    </td>
                    <td className={td}>
                      <span className="font-mono text-xs rounded bg-surface-2 px-1.5 py-0.5">{log.templateKey}</span>
                    </td>
                    <td className={`${td} max-w-xs truncate text-fg-2`}>{log.subject}</td>
                    <td className={`${td} text-xs tabular-nums text-fg-3`}>{log.attempts || 0} / 4</td>
                    <td className={`${td} text-xs text-fg-3 whitespace-nowrap`}>
                      {log.sentAt ? fmtDateTime(log.sentAt) : fmtDateTime(log.createdAt)}
                    </td>
                    <td className={`${td} text-right pr-5`} onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setActiveLog(log)}
                          className={`${btnGhost} !px-2.5 !py-1 text-xs`}
                        >
                          View
                        </button>
                        {log.status === "failed" && (
                          <button
                            type="button"
                            onClick={() => handleRetrySingle(log._id)}
                            className={`${btnPrimary} !px-2.5 !py-1 text-xs`}
                          >
                            Retry
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-fg-3">
            <span>
              Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} emails
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={`${btnGhost} !px-3 !py-1`}
              >
                Previous
              </button>
              <span className="self-center px-2">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className={`${btnGhost} !px-3 !py-1`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Detail Drawer */}
      {activeLog && (
        <LogDetailDrawer
          log={activeLog}
          onClose={() => setActiveLog(null)}
          onRetry={() => handleRetrySingle(activeLog._id)}
        />
      )}
    </div>
  );
}

/* ---------- Log Detail Drawer ---------- */
function LogDetailDrawer({ log, onClose, onRetry }) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
          <div>
            <h2 className="font-display text-base font-bold text-fg">Email Delivery Details</h2>
            <p className="text-xs text-fg-3 font-mono">{log._id}</p>
          </div>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Status summary */}
          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-surface-2/40 p-4 text-xs">
            <div>
              <span className="text-fg-3 block">Status</span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 mt-1 font-semibold uppercase ${
                  STATUS_PILLS[log.status] || "bg-surface-2"
                }`}
              >
                {log.status}
              </span>
            </div>
            <div>
              <span className="text-fg-3 block">Attempts</span>
              <span className="font-medium text-fg mt-1 block">{log.attempts || 0} / 4</span>
            </div>
            <div>
              <span className="text-fg-3 block">Recipient</span>
              <span className="font-medium text-fg mt-1 block">{log.to}</span>
            </div>
            <div>
              <span className="text-fg-3 block">Template Key</span>
              <span className="font-mono text-fg mt-1 block">{log.templateKey}</span>
            </div>
            <div className="col-span-2">
              <span className="text-fg-3 block">Dedupe Key</span>
              <span className="font-mono text-fg mt-1 block">{log.dedupeKey || "None"}</span>
            </div>
            {log.providerMessageId && (
              <div className="col-span-2">
                <span className="text-fg-3 block">SMTP Message ID</span>
                <span className="font-mono text-xs text-fg-3 mt-1 block break-all">{log.providerMessageId}</span>
              </div>
            )}
            {log.error && (
              <div className="col-span-2 rounded-lg bg-red-50 p-3 text-red-700">
                <span className="font-bold block">Error details:</span>
                <span className="font-mono text-xs mt-1 block break-all">{log.error}</span>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end">
            <button type="button" onClick={onRetry} className={btnPrimary}>
              <RotateCcw className="h-4 w-4" /> Re-queue / Resend Email
            </button>
          </div>

          {/* Subject & Rendered preview */}
          <div>
            <h3 className="font-display text-sm font-semibold text-fg mb-1">Subject</h3>
            <p className="rounded-lg border border-line bg-surface p-3 text-sm text-fg font-medium">
              {log.subject}
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-fg mb-2">Rendered Message</h3>
            <div className="rounded-lg border border-line bg-white p-2 shadow-inner">
              {log.html ? (
                <iframe
                  title="Sent HTML"
                  srcDoc={log.html}
                  className="w-full min-h-[400px] border-0"
                  sandbox="allow-same-origin"
                />
              ) : (
                <pre className="p-4 text-xs font-mono text-ink-950 whitespace-pre-wrap">{log.text || "No content"}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   4. COMPOSE BROADCAST TAB
   ========================================================================= */
function TabCompose({ showToast }) {
  const [audience, setAudience] = useState("all"); // all | course | week | selected
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [weekNumber, setWeekNumber] = useState(1);
  const [studentEmails, setStudentEmails] = useState("");

  const [recipientCount, setRecipientCount] = useState(0);
  const [counting, setCounting] = useState(false);

  // Form fields
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [actionLabel, setActionLabel] = useState("Visit Academy");
  const [actionUrl, setActionUrl] = useState("https://vanakkamsoccer.com/my-courses");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Load courses for course filter
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await api("/courses");
        const list = Array.isArray(res.data) ? res.data : [];
        setCourses(list);
        if (list.length > 0) setSelectedCourse(list[0]._id);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    }
    fetchCourses();
  }, []);

  // Update live recipient count
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        setCounting(true);
        const res = await api("/admin/emails/broadcast/count", {
          method: "POST",
          body: {
            audience,
            courseId: selectedCourse,
            weekNumber: Number(weekNumber),
          },
        });
        if (!cancelled) {
          setRecipientCount(res.data?.count || 0);
        }
      } catch (err) {
        console.error("Count error:", err);
      } finally {
        if (!cancelled) setCounting(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [audience, selectedCourse, weekNumber]);

  const handleSendBroadcast = async () => {
    try {
      setSending(true);
      await api("/admin/emails/broadcast", {
        method: "POST",
        body: {
          audience,
          courseId: selectedCourse,
          weekNumber: Number(weekNumber),
          subject,
          body,
          actionLabel,
          actionUrl,
        },
      });
      showToast(`Broadcast queued in batches of 50 for ${recipientCount} recipients`, "success");
      setConfirmOpen(false);
      setSubject("");
      setBody("");
    } catch (err) {
      showToast(err.message || "Broadcast failed", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-5">
        <div>
          <h2 className="font-display text-lg font-bold text-fg">Compose Announcement / Broadcast</h2>
          <p className="text-xs text-fg-3">
            Broadcast messages will automatically include one-click unsubscribe links and headers, and will omit opted-out students.
          </p>
        </div>

        {/* Audience Selector */}
        <div className="rounded-xl border border-line bg-surface-2/30 p-4 space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-fg-3">
            Target Audience
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "all", label: "All Active Students" },
              { id: "course", label: "Students in Course" },
              { id: "week", label: "Students in Specific Week" },
            ].map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 text-sm transition ${
                  audience === opt.id
                    ? "border-gold-400 bg-surface shadow-xs font-semibold text-fg"
                    : "border-line bg-surface/50 text-fg-3 hover:text-fg"
                }`}
              >
                <input
                  type="radio"
                  name="audience"
                  value={opt.id}
                  checked={audience === opt.id}
                  onChange={(e) => setAudience(e.target.value)}
                  className="accent-gold-400"
                />
                {opt.label}
              </label>
            ))}
          </div>

          {/* Conditional filters */}
          {(audience === "course" || audience === "week") && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-fg-3 mb-1">Select Course</label>
                <select
                  className={field}
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {audience === "week" && (
                <div>
                  <label className="block text-xs font-medium text-fg-3 mb-1">Current Week Number</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    className={field}
                    value={weekNumber}
                    onChange={(e) => setWeekNumber(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* Recipient Count Pill */}
          <div className="flex items-center gap-2 pt-1 text-xs text-fg-3">
            <span className="font-semibold text-fg">Eligible Recipients:</span>
            <span className="rounded-full bg-gold-400/20 px-2.5 py-0.5 font-bold text-gold-500">
              {counting ? "Calculating…" : `${recipientCount} students`}
            </span>
            <span className="text-fg-3/70">(opted-out users automatically excluded)</span>
          </div>
        </div>

        {/* Email Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Announcement Subject *</label>
            <input
              type="text"
              required
              className={field}
              placeholder="e.g. Important training update for this weekend"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Message Body *</label>
            <textarea
              rows={6}
              required
              className={field}
              placeholder="Write your announcement message here..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-fg mb-1">Action Button Label</label>
              <input
                type="text"
                className={field}
                placeholder="e.g. Start Practice"
                value={actionLabel}
                onChange={(e) => setActionLabel(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-fg mb-1">Action Button URL</label>
              <input
                type="url"
                className={field}
                placeholder="https://..."
                value={actionUrl}
                onChange={(e) => setActionUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-3 border-t border-line">
          <button
            type="button"
            disabled={!subject.trim() || !body.trim() || recipientCount === 0}
            onClick={() => setConfirmOpen(true)}
            className={btnPrimary}
          >
            <Send className="h-4 w-4" /> Review & Send Broadcast
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/60" onClick={() => setConfirmOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl space-y-4">
            <h3 className="font-display text-lg font-bold text-fg">Confirm Broadcast Dispatch</h3>
            <p className="text-sm text-fg-2 leading-relaxed">
              You are about to dispatch this announcement to <strong>{recipientCount}</strong> students. Delivery will proceed in the background in batches of 50 with rate pauses.
            </p>
            <div className="rounded-lg bg-surface-2 p-3 text-xs space-y-1">
              <div>
                <strong>Subject:</strong> {subject}
              </div>
              <div>
                <strong>Audience:</strong> {audience}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={sending}
                className={btnGhost}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={sending}
                className={btnPrimary}
              >
                {sending ? "Queuing Broadcast..." : "Yes, Dispatch Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   5. SETTINGS & SMTP TAB
   ========================================================================= */
function TabSettings({ showToast }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState(null);

  // Form state
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [adminRecipients, setAdminRecipients] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [footerAddress, setFooterAddress] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [digestHourIST, setDigestHourIST] = useState(8);
  const [dailyLimit, setDailyLimit] = useState(500);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api("/admin/emails/settings");
      const s = res.data || {};
      setSettings(s);
      setFromName(s.fromName || "");
      setFromEmail(s.fromEmail || "");
      setReplyTo(s.replyTo || "");
      setAdminRecipients(Array.isArray(s.adminRecipients) ? s.adminRecipients.join(", ") : "");
      setLogoUrl(s.logoUrl || "");
      setFooterAddress(s.footerAddress || "");
      setSupportEmail(s.supportEmail || "");
      setWhatsappNumber(s.whatsappNumber || "");
      setYoutubeUrl(s.youtubeUrl || "");
      setDigestHourIST(s.digestHourIST ?? 8);
      setDailyLimit(s.dailyLimit ?? 500);
    } catch (err) {
      showToast(err.message || "Failed to load email settings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const recipientsArray = adminRecipients
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await api("/admin/emails/settings", {
        method: "PUT",
        body: {
          fromName,
          replyTo,
          adminRecipients: recipientsArray,
          logoUrl,
          footerAddress,
          supportEmail,
          whatsappNumber,
          youtubeUrl,
          digestHourIST: Number(digestHourIST),
          dailyLimit: Number(dailyLimit),
        },
      });
      showToast("Email settings saved successfully", "success");
      load();
    } catch (err) {
      showToast(err.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api("/admin/emails/settings/test", {
        method: "POST",
        body: { to: testEmail || undefined },
      });
      setTestResult({ success: true, message: res.message });
      showToast("SMTP verified and test email delivered", "success");
    } catch (err) {
      setTestResult({ success: false, message: err.message });
      showToast(err.message || "SMTP verification failed", "error");
    } finally {
      setTesting(false);
    }
  };

  if (loading && !settings) {
    return <div className="p-12 text-center text-fg-3">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* SMTP Verification Banner */}
      <div className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-4">
        <div>
          <h2 className="font-display text-base font-bold text-fg">Verify SMTP Server & Connection</h2>
          <p className="text-xs text-fg-3">
            SMTP credentials are read securely from server environment variables (<code className="font-mono">SMTP_HOST</code>, <code className="font-mono">SMTP_USER</code>, etc.).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            className={`${field} flex-1`}
            placeholder="Recipient email for test delivery"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <button
            type="button"
            onClick={handleTestSmtp}
            disabled={testing}
            className={`${btnPrimary} whitespace-nowrap`}
          >
            {testing ? "Verifying..." : "Verify & Send Test Email"}
          </button>
        </div>

        {testResult && (
          <div
            className={`rounded-lg p-3 text-xs flex items-center gap-2 ${
              testResult.success
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {testResult.success ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{testResult.message}</span>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="rounded-xl border border-line bg-surface p-6 shadow-xs space-y-5">
        <h2 className="font-display text-base font-bold text-fg">Branding & Delivery Settings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-fg mb-1">From Name</label>
            <input
              type="text"
              className={field}
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="e.g. Vanakkam Soccer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Reply-To Email</label>
            <input
              type="email"
              className={field}
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="e.g. support@vanakkamsoccer.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-fg mb-1">
              Admin Alert Recipients (comma-separated)
            </label>
            <input
              type="text"
              className={field}
              value={adminRecipients}
              onChange={(e) => setAdminRecipients(e.target.value)}
              placeholder="admin@vanakkamsoccer.com, alerts@vanakkamsoccer.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Logo URL (HTTPS 2x PNG)</label>
            <input
              type="url"
              className={field}
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Support WhatsApp Number</label>
            <input
              type="text"
              className={field}
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">YouTube Channel URL</label>
            <input
              type="url"
              className={field}
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Support Email</label>
            <input
              type="email"
              className={field}
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Daily Digest Hour (IST, 0 - 23)</label>
            <input
              type="number"
              min={0}
              max={23}
              className={field}
              value={digestHourIST}
              onChange={(e) => setDigestHourIST(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Daily Sending Limit</label>
            <input
              type="number"
              min={50}
              max={10000}
              className={field}
              value={dailyLimit}
              onChange={(e) => setDailyLimit(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-fg mb-1">Footer Physical Address</label>
            <textarea
              rows={2}
              className={field}
              value={footerAddress}
              onChange={(e) => setFooterAddress(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-line">
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}

