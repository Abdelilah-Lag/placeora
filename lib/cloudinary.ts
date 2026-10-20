import "server-only";

import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";

import type { CloudinaryImage } from "@/lib/types";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const configuredSizeMb = Number(process.env.CLOUDINARY_MAX_FILE_SIZE_MB || 8);
const configuredGalleryLimit = Number(process.env.CLOUDINARY_MAX_IMAGES_PER_SPACE || 8);

export const MAX_IMAGE_BYTES = Number.isInteger(configuredSizeMb) && configuredSizeMb >= 1 && configuredSizeMb <= 50
  ? configuredSizeMb * 1024 * 1024
  : 8 * 1024 * 1024;
export const MAX_GALLERY_IMAGES = Number.isInteger(configuredGalleryLimit) && configuredGalleryLimit >= 1 && configuredGalleryLimit <= 20
  ? configuredGalleryLimit
  : 8;

export function isSupportedImage(file: File) {
  return allowedMimeTypes.has(file.type);
}

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Set its server-side environment variables.");
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadSpaceImage(file: File, spaceId: string): Promise<CloudinaryImage> {
  configureCloudinary();
  const buffer = Buffer.from(await file.arrayBuffer());

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder: `placeora/spaces/${spaceId}`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    }, (error: UploadApiErrorResponse | undefined, response) => {
      if (error) {
        reject(new Error(typeof error.http_code === "number"
          ? `Cloudinary upload failed (HTTP ${error.http_code}).`
          : "Cloudinary upload failed."));
      }
      else if (response) resolve(response);
      else reject(new Error("Cloudinary did not return an image result."));
    });
    stream.end(buffer);
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteCloudinaryImages(publicIds: string[]) {
  if (publicIds.length === 0) return;
  configureCloudinary();
  await Promise.all(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
    invalidate: true,
  })));
}
