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
  const scoreLabel = language === 'te' ? 'స్కోర్' : language === 'hi' ? 'स्कोर' : language === 'mr' ? 'स्कोर' : 'Score';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-stone-200" id="market-comparison-card">
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-black text-stone-950 font-display">
          {t.results.comparisonTitle}
        </h3>
        <p className="text-stone-500 text-sm font-bold mt-1 max-w-2xl">
          {t.results.comparisonSub}
        </p>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="text-stone-700 text-xs sm:text-sm font-black border-b border-stone-200">
              <th className="py-4 px-4 text-center w-12">{t.results.tableHeaders.rank}</th>
              <th className="py-4 px-4">{t.results.tableHeaders.market}</th>
<<<<<<< HEAD
              <th className="py-4 px-4 text-center">{t.results.marketPriceLabel}<br/><span className="text-stone-500 font-bold">(₹/kg)</span></th>
              <th className="py-4 px-4 text-center">{t.results.distance}<br/><span className="text-stone-500 font-bold">(km)</span></th>
              <th className="py-4 px-4 text-center">{t.results.transport}<br/><span className="text-stone-500 font-bold">(₹)</span></th>
              <th className="py-4 px-4 text-center">Storage<br/><span className="text-stone-500 font-bold">(₹)</span></th>
              <th className="py-4 px-4 text-center">Other<br/><span className="text-stone-500 font-bold">(₹)</span></th>
              <th className="py-4 px-4 text-center">{t.results.netReturn}<br/><span className="text-stone-500 font-bold">(₹)</span></th>
              <th className="py-4 px-4 text-center">Freshness</th>
=======
              <th className="py-4 px-4 text-center">{t.results.tableHeaders.net}<br/><span className="text-stone-500 font-bold">(₹)</span></th>
              <th className="py-4 px-4 text-center">{t.results.tableHeaders.distance}<br/><span className="text-stone-500 font-bold">(km)</span></th>
              <th className="py-4 px-4 text-center">{t.results.tableHeaders.time}</th>
              <th className="py-4 px-4 text-center">{t.results.tableHeaders.score}<br/><span className="text-stone-500 font-bold">/100</span></th>
              <th className="py-4 px-4 text-center">{t.results.tableHeaders.diff}<br/><span className="text-stone-500 font-bold">(₹)</span></th>
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
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
<<<<<<< HEAD
                  <td className="py-4 px-4 text-center">₹{m.pricePerKg}/kg</td>
                  <td className="py-4 px-4 text-center">{m.distanceKm} km<br/><span className="text-xs text-stone-500">{m.distanceType || 'estimated'}</span></td>
                  <td className="py-4 px-4 text-center">{m.transportCost === undefined ? '—' : formatINR(m.transportCost)}</td>
                  <td className="py-4 px-4 text-center">{m.storageCost === undefined ? '—' : formatINR(m.storageCost)}</td>
                  <td className="py-4 px-4 text-center">{m.otherCost === undefined ? '—' : formatINR(m.otherCost)}</td>
                  <td className="py-4 px-4 text-center text-[#165B33] font-black">{formatINR(m.netRealization ?? m.netReturn).replace('₹', '')}</td>
                  <td className="py-4 px-4 text-center text-xs">{m.dataState === 'cached' ? 'Cached' : 'Live'}<br/>{m.lastUpdated ? new Date(m.lastUpdated).toLocaleDateString('en-IN') : '—'}</td>
=======
                  <td className="py-4 px-4 text-center text-[#165B33] font-black">{formatINR(m.netReturn).replace('₹', '')}</td>
                  <td className="py-4 px-4 text-center">{m.distanceKm} km</td>
                  <td className="py-4 px-4 text-center text-sm">{Math.floor(m.distanceKm * 1.5)} {t.results.minUnit}</td>
                  <td className="py-4 px-4 text-center">
                    {m.smartMarketScore !== undefined ? (
                      <span className={`text-sm font-black px-2 py-0.5 rounded-full ${
                        (m.smartMarketScore || 0) >= 75 ? 'text-emerald-800 bg-emerald-100'
                        : (m.smartMarketScore || 0) >= 50 ? 'text-amber-800 bg-amber-100'
                        : 'text-stone-600 bg-stone-100'
                      }`}>{m.smartMarketScore}</span>
                    ) : <span className="text-stone-400">—</span>}
                  </td>
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
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
<<<<<<< HEAD
        <p>{results[0]?.comparisonExplanation || t.results.sampleNotice}</p>
=======
        <p>{t.results.sampleNotice}</p>
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
        <p className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#165B33]"></span> 
          {t.results.recommendationBasis}
        </p>
      </div>
    </div>
  );
};
