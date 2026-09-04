import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import { CropType, Language } from '../types';
import { cropHistoricalTrends } from '../data/demoMarkets';
import { getTranslation } from '../utils/translations';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceTrendChartProps {
  crop: CropType;
  language: Language;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  crop,
  language,
}) => {
  const t = getTranslation(language);
  const trend = cropHistoricalTrends[crop] || cropHistoricalTrends.Tomato;

  const chartData = {
    labels: trend.days,
    datasets: [
      {
        label: `${crop} Historical Price (₹/kg)`,
        data: trend.prices,
        borderColor: '#2D6A4F',
        backgroundColor: 'rgba(116, 198, 157, 0.22)',
        pointBackgroundColor: '#1B4332',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#1B4332',
        pointHoverBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1B4332',
        titleFont: { size: 14, weight: 'bold' as const },
        bodyFont: { size: 13, weight: 'bold' as const },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `Avg Market Rate: ₹${context.raw}/kg`,
        },
      },
    },
    scales: {
      y: {
        grid: {
          color: '#E2E8E2',
        },
        ticks: {
          font: { size: 13, weight: 'bold' as const },
          color: '#1C1F1C',
          callback: (value: any) => `₹${value}`,
        },
        title: {
          display: true,
          text: 'Price (₹/kg)',
          font: { size: 13, weight: 'bold' as const },
          color: '#1C1F1C',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: 12, weight: 'bold' as const },
          color: '#1A1C1A',
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-stone-300 flex flex-col justify-between" id="price-trend-chart-card">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xl font-black text-stone-950 font-display">
            Price Trend ({crop})
          </h4>
          <span className="text-xs font-black bg-stone-100 text-stone-800 px-3 py-1 rounded-md border border-stone-300">
            7-Day History
          </span>
        </div>
        <p className="text-sm font-bold text-stone-700 mb-4">
          7-day mandi modal price trend across region
        </p>
      </div>

      <div className="h-60 w-full">
        <Line data={chartData} options={options} />
      </div>

      <div className="mt-3 pt-3 border-t-2 border-stone-200 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-700">
        <div>
          <span>7-Day Average: </span>
          <span className="font-black text-stone-950 text-base">₹{trend.averagePrice}/kg</span>
        </div>
        <span className="font-bold text-stone-600">Historical Trend</span>
      </div>
    </div>
  );
};
