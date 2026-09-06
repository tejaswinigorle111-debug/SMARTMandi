import React from 'react';
import { CalculatedMarketResult, CropType, Language } from '../types';
import { RecommendationCard } from './RecommendationCard';
import { MarketComparison } from './MarketComparison';
import { PriceArrivalIntelligence } from './PriceArrivalIntelligence';
import { PriceComparisonChart } from './PriceComparisonChart';
import { PriceTrendChart } from './PriceTrendChart';
import { cropOptions } from '../data/demoMarkets';
import vegCropShadesImage from '../assets/images/veg_crop_shades_1788511659089.jpg';

interface MarketResultsProps {
  results: CalculatedMarketResult[];
  quantity: number;
  crop: CropType;
  location: string;
  language: Language;
}

export const MarketResults: React.FC<MarketResultsProps> = ({
  results,
  quantity,
  crop,
  location,
  language,
}) => {
  if (!results || results.length === 0) return null;

  const recommendedMarket = results.find((r) => r.isRecommended) || results[0];
  const cropIcon = cropOptions.find((c) => c.id === crop)?.icon || '🌾';
  const currentDateFormatted = new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const cropData = cropOptions.find((c) => c.id === crop);
  const cropDisplayName = language === 'te' ? (cropData?.labelTe || crop) : (cropData?.labelEn || crop);

  return (
    <section
      id="market-results-section"
      className="relative py-12 sm:py-16 bg-linear-to-b from-[#E7EFE8] via-[#EDF5EE] to-[#E5EEE6] border-t border-emerald-900/15 scroll-mt-16 overflow-hidden"
    >
      {/* Vegetable crop shades background image overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={vegCropShadesImage}
          alt="Vegetable Crop Harvest Backdrop"
          className="w-full h-full object-cover object-bottom opacity-18 mix-blend-multiply filter contrast-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#E7EFE8]/95 via-transparent to-[#E5EEE6]/95" />
      </div>

      {/* Atmospheric vegetable farm lighting */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-radial from-emerald-200/30 via-transparent to-transparent blur-2xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-radial from-amber-200/25 via-transparent to-transparent blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top: "Your Query" Card */}
        <div className="bg-white rounded-2xl p-5 border-2 border-stone-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              {cropIcon}
            </span>
            <div>
              <span className="text-sm font-black text-emerald-950 uppercase tracking-wide block">
                {language === 'te' ? 'మీరు నమోదు చేసిన వివరాలు' : 'Your Calculated Query'}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-stone-950">
                {cropDisplayName} • {(quantity / 100).toLocaleString('en-IN')} {language === 'te' ? 'క్వింటాళ్లు' : 'quintals'}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-stone-700">
            <div>
              <span className="text-stone-500 block font-bold text-xs uppercase tracking-wider">
                {language === 'te' ? 'మీ ప్రాంతం' : 'Origin Location'}
              </span>
              <span className="font-extrabold text-stone-950 text-base">{location}</span>
            </div>
            <div className="h-8 w-px bg-stone-300 hidden sm:block" />
            <div>
              <span className="text-stone-500 block font-bold text-xs uppercase tracking-wider">
                {language === 'te' ? 'మార్కెట్ డేటా' : 'Market Data'}
              </span>
              <span className="font-extrabold text-stone-950 text-base">{currentDateFormatted}</span>
            </div>
          </div>
        </div>

        {/* 2-Column Dashboard Grid: Main content on Left, Recommended & Insights on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (8 cols on large screens): Market Comparison Table & Charts */}
          <div className="lg:col-span-8 space-y-6">
            {/* Market Comparison Table */}
            <MarketComparison results={results} language={language} />

            {/* Price & Arrival Intelligence */}
            <PriceArrivalIntelligence results={results} language={language} />

            {/* Charts Side-by-Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PriceComparisonChart results={results} language={language} />
              <PriceTrendChart crop={crop} language={language} />
            </div>
          </div>

          {/* Right Column (4 cols on large screens): Recommended Market Card & Key Insights */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <RecommendationCard
              market={recommendedMarket}
              quantity={quantity}
              cropName={crop}
              language={language}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
