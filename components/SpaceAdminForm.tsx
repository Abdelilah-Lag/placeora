"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";

import { useLocale } from "@/components/LocaleProvider";
import { translateAdminError } from "@/lib/i18n";
import { Space, SpaceCategory, SpaceStatus } from "@/lib/types";
import { slugify } from "@/lib/utils";

const categories: SpaceCategory[] = ["Professionnel", "Conférence", "Anniversaire", "Mariage", "Soirée", "Famille", "Séminaire", "Formation", "Autre"];
const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none";
const initialDraft = {
  name: "", slug: "", category: "Professionnel" as SpaceCategory, description: "", city: "Rabat", address: "",
  capacityMin: 1, capacityMax: 50, price: 0, priceUnit: "journée" as Space["priceUnit"],
  currency: "MAD", status: "INACTIVE" as SpaceStatus, featured: false,
  amenities: "", services: "", enName: "", enDescription: "", enAmenities: "", enServices: "",
  arName: "", arDescription: "", arAmenities: "", arServices: "",
};

type SelectedImage = { file: File; preview: string };

function makeDraft(space?: Space) {
  if (!space) return initialDraft;
  return {
    name: space.name,
    slug: space.slug,
    category: space.category,
    description: space.description,
    city: space.city,
    address: space.address,
    capacityMin: space.capacityMin || 1,
    capacityMax: space.capacityMax || 50,
    price: space.price,
    priceUnit: space.priceUnit,
    currency: space.currency,
    status: space.status === "ARCHIVED" ? "INACTIVE" as SpaceStatus : space.status,
    featured: space.featured,
    amenities: space.amenities.join(", "),
    services: space.services.join(", "),
    enName: space.translations?.en?.name || "",
    enDescription: space.translations?.en?.description || "",
    enAmenities: space.translations?.en?.amenities?.join(", ") || "",
    enServices: space.translations?.en?.services?.join(", ") || "",
    arName: space.translations?.ar?.name || "",
    arDescription: space.translations?.ar?.description || "",
    arAmenities: space.translations?.ar?.amenities?.join(", ") || "",
    arServices: space.translations?.ar?.services?.join(", ") || "",
  };
}

function readPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Preview unavailable."));
    reader.onerror = () => reject(new Error("Preview unavailable."));
    reader.readAsDataURL(file);
  });
}

function FilePreview({ preview, alt }: { preview: string; alt: string }) {
  return <Image src={preview} alt={alt} width={120} height={80} unoptimized className="h-20 w-28 rounded-lg object-cover" />;
}

