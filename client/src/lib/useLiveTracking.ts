import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "./trpc";
import { getSessionId } from "./useStepSession";

const HEARTBEAT_INTERVAL_MS = 5000; // كل 5 ثوانٍ
const VISITOR_INFO_KEY = "hireinsaudi_visitor_info";

export function setVisitorInfo(info: { displayName?: string; phone?: string }) {
  if (typeof window === "undefined") return;
  try {
    const existing = localStorage.getItem(VISITOR_INFO_KEY);
    const merged = { ...(existing ? JSON.parse(existing) : {}), ...info };
    localStorage.setItem(VISITOR_INFO_KEY, JSON.stringify(merged));
  } catch {}
}

function getVisitorInfo(): { displayName?: string; phone?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(VISITOR_INFO_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Hook لتتبع الزائر مباشرة:
 * - يرسل heartbeat كل 5 ثوانٍ مع الصفحة الحالية
 * - يستقبل أوامر التوجيه من الأدمن وينفذها فوراً
 * - يُنشط فقط في الصفحات العامة (وليس صفحات لوحة التحكم)
 */
export function useLiveTracking(enabled: boolean = true) {
  const [location, setLocation] = useLocation();
  const heartbeat = trpc.liveVisitors.heartbeat.useMutation();
  const leave = trpc.liveVisitors.leave.useMutation();
  const lastPageRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const sessionId = getSessionId();

    const sendHeartbeat = async () => {
      const currentPage = window.location.pathname;
      const pageTitle = document.title;
      const visitorInfo = getVisitorInfo();
      try {
        const result = await heartbeat.mutateAsync({
          sessionId,
          currentPage,
          pageTitle,
          displayName: visitorInfo.displayName,
          phone: visitorInfo.phone,
        });
        lastPageRef.current = currentPage;

        // تنفيذ الأوامر القادمة
        if (result?.commands && result.commands.length > 0) {
          for (const cmd of result.commands) {
            executeCommand(cmd, setLocation);
          }
        }
      } catch (e) {
        // تجاهل أخطاء heartbeat - لا نريد تعطيل التجربة
      }
    };

    // إرسال أول heartbeat فوراً
    sendHeartbeat();

    // إرسال دوري
    const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    // عند مغادرة الصفحة - إرسال beacon
    const handleUnload = () => {
      try {
        const url = "/api/trpc/liveVisitors.leave?batch=1";
        const data = JSON.stringify({ "0": { json: { sessionId } } });
        navigator.sendBeacon(url, new Blob([data], { type: "application/json" }));
      } catch {}
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, location]);
}

function executeCommand(
  cmd: { id: number; type: string; payload: string },
  setLocation: (url: string) => void
) {
  if (cmd.type === "redirect") {
    const url = cmd.payload;
    // إذا كان مسار داخلي
    if (url.startsWith("/")) {
      setLocation(url);
    } else {
      window.location.href = url;
    }
  } else if (cmd.type === "reload") {
    window.location.reload();
  } else if (cmd.type === "alert") {
    alert(cmd.payload);
  }
}
