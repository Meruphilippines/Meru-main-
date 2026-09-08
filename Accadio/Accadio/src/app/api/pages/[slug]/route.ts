import prisma from "@/lib/prisma";
import { readData } from "@/lib/db";
import { DEFAULT_PAGE_CONTENTS } from "@/lib/defaultPageContents";

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
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check Prisma first
    const dbPage = await prisma.pageContent.findUnique({
      where: { slug },
    });

    if (dbPage && dbPage.status === "published" && dbPage.content) {
      return Response.json({
        id: dbPage.id,
        slug: dbPage.slug,
        title: dbPage.title,
        content: dbPage.content,
        status: dbPage.status,
        lastUpdated: dbPage.lastUpdated.toISOString(),
      });
    }

    // Check pages.json
    const pages = readData<PageData[]>("pages.json", []);
    const jsonPage = pages.find((p) => p.slug === slug);

    if (jsonPage && jsonPage.status === "published" && jsonPage.content) {
      return Response.json(jsonPage);
    }

    // Fallback default content
    const defaultContent = DEFAULT_PAGE_CONTENTS[slug];
    if (defaultContent) {
      return Response.json({
        slug,
        title: slug.charAt(0).toUpperCase() + slug.slice(1),
        content: defaultContent,
        status: "published",
        lastUpdated: new Date().toISOString(),
      });
    }

    return Response.json({ error: "Page not found" }, { status: 404 });
  } catch (error) {
    console.error("Public page GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
