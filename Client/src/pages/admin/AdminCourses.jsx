import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Copy, Eye, EyeOff, Pencil, Plus, RotateCcw, Search, Trash2, X } from "lucide-react";
import { api } from "../../lib/api.js";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const PAGE_SIZE = 5;
const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const EMPTY = { title: "", slug: "", level: "Beginner", price: 0, originalPrice: 0, weeks: 8, status: "Draft", shortDesc: "", fullDesc: "", thumbnail: "", thumbAlt: "", previewVideo: "", seoTitle: "", seoDesc: "", syllabus: "", syllabusUrl: "", documents: [] };

/* The server and this page use different field names, so convert in one place. */
const fromApi = (c) => ({
  id: c._id,
  title: c.title || "",
  slug: c.slug || "",
  level: c.level || "Beginner",
  price: c.price ?? 0,
  originalPrice: c.originalPrice ?? 0,
  weeks: c.totalWeeks ?? 8,
  status: c.status || "Draft",
  shortDesc: c.shortDesc || "",
  fullDesc: c.fullDesc || "",
  thumbnail: c.thumbnail || "",
  thumbAlt: c.thumbAlt || "",
  previewVideo: c.previewVideoId || "",
  seoTitle: c.seo?.title || "",
  seoDesc: c.seo?.description || "",
  syllabus: c.syllabus || "",
  syllabusUrl: c.syllabusUrl || "",
  students: c.studentCount || 0,
  documents: c.documents || [],
});

const toApi = (f) => ({
  title: f.title || "",
  slug: f.slug || "",
  level: f.level || "Beginner",
  price: Number(f.price) || 0,
  originalPrice: Number(f.originalPrice) || 0,
  totalWeeks: Number(f.weeks) || 8,
  status: f.status || "Draft",
  shortDesc: f.shortDesc || "",
  fullDesc: f.fullDesc || "",
  thumbAlt: f.thumbAlt || "",
  previewVideoId: f.previewVideo || "",
  seo: { title: f.seoTitle || "", description: f.seoDesc || "" },
  syllabus: f.syllabus || "",
  syllabusUrl: f.syllabusUrl || "",
  documents: f.documents || [],
});

/* ---------- Shared classes ---------- */
const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fg-3 transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1";

const STATUS_PILL = {
  Published: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Draft: "bg-slate-100 text-slate-600 border-slate-200",
  Archived: "bg-amber-50 text-amber-700 border-amber-200",
};

const slugify = (s) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

const getNextUniqueSlug = (base, takenSlugs = []) => {
  const clean = slugify(base) || "course";
  if (!takenSlugs.includes(clean)) return clean;
  let i = 2;
  while (takenSlugs.includes(`${clean}-${i}`)) i++;
  return `${clean}-${i}`;
};
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const th = "px-4 py-3 text-xs font-medium text-fg-3 whitespace-nowrap";
const td = "px-4 py-3.5 whitespace-nowrap";

function Field({ label, hint, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-fg-body">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs font-medium text-danger-600">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-fg-3">{hint}</span>
      ) : null}
    </label>
  );
}

