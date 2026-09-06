import React from 'react';
import { Trophy, Info, Navigation, MapPin, Clock } from 'lucide-react';
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
  const isTe = language === 'te';

  return (
    <div className="space-y-6" id="recommended-market-container">
      {/* Recommended Market Card */}
      <div
        className="bg-white rounded-2xl border-2 border-stone-200 shadow-md overflow-hidden relative"
        id="recommended-market-card"
      >
        {/* Orange Banner Header */}
        <div className="bg-amber-400 py-2.5 px-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-white" />
          <span className="text-white font-black text-lg tracking-wide drop-shadow-xs">
            {isTe ? 'బెస్ట్ మార్కెట్ (BEST OPTION)' : 'BEST OPTION (RECOMMENDED)'}
          </span>
        </div>
        
        <div className="p-6">
          {/* Market Name and Top-Right Green Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-950 font-display leading-tight">
                {market.name}
              </h3>
              <p className="text-sm font-bold text-stone-600 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {market.distanceKm} km</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {Math.floor(market.distanceKm * 1.5)} {isTe ? 'నిమి' : 'min'}</span>
              </p>
            </div>
            
            <div className="bg-[#165B33] text-white rounded-xl p-3 px-5 text-center shadow-md min-w-[140px] shrink-0">
              <span className="text-xs font-bold opacity-90 block mb-0.5">
                {isTe ? 'అంచనా నికర లాభం' : 'Estimated Net Return'}
              </span>
              <span className="text-2xl font-black block">{formatINR(market.netReturn)}</span>
              <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
                {isTe ? '(చేతికి వచ్చే లాభం)' : '(Take-home)'}
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-700">
              <span>{isTe ? 'మొత్తం ఆదాయం (Gross Revenue)' : 'Estimated Gross Revenue'}</span>
              <span>{formatINR(market.grossIncome)}</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-700">
              <span>{isTe ? 'రవాణా ఖర్చు (Transport)' : 'Estimated Transport Cost'}</span>
              <span>- {formatINR(market.transportCost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-700 pb-3 border-b border-stone-200">
              <span>{isTe ? 'మండి చార్జీలు (Mandi Charges)' : 'Estimated Mandi Fees & Cess'}</span>
              <span>- ₹1,550</span>
            </div>
            
            <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-sm sm:text-base font-black text-stone-900">
                {isTe ? 'అంచనా నికర లాభం (Expected Take-home)' : 'Estimated Net Return (Take-home)'}
              </span>
              <span className="text-lg sm:text-xl font-black text-[#165B33]">{formatINR(market.netReturn)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4 text-xs font-bold text-stone-500 mb-6">
            <div className="flex items-center gap-2">
               <span className="text-[#165B33] bg-emerald-100 p-1 rounded-md">
                 {isTe ? 'మండి ధర' : 'Mandi Price'}
               </span>
               <span>₹{market.pricePerKg * 100} / {isTe ? 'క్వింటాల్' : 'quintal'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#165B33] bg-emerald-100 p-1 rounded-md">
                {isTe ? 'దూరం' : 'Distance'}
              </span>
               <span>{market.distanceKm} km</span>
            </div>
          </div>

          {/* Why this market explanation - ELEVATED CALLOUT */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-amber-500" /> {isTe ? 'ఎందుకు ఈ మార్కెట్ మెరుగ్గా ఉంది?' : 'Why is this market recommended?'}
            </h4>
            <p className="text-sm font-semibold text-stone-600 leading-relaxed">
              {market.whyRecommended ||
                (isTe
                  ? `ఈ మార్కెట్ మీకు రవాణా ఖర్చులను పరిగణనలోకి తీసుకున్న తర్వాత అత్యధిక నికర లాభాన్ని ఇస్తుంది.`
                  : `This mandi maximizes your estimated take-home return after accounting for regional transport and freight costs.`)}
            </p>
            <div className="mt-3 text-right">
                <button type="button" className="text-[#165B33] text-sm font-black hover:underline flex items-center gap-1 justify-end w-full cursor-pointer">
                  {isTe ? 'వివరంగా చూడండి' : 'View Full Details'} <Navigation className="w-3 h-3" />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
