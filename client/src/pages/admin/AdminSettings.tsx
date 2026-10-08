import DashboardLayout from "@/components/DashboardLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Save, Globe, AlertTriangle, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminSettings() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <Content />
      </DashboardLayout>
    </AdminGuard>
  );
}

function Content() {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.get.useQuery();

  const [redirectEnabled, setRedirectEnabled] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [siteTitle, setSiteTitle] = useState("");
  const [siteDescription, setSiteDescription] = useState("");

  useEffect(() => {
    if (settings) {
      setRedirectEnabled(settings.redirectEnabled ?? false);
      setRedirectUrl(settings.redirectUrl ?? "");
      setSiteTitle(settings.siteTitle ?? "");
      setSiteDescription(settings.siteDescription ?? "");
    }
  }, [settings]);

  const update = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
      utils.settings.getPublic.invalidate();
      toast.success("تم حفظ الإعدادات بنجاح");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSave = () => {
    if (redirectEnabled && redirectUrl) {
      try {
        new URL(redirectUrl);
      } catch {
        toast.error("الرابط المُدخل غير صالح. يجب أن يبدأ بـ https:// أو http://");
        return;
      }
    }
    update.mutate({ redirectEnabled, redirectUrl, siteTitle, siteDescription });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">الإعدادات</h1>
        <p className="text-sm text-muted-foreground">
          تحكم في معلومات الموقع وأداة توجيه الزوار
        </p>
      </div>

      {/* أداة توجيه الزوار */}
      <Card className="p-6 border-orange-200 bg-gradient-to-br from-orange-50/50 to-white">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold text-lg text-gray-900">إعادة توجيه الزوار</h2>
            <p className="text-sm text-muted-foreground">
              تفعيل هذه الميزة سيقوم تلقائياً بإعادة توجيه جميع زوار الموقع إلى الرابط المحدد.
            </p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
            <div>
              <Label className="font-semibold text-gray-900">تفعيل إعادة التوجيه</Label>
              <p className="text-xs text-muted-foreground mt-1">
                عند التفعيل، سيتم تحويل الزائرين فوراً للرابط المحدد أدناه
              </p>
            </div>
            <Switch
              checked={redirectEnabled}
              onCheckedChange={setRedirectEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 text-sm">رابط إعادة التوجيه (URL)</Label>
            <Input
              dir="ltr"
              type="url"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              placeholder="https://example.com/your-target-page"
              disabled={!redirectEnabled}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              يجب أن يبدأ الرابط بـ https:// أو http://
            </p>
          </div>

          {redirectEnabled && redirectUrl && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>تحذير:</strong> إعادة التوجيه نشطة. سيتم تحويل جميع الزوار (باستثناء صفحات لوحة التحكم) إلى:
                <a
                  href={redirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-1 text-amber-900 underline font-mono text-xs break-all"
                  dir="ltr"
                >
                  {redirectUrl} <ExternalLink className="w-3 h-3 inline" />
                </a>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* معلومات الموقع */}
      <Card className="p-6">
        <h2 className="font-extrabold text-lg text-gray-900 mb-1">معلومات الموقع</h2>
        <p className="text-sm text-muted-foreground mb-4">
          تخصيص العنوان والوصف لاستخدامها داخل لوحة الإدارة
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 text-sm">عنوان الموقع</Label>
            <Input
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              placeholder="مدرسة دلة لتعليم القيادة"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 text-sm">وصف الموقع</Label>
            <Textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              rows={3}
              placeholder="وصف مختصر عن الموقع"
            />
          </div>
        </div>
      </Card>

      {/* زر الحفظ */}
      <div className="flex justify-end sticky bottom-4">
        <Button
          onClick={handleSave}
          disabled={update.isPending}
          size="lg"
          className="bg-orange-500 hover:bg-orange-600 font-bold shadow-lg"
        >
          {update.isPending ? (
            <><Loader2 className="w-4 h-4 ml-2 animate-spin" /> جاري الحفظ...</>
          ) : (
            <><Save className="w-4 h-4 ml-2" /> حفظ الإعدادات</>
          )}
        </Button>
      </div>
    </div>
  );
}
