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
    const item = await prisma.program.findUnique({
      where: { id },
    });

    if (!item) {
      return Response.json({ error: "Program not found" }, { status: 404 });
    }

    return Response.json({
      id: item.id,
      name: item.title,
      title: item.title,
      description: item.desc,
      desc: item.desc,
      date: item.date || "",
      featuredImagePath: item.featuredImagePath || "",
      videoUrl: item.videoUrl || "",
      category: item.category,
      tag: item.tag,
      createdAt: item.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Program GET error:", error);
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

    const title = body.title !== undefined ? body.title : body.name;
    const desc = body.desc !== undefined ? body.desc : body.description;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (desc !== undefined) updateData.desc = desc;
    if (body.date !== undefined) updateData.date = body.date;
    if (body.featuredImagePath !== undefined) updateData.featuredImagePath = body.featuredImagePath;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.eligibility !== undefined) updateData.eligibility = body.eligibility;
    if (body.benefits !== undefined) {
      updateData.benefits = typeof body.benefits === "string" ? body.benefits : JSON.stringify(body.benefits);
    }
    if (body.gradient !== undefined) updateData.gradient = body.gradient;

    const updated = await prisma.program.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/programs");
    } catch (e) {
      // ignore
    }

    return Response.json({
      id: updated.id,
      name: updated.title,
      title: updated.title,
      description: updated.desc,
      desc: updated.desc,
      date: updated.date,
      featuredImagePath: updated.featuredImagePath,
      videoUrl: updated.videoUrl,
      category: updated.category,
      tag: updated.tag,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Program PUT error:", error);
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
    await prisma.program.delete({
      where: { id },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/programs");
    } catch (e) {
      // ignore
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Program DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

