import React, { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { CropType, Language, MarketIntelligence } from '../types';
import { getTranslation } from '../utils/translations';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

interface PriceTrendChartProps {
  crop: CropType;
  language: Language;
  intelligence?: MarketIntelligence | null;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ crop, language, intelligence }) => {
  const t = getTranslation(language);
  const [period, setPeriod] = useState<'7d' | '30d'>('7d');
  const series = intelligence?.price_history?.[period] || [];
  const hasData = series.length >= 2;

  return (
    <div className="flex flex-col justify-between rounded-2xl border-2 border-stone-300 bg-white p-5 shadow-sm sm:p-6" id="price-trend-chart-card">
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <h4 className="font-display text-xl font-black text-stone-950">{t.charts.priceTrendTitle}</h4>
          <div className="flex gap-1 rounded-lg border border-stone-200 bg-stone-50 p-1">
            {(['7d', '30d'] as const).map((option) => (
              <button key={option} type="button" onClick={() => setPeriod(option)} className={`rounded-md px-2 py-1 text-xs font-black ${period === option ? 'bg-[#165B33] text-white' : 'text-stone-600'}`}>
                {option === '7d' ? '7 days' : '30 days'}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-4 text-sm font-bold text-stone-700">{crop} · official modal price per kg</p>
      </div>
      {hasData ? (
        <div className="h-60 w-full">
          <Line
            data={{
              labels: series.map((item) => new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
              datasets: [{ label: '₹/kg', data: series.map((item) => item.price_per_kg), borderColor: '#165B33', backgroundColor: '#B7E4C7', pointBackgroundColor: '#165B33', tension: 0.25, fill: true }],
            }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (context) => `₹${Number(context.raw).toFixed(2)}/kg` } } }, scales: { y: { ticks: { callback: (value) => `₹${value}` } } } }}
          />
        </div>
      ) : (
        <div className="flex h-60 w-full items-center justify-center rounded-xl border border-stone-200 bg-stone-50 px-6 text-center text-sm font-bold text-stone-500">{t.results.historicalUnavailable}</div>
      )}
      <div className="mt-3 flex items-center justify-between border-t-2 border-stone-200 pt-3 text-xs font-bold text-stone-600">
        <span>{hasData ? `${series.length} official dated records` : t.results.historicalUnavailable}</span>
        <span>{intelligence?.metrics?.freshness_days === null || intelligence?.metrics?.freshness_days === undefined ? 'Freshness unavailable' : `Latest ${intelligence.metrics.freshness_days}d old`}</span>
      </div>
    </div>
  );
};
