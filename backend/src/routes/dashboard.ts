import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/dashboard
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const [photos, videos, totalPages, totalPrograms, totalInquiries, newInquiries, totalRegistrations, pendingRegistrations] = await Promise.all([
      prisma.mediaItem.count({ where: { type: "image" } }),
      prisma.mediaItem.count({ where: { type: "video" } }),
      prisma.pageContent.count(),
      prisma.program.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "new" } }),
      prisma.programRegistration.count(),
      prisma.programRegistration.count({ where: { status: "pending" } }),
    ]);

    const latestProgram = await prisma.program.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const lastUpdated = latestProgram?.updatedAt?.toISOString() || new Date().toISOString();

    res.json({
      photos,
      videos,
      totalPages,
      totalPrograms,
      totalInquiries,
      newInquiries,
      totalRegistrations,
      pendingRegistrations,
      lastUpdated,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
