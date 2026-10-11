import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StepLayout } from "@/components/StepLayout";
import { useLocation } from "wouter";
import { CheckCircle2, Home, Mail, Phone } from "lucide-react";

export default function ThankYou() {
  const [, setLocation] = useLocation();

  return (
    <StepLayout
      step={10}
      total={10}
      badge="تمت العملية بنجاح"
      title="شكراً لك! تم استلام طلبك"
      subtitle="سيتم التواصل معك من قبل فريق إدارة مدرسة دلة لتعليم القيادة خلال 24 ساعة"
      variant="green"
    >
      <Card className="p-8 md:p-10 shadow-xl border-emerald-100 bg-white text-center">
        {/* أيقونة النجاح */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" style={{ animationDuration: "2s" }} />
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-xl">
            <CheckCircle2 className="w-12 h-12" />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-emerald-700 mb-3">
          تم تأكيد طلبك بنجاح
        </h2>
        <p className="text-gray-700 mb-2 leading-relaxed">
          تم استلام جميع بياناتك بنجاح وستتم مراجعتها من قبل فريق التوظيف.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          سيصلك إشعار عبر البريد الإلكتروني والرسائل النصية بنتيجة الطلب.
        </p>

        {/* بطاقة التواصل */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6 max-w-md mx-auto">
          <p className="font-bold text-emerald-800 mb-3">للاستفسار أو المتابعة</p>
          <div className="space-y-2 text-sm text-emerald-700">
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" />
              <span dir="ltr">+966 11 XXX XXXX</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              <span dir="ltr">jobs@dallahdrivingschool.com</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setLocation("/")}
          size="lg"
          className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-bold h-12 px-8"
        >
          <Home className="w-5 h-5 ml-2" />
          العودة للصفحة الرئيسية
        </Button>
      </Card>
    </StepLayout>
  );
}
