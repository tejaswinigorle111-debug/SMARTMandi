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
  const isTe = language === 'te';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-stone-200" id="market-comparison-card">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
          {t.results.comparisonTitle || (isTe ? 'మార్కెట్ పోలిక పట్టిక' : 'Market Comparison Table')}
        </h3>
        <p className="text-stone-500 text-sm font-bold mt-1 max-w-2xl">
          {isTe
            ? 'రవాణా ఖర్చుల తర్వాత చేతికి వచ్చే నికర లాభం, దూరం మరియు ధరల ఆధారంగా మార్కెట్ల పోలిక.'
            : 'Mandis compared using estimated net return, price, distance and transport cost.'}
        </p>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-stone-700 text-xs sm:text-sm font-black border-b border-stone-200">
              <th className="py-4 px-4 text-center w-12">#</th>
              <th className="py-4 px-4">{isTe ? 'మండి పేరు' : 'Mandi Market'}</th>
              <th className="py-4 px-4 text-center">{isTe ? 'నికర లాభం' : 'Net Return'}<br/><span className="text-stone-500 font-bold">(₹)</span></th>
              <th className="py-4 px-4 text-center">{isTe ? 'దూరం' : 'Distance'}<br/><span className="text-stone-500 font-bold">(km)</span></th>
              <th className="py-4 px-4 text-center">{isTe ? 'సమయం' : 'Est. Time'}</th>
              <th className="py-4 px-4 text-center">{isTe ? 'తేడా' : 'Diff vs Best'}<br/><span className="text-stone-500 font-bold">(₹)</span></th>
            </tr>
          </thead>
          <tbody className="text-sm sm:text-base font-bold text-stone-800">
            {results.map((m, index) => {
              const rank = index + 1;
              const isBest = rank === 1;
              const diff = isBest ? '-' : `- ${formatINR(results[0].netReturn - m.netReturn).replace('₹', '')}`;
              
              // Medal badges
              const getRankBadge = (r: number) => {
                if (r === 1) return <span className="flex items-center justify-center w-6 h-6 bg-amber-400 text-white rounded-full text-xs shadow-xs mx-auto">1</span>;
                if (r === 2) return <span className="flex items-center justify-center w-6 h-6 bg-stone-300 text-stone-700 rounded-full text-xs shadow-xs mx-auto">2</span>;
                if (r === 3) return <span className="flex items-center justify-center w-6 h-6 bg-amber-700/40 text-amber-900 rounded-full text-xs shadow-xs mx-auto">3</span>;
                return <span className="flex items-center justify-center w-6 h-6 text-stone-500 text-xs mx-auto">{r}</span>;
              };

              return (
                <tr
                  key={m.id}
                  className={`transition-colors border-b border-stone-100 ${
                    isBest ? 'bg-amber-50/60' : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="py-4 px-4">{getRankBadge(rank)}</td>
                  <td className="py-4 px-4 text-stone-900 font-black">
                     {m.name}
                  </td>
                  <td className="py-4 px-4 text-center text-[#165B33] font-black">{formatINR(m.netReturn).replace('₹', '')}</td>
                  <td className="py-4 px-4 text-center">{m.distanceKm} km</td>
                  <td className="py-4 px-4 text-center text-sm">{Math.floor(m.distanceKm * 1.5)} {isTe ? 'నిమి' : 'min'}</td>
                  <td className={`py-4 px-4 text-center ${!isBest ? 'text-rose-600 font-extrabold' : 'text-stone-400'}`}>
                    {diff}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-stone-500">
        <p>{t.results.sampleNotice}</p>
        <p className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#165B33]"></span> 
          {t.results.recommendationBasis}
        </p>
      </div>
    </div>
  );
};
