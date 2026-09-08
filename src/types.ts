export type CropType =
  | 'Tomato' | 'Rice' | 'Cotton' | 'Chilli' | 'Maize' | 'Onion' | 'Potato' | 'Soybean' | 'Wheat' | 'Groundnut'
  | 'Tur' | 'Gram' | 'Grapes' | 'Mango' | 'Banana' | 'Turmeric' | 'Sugarcane' | 'Jowar' | 'Bajra' | 'Ragi'
  | 'Barley' | 'Mustard' | 'Sunflower' | 'Sesame' | 'Moong' | 'Urad' | 'Masoor' | 'Cabbage' | 'Cauliflower'
  | 'Brinjal' | 'Okra' | 'Carrot' | 'Garlic' | 'Ginger' | 'Apple' | 'Orange';

export type Language = 'en' | 'te' | 'hi' | 'mr';

export type CropCategory = 'all' | 'vegetables' | 'fruits' | 'cereals' | 'pulses' | 'oilseeds' | 'commercial';

export interface MandiMarket {
  id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  cropPrices: Partial<Record<CropType, number>>;
  distanceKm: number; // approximate base distance from reference center
  baseTransportFee: number;
  ratePerKm: number;
  marketType: string;
  tradingHours: string;
}

export interface MarketPriceRecord {
  id: string | number;
  name: string;
  location: string;
  crop?: string;
  commodity?: string;
  market?: string;
  state?: string;
  district?: string;
  date?: string | null;
  minimum_price?: number | null;
  maximum_price?: number | null;
  modal_price?: number | null;
  arrival_quantity?: number | null;
  unit?: string;
  source?: string | null;
  last_updated?: string | null;
  data_state?: 'live' | 'cached' | 'unavailable';
  price_per_kg?: number;
  cropPrices?: Partial<Record<CropType, number>>;
}

export interface FarmerInputData {
  crop: CropType;
  quantity: number;
  location: string;
  latitude?: number;
  longitude?: number;
}

export interface CalculatedMarketResult {
  id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  pricePerKg: number;
  distanceKm: number;
  transportCost: number;
  grossIncome: number;
  netReturn: number;
  isRecommended: boolean;
  whyRecommended?: string;
  marketType: string;
  arrivalQuantity?: number | null;
  smartMarketScore?: number;
  scoreBreakdown?: {
    netReturnScore: number;
    priceScore: number;
    distanceScore: number;
    transportScore: number;
  };
  dataState?: 'live' | 'cached';
  source?: string;
  lastUpdated?: string | null;
  straightLineDistanceKm?: number | null;
  roadDistanceKm?: number | null;
  distanceType?: 'straight-line' | 'road';
  directionsUrl?: string | null;
  crop?: string;
  minimumPrice?: number | null;
  maximumPrice?: number | null;
  modalPrice?: number | null;
  priceUnit?: string;
  storageCost?: number;
  platformFee?: number;
  otherCost?: number;
  netRealization?: number;
  calculationState?: 'estimated';
  comparisonExplanation?: string;
}

export interface MarketIntelligence {
  status: 'available' | 'insufficient_data';
  summary: string;
  recommendation: string;
  recommendation_type: 'sell_now' | 'hold' | 'monitor' | 'insufficient_data';
  uncertainty: string;
  insights: string[];
  data_availability: Record<string, 'available' | 'insufficient' | 'unavailable'>;
  metrics?: {
    history_available: boolean;
    trend_direction: 'rising' | 'falling' | 'stable' | 'unavailable';
    change_percent_30d: number | null;
    average_price_30d: number | null;
    volatility_percent: number | null;
    freshness_days: number | null;
    latest_arrival_quantity: number | null;
  };
  price_history?: {
    '7d': Array<{ date: string; price_per_kg: number }>;
    '30d': Array<{ date: string; price_per_kg: number }>;
  };
}

export interface CropHistoricalTrend {
  days: string[];
  prices: number[];
  averagePrice: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export type BuyerType = 'Wholesaler' | 'Retailer' | 'Processor' | 'Exporter' | 'Other';

export type QuantityUnit = 'kg' | 'quintal' | 'tonne';

export type BuyingFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'As Needed';

export interface BuyerRegistrationFormData {
  fullName: string;
  businessName: string;
  buyerType: BuyerType | '';
  mobileNumber: string;
  email: string;
  state: string;
  district: string;
  marketArea: string;
  businessAddress: string;
  preferredCrops: string[];
  minQuantity: string;
  maxQuantity: string;
  quantityUnit: QuantityUnit;
  minPrice: string;
  maxPrice: string;
  buyingFrequency: BuyingFrequency | '';
}

export interface SmartDealEvaluation {
  score: number;
  evaluation_id: string;
  factors: Record<string, string>;
}

export interface BuyerRegistrationRequest {
  id: number;
  full_name: string;
  business_name: string;
  buyer_type: BuyerType;
  mobile_number: string;
  email: string | null;
  state: string;
  district: string;
  market_area: string;
  business_address: string;
  preferred_crops: string[];
  min_quantity: number;
  max_quantity: number;
  quantity_unit: QuantityUnit;
  min_price: number;
  max_price: number;
  buying_frequency: BuyingFrequency;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONTACTED';
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyerRegistrationRequestsResponse {
  items: BuyerRegistrationRequest[];
  page: number;
  page_size: number;
  total: number;
  has_next: boolean;
}
