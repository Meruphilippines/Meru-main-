import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/inbox
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(inquiries);
  } catch (error) {
    console.error("Inquiries GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/inbox
router.put("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      res.status(400).json({ error: "ID and status are required" });
      return;
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    res.json(updated);
  } catch (error) {
    console.error("Inquiry PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/inbox
router.delete("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = (req.query.id as string) || req.body?.id;

    if (!id) {
      res.status(400).json({ error: "Inquiry ID is required" });
      return;
    }

    await prisma.inquiry.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Inquiry DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
