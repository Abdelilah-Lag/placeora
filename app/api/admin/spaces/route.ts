import { NextResponse } from "next/server";

import { getAdminFromRequest } from "@/lib/auth";
import { deleteCloudinaryImages, isSupportedImage, MAX_GALLERY_IMAGES, MAX_IMAGE_BYTES, uploadSpaceImage } from "@/lib/cloudinary";
import { initialReservations } from "@/lib/data";
import { createSpace, getSpaceById, getSpaces, replaceSpace, updateSpaceStatus } from "@/lib/spaces-store";
import { generateId, slugify } from "@/lib/utils";
import { spaceSchema, spaceStatusUpdateSchema } from "@/lib/validation";
import type { CloudinaryImage, Space } from "@/lib/types";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ success: false, error: message }, { status });
}

function isFile(value: FormDataEntryValue | null): value is File {
  return typeof File !== "undefined" && value instanceof File && value.size > 0;
}

function getCloudinaryReferences(space: Space) {
  return [
    ...(space.imagePublicId ? [space.imagePublicId] : []),
    ...(space.galleryImages || []).map((image) => image.publicId),
  ];
}

export async function GET(request: Request) {
  if (!(await getAdminFromRequest(request))) return errorResponse("Authentification requise.", 401);
  return NextResponse.json({
    success: true,
    message: "Espaces récupérés.",
    data: await getSpaces(),
    limits: { maxImageBytes: MAX_IMAGE_BYTES, maxGalleryImages: MAX_GALLERY_IMAGES },
  });
}

