import { SiteLayout } from "@/components/SiteLayout";
import { Target, Eye, Award, BookOpen, Users, Car } from "lucide-react";
import { ASSETS } from "@/lib/assets";

const values = [
  { icon: Award, title: "الجودة", desc: "نلتزم بأعلى معايير الجودة في كل ما نقدمه من برامج تدريبية." },
  { icon: BookOpen, title: "الاحترافية", desc: "نقدم تعليماً احترافياً وفق منهجية متطورة تواكب أحدث الأساليب." },
  { icon: Users, title: "التميز", desc: "نسعى دائماً للتميز في تجربة المتدرب والموظف على حد سواء." },
  { icon: Car, title: "السلامة", desc: "السلامة على الطرق هي أولويتنا القصوى في كل برامجنا التعليمية." },
];

export default function Identity() {
  return (
    <SiteLayout>
      {/* رأس الصفحة */}
      <section className="relative bg-gradient-to-br from-primary to-emerald-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <img src={ASSETS.dallahSchool4} alt="خلفية" className="w-full h-full object-cover" />
        </div>
        <div className="container max-w-6xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">هويتنا</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            تعرّف على شركة دلة لتعليم القيادة، رسالتنا، رؤيتنا، وقيمنا الراسخة.
          </p>
        </div>
      </section>

      {/* محتوى الهوية */}
      <section className="py-16">
        <div className="container max-w-5xl mx-auto px-4 space-y-12">
          {/* من نحن */}
          <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-lg bg-emerald-100 text-primary flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </span>
                من نحن
              </h2>
              <p className="text-gray-700 leading-loose">
                شركة دلة لتعليم القيادة هي إحدى المؤسسات التعليمية الرائدة والأعرق في المملكة
                العربية السعودية. نقدم منذ تأسيسنا تجربة تعليمية فريدة تجمع بين الجودة
                والاحترافية، لتكون وجهة مثالية لكل من يرغب في تعلم مهارات القيادة بأعلى
                المعايير. نحرص على تزويد المتدربين بالمعرفة والمهارات اللازمة ليصبحوا
                سائقين محترفين وآمنين على الطرقات، ونفخر بكوننا الخيار الأول لملايين المتدربين.
              </p>
            </div>
            <div className="w-full md:w-1/3">
              <img src={ASSETS.dallahSchool5} alt="مبنى دلة" className="rounded-xl shadow-md w-full h-auto object-cover aspect-video" />
            </div>
          </div>

          {/* الرؤية والرسالة */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-8">
              <div className="w-12 h-12 rounded-lg bg-primary text-white flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-3">رؤيتنا</h3>
              <p className="text-gray-700 leading-relaxed">
                أن نكون المرجع الأول في تعليم القيادة بالمملكة العربية السعودية،
                ونساهم في بناء جيل من السائقين الواعين والمسؤولين على الطرقات.
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-emerald-100 p-8">
              <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-3">رسالتنا</h3>
              <p className="text-gray-700 leading-relaxed">
                تقديم تعليم متميز للقيادة وفق أعلى المعايير العالمية، مع التركيز على
                السلامة والتقنيات الحديثة، ودعم تنمية الكوادر البشرية وتمكينها.
              </p>
            </div>
          </div>

          {/* القيم */}
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">قيمنا</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg hover:border-emerald-200 transition-all">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-emerald-600 text-white flex items-center justify-center mb-3 shadow-md">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 mb-2">{v.title}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
