import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";
import { readData, writeData } from "./db";

// ── Types ──
export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: Date | string;
}

export interface Session {
  id?: string;
  token: string;
  adminId: string;
  createdAt: Date | string;
  lastActivity: Date | string;
  expiresAt: Date | string;
}

// ── Constants ──
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const SALT_ROUNDS = 12;

// Standard bcrypt hash for "meruadmin2026!"
export const DEFAULT_ADMIN: AdminUser = {
  id: "64f6d078-2963-431f-bb08-0dfc34d5b5a7",
  username: "admin",
  passwordHash: "$2b$12$LzwaADQevOLp2T2hUbdKB.3N0ByHt4T1SQ6WaxrHrcPJI1UdDJGvq", // meruadmin2026!
  mustChangePassword: false,
  createdAt: new Date().toISOString(),
};

// ── Password Utilities ──
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch (err) {
    console.error("bcrypt verifyPassword error:", err);
    return false;
  }
}

// ── Admin User Management ──
export async function getAdmin(): Promise<AdminUser> {
  // 1. Try Prisma (Supabase Database)
  try {
    let admin = await prisma.adminUser.findFirst();
    if (admin) return admin;

    // Seed admin if missing in Prisma
    const passwordHash = await bcrypt.hash("meruadmin2026!", SALT_ROUNDS);
    admin = await prisma.adminUser.create({
      data: {
        username: "admin",
        passwordHash,
        mustChangePassword: false,
      },
    });
    return admin;
  } catch (err) {
    console.error("Prisma getAdmin error, using JSON fallback:", err);
  }

  // 2. Try Local JSON File
  try {
    const admins = readData<AdminUser[]>("admin.json", []);
    if (admins && admins.length > 0) return admins[0];
  } catch (err) {
    console.error("JSON getAdmin error:", err);
  }

  // 3. Fallback Default
  return DEFAULT_ADMIN;
}

export async function updateAdmin(updates: Partial<AdminUser>): Promise<AdminUser> {
  let updatedAdmin: AdminUser | null = null;
  const current = await getAdmin();

  try {
    updatedAdmin = await prisma.adminUser.update({
      where: { id: current.id },
      data: {
        ...(updates.passwordHash && { passwordHash: updates.passwordHash }),
        ...(updates.mustChangePassword !== undefined && { mustChangePassword: updates.mustChangePassword }),
      },
    });
  } catch (err) {
    console.error("Prisma updateAdmin error:", err);
  }

  try {
    const admins = readData<AdminUser[]>("admin.json", [DEFAULT_ADMIN]);
    const updated = { ...admins[0], ...updates };
    writeData("admin.json", [updated]);
    if (!updatedAdmin) updatedAdmin = updated;
  } catch (err) {
    console.error("JSON updateAdmin error:", err);
  }

  return updatedAdmin || { ...current, ...updates };
}

// ── Session Management ──
export async function createSession(adminId: string): Promise<Session> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const token = uuidv4();

  try {
    await prisma.session.deleteMany({
      where: { expiresAt: { lte: now } },
    });

    const session = await prisma.session.create({
      data: {
        token,
        adminId,
        createdAt: now,
        lastActivity: now,
        expiresAt,
      },
    });

    return session;
  } catch (err) {
    console.error("Prisma createSession error, using JSON fallback:", err);
  }

  const jsonSession: Session = {
    token,
    adminId,
    createdAt: now.toISOString(),
    lastActivity: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  try {
    const sessions = readData<Session[]>("sessions.json", []);
    const activeSessions = sessions.filter(
      (s) => new Date(s.expiresAt).getTime() > now.getTime()
    );
    activeSessions.push(jsonSession);
    writeData("sessions.json", activeSessions);
  } catch (err) {
    console.error("JSON createSession error:", err);
  }

  return jsonSession;
}

export async function validateSession(token: string): Promise<Session | null> {
  if (!token) return null;
  const now = new Date();

  try {
    const session = await prisma.session.findUnique({
      where: { token },
    });

    if (session) {
      if (new Date(session.expiresAt).getTime() <= now.getTime()) {
        await destroySession(token);
        return null;
      }

      const updated = await prisma.session.update({
        where: { token },
        data: {
          lastActivity: now,
          expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
        },
      });

      return updated;
    }
  } catch (err) {
    console.error("Prisma validateSession error, checking JSON fallback:", err);
  }

  try {
    const sessions = readData<Session[]>("sessions.json", []);
    const session = sessions.find((s) => s.token === token);
    if (session) {
      if (new Date(session.expiresAt).getTime() <= now.getTime()) {
        await destroySession(token);
        return null;
      }

      session.lastActivity = now.toISOString();
      session.expiresAt = new Date(now.getTime() + SESSION_DURATION_MS).toISOString();
      const updatedSessions = sessions.map((s) => (s.token === token ? session : s));
      writeData("sessions.json", updatedSessions);
      return session;
    }
  } catch (err) {
    console.error("JSON validateSession error:", err);
  }

  return null;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: { token },
    });
  } catch (err) {
    // ignore
  }

  try {
    const sessions = readData<Session[]>("sessions.json", []);
    const filtered = sessions.filter((s) => s.token !== token);
    writeData("sessions.json", filtered);
  } catch (err) {
    // ignore
  }
}

export async function getSessionFromCookie(cookieHeader: string | null): Promise<Session | null> {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").reduce(
    (acc, cookie) => {
      const [key, val] = cookie.trim().split("=");
      if (key && val) acc[key] = val;
      return acc;
    },
    {} as Record<string, string>
  );
  const token = cookies["admin_session"];
  if (!token) return null;
  return await validateSession(token);
}
