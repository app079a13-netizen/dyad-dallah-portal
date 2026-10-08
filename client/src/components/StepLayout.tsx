import { ReactNode } from "react";
import { SiteLayout } from "./SiteLayout";
import { CheckCircle2 } from "lucide-react";

interface StepLayoutProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  step: number; // 1..9
  total?: number;
  children: ReactNode;
  variant?: "orange" | "green" | "blue" | "red";
}

const VARIANT_CLASSES: Record<string, string> = {
  orange: "from-orange-500 to-orange-700",
  green: "from-emerald-500 to-emerald-700",
  blue: "from-blue-600 to-blue-800",
  red: "from-red-500 to-red-700",
};

export function StepLayout({
  title,
  subtitle,
  badge,
  step,
  total = 10,
  children,
  variant = "orange",
}: StepLayoutProps) {
  const progress = Math.round((step / total) * 100);
  const headerClass = VARIANT_CLASSES[variant];

  return (
    <SiteLayout>
      {/* رأس الصفحة بشريط تقدم */}
      <section className={`bg-gradient-to-br ${headerClass} text-white py-10`}>
        <div className="container max-w-4xl mx-auto px-4">
          {badge && (
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
              <CheckCircle2 className="w-4 h-4" />
              {badge}
            </div>
          )}
          {title && (
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-white/90 mt-2 text-sm md:text-base leading-relaxed">
              {subtitle}
            </p>
          )}

          {/* شريط التقدم */}
          <div className="mt-5">
            <div className="flex justify-between text-xs text-white/85 mb-1.5">
              <span>الخطوة {step} من {total}</span>
              <span>{progress}% مكتمل</span>
            </div>
            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* محتوى الخطوة */}
      <section className="py-10 bg-gradient-to-b from-orange-50/40 to-white">
        <div className="container max-w-3xl mx-auto px-4">
          {children}
        </div>
      </section>
    </SiteLayout>
  );
}
