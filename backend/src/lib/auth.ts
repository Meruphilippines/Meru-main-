import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";

// ── Types ──
export interface AdminUser {
  id: string;
  username: string;
  passwordHash: string;
  mustChangePassword: boolean;
  createdAt: Date | string;
}

export interface Session {
  id: string;
  token: string;
  adminId: string;
  createdAt: Date | string;
  lastActivity: Date | string;
  expiresAt: Date | string;
}

// ── Constants ──
const SESSION_DURATION_MS = 30 * 60 * 1000; // 30 minutes
const SALT_ROUNDS = 12;

// ── Password Utilities ──
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ── Admin User ──
export async function getAdmin(): Promise<AdminUser> {
  try {
    let admin = await prisma.adminUser.findFirst();
    if (admin) return admin;

    // If no admin exists, create a seeded admin user so admin routes work
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
    console.error("Prisma getAdmin error:", err);
    // Re-throw so callers can decide how to handle DB connectivity issues
    throw err;
  }
}

export async function updateAdmin(updates: Partial<AdminUser>): Promise<AdminUser> {
  const current = await getAdmin();
  const updated = await prisma.adminUser.update({
    where: { id: current.id },
    data: {
      passwordHash: updates.passwordHash,
      mustChangePassword: updates.mustChangePassword,
    },
  });
  return updated;
}

// ── Session Management ──
export async function createSession(adminId: string): Promise<Session> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);
  const token = uuidv4();

  // Prune expired sessions
  await prisma.session.deleteMany({
    where: {
      expiresAt: { lte: now },
    },
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
}

export async function validateSession(token: string): Promise<Session | null> {
  if (!token) return null;
  const now = new Date();

  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session) return null;

  if (new Date(session.expiresAt).getTime() <= now.getTime()) {
    await destroySession(token);
    return null;
  }

  // Refresh session expiry on activity
  const updated = await prisma.session.update({
    where: { token },
    data: {
      lastActivity: now,
      expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
    },
  });

  return updated;
}

export async function destroySession(token: string): Promise<void> {
  try {
    await prisma.session.deleteMany({
      where: { token },
    });
  } catch (err) {
    console.error("Error destroying session:", err);
  }
}

// ── Auth Middleware Helper ──
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
  return validateSession(token);
}
