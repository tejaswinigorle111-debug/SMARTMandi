import React from 'react';
import { Clock, TrendingUp } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface BestSellingWindowProps {
  language: Language;
}

export const BestSellingWindow: React.FC<BestSellingWindowProps> = ({ language }) => {
  const t = getTranslation(language);
  const bw = t.bestSellingWindow;

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
            {bw.awaiting}
          </span>
        </div>

        {/* Historical Trend — unavailable */}
        <div>
          <p className="text-xs font-black text-stone-700 mb-2">{bw.trend}</p>
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-center">
            <p className="text-xs font-bold text-stone-400 italic">
              {bw.unavailable}
            </p>
          </div>
        </div>

        {/* Coming Soon Badge */}
        <div className="flex flex-col items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-black text-amber-800">{bw.comingSoon}</span>
          </div>
          <p className="text-xs font-semibold text-amber-700 text-center leading-relaxed">
            {bw.comingSoonDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
