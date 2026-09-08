import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/history
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const slots = await prisma.historySlot.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });
    res.json(slots);
  } catch (error) {
    console.error("Admin History GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/history
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, year, tag, caption, photoPath, videoUrl, gradient, order } = req.body;

    if (!title || !year) {
      res.status(400).json({ error: "Title and year are required" });
      return;
    }

    const count = await prisma.historySlot.count();

    const newSlot = await prisma.historySlot.create({
      data: {
        title: title.trim(),
        year: year.trim(),
        tag: tag?.trim() || "Event",
        caption: caption?.trim() || null,
        photoPath: photoPath?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        gradient: gradient?.trim() || "from-blue-400 to-indigo-500",
        order: typeof order === "number" ? order : count,
      },
    });

    res.status(201).json(newSlot);
  } catch (error) {
    console.error("Admin History POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/history/:id
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, year, tag, caption, photoPath, videoUrl, gradient, order } = req.body;

    const existing = await prisma.historySlot.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "History slot not found" });
      return;
    }

    const updated = await prisma.historySlot.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(year !== undefined && { year: year.trim() }),
        ...(tag !== undefined && { tag: tag.trim() }),
        ...(caption !== undefined && { caption: caption ? caption.trim() : null }),
        ...(photoPath !== undefined && { photoPath: photoPath ? photoPath.trim() : null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl ? videoUrl.trim() : null }),
        ...(gradient !== undefined && { gradient: gradient.trim() }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("Admin History PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/history/:id
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.historySlot.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin History DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
