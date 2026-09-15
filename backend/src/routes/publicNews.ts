import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";

const router = Router();

// GET /api/news
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const formatted = articles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      date: a.date,
      desc: a.desc,
      content: a.content || "",
      gradient: a.gradient,
      imagePath: a.imagePath || "",
    }));

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    });

    res.json(formatted);
  } catch (error) {
    console.error("Public news GET error:", error);
    res.status(500).json({ error: "Failed to load news articles" });
  }
});

export default router;
