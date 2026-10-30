import api from '../lib/axios';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WantedSpaceStatus =
  | 'DRAFT' | 'PAYMENT_PENDING' | 'PENDING_APPROVAL'
  | 'PUBLISHED' | 'FULFILLED' | 'EXPIRED' | 'REMOVED' | 'REJECTED';

export type WantedSpaceCategory =
  | 'RESIDENTIAL' | 'ROOMS_ACCOMMODATION' | 'OFFICES' | 'SHOPS_RETAIL'
  | 'INDUSTRIAL' | 'COMMERCIAL_BUILDINGS' | 'INSTITUTIONAL' | 'HOSPITALITY'
  | 'PARKING_STORAGE' | 'LAND_PLOTS' | 'OTHER';

export type WantedRequirementType = 'RENT' | 'LEASE' | 'EITHER';
export type WantedFurnishingPreference = 'FULLY_FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED' | 'ANY';
export type WantedPaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface WantedSpace {
  id: string;
  userId: string;
  title: string;
  category: WantedSpaceCategory;
  subcategory?: string | null;
  preferredCity: string;
  preferredLocality?: string | null;
  minArea?: number | null;
  maxArea?: number | null;
  maxRentBudget?: number | null;
  maxLeaseBudget?: number | null;
  requirementType: WantedRequirementType;
  occupantsCount?: number | null;
  amenities: string[];
  furnishingPreference: WantedFurnishingPreference;
  expectedMoveIn?: string | null;
  additionalNotes?: string | null;
  contactName: string;
  contactMethod: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactWhatsapp?: string | null;
  showContact: boolean;
  categoryExtras?: string | null;
  status: WantedSpaceStatus;
  rejectionReason?: string | null;
  viewCount: number;
  paymentStatus: WantedPaymentStatus;
  paymentAmount: number;
  cfOrderId?: string | null;
  transactionId?: string | null;
  validityDays: number;
  publishedAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface WantedSpaceListParams {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  locality?: string;
  minBudget?: number;
  maxBudget?: number;
  requirementType?: string;
  minArea?: number;
  maxArea?: number;
  search?: string;
  status?: string;
}

export interface CreateWantedSpaceData {
  title: string;
  category: string;
  subcategory?: string;
  preferredCity: string;
  preferredLocality?: string;
  minArea?: number;
  maxArea?: number;
  maxRentBudget?: number;
  maxLeaseBudget?: number;
  requirementType?: string;
  occupantsCount?: number;
  amenities?: string[];
  furnishingPreference?: string;
  expectedMoveIn?: string;
  additionalNotes?: string;
  contactName: string;
  contactMethod?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactWhatsapp?: string;
  showContact?: boolean;
  categoryExtras?: Record<string, unknown>;
  paymentAmount?: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function listWantedSpaces(params: WantedSpaceListParams = {}) {
  const { data } = await api.get('/wanted-spaces', { params });
  return data;
}

export async function getWantedSpace(id: string) {
  const { data } = await api.get(`/wanted-spaces/${id}`);
  return data.data as WantedSpace;
}

export async function createWantedSpace(payload: CreateWantedSpaceData) {
  const { data } = await api.post('/wanted-spaces', payload);
  return data.data as WantedSpace;
}

export async function updateWantedSpace(id: string, payload: Partial<CreateWantedSpaceData>) {
  const { data } = await api.put(`/wanted-spaces/${id}`, payload);
  return data.data as WantedSpace;
}

export async function initiateWantedSpacePayment(id: string) {
  const { data } = await api.post(`/wanted-spaces/${id}/payment/initiate`);
  return data;
}

export async function verifyWantedSpacePayment(orderId: string, wantedSpaceId?: string) {
  const { data } = await api.post('/wanted-spaces/payment/verify', {
    order_id: orderId,
    wantedSpaceId,
  });
  return data;
}

export async function myWantedSpaces(params: WantedSpaceListParams = {}) {
  const { data } = await api.get('/wanted-spaces/my/requirements', { params });
  return data;
}

export async function markWantedSpaceFulfilled(id: string) {
  const { data } = await api.patch(`/wanted-spaces/${id}/fulfill`);
  return data;
}

export async function deleteWantedSpace(id: string) {
  const { data } = await api.delete(`/wanted-spaces/${id}`);
  return data;
}

export async function renewWantedSpace(id: string) {
  const { data } = await api.post(`/wanted-spaces/${id}/renew`);
  return data;
}

// Admin
export async function adminListWantedSpaces(params: WantedSpaceListParams = {}) {
  const { data } = await api.get('/wanted-spaces/admin/all', { params });
  return data;
}

export async function adminApproveWantedSpace(id: string) {
  const { data } = await api.patch(`/wanted-spaces/admin/${id}/approve`);
  return data;
}

export async function adminRejectWantedSpace(id: string, reason: string) {
  const { data } = await api.patch(`/wanted-spaces/admin/${id}/reject`, { reason });
  return data;
}

export async function adminRemoveWantedSpace(id: string) {
  const { data } = await api.delete(`/wanted-spaces/admin/${id}`);
  return data;
}
