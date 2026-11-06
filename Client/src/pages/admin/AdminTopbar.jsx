import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, CheckCheck, ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react";
import { ThemeToggle } from "../../components/layout/Navbar.jsx";

const ring =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-1";

function timeAgo(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return "";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hr ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} ${d === 1 ? "day" : "days"} ago`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
}

export default function AdminTopbar({
  title,
  openMenu,
  notifOpen,
  setNotifOpen,
  unread = 0,
  notifications = [],
  readNotification,
  profileOpen,
  setProfileOpen,
  onLogout,
  user,
  markAllRead,
}) {
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const name = user?.name || "Super Admin";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  useEffect(() => {
    if (!notifOpen && !profileOpen) return;
    const onDown = (e) => {
      if (notifOpen && notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setNotifOpen(false);
      setProfileOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [notifOpen, profileOpen, setNotifOpen, setProfileOpen]);

  const toggleNotif = () => {
    setProfileOpen(false);
    setNotifOpen((v) => !v);
  };
  const toggleProfile = () => {
    setNotifOpen(false);
    setProfileOpen((v) => !v);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-surface/95 px-4 backdrop-blur sm:px-6">
      {/* Left: menu button and page title */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={openMenu}
          className={`-ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-body transition-colors hover:bg-surface-2 lg:hidden ${ring}`}
          aria-label="Open menu"
          aria-controls="admin-sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="truncate font-display text-base font-bold tracking-tight text-fg sm:text-lg">{title}</h1>
      </div>

      {/* Right: notifications, site link, profile */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <div ref={notifRef} className="sm:relative">
          <button
            type="button"
            onClick={toggleNotif}
            className={`relative flex h-9 w-9 items-center justify-center rounded-lg text-fg-2 transition-colors hover:bg-surface-2 ${
              notifOpen ? "bg-surface-2" : ""
            } ${ring}`}
            aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
            aria-haspopup="true"
            aria-expanded={notifOpen}
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-[1.1rem] min-w-[1.1rem] items-center justify-center rounded-full bg-danger-500 px-1 text-[0.65rem] font-bold leading-none text-white ring-2 ring-surface">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute inset-x-3 top-full mt-2 overflow-hidden rounded-xl border border-line bg-surface shadow-lg sm:inset-x-auto sm:right-0 sm:w-96">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-fg">Notifications</h2>
                  {unread > 0 && (
                    <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs font-semibold text-ink-950">
                      {unread} new
                    </span>
                  )}
                </div>
                {markAllRead && unread > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-pitch-700 transition-colors hover:bg-surface-2 ${ring}`}
                  >
                    <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-[min(24rem,70vh)] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center px-6 py-10 text-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-2 text-fg-3">
                      <Bell className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <p className="mt-3 text-sm font-semibold text-fg">You are all caught up</p>
                    <p className="mt-1 text-xs text-fg-3">New orders and enquiries will appear here.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {notifications.map((n) => {
                      const isNew = !n.readAt;
                      return (
                        <li key={n._id}>
                          <button
                            type="button"
                            onClick={() => readNotification?.(n)}
                            className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none ${
                              isNew ? "bg-gold-400/10" : ""
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isNew ? "bg-gold-400" : "bg-transparent"}`}
                            />
                            <span className="min-w-0 flex-1">
                              <span className={`block truncate text-sm text-fg ${isNew ? "font-semibold" : "font-medium"}`}>
                                {n.title}
                              </span>
                              <span className="mt-0.5 line-clamp-2 block text-xs text-fg-3">{n.body}</span>
                              {n.createdAt && (
                                <span className="mt-1 block text-xs text-fg-3">{timeAgo(n.createdAt)}</span>
                              )}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <div className="border-t border-line bg-surface-2/60 p-2.5 text-center">
                <Link
                  to="/admin/notifications"
                  onClick={() => setNotifOpen(false)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-pitch-700 hover:text-pitch-800 transition hover:bg-surface-2"
                >
                  <span>View all notifications</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`hidden h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-pitch-700 no-underline transition-colors hover:bg-surface-2 sm:inline-flex ${ring}`}
        >
          View site
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>

        <ThemeToggle compact />

        <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={toggleProfile}
            className={`flex h-10 items-center gap-2 rounded-lg px-1 transition-colors hover:bg-surface-2 sm:pr-2 ${
              profileOpen ? "bg-surface-2" : ""
            } ${ring}`}
            aria-label="Account menu"
            aria-haspopup="true"
            aria-expanded={profileOpen}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fg text-xs font-bold text-gold-400">
              {initials}
            </span>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-fg md:block">{name}</span>
            <ChevronDown
              className={`hidden h-4 w-4 text-fg-3 transition-transform sm:block ${profileOpen ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
            >
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-semibold text-fg">{name}</p>
                <p className="truncate text-xs text-fg-3">{user?.email || "Super administrator"}</p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-fg-2 no-underline transition-colors hover:bg-surface-2 hover:text-fg sm:hidden ${ring}`}
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  View site
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={onLogout}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger-500 transition-colors hover:bg-danger-500/10 hover:text-danger-600 ${ring}`}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}