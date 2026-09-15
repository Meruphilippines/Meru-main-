import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const defaultLeaders = [
  {
    id: "default-1",
    name: "Dr. Abel Mathew",
    role: "Founder & Chief Executive Officer",
    bio: "Visionary leader dedicated to reaching unreached people groups worldwide through training programs, conferences, and strategic partnerships.",
    initial: "A",
    gradient: "from-blue-600 to-indigo-700",
    photoPath: "",
  },
];

export async function GET() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });

    if (members.length === 0) {
      return Response.json(defaultLeaders, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      });
    }

    return Response.json(members, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Public team GET error:", error);
    return Response.json(defaultLeaders, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
      },
    });
  }
}
