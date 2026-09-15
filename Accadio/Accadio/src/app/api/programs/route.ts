import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        { title: { contains: q, mode: "insensitive" } },
        { desc: { contains: q, mode: "insensitive" } },
        { tag: { contains: q, mode: "insensitive" } },
      ];
    }

    const programs = await prisma.program.findMany({
      where,
      orderBy: { order: "asc" },
    });

    function safeParseArray(val: string | null | undefined): string[] {
      if (!val) return [];
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        return val ? [val] : [];
      }
    }

    const formatted = programs.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      category: p.category,
      tag: p.tag,
      desc: p.desc,
      eligibility: p.eligibility || "",
      benefits: safeParseArray(p.benefits),
      gradient: p.gradient || "from-blue-400 to-indigo-500",
      iconName: p.iconName || "Compass",
      date: p.date || "",
      featuredImagePath: p.featuredImagePath || "",
      videoUrl: p.videoUrl || "",
    }));

    const noCacheHeaders = {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    };

    return NextResponse.json(formatted, { headers: noCacheHeaders });
  } catch (error) {
    console.error("Public programs GET error:", error);
    return NextResponse.json(
      { error: "Failed to load programs" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
          Pragma: "no-cache",
        },
      }
    );
  }
}
