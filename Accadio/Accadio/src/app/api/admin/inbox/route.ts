import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
    });

    return Response.json(inquiries);
  } catch (error) {
    console.error("Inquiries GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return Response.json({ error: "ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Inquiry PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Inquiry ID is required" }, { status: 400 });
    }

    await prisma.inquiry.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Inquiry DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
