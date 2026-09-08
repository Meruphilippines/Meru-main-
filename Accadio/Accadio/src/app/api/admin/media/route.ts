import { getSessionFromCookie } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { uploadFile } from "@/lib/storage";
import { headers } from "next/headers";
import path from "path";

export async function GET() {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie");
    const session = await getSessionFromCookie(cookieHeader);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const media = await prisma.mediaItem.findMany({
      orderBy: { uploadedAt: "desc" },
    });

    const formatted = media.map((m) => ({
      id: m.id,
      filename: m.filename,
      originalName: m.originalName,
      title: m.title,
      caption: m.caption,
      type: m.type,
      size: m.size,
      path: m.url,
      url: m.url,
      provider: m.provider,
      placement: m.placement,
      tag: m.tag,
      year: m.year,
      speaker: m.speaker,
      duration: m.duration,
      order: m.order,
      uploadedAt: m.uploadedAt.toISOString(),
    }));

    return Response.json(formatted);
  } catch (error) {
    console.error("Media GET error:", error);
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

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const placement = (formData.get("placement") as string | null) || "general";
    const title = formData.get("title") as string | null;
    const caption = formData.get("caption") as string | null;
    const tag = formData.get("tag") as string | null;
    const year = formData.get("year") as string | null;
    const speaker = formData.get("speaker") as string | null;
    const duration = formData.get("duration") as string | null;

    if (!files || files.length === 0) {
      return Response.json({ error: "No files provided" }, { status: 400 });
    }

    const uploaded = [];

    for (const file of files) {
      const ext = path.extname(file.name).toLowerCase();
      const isVideo = [".mp4", ".webm", ".mov"].includes(ext);
      const isImage = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(ext);

      if (!isVideo && !isImage) {
        continue; // Skip unsupported file types
      }

      const type = isVideo ? "video" : "image";
      const folder = isVideo ? "videos" : "images";
      const buffer = Buffer.from(await file.arrayBuffer());

      // Use the storage adapter (Local, Cloudinary, or S3)
      const uploadResult = await uploadFile(buffer, file.name, file.type, folder);

      const dbItem = await prisma.mediaItem.create({
        data: {
          filename: uploadResult.filename,
          originalName: file.name,
          type,
          size: uploadResult.size,
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          provider: uploadResult.provider,
          placement,
          title: title || null,
          caption: caption || null,
          tag: tag || null,
          year: year || null,
          speaker: speaker || null,
          duration: duration || null,
        },
      });

      uploaded.push({
        id: dbItem.id,
        filename: dbItem.filename,
        originalName: dbItem.originalName,
        type: dbItem.type,
        size: dbItem.size,
        path: dbItem.url,
        url: dbItem.url,
        provider: dbItem.provider,
        placement: dbItem.placement,
        title: dbItem.title,
        caption: dbItem.caption,
        tag: dbItem.tag,
        year: dbItem.year,
        speaker: dbItem.speaker,
        duration: dbItem.duration,
        uploadedAt: dbItem.uploadedAt.toISOString(),
      });
    }

    return Response.json({ uploaded, total: uploaded.length }, { status: 201 });
  } catch (error) {
    console.error("Media POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
