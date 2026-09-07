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
<<<<<<< HEAD
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
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
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
<<<<<<< HEAD
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
  recommendation_type: 'sell_now' | 'monitor' | 'insufficient_data';
  uncertainty: string;
  insights: string[];
  data_availability: Record<string, 'available' | 'insufficient' | 'unavailable'>;
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
}

export interface CropHistoricalTrend {
  days: string[];
  prices: number[];
  averagePrice: number;
  trendDirection: 'up' | 'down' | 'stable';
}
