import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Language, MarketIntelligence } from '../types';
import { getTranslation } from '../utils/translations';

interface BestSellingWindowProps {
  language: Language;
  intelligence?: MarketIntelligence | null;
}

export const BestSellingWindow: React.FC<BestSellingWindowProps> = ({ language, intelligence }) => {
  const t = getTranslation(language);
  const bw = t.bestSellingWindow;
  const metrics = intelligence?.metrics;
  const decision = intelligence?.recommendation_type;
  const decisionLabel = decision === 'sell_now' ? 'Sell now' : decision === 'hold' ? 'Hold' : decision === 'monitor' ? 'Monitor' : 'Unavailable';

  return (
    <div
      className="bg-white rounded-2xl border-2 border-stone-200 shadow-sm overflow-hidden"
      id="best-selling-window"
    >
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-700" />
        <h3 className="text-base font-black text-stone-900">{bw.title}</h3>
      </div>

      <div className="p-5 space-y-4">
        {/* Current Condition row */}
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-stone-600">{bw.condition}</span>
          <span className="text-xs font-black text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
            {decisionLabel}
          </span>
        </div>

        <div>
          <p className="text-xs font-black text-stone-700 mb-2">{bw.trend}</p>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
            <p className="text-sm font-black text-stone-800">{metrics?.trend_direction && metrics.trend_direction !== 'unavailable' ? metrics.trend_direction : bw.unavailable}</p>
            <p className="mt-1 text-xs font-bold text-stone-500">30-day change: {metrics?.change_percent_30d === null || metrics?.change_percent_30d === undefined ? bw.unavailable : `${metrics.change_percent_30d}%`}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-bold text-stone-700">
          <div className="rounded-lg border border-stone-200 p-3">Volatility<br /><strong>{metrics?.volatility_percent === null || metrics?.volatility_percent === undefined ? bw.unavailable : `${metrics.volatility_percent}%`}</strong></div>
          <div className="rounded-lg border border-stone-200 p-3">Freshness<br /><strong>{metrics?.freshness_days === null || metrics?.freshness_days === undefined ? bw.unavailable : `${metrics.freshness_days} days old`}</strong></div>
          <div className="rounded-lg border border-stone-200 p-3">Latest arrivals<br /><strong>{metrics?.latest_arrival_quantity === null || metrics?.latest_arrival_quantity === undefined ? bw.unavailable : metrics.latest_arrival_quantity}</strong></div>
          <div className="rounded-lg border border-stone-200 p-3">30-day average<br /><strong>{metrics?.average_price_30d === null || metrics?.average_price_30d === undefined ? bw.unavailable : `₹${metrics.average_price_30d}/kg`}</strong></div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2"><Clock className="h-5 w-5 text-emerald-700" /><span className="text-sm font-black text-emerald-900">{decisionLabel}</span></div>
          <p className="mt-2 text-xs font-semibold leading-relaxed text-emerald-800">{intelligence?.recommendation || bw.unavailable}</p>
        </div>
      </div>
    </div>
  );
};
