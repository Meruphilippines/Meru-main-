import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { DEFAULT_PAGE_CONTENTS } from "../lib/defaultPageContents";

const router = Router();

// GET /api/pages/:slug
router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    });

    const dbPage = await prisma.pageContent.findUnique({
      where: { slug },
    });

    if (dbPage && dbPage.status === "published" && dbPage.content) {
      res.json({
        id: dbPage.id,
        slug: dbPage.slug,
        title: dbPage.title,
        content: dbPage.content,
        status: dbPage.status,
        lastUpdated: dbPage.lastUpdated.toISOString(),
      });
      return;
    }

    const defaultContent = DEFAULT_PAGE_CONTENTS[slug];
    if (defaultContent) {
      res.json({
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        content: defaultContent,
        status: "published",
        lastUpdated: new Date().toISOString(),
      });
      return;
    }

    res.status(404).json({ error: "Page not found" });
  } catch (error) {
    console.error("Public page GET error:", error);
    res.status(500).json({ error: "Failed to load page content" });
  }
});

export default router;
