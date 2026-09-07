import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Mic,
  MicOff,
  Search,
  Loader2,
  ChevronDown,
  Check,
  X,
} from 'lucide-react';
import { CropType, Language, FarmerInputData, CropCategory } from '../types';
import { cropOptions } from '../data/demoMarkets';
import { getTranslation } from '../utils/translations';
<<<<<<< HEAD
import { resolveLocation, reverseGeocode } from '../services/api';
=======
import { reverseGeocode } from '../services/api';
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
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

  // Form state
  const [crop, setCrop] = useState<CropType | ''>('');
  const [quantity, setQuantity] = useState<string>('');
  const [location, setLocation] = useState<string>('');
<<<<<<< HEAD
  const [pincode, setPincode] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [state, setState] = useState<string>('');
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);

  // Dropdown & Category filter state
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [cropSearch, setCropSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Geolocation & Speech state
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechStatus, setSpeechStatus] = useState<string | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Voice ambiguity state: number heard but unit unclear
  const [ambiguousNum, setAmbiguousNum] = useState<number | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter crops based on category and search query across all 4 languages
  const filteredCrops = cropOptions.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    const q = cropSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      item.labelEn.toLowerCase().includes(q) ||
      item.labelTe.toLowerCase().includes(q) ||
      item.labelHi.toLowerCase().includes(q) ||
      item.labelMr.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q)
    );
  });

  const selectedCropObj = cropOptions.find((c) => c.id === crop);

  // Helper for localized crop name
  const getCropName = (item: typeof cropOptions[0]) => {
    if (language === 'te') return item.labelTe;
    if (language === 'hi') return item.labelHi;
    if (language === 'mr') return item.labelMr;
    return item.labelEn;
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
        setLocationStatus(`${t.input.locationSuccess}${detectedName}`);
      },
      (error) => {
        setIsLocating(false);
        console.warn('Geolocation error:', error);
        let errorMsg = t.input.locationError;
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = t.input.locationDenied;
        }
        setLocationStatus(errorMsg);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  // Voice language mapping
  const voiceLangMap: Record<Language, string> = {
    en: 'en-IN',
    te: 'te-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
  };

  // Known location keywords for voice extraction
  const LOCATION_KEYWORDS = [
    'warangal', 'kurnool', 'khammam', 'hyderabad', 'nizamabad', 'karimnagar',
    'nalgonda', 'mahbubnagar', 'adilabad', 'vizag', 'visakhapatnam', 'vijayawada',
    'guntur', 'tirupati', 'kadapa', 'anantapur', 'nellore', 'ongole',
    'rajahmundry', 'eluru', 'srikakulam', 'nagpur', 'pune', 'nashik',
    'aurangabad', 'solapur', 'kolhapur', 'ahmednagar', 'indore', 'bhopal',
    'jabalpur', 'gwalior', 'ujjain', 'sagar', 'raipur', 'bilaspur',
    'వరంగల్', 'కర్నూలు', 'ఖమ్మం', 'హైదరాబాద్', 'నిజామాబాద్', 'విజయవాడ', 'గుంటూరు',
    'नागपुर', 'पुणे', 'इंदौर', 'भोपाल', 'वाराणसी', 'लखनऊ',
    'नाशिक', 'सोलापूर', 'कोल्हापूर', 'औरंगाबाद',
  ];

  // Web Speech API integration
  const handleToggleSpeech = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

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

    setAmbiguousNum(null);

    try {
      const recognition = new SpeechRecognition();
      speechRecognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = voiceLangMap[language] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechStatus(t.input.listening);
      };

      recognition.onresult = (event: any) => {
        const rawTranscript = event.results[0][0].transcript;
        const transcript = rawTranscript.toLowerCase().trim();
        setIsListening(false);
        setSpeechStatus(`🎙️ "${rawTranscript}"`);

        // CROP MATCHING across all 4 languages
        let detectedCrop: CropType | null = null;
        if (transcript.includes('tomato') || transcript.includes('टमाटर') || transcript.includes('टोमॅटो') || transcript.includes('టమోటా') || transcript.includes('టమాట')) {
          detectedCrop = 'Tomato';
        } else if (transcript.includes('rice') || transcript.includes('paddy') || transcript.includes('चावल') || transcript.includes('धान') || transcript.includes('तांदूळ') || transcript.includes('వరి') || transcript.includes('బియ్యం') || transcript.includes('వడ్లు')) {
          detectedCrop = 'Rice';
        } else if (transcript.includes('cotton') || transcript.includes('कपास') || transcript.includes('कापूस') || transcript.includes('పత్తి') || transcript.includes('దూది')) {
          detectedCrop = 'Cotton';
        } else if (transcript.includes('chilli') || transcript.includes('chili') || transcript.includes('मिर्च') || transcript.includes('मिरची') || transcript.includes('మిరప') || transcript.includes('మిర్చి') || transcript.includes('ఎండుమిర్చి') || transcript.includes('ఎండు మిరప')) {
          detectedCrop = 'Chilli';
        } else if (transcript.includes('maize') || transcript.includes('corn') || transcript.includes('मक्का') || transcript.includes('मका') || transcript.includes('మొక్కజొన్న')) {
          detectedCrop = 'Maize';
        } else if (transcript.includes('onion') || transcript.includes('प्याज') || transcript.includes('प्याज़') || transcript.includes('कांदा') || transcript.includes('ఉల్లిపాయ') || transcript.includes('ఉల్లి')) {
          detectedCrop = 'Onion';
        } else if (transcript.includes('potato') || transcript.includes('आलू') || transcript.includes('बटाटा') || transcript.includes('బంగాళాదుంప')) {
          detectedCrop = 'Potato';
        } else if (transcript.includes('soybean') || transcript.includes('सोयाबीन') || transcript.includes('సోయాబీన్')) {
          detectedCrop = 'Soybean';
        } else if (transcript.includes('wheat') || transcript.includes('गेहूं') || transcript.includes('गेहूँ') || transcript.includes('गहू') || transcript.includes('గోధుమ')) {
          detectedCrop = 'Wheat';
        } else if (transcript.includes('groundnut') || transcript.includes('peanut') || transcript.includes('मूंगफली') || transcript.includes('भुईमूग') || transcript.includes('వేరుశెనగ') || transcript.includes('వేరుశనగ') || transcript.includes('పల్లీ')) {
          detectedCrop = 'Groundnut';
        } else if (transcript.includes('turmeric') || transcript.includes('हल्दी') || transcript.includes('हळद') || transcript.includes('పసుపు')) {
          detectedCrop = 'Turmeric';
        } else if (transcript.includes('sugarcane') || transcript.includes('गन्ना') || transcript.includes('ऊस') || transcript.includes('చెరకు')) {
          detectedCrop = 'Sugarcane';
        } else if (transcript.includes('jowar') || transcript.includes('sorghum') || transcript.includes('ज्वार') || transcript.includes('ज्वारी') || transcript.includes('జొన్నలు')) {
          detectedCrop = 'Jowar';
        } else if (transcript.includes('bajra') || transcript.includes('pearl millet') || transcript.includes('बाजरा') || transcript.includes('बाजरी') || transcript.includes('సజ్జలు')) {
          detectedCrop = 'Bajra';
        } else if (transcript.includes('ragi') || transcript.includes('finger millet') || transcript.includes('रागी') || transcript.includes('नाचणी') || transcript.includes('రాగులు')) {
          detectedCrop = 'Ragi';
        } else if (transcript.includes('barley') || transcript.includes('जौ') || transcript.includes('जव') || transcript.includes('బార్లీ')) {
          detectedCrop = 'Barley';
        } else if (transcript.includes('mustard') || transcript.includes('सरसों') || transcript.includes('मोहरी') || transcript.includes('ఆవాలు')) {
          detectedCrop = 'Mustard';
        } else if (transcript.includes('sunflower') || transcript.includes('सूरजमुखी') || transcript.includes('सूर्यफूल') || transcript.includes('సూర్యకాంతి') || transcript.includes('పొద్దుతిరుగుడు')) {
          detectedCrop = 'Sunflower';
        } else if (transcript.includes('sesame') || transcript.includes('तिल') || transcript.includes('तीळ') || transcript.includes('నువ్వులు')) {
          detectedCrop = 'Sesame';
        } else if (transcript.includes('moong') || transcript.includes('green gram') || transcript.includes('मूंग') || transcript.includes('मूग') || transcript.includes('పెసలు')) {
          detectedCrop = 'Moong';
        } else if (transcript.includes('urad') || transcript.includes('black gram') || transcript.includes('उड़द') || transcript.includes('उडीद') || transcript.includes('మినుములు')) {
          detectedCrop = 'Urad';
        } else if (transcript.includes('masoor') || transcript.includes('lentil') || transcript.includes('मसूर') || transcript.includes('మసూర్') || transcript.includes('ఎర్ర కందులు')) {
          detectedCrop = 'Masoor';
        } else if (transcript.includes('cabbage') || transcript.includes('पत्तागोभी') || transcript.includes('कोबी') || transcript.includes('క్యాబేజీ')) {
          detectedCrop = 'Cabbage';
        } else if (transcript.includes('cauliflower') || transcript.includes('फूलगोभी') || transcript.includes('फ्लॉवर') || transcript.includes('క్యాలీఫ్లవర్')) {
          detectedCrop = 'Cauliflower';
        } else if (transcript.includes('brinjal') || transcript.includes('eggplant') || transcript.includes('बैंगन') || transcript.includes('वांगी') || transcript.includes('వంకాయ')) {
          detectedCrop = 'Brinjal';
        } else if (transcript.includes('okra') || transcript.includes('lady finger') || transcript.includes('ladyfinger') || transcript.includes('भिंडी') || transcript.includes('भेंडी') || transcript.includes('బెండకాయ')) {
          detectedCrop = 'Okra';
        } else if (transcript.includes('carrot') || transcript.includes('गाजर') || transcript.includes('క్యారెట్')) {
          detectedCrop = 'Carrot';
        } else if (transcript.includes('garlic') || transcript.includes('लहसुन') || transcript.includes('लसूण') || transcript.includes('వెల్లుల్లి')) {
          detectedCrop = 'Garlic';
        } else if (transcript.includes('ginger') || transcript.includes('अदरक') || transcript.includes('आले') || transcript.includes('అల్లం')) {
          detectedCrop = 'Ginger';
        } else if (transcript.includes('apple') || transcript.includes('सेब') || transcript.includes('सफरचंद') || transcript.includes('యాపిల్')) {
          detectedCrop = 'Apple';
        } else if (transcript.includes('orange') || transcript.includes('संतरा') || transcript.includes('संत्री') || transcript.includes('నారింజ') || transcript.includes('బత్తాయి')) {
          detectedCrop = 'Orange';
        } else if (transcript.includes('tur') || transcript.includes('pigeon pea') || transcript.includes('अरहर') || transcript.includes('तूर') || transcript.includes('కందులు') || transcript.includes('కంది')) {
          detectedCrop = 'Tur';
        } else if (transcript.includes('gram') || transcript.includes('chickpea') || transcript.includes('चना') || transcript.includes('हरभरा') || transcript.includes('శనగలు') || transcript.includes('శనగ')) {
          detectedCrop = 'Gram';
        } else if (transcript.includes('grapes') || transcript.includes('अंगूर') || transcript.includes('द्राक्षे') || transcript.includes('ద్రాక్ష')) {
          detectedCrop = 'Grapes';
        } else if (transcript.includes('mango') || transcript.includes('आम') || transcript.includes('आंबा') || transcript.includes('మామిడి')) {
          detectedCrop = 'Mango';
        } else if (transcript.includes('banana') || transcript.includes('केला') || transcript.includes('केळी') || transcript.includes('అరటి')) {
          detectedCrop = 'Banana';
        }
        if (detectedCrop) setCrop(detectedCrop);

        // UNIT KEYWORDS across all 4 languages
        const kgKeywords = [
          'kg', 'kilo', 'kilos', 'kilogram', 'kilograms',
          'కిలో', 'కేజీ', 'కిలోలు',
          'किलो', 'किलोग्राम', 'कि.ग्रा.',
          'किलोग्रॅम', 'कि.ग्रॅ.',
        ];
        const qtlKeywords = [
          'quintal', 'quintals', 'q ',
          'క్వింటా', 'క్వింటాలు', 'క్వింటాళ్లు',
          'क्विंटल', 'क्विंटल',
          'क्विंटल', 'क्विंटल्स',
        ];

        const isKg = kgKeywords.some((k) => transcript.includes(k));
        const isQtl = qtlKeywords.some((k) => transcript.includes(k));

        // QUANTITY PARSING
        const numMatch = transcript.match(/(\d+(?:[,.]\d+)?(?:\s*(?:hundred|thousand|lakh))?)/);
        const simpleNum = transcript.match(/(\d+(?:\.\d+)?)/);
        const rawNumStr = numMatch?.[1] || simpleNum?.[1] || null;
        const rawNum = rawNumStr ? parseFloat(rawNumStr.replace(/,/g, '')) : null;

        if (rawNum !== null && rawNum > 0) {
          if (isKg && !isQtl) {
            const inQtl = Math.round((rawNum / 100) * 10) / 10;
            const finalQtl = Math.max(0.1, inQtl);
            setQuantity(String(finalQtl));
            setSpeechStatus(
              `🎙️ ${t.input.voiceRecognizedKg
                .replace('{kg}', String(rawNum))
                .replace('{qtl}', String(finalQtl))}`
            );
            setAmbiguousNum(null);
          } else if (isQtl) {
            setQuantity(String(Math.round(rawNum)));
            setSpeechStatus(
              `🎙️ ${t.input.voiceRecognizedQtl.replace('{qty}', String(rawNum))}`
            );
            setAmbiguousNum(null);
          } else {
            setAmbiguousNum(rawNum);
            const converted = (rawNum / 100).toFixed(1);
            setSpeechStatus(
              `🎙️ ${t.input.voiceHeardAmbiguous
                .replace(/\{num\}/g, String(rawNum))
                .replace('{converted}', converted)}`
            );
          }
        }

        // LOCATION EXTRACTION
        const locationPhraseMatch = transcript.match(
          /(?:near|at|from|in|पास|में|से|जवळ|येथे|దగ్గర|వద్ద|నుండి)\s+([a-zA-Z\u0900-\u097F\u0C00-\u0C7F]+)/
        );
        if (locationPhraseMatch) {
          const extractedLoc = locationPhraseMatch[1];
          setLocation(extractedLoc.charAt(0).toUpperCase() + extractedLoc.slice(1));
        } else {
          const found = LOCATION_KEYWORDS.find((city) =>
            transcript.includes(city.toLowerCase())
          );
          if (found) {
            setLocation(found.charAt(0).toUpperCase() + found.slice(1));
          }
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setSpeechStatus(t.input.voiceError);
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

<<<<<<< HEAD
  const handleSubmit = async (e: React.FormEvent) => {
=======
  const handleSubmit = (e: React.FormEvent) => {
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
    e.preventDefault();
    const parsedQty = parseFloat(quantity);
    if (!parsedQty || parsedQty <= 0) {
      alert(t.input.invalidQuantity);
      return;
    }

    if (!crop) {
      alert(t.input.invalidCrop);
      return;
    }

<<<<<<< HEAD
    const manualLocation = [location.trim(), pincode.trim(), district.trim(), state.trim()].filter(Boolean).join(', ');
    if (!manualLocation) {
=======
    if (!location.trim()) {
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
      alert(t.input.invalidLocation);
      return;
    }

<<<<<<< HEAD
    let resolvedLatitude = latitude;
    let resolvedLongitude = longitude;
    if (resolvedLatitude === undefined || resolvedLongitude === undefined) {
      setIsLocating(true);
      setLocationStatus('Resolving manual location...');
      try {
        const resolved = await resolveLocation({ address: location, pincode, district, state });
        resolvedLatitude = resolved.latitude;
        resolvedLongitude = resolved.longitude;
        setLatitude(resolvedLatitude);
        setLongitude(resolvedLongitude);
        if (resolved.display_name) setLocation(resolved.display_name);
        setLocationStatus(`Location resolved using ${resolved.provider || 'official geocoding'}.`);
      } catch (error) {
        setLocationStatus(error instanceof Error ? error.message : 'Location could not be resolved.');
        setIsLocating(false);
        return;
      } finally {
        setIsLocating(false);
      }
    }

    onCalculate({
      crop,
      quantity: parsedQty * 100, // Convert Quintals to Kg for calculations
      location: manualLocation,
      latitude: resolvedLatitude,
      longitude: resolvedLongitude,
=======
    onCalculate({
      crop,
      quantity: parsedQty * 100, // Convert Quintals to Kg for calculations
      location: location.trim(),
      latitude,
      longitude,
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
    });
  };

  const categoryList: CropCategory[] = [
    'all',
    'vegetables',
    'fruits',
    'cereals',
    'pulses',
    'oilseeds',
    'commercial',
  ];

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
            <span>🌾</span> {t.input.sectionBadge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight font-display drop-shadow-xs">
            {t.input.heading}
          </h2>
          <p className="mt-2.5 text-lg sm:text-xl text-stone-800 font-bold max-w-2xl mx-auto">
            {t.input.subText}
          </p>
        </div>

        {/* Input Card Container */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border-2 border-stone-200/90">
          {/* Header & Voice Toggle */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
            <div>
              <h3 className="text-2xl font-black text-stone-900 font-display">
                {t.input.formTitle}
              </h3>
              <p className="text-stone-600 text-sm font-bold mt-1">
                {t.input.formSub}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-base font-black border-2 transition-all cursor-pointer shadow-xs ${
                isListening
                  ? 'bg-rose-100 text-rose-900 border-rose-500 animate-pulse'
                  : 'bg-[#165B33] text-white border-[#165B33] hover:bg-[#114828]'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>{t.input.listening}</span>
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>
                    {t.input.speakBtn} (
                    {language === 'te'
                      ? 'తెలుగు'
                      : language === 'hi'
                      ? 'हिन्दी'
                      : language === 'mr'
                      ? 'मराठी'
                      : 'English'}
                    )
                  </span>
                </>
              )}
            </button>
          </div>

          {speechStatus && isListening && (
            <div className="mb-6 p-3.5 bg-emerald-100 border border-emerald-300 rounded-xl text-sm font-bold text-emerald-950 flex items-center gap-2.5 shadow-xs">
              <Mic className="w-5 h-5 text-emerald-800 shrink-0" />
              <span>{speechStatus}</span>
            </div>
          )}

          {/* Step-by-Step Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-8"
            id="farmer-input-form"
          >
            {/* 1. SELECT CROP (SEARCHABLE DROPDOWN WITH LOCALIZED CATEGORIES) */}
            <div className="flex flex-col relative" ref={dropdownRef}>
              <label
                htmlFor="crop-dropdown-trigger"
                className="flex items-center gap-2.5 text-lg font-black text-stone-900 mb-3"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center font-black">
                  1
                </span>
                {t.input.step1}
              </label>

              {/* Dropdown Trigger Button */}
              <button
                type="button"
                id="crop-dropdown-trigger"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className={`w-full min-h-[58px] px-4 py-3 bg-white border-2 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-xs ${isDropdownOpen
                  ? 'border-[#165B33] ring-2 ring-[#165B33]/20 bg-emerald-50/10'
                  : crop
                    ? 'border-[#165B33] bg-emerald-50/20'
                    : 'border-stone-300 hover:border-emerald-600'
                  }`}
                aria-expanded={isDropdownOpen}
                aria-haspopup="listbox"
              >
                <div className="flex items-center gap-3 text-left overflow-hidden">
                  {selectedCropObj ? (
                    <>
                      <span className="text-2xl shrink-0">
                        {selectedCropObj.icon}
                      </span>
                      <div className="flex flex-wrap items-baseline gap-2 truncate">
                        <span className="text-base sm:text-lg font-black text-stone-950">
                          {getCropName(selectedCropObj)}

                        </span>
                        {language !== 'en' && (
                          <span className="text-sm font-semibold text-stone-500">
                            ({selectedCropObj.labelEn})
                          </span>
                        )}
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-2 py-0.5 rounded-md">
                          {t.categories[selectedCropObj.category]}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-stone-500 font-bold text-base">
                      <Search className="w-5 h-5 text-stone-400 shrink-0" />
                      <span>{t.input.cropPlaceholder}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className="text-xs font-bold text-stone-400 hidden sm:inline">
                    {cropOptions.length} {t.input.cropsCount}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-600 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-[#165B33]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Searchable Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  className="absolute left-0 right-0 top-full mt-2 z-40 bg-white border-2 border-stone-200 rounded-2xl shadow-2xl overflow-hidden"
                  id="crop-dropdown-menu"
                >
                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-stone-100/80 border-b border-stone-200 scrollbar-none">
                    {categoryList.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-black shrink-0 transition-all cursor-pointer ${
                          selectedCategory === cat
                            ? 'bg-[#165B33] text-white shadow-xs'
                            : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-300'
                        }`}
                      >
                        {t.categories[cat]}
                      </button>
                    ))}
                  </div>

                  {/* Search Input Bar */}
                  <div className="p-3 bg-stone-50 border-b border-stone-200 sticky top-0 z-10">
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        autoFocus
                        type="text"
                        value={cropSearch}
                        onChange={(e) => setCropSearch(e.target.value)}
                        placeholder={t.input.cropSearchPlaceholder}
                        className="w-full pl-10 pr-9 py-2.5 bg-white border-2 border-stone-200 rounded-xl text-sm font-bold text-stone-900 outline-hidden focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33] transition-all"
                      />
                      {cropSearch && (
                        <button
                          type="button"
                          onClick={() => setCropSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Scrollable list of crops */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                    {filteredCrops.length > 0 ? (
                      filteredCrops.map((item) => {
                        const isSelected = crop === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setCrop(item.id as CropType);
                              setIsDropdownOpen(false);
                              setCropSearch('');
                            }}
                            className={`w-full px-4 py-3 sm:py-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#E5F5E9] text-[#165B33] font-black'
                                : 'hover:bg-stone-50 text-stone-800'
                            }`}
                          >
                            <div className="flex items-center gap-3 truncate">
                              <span className="text-2xl shrink-0">
                                {item.icon}
                              </span>
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="text-base font-black text-stone-900">
                                    {getCropName(item)}
                                  </span>
                                  {language !== 'en' && (
                                    <span className="text-sm font-semibold text-stone-500">
                                      ({item.labelEn})
                                    </span>
                                  )}
                                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                    {t.categories[item.category]}
                                  </span>
                                </div>
                                {item.typicalYieldText && (
                                  <span className="block text-xs font-semibold text-stone-400 mt-0.5">
                                    {item.typicalYieldText}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 rounded-full bg-[#165B33] text-white flex items-center justify-center shrink-0 ml-2 shadow-xs">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-stone-500 text-sm font-bold">
                        {t.input.noCropsFound} "{cropSearch}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 2. QUANTITY (QUINTALS) */}
            <div className="flex flex-col pt-6 border-t border-stone-200">
              <label className="flex items-center gap-2.5 text-lg font-black text-stone-900 mb-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center font-black">
                  2
                </span>
                {t.input.step2}
              </label>

              <div className="bg-stone-50/70 p-5 sm:p-7 rounded-2xl border-2 border-stone-200 flex flex-col items-center shadow-xs">
                {/* Stepper buttons & Large Number Counter */}
                <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 w-full max-w-lg">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        String(Math.max(1, (parseInt(quantity) || 0) - 5))
                      )
                    }
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#165B33] text-white font-black text-lg sm:text-xl hover:bg-[#114828] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
                    title={`-5 ${t.input.quintalsLabel}`}
                  >
                    -5
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        String(Math.max(1, (parseInt(quantity) || 0) - 1))
                      )
                    }
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#165B33] text-white font-black text-lg sm:text-xl hover:bg-[#114828] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
                    title={`-1 ${t.input.quintalsLabel}`}
                  >
                    -1
                  </button>

                  <div className="flex-1 text-center px-4 py-2 bg-white rounded-xl border-2 border-stone-200 shadow-xs min-w-[120px] max-w-[180px]">
                    <span className="text-4xl sm:text-5xl font-black text-stone-950 font-display block leading-tight">
                      {quantity || '0'}
                    </span>
                    <span className="text-xs font-black text-[#165B33] uppercase tracking-wider block">
                      {t.input.quintalsLabel}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(String((parseInt(quantity) || 0) + 1))
                    }
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#165B33] text-white font-black text-lg sm:text-xl hover:bg-[#114828] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
                    title={`+1 ${t.input.quintalsLabel}`}
                  >
                    +1
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(String((parseInt(quantity) || 0) + 5))
                    }
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-[#165B33] text-white font-black text-lg sm:text-xl hover:bg-[#114828] active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
                    title={`+5 ${t.input.quintalsLabel}`}
                  >
                    +5
                  </button>
                </div>

                <div className="text-xs font-bold text-stone-600 mb-4 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                  <span>{t.input.conversionFormula}</span>
                  {quantity && parseInt(quantity) > 0 && (
                    <span className="text-stone-800 font-extrabold">
                      • ({parseInt(quantity) * 100} kg {t.input.totalKg})
                    </span>
                  )}
                </div>

                {/* Direct Number Input */}
                <div className="w-full max-w-lg pt-4 border-t border-stone-200">
                  <label
                    htmlFor="quantity-input"
                    className="text-xs font-black text-stone-700 mb-1.5 block"
                  >
                    {t.input.directQuantityLabel}
                  </label>
                  <div className="relative">
                    <input
                      id="quantity-input"
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={t.input.directQuantityPlaceholder}
                      className={`w-full bg-white border-2 rounded-xl px-4 py-3 text-base outline-hidden transition-all pr-24 ${
                        quantity
                          ? 'border-[#165B33] ring-1 ring-[#165B33] font-black text-stone-950 bg-emerald-50/20'
                          : 'border-stone-300 hover:border-stone-400 font-bold text-stone-600'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-stone-600 text-sm font-black">
                      {t.input.quintalsLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VOICE INPUT (between Quantity & Location) */}
            <div className="flex flex-col pt-6 border-t border-stone-200">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <button
                  type="button"
                  id="voice-search-btn"
                  onClick={handleToggleSpeech}
                  className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-black text-sm transition-all cursor-pointer shadow-sm ${
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-[#165B33] text-white hover:bg-[#114828]'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5" /> {t.input.listening}
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" /> {t.input.speakBtn}
                    </>
                  )}
                </button>
                <span className="text-xs font-bold text-stone-500">
                  {t.input.voiceInstruction}
                </span>
              </div>

              {/* Speech Status */}
              {speechStatus && (
                <p className="text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 mb-2">
                  {speechStatus}
                </p>
              )}

              {/* Ambiguity Resolution Buttons */}
              {ambiguousNum !== null && (
                <div className="flex flex-wrap gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setQuantity(String(Math.round(ambiguousNum)));
                      setAmbiguousNum(null);
                      setSpeechStatus(
                        `✅ ${t.input.voiceSetQtl.replace('{num}', String(ambiguousNum))}`
                      );
                    }}
                    className="px-4 py-2 bg-[#165B33] text-white text-sm font-black rounded-lg cursor-pointer hover:bg-[#114828]"
                  >
                    {ambiguousNum} {t.input.quintalsLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const inQtl =
                        Math.max(0.1, Math.round((ambiguousNum / 100) * 10) / 10);
                      setQuantity(String(inQtl));
                      setAmbiguousNum(null);
                      setSpeechStatus(
                        `✅ ${t.input.voiceSetKg
                          .replace('{num}', String(ambiguousNum))
                          .replace('{converted}', String(inQtl))}`
                      );
                    }}
                    className="px-4 py-2 bg-amber-600 text-white text-sm font-black rounded-lg cursor-pointer hover:bg-amber-700"
                  >
                    {ambiguousNum} {t.input.kgLabel} (
                    {(ambiguousNum / 100).toFixed(1)} {t.input.qtlLabel})
                  </button>
                </div>
              )}
            </div>

            {/* 3. YOUR LOCATION */}
            <div className="flex flex-col pt-6 border-t border-stone-200">
              <label
                htmlFor="location-input"
                className="flex items-center gap-2.5 text-lg font-black text-stone-900 mb-3"
              >
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center font-black">
                  3
                </span>
                {t.input.step3}
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    id="location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={t.input.locationPlaceholder}
                    required
                    className={`w-full bg-white border-2 rounded-xl px-4 py-3.5 pl-11 text-base outline-hidden transition-all ${
                      location
                        ? 'border-[#165B33] ring-1 ring-[#165B33] font-black text-stone-950 bg-emerald-50/30'
                        : 'border-stone-300 hover:border-stone-400 font-bold text-stone-600'
                    }`}
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <MapPin
                      className={`w-5 h-5 ${
                        location ? 'text-[#165B33]' : 'text-stone-400'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="shrink-0 flex justify-center items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-900 border-2 border-stone-300 px-6 py-3.5 rounded-xl font-black transition-colors cursor-pointer"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />{' '}
                      {t.input.locationDetecting}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5 text-emerald-800" />{' '}
                      {t.input.useLocationBtn}
                    </>
                  )}
                </button>
              </div>

              {locationStatus && (
                <p
                  className={`mt-2 text-sm font-bold flex items-center gap-1.5 ${
                    locationStatus.includes('Error') ||
                    locationStatus.includes('denied') ||
                    locationStatus.includes('Could not') ||
                    locationStatus.includes('निराకరించ') ||
                    locationStatus.includes('अस्वीकृत') ||
                    locationStatus.includes('नाकारली')
                      ? 'text-rose-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {locationStatus}
                </p>
              )}
<<<<<<< HEAD

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <label className="text-sm font-black text-stone-700">Pincode<input value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" maxLength={6} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>
                <label className="text-sm font-black text-stone-700">District<input value={district} onChange={(event) => setDistrict(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>
                <label className="text-sm font-black text-stone-700">State<input value={state} onChange={(event) => setState(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>
              </div>
=======
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
            </div>

            {/* 4. ANALYZE MARKETS */}
            <div className="pt-6 border-t border-stone-200">
              <label className="flex items-center gap-2.5 text-lg font-black text-stone-900 mb-4">
                <span className="w-7 h-7 rounded-full bg-emerald-100 text-[#165B33] text-sm flex items-center justify-center font-black">
                  4
                </span>
                {t.input.step4}
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#165B33] hover:bg-[#114828] active:scale-[0.99] text-white text-xl font-black py-5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 tracking-wide disabled:opacity-70 disabled:hover:bg-[#165B33] cursor-pointer"
                id="btn-find-best-market-main"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-200" />{' '}
                    <span>{t.input.analyzing}</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6 text-emerald-200" />{' '}
                    <span>{t.input.submitBtn}</span>
                  </>
                )}
              </button>
              <p className="text-center text-sm font-bold text-stone-600 mt-3.5 max-w-xl mx-auto">
                {t.input.disclaimerText}
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
