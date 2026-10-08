import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User, AdminAccount } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getAdminSessionByToken, getAdminById } from "../db";

export const ADMIN_COOKIE_NAME = "admin_session";

export type AdminUser = Pick<AdminAccount, "id" | "username" | "displayName" | "isActive">;

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  admin: AdminUser | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;
  let admin: AdminUser | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }

  // قراءة جلسة المسؤول من الكوكي
  try {
    const cookieHeader = opts.req.headers.cookie || "";
    const match = cookieHeader.match(new RegExp(`(?:^|; )${ADMIN_COOKIE_NAME}=([^;]+)`));
    const token = match?.[1];
    if (token) {
      const session = await getAdminSessionByToken(token);
      if (session && session.expiresAt > new Date()) {
        const adminAccount = await getAdminById(session.adminId);
        if (adminAccount && adminAccount.isActive) {
          admin = {
            id: adminAccount.id,
            username: adminAccount.username,
            displayName: adminAccount.displayName,
            isActive: adminAccount.isActive,
          };
        }
      }
    }
  } catch (error) {
    admin = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    admin,
  };
}
