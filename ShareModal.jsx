const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useLocation, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Bookmark, Bell, ArrowLeft } from "lucide-react";

const ROOT_TABS = new Set(['/', '/archives', '/characters', '/profile']);

export default function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRootTab = ROOT_TABS.has(location.pathname);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => db.entities.Notification.list("-created_date", 20),
  });

  if (isRootTab) {
    return (
      <header className="sticky top-0 z-50 bg-primary px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] flex items-center justify-between shadow-md">
        <Link to="/bookmarks" className="p-3 -ml-1">
          <Bookmark className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground transition-colors" />
        </Link>
        <h1 className="font-heading font-bold text-lg text-primary-foreground tracking-wide">
          Soul Print
        </h1>
        <Link to="/notifications" className="relative p-3 -mr-1">
          <Bell className="h-5 w-5 text-primary-foreground/80 hover:text-primary-foreground transition-colors" />
          {notifications.length > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {Math.min(notifications.length, 99)}
            </span>
          )}
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] flex items-center gap-2 shadow-sm">
      <button
        onClick={() => navigate(-1)}
        className="p-1.5 -ml-1.5 rounded-xl hover:bg-muted active:bg-muted transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
    </header>
  );
}