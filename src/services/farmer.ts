import { authenticatedRequest } from './auth';

export type ListingUnit = 'kg' | 'quintal' | 'tonne' | 'piece' | 'crate';

export interface FarmerListing {
  id: number;
  commodity: string;
  variety?: string | null;
  quantity: number;
  unit: ListingUnit;
  expected_harvest_date?: string | null;
  quality_details?: string | null;
  expected_price?: number | null;
  preferred_market?: string | null;
  image_urls: string[];
  status: string;
  buyer_interest_count: number;
  created_at?: string | null;
  updated_at?: string | null;
}

export type CropLotStatus = 'DRAFT' | 'ACTIVE' | 'OFFER_RECEIVED' | 'ORDERED' | 'SOLD' | 'EXPIRED' | 'CANCELLED' | 'PUBLISHED' | 'RESERVED';

export interface CropLot {
  id: number;
  lot_code: string;
  qr_payload: string;
  farmer_user_id: string;
  fpo_id: number | null;
  crop: string;
  variety: string | null;
  quantity: number;
  unit: ListingUnit;
  location: string | null;
  harvest_date: string | null;
  photos: string[];
  quality_grade: string | null;
  quality_details: string | null;
  expected_price: number | null;
  availability_date: string | null;
  status: CropLotStatus;
  created_at: string | null;
  updated_at: string | null;
}

export interface FarmerOffer {
  id: number;
  listing_id: number;
  listing_name: string;
  commodity: string;
  variety: string | null;
  buyer_name: string;
  quantity: number;
  offered_price_per_kg: number;
  estimated_net_realization: number | null;
  net_realization_basis: string;
  status: string;
  created_at: string;
  expires_at: string | null;
  buyer_verified: boolean;
  payment_reliability: string;
  payment_history: { orders: number; successful_payments: number };
  counteroffer_history: Array<{
    buyer_name: string;
    quantity: number;
    offered_price_per_kg: number;
    status: string;
    created_at: string;
    expires_at: string | null;
  }>;
}

export interface FarmerDashboardData {
  profile: {
    user_id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    farm_name?: string | null;
    land_area_acres?: number | null;
    farming_details?: string | null;
    location: {
      village?: string | null;
      district?: string | null;
      state?: string | null;
      pincode?: string | null;
      latitude?: number | null;
      longitude?: number | null;
    };
    fpos: { id: number; name: string }[];
  };
  listings: FarmerListing[];
  offers: FarmerOffer[];
  orders: Array<{ id: number; listing_id: number; quantity: number; agreed_price_per_kg: number; status: string; payment_status?: string; shipment_status?: string; created_at: string }>;
  payments: Array<{ id: number; order_id: number; amount: number; currency: string; status: string; created_at: string }>;
  logistics: Array<{ id: number; order_id: number; status: string; scheduled_pickup_at?: string | null; last_latitude?: number | null; last_longitude?: number | null; last_location_at?: string | null }>;
  reviews: Array<{ id: number; order_id: number; reviewer_name: string; rating: number; comment?: string | null; created_at: string }>;
  notifications: Array<{ id: number; type: string; title: string; message: string; is_read: boolean; created_at: string }>;
}

export async function getFarmerDashboard(): Promise<FarmerDashboardData> {
  return authenticatedRequest<FarmerDashboardData>('/farmer/dashboard');
}

export async function getFarmerOffers(listingId?: number) {
  const query = listingId ? `?listing_id=${listingId}` : '';
  return authenticatedRequest<FarmerOffer[]>(`/farmer/offers${query}`);
}

export async function updateFarmerProfile(input: Record<string, unknown>) {
  return authenticatedRequest<{ profile: FarmerDashboardData['profile'] }>('/farmer/profile', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function createFarmerListing(input: Record<string, unknown>) {
  return authenticatedRequest<{ id: number; status: string }>('/farmer/listings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateFarmerListing(id: number, input: Record<string, unknown>) {
  return authenticatedRequest<{ id: number; status: string }>(`/farmer/listings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function cancelFarmerListing(id: number) {
  return authenticatedRequest<{ id: number; status: string }>(`/farmer/listings/${id}`, {
    method: 'DELETE',
  });
}

export async function getCropLots() {
  return authenticatedRequest<CropLot[]>('/farmer/lots');
}

export async function createCropLot(input: Record<string, unknown>) {
  return authenticatedRequest<{ id: number; lot_code: string; qr_payload: string; status: string }>('/farmer/lots', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateCropLot(id: number, input: Record<string, unknown>) {
  return authenticatedRequest<{ id: number; lot_code: string; qr_payload: string; status: string }>(`/farmer/lots/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function cancelCropLot(id: number) {
  return authenticatedRequest<{ id: number; lot_code: string; status: string }>(`/farmer/lots/${id}`, { method: 'DELETE' });
}

export async function decideFarmerOffer(
  id: number,
  action: 'ACCEPT' | 'REJECT' | 'COUNTER',
  values: { quantity_kg?: number; price_per_kg?: number; note?: string } = {},
) {
  return authenticatedRequest<{ id: number; status: string; order_id?: number }>(`/farmer/offers/${id}/decision`, {
    method: 'POST',
    body: JSON.stringify({ action, ...values }),
  });
}
