import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Reveal from "../components/common/Reveal.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { dummyCourses, getDummyCourseBySlug } from "../data/dummyCourses.js";
import { courseService } from "../services/course.service.js";
import { startPayment } from "../services/payment.service.js";
import { CourseRating } from "../components/course/Rating.jsx";
import SyllabusModal from "../components/course/SyllabusModal.jsx";
import {
  CheckCircle2,
  Clock,
  Play,
  FileText,
  Download,
  ExternalLink,
  Maximize2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  Award,
  Calendar,
  Sparkles,
  Lock,
} from "lucide-react";

const USE_DUMMY_DATA = false;
const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const FAQS = [
  { q: "When does the masterclass start?", a: "Module 1 opens immediately upon successful payment confirmation." },
  { q: "How does the weekly drip work?", a: "A new professional training module unlocks every 7 days to ensure structured progression and skill retention." },
  { q: "Can I stream masterclasses on mobile?", a: "Yes. All HD training sessions stream seamlessly on phones, tablets, and computers." },
  { q: "What if I have questions before enrolling?", a: "Reach out via our contact page and our coaching staff will respond within 24 hours." },
  { q: "Is my payment secure?", a: "Yes. All payments are processed by Razorpay over an encrypted connection. We never see or store your card, UPI or bank details." },
];

const PAYMENT_METHODS = ["UPI", "Cards", "Netbanking", "Wallets"];

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};

const toList = (res) => (Array.isArray(res) ? res : res?.data || res?.courses || []);

