import { useEffect, useMemo, useState } from "react";
import { api } from "../../lib/api.js";
import { uploadToCloudinary } from "../../lib/uploadToCloudinary.js";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Film,
  GripVertical,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

/* ---------- Shared classes ---------- */
const field =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-fg outline-none transition placeholder:text-fg-3 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/40";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-fg transition hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40";
const iconBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg text-fg-3 transition hover:bg-surface-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

const STATUS_PILL = {
  Ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Processing: "bg-amber-50 text-amber-700 border-amber-200",
  Uploading: "bg-sky-50 text-sky-700 border-sky-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
};
const pill = "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium";

const MAX_BYTES = 5 * 1024 ** 3; // 5 GB, adjustable per spec
const ALLOWED = [".mp4", ".mov", ".mkv"];
const EMPTY = { course: "", week: 1, title: "", description: "", published: false };

/* Moves the dragged video to the target's position. Only works inside the same course and week. */
function reorder(list, fromId, toId) {
  const from = list.findIndex((x) => x.id === fromId);
  const to = list.findIndex((x) => x.id === toId);
  if (from < 0 || to < 0 || from === to) return list;
  if (list[from].course !== list[to].course || list[from].week !== list[to].week) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

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

function VideoDrawer({ video, courses, onSave, onClose, uploading = false, progress = 0 }) {
  const isNew = !video.id;
  const [f, setF] = useState(video);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (!f.course && courses.length) setF((p) => ({ ...p, course: courses[0].name }));
  }, [courses, f.course]);

  const set = (key) => (e) => setF((p) => ({ ...p, [key]: e.target.value }));
  const course = courses.find((c) => c.name === f.course);

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const ext = picked.name.slice(picked.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      setErrors((p) => ({ ...p, file: "Use an MP4, MOV or MKV file." }));
      setFile(null);
    } else if (picked.size > MAX_BYTES) {
      setErrors((p) => ({ ...p, file: "This file is larger than 5 GB." }));
      setFile(null);
    } else {
      setErrors((p) => ({ ...p, file: undefined }));
      setFile(picked);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    const err = {};
    if (f.title.trim().length < 3) err.title = "Enter a title of at least 3 characters.";
    const w = Number(f.week);
    if (!Number.isInteger(w) || w < 1) err.week = "Enter a week number of 1 or more.";
    else if (course && w > course.weeks) err.week = `${course.name} has ${course.weeks} weeks.`;
    if (isNew && !file) err.file = errors.file || "Choose a video file to upload.";
    else if (errors.file) err.file = errors.file;
    setErrors(err);
    if (Object.keys(err).length) return;
    try {
      await onSave({ ...f, title: f.title.trim(), week: w }, file);
    } catch {
      setErrors((p) => ({ ...p, file: "Upload failed. Please try again." }));
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end" role="dialog" aria-modal="true" aria-labelledby="video-drawer-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <form onSubmit={submit} noValidate className="relative flex h-full w-full max-w-lg flex-col bg-surface shadow-2xl">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-5 sm:px-6">
          <h2 id="video-drawer-title" className="font-display text-lg font-bold tracking-tight text-fg">
            {isNew ? "Upload video" : "Edit video"}
          </h2>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
            <Field label="Course">
              <select className={field} value={f.course} onChange={set("course")}>
                {courses.map((c) => <option key={c.name}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="Week" error={errors.week}>
              <input type="number" inputMode="numeric" min="1" className={field} value={f.week} onChange={set("week")} />
            </Field>
          </div>

          <Field label="Title" error={errors.title}>
            <input className={field} value={f.title} onChange={set("title")} autoFocus />
          </Field>

          <Field label="Description" hint="Students see this under the video.">
            <textarea rows={3} className={field} value={f.description} onChange={set("description")} />
          </Field>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-fg-body">
              {isNew ? "Video file" : "Replace video file (optional)"}
            </span>
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-line-strong bg-surface-2/60 px-4 py-8 text-center transition hover:border-gold-400 hover:bg-surface-2">
              <UploadCloud className="h-7 w-7 text-fg-3" aria-hidden="true" />
              <span className="text-sm font-medium text-fg">{file ? file.name : "Choose a file to upload"}</span>
              <span className="text-xs text-fg-3">MP4, MOV or MKV, up to 5 GB. Uploads resume if your internet drops.</span>
              <input type="file" accept=".mp4,.mov,.mkv,video/*" className="sr-only" onChange={pickFile} />
            </label>
            {errors.file && <p className="mt-1 text-xs font-medium text-danger-600">{errors.file}</p>}
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-line bg-surface-2/60 p-4">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-fg"
              checked={f.published}
              onChange={(e) => setF((p) => ({ ...p, published: e.target.checked }))}
            />
            <span>
              <span className="block text-sm font-medium text-fg">Show to students</span>
              <span className="text-xs text-fg-3">Hidden videos stay as drafts. Students only see published videos in their unlocked week.</span>
            </span>
          </label>
        </div>

        {uploading && (
          <div className="shrink-0 border-t border-line px-5 py-3 sm:px-6">
            <div className="mb-1.5 flex items-center justify-between text-xs text-fg-3">
              <span>Uploading…</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
              <div className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line px-5 py-4 sm:px-6">
          <button type="button" onClick={onClose} disabled={uploading} className={btnGhost}>Cancel</button>
          <button type="submit" disabled={uploading} className={btnPrimary}>
            {uploading ? `Uploading ${progress}%` : (isNew ? "Start upload" : (file ? "Start upload" : "Save changes"))}
          </button>
        </div>
      </form>
    </div>
  );
}

function ConfirmDelete({ video, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="del-title">
      <div className="absolute inset-0 bg-ink-950/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-2xl">
        <h2 id="del-title" className="font-display text-lg font-bold tracking-tight text-fg">Delete “{video.title}”?</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-2">
          This removes the video from Week {video.week} of {video.course} and deletes the file from Bunny Stream. It cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
          <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1">
            Delete video
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ video, onClose }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api(`/videos/${video.id}/preview`)
      .then((r) => { if (active) setUrl((r.data || r).url || ""); })
      .catch((e) => { if (active) setError(e?.message || "Could not load preview"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [video.id]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="prev-title">
      <div className="absolute inset-0 bg-ink-950/60" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl rounded-xl border border-line bg-surface p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 id="prev-title" className="truncate font-display text-lg font-bold tracking-tight text-fg">{video.title}</h2>
            <p className="text-sm text-fg-3">{video.course} · Week {video.week} · Student view</p>
          </div>
          <button type="button" onClick={onClose} className={iconBtn} aria-label="Close preview">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 aspect-video overflow-hidden rounded-lg bg-fg">
          {loading && <div className="flex h-full items-center justify-center text-sm text-fg-3">Loading player…</div>}
          {!loading && error && <div className="flex h-full items-center justify-center px-4 text-center text-sm text-red-400">{error}</div>}
          {!loading && url && <video src={url} controls autoPlay className="h-full w-full" />}
        </div>
        {video.description && <p className="mt-4 text-sm text-fg-3">{video.description}</p>}
      </div>
    </div>
  );
}

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("All");
  const [status, setStatus] = useState("All");
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [overId, setOverId] = useState(null);
  const [toast, setToast] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let cs = [];
    api("/courses")
      .then((r) => {
        cs = (r.data || []).map((c) => ({ name: c.title, weeks: c.totalWeeks, _id: c._id }));
        setCourses(cs);
        return api("/videos");
      })
      .then((r) => {
        setVideos((r.data || []).map((v) => {
          const c = cs.find((x) => x._id === v.courseId) || {};
          return { ...v, id: v._id, week: v.weekNumber, course: c.name || "", status: v.status, published: v.published };
        }));
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(
    () =>
      videos.filter(
        (v) =>
          v.title.toLowerCase().includes(q.toLowerCase()) &&
          (course === "All" || v.course === course) &&
          (status === "All" || v.status === status)
      ),
    [videos, q, course, status]
  );

  const groups = useMemo(() => {
    return courses.map((c) => {
      const inCourse = filtered.filter((v) => v.course === c.name);
      const weeks = [...new Set(inCourse.map((v) => v.week))].sort((a, b) => a - b);
      return { ...c, weeks: weeks.map((w) => ({ week: w, items: inCourse.filter((v) => v.week === w) })) };
    }).filter((g) => g.weeks.length > 0);
  }, [filtered, courses]);

  const filtersOn = q || course !== "All" || status !== "All";

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setEditing(null);
      setDeleting(null);
      setPreviewing(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = editing || deleting || previewing ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [editing, deleting, previewing]);

  const mapVideo = (v, courseName) => ({
    ...v,
    id: v._id || v.id,
    course: courseName || v.course || "",
    status: v.status || "Uploading",
    published: v.published ?? false,
    progress: v.progress ?? 0,
  });

  const save = async (data, file) => {
    const course = courses.find((c) => c.name === data.course) || courses[0];
    if (!file) {
      if (data.id) {
        const res = await api(`/videos/${data.id}`, {
          method: "PUT",
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            published: data.published,
            weekNumber: data.week,
            courseId: course?._id,
          }),
        });
        const v = res.data || res;
        setVideos((vs) => vs.map((x) => (x.id === data.id ? { ...x, ...data, ...mapVideo(v, data.course) } : x)));
        setToast("Video saved");
      }
      setEditing(null);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      const ticketRes = await api("/videos/upload-url", {
        method: "POST",
        body: JSON.stringify({ courseId: course?._id, weekNumber: data.week }),
      });
      const ticket = ticketRes.data || ticketRes;
      const videoId = ticket.video?._id || ticket.video?.id;

      setVideos((vs) => [
        ...vs,
        mapVideo(ticket.video, data.course),
      ].map((v) => (v.id === videoId ? { ...v, title: data.title, status: "Uploading", progress: 0 } : v)));

      const result = await uploadToCloudinary(file, ticket, (p) => {
        setUploadProgress(p);
        setVideos((vs) => vs.map((v) => (v.id === videoId ? { ...v, progress: p } : v)));
      });

      await api(`/videos/${videoId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          published: data.published,
          weekNumber: data.week,
          courseId: course?._id,
          status: "Ready",
          durationSeconds: Math.round(result.duration || 0),
        }),
      });

      setVideos((vs) =>
        vs.map((v) =>
          v.id === videoId ? { ...v, ...data, id: videoId, status: "Ready", progress: 100 } : v
        )
      );

      if (data.id) {
        try { await api(`/videos/${data.id}`, { method: "DELETE" }); } catch {}
        setVideos((vs) => vs.filter((x) => x.id !== data.id));
      }

      setToast("Upload started");
    } catch (err) {
      setToast(err?.message || "Upload failed");
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
    setEditing(null);
  };

  const togglePublish = async (v) => {
    try {
      await api(`/videos/${v.id}/publish`, { method: "PATCH", body: JSON.stringify({ published: !v.published }) });
      setVideos((vs) => vs.map((x) => (x.id === v.id ? { ...x, published: !x.published } : x)));
      setToast(v.published ? "Video hidden from students" : "Video visible to students");
    } catch (e) { setToast(e?.message || "Failed"); }
  };

  const retry = (v) => {
    setVideos((vs) => vs.map((x) => (x.id === v.id ? { ...x, status: "Uploading", progress: 0 } : x)));
    setToast("Retrying upload");
  };

  const confirmDelete = async () => {
    try {
      await api(`/videos/${deleting.id}`, { method: "DELETE" });
      setVideos((vs) => vs.filter((x) => x.id !== deleting.id));
      setDeleting(null);
      setToast("Video deleted");
    } catch (e) { setToast(e?.message || "Failed"); }
  };

  const move = (v, dir) => {
    const group = videos.filter((x) => x.course === v.course && x.week === v.week);
    const i = group.findIndex((x) => x.id === v.id);
    const neighbour = group[i + dir];
    if (neighbour) setVideos((vs) => reorder(vs, v.id, neighbour.id));
  };

  const onDrop = (target) => {
    if (dragId && dragId !== target.id) setVideos((vs) => reorder(vs, dragId, target.id));
    setDragId(null);
    setOverId(null);
  };

  const clearFilters = () => { setQ(""); setCourse("All"); setStatus("All"); };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-fg">Weekly videos</h1>
          <p className="mt-1 text-sm text-fg-3">
            {videos.length} videos, {videos.filter((v) => v.status === "Ready").length} ready
          </p>
        </div>
        <button type="button" onClick={() => setEditing(EMPTY)} className={`${btnPrimary} self-start sm:self-auto`}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Upload video
        </button>
      </div>

      {/* Filters */}
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_12rem_11rem]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-3" aria-hidden="true" />
          <input type="search" className={`${field} pl-9`} placeholder="Search videos" aria-label="Search videos" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className={field} aria-label="Filter by course" value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="All">All courses</option>
          {courses.map((c) => <option key={c.name}>{c.name}</option>)}
        </select>
        <select className={field} aria-label="Filter by upload status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          <option>Uploading</option>
          <option>Processing</option>
          <option>Ready</option>
          <option>Failed</option>
        </select>
      </div>

      {groups.map((g) => {
        const covered = new Set(videos.filter((v) => v.course === g.name).map((v) => v.week));
        const totalWeeks = courses.find((c) => c.name === g.name)?.weeks || 0;
        const missing = Array.from({ length: totalWeeks }, (_, i) => i + 1).filter((w) => !covered.has(w));
        return (
          <section key={g.name} className="overflow-hidden rounded-xl border border-line bg-surface">
            <header className="flex flex-col gap-1 border-b border-line px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-sm font-semibold tracking-tight text-fg">{g.name}</h2>
              {!filtersOn && missing.length > 0 && (
                <p className="text-xs text-amber-700">
                  No video yet for {missing.length === 1 ? "week" : "weeks"} {missing.join(", ")}
                </p>
              )}
            </header>

            {g.weeks.map(({ week, items }) => (
              <div key={week} className="border-b border-line last:border-b-0">
                <p className="bg-surface-2/60 px-5 py-2 text-xs font-medium text-fg-3">
                  Week {week} · {items.length} {items.length === 1 ? "video" : "videos"}
                </p>
                <ul className="divide-y divide-line">
                  {items.map((v, idx) => (
                    <li
                      key={v.id || idx}
                      draggable
                      onDragStart={() => setDragId(v.id)}
                      onDragEnd={() => { setDragId(null); setOverId(null); }}
                      onDragOver={(e) => { e.preventDefault(); setOverId(v.id); }}
                      onDrop={() => onDrop(v)}
                      className={`flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center ${dragId === v.id ? "opacity-40" : ""} ${overId === v.id && dragId && dragId !== v.id ? "bg-gold-400/10" : ""}`}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="hidden cursor-grab text-fg-3 active:cursor-grabbing sm:block" aria-hidden="true">
                          <GripVertical className="h-5 w-5" />
                        </span>
                        <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-md bg-fg text-gold-400">
                          <Film className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-fg">{v.title}</p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-3">
                            <span className={`${pill} ${STATUS_PILL[v.status] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>{v.status}</span>
                            {!v.published && <span className={`${pill} border-slate-200 bg-slate-100 text-slate-600`}>Hidden</span>}
                            {v.duration && <span>{v.duration}</span>}
                          </p>

                          {v.status === "Uploading" && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuenow={v.progress} aria-valuemin={0} aria-valuemax={100} aria-label="Upload progress">
                                <div className="h-full rounded-full bg-sky-500 transition-[width] duration-500" style={{ width: `${v.progress}%` }} />
                              </div>
                              <span className="w-9 text-xs tabular-nums text-fg-3">{v.progress}%</span>
                            </div>
                          )}
                          {v.status === "Processing" && (
                            <p className="mt-2 text-xs text-fg-3">Encoding 360p, 720p and 1080p. This can take a few minutes.</p>
                          )}
                          {v.status === "Failed" && (
                            <p className="mt-2 text-xs text-red-600">The upload did not finish. Retry to upload it again.</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-0.5">
                        <button type="button" onClick={() => move(v, -1)} disabled={idx === 0} className={iconBtn} title="Move up" aria-label={`Move ${v.title} up`}>
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => move(v, 1)} disabled={idx === items.length - 1} className={iconBtn} title="Move down" aria-label={`Move ${v.title} down`}>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {v.status === "Failed" && (
                          <button type="button" onClick={() => retry(v)} className={`${iconBtn} text-red-600 hover:bg-red-50`} title="Retry upload" aria-label={`Retry upload for ${v.title}`}>
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        <button type="button" onClick={() => setPreviewing(v)} disabled={v.status !== "Ready"} className={iconBtn} title="Preview as student" aria-label={`Preview ${v.title} as student`}>
                          <Play className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => togglePublish(v)} className={iconBtn} title={v.published ? "Hide from students" : "Show to students"} aria-label={v.published ? `Hide ${v.title}` : `Show ${v.title}`}>
                          {v.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button type="button" onClick={() => setEditing(v)} className={iconBtn} title="Edit" aria-label={`Edit ${v.title}`}>
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => setDeleting(v)} className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Delete" aria-label={`Delete ${v.title}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        );
      })}

      {groups.length === 0 && (
        <div className="rounded-xl border border-line bg-surface px-6 py-14 text-center">
          <p className="text-sm font-semibold text-fg">{filtersOn ? "No videos match these filters" : "No videos yet"}</p>
          <p className="mt-1 text-sm text-fg-3">
            {filtersOn ? "Try a different search or clear the filters." : "Upload the Week 1 video of your first course to get started."}
          </p>
          <button type="button" onClick={filtersOn ? clearFilters : () => setEditing(EMPTY)} className={`${btnGhost} mt-4`}>
            {filtersOn ? "Clear filters" : "Upload video"}
          </button>
        </div>
      )}

      {editing && <VideoDrawer key={editing.id ?? "new"} video={editing} courses={courses} onSave={save} onClose={() => setEditing(null)} uploading={uploading} progress={uploadProgress} />}
      {deleting && <ConfirmDelete video={deleting} onConfirm={confirmDelete} onClose={() => setDeleting(null)} />}
      {previewing && <PreviewModal video={previewing} onClose={() => setPreviewing(null)} />}

      <div aria-live="polite" className="pointer-events-none fixed bottom-5 left-1/2 z-[70] w-max max-w-[calc(100vw-2rem)] -translate-x-1/2">
        {toast && <div className="rounded-lg bg-fg px-4 py-2.5 text-sm font-medium text-surface shadow-lg">{toast}</div>}
      </div>
    </div>
  );
}