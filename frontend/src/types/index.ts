// ─── Core Types ────────────────────────────────────────────────────

export type UserRole = 'USER' | 'OWNER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type PropertyType = 'HOUSE' | 'SHOP';
export type FurnishingStatus = 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
export type PropertyStatus =
  | 'DRAFT'
  | 'PAYMENT_PENDING'
  | 'PENDING_APPROVAL'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'REMOVED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
export type EnquiryStatus = 'NEW' | 'READ' | 'REPLIED' | 'CLOSED';

// ─── User ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  role: UserRole;
  profileImage?: string | null;
  status: UserStatus;
  createdAt: string;
  owner?: Owner | null;
  _count?: { enquiries?: number; favourites?: number; [key: string]: number | undefined };
}

export interface Owner {
  id: string;
  userId: string;
  bio?: string | null;
  isVerified: boolean;
  createdAt: string;
  user?: Partial<User>;
  _count?: { properties: number; enquiries: number };
}

// ─── Property ──────────────────────────────────────────────────────

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  publicId: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Property {
  id: string;
  ownerId: string;
  propertyType: PropertyType;
  title: string;
  description: string;
  rent: number;
  deposit: number;
  locality: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  propertySize: number;
  bedrooms?: number | null;
  rooms?: number | null;
  furnishing: FurnishingStatus;
  amenities: string[];
  availability: string;
  contactPhone: boolean;
  contactWhatsapp: boolean;
  contactEnquiry: boolean;
  status: PropertyStatus;
  rejectionReason?: string | null;
  viewCount: number;
  planId?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  images: PropertyImage[];
  owner?: {
    id: string;
    user: {
      id: string;
      name: string;
      mobile?: string | null;
      email?: string | null;
      profileImage?: string | null;
    };
  };
  _count?: { enquiries: number };
  isFavourite?: boolean;
}

// ─── Payment ───────────────────────────────────────────────────────

export interface ListingPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  description: string;
  features: string[];
  isActive: boolean;
  sortOrder: number;
}

export interface Payment {
  id: string;
  userId: string;
  ownerId: string;
  propertyId: string;
  planId: string;
  amount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  cfOrderId?: string | null;
  paymentSessionId?: string | null;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  transactionId?: string | null;
  failureReason?: string | null;
  createdAt: string;
  plan?: ListingPlan;
  property?: Partial<Property>;
  user?: Partial<User>;
  owner?: Partial<Owner & { user?: Partial<User> }>;
}

// ─── Enquiry ───────────────────────────────────────────────────────

export interface Enquiry {
  id: string;
  propertyId: string;
  userId: string;
  ownerId: string;
  message: string;
  phone?: string | null;
  status: EnquiryStatus;
  createdAt: string;
  property?: Partial<Property>;
  user?: Partial<User>;
  owner?: Partial<Owner & { user?: Partial<User> }>;
}

// ─── API Response ──────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ─── Filter Types ──────────────────────────────────────────────────

export interface PropertyFilters {
  propertyType?: PropertyType | '';
  locality?: string;
  minRent?: number | '';
  maxRent?: number | '';
  bedrooms?: number | '';
  furnishing?: FurnishingStatus | '';
  minSize?: number | '';
  maxSize?: number | '';
  sortBy?: 'newest' | 'rent_asc' | 'rent_desc';
  page?: number;
  limit?: number;
}

// ─── Cashfree Payment Gateway ─────────────────────────────────────

export interface CashfreeCheckoutOptions {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_top' | '_modal';
}

declare global {
  interface Window {
    Cashfree: any;
    Razorpay?: any;
  }
}

