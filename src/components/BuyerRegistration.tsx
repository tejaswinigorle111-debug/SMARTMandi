import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  Scale,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Check,
  X,
  Store,
  Sparkles,
  Layers,
  RotateCcw,
} from 'lucide-react';
import {
  Language,
  BuyerRegistrationFormData,
  BuyerType,
  QuantityUnit,
  BuyingFrequency,
  CropCategory,
} from '../types';
import { cropOptions } from '../data/demoMarkets';
import { getTranslation } from '../utils/translations';

interface BuyerRegistrationProps {
  language: Language;
  onBack: () => void;
}

const indianStates: { en: string; te: string }[] = [
  { en: 'Andhra Pradesh', te: 'ఆంధ్రప్రదేశ్' },
  { en: 'Telangana', te: 'తెలంగాణ' },
  { en: 'Maharashtra', te: 'మహారాష్ట్ర' },
  { en: 'Karnataka', te: 'కర్ణాటక' },
  { en: 'Tamil Nadu', te: 'తమిళనాడు' },
  { en: 'Madhya Pradesh', te: 'మధ్యప్రదేశ్' },
  { en: 'Uttar Pradesh', te: 'ఉత్తరప్రదేశ్' },
  { en: 'Gujarat', te: 'గుజరాత్' },
  { en: 'Punjab', te: 'పంజాబ్' },
  { en: 'Haryana', te: 'హర్యానా' },
  { en: 'Rajasthan', te: 'రాజస్థాన్' },
  { en: 'West Bengal', te: 'పశ్చిమ బెంగాల్' },
  { en: 'Odisha', te: 'ఒడిశా' },
  { en: 'Bihar', te: 'బీహార్' },
  { en: 'Kerala', te: 'కేరళ' },
];

