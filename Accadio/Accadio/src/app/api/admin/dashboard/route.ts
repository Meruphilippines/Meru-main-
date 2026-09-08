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

    const [photos, videos, totalPages, totalPrograms, totalInquiries, newInquiries, totalRegistrations, pendingRegistrations] = await Promise.all([
      prisma.mediaItem.count({ where: { type: "image" } }),
      prisma.mediaItem.count({ where: { type: "video" } }),
      prisma.pageContent.count(),
      prisma.program.count(),
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: "new" } }),
      prisma.programRegistration.count(),
      prisma.programRegistration.count({ where: { status: "pending" } }),
    ]);

    const latestProgram = await prisma.program.findFirst({
      orderBy: { updatedAt: "desc" },
      select: { updatedAt: true },
    });

    const lastUpdated = latestProgram?.updatedAt?.toISOString() || new Date().toISOString();

    return Response.json({
      photos,
      videos,
      totalPages,
      totalPrograms,
      totalInquiries,
      newInquiries,
      totalRegistrations,
      pendingRegistrations,
      lastUpdated,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