/* ---------- Add / edit drawer ---------- */
function CourseDrawer({ course, otherSlugs, onSave, onClose }) {
  const isNew = !course.id;
  const [f, setF] = useState(course);
  const [file, setFile] = useState(null); // new thumbnail chosen in this session
  const [docFiles, setDocFiles] = useState([]); // documents chosen for upload
  const [syllabusFile, setSyllabusFile] = useState(null); // syllabus PDF file
  const [preview, setPreview] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const set = (key) => (e) => setF((p) => ({ ...p, [key]: e.target.value }));

  // Local preview of the chosen image; the object URL is released when it changes or the drawer closes
  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onTitle = (e) => {
    const title = e.target.value;
    const clean = slugify(title);
    setF((p) => ({
      ...p,
      title,
      slug: slugTouched ? p.slug : (otherSlugs.includes(clean) ? getNextUniqueSlug(clean, otherSlugs) : clean),
    }));
  };

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!IMAGE_TYPES.includes(picked.type)) {
      setErrors((p) => ({ ...p, thumb: "Use a JPG, PNG or WebP image." }));
      e.target.value = "";
      return;
    }
    if (picked.size > MAX_IMAGE) {
      setErrors((p) => ({ ...p, thumb: "The image must be 5 MB or smaller." }));
      e.target.value = "";
      return;
    }
    setErrors((p) => ({ ...p, thumb: undefined }));
    setFile(picked);
  };

  const submit = async (e) => {
    e.preventDefault();
    const err = {};
    if (f.title.trim().length < 3) err.title = "Enter a title of at least 3 characters.";
    if (!f.slug) err.slug = "Enter a URL name.";
    else if (otherSlugs.includes(f.slug)) err.slug = "This URL name is already used by another course.";
    if (f.price === "" || Number(f.price) < 0) err.price = "Price must be 0 or more.";
    if (!(Number(f.weeks) >= 1)) err.weeks = "Enter at least 1 week.";
    if (f.status === "Published" && !f.thumbAlt.trim()) err.thumbAlt = "Add image alt text before publishing.";
    setErrors(err);
    setFormError("");
    if (Object.keys(err).length) return;

    setSaving(true);
    try {
      await onSave({ ...f, title: f.title.trim() }, file, docFiles, syllabusFile);
    } catch (ex) {
      setFormError(ex.message);
      if (/url name/i.test(ex.message)) setErrors((p) => ({ ...p, slug: ex.message }));
    } finally {
      setSaving(false);
    }
  };

  const shownImage = preview || f.thumbnail;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="course-drawer-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <form onSubmit={submit} noValidate className="relative flex h-full w-full max-w-xl flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:px-6">
          <h2 id="course-drawer-title" className="font-display text-lg font-bold tracking-tight text-fg">
            {isNew ? "Add course" : "Edit course"}
          </h2>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <Field label="Title" error={errors.title}>
            <input className={field} value={f.title} onChange={onTitle} autoFocus />
          </Field>

          <Field label="URL name (slug)" hint={`Page address: /courses/${f.slug || "your-course"}`} error={errors.slug}>
            <div className="flex items-center gap-2">
              <input
                className={field}
                value={f.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  const newSlug = slugify(e.target.value);
                  setF((p) => ({ ...p, slug: newSlug }));
                  if (otherSlugs.includes(newSlug)) {
                    setErrors((p) => ({ ...p, slug: "This URL name is already used by another course." }));
                  } else {
                    setErrors((p) => ({ ...p, slug: undefined }));
                  }
                }}
              />
              {otherSlugs.includes(f.slug) && (
                <button
                  type="button"
                  onClick={() => {
                    const unique = getNextUniqueSlug(f.slug, otherSlugs);
                    setF((p) => ({ ...p, slug: unique }));
                    setErrors((p) => ({ ...p, slug: undefined }));
                  }}
                  className="shrink-0 rounded-lg bg-gold-400 px-3 py-2 text-xs font-bold text-ink-950 transition hover:brightness-95"
                >
                  Auto-fix
                </button>
              )}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Level">
              <select className={field} value={f.level} onChange={set("level")}>
                {LEVELS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Selling Price (₹)" error={errors.price}>
              <input type="number" inputMode="numeric" min="0" className={field} value={f.price} onChange={set("price")} />
            </Field>
            <Field
              label="Original MRP (₹)"
              hint={
                Number(f.originalPrice) > Number(f.price)
                  ? `${Math.round(((Number(f.originalPrice) - Number(f.price)) / Number(f.originalPrice)) * 100)}% discount applied`
                  : "Optional strike-through"
              }
            >
              <input type="number" inputMode="numeric" min="0" className={field} value={f.originalPrice} onChange={set("originalPrice")} />
            </Field>
            <Field label="Total weeks" error={errors.weeks}>
              <input type="number" inputMode="numeric" min="1" className={field} value={f.weeks} onChange={set("weeks")} />
            </Field>
          </div>

          <Field label="Short description" hint="Shown on course cards.">
            <textarea rows={2} className={field} value={f.shortDesc} onChange={set("shortDesc")} />
          </Field>

          <Field label="Full description">
            <textarea rows={5} className={field} value={f.fullDesc} onChange={set("fullDesc")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Thumbnail" error={errors.thumb} hint="JPG, PNG or WebP, up to 5 MB. Best at 16:9 (1280 x 720).">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={pickFile}
                className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-sm file:font-medium`}
              />
            </Field>
            <Field label="Thumbnail alt text" error={errors.thumbAlt} hint="Describe the image for search engines and screen readers.">
              <input className={field} value={f.thumbAlt} onChange={set("thumbAlt")} />
            </Field>
          </div>

          {shownImage && (
            <div>
              <img src={shownImage} alt={f.thumbAlt || "Thumbnail preview"} className="aspect-video w-full rounded-lg border border-line object-cover" />
              <p className="mt-1.5 text-xs text-fg-3">
                {file ? "New image. It uploads to Cloudinary when you save." : "Current image on Cloudinary."}
              </p>
            </div>
          )}

          <Field label="Preview video ID" hint="Bunny Stream video ID for the free preview.">
            <input className={field} value={f.previewVideo} onChange={set("previewVideo")} />
          </Field>

          <fieldset className="space-y-4 rounded-lg border border-line bg-surface-2/60 p-4">
            <legend className="px-1 text-sm font-semibold text-fg-body">Syllabus &amp; Documents</legend>

            <Field
              label="Course Syllabus / Curriculum (paste text)"
              hint="Paste your weekly curriculum, drill routines, topics, or study plan. This text will be displayed directly on the course page and student dashboard."
            >
              <textarea
                rows={6}
                className={field}
                value={f.syllabus}
                onChange={set("syllabus")}
                placeholder={"Week 1: Ball Mastery & First Touch\n- Daily 30-min footwork\n- Sole rolls, inside-outside touches\n\nWeek 2: Ground Passing Precision\n- Instep passing, wall rebounder drills"}
              />
            </Field>

            <Field
              label="Upload Syllabus PDF"
              hint="Attach an official PDF syllabus document for students to download."
            >
              <div className="space-y-2">
                {f.syllabusUrl && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-pitch-200 bg-pitch-500/10 px-3 py-2 text-xs font-semibold text-pitch-800 dark:text-pitch-300">
                    <span className="truncate">Current PDF attached:</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={f.syllabusUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-pitch-900"
                      >
                        View current PDF
                      </a>
                      <button
                        type="button"
                        onClick={() => setF((p) => ({ ...p, syllabusUrl: "" }))}
                        className="text-danger-500 hover:text-danger-700 ml-1 cursor-pointer"
                        title="Remove syllabus PDF link"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const picked = e.target.files?.[0];
                    if (picked) setSyllabusFile(picked);
                  }}
                  className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-xs file:font-semibold`}
                />
                {syllabusFile && (
                  <p className="text-xs text-gold-600 dark:text-gold-400 font-medium">
                    Selected for upload: {syllabusFile.name} (will upload on save)
                  </p>
                )}
              </div>
            </Field>

            <Field label="Supplementary Documents" hint="Upload additional worksheets, guides, or rulebooks (PDF/Word).">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  setDocFiles((prev) => [...prev, ...files])
                  e.target.value = ''
                }}
                className={`${field} file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-sm file:font-medium`}
              />
              {docFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {docFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-line bg-surface-2 text-sm">
                      <span className="flex-1 truncate" title={file.name}>{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setDocFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-fg-3 hover:text-danger-600"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <p className="text-xs text-fg-3">Selected documents upload when you save.</p>
                </div>
              )}
            </Field>
          </fieldset>

          <fieldset className="space-y-5 rounded-lg border border-line bg-surface-2/60 p-4">
            <legend className="px-1 text-sm font-semibold text-fg-body">Search engine (SEO)</legend>
            <Field label="SEO title" hint={`${f.seoTitle.length}/60 characters`}>
              <input className={field} maxLength={70} value={f.seoTitle} onChange={set("seoTitle")} />
            </Field>
            <Field label="Meta description" hint={`${f.seoDesc.length} characters (aim for 140 to 160)`}>
              <textarea rows={3} maxLength={200} className={field} value={f.seoDesc} onChange={set("seoDesc")} />
            </Field>
          </fieldset>

          <Field label="Status" hint="Draft courses are hidden from the website.">
            <select className={field} value={f.status} onChange={set("status")}>
              <option>Draft</option>
              <option>Published</option>
              {f.status === "Archived" && <option>Archived</option>}
            </select>
          </Field>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
          {formError && <p role="alert" className="mr-auto text-sm font-medium text-danger-600">{formError}</p>}
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? (file ? "Saving and uploading…" : "Saving…") : isNew ? "Add course" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Delete / archive confirmation ---------- */
function ConfirmDelete({ course, onConfirm, onClose }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const hasStudents = course.students > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <h2 id="confirm-title" className="font-display text-lg font-bold tracking-tight text-fg">
          {hasStudents ? "Archive" : "Delete"} “{course.title}”?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          {hasStudents
            ? `${course.students} students have bought this course, so it cannot be deleted. Archiving hides it from the website, and existing students keep their access.`
            : "This deletes the course, its week structure and its thumbnail for good. It cannot be undone."}
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-sm font-medium text-fg-body">Type DELETE to confirm</span>
          <input className={field} value={text} onChange={(e) => setText(e.target.value)} autoFocus />
        </label>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button
            type="button"
            disabled={text !== "DELETE" || busy}
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false); }}
            className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Working…" : hasStudents ? "Archive course" : "Delete course"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */
