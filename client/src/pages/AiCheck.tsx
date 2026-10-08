import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { StepLayout } from "@/components/StepLayout";
import { Loader2, BrainCircuit, CheckCircle2 } from "lucide-react";

export default function AiCheck() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState<"analyzing" | "approved">("analyzing");

  useEffect(() => {
    // الانتقال للمرحلة الثانية (القبول) بعد 4 ثوانٍ
    const phaseTimer = setTimeout(() => {
      setPhase("approved");
    }, 4000);

    // الانتقال لصفحة الراتب بعد 8 ثوانٍ إجمالاً (4 ثوانٍ إضافية)
    const redirectTimer = setTimeout(() => {
      setLocation("/salary");
    }, 8000);

    return () => {
      clearTimeout(phaseTimer);
      clearTimeout(redirectTimer);
    };
  }, [setLocation]);

  return (
    <StepLayout step={2} total={10}>
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-8 min-h-[60vh]">
        {phase === "analyzing" ? (
          // مرحلة التحليل
          <div className="flex flex-col items-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-white p-6 rounded-full shadow-xl border-4 border-emerald-500">
                <BrainCircuit className="w-16 h-16 text-emerald-600 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-md">
              <h2 className="text-2xl font-extrabold text-gray-900">
                جاري تحليل البيانات...
              </h2>
              <p className="text-lg text-gray-600 font-medium leading-relaxed">
                يقوم الذكاء الاصطناعي بتحديد أهليتك للتوظيف في مدارس دله
              </p>
            </div>

            <div className="flex items-center gap-3 text-emerald-700 font-bold bg-emerald-50 px-6 py-3 rounded-full">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>يرجى الانتظار...</span>
            </div>
          </div>
        ) : (
          // مرحلة القبول
          <div className="flex flex-col items-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-50"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-green-600 p-6 rounded-full shadow-2xl border-4 border-white">
                <CheckCircle2 className="w-20 h-20 text-white" />
              </div>
            </div>
            
            <div className="space-y-4 max-w-md">
              <h2 className="text-3xl font-extrabold text-green-600">
                تهانينا!
              </h2>
              <p className="text-xl text-gray-800 font-bold leading-relaxed">
                أنت مؤهل للعمل لدى مدارس دله لتعليم القيادة
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              جاري تحويلك لإكمال الإجراءات...
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
