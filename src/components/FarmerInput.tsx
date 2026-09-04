import React, { useState, useRef } from 'react';
import { MapPin, Mic, MicOff, Search, Loader2 } from 'lucide-react';
import { CropType, Language, FarmerInputData } from '../types';
import { cropOptions } from '../data/demoMarkets';
import { getTranslation } from '../utils/translations';
import vibrantHarvestImage from '../assets/images/vibrant_harvest_fields_1788514203779.jpg';
import scenicFarmImage from '../assets/images/scenic_farm_backdrop_1788514179084.jpg';

interface FarmerInputProps {
  language: Language;
  onCalculate: (data: FarmerInputData) => void;
  isLoading?: boolean;
}

export const FarmerInput: React.FC<FarmerInputProps> = ({
  language,
  onCalculate,
  isLoading = false,
}) => {
  const t = getTranslation(language);

  const [crop, setCrop] = useState<CropType>('Tomato');
  const [quantity, setQuantity] = useState<string>('1000');
  const [location, setLocation] = useState<string>('Nandyal, Andhra Pradesh');
  const [latitude, setLatitude] = useState<number | undefined>(15.48);
  const [longitude, setLongitude] = useState<number | undefined>(78.48);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Quick preset buttons for instant test matching reference image
  const handleQuickPreset = (pCrop: CropType, pQty: string, pLoc: string) => {
    setCrop(pCrop);
    setQuantity(pQty);
    setLocation(pLoc);
    setLocationStatus(null);
    setSpeechStatus(null);
  };

  // Browser Geolocation integration
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t.input.locationError);
      return;
    }

    setIsLocating(true);
    setLocationStatus(t.input.locationDetecting);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        const detectedName = `Nandyal Rural (${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E)`;
        setLocation(detectedName);
        setLocationStatus(`${t.input.locationSuccess} ${detectedName}`);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        setLocation('Nandyal, Andhra Pradesh');
        setLocationStatus('Using regional location (Nandyal, Andhra Pradesh).');
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Web Speech API integration
  const handleToggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechStatus(t.input.speechNotSupported);
      return;
    }

    if (isListening) {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatus(t.input.listening);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        setIsListening(false);
        setSpeechStatus(`Recognized: "${transcript}"`);

        if (transcript.includes('tomato') || transcript.includes('టమాటో')) {
          setCrop('Tomato');
        } else if (transcript.includes('rice') || transcript.includes('వరి') || transcript.includes('paddy')) {
          setCrop('Rice');
        } else if (transcript.includes('cotton') || transcript.includes('పత్తి')) {
          setCrop('Cotton');
        } else if (transcript.includes('chilli') || transcript.includes('మిర్చి')) {
          setCrop('Chilli');
        } else if (transcript.includes('maize') || transcript.includes('మొక్కజొన్న') || transcript.includes('corn')) {
          setCrop('Maize');
        }

        const numbers = transcript.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          setQuantity(numbers[0]);
        }

        if (transcript.includes('nandyal') || transcript.includes('నంద్యాల')) {
          setLocation('Nandyal, Andhra Pradesh');
        } else if (transcript.includes('kurnool') || transcript.includes('కర్నూలు')) {
          setLocation('Kurnool, Andhra Pradesh');
        } else if (transcript.includes('adoni') || transcript.includes('ఆదోని')) {
          setLocation('Adoni, Andhra Pradesh');
        } else if (transcript.includes('guntur') || transcript.includes('గుంటూరు')) {
          setLocation('Guntur, Andhra Pradesh');
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setSpeechStatus('Could not capture voice clearly. Please try speaking again or type.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setSpeechStatus(t.input.speechNotSupported);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = parseFloat(quantity);
    if (!parsedQty || parsedQty <= 0) {
      alert('Please enter a valid harvest quantity in kilograms.');
      return;
    }

    onCalculate({
      crop,
      quantity: parsedQty,
      location: location || 'Nandyal, Andhra Pradesh',
      latitude,
      longitude,
    });
  };

  return (
    <section
      id="farmer-input-section"
      className="relative py-14 sm:py-20 scroll-mt-20 border-b border-emerald-900/15 overflow-hidden bg-linear-to-b from-[#E2EFE3] via-[#ECF5EE] to-[#E5EFE6]"
    >
      {/* Shaded agricultural farming backdrop with flourishing green crops and golden harvest rows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={vibrantHarvestImage}
          alt="Vibrant Farmland Harvest Fields"
          className="w-full h-full object-cover object-center opacity-35 mix-blend-multiply filter contrast-110 saturate-120"
          referrerPolicy="no-referrer"
        />
        {/* Soft atmospheric farming vignette */}
        <div className="absolute inset-0 bg-linear-to-t from-[#E5EFE6] via-transparent to-[#E2EFE3]/75" />
      </div>

      {/* Decorative atmospheric vegetable crop shades & warm sunlight */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-radial from-emerald-400/25 via-amber-200/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-72 bg-radial from-red-500/10 via-emerald-200/10 to-transparent blur-2xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-9">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-emerald-800/20 text-emerald-950 text-sm font-extrabold uppercase tracking-wide mb-3 shadow-xs">
            <span>🌾</span> Farmer Market Calculator
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight font-display drop-shadow-xs">
            {t.input.heading}
          </h2>
          <p className="mt-2.5 text-lg sm:text-xl text-stone-800 font-bold max-w-2xl mx-auto">
            {t.input.subText}
          </p>
        </div>

        {/* Input Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-md border border-stone-300">
          <form onSubmit={handleSubmit} className="space-y-7" id="farmer-input-form">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 1. CROP SELECTION */}
              <div className="flex flex-col">
                <label
                  htmlFor="crop-select"
                  className="block text-base font-extrabold text-stone-900 mb-2.5"
                >
                  1. Select Crop
                </label>
                <div className="relative">
                  <select
                    id="crop-select"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value as CropType)}
                    className="w-full bg-white border-2 border-stone-300 hover:border-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/30 text-stone-950 font-bold rounded-xl px-4 py-3.5 text-base outline-hidden transition-all appearance-none cursor-pointer"
                  >
                    {cropOptions.map((item) => (
                      <option key={item.id} value={item.id} className="py-2 text-base font-semibold">
                        {item.icon} {language === 'te' ? item.labelTe : item.labelEn}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-stone-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. QUANTITY INPUT */}
              <div className="flex flex-col">
                <label
                  htmlFor="quantity-input"
                  className="block text-base font-extrabold text-stone-900 mb-2.5"
                >
                  2. Quantity
                </label>
                <div className="relative">
                  <input
                    id="quantity-input"
                    type="number"
                    min="10"
                    max="100000"
                    step="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t.input.quantityPlaceholder}
                    required
                    className="w-full bg-white border-2 border-stone-300 hover:border-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/30 text-stone-950 font-bold rounded-xl px-4 py-3.5 text-base outline-hidden transition-all pr-14"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-stone-700 text-base font-extrabold">
                    kg
                  </div>
                </div>
              </div>

              {/* 3. LOCATION INPUT & INLINE USE MY LOCATION BUTTON */}
              <div className="flex flex-col">
                <label
                  htmlFor="location-input"
                  className="block text-base font-extrabold text-stone-900 mb-2.5"
                >
                  3. Your Location
                </label>
                <div className="relative flex items-center">
                  <input
                    id="location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.input.locationPlaceholder}
                    required
                    className="w-full bg-white border-2 border-stone-300 hover:border-stone-400 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/30 text-stone-950 font-bold rounded-xl px-4 py-3.5 text-base outline-hidden transition-all pr-40"
                  />
                  <div className="absolute right-2 flex items-center">
                    <button
                      type="button"
                      onClick={handleUseMyLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-extrabold cursor-pointer transition-colors shadow-2xs"
                      id="btn-use-my-location"
                    >
                      {isLocating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-800" />
                      ) : (
                        <MapPin className="w-3.5 h-3.5 text-emerald-800" />
                      )}
                      <span>Locate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-blocking feedback bars for Geolocation & Speech */}
            {(locationStatus || speechStatus) && (
              <div className="space-y-2">
                {locationStatus && (
                  <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-sm font-bold text-stone-900 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>{locationStatus}</span>
                  </div>
                )}
                {speechStatus && (
                  <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-emerald-800 shrink-0" />
                    <span>{speechStatus}</span>
                  </div>
                )}
              </div>
            )}

            {/* Sub-bar: Quick Test Presets on Left, Voice Input on Right */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-sm font-black text-stone-900 mr-1">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Tomato', '1000', 'Nandyal, Andhra Pradesh')}
                  className={`text-sm px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer font-bold ${
                    crop === 'Tomato' && quantity === '1000'
                      ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-black shadow-xs'
                      : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  1,000 kg Tomato
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Cotton', '3000', 'Adoni, Andhra Pradesh')}
                  className={`text-sm px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer font-bold ${
                    crop === 'Cotton' && quantity === '3000'
                      ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-black shadow-xs'
                      : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  3,000 kg Cotton
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Chilli', '800', 'Guntur, Andhra Pradesh')}
                  className={`text-sm px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer font-bold ${
                    crop === 'Chilli' && quantity === '800'
                      ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-black shadow-xs'
                      : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  800 kg Chilli
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('Maize', '2000', 'Kurnool, Andhra Pradesh')}
                  className={`text-sm px-3.5 py-2 rounded-xl border-2 transition-all cursor-pointer font-bold ${
                    crop === 'Maize' && quantity === '2000'
                      ? 'bg-emerald-100 border-emerald-700 text-emerald-950 font-black shadow-xs'
                      : 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  2,000 kg Maize
                </button>
              </div>

              {/* Voice Input */}
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-black text-stone-900">Voice:</span>
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black border-2 transition-all cursor-pointer ${
                    isListening
                      ? 'bg-rose-100 text-rose-900 border-rose-500 animate-pulse'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-emerald-700 hover:text-emerald-900 shadow-2xs'
                  }`}
                  id="btn-voice-input"
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-rose-700" />
                      <span>{t.input.listening}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-emerald-700" />
                      <span>Speak</span>
                      <span className="text-stone-600 font-bold">EN / తెలుగు</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Primary Full-Width Action Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#165B33] hover:bg-[#114828] active:scale-[0.99] text-white text-lg font-black py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-3 tracking-wide"
                id="btn-find-best-market-main"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-200" />
                    <span>Analyzing Mandis & Transport Rates...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6 text-emerald-200" />
                    <span>Find Best Market</span>
                  </>
                )}
              </button>
              <p className="text-center text-sm font-bold text-stone-700 mt-2.5">
                We compare prices, transport distance and fuel cost to calculate your true net return
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
