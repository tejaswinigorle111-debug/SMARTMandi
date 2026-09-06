import React from 'react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';
import { LineChart, Truck } from 'lucide-react';

interface PriceArrivalIntelligenceProps {
  results: CalculatedMarketResult[];
  language: Language;
}

export const PriceArrivalIntelligence: React.FC<PriceArrivalIntelligenceProps> = ({
  results,
  language,
}) => {
  const t = getTranslation(language);
  
  if (!results || results.length === 0) return null;
  const bestMarket = results.find((r) => r.isRecommended) || results[0];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-stone-300">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-black text-stone-950 font-display">
          {t.results.intelligenceTitle || 'Price & Arrival Intelligence'}
        </h3>
        <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {t.results.sampleDataLabel || 'Sample Data'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MARKET PRICE */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <LineChart className="w-5 h-5 text-indigo-600" />
            <h4 className="font-bold text-stone-800 uppercase tracking-wide text-sm">
              {t.results.marketPriceLabel || 'Market Price'}
            </h4>
          </div>
          <div className="space-y-1">
            <p className="text-stone-500 text-sm font-semibold">{bestMarket.name}</p>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-black text-stone-900">
                ₹{bestMarket.pricePerKg}
              </span>
              <span className="text-sm font-bold text-stone-500 mb-1">
                {t.results.perKg}
              </span>
            </div>
            <p className="text-xs text-stone-400 font-bold mt-1">
              {t.results.modalPriceLabel}
            </p>
          </div>
        </div>

        {/* MARKET ARRIVAL */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h4 className="font-bold text-stone-800 uppercase tracking-wide text-sm">
              {t.results.marketArrivalLabel}
            </h4>
          </div>
          <div className="space-y-1">
            <p className="text-stone-500 text-sm font-semibold">{bestMarket.name}</p>
            
            {bestMarket.arrivalQuantity !== undefined && bestMarket.arrivalQuantity !== null ? (
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-stone-900">
                  {bestMarket.arrivalQuantity}
                </span>
                <span className="text-sm font-bold text-stone-500 mb-1">
                  {t.results.tonnesUnit}
                </span>
              </div>
            ) : (
              <div className="py-2">
                <span className="text-sm font-bold text-stone-400 italic">
                  {t.results.arrivalUnavailable || 'Arrival data unavailable'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
