import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await prisma.testimonial.findUnique({
      where: { id },
    });

    if (!item) {
      return Response.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return Response.json({
      id: item.id,
      name: item.author || item.speaker || item.title,
      author: item.author,
      role: item.role || item.details,
      quote: item.quote || item.title,
      photoPath: item.photoPath || "",
      videoUrl: item.videoUrl || "",
      thumbnail: item.thumbnail || "",
      duration: item.duration || "",
      displayOrder: 0,
      type: item.type,
      rating: item.rating,
      createdAt: item.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Testimonial GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const name = body.name !== undefined ? body.name : body.author;
    const quote = body.quote !== undefined ? body.quote : body.title;

    const updateData: any = {};
    if (name !== undefined) updateData.author = name;
    if (quote !== undefined) updateData.quote = quote;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.role !== undefined) updateData.details = body.role;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.rating !== undefined) updateData.rating = parseInt(body.rating, 10);
    if (body.programTag !== undefined) updateData.programTag = body.programTag;
    if (body.region !== undefined) updateData.region = body.region;
    if (body.photoPath !== undefined) updateData.photoPath = body.photoPath;
    if (body.videoUrl !== undefined) updateData.videoUrl = body.videoUrl;
    if (body.thumbnail !== undefined) updateData.thumbnail = body.thumbnail;
    if (body.duration !== undefined) updateData.duration = body.duration;

    if (body.type === "video") {
      if (name !== undefined) updateData.speaker = name;
      if (quote !== undefined) updateData.title = quote;
      updateData.quote = null;
    }

    const updated = await prisma.testimonial.update({
      where: { id },
      data: updateData,
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/testimonials");
    } catch (e) {
      // ignore
    }

    return Response.json({
      id: updated.id,
      name: updated.author || updated.speaker || updated.title || "Anonymous",
      author: updated.author || updated.speaker || "",
      role: updated.role || updated.details || "",
      quote: updated.quote || updated.title || "",
      photoPath: updated.photoPath || "",
      videoUrl: updated.videoUrl || "",
      thumbnail: updated.thumbnail || "",
      duration: updated.duration || "",
      type: updated.type,
      displayOrder: 0,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Testimonial PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.testimonial.delete({
      where: { id },
    });

    try {
      revalidatePath("/", "layout");
      revalidatePath("/testimonials");
    } catch (e) {
      // ignore
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Testimonial DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

