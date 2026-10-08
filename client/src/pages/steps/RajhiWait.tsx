import { useEffect, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

export default function RajhiWait() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const messages = [
    "جاري الاتصال ببوابة الدفع...",
    "التحقق من بيانات الحساب المصرفي...",
    "انتظار تأكيد العملية من البنك...",
    "جاري معالجة الطلب، يرجى الانتظار...",
  ];
  const currentMsg = messages[Math.min(Math.floor(elapsed / 5), messages.length - 1)];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header - Rajhi Blue */}
        <div className="bg-[#0033A0] p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')]"></div>
          <ShieldCheck className="w-16 h-16 text-white mx-auto mb-4 relative z-10" />
          <h1 className="text-2xl font-bold text-white relative z-10">
            بوابة الدفع الآمن
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center space-y-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-white p-4 rounded-full shadow-md border-2 border-[#0033A0]">
              <Loader2 className="w-12 h-12 text-[#0033A0] animate-spin" />
            </div>
          </div>
          
          <div className="space-y-3 text-center">
            <h2 className="text-xl font-bold text-gray-900">
              جاري المعالجة...
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed">
              {currentMsg}
            </p>
          </div>

          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-[#0033A0] h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min((elapsed / 20) * 100, 95)}%` }}
            ></div>
          </div>
          
          <p className="text-sm text-gray-400">
            يرجى عدم إغلاق أو تحديث هذه الصفحة
          </p>
        </div>
      </div>
    </div>
  );
}
