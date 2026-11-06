import { useEffect } from "react";
import { Download, ExternalLink, FileText, Printer, X } from "lucide-react";

export default function SyllabusModal({ course, open, onClose }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !course) return null;

  const hasPastedSyllabus = Boolean(course.syllabus && course.syllabus.trim());
  const hasUploadedPdf = Boolean(course.syllabusUrl);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="syllabus-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/70 backdrop-blur-sm transition-opacity print:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-3xl border border-line bg-surface text-fg shadow-2xl print:max-h-none print:shadow-none print:border-none print:w-full print:m-0 print:p-0">
        {/* Sticky Header Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/95 px-5 py-4 backdrop-blur print:hidden">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-400 font-black text-ink-950 shadow-glow">
              VS
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-pitch-600 dark:text-pitch-400">
                Course Syllabus
              </p>
              <h2 id="syllabus-modal-title" className="text-sm sm:text-base font-bold text-fg truncate">
                {course.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasUploadedPdf && (
              <>
                <a
                  href={`/api/courses/${course._id}/syllabus/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-fg hover:bg-surface transition"
                  title="Open in new window"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>New Tab</span>
                </a>
                <a
                  href={`/api/courses/${course._id}/syllabus/file`}
                  download={`${course.slug || 'course'}-syllabus.pdf`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gold-400 px-3.5 py-2 text-xs font-bold text-ink-950 shadow-sm transition hover:brightness-95 active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </a>
              </>
            )}

            {hasPastedSyllabus && (
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-3 py-2 text-xs font-semibold text-fg hover:bg-surface transition"
                title="Print syllabus"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-fg-3 transition hover:bg-surface-2 hover:text-fg"
              aria-label="Close syllabus"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-7 space-y-6 print:p-0">
          {/* Header overview */}
          <div className="rounded-2xl border border-line bg-surface-2/60 p-4 sm:p-5">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-gold-400 text-ink-950 text-xs font-bold">
                {course.level || "All Levels"}
              </span>
              {course.totalWeeks && (
                <span className="px-2.5 py-0.5 rounded-full bg-surface border border-line text-xs font-medium text-fg-3">
                  {course.totalWeeks} Weeks
                </span>
              )}
            </div>
            <h1 className="text-lg sm:text-xl font-black text-fg">{course.title}</h1>
            {course.shortDesc && (
              <p className="mt-1.5 text-xs sm:text-sm text-fg-3 leading-relaxed">{course.shortDesc}</p>
            )}
          </div>

          {/* Uploaded PDF embedded viewer directly inside website */}
          {hasUploadedPdf && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-fg-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gold-500" /> Official Syllabus Document
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/courses/${course._id}/syllabus/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-fg-3 hover:text-fg font-medium"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Full view
                  </a>
                  <a
                    href={`/api/courses/${course._id}/syllabus/file`}
                    download={`${course.slug || 'course'}-syllabus.pdf`}
                    className="inline-flex items-center gap-1 text-xs text-gold-600 dark:text-gold-400 hover:underline font-bold ml-2"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              </div>

              <div className="w-full h-[65vh] min-h-[480px] rounded-2xl border border-line overflow-hidden bg-surface-2 shadow-inner">
                <iframe
                  src={`/api/courses/${course._id}/syllabus/file#toolbar=1&navpanes=0`}
                  title={`${course.title} Syllabus PDF`}
                  className="w-full h-full border-0 bg-white"
                />
              </div>
            </div>
          )}

          {/* Admin Pasted Syllabus Content */}
          {hasPastedSyllabus && (
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-fg-3">
                Curriculum &amp; Syllabus Details
              </h3>
              <div className="whitespace-pre-wrap rounded-2xl border border-line bg-surface p-5 sm:p-6 text-xs sm:text-sm leading-relaxed text-fg-2 shadow-xs font-sans">
                {course.syllabus}
              </div>
            </div>
          )}

          {!hasPastedSyllabus && !hasUploadedPdf && (
            <div className="py-12 text-center text-sm text-fg-3">
              <FileText className="h-10 w-10 mx-auto text-fg-3/40 mb-2" />
              <p className="font-semibold text-fg">No syllabus content added yet</p>
              <p className="text-xs text-fg-3 mt-1">
                The academy coach has not yet uploaded a syllabus PDF or pasted curriculum details for this masterclass.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
