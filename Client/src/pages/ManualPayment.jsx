import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Copy, Upload } from "lucide-react";
import { api } from "../lib/api.js";

/* ---------- Edit these with your real payment details ---------- */
const PAYMENT = {
  payeeName: "Vanakkam Soccer",
  upiId: "yourupi@bank",
  note: "After you pay, fill in this form. We check the amount and unlock your videos, usually within a few hours.",
};

const METHODS = ["UPI", "Bank transfer", "Cash"];
const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const IST = "Asia/Kolkata";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (t) => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: IST });
const todayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: IST });

const STATUS_STYLE = {
  Pending: "badge-gold",
  Approved: "badge-green",
  Rejected: "badge-red",
};

const EMPTY = {
  courseId: "",
  amount: "",
  method: "UPI",
  reference: "",
  paidOn: todayKey(),
  payerName: "",
  mobile: "",
  note: "",
};

export default function ManualPayment() {
  const [courses, setCourses] = useState([]);
  const [mine, setMine] = useState([]);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const course = useMemo(() => courses.find((c) => c._id === values.courseId), [courses, values.courseId]);

  const loadMine = () =>
    api("/payment-requests/mine")
      .then((r) => setMine(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});

  useEffect(() => {
    api("/courses")
      .then((r) => setCourses(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    loadMine();
  }, []);

  // Fill in the course price when a course is chosen (the student can still change it)
  const chooseCourse = (id) => {
    const c = courses.find((x) => x._id === id);
    setValues((v) => ({ ...v, courseId: id, amount: c ? String(c.price ?? "") : v.amount }));
  };

  const set = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  const pickFile = (e) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!IMAGE_TYPES.includes(picked.type)) {
      setErrors((p) => ({ ...p, file: "Please choose a JPG, PNG or WebP image." }));
      e.target.value = "";
      return;
    }
    if (picked.size > MAX_IMAGE) {
      setErrors((p) => ({ ...p, file: "The image must be 5 MB or smaller." }));
      e.target.value = "";
      return;
    }
    setErrors((p) => ({ ...p, file: undefined }));
    setFile(picked);
  };

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const validate = () => {
    const e = {};
    if (!values.courseId) e.courseId = "Please choose a course.";
    if (!(Number(values.amount) > 0)) e.amount = "Enter the amount you paid.";
    if (values.method !== "Cash" && values.reference.trim().length < 6) {
      e.reference = "Enter the transaction or UTR number (at least 6 characters).";
    }
    if (!values.paidOn) e.paidOn = "Choose the date you paid.";
    else if (values.paidOn > todayKey()) e.paidOn = "The payment date cannot be in the future.";
    if (values.payerName.trim().length < 2) e.payerName = "Enter the name of the person who paid.";
    if (!/^\d{10}$/.test(values.mobile)) e.mobile = "Enter a 10-digit mobile number.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const err = validate();
    setErrors((p) => ({ ...err, file: p.file }));
    setFormError("");
    if (Object.keys(err).length) return;

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries({ ...values, amount: Number(values.amount) }).forEach(([k, v]) => fd.append(k, String(v).trim()));
      if (file) fd.append("screenshot", file);
      await api("/payment-requests", { method: "POST", body: fd });
      setSent(true);
      setValues(EMPTY);
      setFile(null);
      loadMine();
    } catch (ex) {
      setFormError(ex.message || "We could not send your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (k) => (errors[k] ? <p className="form-error">{errors[k]}</p> : null);

  return (
    <section className="section">
      <div className="container-page">
        <div className="mx-auto max-w-5xl">
          <header className="max-w-2xl">
            <span className="badge badge-gold">Manual payment</span>
            <h1 className="mt-3 text-3xl sm:text-4xl">Paid by UPI or bank transfer?</h1>
            <p className="mt-3 text-fg-2">{PAYMENT.note}</p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
            {/* Form */}
            <div className="card">
              <div className="card-body">
                {sent ? (
                  <div className="py-8 text-center" role="status">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-pitch-600" aria-hidden="true" />
                    <h2 className="mt-4 text-2xl">We received your request</h2>
                    <p className="mx-auto mt-2 max-w-sm text-fg-2">
                      We will check the payment and unlock your videos. You can follow the status below.
                    </p>
                    <button type="button" onClick={() => setSent(false)} className="btn btn-md btn-outline mt-6">
                      Send another request
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-5">
                    <div>
                      <label className="label" htmlFor="mp-course">Course *</label>
                      <select id="mp-course" className="input" value={values.courseId} onChange={(e) => chooseCourse(e.target.value)}>
                        <option value="">Select a course</option>
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>{c.title} ({inr(c.price)})</option>
                        ))}
                      </select>
                      {fieldError("courseId")}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="mp-amount">Amount paid (₹) *</label>
                        <input id="mp-amount" type="number" inputMode="numeric" min="1" className="input" value={values.amount} onChange={set("amount")} />
                        {course && Number(values.amount) !== Number(course.price) && values.amount !== "" && (
                          <p className="mt-1 text-xs text-fg-3">The course price is {inr(course.price)}.</p>
                        )}
                        {fieldError("amount")}
                      </div>
                      <div>
                        <label className="label" htmlFor="mp-method">Payment method *</label>
                        <select id="mp-method" className="input" value={values.method} onChange={set("method")}>
                          {METHODS.map((m) => <option key={m}>{m}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="mp-ref">
                          Transaction / UTR number {values.method !== "Cash" && "*"}
                        </label>
                        <input id="mp-ref" className="input" value={values.reference} onChange={set("reference")} placeholder="e.g. 412345678901" />
                        {fieldError("reference")}
                      </div>
                      <div>
                        <label className="label" htmlFor="mp-date">Payment date *</label>
                        <input id="mp-date" type="date" max={todayKey()} className="input" value={values.paidOn} onChange={set("paidOn")} />
                        {fieldError("paidOn")}
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="label" htmlFor="mp-name">Name of the person who paid *</label>
                        <input id="mp-name" className="input" autoComplete="name" value={values.payerName} onChange={set("payerName")} />
                        {fieldError("payerName")}
                      </div>
                      <div>
                        <label className="label" htmlFor="mp-mobile">Mobile / WhatsApp number *</label>
                        <input
                          id="mp-mobile"
                          className="input"
                          inputMode="numeric"
                          maxLength={10}
                          autoComplete="tel"
                          value={values.mobile}
                          onChange={(e) => setValues((v) => ({ ...v, mobile: e.target.value.replace(/\D/g, "") }))}
                        />
                        {fieldError("mobile")}
                      </div>
                    </div>

                    <div>
                      <label className="label" htmlFor="mp-shot">Payment screenshot (optional)</label>
                      <label
                        htmlFor="mp-shot"
                        className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line-strong bg-surface-2/60 px-4 py-4 text-sm text-fg-2 transition hover:border-gold-500"
                      >
                        <Upload className="h-5 w-5 shrink-0 text-fg-3" aria-hidden="true" />
                        <span className="truncate">{file ? file.name : "Choose an image (JPG, PNG or WebP, up to 5 MB)"}</span>
                      </label>
                      <input id="mp-shot" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickFile} />
                      {fieldError("file")}
                    </div>

                    <div>
                      <label className="label" htmlFor="mp-note">Note (optional)</label>
                      <textarea id="mp-note" rows={3} maxLength={300} className="input" value={values.note} onChange={set("note")} placeholder="Anything we should know about this payment?" />
                    </div>

                    {formError && (
                      <div role="alert" className="rounded-xl border border-danger-500/40 bg-tint-red px-4 py-3 text-sm font-medium text-on-tint-red">
                        {formError}
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-lg btn-primary w-full">
                      {loading ? (<><span className="spinner" aria-hidden="true" /> Sending…</>) : "Submit payment details"}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Pay-to details */}
            <aside className="card lg:sticky lg:top-24">
              <div className="card-body">
                <h2 className="text-lg">Pay to</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-xs text-fg-3">Name</dt>
                    <dd className="font-semibold text-fg">{PAYMENT.payeeName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fg-3">UPI ID</dt>
                    <dd className="flex items-center gap-2 font-semibold text-fg">
                      <span className="break-all">{PAYMENT.upiId}</span>
                      <button type="button" onClick={copyUpi} className="btn btn-sm btn-outline shrink-0" aria-label="Copy UPI ID">
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </dd>
                  </div>
                  {course && (
                    <div>
                      <dt className="text-xs text-fg-3">Amount for {course.title}</dt>
                      <dd className="font-price text-2xl font-bold text-fg">{inr(course.price)}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </aside>
          </div>

          {/* My requests */}
          {mine.length > 0 && (
            <div className="card mt-8">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-lg">Your requests</h2>
              </div>
              <ul className="divide-y divide-line">
                {mine.map((r) => (
                  <li key={r._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg">{r.courseId?.title || "Course"}</p>
                      <p className="text-xs text-fg-3">
                        {inr(r.amount)} · {r.method} · sent {fmtDate(r.createdAt)}
                      </p>
                      {r.status === "Rejected" && r.reviewNote && (
                        <p className="mt-1 text-xs text-on-tint-red">Reason: {r.reviewNote}</p>
                      )}
                    </div>
                    <span className={`badge ${STATUS_STYLE[r.status] ?? "badge-gray"}`}>{r.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
