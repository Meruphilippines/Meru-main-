import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const slots = await prisma.historySlot.findMany({
      orderBy: [{ order: "asc" }, { year: "desc" }],
    });

    if (slots.length === 0) {
      try {
        const seed = await prisma.historySlot.create({
          data: {
            title: "Founding Event",
            year: new Date().getFullYear().toString(),
            tag: "Event",
            caption: "Inaugural event",
            photoPath: "",
            videoUrl: "",
            gradient: "from-blue-400 to-indigo-500",
            order: 0,
          },
        });
        return Response.json([seed]);
      } catch (err) {
        console.error("Prisma seed history error:", err);
      }
    }

    return Response.json(slots);
  } catch (error) {
    console.error("Admin History GET error:", error);
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
    const { title, year, tag, caption, photoPath, videoUrl, gradient, order } = body;

    if (!title || !year) {
      return Response.json({ error: "Title and year are required" }, { status: 400 });
    }

    const count = await prisma.historySlot.count();

    const newSlot = await prisma.historySlot.create({
      data: {
        title: title.trim(),
        year: year.trim(),
        tag: tag?.trim() || "Event",
        caption: caption?.trim() || null,
        photoPath: photoPath?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        gradient: gradient?.trim() || "from-blue-400 to-indigo-500",
        order: typeof order === "number" ? order : count,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/history");
    } catch (e) {
      // ignore
    }

    return Response.json(newSlot, { status: 201 });
  } catch (error) {
    console.error("Admin History POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
