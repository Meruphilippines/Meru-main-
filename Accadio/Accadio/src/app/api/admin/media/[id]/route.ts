import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteFile } from "@/lib/storage";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

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
    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.placement !== undefined) updateData.placement = body.placement;
    if (body.tag !== undefined) updateData.tag = body.tag;
    if (body.year !== undefined) updateData.year = body.year;
    if (body.speaker !== undefined) updateData.speaker = body.speaker;
    if (body.duration !== undefined) updateData.duration = body.duration;
    if (body.order !== undefined) updateData.order = parseInt(body.order, 10);

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/", "layout");
    } catch (e) {
      // ignore
    }

    return Response.json(updated);
  } catch (error) {
    console.error("Media PUT error:", error);
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
    const item = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!item) {
      return Response.json({ error: "Media not found" }, { status: 404 });
    }

    // Delete file using storage adapter
    const folder = item.type === "video" ? "videos" : "images";
    if (item.publicId) {
      await deleteFile(item.publicId, item.provider, folder);
    }

    await prisma.mediaItem.delete({
      where: { id },
    });

    try {
      revalidatePath("/", "layout");
    } catch (e) {
      // ignore
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Media DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

