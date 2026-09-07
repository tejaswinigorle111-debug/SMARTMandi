import React, { useState, useRef, useEffect } from 'react';
import { Globe, Menu, X, TrendingUp, ChevronDown, Check, Store } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import { AuthUser } from '../services/auth';
import smartMandiLogo from '../assets/images/smartmandi_logo_1788515902109.jpg';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenMarketPrices: () => void;
  onOpenAbout: () => void;
  onScrollToInput: () => void;
  onNavigateBuyerRegister: () => void;
  onGoHome?: () => void;
  user: AuthUser | null;
  onOpenAuth: () => void;
  onLogout: () => Promise<void>;
}

export const languages: { code: Language; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
];

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onOpenMarketPrices,
  onOpenAbout,
  onScrollToInput,
  onNavigateBuyerRegister,
  onGoHome,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#ECF5EE] border-b border-[#CFDFD1] shadow-2xs backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              onClick={(e) => {
                if (onGoHome) {
                  e.preventDefault();
                  onGoHome();
                }
              }}
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
                  {t.tagline}
                </p>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-base font-bold text-stone-700">
            <a
              href="#"
              onClick={(e) => {
                if (onGoHome) {
                  e.preventDefault();
                  onGoHome();
                }
              }}
              className="text-stone-950 font-black hover:text-emerald-800 transition-colors py-1 cursor-pointer"
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
            <button
              type="button"
              onClick={onNavigateBuyerRegister}
              className="hover:text-emerald-800 transition-colors py-1 cursor-pointer font-bold flex items-center gap-1.5"
              id="nav-register-buyer"
            >
              <Store className="w-4 h-4 text-[#165B33]" />
              <span>{t.nav.registerBuyer}</span>
            </button>
          </nav>

          {/* Right Action: Language Selector & CTA Button */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Language Selector Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 bg-white/95 hover:bg-white px-3.5 py-2 rounded-xl border border-stone-300 shadow-2xs font-black text-stone-900 text-sm cursor-pointer transition-all hover:border-emerald-600"
                id="lang-dropdown-trigger"
                aria-expanded={langDropdownOpen}
              >
                <Globe className="w-4 h-4 text-[#165B33]" />
                <span>{currentLang.native}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${
                    langDropdownOpen ? 'rotate-180 text-[#165B33]' : ''
                  }`}
                />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-44 bg-white border-2 border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50"
                  id="lang-dropdown-menu"
                >
                  <div className="py-1 divide-y divide-stone-100">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          onLanguageChange(l.code);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 flex items-center justify-between text-left text-sm transition-colors cursor-pointer ${
                          language === l.code
                            ? 'bg-[#E5F5E9] text-[#165B33] font-black'
                            : 'text-stone-800 font-bold hover:bg-stone-50'
                        }`}
                      >
                        <div>
                          <span className="block">{l.native}</span>
                          <span className="text-[11px] text-stone-400 font-semibold">
                            {l.name}
                          </span>
                        </div>
                        {language === l.code && (
                          <Check className="w-4 h-4 text-[#165B33]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <button
                type="button"
                onClick={() => void onLogout()}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-black text-stone-800 transition-colors hover:border-emerald-600"
              >
                {user.full_name} · Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="rounded-xl bg-[#165B33] px-6 py-2.5 text-base font-black tracking-wide text-white shadow-xs transition-colors hover:bg-[#114828]"
              >
                Sign in
              </button>
            )}
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
            {/* Mobile language dropdown button */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="px-2.5 py-1.5 text-xs font-black bg-white rounded-lg border border-stone-300 text-stone-800 appearance-none pr-6 cursor-pointer"
                id="mobile-lang-select"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.native}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-stone-500 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 focus:outline-hidden rounded-md"
              aria-label="Toggle Navigation Menu"
              id="mobile-menu-toggle"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="sm:hidden border-b border-stone-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-md"
          id="mobile-menu"
        >
          <div className="flex flex-col space-y-2 text-base font-semibold text-stone-800">
            <a
              href="#"
              onClick={(e) => {
                setMobileMenuOpen(false);
                if (onGoHome) {
                  e.preventDefault();
                  onGoHome();
                }
              }}
              className="px-3 py-2 rounded-lg hover:bg-stone-50 text-emerald-800 font-bold"
            >
              {t.nav.home}
            </a>
            <button
              type="button"
              onClick={() => handleNavClick(onOpenMarketPrices)}
              className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 flex items-center justify-between text-stone-600 cursor-pointer"
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
              className="text-left px-3 py-2 rounded-lg hover:bg-stone-50 text-stone-600 cursor-pointer"
            >
              <span>{t.nav.about}</span>
            </button>
            <button
              type="button"
              onClick={() => handleNavClick(onNavigateBuyerRegister)}
              className="text-left px-3 py-2.5 rounded-xl hover:bg-[#E5F5E9] bg-emerald-50/50 border border-emerald-200 flex items-center justify-between text-[#165B33] font-black cursor-pointer transition-colors"
              id="mobile-nav-register-buyer"
            >
              <span>{t.nav.registerBuyer}</span>
              <Store className="w-4 h-4 text-[#165B33]" />
            </button>
          </div>

          <div className="pt-2 border-t border-stone-200">
            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  void onLogout();
                }}
                className="mb-3 w-full rounded-xl border border-stone-300 bg-white py-3 text-center font-bold text-stone-800 hover:border-emerald-600"
              >
                {user.full_name} · Sign out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick(onOpenAuth)}
                className="mb-3 w-full rounded-xl border border-[#165B33] bg-white py-3 text-center font-bold text-[#165B33] hover:bg-emerald-50"
              >
                Sign in
              </button>
            )}
            <button
              type="button"
              onClick={() => handleNavClick(onScrollToInput)}
              className="w-full bg-[#165B33] text-white text-center font-bold py-3 rounded-xl shadow-xs hover:bg-[#134E2E] cursor-pointer"
            >
              {t.nav.findMarket}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
