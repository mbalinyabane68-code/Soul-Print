import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Home, Archive, Users, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import MobileHeader from "./MobileHeader";
import HomeTab from "../pages/Home";
import ArchivesTab from "../pages/Archives";
import CharactersTab from "../pages/Characters";
import ProfileTab from "../pages/Profile";

const ROOT_TABS = ['/', '/archives', '/characters', '/profile'];

const TAB_PANELS = [
  { path: '/', Component: HomeTab },
  { path: '/archives', Component: ArchivesTab },
  { path: '/characters', Component: CharactersTab },
  { path: '/profile', Component: ProfileTab },
];

const NAV_TABS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/archives', icon: Archive, label: 'Archives' },
  { path: '/characters', icon: Users, label: 'Characters' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const isRootTab = ROOT_TABS.includes(pathname);

  const isActive = (path) =>
    path === '/' ? pathname === '/' : pathname.startsWith(path);

  return (
    <div className="h-[100dvh] flex flex-col bg-background font-body">
      <MobileHeader />

      <main className="flex-1 relative overflow-hidden">
        {/* All tab panels stay mounted to preserve scroll + query state */}
        {TAB_PANELS.map(({ path, Component }) => (
          <div
            key={path}
            className="absolute inset-0 overflow-y-auto pb-20"
            style={{
              visibility: isRootTab && pathname === path ? 'visible' : 'hidden',
              pointerEvents: isRootTab && pathname === path ? 'auto' : 'none',
              zIndex: isRootTab && pathname === path ? 1 : 0,
            }}
          >
            <Component />
          </div>
        ))}

        {/* Child routes (bookmarks, admin, writer, etc.) with slide-in animation */}
        {!isRootTab && (
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="absolute inset-0 overflow-y-auto pb-20 z-10 bg-background"
              initial={{ x: 32, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -32, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border flex justify-around pt-2 px-1 z-50 pb-[max(8px,env(safe-area-inset-bottom))]">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-all ${
              isActive(tab.path) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <tab.icon
              className={`h-5 w-5 ${isActive(tab.path) ? 'scale-110' : ''} transition-transform`}
            />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}