import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const articles = await prisma.newsArticle.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return Response.json(
      articles.map((a) => ({
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
      })),
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("Admin news GET error:", error);
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
    const { title, category, date, desc, content, gradient, imagePath } = body;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    const count = await prisma.newsArticle.count();

    const article = await prisma.newsArticle.create({
      data: {
        title,
        category: category || "General",
        date: date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
        desc: desc || "",
        content: content || "",
        gradient: gradient || "from-blue-400 to-indigo-500",
        imagePath: imagePath || "",
        isPublished: body.isPublished !== undefined ? body.isPublished : true,
        order: count + 1,
      },
    });

    try {
      revalidatePath("/news");
      revalidatePath("/", "layout");
    } catch {
      // ignore
    }

    return Response.json(
      {
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
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin news POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
