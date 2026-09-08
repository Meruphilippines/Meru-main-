import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, year, tag, caption, photoPath, videoUrl, gradient, order } = body;

    const existing = await prisma.historySlot.findUnique({
      where: { id },
    });

    if (!existing) {
      return Response.json({ error: "History slot not found" }, { status: 404 });
    }

    const updated = await prisma.historySlot.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(year !== undefined && { year: year.trim() }),
        ...(tag !== undefined && { tag: tag.trim() }),
        ...(caption !== undefined && { caption: caption ? caption.trim() : null }),
        ...(photoPath !== undefined && { photoPath: photoPath ? photoPath.trim() : null }),
        ...(videoUrl !== undefined && { videoUrl: videoUrl ? videoUrl.trim() : null }),
        ...(gradient !== undefined && { gradient: gradient.trim() }),
        ...(order !== undefined && { order: Number(order) }),
      },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Admin History PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.historySlot.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin History DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
