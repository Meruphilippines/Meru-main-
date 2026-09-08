import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const placement = searchParams.get("placement");
    const type = searchParams.get("type");

    const where: any = {};
    if (placement && placement !== "all") {
      where.placement = placement;
    }
    if (type) {
      where.type = type;
    }

    const media = await prisma.mediaItem.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
    });

    const formatted = media.map((m) => ({
      id: m.id,
      filename: m.filename,
      originalName: m.originalName,
      title: m.title || m.originalName,
      caption: m.caption || "",
      tag: m.tag || "Archive",
      year: m.year || new Date(m.uploadedAt).getFullYear().toString(),
      type: m.type,
      size: m.size,
      url: m.url,
      path: m.url,
      placement: m.placement,
      speaker: m.speaker || "",
      duration: m.duration || "3:00",
      uploadedAt: m.uploadedAt.toISOString(),
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Public media GET error:", error);
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
