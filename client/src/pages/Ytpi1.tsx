import { Link } from "wouter";
import { SiteLayout } from "@/components/SiteLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  RefreshCw,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Building2,
  ReceiptText,
  Sparkles,
  BadgeCheck,
  CalendarClock,
  CreditCard,
} from "lucide-react";

export default function Ytpi1() {
  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-5">
              <BadgeCheck className="w-4 h-4 text-amber-300" />
              <span className="text-sm font-bold">شهادة طبية معتمدة</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
              الشهادة الصحية الدولية
              <span className="block text-amber-300 mt-2">YPTI</span>
            </h1>
            <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
              فحص طبي شامل إلزامي لجميع العاملين في مدارس تعليم القيادة، يضمن جاهزيتك المهنية والصحية
              لخوض مسارك الوظيفي مع شركة دلة
            </p>
          </div>
        </div>
        {/* Wave divider */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ height: "50px" }}
        >
          <path d="M0,80 C480,0 960,0 1440,80 L1440,80 L0,80 Z" fill="white" />
        </svg>
      </section>

      {/* بطاقات الميزات الثلاث */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <Card className="p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-colors text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center mb-4 shadow-md">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">على نفقة التأمين</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              بعد انتهاء إجراءات التوظيف يتم استرجاع المبلغ المدفوع كاملاً عبر التأمين الصحي
            </p>
          </Card>

          <Card className="p-6 border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white hover:border-amber-400 transition-colors text-center relative">
            <div className="absolute -top-3 right-1/2 translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-extrabold px-3 py-1 rounded-full shadow-sm">
              مهم
            </div>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center mb-4 shadow-md">
              <ReceiptText className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">لماذا تدفع رسوم قبل التوظيف؟</h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              لحجز موعدك الطبي وضمان جاهزيتك لإكمال إجراءات الانضمام لطاقم العمل
            </p>
          </Card>

          <Card className="p-6 border-2 border-emerald-100 hover:border-emerald-300 transition-colors text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white flex items-center justify-center mb-4 shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="font-extrabold text-lg text-gray-900 mb-2">للعاملين في المدرسة</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              المبلغ مسترجع في حالة قبول العرض الوظيفي أو في حالة الرفض دون أي خصومات
            </p>
          </Card>
        </div>
      </section>

      {/* قسم التعريف الرئيسي */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
              {/* أيقونة جانبية */}
              <div className="w-full md:w-48 shrink-0">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 text-white flex flex-col items-center justify-center shadow-xl">
                  <HeartPulse className="w-16 h-16 md:w-20 md:h-20 mb-3" />
                  <span className="text-2xl font-extrabold tracking-wider">YPTI</span>
                  <span className="text-xs opacity-80 mt-1">الشهادة الصحية</span>
                </div>
              </div>

              {/* النص */}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs font-bold mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  تعريف بالشهادة
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                  تعريف بالشهادة الصحية الدولية{" "}
                  <span className="text-emerald-700">(YPTI)</span>
                </h2>
                <p className="text-gray-700 leading-loose mb-4">
                  شهادة طبية تتكون من عدة فحوصات خاصة لجميع العاملين في مدارس تعليم القيادة، حيث
                  يعتبر العمل في{" "}
                  <span className="font-bold text-emerald-700">دلة لتعليم القيادة</span> ذو
                  مسؤولية خاصة تستوجب أعلى معايير الحرفية والالتزام، يتم تجديد الفحص كل سنتين، وتكون
                  تكلفة الفحص على نفقة التأمين الصحي الخاص بموظفي شركة دلة لتعليم قيادة السيارات.
                </p>

                {/* قائمة الفحوصات الشائعة */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                  {[
                    "فحص الرؤية والسمع",
                    "فحص ضغط الدم والقلب",
                    "تحاليل دم شاملة",
                    "فحص اللياقة العامة",
                    "اختبار رد الفعل",
                    "تقييم الحالة النفسية",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-100"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* قسم الحجز والدفع */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden border-2 border-amber-200 shadow-lg">
            {/* رأس البطاقة */}
            <div className="bg-gradient-to-l from-amber-400 to-amber-500 text-amber-950 p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <CalendarClock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg md:text-xl">
                    حجز الشهادة الصحية الدولية (YPTI)
                  </h3>
                  <p className="text-sm opacity-80">عن طريق مدارس دلة لتعليم قيادة السيارات</p>
                </div>
              </div>
            </div>

            {/* جسم البطاقة */}
            <div className="p-5 md:p-7 space-y-5">
              <p className="text-gray-700 leading-loose">
                يتم تجديد الشهادة كل سنتين لكل موظف من موظفي الشركة، حيث أن تكلفة الشهادة:
              </p>

              {/* بطاقة السعر */}
              <div className="rounded-xl bg-gradient-to-l from-red-50 to-amber-50 border-2 border-red-200 p-5 md:p-6 text-center">
                <p className="text-sm text-gray-600 mb-1">تكلفة الفحص الطبي الشامل</p>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl md:text-6xl font-extrabold text-red-600">383</span>
                  <span className="text-2xl font-bold text-red-500">ريال سعودي</span>
                </div>
                <p className="text-xs text-gray-600 mt-2">دفعة واحدة عند الحجز</p>
              </div>

              {/* خطوات الاسترداد */}
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-5">
                <h4 className="font-extrabold text-emerald-900 mb-3 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  كيف يتم استرداد المبلغ؟
                </h4>
                <ol className="space-y-2.5">
                  {[
                    {
                      n: "1",
                      t: "ادفع تكلفة الشهادة الآن لحجز موعدك وإكمال إجراءات التوظيف",
                    },
                    { n: "2", t: "ابدأ دوامك الرسمي مع شركة دلة لتعليم القيادة" },
                    { n: "3", t: "عند إنهاء أول شهر عمل، يُودَع المبلغ كاملاً مع أول راتب" },
                  ].map((step) => (
                    <li key={step.n} className="flex gap-3 items-start">
                      <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center shrink-0 text-sm">
                        {step.n}
                      </span>
                      <span className="text-sm text-gray-800 leading-relaxed flex-1">
                        {step.t}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* تنبيه */}
              <div className="bg-red-50 border-r-4 border-red-500 rounded-md p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900 text-sm mb-1">يستوجب عليك الآن دفعها</p>
                  <p className="text-xs text-red-800 leading-relaxed">
                    لا يمكن إكمال إجراءات التوظيف دون حجز الشهادة الصحية أولاً. سيتم استرداد المبلغ
                    بالكامل مع أول راتب.
                  </p>
                </div>
              </div>

              {/* ميزات سريعة */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  تجديد كل سنتين
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  دفع آمن مباشر
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  استرداد كامل
                </div>
              </div>
            </div>
          </Card>

          {/* أزرار الإجراءات */}
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/ypti">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-bold h-12"
              >
                <ArrowRight className="w-5 h-5 ml-2" />
                العودة إلى الفحص الطبي
              </Button>
            </Link>
            <Link href="/data">
              <Button
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold h-12 shadow-md"
              >
                إكمال الإجراءات والدفع
                <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
