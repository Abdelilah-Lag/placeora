export type SpaceCategory =
  | "Professionnel"
  | "Conférence"
  | "Anniversaire"
  | "Mariage"
  | "Soirée"
  | "Famille"
  | "Séminaire"
  | "Formation"
  | "Autre";

export type ReservationStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
export type SpaceStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type PriceUnit = "heure" | "demi-journée" | "journée" | "forfait";
export type Locale = "fr" | "en" | "ar";

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

export interface SpaceTranslation {
  name?: string;
  description?: string;
  amenities?: string[];
  services?: string[];
}

export interface Space {
  id: string;
  name: string;
  slug: string;
  category: SpaceCategory;
  description: string;
  city: string;
  address: string;
  capacityMin?: number;
  capacityMax?: number;
  price: number;
  priceUnit: PriceUnit;
  currency: string;
  imageUrl: string;
  imagePublicId?: string;
  galleryUrls: string[];
  galleryImages?: CloudinaryImage[];
  translations?: Partial<Record<Locale, SpaceTranslation>>;
  amenities: string[];
  services: string[];
  status: SpaceStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  spaceId: string;
  spaceName: string;
  customerName: string;
  email: string;
  phone: string;
  company?: string;
  eventType: string;
  date: string;
  startTime: string;
  endTime: string;
  guests: number;
  budget?: number;
  message?: string;
  servicesRequested?: string[];
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySlot {
  id: string;
  spaceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  reservationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  whatsapp: string;
  currency: string;
  address: string;
  city: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
  };
}

export interface AdminSession {
  email: string;
  authenticatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface SpaceFilters {
  query?: string;
  category?: string;
  city?: string;
  minCapacity?: number;
  maxBudget?: number;
  sort?: "price_asc" | "price_desc" | "name_asc";
}
