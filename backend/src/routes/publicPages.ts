import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { readData } from "../lib/db";
import { DEFAULT_PAGE_CONTENTS } from "../lib/defaultPageContents";

const router = Router();

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  lastUpdated: string;
}

// GET /api/pages/:slug
router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = req.params.slug as string;

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

    const pages = readData<PageData[]>("pages.json", []);
    const jsonPage = pages.find((p) => p.slug === slug);

    if (jsonPage && jsonPage.status === "published" && jsonPage.content) {
      res.json(jsonPage);
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
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
