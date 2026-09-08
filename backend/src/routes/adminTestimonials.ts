import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/testimonials
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = testimonials.map((t) => ({
      id: t.id,
      name: t.author || t.speaker || t.title || "Anonymous",
      author: t.author || t.speaker || "",
      speaker: t.speaker || "",
      title: t.title || "",
      role: t.role || t.details || "",
      quote: t.quote || t.title || "",
      photoPath: t.photoPath || "",
      videoUrl: t.videoUrl || "",
      thumbnail: t.thumbnail || "",
      duration: t.duration || "",
      type: t.type,
      rating: t.rating,
      programTag: t.programTag,
      region: t.region,
      displayOrder: 0,
      createdAt: t.createdAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Testimonials GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/testimonials
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const name = body.name || body.author || body.speaker;
    const quote = body.quote || body.title;

    if (!name || !quote) {
      res.status(400).json({ error: "Name and quote/title are required" });
      return;
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        type: body.type || "written",
        author: name,
        speaker: body.type === "video" ? name : null,
        title: body.type === "video" ? quote : null,
        quote: body.type === "written" ? quote : null,
        role: body.role || "",
        details: body.role || "",
        duration: body.duration || null,
        rating: body.rating ? parseInt(body.rating, 10) : 5,
        programTag: body.programTag || "General",
        region: body.region || "Global",
        gradient: body.gradient || "from-blue-400 to-indigo-500",
        videoUrl: body.videoUrl || null,
        thumbnail: body.thumbnail || null,
        photoPath: body.photoPath || null,
      },
    });

    res.status(201).json({
      id: newTestimonial.id,
      name: newTestimonial.author,
      author: newTestimonial.author,
      role: newTestimonial.role,
      quote: newTestimonial.quote || newTestimonial.title,
      photoPath: newTestimonial.photoPath || "",
      videoUrl: newTestimonial.videoUrl || "",
      thumbnail: newTestimonial.thumbnail || "",
      duration: newTestimonial.duration || "",
      type: newTestimonial.type,
      displayOrder: 0,
      createdAt: newTestimonial.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Testimonials POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/testimonials/:id
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const item = await prisma.testimonial.findUnique({ where: { id } });

    if (!item) {
      res.status(404).json({ error: "Testimonial not found" });
      return;
    }

    res.json({
      id: item.id,
      name: item.author || item.speaker || item.title,
      author: item.author,
      role: item.role || item.details,
      quote: item.quote || item.title,
      photoPath: item.photoPath || "",
      videoUrl: item.videoUrl || "",
      thumbnail: item.thumbnail || "",
      duration: item.duration || "",
      displayOrder: 0,
      type: item.type,
      rating: item.rating,
      createdAt: item.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Testimonial GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/testimonials/:id
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const name = body.name !== undefined ? body.name : body.author;
    const quote = body.quote !== undefined ? body.quote : body.title;

    const updateData: any = {};
    if (name !== undefined) updateData.author = name;
    if (quote !== undefined) updateData.quote = quote;
    if (body.role !== undefined) {
      updateData.role = body.role;
      updateData.details = body.role;
    }
    if (body.type !== undefined) updateData.type = body.type;
    if (body.rating !== undefined) updateData.rating = parseInt(body.rating, 10);
    if (body.programTag !== undefined) updateData.programTag = body.programTag;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.photoPath !== undefined) updateData.photoPath = body.photoPath;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.duration !== undefined) updateData.duration = body.duration;

    if (body.type === "video") {
      if (name !== undefined) updateData.speaker = name;
      if (quote !== undefined) updateData.title = quote;
      updateData.quote = null;
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    res.json({
      id: updated.id,
      name: updated.author || updated.speaker || updated.title || "Anonymous",
      author: updated.author || updated.speaker || "",
      role: updated.role || updated.details || "",
      quote: updated.quote || updated.title || "",
      photoPath: updated.photoPath || "",
      videoUrl: updated.videoUrl || "",
      thumbnail: updated.thumbnail || "",
      duration: updated.duration || "",
      type: updated.type,
      displayOrder: 0,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Testimonial PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/testimonials/:id
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.testimonial.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Testimonial DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
