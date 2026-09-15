import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// GET /api/admin/news
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const articles = await prisma.newsArticle.findMany({
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
      isPublished: a.isPublished,
      order: a.order,
      createdAt: a.createdAt.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Admin news GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/news
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const { title, category, date, desc, content, gradient, imagePath, isPublished } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const count = await prisma.newsArticle.count();

    const article = await prisma.newsArticle.create({
      data: {
        title: title.trim(),
        category: category || "General",
        date: date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        desc: desc || "",
        content: content || "",
        gradient: gradient || "from-blue-400 to-indigo-500",
        imagePath: imagePath || "",
        isPublished: isPublished !== undefined ? isPublished : true,
        order: count + 1,
      },
    });

    res.status(201).json({
      id: article.id,
      title: article.title,
      category: article.category,
      date: article.date,
      desc: article.desc,
      content: article.content,
      gradient: article.gradient,
      imagePath: article.imagePath,
      isPublished: article.isPublished,
      order: article.order,
      createdAt: article.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Admin news POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/news/:id
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const article = await prisma.newsArticle.findUnique({ where: { id } });

    if (!article) {
      res.status(404).json({ error: "Article not found" });
      return;
    }

    res.json({
      id: article.id,
      title: article.title,
      category: article.category,
      date: article.date,
      desc: article.desc,
      content: article.content || "",
      gradient: article.gradient,
      imagePath: article.imagePath || "",
      isPublished: article.isPublished,
      order: article.order,
      createdAt: article.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Admin news GET :id error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/news/:id
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.category !== undefined) updateData.category = body.category;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.desc !== undefined) updateData.desc = body.desc;
    if (body.content !== undefined) updateData.content = body.content;
    if (body.gradient !== undefined) updateData.gradient = body.gradient;
    if (body.imagePath !== undefined) updateData.imagePath = body.imagePath;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.order !== undefined) updateData.order = body.order;

    const updated = await prisma.newsArticle.update({
      where: { id },
      data: updateData,
    });

    res.json({
      id: updated.id,
      title: updated.title,
      category: updated.category,
      date: updated.date,
      desc: updated.desc,
      content: updated.content || "",
      gradient: updated.gradient,
      imagePath: updated.imagePath || "",
      isPublished: updated.isPublished,
      order: updated.order,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Admin news PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/news/:id
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.newsArticle.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Admin news DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
