import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const article = await prisma.newsArticle.findUnique({ where: { id } });

    if (!article) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({
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
    console.error("Admin news GET [id] error:", error);
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
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
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

    try {
      revalidatePath("/news");
      revalidatePath("/", "layout");
    } catch {
      // ignore
    }

    return Response.json({
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
    console.error("Admin news PUT [id] error:", error);
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
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.newsArticle.delete({ where: { id } });

    try {
      revalidatePath("/news");
      revalidatePath("/", "layout");
    } catch {
      // ignore
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin news DELETE [id] error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
