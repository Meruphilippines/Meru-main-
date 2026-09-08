import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET(request: Request) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const program = searchParams.get("program");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (program && program !== "all") {
      where.programName = program;
    }

    const registrations = await prisma.programRegistration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return Response.json(registrations);
  } catch (error) {
    console.error("Registrations GET error:", error);
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

    const updated = await prisma.programRegistration.update({
      where: { id },
      data: { status },
    });

    return Response.json(updated);
  } catch (error) {
    console.error("Registration PUT error:", error);
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
      return Response.json({ error: "Registration ID is required" }, { status: 400 });
    }

    await prisma.programRegistration.delete({
      where: { id },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Registration DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
