import React from 'react';
import { Store } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MarketComparisonProps {
  results: CalculatedMarketResult[];
  language: Language;
}

export const MarketComparison: React.FC<MarketComparisonProps> = ({
  results,
  language,
}) => {
  const t = getTranslation(language);
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-stone-300" id="market-comparison-card">
      <div className="mb-5">
        <h3 className="text-2xl font-black text-stone-950 font-display">
          Market Comparison
        </h3>
        <p className="text-stone-700 text-sm sm:text-base font-bold mt-1">
          Mandis compared using estimated net return, price, distance and transport cost.
        </p>
        <p className="text-stone-600 text-xs sm:text-sm font-semibold mt-1">
          Overall recommendation is based on Smart Market Score, not net return alone.
        </p>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b-2 border-stone-300 bg-stone-100 text-stone-900 text-sm font-black">
              <th className="py-3.5 px-4 rounded-l-xl">Mandi Yard</th>
              <th className="py-3.5 px-4 text-center">Mandi Rate</th>
              <th className="py-3.5 px-4 text-center">Distance</th>
              <th className="py-3.5 px-4 text-right">Transport Cost</th>
              <th className="py-3.5 px-4 text-right">Gross Income<br /><span className="text-xs font-bold text-stone-600">(Price × Qty)</span></th>
              <th className="py-3.5 px-4 text-right rounded-r-xl">Estimated Net Return<br /><span className="text-xs font-bold text-stone-600">(Gross - Transport)</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 text-sm sm:text-base">
            {results.map((m) => {
              const isBest = m.isRecommended;

              return (
                <tr
                  key={m.id}
                  className={`transition-colors ${
                    isBest
                      ? 'bg-[#E5F5E9] font-bold text-stone-950 border-l-4 border-l-[#165B33]'
                      : 'hover:bg-stone-50 text-stone-900'
                  }`}
                >
                  {/* Market Column */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isBest ? 'bg-[#165B33] text-white shadow-2xs' : 'bg-stone-200 text-stone-700'}`}>
                        <Store className="w-5 h-5 shrink-0" />
                      </div>
                      <div>
                        <span className={`font-black text-base block ${isBest ? 'text-[#165B33]' : 'text-stone-950'}`}>
                          {m.name}
                        </span>
                        <span className="text-xs text-stone-600 font-bold">
                          {m.location}, {m.district}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price/kg */}
                  <td className="py-4 px-4 text-center font-extrabold text-base">
                    <span className={isBest ? 'text-[#165B33]' : 'text-stone-950'}>
                      ₹{m.pricePerKg} /kg
                    </span>
                  </td>

                  {/* Distance */}
                  <td className="py-4 px-4 text-center font-bold text-stone-800">
                    {m.distanceKm} km
                  </td>

                  {/* Transport Cost */}
                  <td className="py-4 px-4 text-right font-extrabold text-stone-800 whitespace-nowrap">
                    {formatINR(m.transportCost)}
                  </td>

                  {/* Gross Income */}
                  <td className="py-4 px-4 text-right font-extrabold text-stone-800 whitespace-nowrap">
                    {formatINR(m.grossIncome)}
                  </td>

                  {/* Net Return */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className={`font-black ${isBest ? 'text-[#165B33] text-lg sm:text-xl' : 'text-stone-950 text-base sm:text-lg'}`}>
                        {formatINR(m.netReturn)}
                      </span>
                      {isBest && (
                        <span className="bg-[#165B33] text-white text-xs font-black px-2.5 py-1 rounded-full shadow-2xs">
                          Best
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t-2 border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-bold text-stone-600">
        <p>{t.results.sampleNotice}</p>
        <p>{t.results.recommendationBasis}</p>
      </div>
    </div>
  );
};
