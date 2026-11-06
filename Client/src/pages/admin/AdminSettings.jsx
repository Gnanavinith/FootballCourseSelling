export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-extrabold text-fg">Website & SEO Settings</h1>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4">
        <div>
          <label className="label">Site name</label>
          <input className="input" defaultValue="Vanakkam Soccer" />
        </div>
        <div>
          <label className="label">Contact email</label>
          <input className="input" defaultValue="support@vanakkamsoccer.com" />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" defaultValue="+91 90000 00000" />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea className="input" rows={3} defaultValue="Chennai, Tamil Nadu, India" />
        </div>
        <button className="btn btn-md btn-primary">Save settings</button>
      </div>

      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-fg">Testimonials</h2>
        <p className="mt-2 text-sm text-fg-3">Add, update, delete testimonials here.</p>
        <button className="btn btn-sm btn-primary mt-4">Add testimonial</button>
      </div>
    </div>
  );
}
