import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/registrations
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    const program = req.query.program as string | undefined;

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (program && program !== "all") {
      where.programName = program;
    }

    const registrations = await prisma.programRegistration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(registrations);
  } catch (error) {
    console.error("Registrations GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/registrations
router.put("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      res.status(400).json({ error: "ID and status are required" });
      return;
    }

    const updated = await prisma.programRegistration.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error("Registration PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/registrations
router.delete("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = (req.query.id as string) || req.body?.id;

    if (!id) {
      res.status(400).json({ error: "Registration ID is required" });
      return;
    }

    await prisma.programRegistration.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Registration DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
