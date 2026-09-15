import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "video" | "written" | "all"
    const rating = searchParams.get("rating"); // number or "all"
    const q = searchParams.get("q");

    const where: any = {
      isPublished: true,
    };

    if (type && type !== "all") {
      where.type = type;
    }

    if (rating && rating !== "all") {
      const parsedRating = parseInt(rating, 10);
      if (!isNaN(parsedRating)) {
        where.rating = parsedRating;
      }
    }

    if (q) {
      where.OR = [
        { quote: { contains: q } },
        { author: { contains: q } },
        { role: { contains: q } },
        { title: { contains: q } },
        { speaker: { contains: q } },
      ];
    }

    const testimonials = await prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const testimonialVideosFromMedia =
      !type || type === "all" || type === "video"
        ? await prisma.mediaItem.findMany({
            where: {
              type: "video",
              placement: "testimonials",
            },
            orderBy: [{ order: "asc" }, { uploadedAt: "desc" }],
          })
        : [];

    const videos = testimonials
      .filter((t) => t.type === "video")
      .map((t) => ({
        id: t.id,
        title: t.title || "",
        speaker: t.speaker || "",
        details: t.details || "",
        duration: t.duration || "3:00",
        grad: t.gradient,
        videoUrl: t.videoUrl || "",
        thumbnail: t.thumbnail || "",
      }))
      .concat(
        testimonialVideosFromMedia.map((m) => ({
          id: m.id,
          title: m.title || m.originalName.replace(/\.[^/.]+$/, ""),
          speaker: m.speaker || "",
          details: m.caption || "Video Testimonial",
          duration: m.duration || "3:00",
          grad: "from-blue-400 to-indigo-500",
          videoUrl: m.url,
          thumbnail: "",
        }))
      );

    const written = testimonials
      .filter((t) => t.type === "written")
      .map((t) => ({
        id: t.id,
        quote: t.quote || "",
        author: t.author || "Anonymous",
        role: t.role || "",
        rating: t.rating,
        program: t.programTag || "General",
        region: t.region || "Global",
      }));

    const finalVideos =
      videos.length > 0
        ? videos
        : [
            {
              id: "vid-1",
              title: "Tokyo Seminar Exchange Reflection",
              speaker: "Elena Rostova",
              details: "Graduate Research Fellow, Munich University",
              duration: "3:45",
              grad: "from-blue-500 to-indigo-600",
              videoUrl: "",
              thumbnail: "",
            },
            {
              id: "vid-2",
              title: "Youth Leadership Summit Experience",
              speaker: "Marcus Vance",
              details: "Civic Youth Delegate, London Hub",
              duration: "4:20",
              grad: "from-purple-500 to-pink-600",
              videoUrl: "",
              thumbnail: "",
            },
            {
              id: "vid-3",
              title: "Corporate Governance Program Review",
              speaker: "Sarah Jenkins",
              details: "Operations Lead, Global Partners",
              duration: "2:50",
              grad: "from-emerald-500 to-teal-600",
              videoUrl: "",
              thumbnail: "",
            },
          ];

    const finalWritten =
      written.length > 0
        ? written
        : [
            {
              id: "w-1",
              quote: "The academic exchange program transformed my worldview. The faculty mentorship and international network were unmatched.",
              author: "Dr. Jonathan Hayes",
              role: "Dean of Academic Relations",
              rating: 5,
              program: "Academic Exchange",
              region: "Europe",
            },
            {
              id: "w-2",
              quote: "As a youth delegate, receiving the seed grant enabled us to launch our local community literacy initiative in Bogota.",
              author: "Camila Gutierrez",
              role: "Youth Ambassador 2025",
              rating: 5,
              program: "Youth Leadership",
              region: "Latin America",
            },
            {
              id: "w-3",
              quote: "Meru Global Team provides an essential bridge for global organizations aligning with ESG standards and ethical decision making.",
              author: "Arthur Pendelton",
              role: "Chief Compliance Officer",
              rating: 5,
              program: "Corporate ESG",
              region: "Global",
            },
          ];

    return NextResponse.json(
      {
        all: testimonials,
        videos: finalVideos,
        written: finalWritten,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Public testimonials GET error:", error);
    return NextResponse.json({ error: "Failed to load testimonials" }, { status: 500 });
  }
}
