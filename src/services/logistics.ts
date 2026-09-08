import { authenticatedRequest } from './auth';

export interface LogisticsOptions {
  warehouses: Array<{ id: number; name: string; capacity_kg: number; storage_rate_per_kg: number; used_capacity_kg: number; available_capacity_kg: number; status: string }>;
  vehicles: Array<{ id: number; name: string; vehicle_type: string; capacity_kg: number; is_available: boolean; provider_name: string }>;
  drivers: Array<{ id: number; name: string; phone: string | null; is_available: boolean; provider_name: string }>;
  orders: Array<{ id: number; name: string; crop: string; farmer_name: string; buyer_name: string; status: string }>;
}

export interface LogisticsShipment {
  shipment_id: number; order_id: number; crop: string; farmer_name: string; buyer_name: string;
  vehicle_name: string | null; driver_name: string | null; status: string;
  scheduled_pickup_at: string | null; picked_up_at: string | null; delivered_at: string | null;
  transport_rate_per_kg: number | null;
}

export interface LogisticsInventory {
  inventory_id: number; warehouse_name: string; crop: string; quantity_kg: number;
  spoiled_quantity_kg: number; storage_location: string | null; status: string;
  booking_status: string | null; farmer_name: string | null; expected_exit_date: string | null;
}

export function getLogisticsOptions() { return authenticatedRequest<LogisticsOptions>('/logistics/options'); }
export function getLogisticsShipments(status = 'ALL') { return authenticatedRequest<LogisticsShipment[]>(`/logistics/shipments?status=${encodeURIComponent(status)}`); }
export function getLogisticsInventory() { return authenticatedRequest<LogisticsInventory[]>('/logistics/inventory'); }
export function getDeliveryTimeline(orderId: number) { return authenticatedRequest<{ order_id: number; crop: string; farmer_name: string; buyer_name: string; shipment_status: string | null; scheduled_pickup_at: string | null; picked_up_at: string | null; delivered_at: string | null; events: Array<{ event_type: string; status: string | null; created_at: string }> }>(`/logistics/timeline/${orderId}`); }
