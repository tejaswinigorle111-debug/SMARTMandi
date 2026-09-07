import { authenticatedRequest } from './auth';

export interface BuyerDemandInput {
  commodity_name: string;
  quantity_kg: number;
  target_price_per_kg?: number | null;
  quality_requirements?: Record<string, unknown>;
  delivery_location?: string | null;
  delivery_from?: string | null;
  delivery_to?: string | null;
}

export interface DemandRecord extends BuyerDemandInput {
  id: number;
  status: string;
  buyer_name: string;
  created_at: string;
}

export async function createBuyerDemand(input: BuyerDemandInput) {
  return authenticatedRequest<{ id: number; status: string }>('/buyer/demands', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function listBuyerDemands(status = 'OPEN') {
  return authenticatedRequest<DemandRecord[]>(`/demands?status=${encodeURIComponent(status)}`);
}

export async function submitQualityInspection(listingId: number, input: {
  grade: 'A' | 'B' | 'C' | 'REJECTED';
  attributes?: Record<string, unknown>;
  evidence_urls?: string[];
  notes?: string;
}) {
  return authenticatedRequest<{ id: number; listing_id: number; grade: string }>(`/listings/${listingId}/quality-inspections`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function assignShipment(orderId: number, input: {
  vehicle_id?: number | null;
  driver_id?: number | null;
  scheduled_pickup_at?: string | null;
}) {
  return authenticatedRequest<{ id: number; order_id: number; status: string }>(`/orders/${orderId}/shipments`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function requestWarehouseBooking(input: {
  warehouse_id: number;
  quantity_kg: number;
  listing_id?: number | null;
  storage_rate_per_kg?: number;
  starts_on: string;
  ends_on?: string | null;
}) {
  return authenticatedRequest<{ id: number; status: string }>('/warehouses/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function transitionPayment(paymentId: number, input: {
  status: 'PAYMENT_INITIATED' | 'PAYMENT_CONFIRMED' | 'ESCROWED' | 'RELEASED' | 'FAILED' | 'REFUNDED';
  provider_reference?: string;
  note?: string;
}) {
  return authenticatedRequest<{ id: number; status: string }>(`/payments/${paymentId}/transition`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function openDispute(orderId: number, input: {
  category: string;
  description: string;
  evidence_urls?: string[];
}) {
  return authenticatedRequest<{ id: number; order_id: number; status: string }>(`/orders/${orderId}/disputes`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function resolveDispute(disputeId: number, input: {
  status: 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  resolution?: string;
}) {
  return authenticatedRequest<{ id: number; status: string }>(`/disputes/${disputeId}/decision`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getTransactionAudit(entityType: string, entityId: number) {
  return authenticatedRequest<Array<{
    id: number;
    event_type: string;
    actor_user_id?: string | null;
    from_status?: string | null;
    to_status?: string | null;
    metadata: Record<string, unknown>;
    created_at: string;
  }>>(`/audit/${encodeURIComponent(entityType)}/${entityId}`);
}

export async function recordFarmerProfit(orderId: number, input: {
  transport_cost?: number;
  storage_cost?: number;
  commission_cost?: number;
  wastage_cost?: number;
  other_cost?: number;
}) {
  return authenticatedRequest<{ id: number; order_id: number; gross_amount: number; net_amount: number }>(`/farmer/orders/${orderId}/profit`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function submitBuyerVerification(input: { document_type: string; document_reference?: string; document_url?: string }) {
  return authenticatedRequest<{ id: number; status: string }>('/buyer/verification-documents', { method: 'POST', body: JSON.stringify(input) });
}

export async function createPooledLot(input: { fpo_id: number; commodity_name: string; target_price_per_kg?: number | null; quality_grade?: string | null; members: Array<{ farmer_user_id: string; listing_id?: number | null; quantity_kg: number }> }) {
  return authenticatedRequest<{ id: number; total_quantity_kg: number; status: string }>('/fpo/lots', { method: 'POST', body: JSON.stringify(input) });
}

export async function getMarketMatches(commodity?: string) {
  return authenticatedRequest<Array<{ demand: Record<string, unknown>; matching_listings: Array<Record<string, unknown>> }>>(`/market-matches${commodity ? `?commodity=${encodeURIComponent(commodity)}` : ''}`);
}

export async function createMarketAlert(input: { commodity_name?: string; market_name?: string; target_price_per_kg?: number | null; alert_type: 'PRICE_TARGET' | 'RECOMMENDATION_CHANGE' | 'DEMAND_MATCH' | 'OFFER_RECEIVED' }) {
  return authenticatedRequest<{ id: number; status: string }>('/alerts', { method: 'POST', body: JSON.stringify(input) });
}

export async function getWarehouseCapacity(warehouseId?: number) {
  return authenticatedRequest<Array<{ id: number; name: string; capacity_kg: number; used_capacity_kg: number; available_capacity_kg: number; status: string }>>(`/warehouses/capacity${warehouseId ? `?warehouse_id=${warehouseId}` : ''}`);
}

export async function getWarehouseBookings(status = 'ALL') {
  return authenticatedRequest<Array<Record<string, unknown>>>(`/warehouses/bookings?status=${encodeURIComponent(status)}`);
}

export async function decideWarehouseBooking(id: number, status: 'CONFIRMED' | 'CANCELLED', approved_quantity_kg?: number) {
  return authenticatedRequest<{ id: number; status: string }>(`/warehouses/bookings/${id}/decision`, { method: 'POST', body: JSON.stringify({ status, approved_quantity_kg }) });
}

export async function receiveWarehouseInventory(input: { booking_id: number; commodity_name: string; quantity_kg: number; quality_grade?: string; storage_location?: string; expected_exit_date?: string }) {
  return authenticatedRequest<{ id: number; booking_id: number; status: string }>('/warehouses/inventory/receive', { method: 'POST', body: JSON.stringify(input) });
}

export async function moveWarehouseInventory(id: number, input: { quantity_kg: number; to_location?: string; reason?: string }) {
  return authenticatedRequest<{ id: number; status: string }>(`/warehouses/inventory/${id}/move`, { method: 'POST', body: JSON.stringify(input) });
}

export async function reportWarehouseSpoilage(id: number, input: { quantity_kg: number; reason: string }) {
  return authenticatedRequest<{ id: number; status: string; spoiled_quantity_kg: number }>(`/warehouses/inventory/${id}/spoilage`, { method: 'POST', body: JSON.stringify(input) });
}

export async function releaseWarehouseInventory(id: number, input: { quantity_kg: number; reason?: string }) {
  return authenticatedRequest<{ id: number; status: string; released_quantity_kg: number }>(`/warehouses/inventory/${id}/release`, { method: 'POST', body: JSON.stringify(input) });
}
