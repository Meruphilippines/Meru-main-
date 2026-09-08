import { getSessionFromCookie } from "@/lib/auth";
import { readData, writeData } from "@/lib/db";
import prisma from "@/lib/prisma";
import { DEFAULT_PAGE_CONTENTS } from "@/lib/defaultPageContents";
import { headers } from "next/headers";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  status: "draft" | "published";
  lastUpdated: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pages = readData<PageData[]>("pages.json", []);
    let page = pages.find((p) => p.id === id || p.slug === id);

    if (!page) {
      // Try searching prisma as fallback
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
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    // Ensure content is not empty
    if (!page.content || page.content.trim() === "") {
      page.content = DEFAULT_PAGE_CONTENTS[page.slug] || "";
      // Persist the populated content
      const index = pages.findIndex((p) => p.id === page!.id);
      if (index !== -1) {
        pages[index] = { ...pages[index], content: page.content };
        writeData("pages.json", pages);
      }
    }

    return Response.json(page);
  } catch (error) {
    console.error("Page GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const pages = readData<PageData[]>("pages.json", []);
    const index = pages.findIndex((p) => p.id === id || p.slug === id);

    let updatedPage: PageData;

    if (index === -1) {
      // Check Prisma
      const dbPage = await prisma.pageContent.findFirst({
        where: { OR: [{ id }, { slug: id }] },
      });
      if (!dbPage) {
        return Response.json({ error: "Page not found" }, { status: 404 });
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

    // Sync with Prisma
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

    return Response.json(updatedPage);
  } catch (error) {
    console.error("Page PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const pages = readData<PageData[]>("pages.json", []);
    const filtered = pages.filter((p) => p.id !== id && p.slug !== id);

    if (filtered.length === pages.length) {
      return Response.json({ error: "Page not found" }, { status: 404 });
    }

    writeData("pages.json", filtered);

    try {
      await prisma.pageContent.deleteMany({
        where: { OR: [{ id }, { slug: id }] },
      });
    } catch (dbErr) {
      console.error("Prisma page delete error:", dbErr);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Page DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
