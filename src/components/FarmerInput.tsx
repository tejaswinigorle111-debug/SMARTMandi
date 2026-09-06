import React, { useState, useRef } from 'react';
import { MapPin, Mic, MicOff, Search, Loader2 } from 'lucide-react';
import { CropType, Language, FarmerInputData } from '../types';
import { cropOptions } from '../data/demoMarkets';
import { getTranslation } from '../utils/translations';
import { reverseGeocode } from '../services/api';
import vibrantHarvestImage from '../assets/images/vibrant_harvest_fields_1788514203779.jpg';

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

  // Start with clean slate
  const [crop, setCrop] = useState<CropType | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Browser Geolocation integration
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t.input.locationError || 'Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationStatus(t.input.locationDetecting || 'Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        let detectedName = `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        try {
          detectedName = await reverseGeocode(lat, lng);
        } catch {
          // Coordinates remain as a truthful fallback if reverse geocoding is unavailable.
        }
        setIsLocating(false);
        setLocation(detectedName);
        setLocationStatus(`${t.input.locationSuccess || 'Location acquired:'} ${detectedName}`);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);

        let errorMsg = 'Could not get location. Please type it manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enter it manually.';
        }
        setLocationStatus(errorMsg);
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

        if (transcript.includes('tomato') || transcript.includes('టమోటా') || transcript.includes('టమాట')) {
          setCrop('Tomato');
        } else if (transcript.includes('rice') || transcript.includes('paddy') || transcript.includes('వరి') || transcript.includes('బియ్యం') || transcript.includes('వడ్లు')) {
          setCrop('Rice');
        } else if (transcript.includes('cotton') || transcript.includes('పత్తి') || transcript.includes('దూది')) {
          setCrop('Cotton');
        } else if (transcript.includes('chilli') || transcript.includes('chili') || transcript.includes('మిరప') || transcript.includes('మిర్చి') || transcript.includes('ఎండుమిర్చి')) {
          setCrop('Chilli');
        } else if (transcript.includes('maize') || transcript.includes('corn') || transcript.includes('మొక్కజొన్న') || transcript.includes('జొన్న')) {
          setCrop('Maize');
        } else if (transcript.includes('onion') || transcript.includes('ఉల్లిపాయ') || transcript.includes('ఉల్లి')) {
          setCrop('Onion');
        } else if (transcript.includes('potato') || transcript.includes('బంగాళాదుంప') || transcript.includes('ఆలూ')) {
          setCrop('Potato');
        } else if (transcript.includes('soybean') || transcript.includes('సోయాబీన్') || transcript.includes('సోయా')) {
          setCrop('Soybean');
        } else if (transcript.includes('wheat') || transcript.includes('గోధుమలు') || transcript.includes('గోధుమ')) {
          setCrop('Wheat');
        } else if (transcript.includes('groundnut') || transcript.includes('వేరుశనగ') || transcript.includes('పల్లీ')) {
          setCrop('Groundnut');
        } else if (transcript.includes('tur') || transcript.includes('కందులు') || transcript.includes('కంది')) {
          setCrop('Tur');
        } else if (transcript.includes('gram') || transcript.includes('శనగలు') || transcript.includes('శనగ')) {
          setCrop('Gram');
        } else if (transcript.includes('grapes') || transcript.includes('ద్రాక్ష')) {
          setCrop('Grapes');
        } else if (transcript.includes('mango') || transcript.includes('మామిడి')) {
          setCrop('Mango');
        } else if (transcript.includes('banana') || transcript.includes('అరటి')) {
          setCrop('Banana');
        }

        const numbers = transcript.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          setQuantity(numbers[0]);
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
      alert(language === 'te' ? 'దయచేసి సరైన పరిమాణాన్ని క్వింటాళ్లలో నమోదు చేయండి.' : 'Please enter a valid harvest quantity in quintals.');
      return;
    }

    if (!crop) {
      alert(language === 'te' ? 'దయచేసి ఒక పంటను ఎంచుకోండి.' : 'Please select a crop.');
      return;
    }

    if (!location.trim()) {
      alert(language === 'te' ? 'దయచేసి మీ ప్రాంతాన్ని నమోదు చేయండి.' : 'Please enter your location.');
      return;
    }

    onCalculate({
      crop,
      quantity: parsedQty * 100, // Convert Quintals back to Kg for backend
      location: location.trim(),
      latitude,
      longitude,
    });
  };

  return (
    <section
      id="farmer-input-section"
      className="relative py-14 sm:py-20 scroll-mt-20 border-b border-emerald-900/15 overflow-hidden bg-linear-to-b from-[#E2EFE3] via-[#ECF5EE] to-[#E5EFE6]"
    >
      {/* Background Images */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src={vibrantHarvestImage}
          alt="Vibrant Farmland Harvest Fields"
          className="w-full h-full object-cover object-center opacity-35 mix-blend-multiply filter contrast-110 saturate-120"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#E5EFE6] via-transparent to-[#E2EFE3]/75" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-xs border border-emerald-800/20 text-emerald-950 text-sm font-extrabold uppercase tracking-wide mb-3 shadow-xs">
            <span>🌾</span> {language === 'te' ? 'రైతు మార్కెట్ క్యాలిక్యులేటర్' : 'Farmer Market Calculator'}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight font-display drop-shadow-xs">
            {t.input.heading}
          </h2>
          <p className="mt-2.5 text-lg sm:text-xl text-stone-800 font-bold max-w-2xl mx-auto">
            {t.input.subText}
          </p>
        </div>

        {/* Input Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 sm:p-10 shadow-md border border-stone-300">

          {/* Voice Search Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-6 border-b border-stone-200">
            <div>
              <h3 className="text-xl font-black text-stone-900">
                {language === 'te' ? 'మీ వివరాలను నమోదు చేయండి' : 'Enter Your Details'}
              </h3>
              <p className="text-stone-600 text-sm font-bold mt-1">
                {language === 'te' ? 'ఉత్తమ మార్కెట్‌ను కనుగొనడానికి అన్ని దశలను పూర్తి చేయండి' : 'Complete all steps to find the best market'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-base font-black border-2 transition-all cursor-pointer shadow-xs ${isListening
                  ? 'bg-rose-100 text-rose-900 border-rose-500 animate-pulse'
                  : 'bg-[#165B33] text-white border-[#165B33] hover:bg-[#114828]'
                }`}
            >
              {isListening ? (
                <><MicOff className="w-5 h-5" /><span>{t.input.listening}</span></>
              ) : (
                <><Mic className="w-5 h-5" /><span>{language === 'te' ? 'వాయిస్ సెర్చ్' : 'Voice Search'} ({t.input.langSwitch})</span></>
              )}
            </button>
          </div>

          {(speechStatus && isListening) && (
            <div className="mb-6 p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 flex items-center gap-2.5">
              <Mic className="w-5 h-5 text-emerald-800 shrink-0" />
              <span>{speechStatus}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8" id="farmer-input-form">

            {/* Step 1 & 2 Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 1. CROP SELECTION */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-lg font-black text-stone-900 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center">1</span>
                  {t.input.cropLabel || 'Select Crop'}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {cropOptions.map((item) => {
                    const isSelected = crop === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCrop(item.id as CropType)}
                        className={`flex min-h-[84px] flex-col items-center justify-center p-2 rounded-xl border-2 transition-all cursor-pointer ${isSelected
                            ? 'border-[#165B33] bg-[#E5F5E9] shadow-sm'
                            : 'border-stone-200 bg-white hover:border-[#82C394] hover:bg-stone-50'
                          }`}
                      >
                        <span className="text-2xl leading-none mb-1">{item.icon}</span>
                        <span className={`text-xs font-bold text-center leading-tight ${isSelected ? 'text-[#165B33]' : 'text-stone-700'}`}>
                          {language === 'te' ? item.labelTe : item.labelEn}<br />
                          <span className="text-[10px] font-semibold opacity-80">
                            ({language === 'te' ? item.labelEn : item.labelTe})
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. QUANTITY INPUT (QUINTALS) */}
              <div className="flex flex-col">
                <label className="flex items-center gap-2 text-lg font-black text-stone-900 mb-4">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center">2</span>
                  {t.input.quantityLabel || 'Quantity (Quintals)'}
                </label>

                <div className="bg-white p-5 rounded-xl border-2 border-stone-200 shadow-xs flex flex-col items-center">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 w-full">
                    <button type="button" onClick={() => setQuantity(String(Math.max(1, (parseInt(quantity) || 0) - 5)))} className="w-12 h-12 rounded-lg bg-[#165B33] text-white font-black text-lg hover:bg-[#114828] transition-colors">-5</button>
                    <button type="button" onClick={() => setQuantity(String(Math.max(1, (parseInt(quantity) || 0) - 1)))} className="w-12 h-12 rounded-lg bg-[#165B33] text-white font-black text-lg hover:bg-[#114828] transition-colors">-1</button>

                    <div className="flex-1 max-w-[120px] text-center">
                      <span className="text-4xl font-black text-stone-950 font-display">{quantity || '0'}</span>
                      <span className="text-sm font-bold text-stone-600 block mt-1">{language === 'te' ? 'క్వింటాళ్లు' : 'quintals'}</span>
                    </div>

                    <button type="button" onClick={() => setQuantity(String((parseInt(quantity) || 0) + 1))} className="w-12 h-12 rounded-lg bg-[#165B33] text-white font-black text-lg hover:bg-[#114828] transition-colors">+1</button>
                    <button type="button" onClick={() => setQuantity(String((parseInt(quantity) || 0) + 5))} className="w-12 h-12 rounded-lg bg-[#165B33] text-white font-black text-lg hover:bg-[#114828] transition-colors">+5</button>
                  </div>
                  <div className="text-xs font-bold text-stone-500 mb-4">
                    {language === 'te' ? '1 క్వింటా = 100 కిలోలు' : '1 Quintal = 100 kg'}
                  </div>

                  <div className="w-full relative mt-2 pt-4 border-t border-stone-100">
                    <label htmlFor="quantity-input" className="text-xs font-bold text-stone-500 mb-1.5 block">
                      {language === 'te' ? 'లేదా నేరుగా సంఖ్యను నమోదు చేయండి:' : 'Or enter number directly:'}
                    </label>
                    <input
                      id="quantity-input"
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 25"
                      className={`w-full bg-stone-50 border-2 rounded-lg px-4 py-3 text-base outline-hidden transition-all pr-20 ${quantity ? 'border-[#165B33] ring-1 ring-[#165B33] font-black text-stone-950 bg-emerald-50/20' : 'border-stone-300 hover:border-stone-400 font-bold text-stone-600'
                        }`}
                    />
                    <div className="absolute bottom-0 right-0 h-12 flex items-center pr-4 pointer-events-none text-stone-600 text-sm font-bold">
                      {language === 'te' ? 'క్వింటాళ్లు' : 'quintals'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. LOCATION INPUT */}
            <div className="flex flex-col pt-4 border-t border-stone-100">
              <label htmlFor="location-input" className="flex items-center gap-2 text-lg font-black text-stone-900 mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center">3</span>
                {t.input.locationLabel || 'Your Location'}
              </label>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    id="location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.input.locationPlaceholder || "Enter city, district or village"}
                    required
                    className={`w-full bg-white border-2 rounded-xl px-4 py-4 pl-11 text-base outline-hidden transition-all ${location ? 'border-[#165B33] ring-1 ring-[#165B33] font-black text-stone-950 bg-emerald-50/30' : 'border-stone-300 hover:border-stone-400 font-bold text-stone-600'
                      }`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <MapPin className={`w-5 h-5 ${location ? 'text-[#165B33]' : 'text-stone-400'}`} />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="shrink-0 flex justify-center items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border-2 border-stone-200 px-6 py-4 rounded-xl font-black transition-colors cursor-pointer"
                >
                  {isLocating ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t.input.locationDetecting || 'Locating...'}</>
                  ) : (
                    <><MapPin className="w-5 h-5" /> {t.input.useLocationBtn || 'Use GPS'}</>
                  )}
                </button>
              </div>

              {locationStatus && (
                <p className={`mt-2.5 text-sm font-bold flex items-center gap-1.5 ${locationStatus.includes('Error') || locationStatus.includes('denied') || locationStatus.includes('Could not') ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {locationStatus}
                </p>
              )}
            </div>

            {/* 4. SUBMIT */}
            <div className="pt-6 border-t border-stone-200">
              <label className="flex items-center gap-2 text-lg font-black text-stone-900 mb-4">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center">4</span>
                {language === 'te' ? 'మార్కెట్లను విశ్లేషించండి' : 'Analyze Markets'}
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#165B33] hover:bg-[#114828] text-white text-xl font-black py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 tracking-wide disabled:opacity-70 disabled:hover:bg-[#165B33] cursor-pointer"
              >
                {isLoading ? (
                  <><Loader2 className="w-6 h-6 animate-spin text-emerald-200" /> <span>{t.input.analyzing || 'Calculating...'}</span></>
                ) : (
                  <><Search className="w-6 h-6 text-emerald-200" /> <span>{t.input.submitBtn || 'Find Best Market'}</span></>
                )}
              </button>
              <p className="text-center text-sm font-bold text-stone-600 mt-3">
                {t.input.disclaimerText || 'Calculations include transport costs based on distance.'}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
