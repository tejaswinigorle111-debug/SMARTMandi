import React from 'react';
import { MapPin, Navigation, CheckCircle2 } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MarketCardProps {
  market: CalculatedMarketResult;
  quantity: number;
  language: Language;
  bestNetReturn: number;
}

export const MarketCard: React.FC<MarketCardProps> = ({
  market,
  quantity,
  language,
  bestNetReturn,
}) => {
  const t = getTranslation(language);
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
  const differenceFromBest = bestNetReturn - market.netReturn;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border transition-all ${
        market.isRecommended
          ? 'border-[#2D6A4F] ring-2 ring-[#2D6A4F]/15 shadow-md bg-[#F0F4F0]/20'
          : 'border-[#E8ECE8] hover:border-[#DCE4DC] shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-[#1A1C1A] text-lg">{market.name}</h4>
            {market.isRecommended && (
              <CheckCircle2 className="w-5 h-5 text-[#2D6A4F] shrink-0" />
            )}
          </div>
          <p className="text-xs text-[#5C635C] flex items-center gap-1 mt-0.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#5C635C]" />
            <span>{market.location}</span>
            <span>•</span>
            <Navigation className="w-3.5 h-3.5 text-[#5C635C]" />
            <span>{market.distanceKm} km</span>
          </p>
        </div>

        {market.isRecommended ? (
          <span className="bg-[#2D6A4F] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Best Return
          </span>
        ) : differenceFromBest > 0 ? (
          <span className="bg-[#F0F4F0] text-[#5C635C] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#DCE4DC]">
            -₹{differenceFromBest.toLocaleString('en-IN')} vs Best
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E8ECE8] text-xs">
        <div>
          <span className="text-[#5C635C] block font-semibold text-[11px]">Price / kg:</span>
          <span className="font-bold text-[#1A1C1A] text-sm">₹{market.pricePerKg}</span>
        </div>
        <div>
          <span className="text-[#5C635C] block font-semibold text-[11px]">Gross:</span>
          <span className="font-bold text-[#1A1C1A] text-sm">{formatINR(market.grossIncome)}</span>
        </div>
        <div>
          <span className="text-rose-700 block font-semibold text-[11px]">Transport:</span>
          <span className="font-bold text-rose-600 text-sm">-{formatINR(market.transportCost)}</span>
        </div>
        <div className="bg-[#F7F9F7] p-2 rounded-xl border border-[#E8ECE8]">
          <span className="text-[#5C635C] block font-black text-[10px] uppercase">Net Return:</span>
          <span className={`font-black text-sm ${market.isRecommended ? 'text-[#1B4332]' : 'text-[#1A1C1A]'}`}>
            {formatINR(market.netReturn)}
          </span>
        </div>
      </div>
    </div>
  );
};
