import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Sun, Moon, Bell, User as UserIcon, ArrowRight, ChevronRight } from "lucide-react";
import LogoMark, { BrandLogo } from "../LogoMark.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { authService } from "../../services/auth.service.js";
import { api } from "../../lib/api.js";

/* ------------------------------------------------------------------ */
/* Data + helpers                                                      */
/* ------------------------------------------------------------------ */

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/courses", label: "Courses" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const readUser = () => {
  try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
};

const isAdmin = (u) => ["superadmin", "admin"].includes(u?.role);
const roleLabel = (u) => (u?.role === "superadmin" ? "Super admin" : u?.role === "admin" ? "Admin" : "Student");

const MenuIcon = ({ children }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  dashboard: <MenuIcon><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></MenuIcon>,
  notifications: <MenuIcon><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></MenuIcon>,
  payments: <MenuIcon><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /></MenuIcon>,
  profile: <MenuIcon><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></MenuIcon>,
  admin: <MenuIcon><path d="M12 3 4 6v6c0 4.5 3.2 7.8 8 9 4.8-1.2 8-4.5 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></MenuIcon>,
  logout: <MenuIcon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></MenuIcon>,
};

const ACCOUNT_LINKS = [
  { to: "/dashboard", label: "Dashboard", desc: "My courses and weekly progress", icon: "dashboard" },
  { to: "/notifications", label: "Notifications", desc: "New orders and alerts", icon: "notifications" },
  { to: "/payments", label: "Payments", desc: "Orders and receipts", icon: "payments" },
  { to: "/profile", label: "Profile", desc: "Your name and password", icon: "profile" },
  { to: "/admin", label: "Admin panel", desc: "Courses, students and orders", icon: "admin", adminOnly: true },
];

/* Shared look for every circular icon control */
const getIconBtn = (transparent = false) =>
  "relative flex shrink-0 items-center justify-center rounded-full transition-colors duration-200 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 motion-reduce:transition-none " +
  (transparent
    ? "border border-ink-950/20 bg-transparent text-ink-950 hover:border-ink-950/40 hover:bg-black/5 hover:text-black dark:border-white/15 dark:text-ink-200 dark:hover:border-white/30 dark:hover:bg-white/5 dark:hover:text-white"
    : "border border-white/15 bg-transparent text-ink-200 hover:border-white/30 hover:bg-white/5 hover:text-white");
const iconBtn = getIconBtn(false);
const iconSize = "h-10 w-10 md:h-9 md:w-9";

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function Avatar({ user, className = "h-9 w-9 text-sm" }) {
  const src = user?.avatar || user?.photo || "";
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [src]);

  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        className={`${className} shrink-0 rounded-full object-cover ring-1 ring-white/15`}
      />
    );
  }
  const initials =
    (user?.name || "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => Array.from(w)[0] || "")
      .join("")
      .toUpperCase() || "U";
  return (
    <span className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gold-400 font-display font-extrabold text-ink-950`}>
      {initials}
    </span>
  );
}

function RolePill({ user }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold ${isAdmin(user) ? "border-gold-400/40 text-gold-400" : "border-white/15 text-ink-200"}`}>
      {roleLabel(user)}
    </span>
  );
}

const rowBase =
  "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left no-underline transition-colors duration-200 hover:no-underline " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 motion-reduce:transition-none";