export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [level, setLevel] = useState("All");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // course object (new or existing)
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null); // { text, error }

  const notify = (text, error = false) => setToast({ text, error });

  /* The admin list endpoint returns every status plus a student count. */
  const load = useCallback(async () => {
    try {
      setLoadError("");
      const r = await api("/courses/admin/list");
      setCourses((r.data || []).map(fromApi));
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () =>
      courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q.toLowerCase()) &&
          (status === "All" || c.status === status) &&
          (level === "All" || c.level === level)
      ),
    [courses, q, status, level]
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const filtersOn = q || status !== "All" || level !== "All";

  useEffect(() => setPage(1), [q, status, level]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), toast.error ? 6000 : 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setEditing(null);
      setDeleting(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = editing || deleting ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [editing, deleting]);

  /* ---------- Actions: every one calls the API ---------- */
  const act = async (fn) => {
    try { await fn(); } catch (e) { notify(e.message, true); }
  };

  // Throws on failure so the drawer can show the message and stay open
  const save = async (data, file, docFiles = [], syllabusFile = null) => {
    const isNew = !data.id;
    const res = await api(isNew ? "/courses" : `/courses/${data.id}`, {
      method: isNew ? "POST" : "PUT",
      body: toApi(data),
    });

    // The thumbnail is a separate upload (multipart) that goes to Cloudinary through the server
    let uploadError = "";
    if (file) {
      try {
        const fd = new FormData();
        fd.append("thumbnail", file); // field name must be "thumbnail"
        await api(`/courses/${res.data._id}/thumbnail`, { method: "POST", body: fd });
      } catch (e) {
        uploadError = e.message;
      }
    }

    // Upload official syllabus PDF
    if (syllabusFile) {
      try {
        const sfd = new FormData();
        sfd.append("syllabus", syllabusFile);
        await api(`/courses/${res.data._id}/syllabus`, { method: "POST", body: sfd });
      } catch (e) {
        uploadError = uploadError
          ? `${uploadError}; syllabus: ${e.message}`
          : `Syllabus PDF did not upload: ${e.message}`;
      }
    }

    // Upload selected supplementary documents (PDF / Word)
    if (docFiles && docFiles.length) {
      try {
        const fd = new FormData();
        docFiles.forEach((f) => fd.append("documents", f));
        await api(`/courses/${res.data._id}/documents`, { method: "POST", body: fd });
      } catch (e) {
        uploadError = uploadError
          ? `${uploadError}; documents: ${e.message}`
          : `Documents did not upload: ${e.message}`;
      }
    }

    await load();
    setEditing(null);
    if (uploadError) notify(`Course saved, but some files did not upload: ${uploadError}`, true);
    else notify(isNew ? "Course added" : "Course saved");
  };

  const togglePublish = (c) =>
    act(async () => {
      const next = c.status === "Published" ? "Draft" : "Published";
      await api(`/courses/${c.id}/status`, { method: "PATCH", body: { status: next } });
      setCourses((cs) => cs.map((x) => (x.id === c.id ? { ...x, status: next } : x)));
      notify(next === "Published" ? "Course published" : "Course hidden from the website");
    });

  const duplicate = (c) =>
    act(async () => {
      await api(`/courses/${c.id}/duplicate`, { method: "POST" });
      await load();
      notify("Duplicated as a draft");
    });

  const confirmDelete = () =>
    act(async () => {
      const r = await api(`/courses/${deleting.id}`, { method: "DELETE" });
      setDeleting(null);
      await load();
      notify(r.data?.archived ? "Course archived" : "Course deleted");
    });

  const clearFilters = () => { setQ(""); setStatus("All"); setLevel("All"); };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Courses</h1>
          <p className="mt-1 text-sm text-fg-3">
            {loading ? "Loading…" : `${courses.length} courses, ${courses.filter((c) => c.status === "Published").length} published`}
          </p>
        </div>
        <button type="button" onClick={() => setEditing(EMPTY)} className={`${btnPrimary} self-start sm:self-auto`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add course
        </button>
      </div>

      {/* Table card with filters on top */}
      <section className="overflow-hidden rounded-xl border border-line bg-surface">
        <div className="grid gap-3 border-b border-line p-4 sm:grid-cols-[1fr_11rem_11rem]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
            <input type="search" className={`${field} pl-9`} placeholder="Search courses" aria-label="Search courses" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className={field} aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="All">All statuses</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>
          <select className={field} aria-label="Filter by level" value={level} onChange={(e) => setLevel(e.target.value)}>
            <option value="All">All levels</option>
            {LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>

        {loading && (
          <div className="px-6 py-14 text-center text-sm text-fg-3" aria-busy="true">Loading courses…</div>
        )}

        {!loading && loadError && (
          <div className="px-6 py-14 text-center" role="alert">
            <p className="text-sm font-semibold text-fg">Could not load courses</p>
            <p className="mt-1 text-sm text-fg-3">{loadError}</p>
            <button type="button" onClick={() => { setLoading(true); load(); }} className={`${btnGhost} mt-4`}>Try again</button>
          </div>
        )}

        {!loading && !loadError && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-surface-2/60">
                  <tr>
                    <th className={`${th} pl-5`}>Course</th>
                    <th className={th}>Level</th>
                    <th className={`${th} text-right`}>Price</th>
                    <th className={`${th} text-right`}>Weeks</th>
                    <th className={`${th} text-right`}>Students</th>
                    <th className={th}>Status</th>
                    <th className={`${th} pr-5 text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-surface-2/50">
                      <td className={`${td} pl-5`}>
                        <div className="flex items-center gap-3">
                          {c.thumbnail ? (
                            <img src={c.thumbnail} alt="" loading="lazy" className="h-10 w-[4.5rem] shrink-0 rounded-md border border-line object-cover" />
                          ) : (
                            <span className="flex h-10 w-[4.5rem] shrink-0 items-center justify-center rounded-md bg-surface-2 text-xs text-fg-3">No image</span>
                          )}
                          <div className="min-w-0 max-w-[16rem]">
                            <p className="truncate font-medium text-fg">{c.title}</p>
                            <p className="truncate text-xs text-fg-3">/courses/{c.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className={`${td} text-fg-body`}>{c.level}</td>
                      <td className={`${td} text-right font-medium tabular-nums text-fg`}>
                        {Number(c.originalPrice) > Number(c.price) ? (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-fg-3 line-through">{inr(c.originalPrice)}</span>
                              <span className="font-bold text-fg">{inr(c.price)}</span>
                            </div>
                            <span className="text-[10px] font-bold text-pitch-600 dark:text-pitch-400">
                              {Math.round(((c.originalPrice - c.price) / c.originalPrice) * 100)}% OFF
                            </span>
                          </div>
                        ) : (
                          inr(c.price)
                        )}
                      </td>
                      <td className={`${td} text-right tabular-nums text-fg-body`}>{c.weeks}</td>
                      <td className={`${td} text-right tabular-nums text-fg-body`}>{c.students}</td>
                      <td className={td}>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[c.status] ?? STATUS_PILL.Draft}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className={`${td} pr-5`}>
                        <div className="flex items-center justify-end gap-0.5">
                          <button type="button" onClick={() => setEditing(c)} className={iconBtn} title="Edit" aria-label={`Edit ${c.title}`}>
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button type="button" onClick={() => duplicate(c)} className={iconBtn} title="Duplicate as draft" aria-label={`Duplicate ${c.title}`}>
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => togglePublish(c)}
                            className={iconBtn}
                            title={c.status === "Published" ? "Unpublish" : c.status === "Archived" ? "Restore and publish" : "Publish"}
                            aria-label={c.status === "Published" ? `Unpublish ${c.title}` : `Publish ${c.title}`}
                          >
                            {c.status === "Published" ? <EyeOff className="h-4 w-4" /> : c.status === "Archived" ? <RotateCcw className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                          {c.status !== "Archived" && (
                            <button
                              type="button"
                              onClick={() => setDeleting(c)}
                              className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
                              title={c.students > 0 ? "Archive" : "Delete"}
                              aria-label={`${c.students > 0 ? "Archive" : "Delete"} ${c.title}`}
                            >
                              {c.students > 0 ? <Archive className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-fg">{filtersOn ? "No courses match these filters" : "No courses yet"}</p>
                <p className="mt-1 text-sm text-fg-3">
                  {filtersOn ? "Try a different search or clear the filters." : "Add your first course to get started."}
                </p>
                <button type="button" onClick={filtersOn ? clearFilters : () => setEditing(EMPTY)} className={`${btnGhost} mt-4`}>
                  {filtersOn ? "Clear filters" : "Add course"}
                </button>
              </div>
            )}

            {filtered.length > 0 && (
              <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3 text-sm sm:flex-row">
                <p className="text-fg-3">
                  Showing {(current - 1) * PAGE_SIZE + 1} to {Math.min(current * PAGE_SIZE, filtered.length)} of {filtered.length}
                </p>
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

      {editing && (
        <CourseDrawer
          key={editing.id ?? "new"}
          course={editing}
          otherSlugs={courses.filter((c) => c.id !== editing.id).map((c) => c.slug)}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && <ConfirmDelete course={deleting} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />}

      {/* Toast */}
      <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2">
        {toast && (
          <div className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${toast.error ? "bg-red-600" : "bg-fg"}`}>
            {toast.text}
          </div>
        )}
      </div>
    </div>
  );
}
