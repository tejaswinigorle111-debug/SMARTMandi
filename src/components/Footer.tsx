import React from 'react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import smartMandiLogo from '../assets/images/smartmandi_logo_1788515902109.jpg';

interface FooterProps {
  language: Language;
  onOpenMarketPrices: () => void;
  onOpenAbout: () => void;
  onScrollToInput: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onOpenMarketPrices,
  onOpenAbout,
  onScrollToInput,
}) => {
  const t = getTranslation(language);

  return (
    <footer className="bg-[#1A1C1A] text-[#E5F5E5] py-12 sm:py-16 border-t border-[#2D6A4F]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
          {/* Brand Col */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white p-0.5 border border-white/20 shadow-sm shrink-0 flex items-center justify-center">
                <img
                  src={smartMandiLogo}
                  alt="SMARTMandi Emblem Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-black tracking-tight text-white font-display">
                SMART<span className="text-[#74C69D]">Mandi</span>
              </span>
            </div>
            <p className="text-[#A4C4B5] text-sm max-w-sm">
              {t.footer.aboutText}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-6 flex flex-col sm:flex-row sm:justify-end gap-8 text-sm">
            <div className="space-y-3">
              <span className="text-sm font-black text-[#74C69D] uppercase tracking-wider block">
                Navigation
              </span>
              <ul className="space-y-2.5 font-bold text-base">
                <li>
                  <a href="#" className="hover:text-white text-stone-200 transition-colors">
                    {t.nav.home}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenMarketPrices}
                    className="hover:text-white text-stone-200 transition-colors cursor-pointer text-left font-bold"
                  >
                    {t.nav.marketPrices}
                  </button>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white text-stone-200 transition-colors">
                    {t.nav.howItWorks}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenAbout}
                    className="hover:text-white text-stone-200 transition-colors cursor-pointer text-left font-bold"
                  >
                    {t.nav.about}
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-black text-[#74C69D] uppercase tracking-wider block">
                Actions
              </span>
              <button
                type="button"
                onClick={onScrollToInput}
                className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white font-black px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer border-2 border-[#52B788] shadow-sm"
              >
                {t.nav.findMarket}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm font-bold text-stone-300">
          <p>© 2026 {t.footer.copyright}</p>
          <p className="text-stone-300 font-bold">
            Strengthening market linkages & price discovery for Indian farmers.
          </p>
        </div>
      </div>
    </footer>
  );
};
