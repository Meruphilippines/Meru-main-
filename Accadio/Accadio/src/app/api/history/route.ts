import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const slots = await prisma.historySlot.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });

    return Response.json(slots);
  } catch (error) {
    console.error("Public History GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
