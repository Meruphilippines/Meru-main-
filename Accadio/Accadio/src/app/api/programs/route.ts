import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get("cat");
    const q = searchParams.get("q");

    const where: any = {
      isPublished: true,
    };

    if (cat && cat !== "all") {
      where.category = cat;
    }

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { desc: { contains: q } },
        { tag: { contains: q } },
      ];
    }

    const programs = await prisma.program.findMany({
      where,
      orderBy: { order: "asc" },
    });

    const formatted = programs.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      tag: p.tag,
      desc: p.desc,
      eligibility: p.eligibility || "",
      benefits: p.benefits ? JSON.parse(p.benefits) : [],
      gradient: p.gradient,
      iconName: p.iconName,
      date: p.date,
      featuredImagePath: p.featuredImagePath,
      videoUrl: p.videoUrl || "",
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Public programs GET error:", error);
    return NextResponse.json({ error: "Failed to load programs" }, { status: 500 });
  }
}
