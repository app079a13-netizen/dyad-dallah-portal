import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import { useLocation } from "wouter";
import { getSessionId } from "@/lib/useStepSession";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  User as UserIcon,
  Loader2,
} from "lucide-react";

const NATIONALITIES = [
  "سعودي", "إماراتي", "كويتي", "بحريني", "قطري", "عماني", "يمني", "أردني",
  "مصري", "سوري", "لبناني", "فلسطيني", "عراقي", "سوداني", "مغربي", "تونسي",
  "جزائري", "ليبي", "صومالي", "موريتاني", "هندي", "باكستاني", "بنغلاديشي",
  "فلبيني", "إندونيسي", "نيبالي", "سريلانكي", "أخرى",
];

const ID_TYPES = [
  { value: "national", label: "هوية وطنية" },
  { value: "iqama", label: "إقامة" },
  { value: "passport", label: "جواز سفر" },
  { value: "gcc", label: "هوية خليجية" },
];

const TITLES = [
  { value: "mr", label: "السيد" },
  { value: "mrs", label: "السيدة" },
  { value: "miss", label: "الآنسة" },
  { value: "dr", label: "الدكتور" },
  { value: "eng", label: "المهندس" },
];

const EDUCATION_LEVELS = [
  "أقل من الثانوية",
  "ثانوية عامة",
  "دبلوم",
  "بكالوريوس",
  "ماجستير",
  "دكتوراه",
];

const POSITIONS = [
  "مدرب قيادة",
  "موظف خدمة عملاء",
  "محاسب",
  "موارد بشرية",
  "تقنية المعلومات",
  "تسويق",
  "إداري",
  "أخرى",
];

interface FormData {
  fullName: string;
  middleName: string;
  familyName: string;
  nationality: string;
  idType: string;
  idNumber: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  title: string;
  email: string;
  gender: "male" | "female" | "";
  phone: string;
  city: string;
  address: string;
  educationLevel: string;
  experience: string;
  desiredPosition: string;
  notes: string;
}

const initialData: FormData = {
  fullName: "", middleName: "", familyName: "",
  nationality: "", idType: "", idNumber: "",
  birthDay: "", birthMonth: "", birthYear: "",
  title: "", email: "", gender: "",
  phone: "", city: "", address: "",
  educationLevel: "", experience: "",
  desiredPosition: "", notes: "",
};

