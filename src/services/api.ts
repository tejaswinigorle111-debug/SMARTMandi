import { CropType, MandiMarket, FarmerInputData, CalculatedMarketResult } from '../types';
import { demoMarkets } from '../data/demoMarkets';

/**
 * Service layer prepared for future FastAPI REST API integration.
 * Current implementation uses local calculation engine over sample APMC/Mandi data.
 *
 * Future endpoints:
 * GET  /api/v1/markets?crop={crop}&location={location}
 * POST /api/v1/recommend (body: { crop, quantity, location, latitude, longitude })
 */

// Simulated API base URL for FastAPI backend
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

/**
 * Placeholder for GET /markets
 * Fetches available markets and current prices for a crop
 */
export async function fetchMarkets(crop?: CropType, location?: string): Promise<MandiMarket[]> {
  try {
    // In production:
    // const res = await fetch(`${API_BASE_URL}/markets?crop=${crop || ''}&location=${encodeURIComponent(location || '')}`);
    // if (!res.ok) throw new Error('Failed to fetch markets from FastAPI backend');
    // return await res.json();
    
    // Prototype fallback:
    return demoMarkets;
  } catch (error) {
    console.warn('FastAPI backend not active. Using demo market repository.', error);
    return demoMarkets;
  }
}

/**
 * Dynamic calculation engine that computes gross income, estimated transport costs,
 * and net returns for all candidate markets, selecting the winner based on highest Net Return.
 *
 * Formula:
 * Gross Income = Price per kg * Quantity
 * Net Return = Gross Income - Estimated Transport Cost
 */
export function calculateMarketOptions(
  data: FarmerInputData,
  markets: MandiMarket[] = demoMarkets
): CalculatedMarketResult[] {
  const { crop, quantity } = data;
  if (!quantity || quantity <= 0) return [];

  // Determine weight tonnage factor to scale transport cost realistically
  // Small loads (<500kg) use auto/small pickup, 500-2000kg mini-truck, >2000kg tractor/medium truck
  const weightTons = quantity / 1000;
  const weightMultiplier = Math.max(0.8, Math.min(3.5, 0.7 + weightTons * 0.3));

  const calculated: CalculatedMarketResult[] = markets.map((market) => {
    const pricePerKg = market.cropPrices[crop] || 25;
    const grossIncome = Math.round(pricePerKg * quantity);

    // Estimated transport cost = base handling fee + (distance * perKmRate * weightMultiplier)
    // Rounded to nearest 50 rupees for realistic freight estimates
    const rawTransport = market.baseTransportFee + (market.distanceKm * market.ratePerKm * weightMultiplier);
    const transportCost = Math.round(rawTransport / 50) * 50;

    const netReturn = grossIncome - transportCost;

    return {
      id: market.id,
      name: market.name,
      location: market.location,
      district: market.district,
      state: market.state,
      pricePerKg,
      distanceKm: market.distanceKm,
      transportCost,
      grossIncome,
      netReturn,
      isRecommended: false,
      marketType: market.marketType,
    };
  });

  // Sort descending by Net Return
  calculated.sort((a, b) => b.netReturn - a.netReturn);

  // Mark the market with the highest net return as the winner
  if (calculated.length > 0) {
    const best = calculated[0];
    best.isRecommended = true;

    // Find highest price market for contrast explanation
    const highestPriceMarket = [...calculated].sort((a, b) => b.pricePerKg - a.pricePerKg)[0];

    if (highestPriceMarket.id !== best.id) {
      const netGain = best.netReturn - highestPriceMarket.netReturn;
      best.whyRecommended = `This market provides the highest estimated net return of ₹${best.netReturn.toLocaleString('en-IN')} after considering transportation cost. Even though ${highestPriceMarket.name} offers a higher raw price (₹${highestPriceMarket.pricePerKg}/kg), its extra distance and transport cost (-₹${highestPriceMarket.transportCost.toLocaleString('en-IN')}) would reduce your actual earnings by ₹${netGain.toLocaleString('en-IN')}.`;
    } else {
      best.whyRecommended = `This market provides the highest estimated net return of ₹${best.netReturn.toLocaleString('en-IN')} with favorable distance (${best.distanceKm} km) and competitive pricing (₹${best.pricePerKg}/kg).`;
    }
  }

  return calculated;
}

/**
 * Placeholder for POST /recommend
 * Communicates with the future FastAPI Recommendation Engine
 */
export async function getRecommendation(data: FarmerInputData): Promise<{
  recommended: CalculatedMarketResult | null;
  all: CalculatedMarketResult[];
}> {
  try {
    // In production:
    // const res = await fetch(`${API_BASE_URL}/recommend`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return await res.json();

    const results = calculateMarketOptions(data, demoMarkets);
    const recommended = results.find((r) => r.isRecommended) || results[0] || null;

    return {
      recommended,
      all: results,
    };
  } catch (error) {
    console.warn('Falling back to internal recommendation logic', error);
    const results = calculateMarketOptions(data, demoMarkets);
    return {
      recommended: results[0] || null,
      all: results,
    };
  }
}
