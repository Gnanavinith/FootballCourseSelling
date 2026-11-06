import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Copy, Upload } from "lucide-react";
import { api } from "../lib/api.js";

/* ---------- Edit these with your real payment details ---------- */
const PAYMENT = {
  payeeName: "Vanakkam Soccer",
  upiId: "yourupi@bank",
  note: "Fill in your payment details. Once we verify the amount, your course videos will be unlocked.",
};

const METHODS = ["UPI", "Bank transfer", "Cash"];
const MAX_IMAGE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const NEXT_STEPS = [
  "Pay the course amount using the details on this page.",
  "Fill in this form with your transaction number.",
  "We verify the amount, usually within a few hours.",
  "Your course videos unlock automatically.",
];

const IST = "Asia/Kolkata";
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const todayKey = () => new Date().toLocaleDateString("en-CA", { timeZone: IST });

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
};

const isAdmin = (u) => ["superadmin", "admin"].includes(u?.role);

const EMPTY = {
  studentId: "",
  studentName: "",
  courseId: "",
  amount: "",
  method: "UPI",
  reference: "",
  paidOn: todayKey(),
  payerName: "",
  mobile: "",
  note: "",
};

/* A titled block inside the form, so the long form reads in clear steps */
function FormSection({ number, title, hint, children }) {
  return (
    <fieldset className="space-y-4 border-0 p-0">
      <legend className="mb-1 flex items-center gap-3 p-0">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-950 text-xs font-bold text-white dark:bg-gold-400 dark:text-ink-950">
          {number}
        </span>
        <span>
          <span className="block font-display text-base font-bold leading-tight text-fg">{title}</span>
          {hint && <span className="block text-xs font-normal text-fg-3">{hint}</span>}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

export default function FillForm() {
  const [user, setUser] = useState(readUser);
  const [ready, setReady] = useState(false);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [values, setValues] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const course = useMemo(() => courses.find((c) => c._id === values.courseId), [courses, values.courseId]);
  const admin = isAdmin(user);

  useEffect(() => {
    setUser(readUser());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    api("/courses")
      .then((r) => setCourses(Array.isArray(r.data) ? r.data : []))
      .catch(() => {});
    if (isAdmin(user)) {
      api("/admin/students")
        .then((r) => setStudents(Array.isArray(r.data) ? r.data : []))
        .catch(() => setStudents([]));
    }
  }, [ready, user]);

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
    if (!user) e._form = "Please log in to submit this form.";
    if (admin && !values.studentId) e.studentId = "Please choose a student.";
    if (!admin && !values.studentName) e.studentName = "Enter your full name.";
    if (!values.courseId) e.courseId = "Please choose a course.";
    if (!(Number(values.amount) > 0)) e.amount = "Enter the amount paid.";
    if (values.method !== "Cash" && values.reference.trim().length < 6) {
      e.reference = "Enter the transaction or UTR number (at least 6 characters).";
    }
    if (!values.paidOn) e.paidOn = "Choose the payment date.";
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
      const body = {
        ...values,
        amount: Number(values.amount),
        studentName: admin ? "" : values.studentName,
        targetUserId: admin ? values.studentId : user ? user.id ?? user._id : undefined,
      };
      Object.entries(body).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v).trim());
      });
      if (file) fd.append("screenshot", file);
      await api("/payment-requests", { method: "POST", body: fd });
      setSent(true);
      setValues(EMPTY);
      setFile(null);
    } catch (ex) {
      setFormError(ex.message || "We could not record the payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (k) => (errors[k] ? <p className="form-error">{errors[k]}</p> : null);

  if (!ready) return null;

  if (!user) {
    return (
      <section className="section">
        <div className="container-page">
          <div className="mx-auto max-w-md">
            <div className="card">
              <div className="card-body py-10 text-center">
                <h1 className="text-2xl">Log in to continue</h1>
                <p className="mx-auto mt-2 max-w-xs text-fg-3">You need to be logged in to submit a payment request.</p>
                <Link to="/login" className="btn btn-md btn-primary mt-6">Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container-page">
        <div className="mx-auto max-w-5xl">
          <header className="max-w-2xl">
            <p className="text-sm font-semibold text-pitch-700">Manual payment</p>
            <h1 className="mt-1 text-3xl sm:text-4xl">Submit your payment details</h1>
            <p className="mt-3 text-fg-2">{PAYMENT.note}</p>
          </header>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_21rem] lg:items-start">
            {/* Pay-to details: shown first on mobile, so students pay before filling in the form */}
            <aside className="order-first space-y-4 lg:order-last lg:sticky lg:top-24">
              <div className="card">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-base">Pay to</h2>
                </div>
                <dl className="space-y-4 px-5 py-5 text-sm">
                  <div>
                    <dt className="text-xs text-fg-3">Name</dt>
                    <dd className="mt-0.5 font-semibold text-fg">{PAYMENT.payeeName}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-fg-3">UPI ID</dt>
                    <dd className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-line bg-surface-2/60 py-1.5 pl-3 pr-1.5">
                      <span className="break-all font-semibold text-fg">{PAYMENT.upiId}</span>
                      <button type="button" onClick={copyUpi} className="btn btn-sm btn-outline shrink-0" aria-label="Copy UPI ID">
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        {copied ? "Copied" : "Copy"}
                      </button>
                    </dd>
                  </div>
                  {course && (
                    <div className="border-t border-line pt-4">
                      <dt className="text-xs text-fg-3">Amount for {course.title}</dt>
                      <dd className="mt-0.5 font-price text-3xl font-bold tracking-tight text-fg">{inr(course.price)}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <div className="card hidden lg:block">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-base">What happens next</h2>
                </div>
                <ol className="space-y-3 px-5 py-5">
                  {NEXT_STEPS.map((s, i) => (
                    <li key={s} className="flex gap-3 text-sm text-fg-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-semibold text-fg">{i + 1}</span>
                      <span className="pt-0.5">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            {/* Form */}
            <div className="card">
              <div className="card-body">
                {sent ? (
                  <div className="py-10 text-center" role="status">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-pitch-600" aria-hidden="true" />
                    <h2 className="mt-4 text-2xl">Payment request received</h2>
                    <p className="mx-auto mt-2 max-w-sm text-fg-2">
                      Your payment details have been saved and sent for review. We will verify the amount and unlock your course videos.
                    </p>
                    <button type="button" onClick={() => setSent(false)} className="btn btn-md btn-outline mt-6">
                      Submit another payment
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate className="space-y-8">
                    {admin && (
                      <p className="rounded-lg border border-line bg-surface-2/60 px-4 py-3 text-sm text-fg-2">
                        You are logged in as an admin, so you are recording this payment for a student.
                      </p>
                    )}

                    {/* 1. Course */}
                    <FormSection number="1" title="Course and student" hint="Choose the course the payment is for.">
                      {admin ? (
                        <div>
                          <label className="label" htmlFor="ff-student">Student *</label>
                          <select id="ff-student" className="input" value={values.studentId} onChange={set("studentId")}>
                            <option value="">Select a student</option>
                            {students.map((s) => (
                              <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                            ))}
                          </select>
                          {fieldError("studentId")}
                        </div>
                      ) : (
                        <div>
                          <label className="label" htmlFor="ff-student-name">Your full name *</label>
                          <input
                            id="ff-student-name"
                            className="input"
                            autoComplete="name"
                            value={values.studentName}
                            onChange={set("studentName")}
                            placeholder="As on your account"
                          />
                          {fieldError("studentName")}
                        </div>
                      )}

                      <div>
                        <label className="label" htmlFor="ff-course">Course *</label>
                        <select id="ff-course" className="input" value={values.courseId} onChange={(e) => chooseCourse(e.target.value)}>
                          <option value="">Select a course</option>
                          {courses.map((c) => (
                            <option key={c._id} value={c._id}>{c.title} ({inr(c.price)})</option>
                          ))}
                        </select>
                        {fieldError("courseId")}
                      </div>
                    </FormSection>

                    <hr className="border-line" />

                    {/* 2. Payment */}
                    <FormSection number="2" title="Payment details" hint="Copy these from your payment app or bank message.">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label" htmlFor="ff-amount">Amount paid (₹) *</label>
                          <input id="ff-amount" type="number" inputMode="numeric" min="1" className="input" value={values.amount} onChange={set("amount")} />
                          {course && values.amount !== "" && Number(values.amount) !== Number(course.price) && (
                            <p className="mt-1 text-xs text-fg-3">The course price is {inr(course.price)}.</p>
                          )}
                          {fieldError("amount")}
                        </div>
                        <div>
                          <label className="label" htmlFor="ff-method">Payment method *</label>
                          <select id="ff-method" className="input" value={values.method} onChange={set("method")}>
                            {METHODS.map((m) => <option key={m}>{m}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label" htmlFor="ff-ref">Transaction / UTR number {values.method !== "Cash" && "*"}</label>
                          <input id="ff-ref" className="input" value={values.reference} onChange={set("reference")} placeholder="e.g. 412345678901" />
                          {fieldError("reference")}
                        </div>
                        <div>
                          <label className="label" htmlFor="ff-date">Payment date *</label>
                          <input id="ff-date" type="date" max={todayKey()} className="input" value={values.paidOn} onChange={set("paidOn")} />
                          {fieldError("paidOn")}
                        </div>
                      </div>

                      <div>
                        <label className="label" htmlFor="ff-shot">Payment screenshot (optional)</label>
                        <label
                          htmlFor="ff-shot"
                          className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-line-strong bg-surface-2/60 px-4 py-4 text-sm text-fg-2 transition hover:border-gold-500"
                        >
                          <Upload className="h-5 w-5 shrink-0 text-fg-3" aria-hidden="true" />
                          <span className="truncate">{file ? file.name : "Choose an image (JPG, PNG or WebP, up to 5 MB)"}</span>
                        </label>
                        <input id="ff-shot" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pickFile} />
                        {fieldError("file")}
                      </div>
                    </FormSection>

                    <hr className="border-line" />

                    {/* 3. Contact */}
                    <FormSection number="3" title="Who paid" hint="So we can match the payment to your bank record.">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="label" htmlFor="ff-name">Name of the person who paid *</label>
                          <input id="ff-name" className="input" autoComplete="name" value={values.payerName} onChange={set("payerName")} />
                          {fieldError("payerName")}
                        </div>
                        <div>
                          <label className="label" htmlFor="ff-mobile">Mobile / WhatsApp number *</label>
                          <input
                            id="ff-mobile"
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
                        <label className="label" htmlFor="ff-note">Note (optional)</label>
                        <textarea id="ff-note" rows={3} maxLength={300} className="input" value={values.note} onChange={set("note")} placeholder="Anything we should know about this payment?" />
                      </div>
                    </FormSection>

                    {(formError || errors._form) && (
                      <div role="alert" className="rounded-xl border border-danger-500/40 bg-tint-red px-4 py-3 text-sm font-medium text-on-tint-red">
                        {formError || errors._form}
                      </div>
                    )}

                    <div>
                      <button type="submit" disabled={loading} className="btn btn-lg btn-primary w-full">
                        {loading ? (<><span className="spinner" aria-hidden="true" /> Sending…</>) : "Submit payment details"}
                      </button>
                      <p className="mt-3 text-center text-xs text-fg-3">We only use these details to verify your payment.</p>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}