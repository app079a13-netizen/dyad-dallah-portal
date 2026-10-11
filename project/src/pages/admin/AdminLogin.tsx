import { useState } from "react";
import { useLocation } from "wouter";
import { Lock, User as UserIcon, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ASSETS } from "@/lib/assets";

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const utils = trpc.useUtils();

  const loginMutation = trpc.adminAuth.login.useMutation({
    onSuccess: async () => {
      toast.success("تم تسجيل الدخول بنجاح");
      await utils.adminAuth.me.invalidate();
      setLocation("/control-panel");
    },
    onError: (error) => {
      toast.error(error.message || "فشل تسجيل الدخول");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    loginMutation.mutate({ username: username.trim(), password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* الشعار والعنوان */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img
              src={ASSETS.dallahLogo}
              alt="مدرسة دلة"
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            لوحة تحكم مدرسة دلة
          </h1>
          <p className="text-sm text-gray-600">
            نظام إدارة طلبات التوظيف
          </p>
        </div>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">تسجيل الدخول</h2>
              <p className="text-xs text-gray-500">دخول آمن للمشرفين فقط</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* اسم المستخدم */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                اسم المستخدم
              </Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="pr-10 h-11"
                  autoComplete="username"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* كلمة المرور */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                كلمة المرور
              </Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="pr-10 pl-10 h-11"
                  autoComplete="current-password"
                  dir="ltr"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* زر تسجيل الدخول */}
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-primary hover:bg-emerald-700 font-bold text-base"
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 ml-2" />
                  دخول لوحة التحكم
                </>
              )}
            </Button>
          </form>

          {/* تنبيه أمني */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              هذه الصفحة مخصصة للمشرفين المعتمدين فقط.
              <br />
              جميع المحاولات يتم تسجيلها لأغراض الحماية.
            </p>
          </div>
        </div>

        {/* العودة للموقع */}
        <div className="text-center mt-6">
          <button
            onClick={() => setLocation("/")}
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            ← العودة إلى الموقع الرئيسي
          </button>
        </div>
      </div>
    </div>
  );
}
