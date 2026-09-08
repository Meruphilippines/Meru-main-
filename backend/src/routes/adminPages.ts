import { Router, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { readData, writeData } from "../lib/db";
import prisma from "../lib/prisma";
import { DEFAULT_PAGE_CONTENTS } from "../lib/defaultPageContents";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  lastUpdated: string;
}

// GET /api/admin/pages
router.get("/", requireAuth, async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    let pages = readData<PageData[]>("pages.json", []);
    let modified = false;

    if (!pages || pages.length === 0) {
      const defaultPages: PageData[] = [
        { id: uuidv4(), slug: "home", title: "Home", content: DEFAULT_PAGE_CONTENTS.home, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "about", title: "About Us", content: DEFAULT_PAGE_CONTENTS.about, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "history", title: "History", content: DEFAULT_PAGE_CONTENTS.history, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "programs", title: "Programs", content: DEFAULT_PAGE_CONTENTS.programs, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "testimonials", title: "Testimonials", content: DEFAULT_PAGE_CONTENTS.testimonials, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "contact", title: "Contact", content: DEFAULT_PAGE_CONTENTS.contact, status: "published", lastUpdated: new Date().toISOString() },
      ];
      writeData("pages.json", defaultPages);
      res.json(defaultPages);
      return;
    }

    pages = pages.map((page) => {
      if (!page.content || page.content.trim() === "") {
        const defaultContent = DEFAULT_PAGE_CONTENTS[page.slug];
        if (defaultContent) {
          modified = true;
          return { ...page, content: defaultContent };
        }
      }
      return page;
    });

    if (modified) {
      writeData("pages.json", pages);
    }

    res.json(pages);
  } catch (error) {
    console.error("Pages GET error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/admin/pages
router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, content, status } = req.body;

    if (!title || !slug) {
      res.status(400).json({ error: "Title and slug are required" });
      return;
    }

    const pages = readData<PageData[]>("pages.json", []);
    const newPage: PageData = {
      id: uuidv4(),
      slug,
      title,
      content: content || DEFAULT_PAGE_CONTENTS[slug] || "",
      status: status || "draft",
      lastUpdated: new Date().toISOString(),
    };

    pages.push(newPage);
    writeData("pages.json", pages);

    try {
      await prisma.pageContent.upsert({
        where: { slug },
        update: {
          title,
          content: newPage.content,
          status: newPage.status,
          lastUpdated: new Date(),
        },
        create: {
          slug,
          title,
          content: newPage.content,
          status: newPage.status,
        },
      });
    } catch (dbErr) {
      console.error("Prisma page sync error on create:", dbErr);
    }

    res.status(201).json(newPage);
  } catch (error) {
    console.error("Pages POST error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/admin/pages/:id
router.get("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pages = readData<PageData[]>("pages.json", []);
    let page = pages.find((p) => p.id === id || p.slug === id);

    if (!page) {
      const dbPage = await prisma.pageContent.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (dbPage) {
        page = {
          id: dbPage.id,
          slug: dbPage.slug,
          title: dbPage.title,
          content: dbPage.content || DEFAULT_PAGE_CONTENTS[dbPage.slug] || "",
          status: dbPage.status as "draft" | "published",
          lastUpdated: dbPage.lastUpdated.toISOString(),
        };
      }
    }

    if (!page) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    if (!page.content || page.content.trim() === "") {
      page.content = DEFAULT_PAGE_CONTENTS[page.slug] || "";
      const index = pages.findIndex((p) => p.id === page!.id);
      if (index !== -1) {
        pages[index] = { ...pages[index], content: page.content };
        writeData("pages.json", pages);
      }
    }

    res.json(page);
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
    const pages = readData<PageData[]>("pages.json", []);
    const index = pages.findIndex((p) => p.id === id || p.slug === id);

    let updatedPage: PageData;

    if (index === -1) {
      const dbPage = await prisma.pageContent.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (!dbPage) {
        res.status(404).json({ error: "Page not found" });
        return;
      }
      updatedPage = {
        id: dbPage.id,
        slug: body.slug || dbPage.slug,
        title: body.title !== undefined ? body.title : dbPage.title,
        content: body.content !== undefined ? body.content : dbPage.content,
        status: body.status || (dbPage.status as "draft" | "published"),
        lastUpdated: new Date().toISOString(),
      };
      pages.push(updatedPage);
    } else {
      pages[index] = {
        ...pages[index],
        ...body,
        id: pages[index].id,
        lastUpdated: new Date().toISOString(),
      };
      updatedPage = pages[index];
    }

    writeData("pages.json", pages);

    try {
      await prisma.pageContent.upsert({
        where: { slug: updatedPage.slug },
        update: {
          title: updatedPage.title,
          content: updatedPage.content,
          status: updatedPage.status,
          lastUpdated: new Date(),
        },
        create: {
          slug: updatedPage.slug,
          title: updatedPage.title,
          content: updatedPage.content,
          status: updatedPage.status,
        },
      });
    } catch (dbErr) {
      console.error("Prisma page sync error on PUT:", dbErr);
    }

    res.json(updatedPage);
  } catch (error) {
    console.error("Page PUT error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/admin/pages/:id
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const pages = readData<PageData[]>("pages.json", []);
    const filtered = pages.filter((p) => p.id !== id && p.slug !== id);

    if (filtered.length === pages.length) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    writeData("pages.json", filtered);

    try {
      await prisma.pageContent.deleteMany({
        where: { OR: [{ id }, { slug: id }] },
      });
    } catch (dbErr) {
      console.error("Prisma page delete error:", dbErr);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Page DELETE error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
