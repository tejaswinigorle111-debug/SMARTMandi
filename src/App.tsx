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
import { Language, CropType, CalculatedMarketResult, FarmerInputData } from './types';
import { getRecommendation } from './services/api';
import { getTranslation } from './utils/translations';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Active query state
  const [currentCrop, setCurrentCrop] = useState<CropType>('Tomato');
  const [currentQuantity, setCurrentQuantity] = useState<number>(1000);
  const [currentLocation, setCurrentLocation] = useState<string>('Nashik, Maharashtra');
  const [marketResults, setMarketResults] = useState<CalculatedMarketResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [isPricesModalOpen, setIsPricesModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Run initial calculation so the application is immediately interactive on load
  useEffect(() => {
    handleCalculation({
      crop: 'Tomato',
      quantity: 1000,
      location: 'Nashik, Maharashtra',
    }, false);
  }, []);

  const handleCalculation = async (data: FarmerInputData, shouldScroll = true) => {
    setIsLoading(true);
    setCurrentCrop(data.crop);
    setCurrentQuantity(data.quantity);
    setCurrentLocation(data.location);

    try {
      setErrorMessage(null);
      const response = await getRecommendation(data);
      setMarketResults(response.all);

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
      />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          language={language}
          onFindMarketClick={scrollToInput}
          onHowItWorksClick={scrollToHowItWorks}
        />

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
            language={language}
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
    </div>
  );
}