async function saveSpace(request: Request, existingSpace?: Space) {
  if (!(await getAdminFromRequest(request))) return errorResponse("Authentification requise.", 401);

  const uploaded: CloudinaryImage[] = [];
  let cloudinaryUploadFailed = false;
  async function uploadImage(file: File, spaceId: string) {
    try {
      return await uploadSpaceImage(file, spaceId);
    } catch (error) {
      cloudinaryUploadFailed = true;
      throw error;
    }
  }
  try {
    const form = await request.formData();
    const rawPayload = form.get("space");
    if (typeof rawPayload !== "string") return errorResponse("Les informations de l’espace sont manquantes.", 400);

    let decodedPayload: unknown;
    try {
      decodedPayload = JSON.parse(rawPayload);
    } catch {
      return errorResponse("Les informations de l’espace sont invalides.", 400);
    }
    const parsed = spaceSchema.safeParse(decodedPayload);
    if (!parsed.success) return errorResponse(parsed.error.issues[0]?.message || "Informations invalides.", 400);
    const payload = parsed.data;
    const id = existingSpace?.id || generateId("space");
    const slug = slugify(payload.slug);
    if (!slug) return errorResponse("Le slug est invalide.", 400);
    if ((await getSpaces()).some((space) => space.id !== id && space.slug === slug)) {
      return errorResponse("Ce slug est déjà utilisé.", 409);
    }
    if (
      payload.capacityMin !== undefined &&
      payload.capacityMax !== undefined &&
      payload.capacityMin > payload.capacityMax
    ) {
      return errorResponse("La capacité minimale ne peut pas dépasser la capacité maximale.", 400);
    }

    const primaryFile = form.get("primaryImage");
    const galleryFiles = form.getAll("galleryImages").filter(isFile);
    if (!existingSpace && !isFile(primaryFile)) {
      return errorResponse("Une nouvelle image principale doit être téléversée vers Cloudinary.", 400);
    }
    if (
      existingSpace &&
      !isFile(primaryFile) &&
      (payload.imageUrl !== existingSpace.imageUrl || payload.imagePublicId !== existingSpace.imagePublicId)
    ) {
      return errorResponse("Les références d’image existantes ne peuvent pas être remplacées par une URL fournie.", 400);
    }
    if (isFile(primaryFile) && primaryFile.size > MAX_IMAGE_BYTES) {
      return errorResponse(`L’image principale dépasse la taille maximale de ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} Mo.`, 413);
    }
    if (galleryFiles.some((file) => file.size > MAX_IMAGE_BYTES)) {
      return errorResponse(`Chaque image doit faire moins de ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} Mo.`, 413);
    }
    if ((isFile(primaryFile) && !isSupportedImage(primaryFile)) || galleryFiles.some((file) => !isSupportedImage(file))) {
      return errorResponse("Formats acceptés : JPEG, PNG, WebP et AVIF.", 415);
    }
    if (Math.max(payload.galleryUrls?.length || 0, payload.galleryImages?.length || 0) + galleryFiles.length > MAX_GALLERY_IMAGES) {
      return errorResponse(`La galerie est limitée à ${MAX_GALLERY_IMAGES} images.`, 400);
    }
    const existingGalleryReferences = new Map((existingSpace?.galleryImages || []).map((image) => [image.publicId, image.url]));
    if ((payload.galleryImages || []).some((image) => existingGalleryReferences.get(image.publicId) !== image.url)) {
      return errorResponse("La galerie contient une référence d’image inconnue.", 400);
    }
    const allowedGalleryUrls = new Set(existingSpace?.galleryUrls || []);
    if ((payload.galleryUrls || []).some((url) => !allowedGalleryUrls.has(url))) {
      return errorResponse("La galerie contient une URL non autorisée.", 400);
    }

    let imageUrl = payload.imageUrl || existingSpace?.imageUrl || "";
    let imagePublicId = payload.imagePublicId || existingSpace?.imagePublicId;
    if (isFile(primaryFile)) {
      const image = await uploadImage(primaryFile, id);
      uploaded.push(image);
      imageUrl = image.url;
      imagePublicId = image.publicId;
    }
    if (!imageUrl) return errorResponse("Ajoutez une image principale avant d’enregistrer.", 400);

    const galleryImages = [...(payload.galleryImages || [])];
    const uploadedGallery: CloudinaryImage[] = [];
    for (const file of galleryFiles) {
      const image = await uploadImage(file, id);
      uploaded.push(image);
      uploadedGallery.push(image);
      galleryImages.push(image);
    }
    const galleryUrls = [...new Set([...(payload.galleryUrls || []), ...uploadedGallery.map((image) => image.url)])];

    const space: Space = {
      ...payload,
      id,
      slug,
      imageUrl,
      imagePublicId,
      galleryImages,
      galleryUrls,
      createdAt: existingSpace?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedSpace = existingSpace ? await replaceSpace(space) : await createSpace(space);
    if (!savedSpace) {
      if (uploaded.length) await deleteCloudinaryImages(uploaded.map((image) => image.publicId));
      return errorResponse("Espace introuvable.", 404);
    }

    const oldReferences = existingSpace ? getCloudinaryReferences(existingSpace) : [];
    const currentReferences = new Set((await getSpaces()).flatMap(getCloudinaryReferences));
    const hasHistoricalReservations = initialReservations.some((reservation) => reservation.spaceId === id);
    const obsoleteReferences = oldReferences.filter((publicId) =>
      !currentReferences.has(publicId) && !hasHistoricalReservations
    );
    let cleanupWarning: string | undefined;
    if (obsoleteReferences.length) {
      try {
        await deleteCloudinaryImages(obsoleteReferences);
      } catch (error) {
        console.error("Could not remove obsolete Cloudinary images.", error instanceof Error ? error.message : "Unknown error");
        cleanupWarning = "L’espace a été enregistré, mais certaines anciennes images n’ont pas pu être supprimées.";
      }
    }

    return NextResponse.json({
      success: true,
      message: existingSpace ? "Espace modifié." : "Espace créé.",
      data: savedSpace,
      warning: cleanupWarning,
    });
  } catch (error) {
    if (uploaded.length) {
      try {
        await deleteCloudinaryImages(uploaded.map((image) => image.publicId));
      } catch (cleanupError) {
        console.error("Could not clean up orphaned Cloudinary images.", cleanupError instanceof Error ? cleanupError.message : "Unknown error");
      }
    }
    console.error("Could not save space.", error instanceof Error ? error.message : "Unknown error");
    const cloudinaryStatus = error instanceof Error ? error.message.match(/HTTP (\d+)/)?.[1] : undefined;
    return errorResponse(
      error instanceof Error && error.message.includes("not configured")
        ? "Le stockage Cloudinary n’est pas configuré."
        : cloudinaryUploadFailed
          ? cloudinaryStatus
            ? `Cloudinary a refusé le téléversement (HTTP ${cloudinaryStatus}). Vérifiez sa configuration serveur et réessayez.`
            : "Cloudinary n’a pas pu téléverser l’image. Vérifiez le fichier et réessayez."
          : "Impossible d’enregistrer l’espace. Vérifiez les informations et réessayez.",
      500,
    );
  }
}

export async function POST(request: Request) {
  return saveSpace(request);
}

export async function PATCH(request: Request) {
  if (!(await getAdminFromRequest(request))) return errorResponse("Authentification requise.", 401);
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse("La mise à jour du statut est invalide.", 400);
    }
    const parsed = spaceStatusUpdateSchema.safeParse(body);
    if (!parsed.success) return errorResponse("La mise à jour du statut est invalide.", 400);
    try {
      const payload = parsed.data;
      const space = await updateSpaceStatus(payload.id, payload.status);
      if (!space) return errorResponse("Espace introuvable.", 404);
      return NextResponse.json({ success: true, data: space });
    } catch (error) {
      console.error("Could not update space status.", error instanceof Error ? error.message : "Unknown error");
      return errorResponse("Impossible d’enregistrer le statut de l’espace.", 500);
    }
  }

  try {
    const form = await request.clone().formData();
    const raw = form.get("space");
    if (typeof raw !== "string") return errorResponse("Les informations de l’espace sont manquantes.", 400);
    const id = JSON.parse(raw)?.id;
    if (typeof id !== "string") return errorResponse("Identifiant d’espace invalide.", 400);
    const existing = await getSpaceById(id);
    if (!existing) return errorResponse("Espace introuvable.", 404);
    return saveSpace(request, existing);
  } catch {
    return errorResponse("La requête de modification est invalide.", 400);
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminFromRequest(request))) return errorResponse("Authentification requise.", 401);
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("La demande d’archivage est invalide.", 400);
  }
  const parsed = spaceStatusUpdateSchema.pick({ id: true }).safeParse(body);
  if (!parsed.success) return errorResponse("La demande d’archivage est invalide.", 400);
  try {
    const payload = parsed.data;
    const space = await updateSpaceStatus(payload.id, "ARCHIVED");
    if (!space) return errorResponse("Espace introuvable.", 404);

    return NextResponse.json({
      success: true,
      message: "Espace archivé. Les réservations historiques sont conservées.",
      data: space,
    });
  } catch (error) {
    console.error("Could not archive space.", error instanceof Error ? error.message : "Unknown error");
    return errorResponse("Impossible d’archiver l’espace.", 500);
  }
}
