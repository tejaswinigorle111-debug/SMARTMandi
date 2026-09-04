import React from 'react';
import { Truck, Store, TrendingUp, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import farmerHarvestImage from '../assets/images/indian_farmer_harvest_1788510201831.jpg';
import scenicFarmImage from '../assets/images/scenic_farm_backdrop_1788514179084.jpg';

interface HeroProps {
  language: Language;
  onFindMarketClick: () => void;
  onHowItWorksClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  language,
  onFindMarketClick,
  onHowItWorksClick,
}) => {
  const t = getTranslation(language);

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-[#EFF7F0] via-[#FAFDF9] to-[#E8F4EA] pt-8 pb-12 lg:pt-14 lg:pb-16 border-b border-emerald-900/10">
      {/* Expansive Scenic Farming Backdrop */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={scenicFarmImage}
          alt="Expansive Fertile Agricultural Farmland"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-multiply filter contrast-110 saturate-120"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-b from-[#EFF7F0]/85 via-transparent to-[#E8F4EA]/90" />
      </div>

      {/* Shaded ambient radial lights and soft farm field tones */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-radial from-emerald-200/40 via-emerald-100/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-radial from-amber-100/40 via-emerald-50/20 to-transparent blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 border border-emerald-300 w-fit mb-4 shadow-2xs">
              <span className="text-sm font-black text-emerald-950 tracking-wider flex items-center gap-2">
                <span className="text-emerald-700">✦</span> SMART AGRICULTURE • MANDI DECISION SUPPORT
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-950 tracking-tight leading-[1.15] font-display">
              Find the <span className="text-[#165B33]">Best Market</span>
              <br />
              for Your Crop
            </h1>

            {/* Subtitle */}
            <p className="mt-4 text-lg sm:text-xl text-stone-800 max-w-xl leading-relaxed font-bold">
              Compare market prices, transport costs and expected net returns before you sell.
            </p>

            {/* Call To Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onFindMarketClick}
                className="bg-[#165B33] hover:bg-[#114828] active:scale-[0.98] text-white text-lg font-black px-8 py-4 rounded-xl shadow-md transition-all cursor-pointer tracking-wide"
                id="hero-btn-find-market"
              >
                <span>{t.hero.ctaPrimary}</span>
              </button>
              <button
                type="button"
                onClick={onHowItWorksClick}
                className="bg-white hover:bg-stone-50 active:scale-[0.98] text-stone-900 border-2 border-stone-300 hover:border-stone-400 text-lg font-black px-8 py-4 rounded-xl transition-all cursor-pointer shadow-xs tracking-wide"
                id="hero-btn-how-it-works"
              >
                {t.hero.ctaSecondary}
              </button>
            </div>
          </div>

          {/* Right Column: Authentic Agricultural Photo with Farmer & Tomatoes */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Photo Frame */}
              <div className="relative rounded-2xl overflow-hidden shadow-md border-2 border-stone-300 bg-white aspect-4/3 sm:aspect-5/4">
                <img
                  src={farmerHarvestImage}
                  alt="Smiling Indian farmer holding fresh harvest tomatoes in field"
                  className="w-full h-full object-cover"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Floating Decision Card */}
              <div className="absolute -bottom-5 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl shadow-xl border-2 border-emerald-600/30 max-w-[290px] z-10">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-900 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-800" />
                  </div>
                  <span className="text-base font-black text-stone-950 font-display">
                    Better Returns
                  </span>
                </div>
                <p className="text-sm text-stone-800 leading-snug font-bold">
                  Calculate true profits after transport costs before making mandi trips.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Key Feature Highlights Row */}
        <div className="mt-14 pt-8 border-t-2 border-stone-300/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/80 border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-950">
                Transport Cost Factored
              </h4>
              <p className="text-sm font-bold text-stone-700 mt-1">
                Real fuel & freight calculated per quintal
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/80 border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-950">
                Multi-Mandi Benchmarking
              </h4>
              <p className="text-sm font-bold text-stone-700 mt-1">
                Compares local and regional yards simultaneously
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-2xl bg-white/80 border border-stone-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-stone-950">
                Maximized Net Profit
              </h4>
              <p className="text-sm font-bold text-stone-700 mt-1">
                Guaranteed rank by take-home income
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
