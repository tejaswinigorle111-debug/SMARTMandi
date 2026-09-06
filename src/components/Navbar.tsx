import React, { useState } from 'react';
import { Globe, Menu, X, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import smartMandiLogo from '../assets/images/smartmandi_logo_1788515902109.jpg';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenMarketPrices: () => void;
  onOpenAbout: () => void;
  onScrollToInput: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onOpenMarketPrices,
  onOpenAbout,
  onScrollToInput,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = getTranslation(language);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="flex items-center gap-2.5 group focus:outline-hidden"
              id="brand-logo"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-700/20 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center bg-white shrink-0 p-0.5">
                <img
                  src={smartMandiLogo}
                  alt="SMARTMandi Emblem Logo"
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-950 font-display">
                    SMART<span className="text-[#165B33]">Mandi</span>
                  </span>
                </div>
                <p className="text-xs font-bold text-stone-700 leading-none mt-0.5">
                  Smart Market. Better Returns.
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-base font-bold text-stone-700">
            <a
              href="#"
              className="text-stone-950 font-black hover:text-emerald-800 transition-colors py-1"
              id="nav-home"
            >
              {t.nav.home}
            </a>
            <button
              type="button"
              onClick={onOpenMarketPrices}
              className="hover:text-emerald-800 transition-colors py-1 cursor-pointer font-bold"
              id="nav-market-prices"
            >
              {t.nav.marketPrices}
            </button>
            <a
              href="#how-it-works"
              className="hover:text-emerald-800 transition-colors py-1 font-bold"
              id="nav-how-it-works"
            >
              {t.nav.howItWorks}
            </a>
            <button
              type="button"
              onClick={onOpenAbout}
              className="hover:text-emerald-800 transition-colors py-1 cursor-pointer font-bold"
              id="nav-about"
            >
              {t.nav.about}
            </button>
          </nav>

          {/* Right Action: Language Selector & CTA Button */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100 rounded-full px-2.5 py-1 border border-stone-300">
              <Globe className="w-4 h-4 text-stone-700 mr-1.5" />
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 text-sm rounded-full transition-all cursor-pointer ${
                  language === 'en'
                    ? 'font-black text-emerald-950 bg-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 font-bold'
                }`}
                aria-pressed={language === 'en'}
                id="lang-btn-en"
              >
                English
              </button>
              <span className="text-stone-400 text-sm mx-1">|</span>
              <button
                type="button"
                onClick={() => onLanguageChange('te')}
                className={`px-2.5 py-1 text-sm rounded-full transition-all cursor-pointer ${
                  language === 'te'
                    ? 'font-black text-emerald-950 bg-white shadow-xs'
                    : 'text-stone-700 hover:text-stone-950 font-bold'
                }`}
                aria-pressed={language === 'te'}
                id="lang-btn-te"
              >
                తెలుగు
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onScrollToInput}
              className="bg-[#165B33] hover:bg-[#114828] text-white text-base font-black px-6 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer tracking-wide"
              id="cta-find-best-market-nav"
            >
              <span>{t.nav.findMarket}</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 sm:hidden">
            {/* Mobile language toggle */}
            <button
              type="button"
              onClick={() => onLanguageChange(language === 'en' ? 'te' : 'en')}
              className="px-2.5 py-1.5 text-xs font-bold bg-stone-100 rounded-lg border border-stone-200 text-stone-800"
              id="mobile-lang-toggle"
            >
              {language === 'en' ? 'తెలుగు' : 'EN'}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 focus:outline-hidden rounded-md"
              aria-label="Toggle Navigation Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-md" id="mobile-menu">
          <div className="flex flex-col space-y-2 text-base font-semibold text-stone-800">
            <a
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-50 text-emerald-800 font-bold"
            >
              {t.nav.home}
            </a>
            <button
              type="button"
              onClick={() => handleNavClick(onOpenMarketPrices)}
              className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 flex items-center justify-between text-stone-600"
            >
              <span>{t.nav.marketPrices}</span>
              <TrendingUp className="w-4 h-4 text-emerald-700" />
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-600"
            >
              {t.nav.howItWorks}
            </a>
            <button
              type="button"
              onClick={() => handleNavClick(onOpenAbout)}
              className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-600"
            >
              {t.nav.about}
            </button>
          </div>

          <div className="pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => handleNavClick(onScrollToInput)}
              className="w-full bg-[#165B33] text-white text-center font-bold py-3 rounded-xl shadow-xs hover:bg-[#134E2E]"
            >
              {t.nav.findMarket}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
