import { Router, Response } from "express";
import path from "path";
import prisma from "../lib/prisma";
import { uploadFile, deleteFile } from "../lib/storage";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// GET /api/admin/media
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const media = await prisma.mediaItem.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    const formatted = media.map((m) => ({
      id: m.id,
      filename: m.filename,
      originalName: m.originalName,
      title: m.title,
      caption: m.caption,
      type: m.type,
      size: m.size,
      path: m.url,
      url: m.url,
      provider: m.provider,
      placement: m.placement,
      tag: m.tag,
      year: m.year,
      speaker: m.speaker,
      duration: m.duration,
      order: m.order,
      uploadedAt: m.uploadedAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Media GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/media
router.post(
  "/",
  requireAuth,
  upload.array("files"),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      const placement = (req.body.placement as string | undefined) || "general";
      const title = req.body.title as string | undefined;
      const caption = req.body.caption as string | undefined;
      const tag = req.body.tag as string | undefined;
      const year = req.body.year as string | undefined;
      const speaker = req.body.speaker as string | undefined;
      const duration = req.body.duration as string | undefined;

      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files provided" });
        return;
      }

      const uploaded = [];

      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
        const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);

        if (!isVideo && !isImage) {
          continue;
        }

        const type = isVideo ? "video" : "image";
        const folder = isVideo ? "videos" : "images";

        const uploadResult = await uploadFile(file.buffer, file.originalname, file.mimetype, folder);

        const dbItem = await prisma.mediaItem.create({
          data: {
            filename: uploadResult.filename,
            originalName: file.originalname,
            type,
            size: uploadResult.size,
            url: uploadResult.url,
            publicId: uploadResult.publicId,
            provider: uploadResult.provider,
            placement,
            title: title || null,
            caption: caption || null,
            tag: tag || null,
            year: year || null,
            speaker: speaker || null,
            duration: duration || null,
          },
        });

        uploaded.push({
          id: dbItem.id,
          filename: dbItem.filename,
          originalName: dbItem.originalName,
          type: dbItem.type,
          size: dbItem.size,
          path: dbItem.url,
          url: dbItem.url,
          provider: dbItem.provider,
          placement: dbItem.placement,
          title: dbItem.title,
          caption: dbItem.caption,
          tag: dbItem.tag,
          year: dbItem.year,
          speaker: dbItem.speaker,
          duration: dbItem.duration,
          uploadedAt: dbItem.uploadedAt.toISOString(),
        });
      }

      res.status(201).json({ uploaded, total: uploaded.length });
    } catch (error) {
      console.error("Media POST error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// PUT /api/admin/media/:id
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.placement !== undefined) updateData.placement = body.placement;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.speaker !== undefined) updateData.speaker = body.speaker;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.order !== undefined) updateData.order = parseInt(body.order, 10);

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: updateData,
    });

    res.json(updated);
  } catch (error) {
    console.error("Media PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/media/:id
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await prisma.mediaItem.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: "Media not found" });
      return;
    }

    const folder = item.type === "video" ? "videos" : "images";
    if (item.publicId) {
      await deleteFile(item.publicId, item.provider, folder);
    }

    await prisma.mediaItem.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    console.error("Media DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
