import { useEffect, useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Search, Trash2, UserCheck, UserX, X } from "lucide-react";
import { api } from "../../lib/api.js";

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

const IST = "Asia/Kolkata";
const fmtDate = (t) => (t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST }) : "Never");
const fmtDateTime = (t) =>
  new Date(t).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true, timeZone: IST }) + " IST";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function schedule(e, now) {
  if (e.unlockedAll) return { state: "all", week: e.weeks, label: "All weeks unlocked" };
  const ref = e.paused ? new Date(e.pausedAt).getTime() : now;
  const week = Math.floor(Math.max(ref - new Date(e.startsAt).getTime() - (e.extraMs || 0), 0) / WEEK_MS) + 1;
  if (week > e.weeks) return { state: "finished", week: e.weeks, label: "Course finished" };
  const next = week < e.weeks ? new Date(e.startsAt).getTime() + (e.extraMs || 0) + week * WEEK_MS : null;
  return { state: e.paused ? "paused" : "active", week, next, label: `Week ${week} of ${e.weeks}` };
}

function Pill({ tone, children }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    gray: "bg-slate-100 text-slate-600 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
  };
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Initials({ name, size = "h-9 w-9 text-xs" }) {
  const t = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return <span className={`flex shrink-0 items-center justify-center rounded-full bg-gold-100 font-bold text-gold-700 ${size}`}>{t}</span>;
}

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg-body">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-danger-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-fg-3">{hint}</span> : null}
    </label>
  );
}

/* ---------- Map server User → client student shape ---------- */
function toStudent(u) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    mobile: u.mobile || "",
    active: u.isActive !== false,
    joined: u.createdAt,
    lastLogin: u.lastLoginAt,
    enrollments: (u.enrollments || []).map(toEnrollment),
    payments: [],
  };
}

function toEnrollment(e) {
  const course = e.courseId || {};
  return {
    id: e._id,
    courseId: course._id || (typeof e.courseId === "string" ? e.courseId : ""),
    course: course.title || "Course",
    weeks: course.totalWeeks || 0,
    startsAt: e.startsAt,
    extraMs: e.extraMs || 0,
    paused: !!e.pausedAt,
    pausedAt: e.pausedAt,
    unlockedAll: !!e.unlockedAll,
    source: e.source || "Paid",
  };
}