export const BuyerRegistration: React.FC<BuyerRegistrationProps> = ({
  language,
  onBack,
}) => {
  const t = getTranslation(language);
  const br = t.buyerRegistration;

  const initialForm: BuyerRegistrationFormData = {
    fullName: '',
    businessName: '',
    buyerType: '',
    mobileNumber: '',
    email: '',
    state: '',
    district: '',
    marketArea: '',
    businessAddress: '',
    preferredCrops: [],
    minQuantity: '',
    maxQuantity: '',
    quantityUnit: 'quintal',
    minPrice: '',
    maxPrice: '',
    buyingFrequency: '',
  };

  const [formData, setFormData] = useState<BuyerRegistrationFormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedData, setSubmittedData] = useState<BuyerRegistrationFormData | null>(null);

  // Crop search and category filter state
  const [cropSearch, setCropSearch] = useState<string>('');
  const [selectedCropCategory, setSelectedCropCategory] = useState<CropCategory>('all');

  const filteredCrops = useMemo(() => {
    return cropOptions.filter((item) => {
      if (selectedCropCategory !== 'all' && item.category !== selectedCropCategory) {
        return false;
      }
      const q = cropSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        item.labelEn.toLowerCase().includes(q) ||
        item.labelTe.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      );
    });
  }, [cropSearch, selectedCropCategory]);

  const handleFieldChange = (field: keyof BuyerRegistrationFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const toggleCropSelection = (cropId: string) => {
    setFormData((prev) => {
      const exists = prev.preferredCrops.includes(cropId);
      const nextCrops = exists
        ? prev.preferredCrops.filter((id) => id !== cropId)
        : [...prev.preferredCrops, cropId];
      return { ...prev, preferredCrops: nextCrops };
    });
    if (errors.preferredCrops) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.preferredCrops;
        return updated;
      });
    }
  };

  const handleSelectAllVisibleCrops = () => {
    const visibleIds = filteredCrops.map((c) => c.id);
    setFormData((prev) => {
      const set = new Set([...prev.preferredCrops, ...visibleIds]);
      return { ...prev, preferredCrops: Array.from(set) };
    });
    if (errors.preferredCrops) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.preferredCrops;
        return updated;
      });
    }
  };

  const handleClearAllCrops = () => {
    setFormData((prev) => ({ ...prev, preferredCrops: [] }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 1. Full Name
    if (!formData.fullName.trim()) {
      newErrors.fullName = br.validation.fullNameRequired;
    }

    // 2. Business Name
    if (!formData.businessName.trim()) {
      newErrors.businessName = br.validation.businessNameRequired;
    }

    // 3. Buyer Type
    if (!formData.buyerType) {
      newErrors.buyerType = br.validation.buyerTypeRequired;
    }

    // 4. Mobile Number (10 digits Indian mobile)
    const rawMobile = formData.mobileNumber.replace(/[\s\-+]/g, '');
    const mobileDigits = rawMobile.startsWith('91') && rawMobile.length === 12
      ? rawMobile.slice(2)
      : rawMobile;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = br.validation.mobileRequired;
    } else if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
      newErrors.mobileNumber = br.validation.mobileInvalid;
    }

    // 5. Email (optional, but validated if entered)
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = br.validation.emailInvalid;
      }
    }

    // 6. State
    if (!formData.state.trim()) {
      newErrors.state = br.validation.stateRequired;
    }

    // 7. District
    if (!formData.district.trim()) {
      newErrors.district = br.validation.districtRequired;
    }

    // 8. Market / Area
    if (!formData.marketArea.trim()) {
      newErrors.marketArea = br.validation.marketAreaRequired;
    }

    // 9. Business Address
    if (!formData.businessAddress.trim()) {
      newErrors.businessAddress = br.validation.addressRequired;
    }

    // 10. Preferred Crops
    if (formData.preferredCrops.length === 0) {
      newErrors.preferredCrops = br.validation.cropsRequired;
    }

    // 11 & 12. Quantities
    const minQtyNum = parseFloat(formData.minQuantity);
    const maxQtyNum = parseFloat(formData.maxQuantity);

    if (!formData.minQuantity || isNaN(minQtyNum) || minQtyNum <= 0) {
      newErrors.minQuantity = br.validation.minQtyPositive;
    }

    if (!formData.maxQuantity || isNaN(maxQtyNum) || maxQtyNum <= 0) {
      newErrors.maxQuantity = br.validation.minQtyPositive;
    } else if (!isNaN(minQtyNum) && minQtyNum > 0 && maxQtyNum < minQtyNum) {
      newErrors.maxQuantity = br.validation.maxQtyMinConstraint;
    }

    // 14 & 15. Prices
    const minPriceNum = parseFloat(formData.minPrice);
    const maxPriceNum = parseFloat(formData.maxPrice);

    if (!formData.minPrice || isNaN(minPriceNum) || minPriceNum < 0) {
      newErrors.minPrice = br.validation.minPriceNonNegative;
    }

    if (!formData.maxPrice || isNaN(maxPriceNum) || maxPriceNum < 0) {
      newErrors.maxPrice = br.validation.minPriceNonNegative;
    } else if (!isNaN(minPriceNum) && minPriceNum >= 0 && maxPriceNum < minPriceNum) {
      newErrors.maxPrice = br.validation.maxPriceMinConstraint;
    }

    // 16. Buying Frequency
    if (!formData.buyingFrequency) {
      newErrors.buyingFrequency = br.validation.frequencyRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstErrorElement = document.querySelector('[data-has-error="true"]');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);

    // Simulate clean frontend-only submission transition with realistic loading
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({ ...formData });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 600);
  };

  const getCropDisplayLabel = (id: string) => {
    const found = cropOptions.find((c) => c.id === id);
    if (!found) return id;
    return language === 'te' ? `${found.icon} ${found.labelTe}` : `${found.icon} ${found.labelEn}`;
  };

  const getBuyerTypeLabel = (type: BuyerType | '') => {
    switch (type) {
      case 'Wholesaler':
        return br.buyerTypes.wholesaler;
      case 'Retailer':
        return br.buyerTypes.retailer;
      case 'Processor':
        return br.buyerTypes.processor;
      case 'Exporter':
        return br.buyerTypes.exporter;
      case 'Other':
        return br.buyerTypes.other;
      default:
        return type;
    }
  };

  const getFrequencyLabel = (freq: BuyingFrequency | '') => {
    switch (freq) {
      case 'Daily':
        return br.frequencies.daily;
      case 'Weekly':
        return br.frequencies.weekly;
      case 'Monthly':
        return br.frequencies.monthly;
      case 'As Needed':
        return br.frequencies.asNeeded;
      default:
        return freq;
    }
  };

  // ==========================================
  // VIEW: FRONTEND CONFIRMATION
  // ==========================================
  if (submittedData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in duration-300">
        {/* Navigation back */}
        <div className="mb-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold transition-all text-sm shadow-2xs cursor-pointer hover:border-emerald-600"
            id="btn-confirmation-back-home"
          >
            <ArrowLeft className="w-4 h-4 text-[#165B33]" />
            <span>{br.backToHome}</span>
          </button>
        </div>

        {/* Confirmation Hero Card */}
        <div className="bg-white rounded-3xl border-2 border-emerald-500/30 p-6 sm:p-10 shadow-xl relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-emerald-100/60 to-transparent blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-[#165B33]" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-black text-xs uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>{br.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight font-display">
                {br.confirmation.readyTitle}
              </h1>
              <p className="text-base sm:text-lg font-bold text-emerald-900 mt-1">
                {br.confirmation.backendNotice}
              </p>
              {language === 'te' && br.confirmation.backendNoticeTe && (
                <p className="text-sm font-semibold text-emerald-800 mt-0.5">
                  {br.confirmation.backendNoticeTe}
                </p>
              )}
            </div>
          </div>

          {/* Frontend state only callout */}
          <div className="mt-6 p-4 rounded-2xl bg-[#E5F5E9] border border-emerald-200 flex items-start gap-3">
            <span className="text-emerald-700 text-lg">💡</span>
            <p className="text-xs sm:text-sm font-bold text-emerald-950 leading-relaxed">
              {br.confirmation.frontendStateOnlyNotice}
            </p>
          </div>
        </div>

        {/* Submission Summary Card */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <h2 className="text-xl font-black text-stone-950 flex items-center gap-2.5 font-display">
              <Layers className="w-5 h-5 text-[#165B33]" />
              {br.confirmation.summaryTitle}
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
              {getBuyerTypeLabel(submittedData.buyerType)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer Profile */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
                {br.confirmation.buyerInfoLabel}
              </span>
              <p className="text-lg font-black text-stone-950">{submittedData.fullName}</p>
              <p className="text-sm font-bold text-stone-700">{submittedData.businessName}</p>
              <div className="inline-block mt-1 px-2.5 py-0.5 rounded-lg bg-white border border-stone-300 text-xs font-bold text-stone-800">
                {getBuyerTypeLabel(submittedData.buyerType)}
              </div>
            </div>

            {/* Contact Info */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
                {br.confirmation.contactLabel}
              </span>
              <p className="text-base font-black text-stone-950 flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#165B33]" />
                +91 {submittedData.mobileNumber}
              </p>
              {submittedData.email ? (
                <p className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#165B33]" />
                  {submittedData.email}
                </p>
              ) : (
                <p className="text-xs text-stone-400 italic">No email provided</p>
              )}
            </div>

            {/* Location */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
                {br.confirmation.locationLabel}
              </span>
              <p className="text-sm font-black text-stone-950 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#165B33]" />
                {submittedData.marketArea}, {submittedData.district}, {submittedData.state}
              </p>
              <p className="text-xs font-bold text-stone-600 leading-relaxed">
                {submittedData.businessAddress}
              </p>
            </div>

            {/* Volume & Price */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <span className="text-xs font-black text-stone-500 uppercase tracking-wider block">
                {br.confirmation.volumePriceLabel}
              </span>
              <p className="text-sm font-black text-stone-950 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-[#165B33]" />
                {submittedData.minQuantity} - {submittedData.maxQuantity} {submittedData.quantityUnit}
              </p>
              <p className="text-sm font-black text-emerald-900 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4 text-[#165B33]" />
                ₹{submittedData.minPrice} - ₹{submittedData.maxPrice} / {submittedData.quantityUnit}
              </p>
              <p className="text-xs font-bold text-stone-600 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5 text-[#165B33]" />
                {br.confirmation.frequencyLabel}: {getFrequencyLabel(submittedData.buyingFrequency)}
              </p>
            </div>
          </div>

          {/* Commodities */}
          <div className="pt-2">
            <span className="text-xs font-black text-stone-500 uppercase tracking-wider block mb-2.5">
              {br.confirmation.commoditiesLabel} ({submittedData.preferredCrops.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {submittedData.preferredCrops.map((cropId) => (
                <span
                  key={cropId}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-stone-900 text-xs font-bold shadow-2xs"
                >
                  <span>{getCropDisplayLabel(cropId)}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                setFormData(initialForm);
                setSubmittedData(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-stone-300 hover:bg-stone-50 text-stone-800 font-bold transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              id="btn-register-another-buyer"
            >
              <RotateCcw className="w-4 h-4 text-stone-600" />
              <span>{br.confirmation.registerAnotherBtn}</span>
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#165B33] hover:bg-[#114828] text-white font-black transition-all text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer tracking-wide"
              id="btn-return-home"
            >
              <span>{br.confirmation.backToHomeBtn}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW: REGISTRATION FORM
  // ==========================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Navigation Row */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-bold transition-all text-sm shadow-2xs cursor-pointer hover:border-emerald-600"
          id="btn-buyer-form-back-home"
        >
          <ArrowLeft className="w-4 h-4 text-[#165B33]" />
          <span>{br.backToHome}</span>
        </button>

        <span className="text-xs font-bold text-stone-500 hidden sm:inline-block">
          {br.requiredFieldsNote}
        </span>
      </div>

      {/* Hero Header Card */}
      <div className="bg-linear-to-r from-[#EFF7F0] via-white to-[#E8F4EA] rounded-3xl border-2 border-[#165B33]/20 p-6 sm:p-10 shadow-md mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#165B33] border-2 border-emerald-400 flex items-center justify-center text-white shrink-0 shadow-md">
            <Store className="w-8 h-8 text-emerald-100" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-xs uppercase tracking-wider mb-2">
              <span className="text-emerald-700">✦</span>
              <span>{br.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-950 tracking-tight font-display">
              {br.title}
            </h1>
            <p className="text-stone-700 font-bold text-base sm:text-lg mt-1 max-w-2xl leading-relaxed">
              {br.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Validation Summary Error Alert */}
      {Object.keys(errors).length > 0 && (
        <div className="mb-8 p-5 rounded-2xl bg-red-50 border-2 border-red-300 shadow-sm flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-red-950 font-black text-base">
              {br.validation.fixErrorsAlert}
            </h3>
            <ul className="mt-1 list-disc list-inside text-sm font-bold text-red-800 space-y-0.5">
              {Object.values(errors).slice(0, 4).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {Object.values(errors).length > 4 && (
                <li className="italic">
                  +{Object.values(errors).length - 4} more fields need attention
                </li>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* ============================================================
            SECTION 1: BUSINESS & BASIC DETAILS
        ============================================================ */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#165B33] shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 font-display">
                {br.sectionBasic}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-stone-500">
                {br.sectionBasicDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Field 1: Full Name */}
            <div data-has-error={Boolean(errors.fullName)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-full-name">
                {br.fullNameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="buyer-full-name"
                type="text"
                value={formData.fullName}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                placeholder={br.fullNamePlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.fullName
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Field 2: Business Name */}
            <div data-has-error={Boolean(errors.businessName)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-business-name">
                {br.businessNameLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="buyer-business-name"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleFieldChange('businessName', e.target.value)}
                placeholder={br.businessNamePlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.businessName
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              />
              {errors.businessName && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.businessName}
                </p>
              )}
            </div>

            {/* Field 3: Buyer Type */}
            <div data-has-error={Boolean(errors.buyerType)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-type-select">
                {br.buyerTypeLabel} <span className="text-red-500">*</span>
              </label>
              <select
                id="buyer-type-select"
                value={formData.buyerType}
                onChange={(e) => handleFieldChange('buyerType', e.target.value as BuyerType)}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 bg-white focus:outline-hidden transition-colors cursor-pointer ${
                  errors.buyerType
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              >
                <option value="">-- {br.buyerTypePlaceholder} --</option>
                <option value="Wholesaler">{br.buyerTypes.wholesaler}</option>
                <option value="Retailer">{br.buyerTypes.retailer}</option>
                <option value="Processor">{br.buyerTypes.processor}</option>
                <option value="Exporter">{br.buyerTypes.exporter}</option>
                <option value="Other">{br.buyerTypes.other}</option>
              </select>
              {errors.buyerType && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.buyerType}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 2: CONTACT INFORMATION
        ============================================================ */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#165B33] shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 font-display">
                {br.sectionContact}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-stone-500">
                {br.sectionContactDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Field 4: Mobile Number */}
            <div data-has-error={Boolean(errors.mobileNumber)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-mobile">
                {br.mobileLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 px-2 py-0.5 rounded-md bg-stone-100 border border-stone-300 text-xs font-black text-stone-700">
                  +91
                </span>
                <input
                  id="buyer-mobile"
                  type="tel"
                  maxLength={10}
                  value={formData.mobileNumber}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '');
                    handleFieldChange('mobileNumber', onlyNums);
                  }}
                  placeholder={br.mobilePlaceholder}
                  className={`w-full pl-16 pr-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                    errors.mobileNumber
                      ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                      : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                  }`}
                />
              </div>
              {errors.mobileNumber && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.mobileNumber}
                </p>
              )}
            </div>

            {/* Field 5: Email Address (Optional) */}
            <div data-has-error={Boolean(errors.email)} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-black text-stone-800" htmlFor="buyer-email">
                  {br.emailLabel}
                </label>
                <span className="text-xs font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                  {br.optionalBadge}
                </span>
              </div>
              <div className="relative">
                <input
                  id="buyer-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder={br.emailPlaceholder}
                  className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                    errors.email
                      ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                      : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 3: OPERATIONAL LOCATION & MANDI
        ============================================================ */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#165B33] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 font-display">
                {br.sectionLocation}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-stone-500">
                {br.sectionLocationDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Field 6: State */}
            <div data-has-error={Boolean(errors.state)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-state-select">
                {br.stateLabel} <span className="text-red-500">*</span>
              </label>
              <select
                id="buyer-state-select"
                value={formData.state}
                onChange={(e) => handleFieldChange('state', e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 bg-white focus:outline-hidden transition-colors cursor-pointer ${
                  errors.state
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              >
                <option value="">-- {br.statePlaceholder} --</option>
                {indianStates.map((s) => (
                  <option key={s.en} value={s.en}>
                    {language === 'te' ? `${s.te} (${s.en})` : s.en}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.state}
                </p>
              )}
            </div>

            {/* Field 7: District */}
            <div data-has-error={Boolean(errors.district)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-district">
                {br.districtLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="buyer-district"
                type="text"
                value={formData.district}
                onChange={(e) => handleFieldChange('district', e.target.value)}
                placeholder={br.districtPlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.district
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              />
              {errors.district && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.district}
                </p>
              )}
            </div>

            {/* Field 8: Market / Area */}
            <div data-has-error={Boolean(errors.marketArea)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-market-area">
                {br.marketAreaLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="buyer-market-area"
                type="text"
                value={formData.marketArea}
                onChange={(e) => handleFieldChange('marketArea', e.target.value)}
                placeholder={br.marketAreaPlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.marketArea
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              />
              {errors.marketArea && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.marketArea}
                </p>
              )}
            </div>
          </div>

          {/* Field 9: Business Address */}
          <div data-has-error={Boolean(errors.businessAddress)} className="space-y-1.5">
            <label className="block text-sm font-black text-stone-800" htmlFor="buyer-address">
              {br.businessAddressLabel} <span className="text-red-500">*</span>
            </label>
            <textarea
              id="buyer-address"
              rows={2}
              value={formData.businessAddress}
              onChange={(e) => handleFieldChange('businessAddress', e.target.value)}
              placeholder={br.businessAddressPlaceholder}
              className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors resize-none ${
                errors.businessAddress
                  ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                  : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
              }`}
            />
            {errors.businessAddress && (
              <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.businessAddress}
              </p>
            )}
          </div>
        </div>

        {/* ============================================================
            SECTION 4: COMMODITY REQUIREMENTS (PREFERRED CROPS)
        ============================================================ */}
        <div
          data-has-error={Boolean(errors.preferredCrops)}
          className={`bg-white rounded-3xl border shadow-sm p-6 sm:p-8 space-y-6 transition-colors ${
            errors.preferredCrops ? 'border-red-400 ring-1 ring-red-300' : 'border-stone-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#165B33] shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-stone-950 font-display">
                  {br.sectionCrops} <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs sm:text-sm font-bold text-stone-500">
                  {br.sectionCropsDesc}
                </p>
              </div>
            </div>

            {/* Selected Count Badge & Actions */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1.5 rounded-xl font-black text-xs border ${
                  formData.preferredCrops.length > 0
                    ? 'bg-[#E5F5E9] text-[#165B33] border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }`}
              >
                {br.selectedCount.replace('{count}', String(formData.preferredCrops.length))}
              </span>
              {formData.preferredCrops.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllCrops}
                  className="text-xs font-bold text-stone-500 hover:text-red-600 transition-colors underline cursor-pointer"
                >
                  {br.clearAll}
                </button>
              )}
            </div>
          </div>

          {errors.preferredCrops && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errors.preferredCrops}</span>
            </div>
          )}

          {/* Selected Crops Preview Pills */}
          {formData.preferredCrops.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-xs font-black text-emerald-900 block mb-2">
                {br.preferredCropsLabel}:
              </span>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {formData.preferredCrops.map((cropId) => {
                  const cropObj = cropOptions.find((c) => c.id === cropId);
                  const label = cropObj
                    ? language === 'te'
                      ? cropObj.labelTe
                      : cropObj.labelEn
                    : cropId;
                  const icon = cropObj ? cropObj.icon : '🌾';
                  return (
                    <span
                      key={cropId}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-emerald-400 text-emerald-950 text-xs font-black shadow-2xs group"
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                      <button
                        type="button"
                        onClick={() => toggleCropSelection(cropId)}
                        className="ml-1 text-stone-400 hover:text-red-600 rounded-full cursor-pointer"
                        title="Remove crop"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search Bar & Quick Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={cropSearch}
                onChange={(e) => setCropSearch(e.target.value)}
                placeholder={br.searchCropsPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-[#165B33]"
              />
              {cropSearch && (
                <button
                  type="button"
                  onClick={() => setCropSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleSelectAllVisibleCrops}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              {br.selectAll}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold text-stone-600 border-b border-stone-100">
            {(
              [
                'all',
                'vegetables',
                'fruits',
                'cereals',
                'pulses',
                'oilseeds',
                'commercial',
              ] as CropCategory[]
            ).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCropCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCropCategory === cat
                    ? 'bg-[#165B33] text-white font-black shadow-2xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {t.categories[cat]}
              </button>
            ))}
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredCrops.length === 0 ? (
              <div className="col-span-full py-8 text-center text-stone-500 font-bold text-sm">
                {br.noCropsMatch}
              </div>
            ) : (
              filteredCrops.map((item) => {
                const isSelected = formData.preferredCrops.includes(item.id);
                const label = language === 'te' ? item.labelTe : item.labelEn;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleCropSelection(item.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E5F5E9] border-emerald-600 text-[#165B33] font-black shadow-2xs ring-1 ring-emerald-500'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <span className="text-xs truncate">{label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#165B33] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================
            SECTION 5: PROCUREMENT VOLUME & UNIT
        ============================================================ */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#165B33] shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 font-display">
                {br.sectionQuantity}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-stone-500">
                {br.sectionQuantityDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Field 11: Min Quantity */}
            <div data-has-error={Boolean(errors.minQuantity)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-min-qty">
                {br.minQuantityLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="buyer-min-qty"
                type="number"
                min="0.1"
                step="any"
                value={formData.minQuantity}
                onChange={(e) => handleFieldChange('minQuantity', e.target.value)}
                placeholder={br.minQuantityPlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.minQuantity
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              />
              {errors.minQuantity && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.minQuantity}
                </p>
              )}
            </div>

            {/* Field 12: Max Quantity */}
            <div data-has-error={Boolean(errors.maxQuantity)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-max-qty">
                {br.maxQuantityLabel} <span className="text-red-500">*</span>
              </label>
              <input
                id="buyer-max-qty"
                type="number"
                min="0.1"
                step="any"
                value={formData.maxQuantity}
                onChange={(e) => handleFieldChange('maxQuantity', e.target.value)}
                placeholder={br.maxQuantityPlaceholder}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.maxQuantity
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              />
              {errors.maxQuantity && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.maxQuantity}
                </p>
              )}
            </div>

            {/* Field 13: Quantity Unit */}
            <div className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800">
                {br.quantityUnitLabel} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['kg', 'quintal', 'tonne'] as QuantityUnit[]).map((unit) => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => handleFieldChange('quantityUnit', unit)}
                    className={`py-3 px-2 text-center rounded-xl font-black text-sm border transition-all cursor-pointer ${
                      formData.quantityUnit === unit
                        ? 'bg-[#165B33] text-white border-[#165B33] shadow-2xs'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-300'
                    }`}
                  >
                    {br.units[unit]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            SECTION 6: PRICING & PROCUREMENT SCHEDULE
        ============================================================ */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-[#165B33] shrink-0">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-950 font-display">
                {br.sectionPricing}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-stone-500">
                {br.sectionPricingDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Field 14: Min Price */}
            <div data-has-error={Boolean(errors.minPrice)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-min-price">
                {br.minPriceLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-500 font-black text-base">₹</span>
                <input
                  id="buyer-min-price"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.minPrice}
                  onChange={(e) => handleFieldChange('minPrice', e.target.value)}
                  placeholder={br.minPricePlaceholder}
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                    errors.minPrice
                      ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                      : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                  }`}
                />
              </div>
              {errors.minPrice && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.minPrice}
                </p>
              )}
            </div>

            {/* Field 15: Max Price */}
            <div data-has-error={Boolean(errors.maxPrice)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-max-price">
                {br.maxPriceLabel} <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-stone-500 font-black text-base">₹</span>
                <input
                  id="buyer-max-price"
                  type="number"
                  min="0"
                  step="any"
                  value={formData.maxPrice}
                  onChange={(e) => handleFieldChange('maxPrice', e.target.value)}
                  placeholder={br.maxPricePlaceholder}
                  className={`w-full pl-9 pr-4 py-3 rounded-xl border text-base font-bold text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                    errors.maxPrice
                      ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                      : 'border-stone-300 bg-white focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                  }`}
                />
              </div>
              {errors.maxPrice && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.maxPrice}
                </p>
              )}
            </div>

            {/* Field 16: Buying Frequency */}
            <div data-has-error={Boolean(errors.buyingFrequency)} className="space-y-1.5">
              <label className="block text-sm font-black text-stone-800" htmlFor="buyer-freq-select">
                {br.buyingFrequencyLabel} <span className="text-red-500">*</span>
              </label>
              <select
                id="buyer-freq-select"
                value={formData.buyingFrequency}
                onChange={(e) => handleFieldChange('buyingFrequency', e.target.value as BuyingFrequency)}
                className={`w-full px-4 py-3 rounded-xl border text-base font-bold text-stone-900 bg-white focus:outline-hidden transition-colors cursor-pointer ${
                  errors.buyingFrequency
                    ? 'border-red-500 bg-red-50/30 focus:border-red-600'
                    : 'border-stone-300 focus:border-[#165B33] focus:ring-1 focus:ring-[#165B33]'
                }`}
              >
                <option value="">-- {br.buyingFrequencyPlaceholder} --</option>
                <option value="Daily">{br.frequencies.daily}</option>
                <option value="Weekly">{br.frequencies.weekly}</option>
                <option value="Monthly">{br.frequencies.monthly}</option>
                <option value="As Needed">{br.frequencies.asNeeded}</option>
              </select>
              {errors.buyingFrequency && (
                <p className="text-xs font-bold text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.buyingFrequency}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================
            BOTTOM ACTION BAR & SUBMIT BUTTON
        ============================================================ */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border-2 border-stone-300 hover:bg-stone-50 text-stone-800 font-bold transition-all text-base flex items-center justify-center gap-2 cursor-pointer"
            id="btn-buyer-form-back-bottom"
          >
            <ArrowLeft className="w-4 h-4 text-stone-700" />
            <span>{br.backToHome}</span>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full sm:w-auto px-10 py-4 rounded-xl text-white font-black text-lg shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer tracking-wide ${
              isSubmitting
                ? 'bg-[#165B33]/70 cursor-not-allowed'
                : 'bg-[#165B33] hover:bg-[#114828] active:scale-[0.99]'
            }`}
            id="btn-register-buyer-submit"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{br.submittingBtn}</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>{br.submitBtn}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