function MenuLink({ link, onClick }) {
  return (
    <NavLink
      to={link.to}
      role="menuitem"
      onClick={onClick}
      className={({ isActive }) => `${rowBase} ${isActive ? "bg-white/[0.06]" : "hover:bg-white/5"}`}
    >
      {({ isActive }) => (
        <>
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center transition-colors duration-200 ${isActive ? "text-gold-400" : "text-ink-300 group-hover:text-white"}`}>
            {ICONS[link.icon]}
          </span>
          <span className="min-w-0 flex-1">
            <span className={`block text-sm font-semibold ${isActive ? "text-gold-400" : "text-white"}`}>{link.label}</span>
            <span className="block truncate text-xs text-ink-400">{link.desc}</span>
          </span>
        </>
      )}
    </NavLink>
  );
}

function LogoutRow({ onClick }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={`${rowBase} hover:bg-red-500/10`}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center text-red-400">{ICONS.logout}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-red-400">Logout</span>
        <span className="block truncate text-xs text-red-400/70">Sign out of your account</span>
      </span>
    </button>
  );
}

function UserHeader({ user, avatarClass }) {
  return (
    <div className="flex items-center gap-3 px-2.5 py-3">
      <Avatar user={user} className={avatarClass} />
      <div className="min-w-0">
        <p className="truncate font-display font-bold leading-tight text-white">{user.name || "Your account"}</p>
        {user.email && <p className="truncate text-xs text-ink-400">{user.email}</p>}
        <div className="mt-1.5"><RolePill user={user} /></div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Profile dropdown (desktop)                                          */
/* ------------------------------------------------------------------ */

function ProfileMenu({ user, onLogout, transparent = false }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") { setOpen(false); buttonRef.current?.focus(); } };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const links = ACCOUNT_LINKS.filter((l) => !l.adminOnly || isAdmin(user));
  const onAccountRoute = links.some((l) => pathname === l.to || pathname.startsWith(l.to + "/"));
  const highlighted = open || onAccountRoute;

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="profile-menu"
        aria-label="Open profile menu"
        className={`${getIconBtn(transparent)} ${iconSize} ${highlighted ? "!border-gold-400/60 !text-gold-400" : ""}`}
      >
        <UserIcon className="h-[18px] w-[18px]" />
      </button>

      <div
        id="profile-menu"
        role="menu"
        aria-label="Account"
        className={`absolute right-0 top-full z-50 mt-3 w-72 origin-top-right rounded-xl border border-white/10 bg-ink-900 p-2 shadow-lg shadow-black/40 transition-all duration-200 motion-reduce:transition-none ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <UserHeader user={user} avatarClass="h-11 w-11 text-base" />
        <div className="my-1 h-px bg-white/10" />
        <div className="space-y-0.5">
          {links.map((l) => <MenuLink key={l.to} link={l} onClick={() => setOpen(false)} />)}
        </div>
        <div className="my-1 h-px bg-white/10" />
        <LogoutRow onClick={onLogout} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notifications dropdown (desktop + mobile)                           */
/* ------------------------------------------------------------------ */

function NotificationsDropdown({ user, transparent = false }) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wrapRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const fetchNotifs = () => {
    if (!user) return;
    api("/me/notifications")
      .then((r) => {
        const list = r.data || [];
        setNotifs(list.slice(0, 5));
        setUnreadCount(list.filter((n) => !n.readAt).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Poll every 10s for new notifications
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (id, e) => {
    e.stopPropagation();
    try {
      await api("/me/notifications/" + id + "/read", { method: "PATCH" });
      setNotifs((list) => list.map((i) => (i._id === id ? { ...i, readAt: new Date() } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await api("/me/notifications/read-all", { method: "PATCH" });
      setNotifs((list) => list.map((i) => ({ ...i, readAt: new Date() })));
      setUnreadCount(0);
    } catch {}
  };

  const openNotif = (n, isRead) => {
    if (!isRead) markRead(n._id, { stopPropagation: () => {} });
    if (n.link) window.location.href = n.link;
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        aria-expanded={open}
        className={`${getIconBtn(transparent)} ${iconSize} ${open ? "!border-gold-400/60 !text-gold-400" : ""}`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-400 px-1 text-[10px] font-bold leading-none text-ink-950 ring-2 ring-ink-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed inset-x-3 top-[4.25rem] z-50 rounded-xl border border-white/10 bg-ink-900 p-3 text-white shadow-lg shadow-black/40 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-3 sm:w-96"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-3">
            <span className="flex items-center gap-2 font-display text-sm font-bold">
              Notifications
              {unreadCount > 0 && (
                <span className="rounded-full border border-gold-400/40 px-2 py-0.5 text-[10px] font-bold text-gold-400">
                  {unreadCount} new
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-gold-400 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 space-y-1 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="py-6 text-center text-xs text-ink-400">No notifications yet.</p>
            ) : (
              notifs.map((n) => {
                const isRead = !!n.readAt;
                return (
                  <div
                    key={n._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openNotif(n, isRead)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNotif(n, isRead); } }}
                    className={`cursor-pointer rounded-lg px-2.5 py-2 text-xs transition-colors duration-200 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                      isRead ? "opacity-60" : "bg-white/[0.04]"
                    }`}
                  >
                    <div className="mb-0.5 flex items-start justify-between gap-2">
                      <span className="truncate font-semibold text-white">{n.title}</span>
                      {!isRead && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" aria-label="Unread" />}
                    </div>
                    {n.body && <p className="line-clamp-2 text-[11px] text-ink-300">{n.body}</p>}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 border-t border-white/10 pt-2 text-center">
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gold-400 hover:underline"
            >
              <span>View all notifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Theme toggle (exported – used elsewhere in the app)                 */
/* ------------------------------------------------------------------ */

export function ThemeToggle({ className = "", compact = false, transparent = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={`${getIconBtn(transparent)} ${compact ? "h-9 w-9" : iconSize} ${className}`}
    >
      {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

export default function Navbar({ user = null }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState(readUser);
  const progressRef = useRef(null);

  const authUser = user || currentUser;
  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled && !open;

  useEffect(() => setCurrentUser(readUser()), [pathname]);
  useEffect(() => setOpen(false), [pathname]);

  // Scroll listener: passive, single boolean state (scrolled >= 10px), RAF scroll progress bar
  useEffect(() => {
    let rafId = null;

    const updateScroll = () => {
      const isScrolled = window.scrollY >= 10;
      setScrolled(isScrolled);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(Math.max(window.scrollY / docHeight, 0), 1) : 0;

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Mobile menu: lock page scroll, close on Esc, close when resizing to desktop
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    const onResize = () => { if (window.innerWidth >= 768) setOpen(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setOpen(false);
    navigate("/");
  };

  const accountLinks = ACCOUNT_LINKS.filter((l) => !l.adminOnly || isAdmin(authUser));

  return (
    <>
      <header
        className={`navbar ${
          isHome ? "navbar-fixed" : "sticky top-0"
        } ${
          isTransparent ? "navbar-transparent" : "navbar-scrolled"
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between md:grid md:grid-cols-[1fr_auto_1fr] md:gap-6">
          {/* Logo */}
          <BrandLogo
            to="/"
            onClick={() => setOpen(false)}
            textColor={isTransparent ? "text-ink-950 dark:text-white" : "text-white"}
            subtitleColor="text-gold-400"
          />

          {/* Desktop links */}
          <nav className="hidden items-center gap-7 md:flex lg:gap-9" aria-label="Main">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className="group relative py-2 text-[0.9rem] font-medium tracking-wide no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-sm"
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`transition-colors duration-200 motion-reduce:transition-none ${
                        isActive
                          ? "font-semibold text-gold-500 dark:text-gold-400"
                          : isTransparent
                            ? "text-ink-900 hover:text-black dark:text-ink-300 dark:hover:text-white"
                            : "text-ink-300 group-hover:text-white"
                      }`}
                    >
                      {l.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left transition-transform duration-300 ease-out motion-reduce:transition-none ${
                        isActive
                          ? "scale-x-100 bg-gold-500 dark:bg-gold-400"
                          : isTransparent
                            ? "scale-x-0 bg-ink-950/70 dark:bg-white/70 group-hover:scale-x-100"
                            : "scale-x-0 bg-white/70 group-hover:scale-x-100"
                      }`}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2.5 justify-self-end md:flex">
            <ThemeToggle transparent={isTransparent} />
            {authUser ? (
              <>
                <NotificationsDropdown user={authUser} transparent={isTransparent} />
                <ProfileMenu user={authUser} onLogout={logout} transparent={isTransparent} />
              </>
            ) : (
              <div className="ml-1.5 flex items-center gap-2">
                <Link
                  to="/login"
                  className={`btn btn-sm ${
                    isTransparent
                      ? "border border-ink-950/20 bg-black/5 text-ink-950 hover:border-ink-950/40 hover:bg-black/10 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/15"
                      : "btn-outline-light"
                  }`}
                >
                  Login
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            {authUser ? (
              <NotificationsDropdown user={authUser} transparent={isTransparent} />
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className={`btn btn-sm ${
                    isTransparent
                      ? "border border-ink-950/20 bg-black/5 text-ink-950 hover:border-ink-950/40 hover:bg-black/10 dark:border-white/20 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/15"
                      : "btn-outline-light"
                  } !h-8 !px-2.5 text-xs font-semibold`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-sm btn-primary !h-8 !px-2.5 text-xs font-extrabold"
                >
                  Register
                </Link>
              </div>
            )}
            <button
              type="button"
              className={`${getIconBtn(isTransparent)} ${iconSize}`}
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span className="relative block h-[1.5px] w-[18px]">
                <span className={`absolute inset-x-0 -top-[6px] block h-[1.5px] rounded bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "translate-y-[6px] rotate-45" : ""}`} />
                <span className={`absolute inset-x-0 block h-[1.5px] rounded bg-current transition-all duration-200 motion-reduce:transition-none ${open ? "scale-x-0 opacity-0" : ""}`} />
                <span className={`absolute inset-x-0 top-[6px] block h-[1.5px] rounded bg-current transition-transform duration-300 motion-reduce:transition-none ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        {/* 2px Scroll progress bar along bottom edge */}
        <div
          ref={progressRef}
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left bg-gradient-to-r from-gold-400 to-gold-500 transition-opacity duration-300 motion-reduce:hidden ${
            scrolled ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: "scaleX(0)", transformOrigin: "left" }}
        />

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`absolute inset-x-0 top-full grid border-b border-white/10 bg-ink-950 transition-[grid-template-rows,visibility] duration-300 ease-out motion-reduce:transition-none md:hidden ${
            open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <nav aria-label="Mobile" className="container-page max-h-[calc(100dvh-4rem)] overflow-y-auto pb-8 pt-2 text-white">
              <ul>
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <NavLink
                      to={l.to}
                      end={l.end}
                      onClick={() => setOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between border-b border-white/5 py-3.5 text-lg font-semibold no-underline transition-colors duration-200 hover:no-underline ${
                          isActive ? "text-gold-400" : "text-ink-200 hover:text-white"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {l.label}
                          <ChevronRight className={`h-4 w-4 ${isActive ? "text-gold-400" : "text-ink-400"}`} aria-hidden="true" />
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-b border-white/5 py-3">
                <span className="text-sm font-medium text-ink-300">Theme</span>
                <ThemeToggle compact />
              </div>

              <div className="pt-4">
                {authUser ? (
                  <div role="menu" aria-label="Account">
                    <UserHeader user={authUser} avatarClass="h-11 w-11 text-base" />
                    <div className="my-2 h-px bg-white/10" />
                    <div className="space-y-0.5">
                      {accountLinks.map((l) => (
                        <MenuLink key={l.to} link={l} onClick={() => setOpen(false)} />
                      ))}
                    </div>
                    <div className="my-2 h-px bg-white/10" />
                    <LogoutRow onClick={logout} />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="btn btn-md btn-outline-light w-full justify-center text-sm font-bold shadow-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="btn btn-md btn-primary w-full justify-center text-sm font-extrabold shadow-glow"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Dim page behind the mobile menu */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
