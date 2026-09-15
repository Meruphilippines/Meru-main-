import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
  Pragma: "no-cache",
};

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const members = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });

    return Response.json(members, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Admin team GET error:", error);
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
    const { name, role, bio, initial, photoPath, gradient } = body;

    if (!name || !role) {
      return Response.json({ error: "Name and role are required" }, { status: 400 });
    }

    const count = await prisma.teamMember.count();

    const member = await prisma.teamMember.create({
      data: {
        name: name.trim(),
        role: role.trim(),
        bio: bio || "",
        initial: initial || name.trim()[0].toUpperCase(),
        photoPath: photoPath || "",
        gradient: gradient || "from-blue-600 to-indigo-700",
        order: count + 1,
      },
    });

    return Response.json(member, { status: 201 });
  } catch (error) {
    console.error("Admin team POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
