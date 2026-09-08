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

    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = testimonials.map((t) => ({
      id: t.id,
      name: t.author || t.speaker || t.title || "Anonymous",
      author: t.author || t.speaker || "",
      speaker: t.speaker || "",
      title: t.title || "",
      role: t.role || t.details || "",
      quote: t.quote || t.title || "",
      photoPath: t.photoPath || "",
      videoUrl: t.videoUrl || "",
      thumbnail: t.thumbnail || "",
      duration: t.duration || "",
      type: t.type,
      rating: t.rating,
      programTag: t.programTag,
      region: t.region,
      displayOrder: 0,
      createdAt: t.createdAt.toISOString(),
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("Testimonials GET error:", error);
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
    const name = body.name || body.author || body.speaker;
    const quote = body.quote || body.title;

    if (!name || !quote) {
      return Response.json({ error: "Name and quote/title are required" }, { status: 400 });
    }

    const newTestimonial = await prisma.testimonial.create({
      data: {
        type: body.type || "written",
        author: name,
        speaker: body.type === "video" ? name : null,
        title: body.type === "video" ? quote : null,
        quote: body.type === "written" ? quote : null,
        role: body.role || "",
        details: body.role || "",
        duration: body.duration || null,
        rating: body.rating ? parseInt(body.rating, 10) : 5,
        programTag: body.programTag || "General",
        region: body.region || "Global",
        gradient: body.gradient || "from-blue-400 to-indigo-500",
        videoUrl: body.videoUrl || null,
        thumbnail: body.thumbnail || null,
        photoPath: body.photoPath || null,
      },
    });

    return Response.json(
      {
        id: newTestimonial.id,
        name: newTestimonial.author,
        author: newTestimonial.author,
        role: newTestimonial.role,
        quote: newTestimonial.quote || newTestimonial.title,
        photoPath: newTestimonial.photoPath || "",
        videoUrl: newTestimonial.videoUrl || "",
        thumbnail: newTestimonial.thumbnail || "",
        duration: newTestimonial.duration || "",
        type: newTestimonial.type,
        displayOrder: 0,
        createdAt: newTestimonial.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Testimonials POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
