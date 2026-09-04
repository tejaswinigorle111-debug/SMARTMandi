import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3 } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PriceComparisonChartProps {
  results: CalculatedMarketResult[];
  language: Language;
}

export const PriceComparisonChart: React.FC<PriceComparisonChartProps> = ({
  results,
  language,
}) => {
  const t = getTranslation(language);

  // Shorten names for clean chart labels
  const labels = results.map((m) => {
    // E.g., "Kurnool APMC" or "Adoni Yard"
    return m.name.replace(' Agricultural Market Yard', '').replace(' Central Vegetable Mandi', '').replace(' Regulated Grains Mandi', '').replace(' Cotton & Grain Yard', '').replace(' Asia Mirchi Yard', '');
  });

  const prices = results.map((m) => m.pricePerKg);

  const backgroundColors = results.map((m) =>
    m.isRecommended ? '#1b4332' : '#74c69d'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Price (₹/kg)',
        data: prices,
        backgroundColor: backgroundColors,
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 28,
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
          label: (context: any) => `Price: ₹${context.raw}/kg`,
          afterLabel: (context: any) => {
            const market = results[context.dataIndex];
            return `Est. Net Return: ₹${market.netReturn.toLocaleString('en-IN')}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
          text: 'Rate per kg (₹)',
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
          maxRotation: 25,
          minRotation: 0,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border-2 border-stone-300 flex flex-col justify-between" id="price-comparison-chart-card">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="text-xl font-black text-stone-950 font-display">
            Market Price Comparison
          </h4>
          <span className="text-xs font-black bg-stone-100 text-stone-800 px-3 py-1 rounded-md border border-stone-300">
            Sample Data
          </span>
        </div>
        <p className="text-sm font-bold text-stone-700 mb-4">Mandis compared by price per kg</p>
      </div>

      <div className="h-60 w-full">
        <Bar data={chartData} options={options} />
      </div>

      <div className="mt-3 pt-3 border-t-2 border-stone-200 flex items-center justify-between text-xs sm:text-sm font-bold text-stone-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#165B33]" />
            <span className="font-black text-stone-950">Best Option</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-xs bg-[#74c69d]" />
            <span className="font-bold text-stone-700">Other Mandis</span>
          </div>
        </div>
        <span className="font-bold text-stone-600">Sample Data</span>
      </div>
    </div>
  );
};
