import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/media
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const placement = req.query.placement as string | undefined;
    const type = req.query.type as string | undefined;

    const where: any = {};
    if (placement && placement !== "all") {
      where.placement = placement;
    }
    if (type) {
      where.type = type;
    }

    const media = await prisma.mediaItem.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
    });

    const formatted = media.map((m) => ({
      id: m.id,
      filename: m.filename,
      originalName: m.originalName,
      title: m.title || m.originalName,
      caption: m.caption || "",
      tag: m.tag || "Archive",
      year: m.year || new Date(m.uploadedAt).getFullYear().toString(),
      type: m.type,
      size: m.size,
      url: m.url,
      path: m.url,
      placement: m.placement,
      speaker: m.speaker || "",
      duration: m.duration || "3:00",
      uploadedAt: m.uploadedAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Public media GET error:", error);
    res.status(500).json({ error: "Failed to load media" });
  }
});

export default router;
