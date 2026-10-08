import DashboardLayout from "@/components/DashboardLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import {
  Search, Eye, Trash2, Loader2, Inbox,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  new: "جديد",
  reviewed: "تمت المراجعة",
  accepted: "مقبول",
  rejected: "مرفوض",
};

const GENDER_LABELS: Record<string, string> = {
  male: "ذكر",
  female: "أنثى",
};

export default function AdminApplications() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <Content />
      </DashboardLayout>
    </AdminGuard>
  );
}

function Content() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: list, isLoading } = trpc.applications.list.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? (statusFilter as any) : undefined,
    gender: genderFilter !== "all" ? (genderFilter as any) : undefined,
    limit: 200,
  });

  const updateStatus = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      utils.applications.list.invalidate();
      utils.applications.stats.invalidate();
      utils.applications.getById.invalidate();
      toast.success("تم تحديث الحالة");
    },
  });

  const deleteApp = trpc.applications.delete.useMutation({
    onSuccess: () => {
      utils.applications.list.invalidate();
      utils.applications.stats.invalidate();
      toast.success("تم حذف الطلب");
      setConfirmDeleteId(null);
    },
  });

  return (
    <div className="space-y-6 p-2">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">طلبات التوظيف</h1>
        <p className="text-sm text-muted-foreground">عرض وإدارة جميع طلبات التوظيف المقدمة</p>
      </div>

      {/* أدوات البحث والتصفية */}
      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="بحث بالاسم، البريد، الهوية..."
              className="pr-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="الحالة" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="new">جديد</SelectItem>
              <SelectItem value="reviewed">تمت المراجعة</SelectItem>
              <SelectItem value="accepted">مقبول</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger><SelectValue placeholder="الجنس" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="male">ذكر</SelectItem>
              <SelectItem value="female">أنثى</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* جدول الطلبات */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : !list || list.length === 0 ? (
          <div className="text-center py-16">
            <Inbox className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">لا توجد طلبات تطابق المعايير المحددة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">#</TableHead>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">الجنسية</TableHead>
                  <TableHead className="text-right">الجنس</TableHead>
                  <TableHead className="text-right">البريد</TableHead>
                  <TableHead className="text-right">الوظيفة</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(app => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-sm">#{app.id}</TableCell>
                    <TableCell className="font-semibold">{app.fullName} {app.familyName}</TableCell>
                    <TableCell className="text-sm">{app.nationality}</TableCell>
                    <TableCell className="text-sm">{GENDER_LABELS[app.gender]}</TableCell>
                    <TableCell className="text-sm" dir="ltr">{app.email}</TableCell>
                    <TableCell className="text-sm">{app.desiredPosition || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={app.status}
                        onValueChange={v => updateStatus.mutate({ id: app.id, status: v as any })}
                      >
                        <SelectTrigger className={`h-8 text-xs font-semibold w-32 ${getStatusClass(app.status)}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">جديد</SelectItem>
                          <SelectItem value="reviewed">تمت المراجعة</SelectItem>
                          <SelectItem value="accepted">مقبول</SelectItem>
                          <SelectItem value="rejected">مرفوض</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString("ar-SA")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm" variant="ghost"
                          onClick={() => setSelectedId(app.id)}
                          className="h-8 w-8 p-0"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          onClick={() => setConfirmDeleteId(app.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* عداد النتائج */}
      {list && list.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          إجمالي {list.length} طلب
        </p>
      )}

      {/* مودال تفاصيل الطلب */}
      <ApplicationDetailsModal
        id={selectedId}
        onClose={() => setSelectedId(null)}
      />

      {/* تأكيد الحذف */}
      <Dialog open={confirmDeleteId !== null} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="bg-white" onClick={() => setConfirmDeleteId(null)}>إلغاء</Button>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && deleteApp.mutate({ id: confirmDeleteId })}
              disabled={deleteApp.isPending}
            >
              {deleteApp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ApplicationDetailsModal({ id, onClose }: { id: number | null; onClose: () => void }) {
  const { data: app, isLoading } = trpc.applications.getById.useQuery(
    { id: id! },
    { enabled: id !== null }
  );

  return (
    <Dialog open={id !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>تفاصيل الطلب</DialogTitle>
        </DialogHeader>

        {isLoading || !app ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
          </div>
        ) : (
          <div className="space-y-4">
            <Section title="المعلومات الشخصية">
              <Row label="الاسم الكامل" value={`${app.fullName} ${app.middleName || ""} ${app.familyName}`} />
              <Row label="الجنسية" value={app.nationality} />
              <Row label="نوع الهوية" value={app.idType} />
              <Row label="رقم الهوية" value={app.idNumber} />
              <Row label="تاريخ الميلاد" value={app.birthDate} />
              <Row label="اللقب" value={app.title} />
              <Row label="الجنس" value={GENDER_LABELS[app.gender]} />
              <Row label="البريد الإلكتروني" value={app.email} dir="ltr" />
            </Section>

            <Section title="معلومات الاتصال والمهنية">
              <Row label="الهاتف" value={app.phone || "-"} dir="ltr" />
              <Row label="المدينة" value={app.city || "-"} />
              <Row label="العنوان" value={app.address || "-"} />
              <Row label="المؤهل العلمي" value={app.educationLevel || "-"} />
              <Row label="الوظيفة المرغوبة" value={app.desiredPosition || "-"} />
              <Row label="الخبرات" value={app.experience || "-"} />
              <Row label="الملاحظات" value={app.notes || "-"} />
            </Section>

            <Section title="معلومات الطلب">
              <Row label="رقم الطلب" value={`#${app.id}`} />
              <Row label="الحالة" value={STATUS_LABELS[app.status]} />
              <Row label="تاريخ التقديم" value={new Date(app.createdAt).toLocaleString("ar-SA")} />
            </Section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-orange-600 mb-2 pb-1 border-b border-orange-100">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value, dir }: { label: string; value: string; dir?: "ltr" | "rtl" }) {
  return (
    <div className="flex justify-between items-start gap-3 py-1.5 text-sm">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className="text-gray-900 font-medium text-right break-words" dir={dir}>{value}</span>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case "new": return "bg-blue-50 text-blue-700 border-blue-200";
    case "reviewed": return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "accepted": return "bg-green-50 text-green-700 border-green-200";
    case "rejected": return "bg-red-50 text-red-700 border-red-200";
    default: return "";
  }
}
