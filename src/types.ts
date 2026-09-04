export type CropType = 'Tomato' | 'Rice' | 'Cotton' | 'Chilli' | 'Maize';

export type Language = 'en' | 'mr';

export interface MandiMarket {
  id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  cropPrices: Record<CropType, number>;
  distanceKm: number; // approximate base distance from reference center
  baseTransportFee: number;
  ratePerKm: number;
  marketType: string;
  tradingHours: string;
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
}

export interface CropHistoricalTrend {
  days: string[];
  prices: number[];
  averagePrice: number;
  trendDirection: 'up' | 'down' | 'stable';
}
