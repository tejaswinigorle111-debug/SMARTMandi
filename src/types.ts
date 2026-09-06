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
}

export interface CropHistoricalTrend {
  days: string[];
  prices: number[];
  averagePrice: number;
  trendDirection: 'up' | 'down' | 'stable';
}
