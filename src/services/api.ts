import {
  CropType,
  FarmerInputData,
  CalculatedMarketResult,
  MarketPriceRecord,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
  const response = await fetch(`${API_BASE_URL}/location/reverse?${query}`);
  if (!response.ok) throw new Error('Unable to resolve GPS location');
  const result = await response.json();
  return result.name || 'GPS location';
}

/**
 * Get markets from the FastAPI backend.
 */
export async function fetchMarkets(
  crop?: CropType,
  location?: string
): Promise<MarketPriceRecord[]> {
  const query = crop ? `?crop=${encodeURIComponent(crop)}` : '';
  const response = await fetch(`${API_BASE_URL}/markets${query}`);

  if (!response.ok) {
    throw new Error('Failed to fetch markets');
  }

  const data = await response.json();

  return data.markets || [];
}


/**
 * Send farmer details to FastAPI and get
 * the recommended market.
 */
export async function getRecommendation(
  data: FarmerInputData
): Promise<{
  recommended: CalculatedMarketResult | null;
  all: CalculatedMarketResult[];
}> {

  const response = await fetch(`${API_BASE_URL}/recommend`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      crop: data.crop,
      quantity: data.quantity,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get recommendation from FastAPI');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'No markets found');
  }

  /*
   * Convert FastAPI's response format
   * into the format already used by your frontend.
   */
  const allResults: CalculatedMarketResult[] =
    result.all_markets.map((market: any, index: number) => ({
      id: String(index + 1),
      name: market.market,
      location: market.location,
      district: '',
      state: 'Maharashtra',

      pricePerKg: market.price_per_kg,
      distanceKm: market.distance_km,
      transportCost: market.estimated_transport_cost,
      grossIncome: market.gross_income,
      netReturn: market.net_return,

      isRecommended:
        market.market === result.recommended_market.market,

      marketType: 'Market',

      whyRecommended:
        market.market === result.recommended_market.market
          ? result.recommended_market.smart_market_explanation || `This market is recommended because it provides the highest estimated net return after considering transportation cost.`
          : undefined,

      smartMarketScore: market.smart_market_score,
      arrivalQuantity: market.arrival_quantity !== undefined ? market.arrival_quantity : null,
      scoreBreakdown: market.score_breakdown
        ? {
            netReturnScore: market.score_breakdown.net_return_score,
            priceScore: market.score_breakdown.price_score,
            distanceScore: market.score_breakdown.distance_score,
            transportScore: market.score_breakdown.transport_score,
          }
        : undefined,
    }));

  const recommended =
    allResults.find((market) => market.isRecommended) || null;

  return {
    recommended,
    all: allResults,
  };
}