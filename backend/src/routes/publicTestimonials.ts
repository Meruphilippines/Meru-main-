import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/testimonials
router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string | undefined;
    const rating = req.query.rating as string | undefined;
    const q = req.query.q as string | undefined;

    const where: any = {
      isPublished: true,
    };

    if (type && type !== "all") {
      where.type = type;
    }

    if (rating && rating !== "all") {
      const parsedRating = parseInt(rating, 10);
      if (!isNaN(parsedRating)) {
        where.rating = parsedRating;
      }
    }

    if (q) {
      where.OR = [
        { quote: { contains: q } },
        { author: { contains: q } },
        { role: { contains: q } },
        { title: { contains: q } },
        { speaker: { contains: q } },
      ];
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const testimonialVideosFromMedia =
      !type || type === "all" || type === "video"
        ? await prisma.mediaItem.findMany({
            where: {
              type: "video",
              placement: "testimonials",
            },
            orderBy: [{ order: "asc" }, { uploadedAt: "desc" }],
          })
        : [];

    const videos = testimonials
      .filter((t) => t.type === "video")
      .map((t) => ({
        id: t.id,
        title: t.title || "",
        speaker: t.speaker || "",
        details: t.details || "",
        duration: t.duration || "3:00",
        grad: t.gradient,
        videoUrl: t.videoUrl || "",
        thumbnail: t.thumbnail || "",
      }))
      .concat(
        testimonialVideosFromMedia.map((m) => ({
          id: m.id,
          title: m.title || m.originalName.replace(/\.[^/.]+$/, ""),
          speaker: m.speaker || "",
          details: m.caption || "Video Testimonial",
          duration: m.duration || "3:00",
          grad: "from-blue-400 to-indigo-500",
          videoUrl: m.url,
          thumbnail: "",
        }))
      );

    const written = testimonials
      .filter((t) => t.type === "written")
      .map((t) => ({
        id: t.id,
        quote: t.quote || "",
        author: t.author || "Anonymous",
        role: t.role || "",
        rating: t.rating,
        program: t.programTag || "General",
        region: t.region || "Global",
      }));

    res.json({
      all: testimonials,
      videos,
      written,
    });
  } catch (error) {
    console.error("Public testimonials GET error:", error);
    res.status(500).json({ error: "Failed to load testimonials" });
  }
});

export default router;
