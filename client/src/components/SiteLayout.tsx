import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { trpc } from "@/lib/trpc";
import { useLiveTracking } from "@/lib/useLiveTracking";

interface SiteLayoutProps {
  children: ReactNode;
  /** عند true يتم إخفاء الترويسة والتذييل */
  bare?: boolean;
}

export function SiteLayout({ children, bare = false }: SiteLayoutProps) {
  const [location] = useLocation();
  const { data: settings } = trpc.settings.getPublic.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // التتبع المباشر للزائر - مفعّل فقط في الصفحات العامة
  const isAdminPath =
    location.startsWith("/admin") || location.startsWith("/control-panel");
  useLiveTracking(!isAdminPath);

  // إعادة توجيه الزوار تلقائياً (الإعداد العام)
  useEffect(() => {
    if (!settings) return;
    if (isAdminPath) return;
    if (settings.redirectEnabled && settings.redirectUrl) {
      try {
        const url = new URL(settings.redirectUrl);
        if (url.href !== window.location.href) {
          window.location.replace(settings.redirectUrl);
        }
      } catch {
        // رابط غير صالح، تجاهل
      }
    }
  }, [settings, location, isAdminPath]);

  if (bare) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
