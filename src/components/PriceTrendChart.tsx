import React from 'react';
import { CropType, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface PriceTrendChartProps {
  crop: CropType;
  language: Language;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  crop,
  language,
}) => {
  const t = getTranslation(language);
  void crop;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-stone-300 flex flex-col justify-between" id="price-trend-chart-card">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xl font-black text-stone-950 font-display">
            {t.charts.priceTrendTitle}
          </h4>
          <span className="text-xs font-black bg-stone-100 text-stone-800 px-3 py-1 rounded-md border border-stone-300">
            {t.results.historicalUnavailable}
          </span>
        </div>
        <p className="text-sm font-bold text-stone-700 mb-4">
          {t.results.historicalUnavailable}
        </p>
      </div>

      <div className="h-60 w-full flex items-center justify-center rounded-xl bg-stone-50 border border-stone-200 px-6 text-center text-sm font-bold text-stone-500">
        {t.results.historicalUnavailable}
      </div>

      <div className="mt-3 pt-3 border-t-2 border-stone-200 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-700">
        <span className="font-bold text-stone-600">{t.results.historicalUnavailable}</span>
      </div>
    </div>
  );
};
