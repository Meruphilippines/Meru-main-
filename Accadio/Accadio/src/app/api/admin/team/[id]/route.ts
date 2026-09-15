import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.role !== undefined) updateData.role = body.role.trim();
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.initial !== undefined) updateData.initial = body.initial;
    if (body.photoPath !== undefined) updateData.photoPath = body.photoPath;
    if (body.gradient !== undefined) updateData.gradient = body.gradient;
    if (body.order !== undefined) updateData.order = body.order;

    const updated = await prisma.teamMember.update({
      where: { id },
      data: updateData,
    });

    return Response.json(updated, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Admin team PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin team DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
