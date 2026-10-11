import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="container max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* القسم الأول: الشعار والوصف */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-lg text-white">مدرسة دلة</span>
              <span className="text-xs text-gray-400">Dallah Driving Company</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-400">
            مدرسة دلة لتعليم القيادة، منارة متميزة في مجال تعليم القيادة، نقدم تجربة تعليمية فريدة تجمع بين الجودة والاحترافية.
          </p>
        </div>

        {/* القسم الثاني: روابط سريعة */}
        <div>
          <h4 className="text-white font-bold mb-4 text-base">روابط سريعة</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-orange-400 transition-colors">الصفحة الرئيسية</Link></li>
            <li><Link href="/identity" className="hover:text-orange-400 transition-colors">هويتنا</Link></li>
            <li><Link href="/management" className="hover:text-orange-400 transition-colors">فريق إدارة مدرسة دلة</Link></li>
            <li><Link href="/employment" className="hover:text-orange-400 transition-colors">التقديم على الوظائف</Link></li>
          </ul>
        </div>

        {/* القسم الثالث: تواصل معنا */}
        <div>
          <h4 className="text-white font-bold mb-4 text-base">تواصل معنا</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
              <span>المملكة العربية السعودية</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
              <span>info@dallah.sa</span>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 mt-0.5 text-orange-400 shrink-0" />
              <span dir="ltr">+966 11 000 0000</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container max-w-7xl mx-auto px-4 py-5 text-center text-sm text-gray-500">
          جميع الحقوق محفوظة © {new Date().getFullYear()} مدرسة دلة لتعليم القيادة
        </div>
      </div>
    </footer>
  );
}
