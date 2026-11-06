import { Link, NavLink } from "react-router-dom";
import { BrandLogo } from "../../components/LogoMark.jsx";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  ExternalLink,
  IndianRupee,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Receipt,
  Settings,
  Ticket,
  Users,
  Video,
  X,
} from "lucide-react";

const GROUPS = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/admin/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/courses", label: "Courses", icon: BookOpen },
      { to: "/admin/videos", label: "Weekly videos", icon: Video },
    ],
  },
  {
    label: "People and sales",
    items: [
      { to: "/admin/sessions", label: "1-on-1 Sessions", icon: CalendarCheck },
      { to: "/admin/students", label: "Students", icon: Users },
      { to: "/admin/orders", label: "Orders", icon: Receipt },
      { to: "/admin/coupons", label: "Coupons", icon: Ticket },
      { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
      { to: "/admin/payments", label: "Manual payments", icon: IndianRupee },
    ],
  },
  {
    label: "Communication",
    items: [{ to: "/admin/emails", label: "Emails", icon: Mail }],
  },
  {
    label: "System",
    items: [{ to: "/admin/settings", label: "Settings", icon: Settings }],
  },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1";

export default function AdminSidebar({ open, onClose, badges = {} }) {
  return (
    <aside
      id="admin-sidebar"
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface text-fg transition-transform duration-300 ease-out lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full max-lg:invisible"
      }`}
    >
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
        <BrandLogo
          to="/admin"
          onClick={onClose}
          subtitle="Admin"
          textColor="text-fg"
          subtitleColor="text-gold-600 dark:text-gold-400"
        />

        <button
          type="button"
          onClick={onClose}
          className={`flex h-9 w-9 items-center justify-center rounded-lg text-fg-3 transition-colors hover:bg-surface-2 hover:text-fg lg:hidden ${focusRing}`}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Navigation (scrolls on short screens) */}
      <nav aria-label="Admin" className="admin-sidebar-scroll flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-3 pb-1.5 text-xs font-medium text-fg-3">{g.label}</p>
            <ul className="space-y-0.5">
              {g.items.map(({ to, label, icon: Icon, end }) => {
                const count = badges[to] ?? 0;
                return (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${focusRing} ${
                          isActive ? "bg-surface-2 text-fg" : "text-fg-3 hover:bg-surface-2 hover:text-fg"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active marker on the sidebar's left edge */}
                          <span
                            aria-hidden="true"
                            className={`absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r bg-gold-400 transition-opacity ${
                              isActive ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <Icon
                            className={`h-[1.1rem] w-[1.1rem] shrink-0 transition-colors ${
                              isActive ? "text-gold-400" : "text-fg-3 group-hover:text-fg"
                            }`}
                            aria-hidden="true"
                          />
                          <span className="flex-1 truncate">{label}</span>
                          {count > 0 && (
                            <span
                              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.7rem] font-bold tabular-nums shadow-xs ${
                                to === "/admin/notifications" ? "bg-danger-500 text-white" : "bg-gold-400 text-ink-950"
                              }`}
                            >
                              {count > 99 ? "99+" : count}
                              <span className="sr-only"> new</span>
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-line p-3">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-fg-3 no-underline transition-colors hover:bg-surface-2 hover:text-fg ${focusRing}`}
        >
          Back to website
          <ExternalLink className="h-4 w-4 transition-colors group-hover:text-fg" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}