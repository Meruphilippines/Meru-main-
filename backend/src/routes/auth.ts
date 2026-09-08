import { Router, Request, Response } from "express";
import { getAdmin, verifyPassword, createSession, destroySession, validateSession, hashPassword, updateAdmin } from "../lib/auth";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// POST /api/admin/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password are required" });
      return;
    }

    const admin = await getAdmin();

    if (admin.username !== username) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const session = await createSession(admin.id);

    res.cookie("admin_session", session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60 * 1000, // 30 minutes
    });

    res.json({
      success: true,
      mustChangePassword: admin.mustChangePassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/auth/logout
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.admin_session;
    if (token) {
      await destroySession(token);
    }
    res.clearCookie("admin_session", { path: "/" });
    res.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/auth/session
router.get("/session", async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.admin_session;
    if (!token) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const session = await validateSession(token);
    if (!session) {
      res.status(401).json({ authenticated: false });
      return;
    }

    const admin = await getAdmin();

    res.json({
      authenticated: true,
      username: admin.username,
      mustChangePassword: admin.mustChangePassword,
    });
  } catch (error) {
    console.error("Session check error:", error);
    res.status(401).json({ authenticated: false });
  }
});

// POST /api/admin/auth/change-password
router.post("/change-password", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "Both current and new password are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: "New password must be at least 8 characters" });
      return;
    }

    const admin = await getAdmin();
    const valid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const newHash = await hashPassword(newPassword);
    await updateAdmin({
      passwordHash: newHash,
      mustChangePassword: false,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
