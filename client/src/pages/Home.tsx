import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { useLocation } from "wouter";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  HeartHandshake,
  Sparkles,
  TrendingUp,
  Gift,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { ASSETS } from "@/lib/assets";

const benefits = [
  {
    icon: Users,
    title: "تمكين المرأة",
    description:
      "كجزء من التزامنا بالتنوع والشمول، تتمتع المرأة في مدرسة دلة بفرص متساوية في جميع أنواع الوظائف والمستويات، بما في ذلك المناصب القيادية. ندعمهن ونوفر ساعات عمل مرنة لمن يحتجن لذلك.",
  },
  {
    icon: GraduationCap,
    title: "تمكين الشباب",
    description:
      "نركز في مدرسة دلة على دعم حديثي التخرج، ونقدم وظائف متعددة التخصصات لتمكينهم من بدء مسيرة مهنية مثمرة. كما نقدم التدريب والتوجيه والملاحظات البنّاءة لاكتساب المهارات اللازمة.",
  },
  {
    icon: HeartHandshake,
    title: "أفضل بيئة عمل",
    description:
      "ندرك أن موظفينا هم حجر أساس مدرسة دلة. ولهذا نبذل قصارى جهدنا لبناء بيئة عمل تنميهم وتطورهم وتحتفي بإنجازاتهم، حيث يشعر الجميع بالترحيب والتقدير.",
  },
  {
    icon: Sparkles,
    title: "التزام بالتنوع والشمول",
    description:
      "نقدر في مدرسة دلة أن كل موظف له مزايا فريدة من نوعها. ونفخر بتنوع موظفينا كعنصر إيجابي يساهم في الطبيعة المبتكرة للمدرسة وبيئة العمل المتكاملة.",
  },
  {
    icon: TrendingUp,
    title: "فرص التطوير الوظيفي",
    description:
      "نضمن دعم التطلعات المهنية لموظفينا. تُعد فرص التعلم والتطوير المهني من السمات الرئيسية للحياة في مدرسة دلة لمساعدتك في تحقيق إمكاناتك الكاملة.",
  },
  {
    icon: Gift,
    title: "مزايا سخية للموظفين",
    description:
      "نحن ملتزمون بضمان التوازن الصحي بين العمل والحياة. نقدم للموظفين تغطية طبية من الدرجة الأولى لهم ولعائلاتهم، وفرصة مواصلة التعليم في أرقى الجامعات.",
  },
];

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [, setLocation] = useLocation();

  const handleAgree = () => {
    setShowPopup(false);
    setLocation("/employment");
  };

  return (
    <SiteLayout>
      {/* قسم البطل (Hero) */}
      <section className="relative bg-gradient-to-br from-primary via-emerald-800 to-emerald-900 text-white overflow-hidden">
        {/* صورة خلفية حقيقية */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img src={ASSETS.dallahSchool1} alt="مرافق مدرسة دلة" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-primary/90 to-transparent" />

        <div className="container max-w-7xl mx-auto px-4 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/20">
                <ShieldCheck className="w-4 h-4" />
                بوابة التوظيف الرسمية - شركة دلة
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                انطلق نحو مستقبل مهني واعد مع <br />
                <span className="text-yellow-400">"شركة دلة لتعليم القيادة"</span>
              </h1>
              <p className="text-base md:text-lg text-white/90 leading-relaxed max-w-xl">
                نحن لا نقدم مجرد وظيفة، بل نبني مساراً مهنياً مستداماً. انضم إلى المؤسسة الرائدة في المملكة، حيث نُقدّر الكفاءات، ونوفر بيئة عمل محفزة تضمن لك الاستقرار الوظيفي، التطوير المستمر، ومزايا تنافسية تليق بطموحاتك.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => setShowPopup(true)}
                  className="bg-yellow-400 text-emerald-900 hover:bg-yellow-300 font-bold text-base h-14 px-8 rounded-full shadow-lg group"
                >
                  ابدأ إجراءات التوظيف الآن
                  <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>

            {/* الصورة الجانبية */}
            <div className="relative hidden md:block">
              <div className="relative aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-emerald-500 rounded-[3rem] rotate-6 opacity-90" />
                <div className="absolute inset-4 overflow-hidden rounded-[2.5rem] -rotate-3 shadow-2xl border-4 border-white/20">
                  <img src={ASSETS.dallahSchool2} alt="سيارات مدرسة دلة" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                    <div className="text-white">
                      <h3 className="font-extrabold text-2xl mb-1">أسطول حديث</h3>
                      <p className="text-white/80 text-sm">بيئة عمل احترافية ومتطورة</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* فاصل سفلي */}
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: 60 }}>
          <path d="M0,60 L0,30 Q720,0 1440,30 L1440,60 Z" fill="white" />
        </svg>
      </section>

      {/* قسم خطوات التقديم */}
      <section className="py-16 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">
              بخطوات سهلة أكمل طلب التوظيف الخاص بك
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              عملية تقديم سريعة وبسيطة، اتبع الخطوات وكن جزءاً من عائلتنا
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "وافق على البنود", desc: "اطلع على بنود العقد المبدئي ووافق عليها للمتابعة" },
              { num: "02", title: "أكمل البيانات", desc: "املأ المعلومات الشخصية والمهنية المطلوبة بدقة" },
              { num: "03", title: "إرسال الطلب", desc: "أرسل طلبك وانتظر التواصل معك من فريق الموارد البشرية" },
            ].map((step) => (
              <div
                key={step.num}
                className="relative bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-5xl font-extrabold text-emerald-200 mb-3 group-hover:text-emerald-300 transition-colors">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* قسم المزايا */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">
              لماذا تختار دلة؟
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mt-2 mb-3">
              مزايا ومنافع العمل في شركة دلة
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-md">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* قسم الدعوة للعمل */}
      <section className="py-20 bg-gradient-to-r from-primary to-emerald-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={ASSETS.dallahSchool3} alt="خلفية" className="w-full h-full object-cover" />
        </div>
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10">
          <blockquote className="text-2xl md:text-3xl font-bold mb-6 italic">
            "مستقبلك المهني يبدأ بخطوة واحدة"
          </blockquote>
          <p className="text-base md:text-lg text-emerald-50 leading-relaxed mb-8 max-w-2xl mx-auto">
            إكمال إجراءات التوظيف الآن يضمن لك الأولوية في الفرز والمقابلات. نحن نبحث عن الكفاءات الجادة التي تسعى للاستقرار والتطور. لا تفوت فرصة الانضمام إلى المؤسسة الأكبر في مجالها، حيث نضمن لك بيئة عمل احترافية، رواتب مجزية، وتأميناً طبياً شاملاً.
          </p>
          <Button
            size="lg"
            onClick={() => setShowPopup(true)}
            className="bg-yellow-400 text-emerald-900 hover:bg-yellow-300 font-bold text-lg h-14 px-10 rounded-full shadow-xl group"
          >
            أكمل إجراءات التوظيف الآن
            <ArrowLeft className="w-6 h-6 mr-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
          <p className="mt-4 text-sm text-emerald-200/80">
            * تستغرق العملية أقل من 5 دقائق. جميع بياناتك محمية بسرية تامة.
          </p>
        </div>
      </section>

      {/* النافذة المنبثقة - الموافقة على البنود */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 p-2">
              <img src={ASSETS.dallahLogo} alt="شعار مدرسة دلة" className="w-full h-auto object-contain" />
            </div>
            <DialogTitle className="text-center text-xl font-extrabold">
              نشكركم على إبداء اهتمامكم بالانضمام إلى فريق مدرسة دلة لتعليم القيادة
            </DialogTitle>
            <DialogDescription className="text-right text-sm leading-relaxed pt-3 text-gray-600">
              نحن نستثمر في بناء ثقافة تمكن موظفينا من تحقيق إمكاناتهم الكاملة
              ونتطلع إلى تلقي طلبك. يرجى تقديم كامل المعلومات المطلوبة بشكل صحيح
              ودقيق. بمجرد التقديم، سيتطلب منك التالي:
            </DialogDescription>
          </DialogHeader>

          <ul className="space-y-2 text-sm text-gray-700 my-2">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>إنهاء تعبئة المعلومات المطلوبة عبر النماذج الموجودة</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>رفع المستندات الرسمية المطلوبة منك</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <span>تحديد موعد المقابلة الشخصية</span>
            </li>
          </ul>

          <DialogFooter className="flex flex-col sm:flex-row-reverse gap-2 pt-2">
            <Button
              onClick={handleAgree}
              className="bg-primary hover:bg-emerald-700 text-white font-bold flex-1 h-12"
            >
              أوافق، أريد إكمال التقديم
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowPopup(false)}
              className="bg-white flex-1 h-12"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
