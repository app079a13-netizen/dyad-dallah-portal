import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import { ASSETS } from "@/lib/assets";
import {
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Settings,
  Home as HomeIcon,
  Activity,
  KeyRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const menuItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", path: "/control-panel" },
  { icon: FileText, label: "طلبات التوظيف", path: "/control-panel/applications" },
  { icon: Activity, label: "تتبع الزوار والخطوات", path: "/control-panel/funnel" },
  { icon: Settings, label: "الإعدادات وإعادة التوجيه", path: "/control-panel/settings" },
  { icon: HomeIcon, label: "العودة للموقع", path: "/" },
];

const SIDEBAR_OPEN_KEY = "dashboard-sidebar-open";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: admin } = trpc.adminAuth.me.useQuery();
  const utils = trpc.useUtils();
  const [location, setLocation] = useLocation();
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return !isMobile;
    const saved = localStorage.getItem(SIDEBAR_OPEN_KEY);
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_OPEN_KEY, String(open));
  }, [open]);

  useEffect(() => {
    if (isMobile && open) setOpen(false);
  }, [location]);

  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: async () => {
      await utils.adminAuth.me.invalidate();
      toast.success("تم تسجيل الخروج بنجاح");
      setLocation("/control-panel/login");
    },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30" dir="rtl">
      {/* Overlay for mobile */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isMobile ? "fixed inset-y-0 right-0 z-50" : "relative"}
          flex flex-col bg-background border-l border-border
          transition-all duration-300 ease-in-out
          ${open ? "w-[280px] translate-x-0" : isMobile ? "w-[280px] translate-x-full" : "w-0"}
          overflow-hidden shrink-0
        `}
      >
        <div className="flex flex-col h-full min-w-[280px]">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2.5">
              <img src={ASSETS.dallahLogo} alt="دلة" className="h-8 w-auto rounded" />
              <span className="font-bold tracking-tight text-primary text-base">
                لوحة التحكم
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="إغلاق القائمة"
            >
              {isMobile ? <X className="h-4.5 w-4.5" /> : <PanelLeftClose className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-3 px-3">
            <ul className="space-y-1">
              {menuItems.map(item => {
                const isActive = location === item.path;
                return (
                  <li key={item.path}>
                    <button
                      onClick={() => {
                        setLocation(item.path);
                        if (isMobile) setOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                        ${isActive
                          ? "bg-primary/10 text-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }
                      `}
                    >
                      <item.icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-primary" : ""}`} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="border-t border-border p-3 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors w-full text-right focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0 bg-primary text-primary-foreground">
                    <AvatarFallback className="text-xs font-bold bg-primary text-primary-foreground">
                      {admin?.displayName?.charAt(0).toUpperCase() || admin?.username?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-none">
                      {admin?.displayName || admin?.username || "مسؤول"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5" dir="ltr">
                      @{admin?.username}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => setLocation("/control-panel/account")}
                  className="cursor-pointer"
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  <span>تغيير كلمة المرور</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logoutMutation.mutate()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Toggle button - always visible when sidebar is closed */}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className={`
              fixed z-50 flex items-center justify-center
              bg-primary text-primary-foreground shadow-lg
              rounded-xl hover:bg-primary/90 active:scale-95
              transition-all duration-200
              ${isMobile
                ? "bottom-5 right-5 h-12 w-12"
                : "top-4 right-4 h-10 w-10"
              }
            `}
            aria-label="فتح القائمة"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </button>
        )}

        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
