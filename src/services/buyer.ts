import { authenticatedRequest } from './auth';

export interface BuyerListing {
  id: number;
  crop: string;
  variety?: string | null;
  quantity: number;
  unit: string;
  expected_harvest_date?: string | null;
  quality?: string | null;
  expected_price?: number | null;
  preferred_market?: string | null;
  farmer_name: string;
  fpo_name?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  distance_km?: number | null;
  status: string;
  created_at?: string | null;
}

export interface BuyerListingFilters {
  query?: string;
  crop?: string;
  location?: string;
  min_price?: string;
  max_price?: string;
  min_quantity?: string;
  max_quantity?: string;
  quality?: string;
  harvest_from?: string;
  harvest_to?: string;
  max_distance_km?: string;
  latitude?: number;
  longitude?: number;
  page?: number;
  page_size?: number;
}

export interface BuyerOrders {
  items: Array<{ id: number; listing_id: number; crop: string; quantity: number; agreed_price_per_kg: number; status: string; created_at: string; payment_status?: string; shipment_status?: string }>;
}

function queryString(filters: BuyerListingFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== '') params.set(key, String(value));
  });
  return params.toString();
}

export async function searchBuyerListings(filters: BuyerListingFilters) {
  const query = queryString(filters);
  return authenticatedRequest<{ items: BuyerListing[]; page: number; page_size: number; total: number; has_next: boolean }>(`/buyer/listings${query ? `?${query}` : ''}`);
}

export async function makeOffer(listingId: number, quantity: number, offeredPricePerKg: number, expiresAt?: string) {
  return authenticatedRequest<{ id: number; listing_id: number; status: string; expires_at: string | null }>(`/buyer/listings/${listingId}/offers`, { method: 'POST', body: JSON.stringify({ quantity, offered_price_per_kg: offeredPricePerKg, expires_at: expiresAt || null }) });
}

export async function createBuyerOrder(listingId: number, quantity: number, agreedPricePerKg: number) {
  return authenticatedRequest<{ id: number; status: string; payment_status: string }>(`/buyer/listings/${listingId}/orders`, { method: 'POST', body: JSON.stringify({ quantity, agreed_price_per_kg: agreedPricePerKg }) });
}

export async function getBuyerOrders() {
  return authenticatedRequest<BuyerOrders>('/buyer/orders');
}

export async function getBuyerTracking(orderId: number) {
  return authenticatedRequest<{ order_id: number; status: string; shipment: Record<string, unknown> | null }>(`/buyer/orders/${orderId}/tracking`);
}

export async function reviewBuyerOrder(orderId: number, rating: number, comment: string) {
  return authenticatedRequest<{ id: number; order_id: number; rating: number }>(`/buyer/orders/${orderId}/reviews`, { method: 'POST', body: JSON.stringify({ rating, comment }) });
}
