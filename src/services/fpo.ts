import { authenticatedRequest } from './auth';

export interface FpoRecord { id: number; name: string; registration_number: string | null; }
export interface FarmerRecord { farmer_user_id: string; farmer_name: string; email: string | null; phone: string | null; }
export interface FpoMember extends FarmerRecord { joined_at: string; }
export interface FpoListing { listing_id: number; crop: string; variety: string | null; quantity: number; unit: string; status: string; }
export interface PooledLotRecord { lot_id: number; fpo_name: string; commodity: string; total_quantity_kg: number; target_price_per_kg: number | null; quality_standard: string; quality_grade: string | null; status: string; created_at: string; }
export interface PublicPooledLot { id: number; fpo_name: string; commodity: string; total_quantity_kg: number; target_price_per_kg: number | null; quality_grade: string | null; status: string; created_at: string; }

export function getFpos() { return authenticatedRequest<FpoRecord[]>('/fpos'); }
export function getAvailableFarmers() { return authenticatedRequest<FarmerRecord[]>('/fpos/farmers'); }
export function getFpoMembers(fpoId: number) { return authenticatedRequest<FpoMember[]>(`/fpos/${fpoId}/members`); }
export function addFpoMember(fpoId: number, farmerUserId: string) { return authenticatedRequest<{ fpo_id: number; farmer_user_id: string; status: string }>(`/fpos/${fpoId}/members`, { method: 'POST', body: JSON.stringify({ farmer_user_id: farmerUserId }) }); }
export function removeFpoMember(fpoId: number, farmerUserId: string) { return authenticatedRequest<{ status: string }>(`/fpos/${fpoId}/members/${farmerUserId}`, { method: 'DELETE' }); }
export function getFpoMemberListings(fpoId: number, farmerUserId: string) { return authenticatedRequest<FpoListing[]>(`/fpos/${fpoId}/members/${farmerUserId}/listings`); }
export function createFpoLot(fpoId: number, input: Record<string, unknown>) { return authenticatedRequest<{ id: number; status: string; total_quantity_kg: number }>(`/fpos/${fpoId}/lots`, { method: 'POST', body: JSON.stringify(input) }); }
export function getFpoLots() { return authenticatedRequest<PooledLotRecord[]>('/fpos/lots'); }
export function reviewFpoLotQuality(lotId: number, input: { quality_grade: string; quality_standard: string; notes?: string }) { return authenticatedRequest<{ id: number; quality_grade: string }>(`/fpos/lots/${lotId}/quality`, { method: 'POST', body: JSON.stringify(input) }); }
export function getFpoLotOffers(lotId: number) { return authenticatedRequest<Array<{ offer_id: number; buyer_name: string; quantity_kg: number; offered_price_per_kg: number; status: string; expires_at: string | null; created_at: string }>>(`/fpos/lots/${lotId}/offers`); }
export function decideFpoOffer(offerId: number, status: 'ACCEPTED' | 'REJECTED') { return authenticatedRequest<{ offer_id: number; status: string }>(`/fpos/offers/${offerId}/decision`, { method: 'POST', body: JSON.stringify({ status }) }); }
export function calculateFpoSettlements(offerId: number) { return authenticatedRequest<{ offer_id: number; lot_id: number; settlements: Array<{ farmer_user_id: string; contributed_quantity_kg: number; settlement_amount: number }> }>(`/fpos/offers/${offerId}/settlements`, { method: 'POST' }); }
export function submitBulkOffer(lotId: number, offeredPricePerKg: number, expiresAt?: string) { return authenticatedRequest<{ id: number; lot_id: number; status: string }>(`/fpos/lots/${lotId}/offers`, { method: 'POST', body: JSON.stringify({ offered_price_per_kg: offeredPricePerKg, expires_at: expiresAt || null }) }); }
export function getPublicPooledLots() { return authenticatedRequest<PublicPooledLot[]>('/pooled-lots'); }