/* ---------- Add / edit student ---------- */
function StudentForm({ student, otherEmails, onSave, onClose }) {
  const isNew = !student.id;
  const [f, setF] = useState(student);
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    const name = f.name.trim();
    const email = f.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 60) err.name = "Name must be 2 to 60 characters.";
    if (!/^\S+@\S+\.\S+$/.test(email)) err.email = "Enter a valid email address.";
    else if (otherEmails.includes(email)) err.email = "This email is already used by another student.";
    if (!/^\d{10}$/.test(f.mobile)) err.mobile = "Enter a 10-digit mobile number.";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({ ...f, name, email, mobile: f.mobile });
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="stu-form-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <form onSubmit={submit} noValidate className="relative flex h-full w-full max-w-md flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:px-6">
          <h2 id="stu-form-title" className="font-display text-lg font-bold tracking-tight text-fg">{isNew ? "Add student" : "Edit student"}</h2>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <Field label="Full name" error={errors.name}><input className={field} value={f.name} onChange={set("name")} autoFocus /></Field>
          <Field label="Email" error={errors.email}><input type="email" className={field} value={f.email} onChange={set("email")} /></Field>
          <Field label="Mobile" error={errors.mobile} hint="10 digits, India">
            <input inputMode="numeric" maxLength={10} className={field} value={f.mobile} onChange={(e) => setF((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, "") }))} />
          </Field>
          {isNew && <p className="rounded-lg border border-line bg-surface-2/60 p-4 text-sm text-fg-2">The student gets an email with a link to set their own password.</p>}
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="submit" className={btnPrimary}>{isNew ? "Add student" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- One enrollment with schedule controls ---------- */
function EnrollmentCard({ e, now, busy, onChange }) {
  const s = schedule(e, now);
  const [days, setDays] = useState(3);
  const [jump, setJump] = useState(s.week);
  useEffect(() => setJump(s.week), [s.week]);

  const pct = s.state === "all" || s.state === "finished" ? 100 : Math.round(((s.week - 1) / e.weeks) * 100);
  const extraDays = Math.round(e.extraMs / DAY_MS);
  const canEdit = s.state !== "all";

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-fg">{e.course}</p>
          <p className="mt-0.5 text-xs text-fg-3">Started {fmtDate(e.startsAt)}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {e.source === "Manual" && <Pill tone="blue">Manual</Pill>}
          {s.state === "paused" && <Pill tone="amber">Paused</Pill>}
          {s.state === "all" && <Pill tone="green">All unlocked</Pill>}
          {s.state === "finished" && <Pill tone="gray">Finished</Pill>}
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 flex items-baseline justify-between text-sm">
        <span className="font-medium text-fg">{s.label}</span>
        <span className="text-xs tabular-nums text-fg-3">{pct}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${e.course} progress`}>
        <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-fg-3">
        {s.state === "active" && (s.next ? `Next week unlocks ${fmtDateTime(s.next)}` : "This is the last week")}
        {s.state === "paused" && "The schedule is paused. Resume to continue the countdown."}
        {s.state === "all" && "Every week is open."}
        {s.state === "finished" && "All weeks have passed."}
        {extraDays > 0 && s.state !== "all" ? ` Extended by ${extraDays} ${extraDays === 1 ? "day" : "days"}.` : ""}
      </p>

      {/* Update schedule */}
      {canEdit && (
        <div className="mt-4 space-y-3 rounded-lg border border-line bg-surface-2/60 p-3.5">
          <p className="text-xs font-semibold text-fg-body">Update schedule</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs font-medium text-fg-3">Current week</span>
              <div className="flex gap-2">
                <select className={field} value={jump} disabled={busy} onChange={(ev) => setJump(Number(ev.target.value))} aria-label="Jump to week">
                  {Array.from({ length: e.weeks }, (_, i) => i + 1).map((w) => <option key={w} value={w}>Week {w}</option>)}
                </select>
                <button
                  type="button"
                  className={`${btnPrimary} shrink-0`}
                  disabled={busy || jump === s.week}
                  onClick={() => onChange({ kind: "jump", week: jump })}
                >
                  {busy ? "Saving…" : "Update"}
                </button>
              </div>
            </div>

            <div>
              <span className="mb-1 block text-xs font-medium text-fg-3">Extend by (days)</span>
              <div className="flex gap-2">
                <input type="number" min="1" className={field} value={days} disabled={busy} onChange={(ev) => setDays(ev.target.value)} aria-label="Extend by days" />
                <button
                  type="button"
                  className={`${btnGhost} shrink-0`}
                  disabled={busy || !(Number(days) >= 1)}
                  onClick={() => onChange({ kind: "extend", days: Number(days) })}
                >
                  Extend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {s.state !== "all" && (
          <button type="button" className={btnGhost} disabled={busy} onClick={() => onChange({ kind: "unlockAll" })}>Unlock all weeks</button>
        )}
        {s.state === "all" && (
          <button type="button" className={btnGhost} disabled={busy} onClick={() => onChange({ kind: "unlockAll", off: true })}>Back to weekly schedule</button>
        )}
        {(s.state === "active" || s.state === "paused") && (
          e.paused ? (
            <button type="button" className={btnGhost} disabled={busy} onClick={() => onChange({ kind: "resume" })}>Resume schedule</button>
          ) : (
            <button type="button" className={btnGhost} disabled={busy} onClick={() => onChange({ kind: "pause" })}>Pause schedule</button>
          )
        )}
      </div>
    </div>
  );
}

/* ---------- Student detail drawer ---------- */
function StudentDrawer({
  student, now, onClose, onEdit, onToggle, onReset, onDelete, onEnrollment, updatingEnrollment,
  enrollCourse, setEnrollCourse, enrollWeek, setEnrollWeek, allCourses, enrolling, onEnrollStudent,
}) {
  const enrolledIds = student.enrollments.map((e) => e.courseId);
  const available = allCourses.filter((c) => !enrolledIds.includes(c._id));
  const hasEnrollments = student.enrollments.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="stu-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Initials name={student.name} size="h-10 w-10 text-sm" />
            <div className="flex min-w-0 flex-col items-start gap-0.5">
              <h2 id="stu-title" className="max-w-full truncate font-display text-base font-bold leading-tight tracking-tight text-fg">{student.name}</h2>
              <Pill tone={student.active ? "green" : "gray"}>{student.active ? "Active" : "Disabled"}</Pill>
            </div>
          </div>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* Profile */}
          <section>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div><dt className="text-xs text-fg-3">Email</dt><dd className="mt-0.5 break-all font-medium text-fg">{student.email}</dd></div>
              <div><dt className="text-xs text-fg-3">Mobile</dt><dd className={`mt-0.5 font-medium ${student.mobile ? "text-fg" : "text-fg-3"}`}>{student.mobile || "Not provided"}</dd></div>
              <div><dt className="text-xs text-fg-3">Joined</dt><dd className="mt-0.5 font-medium text-fg">{fmtDate(student.joined)}</dd></div>
              <div><dt className="text-xs text-fg-3">Last login</dt><dd className="mt-0.5 font-medium text-fg">{fmtDate(student.lastLogin)}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={btnGhost} onClick={onEdit}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
              <button type="button" className={btnGhost} onClick={onReset}><KeyRound className="h-4 w-4" aria-hidden="true" />Send reset link</button>
              <button type="button" className={btnGhost} onClick={onToggle}>
                {student.active ? <UserX className="h-4 w-4" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
                {student.active ? "Disable" : "Enable"}
              </button>
            </div>
          </section>

          {/* Courses and schedule */}
          <section className="border-t border-line pt-6">
            <h3 className="mb-3 font-display text-sm font-semibold text-fg">Courses and schedule</h3>

            {!hasEnrollments && <p className="mb-4 text-sm text-fg-3">Not enrolled in any course.</p>}

            {hasEnrollments && (
              <div className="space-y-4">
                {student.enrollments.map((e) => (
                  <EnrollmentCard
                    key={e.id}
                    e={e}
                    now={now}
                    busy={updatingEnrollment === e.id}
                    onChange={(patch) => onEnrollment(e, patch)}
                  />
                ))}
              </div>
            )}

            {/* Enrol form: first course, or an extra one */}
            {available.length > 0 && (
              <div className={`rounded-xl border border-dashed border-line-strong bg-surface-2/60 p-4 ${hasEnrollments ? "mt-5" : ""}`}>
                <p className="mb-3 text-sm font-semibold text-fg">{hasEnrollments ? "Enrol in another course" : "Enrol in a course"}</p>
                <div className="space-y-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-fg-3">Course</label>
                    <select
                      className={field}
                      value={enrollCourse}
                      onChange={(e) => setEnrollCourse(e.target.value)}
                      disabled={enrolling === student.id}
                    >
                      <option value="">Select a course</option>
                      {available.map((c) => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="shrink-0 text-xs font-medium text-fg-3">Start week</label>
                    <input
                      type="number"
                      min="1"
                      className={`${field} !w-20`}
                      value={enrollWeek}
                      onChange={(e) => setEnrollWeek(Math.max(1, Number(e.target.value || 1)))}
                      disabled={enrolling === student.id}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onEnrollStudent(student)}
                    disabled={!enrollCourse || enrolling === student.id}
                    className={btnPrimary}
                  >
                    {enrolling === student.id ? "Enrolling…" : "Enrol student"}
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="border-t border-line pt-5">
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
              <Trash2 className="h-4 w-4" aria-hidden="true" />Delete student
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ---------- Delete confirm ---------- */
function ConfirmDelete({ student, onConfirm, onClose }) {
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="stu-del-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <h2 id="stu-del-title" className="font-display text-lg font-bold tracking-tight text-fg">Delete {student.name}?</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          The account is removed and the student loses all access. This cannot be undone.
        </p>
        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-fg-body">Type DELETE to confirm</span>
          <input className={field} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </label>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="button" disabled={text !== "DELETE"} onClick={onConfirm} className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40">
            Delete student
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
const PAGE_SIZE = 5;
const EMPTY = { name: "", email: "", mobile: "" };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [joined, setJoined] = useState("Any");
  const [page, setPage] = useState(1);
  const [viewingId, setViewingId] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState("");
  const [drawerStudent, setDrawerStudent] = useState(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(null); // student id being enrolled
  const [enrollCourse, setEnrollCourse] = useState("");
  const [enrollWeek, setEnrollWeek] = useState(1);
  const [allCourses, setAllCourses] = useState([]);
  const [editingWeek, setEditingWeek] = useState({}); // studentId -> { week, enrollmentId }
  const [updatingEnrollment, setUpdatingEnrollment] = useState(null); // enrollment id being updated

  const now = Date.now();

  function studentWeek(s) {
    if (!s.enrollments || s.enrollments.length === 0) return "—";
    const e = s.enrollments[0];
    const sc = schedule(e, now);
    if (sc.state === "all") return "All weeks";
    if (sc.state === "finished") return "Finished";
    return `Week ${sc.week}`;
  }

  const viewing = students.find((s) => s.id === viewingId) ?? null;

  const filtered = useMemo(() => {
    const t = Date.now();
    const lim = joined === "7" ? 7 * DAY_MS : joined === "30" ? 30 * DAY_MS : Infinity;
    const needle = q.toLowerCase();
    return students.filter(
      (s) =>
        (s.name.toLowerCase().includes(needle) || s.email.toLowerCase().includes(needle) || s.mobile.includes(needle)) &&
        (status === "All" || (status === "Active") === s.active) &&
        t - new Date(s.joined).getTime() <= lim
    );
  }, [students, q, status, joined]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtersOn = q || status !== "All" || joined !== "Any";

  useEffect(() => setPage(1), [q, status, joined]);

  /* ---------- Loaders ---------- */
  const reloadList = async () => {
    const res = await api("/admin/students");
    setStudents((Array.isArray(res.data) ? res.data : []).map(toStudent));
  };

  const reloadDrawer = async (id) => {
    const res = await api(`/admin/students/${id}`);
    setDrawerStudent(toStudent(res.data.student || res.data));
  };

  const loadStudents = async () => {
    setLoading(true);
    setError("");
    try {
      await reloadList();
    } catch (err) {
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (!viewingId) {
      setDrawerStudent(null);
      setEnrollCourse("");
      setEnrollWeek(1);
      setAllCourses([]);
      return;
    }
    async function load() {
      setDrawerLoading(true);
      try {
        await reloadDrawer(viewingId);
        const cr = await api("/courses");
        setAllCourses(Array.isArray(cr.data) ? cr.data : cr.courses || []);
      } catch (err) {
        setToast(err.message || "Failed to load student details");
      } finally {
        setDrawerLoading(false);
      }
    }
    load();
  }, [viewingId]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (deleting) setDeleting(null);
      else if (editing) setEditing(null);
      else if (viewingId) setViewingId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [deleting, editing, viewingId]);

  useEffect(() => {
    document.body.style.overflow = viewingId || editing || deleting ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [viewingId, editing, deleting]);

  /* ---------- API actions ---------- */
  const saveStudent = async (data) => {
    try {
      if (data.id) {
        await api(`/admin/students/${data.id}`, { method: "PUT", body: JSON.stringify({ name: data.name, email: data.email, mobile: data.mobile }) });
        setToast("Student saved");
      } else {
        await api("/admin/students", { method: "POST", body: JSON.stringify({ name: data.name, email: data.email, mobile: data.mobile }) });
        setToast("Student added. A password setup link was emailed.");
      }
      setEditing(null);
      await reloadList();
      if (data.id && viewingId === data.id) await reloadDrawer(data.id);
    } catch (err) {
      setToast(err.message || "Save failed");
    }
  };

  const toggleActive = async (s) => {
    try {
      await api(`/admin/students/${s.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !s.active }) });
      setToast(s.active ? "Student disabled. Access stopped immediately." : "Student enabled");
      await reloadList();
      if (viewingId === s.id) await reloadDrawer(s.id);
    } catch (err) {
      setToast(err.message || "Status update failed");
    }
  };

  const resetPassword = async (s) => {
    try {
      await api(`/admin/students/${s.id}/reset-password`, { method: "POST" });
      setToast(`Reset link sent to ${s.email}`);
    } catch (err) {
      setToast(err.message || "Reset failed");
    }
  };

  const enrollStudent = async (s) => {
    if (!enrollCourse) return;
    setEnrolling(s.id);
    try {
      const created = await api("/admin/enrollments", {
        method: "POST",
        body: JSON.stringify({ userId: s.id, courseId: enrollCourse }),
      });
      const e = created.data || created;
      let enrollmentId = e._id || e.id || e.enrollmentId;
      if (!enrollmentId && e.enrollment) enrollmentId = e.enrollment._id || e.enrollment.id;
      // If they want a later starting week, jump to it
      if (enrollmentId && Number(enrollWeek) > 1) {
        await api(`/admin/enrollments/${enrollmentId}/jump`, {
          method: "PATCH",
          body: JSON.stringify({ week: Number(enrollWeek) }),
        });
      }
      setToast("Student enrolled");
      setEnrollCourse("");
      setEnrollWeek(1);
      await reloadDrawer(s.id);
      await reloadList();
    } catch (err) {
      setToast(err.message || "Enrol failed");
    } finally {
      setEnrolling(null);
    }
  };

  /* Update an existing enrollment: jump, extend, pause, resume, unlock all.
     The endpoint paths below must match your backend routes. */
  const updateEnrollment = async (s, en, patch) => {
    const base = `/admin/enrollments/${en.id}`;
    setUpdatingEnrollment(en.id);
    try {
      let msg = "Schedule updated";
      if (patch.kind === "jump") {
        await api(`${base}/jump`, { method: "PATCH", body: JSON.stringify({ week: Number(patch.week) }) });
        msg = `Moved to week ${patch.week}`;
      } else if (patch.kind === "extend") {
        await api(`${base}/extend`, { method: "PATCH", body: JSON.stringify({ days: Number(patch.days) }) });
        msg = `Extended by ${patch.days} ${patch.days === 1 ? "day" : "days"}`;
      } else if (patch.kind === "pause") {
        await api(`${base}/pause`, { method: "PATCH" });
        msg = "Schedule paused";
      } else if (patch.kind === "resume") {
        await api(`${base}/resume`, { method: "PATCH" });
        msg = "Schedule resumed";
      } else if (patch.kind === "unlockAll") {
        await api(`${base}/unlock-all`, { method: "PATCH", body: JSON.stringify({ unlocked: !patch.off }) });
        msg = patch.off ? "Back to weekly schedule" : "All weeks unlocked";
      }
      setToast(msg);
      await reloadDrawer(s.id);
      await reloadList();
    } catch (err) {
      setToast(err.message || "Update failed");
    } finally {
      setUpdatingEnrollment(null);
    }
  };

  /* Quick week edit from the table */
  const updateStudentWeek = async (s, week) => {
    const enrollment = s.enrollments?.[0];
    if (!enrollment || !enrollment.id) return;
    setEditingWeek((prev) => ({ ...prev, [s.id]: { week, enrollmentId: enrollment.id, saving: true } }));
    try {
      await api(`/admin/enrollments/${enrollment.id}/jump`, {
        method: "PATCH",
        body: JSON.stringify({ week: Number(week) }),
      });
      setToast("Week updated");
      await reloadList();
    } catch (err) {
      setToast(err.message || "Week update failed");
    } finally {
      setEditingWeek((prev) => {
        const next = { ...prev };
        delete next[s.id];
        return next;
      });
    }
  };

  const confirmDelete = async () => {
    try {
      await api(`/admin/students/${deleting.id}`, { method: "DELETE" });
      setToast("Student deleted");
      await reloadList();
    } catch (err) {
      setToast(err.message || "Delete failed");
    } finally {
      setDeleting(null);
      setViewingId(null);
    }
  };

  const clearFilters = () => { setQ(""); setStatus("All"); setJoined("Any"); };

  return (
    <div className="space-y-6">
      {error && (
        <div className="mx-auto max-w-lg rounded-xl border border-line bg-surface p-6 text-center" role="alert">
          <p className="text-sm font-semibold text-fg">Could not load students</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
          <button type="button" className={`${btnPrimary} mx-auto mt-4`} onClick={loadStudents}>
            Try again
          </button>
        </div>
      )}
      {!error && (
        <>
          {/* Page header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Students</h1>
              <p className="mt-1 text-sm text-fg-3">
                {loading ? "Loading…" : `${students.length} students, ${students.filter((s) => s.active).length} active`}
              </p>
            </div>
            <button type="button" onClick={() => setEditing(EMPTY)} className={`${btnPrimary} self-start sm:self-auto`} disabled={loading}>
              <Plus className="h-4 w-4" aria-hidden="true" />Add student
            </button>
          </div>

          {/* Table card with filters on top */}
          <section className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_11rem]">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
                <input type="search" className={`${field} pl-9`} placeholder="Search by name, email or mobile" aria-label="Search students" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className={field} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="All">All statuses</option>
                <option>Active</option>
                <option>Disabled</option>
              </select>
              <select className={field} aria-label="Filter by joined date" value={joined} onChange={(e) => setJoined(e.target.value)}>
                <option value="Any">Joined any time</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-surface-2/60">
                  <tr>
                    <th className={`${th} pl-5`}>Student</th>
                    <th className={th}>Status</th>
                    <th className={th}>Joined</th>
                    <th className={th}>Last login</th>
                    <th className={th}>Current week</th>
                    <th className={`${th} pr-5 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-surface-2/50">
                      <td className={`${td} pl-5`}>
                        <div className="flex items-center gap-3">
                          <Initials name={s.name} />
                          <div className="min-w-0 max-w-[16rem]">
                            <p className="truncate font-medium text-fg">{s.name}</p>
                            <p className="truncate text-xs text-fg-3">{s.email}{s.mobile ? ` · ${s.mobile}` : ""}</p>
                          </div>
                        </div>
                      </td>
                      <td className={td}><Pill tone={s.active ? "green" : "gray"}>{s.active ? "Active" : "Disabled"}</Pill></td>
                      <td className={`${td} text-fg-body`}>{fmtDate(s.joined)}</td>
                      <td className={`${td} text-fg-body`}>{fmtDate(s.lastLogin)}</td>
                      <td className={`${td} text-fg-body`}>
                        {editingWeek[s.id] ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              aria-label={`Week for ${s.name}`}
                              className={`${field} !w-16 !px-2 !py-1 text-xs`}
                              value={editingWeek[s.id].week || ""}
                              onChange={(e) => setEditingWeek((prev) => ({ ...prev, [s.id]: { ...prev[s.id], week: e.target.value } }))}
                              disabled={editingWeek[s.id].saving}
                            />
                            <button
                              type="button"
                              onClick={() => updateStudentWeek(s, editingWeek[s.id].week)}
                              disabled={editingWeek[s.id].saving || !editingWeek[s.id].week}
                              className="rounded-md bg-gold-400 px-2.5 py-1.5 text-xs font-semibold text-ink-950 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Set
                            </button>
                          </div>
                        ) : s.enrollments?.[0] ? (
                          <button
                            type="button"
                            title="Click to change week"
                            onClick={() => {
                              const e = s.enrollments[0];
                              const match = studentWeek(s).match(/Week (\d+)/);
                              setEditingWeek((prev) => ({ ...prev, [s.id]: { week: match ? match[1] : "1", enrollmentId: e.id, saving: false } }));
                            }}
                            className="rounded text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
                          >
                            {studentWeek(s)}
                          </button>
                        ) : (
                          <span className="text-fg-3">{studentWeek(s)}</span>
                        )}
                      </td>
                      <td className={`${td} pr-5`}>
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setViewingId(s.id)} className={`${btnGhost} !px-3 !py-1.5`} disabled={drawerLoading}>View</button>
                          <button
                            type="button"
                            onClick={() => toggleActive(s)}
                            className={iconBtn}
                            title={s.active ? "Disable" : "Enable"}
                            aria-label={`${s.active ? "Disable" : "Enable"} ${s.name}`}
                          >
                            {s.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </button>
                          <button type="button" onClick={() => setDeleting(s)} className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Delete" aria-label={`Delete ${s.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {loading && rows.length === 0 && (
              <div className="px-6 py-14 text-center text-sm text-fg-3" aria-busy="true">Loading students…</div>
            )}

            {!loading && rows.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-fg">{filtersOn ? "No students match these filters" : "No students yet"}</p>
                <p className="mt-1 text-sm text-fg-3">{filtersOn ? "Try a different search or clear the filters." : "Students appear here after they register."}</p>
                {filtersOn && <button type="button" onClick={clearFilters} className={`${btnGhost} mt-4`}>Clear filters</button>}
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm sm:flex-row">
                <p className="text-fg-3">Showing {(current - 1) * PAGE_SIZE + 1} to {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={current === 1 || loading} onClick={() => setPage(current - 1)} className={`${btnGhost} !px-3 !py-1.5`}>Previous</button>
                  <span className="px-2 text-fg-3">Page {current} of {pages}</span>
                  <button type="button" disabled={current === pages || loading} onClick={() => setPage(current + 1)} className={`${btnGhost} !px-3 !py-1.5`}>Next</button>
                </div>
              </div>
            )}
          </section>

          {viewing && drawerStudent && (
            <StudentDrawer
              student={drawerStudent}
              now={now}
              onClose={() => setViewingId(null)}
              onEdit={() => setEditing(drawerStudent)}
              onToggle={() => toggleActive(drawerStudent)}
              onReset={() => resetPassword(drawerStudent)}
              onDelete={() => setDeleting(drawerStudent)}
              onEnrollment={(en, patch) => updateEnrollment(drawerStudent, en, patch)}
              updatingEnrollment={updatingEnrollment}
              enrollCourse={enrollCourse}
              setEnrollCourse={setEnrollCourse}
              enrollWeek={enrollWeek}
              setEnrollWeek={setEnrollWeek}
              allCourses={allCourses}
              enrolling={enrolling}
              onEnrollStudent={enrollStudent}
            />
          )}
          {editing && (
            <StudentForm
              key={editing.id ?? "new"}
              student={editing}
              otherEmails={students.filter((s) => s.id !== editing.id).map((s) => s.email.toLowerCase())}
              onSave={saveStudent}
              onClose={() => setEditing(null)}
            />
          )}
          {deleting && <ConfirmDelete student={deleting} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />}

          <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[90] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2">
            {toast && <div className="rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-surface shadow-lg">{toast}</div>}
          </div>
        </>
      )}
    </div>
  );
}