function splitList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function SpaceAdminForm({
  space,
  maxImageBytes,
  maxGalleryImages,
  onCancel,
  onSaved,
}: {
  space?: Space;
  maxImageBytes: number;
  maxGalleryImages: number;
  onCancel: () => void;
  onSaved: (message: string) => void;
}) {
  const { locale, t } = useLocale();
  const [draft, setDraft] = useState(() => makeDraft(space));
  const [savedGalleryUrls, setSavedGalleryUrls] = useState<string[]>(() => space?.galleryUrls || []);
  const [savedGalleryImages, setSavedGalleryImages] = useState<NonNullable<Space["galleryImages"]>>(() => space?.galleryImages || []);
  const [primaryFile, setPrimaryFile] = useState<SelectedImage | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<SelectedImage[]>([]);
  const [slugEdited, setSlugEdited] = useState(Boolean(space));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateDraft<K extends keyof typeof initialDraft>(key: K, value: (typeof initialDraft)[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function selectGallery(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files);
    if (savedGalleryUrls.length + galleryFiles.length + next.length > maxGalleryImages) {
      setError(t("admin.error.galleryLimit"));
      return;
    }
    if (next.some((file) => file.size > maxImageBytes || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type))) {
      setError(t("admin.error.format"));
      return;
    }
    setError("");
    try {
      const previews = await Promise.all(next.map(async (file) => ({ file, preview: await readPreview(file) })));
      setGalleryFiles((current) => [...current, ...previews]);
    } catch {
      setError(t("admin.error.format"));
    }
  }

  async function selectPrimaryImage(file: File | undefined) {
    setPrimaryFile(null);
    if (!file) return;
    if (file.size > maxImageBytes || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError(t("admin.error.format"));
      return;
    }
    try {
      setPrimaryFile({ file, preview: await readPreview(file) });
      setError("");
    } catch {
      setError(t("admin.error.format"));
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!space && !primaryFile) {
      setError(t("admin.error.primaryRequired"));
      return;
    }
    if (draft.capacityMin > draft.capacityMax) {
      setError(t("admin.error.capacity"));
      return;
    }
    if (primaryFile && (primaryFile.file.size > maxImageBytes || !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(primaryFile.file.type))) {
      setError(t("admin.error.format"));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...(space ? { id: space.id } : {}),
        ...draft,
        capacityMin: Number(draft.capacityMin),
        capacityMax: Number(draft.capacityMax),
        price: Number(draft.price),
        imageUrl: space?.imageUrl || "",
        imagePublicId: space?.imagePublicId,
        galleryUrls: savedGalleryUrls,
        galleryImages: savedGalleryImages,
        amenities: splitList(draft.amenities),
        services: splitList(draft.services),
        translations: {
          en: {
            name: draft.enName || undefined,
            description: draft.enDescription || undefined,
            amenities: splitList(draft.enAmenities),
            services: splitList(draft.enServices),
          },
          ar: {
            name: draft.arName || undefined,
            description: draft.arDescription || undefined,
            amenities: splitList(draft.arAmenities),
            services: splitList(draft.arServices),
          },
        },
      };
      const body = new FormData();
      body.set("space", JSON.stringify(payload));
      if (primaryFile) body.set("primaryImage", primaryFile.file);
      galleryFiles.forEach(({ file }) => body.append("galleryImages", file));

      const response = await fetch("/api/admin/spaces", {
        method: space ? "PATCH" : "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || t("admin.error.save"));
      onSaved(result.warning ? translateAdminError(locale, result.warning) : t("admin.saved"));
    } catch (caught) {
      setError(caught instanceof Error ? translateAdminError(locale, caught.message) : t("admin.error.save"));
    } finally {
      setSaving(false);
    }
  }

  function field(label: string, key: keyof typeof initialDraft, type = "text", required = ["name", "slug", "description", "city", "address"].includes(key)) {
    return <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{label}</span><input type={type} value={draft[key] as string | number} onChange={(event) => {
      const value = type === "number" ? Number(event.target.value) : event.target.value;
      if (key === "name" && !slugEdited) setDraft((current) => ({ ...current, slug: slugify(String(value)) }));
      if (key === "slug") setSlugEdited(true);
      updateDraft(key, value as never);
    }} className={inputClass} required={required} /></label>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-h-[90vh] space-y-5 overflow-y-auto rounded-[28px] border border-slate-200 bg-white p-5 shadow-xl md:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-slate-500">{t("admin.general")}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{space ? t("admin.formEdit") : t("admin.formNew")}</h2></div><button type="button" onClick={onCancel} className="btn-secondary">{t("admin.cancel")}</button></div>
      <div className="grid gap-4 md:grid-cols-2">
        {field(t("admin.spaceName"), "name")}
        {field(t("admin.slug"), "slug")}
        <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t("admin.category")}</span><select value={draft.category} onChange={(event) => updateDraft("category", event.target.value as SpaceCategory)} className={inputClass}>{categories.map((category) => <option key={category} value={category}>{t(`category.${({ Professionnel: "professional", Conférence: "conference", Anniversaire: "birthday", Mariage: "wedding", Soirée: "evening", Famille: "family", Séminaire: "seminar", Formation: "training", Autre: "other" } as Record<string, string>)[category]}`)}</option>)}</select></label>
        {field(t("events.city"), "city")}
        <div className="md:col-span-2">{field(t("admin.address"), "address")}</div>
        <div className="md:col-span-2">{field(t("admin.description"), "description")}</div>
        {field(t("admin.capacityMin"), "capacityMin", "number")}
        {field(t("admin.capacityMax"), "capacityMax", "number")}
        {field(t("admin.price"), "price", "number")}
        <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t("admin.currency")}</span><input value={draft.currency} onChange={(event) => updateDraft("currency", event.target.value.toUpperCase())} maxLength={3} className={inputClass} required /></label>
        <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t("admin.unit")}</span><select value={draft.priceUnit} onChange={(event) => updateDraft("priceUnit", event.target.value as Space["priceUnit"])} className={inputClass}><option value="heure">{t("unit.hour")}</option><option value="demi-journée">{t("unit.halfday")}</option><option value="journée">{t("unit.day")}</option><option value="forfait">{t("unit.package")}</option></select></label>
        <label className="space-y-1.5 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t("admin.amenities")}</span><input value={draft.amenities} onChange={(event) => updateDraft("amenities", event.target.value)} className={inputClass} /></label>
        <label className="space-y-1.5 md:col-span-2"><span className="text-sm font-medium text-slate-700">{t("admin.services")}</span><input value={draft.services} onChange={(event) => updateDraft("services", event.target.value)} className={inputClass} /></label>
      </div>
      <details className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold text-slate-800">{t("admin.translateEn")}</summary>      <div className="mt-4 grid gap-3 md:grid-cols-2">{field("Name", "enName", "text", false)}{field("Description", "enDescription", "text", false)}<input value={draft.enAmenities} onChange={(event) => updateDraft("enAmenities", event.target.value)} placeholder="Amenities" className={inputClass} /><input value={draft.enServices} onChange={(event) => updateDraft("enServices", event.target.value)} placeholder="Services" className={inputClass} /></div></details>
      <details className="rounded-2xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold text-slate-800">{t("admin.translateAr")}</summary><div className="mt-4 grid gap-3 md:grid-cols-2" dir="rtl">{field("الاسم", "arName", "text", false)}{field("الوصف", "arDescription", "text", false)}<input value={draft.arAmenities} onChange={(event) => updateDraft("arAmenities", event.target.value)} placeholder="التجهيزات" className={inputClass} /><input value={draft.arServices} onChange={(event) => updateDraft("arServices", event.target.value)} placeholder="الخدمات" className={inputClass} /></div></details>
      <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">{t("admin.mainImage")}</h3>
        {space && !primaryFile ? <div className="flex items-center gap-3"><Image src={space.imageUrl} alt={space.name} width={140} height={96} className="h-24 w-36 rounded-xl object-cover" /><span className="text-sm text-slate-600">{t("admin.currentImages")}</span></div> : null}
        <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void selectPrimaryImage(event.target.files?.[0])} className="block w-full text-sm" />
        {primaryFile ? <FilePreview preview={primaryFile.preview} alt="Main image preview" /> : null}
      </section>
      <section className="space-y-3 rounded-2xl border border-slate-200 p-4">
        <h3 className="font-semibold text-slate-900">{t("admin.gallery")}</h3>
        <div className="flex flex-wrap gap-3">{savedGalleryUrls.map((url) => <div key={url} className="relative"><Image src={url} alt="Saved gallery image" width={120} height={80} className="h-20 w-28 rounded-lg object-cover" /><button type="button" onClick={() => { setSavedGalleryUrls((items) => items.filter((item) => item !== url)); setSavedGalleryImages((items) => items.filter((item) => item.url !== url)); }} className="mt-1 text-xs font-medium text-rose-700">{t("admin.remove")}</button></div>)}{galleryFiles.map(({ file, preview }) => <div key={`${file.name}-${file.lastModified}`} className="relative"><FilePreview preview={preview} alt={file.name} /><button type="button" onClick={() => setGalleryFiles((items) => items.filter((item) => item.file !== file))} className="mt-1 text-xs font-medium text-rose-700">{t("admin.remove")}</button></div>)}</div>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void selectGallery(event.target.files)} className="block w-full text-sm" />
        <p className="text-xs text-slate-500">JPEG, PNG, WebP, AVIF · {Math.round(maxImageBytes / 1024 / 1024)} Mo maximum · {maxGalleryImages} images maximum.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5"><span className="text-sm font-medium text-slate-700">{t("admin.status")}</span><select value={draft.status} onChange={(event) => updateDraft("status", event.target.value as SpaceStatus)} className={inputClass}><option value="ACTIVE">{t("admin.publish")}</option><option value="INACTIVE">{t("admin.unpublish")}</option></select></label>
        <label className="flex items-center gap-3 self-end py-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={draft.featured} onChange={(event) => updateDraft("featured", event.target.checked)} />{t("admin.featured")}</label>
      </div>
      {error ? <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="btn-secondary">{t("admin.cancel")}</button><button disabled={saving} type="submit" className="btn-primary disabled:opacity-60">{saving ? t("admin.saving") : t("admin.save")}</button></div>
    </form>
  );
}
