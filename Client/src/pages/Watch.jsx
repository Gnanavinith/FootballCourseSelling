import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api.js";
import { ThemeToggle } from "../components/layout/Navbar.jsx";
import SyllabusModal from "../components/course/SyllabusModal.jsx";
import {
  Play,
  Lock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Clock,
  Film,
  AlertCircle,
  FileText,
  Download,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function Watch() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weeks, setWeeks] = useState([]);
  const [url, setUrl] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [mobileTab, setMobileTab] = useState("playlist"); // 'playlist' | 'modules' | 'overview'
  const [syllabusOpen, setSyllabusOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    api(`/me/courses/${courseId}/weeks`)
      .then((r) => {
        const data = r.data || {};
        setCourse(data.course || null);
        setCurrentWeek(data.currentWeek || 1);
        setWeeks(data.weeks || []);
        const enrollment = data.enrollment;
        setPaid(
          enrollment &&
            (enrollment.source === "Paid" || enrollment.source === "paid") &&
            enrollment.status === "Active"
        );
      })
      .catch((e) => setError(e?.message || "Could not load masterclass videos"))
      .finally(() => setLoading(false));
  }, [courseId]);

  const current = weeks.find((w) => w.weekNumber === currentWeek) || {};
  const isLocked = current.status === "Locked";
  const videos = current.videos || [];
  const currentIndex = videos.findIndex((v) => (v._id || v.id) === playingId);
  const currentVideo = currentIndex >= 0 ? videos[currentIndex] : null;
  const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
  const nextVideo = currentIndex >= 0 && currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

  const play = (v) => {
    if (isLocked) return;
    if (!paid) return;
    setUrl("");
    setPlayingId(null);
    setError("");
    api(`/videos/${v._id || v.id}/playback`)
      .then((r) => {
        setUrl((r.data || r).url || "");
        setPlayingId(v._id || v.id);
      })
      .catch((e) => setError(e?.message || "Could not load video stream"));
  };

  const buyCourse = () => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center transition-colors duration-200">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-fg-3 dark:text-zinc-400">Loading masterclass theater...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4 sm:p-6 transition-colors duration-200">
        <div className="max-w-md w-full bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-card dark:shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-base font-bold text-fg dark:text-white mb-1">Unable to Load Stream</h2>
          <p className="text-xs text-fg-3 dark:text-zinc-400 mb-6">{error}</p>
          <Link to="/dashboard" className="btn btn-md btn-primary w-full">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return <div className="p-6 text-center text-xs text-fg-3 dark:text-zinc-400 bg-page min-h-screen">Course not found.</div>;
  }

  const hasSyllabus = Boolean(course.syllabus || course.syllabusUrl || (course.documents && course.documents.length > 0));

  return (
    <div className="min-h-screen bg-page text-fg font-sans flex flex-col selection:bg-gold-400 selection:text-black transition-colors duration-200">
      {/* Cinematic Top Theater Header */}
      <header className="bg-surface/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-line dark:border-zinc-800 px-3.5 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between sticky top-16 z-30 shadow-xs dark:shadow-2xl transition-colors duration-200">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 pr-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-fg-2 hover:text-fg bg-surface-2 hover:bg-surface px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-line transition dark:text-zinc-300 dark:hover:text-white dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-800 shrink-0"
            title="Back to Academy Hub"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden xs:inline">Hub</span>
          </Link>
          <div className="h-4 sm:h-5 w-[1px] bg-line dark:bg-zinc-800 shrink-0"></div>
          <div className="min-w-0">
            <h1 className="text-xs sm:text-sm font-black text-fg dark:text-white truncate max-w-[150px] xs:max-w-[220px] sm:max-w-md">
              {course.title}
            </h1>
            <p className="text-[10px] sm:text-[11px] text-fg-3 dark:text-zinc-400 truncate">
              Module {currentWeek} of {course.totalWeeks || weeks.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!paid && (
            <button onClick={buyCourse} className="btn btn-xs sm:btn-sm btn-primary text-[11px] sm:text-xs font-extrabold px-3 py-1.5">
              <span>Unlock</span>
            </button>
          )}
          <ThemeToggle compact />
        </div>
      </header>

      {/* Main Theater Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 space-y-5 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left / Main Section: Video Player & Overview */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Payment Warning Banner */}
          {!paid && (
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-4 sm:p-6 text-amber-700 dark:text-amber-200 shadow-card dark:shadow-2xl">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-amber-500 text-black rounded-xl sm:rounded-2xl shadow-lg shrink-0">
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm sm:text-base font-bold text-fg dark:text-white">Masterclass Stream Restricted</h2>
                  <p className="mt-1 text-xs text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                    Enrollment required to stream high-definition football training masterclasses and tactical breakdowns.
                  </p>
                  <button
                    type="button"
                    onClick={buyCourse}
                    className="mt-3.5 inline-flex items-center gap-1.5 sm:gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black px-4 sm:px-5 py-2 text-xs font-extrabold transition shadow-lg cursor-pointer"
                  >
                    <span>Enroll Now</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cinematic Video Player Container */}
          <div className="rounded-2xl sm:rounded-3xl bg-black overflow-hidden shadow-card dark:shadow-2xl border border-line dark:border-zinc-800 relative aspect-video flex items-center justify-center group">
            {paid ? (
              url ? (
                <video
                  src={url}
                  controls
                  autoPlay
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-fg-3 dark:text-zinc-400 bg-surface-2 dark:bg-zinc-950 p-6 sm:p-8 text-center transition-colors">
                  <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-surface border border-line dark:bg-zinc-900 dark:border-zinc-800 flex items-center justify-center text-gold-500 dark:text-gold-400 mb-3 sm:mb-4 shadow-sm group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-0.5 sm:ml-1" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-fg dark:text-white">Select a lesson from the playlist below</p>
                  <p className="text-[11px] sm:text-xs text-fg-3 dark:text-zinc-500 mt-1">Cinematic 1080p sports training video</p>
                </div>
              )
            ) : (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 sm:p-8 z-10">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 sm:mb-4">
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-1">Masterclass Locked</h3>
                <p className="text-xs text-zinc-300 max-w-sm mb-4 sm:mb-6">
                  Unlock full access to watch all weekly masterclass videos and drills.
                </p>
                <button
                  onClick={buyCourse}
                  className="btn btn-sm sm:btn-md btn-primary px-6 sm:px-8 font-bold"
                >
                  Unlock Access
                </button>
              </div>
            )}

            {isLocked && paid && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-6 sm:p-8 z-10">
                <Lock className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-3" />
                <h3 className="text-sm sm:text-base font-bold text-white">Module {currentWeek} is Locked</h3>
                <p className="text-xs text-zinc-300 mt-1">Complete previous weekly modules to unlock this masterclass.</p>
              </div>
            )}
          </div>

          {/* Active Lesson Strip & Quick Controls */}
          {currentVideo && (
            <div className="flex items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 text-xs shadow-xs transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gold-400 font-black text-xs text-ink-950 shadow-xs">
                  {currentIndex + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-bold text-fg dark:text-white truncate text-xs sm:text-sm">{currentVideo.title}</p>
                  <span className="text-[11px] text-fg-3 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-gold-500 shrink-0" /> {fmt(currentVideo.durationSeconds || 0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => prevVideo && play(prevVideo)}
                  disabled={!prevVideo}
                  className="p-2 rounded-xl border border-line dark:border-zinc-800 bg-surface-2 dark:bg-zinc-950 text-fg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface transition cursor-pointer"
                  title="Previous lesson"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => nextVideo && play(nextVideo)}
                  disabled={!nextVideo}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-gold-400 text-black font-bold text-xs disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-95 transition cursor-pointer"
                  title="Next lesson"
                >
                  <span className="hidden xs:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Mobile Navigation Tabs (visible only on mobile screens < lg) */}
          <div className="lg:hidden flex rounded-2xl border border-line dark:border-zinc-800 bg-surface-2/60 dark:bg-zinc-950/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => setMobileTab("playlist")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === "playlist"
                  ? "bg-surface dark:bg-zinc-900 text-fg dark:text-white shadow-xs"
                  : "text-fg-3 dark:text-zinc-400 hover:text-fg"
              }`}
            >
              <Film className="w-3.5 h-3.5 text-gold-500" />
              <span>Lessons ({videos.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("modules")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === "modules"
                  ? "bg-surface dark:bg-zinc-900 text-fg dark:text-white shadow-xs"
                  : "text-fg-3 dark:text-zinc-400 hover:text-fg"
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-gold-500" />
              <span>Modules</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("overview")}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mobileTab === "overview"
                  ? "bg-surface dark:bg-zinc-900 text-fg dark:text-white shadow-xs"
                  : "text-fg-3 dark:text-zinc-400 hover:text-fg"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-gold-500" />
              <span>Details</span>
            </button>
          </div>

          {/* Mobile Switchable Content Area (lg:hidden) */}
          <div className="lg:hidden space-y-4">
            {mobileTab === "playlist" && (
              <div className="bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-2xl p-4 shadow-card space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-line dark:border-zinc-800">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-fg dark:text-white flex items-center gap-2">
                    <Film className="w-4 h-4 text-gold-500" />
                    <span>Module {currentWeek} Lessons</span>
                  </h3>
                  <span className="text-[11px] text-fg-3 dark:text-zinc-400 font-bold">
                    {videos.length} drills
                  </span>
                </div>
                <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                  {videos.map((v, index) => {
                    const id = v._id || v.id;
                    const playing = playingId === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => play(v)}
                        disabled={isLocked || !paid}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          playing
                            ? "border-gold-400 bg-gold-400/10 text-fg dark:text-white font-bold"
                            : "border-line bg-surface-2/60 hover:bg-surface text-fg-2 hover:text-fg dark:border-zinc-800 dark:bg-zinc-950"
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                            playing
                              ? "bg-gold-400 text-black shadow-glow"
                              : "bg-surface-2 text-fg-3 border border-line dark:bg-zinc-900 dark:border-transparent"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate font-bold ${playing ? "text-gold-600 dark:text-gold-400" : "text-fg dark:text-white"}`}>
                            {v.title}
                          </p>
                          <span className="text-[11px] text-fg-3 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-gold-500 shrink-0" /> {fmt(v.durationSeconds || 0)}
                          </span>
                        </div>
                        {playing ? (
                          <span className="w-2 h-2 rounded-full bg-gold-400 animate-ping shrink-0" />
                        ) : (
                          <Play className="w-3.5 h-3.5 text-fg-3 shrink-0 opacity-70" />
                        )}
                      </button>
                    );
                  })}
                  {videos.length === 0 && (
                    <div className="py-8 text-center text-fg-3 text-xs">
                      No video lessons uploaded for this module yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {mobileTab === "modules" && (
              <div className="bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-2xl p-4 shadow-card space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-fg-3 dark:text-zinc-400 px-1">
                  Switch Training Module
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {weeks.map((w) => {
                    const active = w.weekNumber === currentWeek;
                    const locked = w.status === "Locked";
                    return (
                      <button
                        key={w.weekNumber}
                        type="button"
                        onClick={() => {
                          if (locked) return;
                          setCurrentWeek(w.weekNumber);
                          setUrl("");
                          setPlayingId(null);
                          setMobileTab("playlist");
                        }}
                        disabled={locked || !paid}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? "border-gold-400 bg-gold-400 text-black font-black shadow-xs"
                            : locked || !paid
                            ? "border-line/60 bg-surface-2/40 text-fg-3/60 opacity-50 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950"
                            : "border-line bg-surface-2 text-fg-2 hover:bg-surface dark:border-zinc-800 dark:bg-zinc-950"
                        }`}
                      >
                        <span className="text-[11px] font-black">M{w.weekNumber}</span>
                        {locked || !paid ? (
                          <Lock className="w-3 h-3 mt-1 opacity-70" />
                        ) : (
                          <CheckCircle2 className={`w-3 h-3 mt-1 ${active ? "text-black" : "text-emerald-500"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mobileTab === "overview" && (
              <div className="bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-card space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-gold-600 dark:text-gold-400 bg-gold-400/10 px-2.5 py-0.5 rounded-full border border-gold-400/20">
                    Module {currentWeek}
                  </span>
                  <span className="text-xs text-fg-3 dark:text-zinc-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gold-500" /> {videos.length} drills
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-fg dark:text-white">
                  {current.title || `Training Module ${currentWeek}`}
                </h2>
                <p className="text-xs text-fg-3 dark:text-zinc-400 leading-relaxed">
                  {current.description || "Master elite techniques, tactical positioning, and professional conditioning drills taught in this module."}
                </p>

                {hasSyllabus && (
                  <div className="pt-3 border-t border-line dark:border-zinc-800 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSyllabusOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-400 text-ink-950 text-xs font-bold rounded-xl transition hover:brightness-95 cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Syllabus</span>
                    </button>
                    {course.syllabusUrl && (
                      <a
                        href={`/api/courses/${course._id}/syllabus/file`}
                        download={`${course.slug || 'course'}-syllabus.pdf`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 hover:bg-surface text-fg text-xs font-bold rounded-xl border border-line transition dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-800"
                      >
                        <Download className="w-3.5 h-3.5 text-gold-500" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Module Overview Card (hidden on mobile, visible on lg screens) */}
          <div className="hidden lg:block bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-card dark:shadow-2xl space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-gold-600 dark:text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full border border-gold-400/20">
                Module {currentWeek} Overview
              </span>
              <span className="text-xs text-fg-3 dark:text-zinc-400 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gold-500 dark:text-gold-400" /> {videos.length} Masterclass Lessons
              </span>
            </div>
            <div>
              <h2 className="text-xl font-black text-fg dark:text-white">
                {current.title || `Training Module ${currentWeek}`}
              </h2>
              <p className="text-xs text-fg-3 dark:text-zinc-400 mt-2 leading-relaxed">
                {current.description || "Master elite techniques, tactical positioning, and professional conditioning drills taught in this module."}
              </p>
            </div>

            {/* Syllabus & Resource Downloads */}
            {hasSyllabus && (
              <div className="pt-4 border-t border-line dark:border-zinc-800 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSyllabusOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gold-400 text-ink-950 text-xs font-bold rounded-2xl transition hover:brightness-95 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Syllabus</span>
                </button>
                {course.syllabusUrl && (
                  <a
                    href={`/api/courses/${course._id}/syllabus/file`}
                    download={`${course.slug || 'course'}-syllabus.pdf`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface text-fg text-xs font-bold rounded-2xl border border-line transition dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-800"
                  >
                    <Download className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                    <span>Download Syllabus PDF</span>
                  </a>
                )}
                {course.documents?.map((doc, idx) => (
                  <a
                    key={idx}
                    href={doc.url || doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-surface-2 hover:bg-surface text-fg text-xs font-bold rounded-2xl border border-line transition dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-white dark:border-zinc-800"
                  >
                    <Download className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                    <span>{doc.name || `Resource ${idx + 1}`}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Module Selector & Video Playlist (Desktop) */}
        <div className="hidden lg:block space-y-6">
          {/* Module Selector Tabs */}
          <div className="bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-5 shadow-card dark:shadow-2xl transition-colors">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-fg-3 dark:text-zinc-400 mb-3 px-1">Curriculum Modules</h3>
            <div className="grid grid-cols-4 gap-2">
              {weeks.map((w) => {
                const active = w.weekNumber === currentWeek;
                const locked = w.status === "Locked";
                return (
                  <button
                    key={w.weekNumber}
                    onClick={() => {
                      if (locked) return;
                      setCurrentWeek(w.weekNumber);
                      setUrl("");
                      setPlayingId(null);
                    }}
                    disabled={locked || !paid}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
                      active
                        ? "border-gold-400 bg-gold-400 text-black shadow-glow font-black"
                        : locked || !paid
                        ? "border-line/60 bg-surface-2/40 text-fg-3/60 opacity-50 cursor-not-allowed dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-600"
                        : "border-line bg-surface-2 hover:border-line-strong hover:bg-surface text-fg-2 hover:text-fg dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-black">M{w.weekNumber}</span>
                    {locked || !paid ? (
                      <Lock className="w-3 h-3 mt-1.5 opacity-70" />
                    ) : (
                      <CheckCircle2 className={`w-3 h-3 mt-1.5 ${active ? "text-black" : "text-emerald-500 dark:text-emerald-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Masterclass Lessons Playlist */}
          <div className="bg-surface dark:bg-zinc-900 border border-line dark:border-zinc-800 rounded-3xl p-6 shadow-card dark:shadow-2xl flex flex-col h-[460px] transition-colors">
            <div className="flex items-center justify-between pb-4 border-b border-line dark:border-zinc-800 mb-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-fg dark:text-white flex items-center gap-2">
                <Film className="w-4 h-4 text-gold-500 dark:text-gold-400" />
                <span>Module {currentWeek} Playlist</span>
              </h3>
              <span className="text-xs text-fg-3 dark:text-zinc-400 font-bold">
                {videos.length} sessions
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
              {videos.map((v, index) => {
                const id = v._id || v.id;
                const playing = playingId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => play(v)}
                    disabled={isLocked || !paid}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer group ${
                      playing
                        ? "border-gold-400 bg-gold-400/10 text-fg dark:text-white shadow-md font-bold"
                        : "border-line bg-surface-2/60 hover:border-line-strong hover:bg-surface text-fg-2 hover:text-fg dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 dark:hover:bg-zinc-900 dark:text-zinc-300"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      playing
                        ? "bg-gold-400 text-black shadow-glow"
                        : "bg-surface-2 text-fg-3 group-hover:bg-surface group-hover:text-fg border border-line dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-zinc-800 dark:group-hover:text-white dark:border-transparent"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs truncate font-bold ${playing ? "text-gold-600 dark:text-gold-400" : "text-fg dark:text-white"}`}>{v.title}</p>
                      <span className="text-[11px] text-fg-3 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-gold-500 dark:text-gold-400" /> {fmt(v.durationSeconds || 0)}
                      </span>
                    </div>
                    {playing ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping shrink-0 shadow-glow" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-fg-3 dark:text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </button>
                );
              })}

              {videos.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-fg-3 dark:text-zinc-500 text-xs">
                  <Film className="w-8 h-8 opacity-40 mb-2" />
                  <p>No masterclass lessons available for this module yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Modal */}
      <SyllabusModal
        course={course}
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
      />
    </div>
  );
}
