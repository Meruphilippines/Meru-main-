import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { DEFAULT_PAGE_CONTENTS } from "../lib/defaultPageContents";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const SLUGS = ["home", "about", "history", "programs", "testimonials", "contact", "news"];

// GET /api/admin/pages
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const dbPages = await prisma.pageContent.findMany({
      orderBy: { slug: "asc" },
    });

    // Ensure all standard slugs exist in DB
    const existingSlugs = new Set(dbPages.map((p) => p.slug));
    for (const slug of SLUGS) {
      if (!existingSlugs.has(slug)) {
        const defaultContent = DEFAULT_PAGE_CONTENTS[slug] || "";
        const title = slug.charAt(0).toUpperCase() + slug.slice(1);
        const created = await prisma.pageContent.create({
          data: {
            slug,
            title,
            content: defaultContent,
            status: "published",
          },
        });
        dbPages.push(created);
      }
    }

    const formatted = dbPages.map((page) => ({
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content || DEFAULT_PAGE_CONTENTS[page.slug] || "",
      status: page.status,
      lastUpdated: page.lastUpdated.toISOString(),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Admin Pages GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/pages/:id
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    let page = await prisma.pageContent.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!page) {
      // Check if it's one of standard slugs
      if (SLUGS.includes(id)) {
        const defaultContent = DEFAULT_PAGE_CONTENTS[id] || "";
        page = await prisma.pageContent.create({
          data: {
            slug: id,
            title: id.charAt(0).toUpperCase() + id.slice(1),
            content: defaultContent,
            status: "published",
          },
        });
      }
    }

    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.json({
      id: page.id,
      slug: page.slug,
      title: page.title,
      content: page.content || DEFAULT_PAGE_CONTENTS[page.slug] || "",
      status: page.status,
      lastUpdated: page.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Page GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PUT /api/admin/pages/:id
router.put("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const existing = await prisma.pageContent.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    const slug = body.slug || existing?.slug || id;
    const title = body.title !== undefined ? body.title : (existing?.title || slug.charAt(0).toUpperCase() + slug.slice(1));
    const content = body.content !== undefined ? body.content : (existing?.content || "");
    const status = body.status || existing?.status || "published";

    const updated = await prisma.pageContent.upsert({
      where: { slug },
      update: {
        title,
        content,
        status,
        lastUpdated: new Date(),
      },
      create: {
        slug,
        title,
        content,
        status,
        lastUpdated: new Date(),
      },
    });

    res.json({
      id: updated.id,
      slug: updated.slug,
      title: updated.title,
      content: updated.content,
      status: updated.status,
      lastUpdated: updated.lastUpdated.toISOString(),
    });
  } catch (error) {
    console.error("Page PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
