import React, { useState } from 'react';
import { ArrowUpDown, TrendingDown, CheckCircle2 } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface WhatIfComparisonProps {
  results: CalculatedMarketResult[];
  recommendedMarket: CalculatedMarketResult;
  language: Language;
}

export const WhatIfComparison: React.FC<WhatIfComparisonProps> = ({
  results,
  recommendedMarket,
  language,
}) => {
  const t = getTranslation(language);
  const wt = t.whatIf;

  const nonRecommended = results.filter((r) => r.id !== recommendedMarket.id);
  const [selectedId, setSelectedId] = useState<string>(
    nonRecommended[0]?.id || recommendedMarket.id
  );

  const selectedMarket = results.find((r) => r.id === selectedId) || recommendedMarket;
  const isBest = selectedId === recommendedMarket.id;

  const diff = selectedMarket.netReturn - recommendedMarket.netReturn;
  const formatINR = (v: number) => `₹${Math.abs(v).toLocaleString('en-IN')}`;

  return (
    <div
      className="bg-white rounded-2xl border-2 border-stone-200 shadow-sm overflow-hidden"
      id="what-if-comparison"
    >
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex items-center gap-2">
        <ArrowUpDown className="w-5 h-5 text-amber-600" />
        <h3 className="text-base font-black text-stone-900">{wt.title}</h3>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm font-semibold text-stone-600">{wt.subtitle}</p>

        {/* Market Selector */}
        <div>
          <label className="text-xs font-black text-stone-700 block mb-1.5">
            {wt.selectMarketLabel}
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-white border-2 border-stone-300 rounded-xl px-4 py-2.5 text-sm font-bold text-stone-900 outline-hidden focus:border-[#165B33] transition-colors cursor-pointer"
          >
            {results.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
                {r.isRecommended ? ` (${t.results.bestOptionBadge})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Comparison Table */}
        {isBest ? (
          <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-300 rounded-xl p-3.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-black text-emerald-900">{wt.bestOptionNote}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[
              {
                label: wt.expectedRevenue,
                val: `₹${selectedMarket.grossIncome.toLocaleString('en-IN')}`,
                neutral: true,
              },
              {
                label: wt.transportCost,
                val: `₹${selectedMarket.transportCost.toLocaleString('en-IN')}`,
                neutral: true,
              },
              {
                label: wt.expectedNetReturn,
                val: `₹${selectedMarket.netReturn.toLocaleString('en-IN')}`,
                highlight: true,
              },
            ].map((row) => (
              <div
                key={row.label}
                className={`flex justify-between items-center px-4 py-2.5 rounded-lg ${
                  row.highlight ? 'bg-amber-50 border border-amber-200' : 'bg-stone-50'
                }`}
              >
                <span className="text-sm font-bold text-stone-700">{row.label}</span>
                <span
                  className={`text-sm font-black ${
                    row.highlight ? 'text-stone-950' : 'text-stone-800'
                  }`}
                >
                  {row.val}
                </span>
              </div>
            ))}

            {/* Difference from best */}
            <div
              className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 ${
                diff >= 0
                  ? 'bg-emerald-50 border-emerald-300'
                  : 'bg-rose-50 border-rose-300'
              }`}
            >
              <span className="text-sm font-black text-stone-900">{wt.diffFromBest}</span>
              <span
                className={`text-base font-black flex items-center gap-1 ${
                  diff >= 0 ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {diff >= 0 ? '+' : '−'}
                {formatINR(diff)}
                {diff < 0 && <TrendingDown className="w-4 h-4" />}
              </span>
            </div>

            <p className="text-xs font-semibold text-stone-500 text-center">
              {wt.comparedToBest || 'Compared to best market:'} {recommendedMarket.name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