export default function Employment() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("terms");
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialData);

  const createMutation = trpc.applications.create.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلبك بنجاح");
      setLocation("/ai-check");
    },
    onError: (e) => toast.error(e.message || "حدث خطأ، حاول مجدداً"),
  });

  const update = (k: keyof FormData, v: string) => setData(d => ({ ...d, [k]: v }));

  const validateStep1 = () => {
    if (!data.fullName.trim()) return "الاسم الكامل مطلوب";
    if (!data.familyName.trim()) return "اسم العائلة مطلوب";
    if (!data.nationality) return "الجنسية مطلوبة";
    if (!data.idType) return "نوع الهوية مطلوب";
    if (!data.idNumber.trim()) return "رقم الهوية مطلوب";
    if (!data.birthDay || !data.birthMonth || !data.birthYear) return "تاريخ الميلاد مطلوب كاملاً";
    if (!data.title) return "اللقب مطلوب";
    if (!data.email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) return "بريد إلكتروني غير صالح";
    if (!data.gender) return "الرجاء اختيار الجنس";
    return null;
  };

  const validateStep2 = () => {
    if (!data.phone.trim()) return "رقم الجوال مطلوب";
    if (!/^(?:\+?966|0)5\d{8}$/.test(data.phone.replace(/[\s-]/g, ""))) return "رقم جوال غير صالح (يجب أن يبدأ بـ 05 أو +9665)";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) { toast.error(err); return; }
    setStep(2);
  };

  const handleSubmit = () => {
    const err1 = validateStep1();
    if (err1) { toast.error(err1); return; }
    const err2 = validateStep2();
    if (err2) { toast.error(err2); return; }
    const birthDate = `${data.birthYear}-${data.birthMonth.padStart(2, "0")}-${data.birthDay.padStart(2, "0")}`;
    createMutation.mutate({
      fullName: data.fullName,
      middleName: data.middleName || undefined,
      familyName: data.familyName,
      nationality: data.nationality,
      idType: data.idType,
      idNumber: data.idNumber,
      birthDate,
      title: data.title,
      email: data.email,
      gender: data.gender as "male" | "female",
      phone: data.phone,
      city: data.city || undefined,
      address: data.address || undefined,
      educationLevel: data.educationLevel || undefined,
      experience: data.experience || undefined,
      desiredPosition: data.desiredPosition || undefined,
      notes: data.notes || undefined,
      sessionId: getSessionId(),
    });
  };

  // الأيام والشهور والسنين
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1));
  const years = Array.from({ length: 80 }, (_, i) => String(2010 - i));

  return (
    <SiteLayout>
      {/* رأس الصفحة */}
      <section className="bg-gradient-to-br from-primary to-emerald-900 text-white py-14">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">
                العمل في مدرسة دلة لتعليم القيادة
              </h1>
              <p className="text-white/90">قدّم على وظيفتك المناسبة بخطوات سهلة</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm font-semibold inline-block w-fit">
              {activeTab === "terms" ? "أولاً: بنود العقد المبدئي" : "ثانياً: المعلومات المطلوبة"}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="container max-w-4xl mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8 bg-white border border-gray-200 p-1 h-auto">
              <TabsTrigger value="terms" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3 font-semibold">
                <FileText className="w-4 h-4 ml-2" />
                أولاً: بنود العقد المبدئي
              </TabsTrigger>
              <TabsTrigger value="form" className="data-[state=active]:bg-primary data-[state=active]:text-white py-3 font-semibold">
                <UserIcon className="w-4 h-4 ml-2" />
                ثانياً: المعلومات المطلوبة
              </TabsTrigger>
            </TabsList>

            {/* تبويب البنود */}
            <TabsContent value="terms">
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-gray-900 mb-4">
                  يرجى الاطلاع على بنود العقد المبدئي
                </h2>
                <ul className="space-y-3 text-gray-700 leading-relaxed text-sm">
                  {[
                    "أن ينجز العمل الموكل إليه وفقاً لأصول المهنة، ووفق تعليمات الطرف الأول، إذا لم يكن في هذه التعليمات ما يخالف العقد، أو النظام، أو الآداب العامة، ولم يكن في تنفيذها ما يعرضه للخطر.",
                    "أن يعتني عناية كافية بالأدوات والمهمات المسندة إليه، والخامات المملوكة للطرف الأول الموضوعة تحت تصرفه، أو التي تكون في عهدته، وأن يعيد إلى الطرف الأول المواد غير المستهلكة.",
                    "أن يقدم كل عون ومساعدة دون أن يشترط لذلك أجراً إضافياً في حالات الأخطار التي تهدد سلامة مكان العمل، أو الأشخاص العاملين فيه.",
                    "أن يخضع وفقاً لطلب الطرف الأول للفحوص الطبية التي يرغب في إجرائها عليه قبل الالتحاق بالعمل.",
                    "يلتزم الطرف الثاني بحسن السلوك والأخلاق أثناء العمل وفي جميع الأوقات.",
                    "يلتزم بالأنظمة والأعراف والعادات والآداب المرعية في المملكة العربية السعودية، وكذلك بالقواعد واللوائح والتعليمات المعمول بها لدى الطرف الأول، ويتحمل كافة الغرامات المالية الناتجة عن مخالفته لتلك الأنظمة.",
                  ].map((t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex justify-end">
                  <Button
                    onClick={() => setActiveTab("form")}
                    className="bg-primary hover:bg-emerald-700 font-bold"
                  >
                    موافق - الانتقال للتقديم
                    <ChevronLeft className="w-4 h-4 mr-2" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* تبويب النموذج */}
            <TabsContent value="form">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">تسجيل موظف جديد</h2>

                {/* مؤشر الخطوات */}
                <div className="flex items-center gap-2 mb-8 mt-4">
                  <StepIndicator num={1} active={step === 1} done={step > 1} label="الخطوة الأولى" />
                  <div className={`flex-1 h-1 rounded-full ${step > 1 ? "bg-primary" : "bg-gray-200"}`} />
                  <StepIndicator num={2} active={step === 2} done={false} label="الخطوة الثانية" />
                </div>

                {step === 1 && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-gray-900 text-lg pb-2 border-b border-gray-100">معلومات شخصية</h3>

                    <div className="grid md:grid-cols-3 gap-4">
                      <Field label="الاسم الكامل" required>
                        <Input value={data.fullName} onChange={e => update("fullName", e.target.value)} />
                      </Field>
                      <Field label="الاسم الأوسط (اختياري)">
                        <Input value={data.middleName} onChange={e => update("middleName", e.target.value)} />
                      </Field>
                      <Field label="اسم العائلة" required>
                        <Input value={data.familyName} onChange={e => update("familyName", e.target.value)} />
                      </Field>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="الجنسية" required>
                        <Select value={data.nationality} onValueChange={v => update("nationality", v)}>
                          <SelectTrigger><SelectValue placeholder="من فضلك إختر الجنسية" /></SelectTrigger>
                          <SelectContent>
                            {NATIONALITIES.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="نوع الهوية" required>
                        <Select value={data.idType} onValueChange={v => update("idType", v)}>
                          <SelectTrigger><SelectValue placeholder="من فضلك حدد نوع الهوية" /></SelectTrigger>
                          <SelectContent>
                            {ID_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field label="رقم الهوية الوطنية / الإقامة" required>
                      <Input value={data.idNumber} onChange={e => update("idNumber", e.target.value)} placeholder="مثال: 1234567890" />
                    </Field>

                    <Field label="تاريخ الميلاد" required>
                      <div className="grid grid-cols-3 gap-2">
                        <Select value={data.birthDay} onValueChange={v => update("birthDay", v)}>
                          <SelectTrigger><SelectValue placeholder="يوم" /></SelectTrigger>
                          <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={data.birthMonth} onValueChange={v => update("birthMonth", v)}>
                          <SelectTrigger><SelectValue placeholder="شهر" /></SelectTrigger>
                          <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select value={data.birthYear} onValueChange={v => update("birthYear", v)}>
                          <SelectTrigger><SelectValue placeholder="سنة" /></SelectTrigger>
                          <SelectContent>{years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </Field>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="اللقب" required>
                        <Select value={data.title} onValueChange={v => update("title", v)}>
                          <SelectTrigger><SelectValue placeholder="من فضلك إختر اللقب" /></SelectTrigger>
                          <SelectContent>
                            {TITLES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="البريد الإلكتروني" required>
                        <Input dir="ltr" type="email" value={data.email} onChange={e => update("email", e.target.value)} placeholder="example@email.com" />
                      </Field>
                    </div>

                    <Field label="الجنس" required>
                      <RadioGroup
                        value={data.gender}
                        onValueChange={v => update("gender", v)}
                        className="flex gap-4"
                      >
                        <Label className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/40 has-[:checked]:border-primary has-[:checked]:bg-emerald-50">
                          <RadioGroupItem value="male" />
                          ذكر
                        </Label>
                        <Label className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-2 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/40 has-[:checked]:border-primary has-[:checked]:bg-emerald-50">
                          <RadioGroupItem value="female" />
                          أنثى
                        </Label>
                      </RadioGroup>
                    </Field>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <Button onClick={handleNext} className="bg-primary hover:bg-emerald-700 font-bold">
                        التالي
                        <ChevronLeft className="w-4 h-4 mr-2" />
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <h3 className="font-bold text-gray-900 text-lg pb-2 border-b border-gray-100">معلومات إضافية ومهنية</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="رقم الجوال" required>
                        <Input dir="ltr" value={data.phone} onChange={e => update("phone", e.target.value)} placeholder="+966 5XXXXXXXX" />
                      </Field>
                      <Field label="المدينة">
                        <Input value={data.city} onChange={e => update("city", e.target.value)} placeholder="مثال: الرياض" />
                      </Field>
                    </div>

                    <Field label="العنوان الكامل">
                      <Textarea value={data.address} onChange={e => update("address", e.target.value)} rows={2} />
                    </Field>

                    <div className="grid md:grid-cols-2 gap-4">
                      <Field label="المؤهل العلمي">
                        <Select value={data.educationLevel} onValueChange={v => update("educationLevel", v)}>
                          <SelectTrigger><SelectValue placeholder="اختر المؤهل" /></SelectTrigger>
                          <SelectContent>
                            {EDUCATION_LEVELS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field label="الوظيفة المرغوبة">
                        <Select value={data.desiredPosition} onValueChange={v => update("desiredPosition", v)}>
                          <SelectTrigger><SelectValue placeholder="اختر الوظيفة" /></SelectTrigger>
                          <SelectContent>
                            {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </Field>
                    </div>

                    <Field label="الخبرات السابقة">
                      <Textarea value={data.experience} onChange={e => update("experience", e.target.value)} rows={3} placeholder="اذكر خبراتك السابقة..." />
                    </Field>

                    <Field label="ملاحظات إضافية">
                      <Textarea value={data.notes} onChange={e => update("notes", e.target.value)} rows={2} />
                    </Field>

                    <div className="flex justify-between pt-4 border-t border-gray-100 gap-3">
                      <Button variant="outline" onClick={() => setStep(1)} className="bg-white">
                        <ChevronRight className="w-4 h-4 ml-2" />
                        السابق
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={createMutation.isPending}
                        className="bg-primary hover:bg-emerald-700 font-bold"
                      >
                        {createMutation.isPending ? (
                          <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الإرسال...</>
                        ) : (
                          <>إرسال الطلب <CheckCircle2 className="w-4 h-4 mr-2" /></>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </Label>
      {children}
    </div>
  );
}

function StepIndicator({ num, active, done, label }: { num: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
          done ? "bg-emerald-500 text-white" : active ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
        }`}
      >
        {done ? <CheckCircle2 className="w-5 h-5" /> : num}
      </div>
      <span className={`text-sm font-semibold ${active || done ? "text-gray-900" : "text-gray-400"}`}>
        {label}
      </span>
    </div>
  );
}
