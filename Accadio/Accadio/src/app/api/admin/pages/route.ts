import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import prisma from "@/lib/prisma";
import { DEFAULT_PAGE_CONTENTS } from "@/lib/defaultPageContents";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  lastUpdated: string;
}

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try Prisma first
    try {
      const dbPages = await prisma.pageContent.findMany({
        orderBy: { lastUpdated: "desc" },
      });

      if (dbPages.length > 0) {
        return Response.json(
          dbPages.map((p) => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            content: p.content,
            status: p.status as "draft" | "published",
            lastUpdated: p.lastUpdated.toISOString(),
          }))
        );
      }
    } catch (dbErr) {
      console.error("Prisma pages GET error:", dbErr);
    }

    // Fallback: JSON file store
    let pages = readData<PageData[]>("pages.json", []);
    let modified = false;

    // If pages.json is empty: populate default pages
    if (!pages || pages.length === 0) {
      const defaultPages: PageData[] = [
        { id: uuidv4(), slug: "home", title: "Home", content: DEFAULT_PAGE_CONTENTS.home, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "about", title: "About Us", content: DEFAULT_PAGE_CONTENTS.about, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "history", title: "History", content: DEFAULT_PAGE_CONTENTS.history, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "programs", title: "Programs", content: DEFAULT_PAGE_CONTENTS.programs, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "testimonials", title: "Testimonials", content: DEFAULT_PAGE_CONTENTS.testimonials, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "news", title: "News & Events", content: DEFAULT_PAGE_CONTENTS.news, status: "published", lastUpdated: new Date().toISOString() },
        { id: uuidv4(), slug: "contact", title: "Contact", content: DEFAULT_PAGE_CONTENTS.contact, status: "published", lastUpdated: new Date().toISOString() },
      ];
      writeData("pages.json", defaultPages);
      return Response.json(defaultPages);
    }

    // Ensure news page exists in pages.json if it was created previously without it
    if (!pages.some((p) => p.slug === "news")) {
      pages.push({
        id: uuidv4(),
        slug: "news",
        title: "News & Events",
        content: DEFAULT_PAGE_CONTENTS.news,
        status: "published",
        lastUpdated: new Date().toISOString(),
      });
      modified = true;
    }

    // Ensure all existing pages have content populated if currently empty
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

    return Response.json(pages);
  } catch (error) {
    console.error("Pages GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, status } = body;

    if (!title || !slug) {
      return Response.json({ error: "Title and slug are required" }, { status: 400 });
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

    try {
      revalidatePath("/", "layout");
      revalidatePath(`/${slug}`);
    } catch (e) {
      // ignore
    }

    return Response.json(newPage, { status: 201 });
  } catch (error) {
    console.error("Pages POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

