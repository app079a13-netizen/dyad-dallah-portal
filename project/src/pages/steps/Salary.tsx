import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepLayout } from "@/components/StepLayout";
import { useStepSession } from "@/lib/useStepSession";
import { useLocation } from "wouter";
import { useEffect } from "react";
import {
  Award, Building2, Clock, MapPin, Briefcase, User, ArrowLeft, CheckCircle2,
} from "lucide-react";

const ITEMS = [
  { icon: Clock, label: "نوع القبول", value: "وظيفة بدوام كامل | 09:00 AM – 03:00 PM" },
  { icon: MapPin, label: "الموقع", value: "فرع مدرسة دلة في مدينتك، السعودية" },
  { icon: Briefcase, label: "المسمى الوظيفي", value: "اداري (يتم تحديده لاحقاً)" },
  { icon: Award, label: "الراتب", value: "(يتم تحديده لاحقاً) + بونص 2.5% سنوياً" },
  { icon: User, label: "المسؤول المباشر", value: "(يتم تحديده لاحقاً)" },
];

export default function Salary() {
  const [, setLocation] = useLocation();
  const { recordStep } = useStepSession();

  useEffect(() => {
    recordStep("salary_view", { page: "salary" });
  }, []);

  const handleAccept = async () => {
    await recordStep("salary_accept", { accepted: true });
    setLocation("/ypti");
  };

  return (
    <StepLayout
      step={2}
      total={10}
      badge="بنود العقد المبدئي"
      title="تهانينا لك . . ."
      variant="orange"
    >
      <Card className="p-6 md:p-8 shadow-lg border-emerald-100">
        <div className="flex items-start gap-3 mb-5 pb-5 border-b border-emerald-100">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">
              عزيزنا المتقدم للتوظيف في <span className="text-emerald-700">(مدرسة دلة لتعليم القيادة)</span>
            </h2>
            <p className="text-gray-600 text-sm mt-1.5 leading-relaxed">
              بعد تفقد سيرتك الذاتية وطلب التوظيف الخاص بك، لقد تم قبولك في
              مدرسة دلة لتعليم القيادة. ولإكمال عملية التوظيف عليك إكمال نموذج
              القبول الخاص بك.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {ITEMS.map((it, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-gradient-to-br from-emerald-50 to-white rounded-lg border border-emerald-100"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <it.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-orange-700 mb-0.5">{it.label}</p>
                <p className="text-sm text-gray-800 leading-snug">{it.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
          <Building2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800">
            هذا عرض مبدئي قابل للتعديل بعد إتمام جميع إجراءات التوظيف.
          </p>
        </div>

        <Button
          onClick={handleAccept}
          size="lg"
          className="w-full mt-6 bg-primary hover:bg-emerald-700 font-bold h-12 shadow-md"
        >
          القبول وإكمال النموذج التوظيفي
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>
      </Card>
    </StepLayout>
  );
}
