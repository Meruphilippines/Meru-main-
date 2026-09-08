import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  url: string;
  publicId: string;
  filename: string;
  size: number;
  provider: "local" | "cloudinary" | "s3";
}

const STORAGE_PROVIDER = process.env.STORAGE_PROVIDER || "local";

/**
 * Uploads a file to the active storage provider (Local filesystem, Cloudinary, or S3/Supabase).
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder = "media"
): Promise<UploadResult> {
  const ext = path.extname(originalName).toLowerCase() || (mimeType.includes("video") ? ".mp4" : ".png");
  const uniqueName = `${uuidv4()}${ext}`;

  // 1. Cloudinary Provider
  if (
    STORAGE_PROVIDER === "cloudinary" &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;
      const resourceType = mimeType.startsWith("video") ? "video" : "image";
      const timestamp = Math.floor(Date.now() / 1000);

      // Cloudinary basic direct upload
      const formData = new FormData();
      formData.append("file", new Blob([new Uint8Array(buffer)], { type: mimeType }));
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("folder", `accadio/${folder}`);

      // Generate signature
      const crypto = await import("crypto");
      const sigString = `folder=accadio/${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(sigString).digest("hex");
      formData.append("signature", signature);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          url: data.secure_url || data.url,
          publicId: data.public_id,
          filename: uniqueName,
          size: buffer.length,
          provider: "cloudinary",
        };
      }
      console.warn("Cloudinary upload failed, falling back to local storage:", await res.text());
    } catch (err) {
      console.error("Cloudinary error, falling back to local:", err);
    }
  }

  // 2. Default Local Storage Provider
  const uploadsDir = path.join(process.cwd(), "public", "uploads", folder);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filePath = path.join(uploadsDir, uniqueName);
  fs.writeFileSync(filePath, buffer);

  const publicUrl = `/uploads/${folder}/${uniqueName}`;

  return {
    url: publicUrl,
    publicId: uniqueName,
    filename: uniqueName,
    size: buffer.length,
    provider: "local",
  };
}

/**
 * Deletes a file from storage.
 */
export async function deleteFile(publicId: string, provider: string, folder = "media"): Promise<boolean> {
  if (provider === "local") {
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", folder, publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return true;
    } catch (err) {
      console.error("Local file delete error:", err);
      return false;
    }
  }

  // Cloudinary delete handling
  if (provider === "cloudinary" && process.env.CLOUDINARY_API_KEY) {
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const crypto = await import("crypto");
      const sigString = `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`;
      const signature = crypto.createHash("sha1").update(sigString).digest("hex");

      const params = new URLSearchParams({
        public_id: publicId,
        api_key: process.env.CLOUDINARY_API_KEY,
        timestamp: timestamp.toString(),
        signature,
      });

      await fetch(`https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`, {
        method: "POST",
        body: params,
      });
      return true;
    } catch (err) {
      console.error("Cloudinary delete error:", err);
      return false;
    }
  }

  return true;
}
