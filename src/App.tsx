import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FarmerInput } from './components/FarmerInput';
import { MarketResults } from './components/MarketResults';
import { HowItWorks } from './components/HowItWorks';
import { Benefits } from './components/Benefits';
import { Footer } from './components/Footer';
import { MarketPricesModal } from './components/MarketPricesModal';
import { AboutModal } from './components/AboutModal';
<<<<<<< HEAD
import { AuthModal } from './components/AuthModal';
import { FarmerDashboard } from './components/FarmerDashboard';
import { BuyerMarketplace } from './components/BuyerMarketplace';
import { Language, CropType, CalculatedMarketResult, FarmerInputData, MarketIntelligence } from './types';
import { getRecommendation } from './services/api';
import { AuthUser, getCurrentUser, hasRole, logout } from './services/auth';
=======
import { Language, CropType, CalculatedMarketResult, FarmerInputData } from './types';
import { getRecommendation } from './services/api';
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
import { getTranslation } from './utils/translations';

export default function App() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('smartmandi_language');
    if (saved && (saved === 'en' || saved === 'te' || saved === 'hi' || saved === 'mr')) {
      return saved as Language;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('smartmandi_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active query state
  const [currentCrop, setCurrentCrop] = useState<CropType | ''>('');
  const [currentQuantity, setCurrentQuantity] = useState<number>(0);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
  const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);
  const [marketResults, setMarketResults] = useState<CalculatedMarketResult[]>([]);
<<<<<<< HEAD
  const [marketIntelligence, setMarketIntelligence] = useState<MarketIntelligence | null>(null);
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isPricesModalOpen, setIsPricesModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
<<<<<<< HEAD
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c

  const handleCalculation = async (data: FarmerInputData, shouldScroll = true) => {
    setIsLoading(true);
    setCurrentCrop(data.crop);
    setCurrentQuantity(data.quantity);
    setCurrentLocation(data.location);
    setCurrentLatitude(data.latitude);
    setCurrentLongitude(data.longitude);

    try {
      setErrorMessage(null);
      const response = await getRecommendation(data);
      setMarketResults(response.all);
<<<<<<< HEAD
      setMarketIntelligence(response.intelligence || null);
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c

      if (shouldScroll) {
        setTimeout(() => {
          const resultsEl = document.getElementById('market-results-section');
          if (resultsEl) {
            resultsEl.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    } catch (error) {
      console.error('Error calculating market recommendations:', error);
      setMarketResults([]);
<<<<<<< HEAD
      setMarketIntelligence(null);
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
      setErrorMessage(error instanceof Error ? error.message : 'No markets found');
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToInput = () => {
    const inputEl = document.getElementById('farmer-input-section');
    if (inputEl) {
      inputEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToHowItWorks = () => {
    const section = document.getElementById('how-it-works');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8F3] text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onOpenMarketPrices={() => setIsPricesModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onScrollToInput={scrollToInput}
<<<<<<< HEAD
        user={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={async () => {
          await logout();
          setCurrentUser(null);
        }}
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          language={language}
          onFindMarketClick={scrollToInput}
          onHowItWorksClick={scrollToHowItWorks}
        />

<<<<<<< HEAD
        {hasRole(currentUser, ['FARMER', 'FPO']) && (
          <FarmerDashboard
            onAuthExpired={() => {
              void logout();
              setCurrentUser(null);
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {hasRole(currentUser, ['BUYER']) && (
          <BuyerMarketplace
            onAuthExpired={() => {
              void logout();
              setCurrentUser(null);
              setIsAuthModalOpen(true);
            }}
          />
        )}

=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
        {/* Farmer Input Section */}
        <FarmerInput
          language={language}
          onCalculate={(data) => handleCalculation(data, true)}
          isLoading={isLoading}
        />

        {/* Dynamic Market Results & Visual Decision Cards */}
        {marketResults.length > 0 && (
          <MarketResults
            results={marketResults}
            quantity={currentQuantity}
            crop={currentCrop}
            location={currentLocation}
            latitude={currentLatitude}
            longitude={currentLongitude}
            language={language}
<<<<<<< HEAD
            intelligence={marketIntelligence}
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
          />
        )}

        {/* Error Message for Missing Data */}
        {errorMessage && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-8" id="market-results-section">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-2xl shadow-sm flex items-start gap-3">
              <span className="text-amber-600 text-xl">ℹ️</span>
              <div>
                <p className="text-amber-900 font-bold text-lg">{getTranslation(language).input.noMarketData}</p>
                <p className="text-amber-700 font-medium text-sm mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* How It Works (Four-Step Flow) */}
        <HowItWorks language={language} />

        {/* Why SMARTMandi (Core Benefits) */}
        <Benefits language={language} />
      </main>

      {/* Footer */}
      <Footer
        language={language}
        onOpenMarketPrices={() => setIsPricesModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onScrollToInput={scrollToInput}
      />

      {/* Benchmark Prices Modal */}
      <MarketPricesModal
        isOpen={isPricesModalOpen}
        onClose={() => setIsPricesModalOpen(false)}
        language={language}
      />

      {/* About & Problem Statement Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
        language={language}
      />
<<<<<<< HEAD

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={setCurrentUser}
      />
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
    </div>
  );
}
