import {
  CropType,
  FarmerInputData,
  CalculatedMarketResult,
  MarketPriceRecord,
  MarketIntelligence,
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export interface MarketDataResponse {
  records: MarketPriceRecord[];
  source: string | null;
  data_state: 'live' | 'cached' | 'unavailable';
  last_updated: string | null;
  message?: string | null;
}
export async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const query = new URLSearchParams({ latitude: String(latitude), longitude: String(longitude) });
  const response = await fetch(`${API_BASE_URL}/location/reverse?${query}`);
  if (!response.ok) throw new Error('Unable to resolve GPS location');
  const result = await response.json();
  return result.name || 'GPS location';
}

export async function resolveLocation(input: {
  address?: string;
  pincode?: string;
  district?: string;
  state?: string;
}): Promise<{ latitude: number; longitude: number; display_name?: string; provider?: string }> {
  const query = new URLSearchParams();
  Object.entries(input).forEach(([key, value]) => { if (value?.trim()) query.set(key, value.trim()); });
  const response = await fetch(`${API_BASE_URL}/location/resolve?${query}`);
  if (!response.ok) throw new Error('Location could not be resolved');
  return response.json();
}

export async function calculateDistance(
  latitude1: number,
  longitude1: number,
  latitude2: number,
  longitude2: number
): Promise<number> {
  const query = new URLSearchParams({
    latitude1: String(latitude1),
    longitude1: String(longitude1),
    latitude2: String(latitude2),
    longitude2: String(longitude2),
  });
  const response = await fetch(`${API_BASE_URL}/location/distance?${query}`);
  if (!response.ok) throw new Error('Unable to calculate distance');
  const result = await response.json();
  return result.straight_line_distance_km;
}

/**
 * Get markets from the FastAPI backend.
 */
export async function fetchMarkets(
  crop?: CropType,
  location?: string
): Promise<MarketPriceRecord[]> {
  const result = await getMarketPrices(crop, location);
  return result.records;
}

export async function getMarketPrices(
  crop?: CropType,
  location?: string
): Promise<MarketDataResponse> {
  try {
    const query = crop ? `?crop=${encodeURIComponent(crop)}` : '';
    const response = await fetch(`${API_BASE_URL}/markets${query}`);
    if (response.ok) {
      const data = await response.json();
      return {
        records: data.markets || [],
        source: data.source || null,
        data_state: data.data_state || 'unavailable',
        last_updated: data.last_updated || null,
        message: data.message || null,
      };
    }
  } catch (err) {
    console.warn('Live market data is unavailable.', err);
  }
  return {
    records: [],
    source: null,
    data_state: 'unavailable',
    last_updated: null,
    message: 'Live market data is temporarily unavailable.',
  };
}

/**
 * Send farmer details to FastAPI and get
 * the recommended market from live government market data.
 */
export async function getRecommendation(
  data: FarmerInputData
): Promise<{
  recommended: CalculatedMarketResult | null;
  all: CalculatedMarketResult[];
  intelligence?: MarketIntelligence;
}> {
  try {
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

    if (response.ok) {
      const result = await response.json();
      if (result.success && result.all_markets && result.all_markets.length > 0) {
        const allResults: CalculatedMarketResult[] = result.all_markets.map(
          (market: any, index: number) => ({
            id: String(market.id || index + 1),
            name: market.market || market.name,
            location: market.location,
            district: market.district || '',
            state: market.state || 'Regional Mandi',
            pricePerKg: market.price_per_kg,
            distanceKm: market.distance_km,
            transportCost:
              market.estimated_transport_cost ?? market.transport_cost ?? 0,
            grossIncome: market.gross_income,
            netReturn: market.net_return ?? market.net_realization ?? 0,
            isRecommended:
              (market.market || market.name) ===
              (result.recommended_market.market || result.recommended_market.name),
            marketType: 'APMC Yard',
            whyRecommended:
              (market.market || market.name) ===
              (result.recommended_market.market || result.recommended_market.name)
                ? result.recommended_market.smart_market_explanation ||
                  market.comparison_explanation ||
                  `This market provides the highest estimated net return after considering transportation cost.`
                : undefined,
            smartMarketScore: market.smart_market_score,
            arrivalQuantity:
              market.arrival_quantity !== undefined ? market.arrival_quantity : null,
            scoreBreakdown: market.score_breakdown
              ? {
                  netReturnScore: market.score_breakdown.net_return_score,
                  priceScore: market.score_breakdown.price_score,
                  distanceScore: market.score_breakdown.distance_score,
                  transportScore: market.score_breakdown.transport_score,
                }
              : undefined,
            dataState: market.data_state || result.data_state,
            source: market.source || result.source,
            lastUpdated: market.last_updated || market.date || result.last_updated,
            straightLineDistanceKm: market.straight_line_distance_km,
            roadDistanceKm: market.road_distance_km,
            distanceType: market.distance_type,
            directionsUrl: market.directions_url,
            crop: market.crop || market.commodity,
            minimumPrice: market.minimum_price,
            maximumPrice: market.maximum_price,
            modalPrice: market.modal_price,
            priceUnit: market.unit,
            storageCost: market.storage_cost,
            platformFee: market.platform_fee,
            otherCost: market.other_cost,
            netRealization: market.net_realization ?? market.net_return,
            calculationState: market.calculation_state,
            comparisonExplanation: market.comparison_explanation,
          })
        );

        const recommended = allResults.find((m) => m.isRecommended) || allResults[0];
        return { recommended, all: allResults, intelligence: result.intelligence };
      }

      throw new Error(
        result.message ||
          'No fresh nearby market prices were found for this crop and location.'
      );
    }

    const errorBody = await response.json().catch(() => ({}));
    throw new Error(
      errorBody.detail ||
        errorBody.message ||
        `Market recommendation failed (${response.status}).`
    );
  } catch (e) {
    console.warn('Live market recommendation is unavailable.', e);
    if (e instanceof Error) throw e;
    throw new Error('Unable to load market recommendations.');
  }
}