/* Trust badge shown near every buy button */
function SecurePayment({ variant = "inline" }) {
  if (variant === "hero") {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs font-semibold text-fg-3">
        <span className="inline-flex items-center gap-1.5 text-gold-600 dark:text-gold-400">
          <Lock className="w-3.5 h-3.5" /> Secure checkout by Razorpay
        </span>
        <span aria-hidden="true" className="hidden sm:inline text-fg-3">•</span>
        <span>{PAYMENT_METHODS.join(" • ")}</span>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-fg-3">
        <Lock className="w-3 h-3 text-pitch-600 dark:text-pitch-400" /> Secured by Razorpay
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-gold-500/30 bg-gold-500/[0.07] p-4 dark:border-gold-400/25 dark:bg-gold-400/[0.06]">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-400/20 text-gold-600 dark:text-gold-400">
          <Lock className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-fg">100% Secure Payment</p>
          <p className="text-[11px] text-fg-3">Powered by Razorpay</p>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5 text-[11px] sm:text-xs text-fg-2">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pitch-600 dark:text-pitch-400" />
          <span>Encrypted (SSL/TLS) checkout</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pitch-600 dark:text-pitch-400" />
          <span>PCI DSS compliant payment gateway</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pitch-600 dark:text-pitch-400" />
          <span>We never see or store your card, UPI or bank details</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pitch-600 dark:text-pitch-400" />
          <span>Instant confirmation email after payment</span>
        </li>
      </ul>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PAYMENT_METHODS.map((m) => (
          <span
            key={m}
            className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[10px] font-bold text-fg-2"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [others, setOthers] = useState([]);
  const ctaRef = useRef(null);

  usePageMeta({ title: course ? `${course.title} | Masterclass Academy` : undefined });

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    const request = USE_DUMMY_DATA ? Promise.resolve(getDummyCourseBySlug(slug)) : courseService.get(slug);
    request
      .then((res) => {
        if (cancelled) return;
        const found = USE_DUMMY_DATA ? res : res?.data ?? res;
        setCourse(found && found.title ? found : null);
        if (!found || !found.title) setError("Masterclass not found.");
      })
      .catch((e) => !cancelled && setError(e.message || "Could not load masterclass"))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    const request = USE_DUMMY_DATA ? Promise.resolve(dummyCourses) : courseService.list();
    request
      .then((res) => {
        if (cancelled) return;
        setOthers(toList(res).filter((c) => c.title && (c.slug || c._id) !== slug && c._id !== slug));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, [course]);

  const loggedIn = !!readUser();

  const buy = async () => {
    setPayError("");
    const user = readUser();
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/courses/${slug}` } } });
      return;
    }
    if (!course || paying) return;
    setPaying(true);
    try {
      await startPayment({
        studentId: user.id ?? user._id,
        courseId: course._id,
        amount: course.price,
        description: course.title,
        onSuccess: () => navigate("/dashboard"),
        onError: (err) => {
          setPaying(false);
          setPayError(err || "Payment failed. Please try again.");
        },
        onClose: () => setPaying(false),
      });
    } catch (e) {
      setPayError(e?.message || "Payment initialization failed. Please try again.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-gold-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-fg-3">Loading masterclass details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-page flex items-center justify-center p-6">
        <div className="card card-body p-8 sm:p-10 text-center max-w-md mx-auto shadow-card">
          <ShieldCheck className="w-12 h-12 text-gold-500 mx-auto mb-3" />
          <h1 className="text-lg font-bold text-fg mb-1">{error || "Masterclass Not Found"}</h1>
          <p className="text-xs text-fg-3 mb-6">The training program may have been updated or removed.</p>
          <Link to="/courses" className="btn btn-md btn-primary w-full">Browse Masterclasses</Link>
        </div>
      </main>
    );
  }

  const weeks = Number(course.totalWeeks || course.weeks || 0);
  const free = course.price === 0;
  const priceText = free ? "Free Access" : inr.format(course.price ?? 0);
  const buyLabel = free ? "Enroll For Free" : "Enroll & Unlock Masterclass";
  const lang = course.language === "Tamil" ? "ta" : undefined;
  const outcomes = Array.isArray(course.outcomes) ? course.outcomes : [];
  const titles = course.weekTitles || course.outline?.map((o) => o.title) || [];
  const weekRows = Array.from({ length: weeks }, (_, i) => ({
    n: i + 1,
    title: titles[i] || `Training Module ${i + 1}`,
    when: i === 0 ? "Unlocked immediately upon enrollment" : `Unlocks ${i * 7} days after start`,
  }));
  const shownWeeks = showAllWeeks ? weekRows : weekRows.slice(0, 5);

  const features = [
    weeks ? `${weeks} structured weekly training modules` : "Weekly professional training modules",
    "Module 1 opens straight after payment confirmation",
    "Weekly drip system unlocks new masterclasses every 7 days",
    course.language ? `Instruction available in ${course.language}` : "Bilingual guidance (English & Tamil)",
    "Secure streaming on mobile, tablet, and desktop",
    "Official syllabus PDF and training playbooks included",
  ];

  const buyButton = ({ className = "", size = "btn-lg", short = false, ...rest } = {}) => (
    <button
      type="button"
      onClick={buy}
      disabled={paying}
      className={`btn ${size} btn-primary shadow-glow transition-all active:scale-[0.98] ${className}`}
      {...rest}
    >
      {paying ? (
        <>
          <span className="spinner" aria-hidden="true" /> Opening secure checkout...
        </>
      ) : (
        <>
          {!free && <Lock className="w-4 h-4 mr-1 shrink-0" aria-hidden="true" />}
          <span>{short && !free ? "Enroll Now" : buyLabel}</span>
          <ArrowRight className="w-4 h-4 ml-1 shrink-0" />
        </>
      )}
    </button>
  );

  return (
    <main className="min-h-screen bg-page text-fg-body font-sans transition-colors duration-300 pb-24 sm:pb-0 overflow-x-hidden">
      {/* Cinematic Hero Section */}
      <section className="relative overflow-hidden bg-surface py-10 sm:py-14 lg:py-16 border-b border-line">
        <div className="container-page relative z-10 grid gap-8 lg:gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          
          {/* Left: Course Info & CTAs */}
          <div className="order-2 lg:order-1 space-y-5 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {weeks > 0 && <span className="badge badge-gold">{weeks} Weeks Masterclass</span>}
              {course.level && <span className="badge badge-green">{course.level}</span>}
              {course.language && <span className="badge badge-gray">{course.language}</span>}
            </div>

            <h1 lang={lang} className="font-display text-2xl sm:text-4xl lg:text-5xl font-black text-fg tracking-tight leading-tight break-words">
              {course.title}
            </h1>

            {course.description && (
              <p lang={lang} className="text-fg-3 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl">
                {course.description}
              </p>
            )}

            <div ref={ctaRef} className="pt-2 sm:pt-4 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                <span className="font-display text-3xl sm:text-4xl font-black text-gold-600 dark:text-gold-400">{priceText}</span>
                <span className="text-xs text-fg-3">{free ? "No payment required" : "Full lifetime masterclass access"}</span>
              </div>
              <div>
                {buyButton({ className: "w-full sm:w-auto min-h-12 sm:px-10 justify-center" })}
              </div>
              {!free && <SecurePayment variant="hero" />}
              {payError && (
                <p role="alert" className="text-xs font-semibold text-danger-500">{payError}</p>
              )}
            </div>
          </div>

          {/* Right: Media Card */}
          <div className="order-1 lg:order-2 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-line bg-surface-2 shadow-sm aspect-video flex items-center justify-center group">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.thumbnailAlt || course.title}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <Play className="w-16 h-16 text-gold-400/80 animate-pulse" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-white/10">
                <Play className="w-3 h-3 text-gold-400 fill-current" /> HD Masterclass Preview
              </span>
              <span className="bg-gold-400 text-black px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl">Verified Curriculum</span>
            </div>
          </div>
        </div>
      </section>

      {/* Course Details, Syllabus & Features */}
      <div className="container-page py-10 sm:py-16">
        <div className="grid items-start gap-8 lg:gap-10 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-8 sm:space-y-12">

            {/* What you will learn / Outcomes */}
            {outcomes.length > 0 && (
              <div className="card card-body p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
                <h2 className="font-display text-lg sm:text-xl font-black text-fg flex items-center gap-2">
                  <Target className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0" /> What You Will Master
                </h2>
                <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                  {outcomes.map((o) => (
                    <div key={o} className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-surface-2 border border-line text-xs text-fg-2">
                      <CheckCircle2 className="w-4 h-4 text-pitch-600 dark:text-pitch-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{o}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Pasted Syllabus Content */}
            {course.syllabus && course.syllabus.trim() && (
              <div className="card card-body p-5 sm:p-8 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div>
                    <h2 className="font-display text-lg sm:text-xl font-black text-fg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0" /> Course Syllabus &amp; Curriculum
                    </h2>
                    <p className="mt-1 text-xs text-fg-3">
                      Official curriculum and module breakdown provided by coach.
                    </p>
                  </div>
                </div>
                <div className="whitespace-pre-wrap rounded-2xl bg-surface-2 p-4 sm:p-6 text-xs sm:text-sm leading-relaxed text-fg-2 border border-line font-sans">
                  {course.syllabus}
                </div>
              </div>
            )}

            {/* Official Syllabus PDF Document */}
            {course.syllabusUrl && (
              <div className="card card-body p-5 sm:p-8 shadow-sm space-y-4 border-l-4 border-l-gold-400">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gold-400/20 text-gold-600 dark:text-gold-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-fg">Official Syllabus Document</h3>
                      <p className="text-xs text-fg-3">Verified course curriculum and training schedule uploaded by the coach.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-stretch gap-2 w-full sm:w-auto sm:shrink-0 [&>*]:justify-center [&>*]:min-h-11 [&>*:last-child]:hidden sm:[&>*:last-child]:inline-flex">
                    <button
                      type="button"
                      onClick={() => setSyllabusOpen(true)}
                      className="btn btn-sm btn-primary inline-flex items-center gap-1.5 font-bold cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Open Fullscreen</span>
                    </button>
                    <a
                      href={`/api/courses/${course._id}/syllabus/file`}
                      download={`${course.slug || 'course'}-syllabus.pdf`}
                      className="btn btn-sm border border-line dark:border-zinc-700 inline-flex items-center gap-1.5 font-semibold hover:bg-surface-2 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </a>
                    <a
                      href={`/api/courses/${course._id}/syllabus/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm border border-line dark:border-zinc-700 inline-flex items-center gap-1.5 font-semibold hover:bg-surface-2 transition"
                      title="Open in new window"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Embedded PDF Viewer in website */}
                <div className="relative hidden sm:block w-full rounded-2xl border border-line overflow-hidden bg-surface-2 shadow-inner">
                  <iframe
                    src={`/api/courses/${course._id}/syllabus/file#toolbar=1&navpanes=0`}
                    title={`${course.title} Syllabus PDF`}
                    className="w-full h-[650px] min-h-[500px] border-0 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Weekly Modules */}
            {weeks > 0 && (
              <div className="card card-body p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-lg sm:text-xl font-black text-fg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0" /> Weekly Modules ({weeks})
                  </h2>
                  <span className="text-[11px] sm:text-xs font-bold px-2.5 py-1 bg-surface-2 text-fg border border-line rounded-full shrink-0">
                    {weeks} Modules
                  </span>
                </div>
                <p className="text-xs text-fg-3">
                  Designed for progressive skill stacking. Each module unlocks sequentially every 7 days.
                </p>

                <div className="space-y-2.5 sm:space-y-3">
                  {shownWeeks.map((w) => (
                    <div
                      key={w.n}
                      className="flex items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-surface-2 border border-line transition hover:border-line-strong"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gold-400 text-ink-950 font-black text-xs flex items-center justify-center shrink-0 shadow-xs mt-0.5 sm:mt-0">
                          M{w.n}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-fg leading-snug break-words">{w.title}</h4>
                          <span className="text-[10px] sm:text-[11px] text-fg-3 block leading-snug">{w.when}</span>
                        </div>
                      </div>
                      <span className="hidden sm:inline-block text-[10px] sm:text-xs text-pitch-700 dark:text-pitch-300 font-semibold shrink-0 bg-pitch-500/10 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg border border-pitch-500/20">
                        HD Video
                      </span>
                    </div>
                  ))}
                </div>

                {weekRows.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllWeeks((v) => !v)}
                    className="btn btn-sm btn-outline w-full justify-center"
                  >
                    {showAllWeeks ? "Show fewer modules" : `View all ${weekRows.length} modules`}
                  </button>
                )}
              </div>
            )}

            {/* Course Features / Included */}
            <div className="card card-body p-5 sm:p-8 shadow-sm space-y-5 sm:space-y-6">
              <h2 className="font-display text-lg sm:text-xl font-black text-fg flex items-center gap-2">
                <Award className="w-5 h-5 text-gold-600 dark:text-gold-400 shrink-0" /> Masterclass Features &amp; Perks
              </h2>
              <div className="grid gap-2.5 sm:gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-2xl bg-surface-2 border border-line text-xs text-fg-2">
                    <Zap className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Questions */}
            <div className="card card-body p-5 sm:p-8 shadow-sm space-y-4">
              <h2 className="font-display text-lg sm:text-xl font-black text-fg mb-3 sm:mb-4">Frequently Asked Questions</h2>
              <div className="space-y-2.5 sm:space-y-3">
                {FAQS.map((f) => (
                  <details key={f.q} className="group rounded-2xl border border-line bg-surface-2 p-3.5 sm:p-4 open:border-gold-400">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-bold text-xs sm:text-sm text-fg">
                      <span className="pr-2">{f.q}</span>
                      <span className="text-gold-600 dark:text-gold-400 font-bold group-open:rotate-45 transition-transform shrink-0">+</span>
                    </summary>
                    <p className="mt-2 text-xs text-fg-2 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>

            <CourseRating courseId={course._id} />
          </div>

          {/* Sticky Checkout Sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-6">
            <div className="card card-body p-5 sm:p-6 shadow-sm space-y-5 sm:space-y-6">
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-fg-3 font-bold">Tuition Investment</span>
                <p className="font-display text-3xl sm:text-4xl font-black text-fg mt-1">{priceText}</p>
              </div>

              {buyButton({ className: "w-full py-3.5 sm:py-4 justify-center" })}

              {!free && <SecurePayment />}

              <div className="space-y-2.5 sm:space-y-3 pt-4 border-t border-line text-xs text-fg-2">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-pitch-600 dark:text-pitch-400 shrink-0" />
                  <span>Instant access to Module 1</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <span>Weekly drip masterclass modules</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-gold-600 dark:text-gold-400 shrink-0" />
                  <span>Includes syllabus &amp; training playbook</span>
                </div>
              </div>

              <div className="pt-2 text-center">
                <Link to="/contact" className="text-xs font-semibold text-gold-600 dark:text-gold-400 hover:underline">
                  Have questions? Contact our coaches
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Masterclasses */}
      {others.length > 0 && (
        <section className="border-t border-line py-12 sm:py-16 bg-surface-2/40">
          <div className="container-page space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-gold-600 dark:text-gold-400 tracking-wider">Expand Your Skills</span>
                <h2 className="font-display text-lg sm:text-2xl font-black text-fg">Other Academy Masterclasses</h2>
              </div>
              <Link to="/courses" className="text-xs font-bold text-fg hover:text-gold-600 dark:hover:text-gold-400 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {others.slice(0, 3).map((oc) => (
                <Link
                  key={oc._id}
                  to={`/courses/${oc.slug || oc._id}`}
                  className="group block rounded-2xl border border-line bg-surface p-4 shadow-xs transition-all hover:border-gold-400 hover:-translate-y-1"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-3">
                    {oc.thumbnail ? (
                      <img src={oc.thumbnail} alt={oc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-fg-3">
                        <Play className="w-8 h-8 text-gold-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="badge badge-gold !text-[10px] !py-0.5">{oc.level || "All Levels"}</span>
                    {oc.totalWeeks && <span className="text-[11px] text-fg-3">{oc.totalWeeks} Weeks</span>}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-fg group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors line-clamp-1">
                    {oc.title}
                  </h3>
                  <p className="text-xs font-black text-gold-600 dark:text-gold-400 mt-2">
                    {oc.price === 0 ? "Free Access" : inr.format(oc.price ?? 0)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Floating Mobile Bottom Enrollment Bar */}
      {showBar && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 border-t border-line p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden shadow-2xl backdrop-blur-md animate-fade-up">
          <div className="container-page flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold text-fg-3 tracking-wider">Tuition</p>
              <p className="font-display text-lg font-black text-fg leading-none">{priceText}</p>
              {!free && <SecurePayment variant="bar" />}
            </div>
            <div>
              {buyButton({ size: "btn-md", short: true, className: "min-h-11 px-5 text-xs font-bold justify-center whitespace-nowrap" })}
            </div>
          </div>
        </div>
      )}
      {/* Syllabus Modal */}
      <SyllabusModal
        course={course}
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
      />
    </main>
  );
}