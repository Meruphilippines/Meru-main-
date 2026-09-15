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

    const programs = await prisma.program.findMany({
      orderBy: { order: "asc" },
    });

    if (programs.length === 0) {
      try {
        const seed = await prisma.program.create({
          data: {
            title: "Sample Program",
            slug: "sample-program",
            category: "exchange",
            tag: "Exchange",
            desc: "Sample program description.",
            eligibility: "Open to all",
            benefits: JSON.stringify(["Experience", "Credits"]),
            gradient: "from-blue-400 to-indigo-500",
            iconName: "Compass",
            isPublished: true,
            order: 0,
          },
        });
        programs.push(seed);
      } catch (err) {
        console.error("Prisma seed program error:", err);
      }
    }

    // Provide both name and title, description and desc for full compatibility
    const formatted = programs.map((p) => ({
      id: p.id,
      name: p.title,
      title: p.title,
      description: p.desc,
      desc: p.desc,
      date: p.date || "",
      featuredImagePath: p.featuredImagePath || "",
      videoUrl: p.videoUrl || "",
      category: p.category,
      tag: p.tag,
      createdAt: p.createdAt.toISOString(),
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("Programs GET error:", error);
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
    const title = body.title || body.name;
    const desc = body.desc || body.description || "";
    const { date, featuredImagePath, videoUrl, category, tag, eligibility, benefits, gradient } = body;

    if (!title) {
      return Response.json({ error: "Program name is required" }, { status: 400 });
    }

    const count = await prisma.program.count();

    const newProgram = await prisma.program.create({
      data: {
        title,
        desc,
        category: category || "general",
        tag: tag || "Program",
        date: date || "",
        featuredImagePath: featuredImagePath || "",
        videoUrl: videoUrl || "",
        eligibility: eligibility || null,
        benefits: benefits ? (typeof benefits === "string" ? benefits : JSON.stringify(benefits)) : null,
        gradient: gradient || "from-blue-400 to-indigo-500",
        order: count + 1,
      },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/programs");
    } catch (e) {
      // ignore
    }

    return Response.json(
      {
        id: newProgram.id,
        name: newProgram.title,
        title: newProgram.title,
        description: newProgram.desc,
        desc: newProgram.desc,
        date: newProgram.date,
        featuredImagePath: newProgram.featuredImagePath,
        videoUrl: newProgram.videoUrl,
        category: newProgram.category,
        tag: newProgram.tag,
        createdAt: newProgram.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Programs POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
