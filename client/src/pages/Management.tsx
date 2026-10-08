import { SiteLayout } from "@/components/SiteLayout";
import { User, Quote } from "lucide-react";

const team = [
  {
    name: "بندر الشتيلي",
    title: "مدير مدرسة دلة - الرئيس التنفيذي",
    bio: "يقود مسيرة المدرسة منذ سنوات ويشرف على تطوير برامجها التعليمية وتحقيق رؤيتها الاستراتيجية.",
  },
  {
    name: "خالد العتيبي",
    title: "مدير الموارد البشرية",
    bio: "مسؤول عن استقطاب الكفاءات وتطوير قدرات الموظفين وبناء بيئة عمل محفزة.",
  },
  {
    name: "محمد القحطاني",
    title: "مدير العمليات",
    bio: "يشرف على إدارة العمليات اليومية وتنسيق الأعمال بين الأقسام المختلفة لتحقيق الكفاءة التشغيلية.",
  },
  {
    name: "سارة الحربي",
    title: "مديرة شؤون المتدربين",
    bio: "تشرف على تجربة المتدربين وتطوير برامج الدعم والمتابعة لضمان أعلى مستويات التميز.",
  },
  {
    name: "أحمد الدوسري",
    title: "مدير التدريب الفني",
    bio: "يقود فريق المدربين الفنيين ويشرف على المناهج العملية وأحدث التقنيات التدريبية.",
  },
  {
    name: "نورة الزهراني",
    title: "مديرة الجودة والتطوير",
    bio: "تعمل على تطوير معايير الجودة وضمان التميز في جميع برامج المدرسة وعملياتها.",
  },
];

export default function Management() {
  return (
    <SiteLayout>
      {/* رأس الصفحة */}
      <section className="bg-gradient-to-br from-primary to-emerald-900 text-white py-20">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">فريق إدارة شركة دلة</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            تعرف على القيادات التي تقود مسيرة شركة دلة لتعليم القيادة نحو التميز والريادة.
          </p>
        </div>
      </section>

      {/* رسالة الرئيس التنفيذي */}
      <section className="py-16 bg-gradient-to-b from-emerald-50 to-white">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-emerald-100 p-8 md:p-10 shadow-sm relative">
            <Quote className="w-16 h-16 text-emerald-200 absolute top-6 left-6" />

            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white shadow-lg shrink-0">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">بندر الشتيلي</h3>
                <p className="text-sm text-primary font-semibold">الرئيس التنفيذي - شركة دلة</p>
              </div>
            </div>

            <h4 className="text-lg font-bold text-gray-900 mb-3">رسالة الرئيس التنفيذي</h4>
            <div className="text-gray-700 leading-loose space-y-3 text-sm md:text-base">
              <p>
                <strong>أهلاً بكم في مدرسة دلة لتعليم القيادة.</strong>
              </p>
              <p>
                بصفتنا منارة متميزة في مجال تعليم القيادة، نقدم في مدرستنا للمتدربين
                تجربة تعليمية فريدة تجمع بين الجودة والاحترافية، لتكون بذلك وجهة
                مثالية لكل من يرغب في تعلم مهارات القيادة بأعلى المعايير.
              </p>
              <p>
                تم تصميم برنامجنا التعليمي وفق أعلى المعايير العالمية، مع التركيز
                على السلامة والتقنيات الحديثة، حيث نهدف إلى تزويد المتدربين بالمعرفة
                والمهارات اللازمة ليصبحوا سائقين محترفين وآمنين.
              </p>
              <p>
                إذا كنت مستعداً لبدء رحلتك في مدرسة دلة لتعليم القيادة، تواصل معنا
                وسنكون سعداء بالإجابة على جميع استفساراتك لننطلق سويًا نحو مستقبل
                آمن ومشرق.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* فريق العمل */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="text-primary font-bold text-sm uppercase tracking-wider">الإدارة العليا</span>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2 mb-3">قادتنا الملهمون</h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((m) => (
              <div key={m.name} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center text-white mb-4 shadow-md group-hover:scale-105 transition-transform">
                  <User className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-1">{m.name}</h3>
                <p className="text-sm text-primary font-semibold mb-3">{m.title}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
