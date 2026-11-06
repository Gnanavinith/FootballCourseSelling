import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  IndianRupee,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Receipt,
  Settings,
  Users,
  Video,
} from "lucide-react";
import { authService } from "../../services/auth.service.js";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminTopbar from "./AdminTopbar.jsx";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/courses", label: "Courses", icon: BookOpen },
  { to: "/admin/videos", label: "Weekly videos", icon: Video },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/sessions", label: "1-on-1 Sessions", icon: Calendar },
  { to: "/admin/orders", label: "Orders", icon: Receipt },
  { to: "/admin/enquiries", label: "Enquiries", icon: MessageSquare },
  { to: "/admin/payments", label: "Manual payments", icon: IndianRupee },
  { to: "/admin/emails", label: "Emails", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

const TITLES = Object.fromEntries(NAV.map((n) => [n.to, n.label]));

export default function Admin() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const title = TITLES[pathname.replace(/\/$/, "")] ?? "SuperAdmin Panel";

  const logout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api("/admin/notifications/unread-count");
        setUnread(res.data?.count || 0);
        const list = await api("/admin/notifications");
        const notifs = Array.isArray(list.data) ? list.data : (list.data?.items || []);
        setNotifications(notifs);
      } catch {}
    };
    load();
    const id = setInterval(load, 30000);
    window.addEventListener("admin-notifications-updated", load);
    return () => {
      clearInterval(id);
      window.removeEventListener("admin-notifications-updated", load);
    };
  }, []);

  const markAllRead = async () => {
    try {
      await api("/admin/notifications/read-all", { method: "PATCH" });
      setNotifications((list) => list.map((n) => ({ ...n, readAt: new Date() })));
      setUnread(0);
      window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
    } catch {}
  };

  const readNotification = async (n) => {
    try {
      if (!n.readAt) {
        await api(`/admin/notifications/${n._id}/read`, { method: "PATCH" });
        setNotifications((list) =>
          list.map((item) => (item._id === n._id ? { ...item, readAt: new Date() } : item))
        );
        setUnread((u) => Math.max(0, u - 1));
        window.dispatchEvent(new CustomEvent("admin-notifications-updated"));
      }
    } catch {}
    setNotifOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="min-h-screen bg-page text-fg-body font-display">
      <AdminSidebar
        open={open}
        onClose={() => setOpen(false)}
        badges={{ "/admin/notifications": unread }}
      />

      {/* Main column */}
      <div className="lg:pl-64">
        <AdminTopbar
          title={title}
          openMenu={() => setOpen(true)}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          unread={unread}
          notifications={notifications}
          readNotification={readNotification}
          markAllRead={markAllRead}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          onLogout={() => { setProfileOpen(false); logout(); }}
        />

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
