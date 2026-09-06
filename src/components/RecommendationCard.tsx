import React from 'react';
import { Trophy, ChevronRight, Info, Lightbulb } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface RecommendationCardProps {
  market: CalculatedMarketResult;
  quantity: number;
  cropName: string;
  language: Language;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  market,
  quantity,
  cropName,
  language,
}) => {
  const t = getTranslation(language);
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  return (
    <div className="space-y-5" id="recommended-market-container">
      {/* Recommended Market Card */}
      <div
        className="bg-[#F7FBF8] rounded-2xl p-6 border-2 border-[#82C394] shadow-sm relative"
        id="recommended-market-card"
      >
        {/* Header with Trophy Badge and Chevron */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#165B33] flex items-center justify-center text-white shadow-2xs">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <span className="text-base font-black text-[#165B33] uppercase tracking-wide">
              {t.results?.bestOptionBadge || 'BEST OPTION'}
            </span>
          </div>
          <ChevronRight className="w-6 h-6 text-[#165B33]" />
        </div>

        {/* Mandi Name & Distance */}
        <div className="mt-4">
          <h3 className="text-2xl sm:text-3xl font-black text-stone-950 font-display">
            {market.name}
          </h3>
          <p className="text-sm font-bold text-stone-700 mt-1.5 flex items-center gap-1">
            <span>📍</span> {market.distanceKm} km away from your origin
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[#D2E7D8] my-4" />

        {/* Score Section */}
        {market.smartMarketScore !== undefined && (
          <div className="mb-4 bg-emerald-50 rounded-xl p-4 border border-[#82C394]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-stone-900 text-lg uppercase tracking-wide">
                {t.results?.smartScoreLabel || 'Smart Market Score:'}
              </span>
              <span className="text-2xl font-black text-[#165B33]">
                {market.smartMarketScore}/100
              </span>
            </div>
            
            {market.scoreBreakdown && (
              <div className="mt-3">
                <h5 className="text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                  {t.results?.scoreBreakdownLabel || 'Score Breakdown'}
                </h5>
                <div className="grid grid-cols-2 gap-2 text-sm font-bold text-stone-700">
                  <div className="flex justify-between">
                    <span>Net Return:</span>
                    <span className="text-[#165B33]">{market.scoreBreakdown.netReturnScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="text-[#165B33]">{market.scoreBreakdown.priceScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance:</span>
                    <span className="text-[#165B33]">{market.scoreBreakdown.distanceScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transport:</span>
                    <span className="text-[#165B33]">{market.scoreBreakdown.transportScore}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Key Metrics Breakdown */}
        <div className="space-y-3 text-base">
          <div className="flex items-center justify-between text-stone-800">
            <span className="font-bold">Mandi Modal Price / kg</span>
            <span className="font-extrabold text-stone-950 text-lg">₹{market.pricePerKg}</span>
          </div>
          <div className="flex items-center justify-between text-stone-800">
            <span className="font-bold">Transport / Freight Cost</span>
            <span className="font-extrabold text-stone-950 text-lg">{formatINR(market.transportCost)}</span>
          </div>
          <div className="flex items-center justify-between text-stone-800">
            <span className="font-bold">Gross Sale Value</span>
            <span className="font-extrabold text-stone-950 text-lg">{formatINR(market.grossIncome)}</span>
          </div>
          <div className="flex items-baseline justify-between pt-2 border-t border-[#D2E7D8]">
            <span className="font-black text-stone-950 text-base">Estimated Net Return</span>
            <span className="text-3xl sm:text-4xl font-black text-[#165B33]">
              {formatINR(market.netReturn)}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-[#D2E7D8] my-4" />

        {/* Why this market explanation */}
        <div>
          <h4 className="text-sm font-black text-stone-950 uppercase tracking-wide mb-1.5">
            Why this market?
          </h4>
          <p className="text-sm font-semibold text-stone-800 leading-relaxed">
            {market.whyRecommended ||
              `This market gives you the highest estimated net return after considering transport cost, even though other markets may offer higher prices.`}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-stone-700 mt-3 font-bold">
            <Info className="w-4 h-4 text-[#165B33] shrink-0" />
            <span>Recommendation based on Smart Market Score</span>
          </div>
        </div>
      </div>

      {/* Key Insights Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-stone-300 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#165B33]">
            <Lightbulb className="w-5 h-5 text-[#165B33]" />
          </div>
          <h4 className="text-base font-black text-stone-950">
            Key Insights for Farmers
          </h4>
        </div>
        <ul className="space-y-2.5 text-sm font-bold text-stone-800">
          <li className="flex items-start gap-2.5">
            <span className="text-[#165B33] font-black text-base">•</span>
            <span>Transport cost has a major impact on your net returns.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#165B33] font-black text-base">•</span>
            <span>A mandi with a slightly lower rate may provide a higher estimated net return if it is closer.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-[#165B33] font-black text-base">•</span>
            <span>Always compare total logistics cost before choosing where to haul your harvest.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
