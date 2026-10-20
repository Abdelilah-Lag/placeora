import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email("Adresse e-mail invalide."),
  password: z.string().min(6, "Le mot de passe est trop court."),
});

export const spaceSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Le nom est requis."),
  slug: z.string().min(2, "Le slug est requis."),
  category: z.enum(["Professionnel", "Conférence", "Anniversaire", "Mariage", "Soirée", "Famille", "Séminaire", "Formation", "Autre"]),
  description: z.string().min(10, "La description est trop courte."),
  city: z.string().min(1, "La ville est requise."),
  address: z.string().min(1, "L’adresse est requise."),
  capacityMin: z.coerce.number().min(1).optional(),
  capacityMax: z.coerce.number().min(1).optional(),
  price: z.coerce.number().min(0),
  priceUnit: z.enum(["heure", "demi-journée", "journée", "forfait"]),
  currency: z.string().default("MAD"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imagePublicId: z.string().optional(),
  galleryUrls: z.array(z.string().url()).optional().default([]),
  galleryImages: z.array(z.object({
    url: z.string().url(),
    publicId: z.string().min(1),
  })).optional().default([]),
  translations: z.object({
    en: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      amenities: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
    }).optional(),
    ar: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      amenities: z.array(z.string()).optional(),
      services: z.array(z.string()).optional(),
    }).optional(),
  }).optional(),
  amenities: z.array(z.string()).optional().default([]),
  services: z.array(z.string()).optional().default([]),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]).default("ACTIVE"),
  featured: z.boolean().default(false),
});

export const reservationSchema = z.object({
  id: z.string().optional(),
  spaceId: z.string().min(1, "Sélectionnez un espace."),
  spaceName: z.string().min(1, "Le nom de l’espace est requis."),
  customerName: z.string().min(2, "Le nom du client est requis."),
  email: z.string().email("Adresse e-mail invalide."),
  phone: z.string().min(6, "Téléphone invalide."),
  company: z.string().optional(),
  eventType: z.string().min(1, "Le type d’événement est requis."),
  date: z.string().min(1, "La date est requise."),
  startTime: z.string().min(1, "L’heure de début est requise."),
  endTime: z.string().min(1, "L’heure de fin est requise."),
  guests: z.coerce.number().min(1, "Le nombre de participants est invalide."),
  budget: z.coerce.number().min(0).optional(),
  message: z.string().optional(),
  servicesRequested: z.array(z.string()).optional(),
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]).default("PENDING"),
});

export const spaceStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]),
});

export const reservationStatusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]),
});
