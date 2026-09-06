import React from 'react';
import { Trophy, Info, Navigation, MapPin, Clock, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

/** Compute decision signal based on Smart Market Score */
function getDecisionSignal(score: number | undefined): 'sellNow' | 'monitor' | 'insufficient' {
  if (score === undefined || score === null) return 'insufficient';
  if (score >= 75) return 'sellNow';
  if (score >= 50) return 'monitor';
  return 'insufficient';
}

/** Estimated mandi fee ≈ 2% of gross income (APMC standard) */
function estimatedMandiFee(grossIncome: number): number {
  return Math.round(grossIncome * 0.02);
}

interface RecommendationCardProps {
  market: CalculatedMarketResult;
  quantity: number;
  cropName: string;
  language: Language;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  market,
  quantity,
  cropName,
  language,
}) => {
  const t = getTranslation(language);
  const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;

  const score = market.smartMarketScore;
  const breakdown = market.scoreBreakdown;
  const signalKey = getDecisionSignal(score);
  const mandiFee = estimatedMandiFee(market.grossIncome);

  // Score colour
  const scoreColor =
    score !== undefined && score >= 75 ? '#165B33'
    : score !== undefined && score >= 50 ? '#92400e'
    : '#6b7280';
  const scoreBg =
    score !== undefined && score >= 75 ? 'bg-emerald-50 border-emerald-200'
    : score !== undefined && score >= 50 ? 'bg-amber-50 border-amber-200'
    : 'bg-stone-50 border-stone-200';

  const signalStyle = {
    sellNow: {
      bg: 'bg-emerald-50 border-emerald-400',
      text: 'text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    monitor: {
      bg: 'bg-amber-50 border-amber-400',
      text: 'text-amber-900',
      icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    insufficient: {
      bg: 'bg-stone-50 border-stone-300',
      text: 'text-stone-700',
      icon: <Info className="w-5 h-5 text-stone-500 shrink-0" />,
    },
  }[signalKey];

  const sig = {
    ...t.results.signal[signalKey],
    ...signalStyle,
  };

  // Data-driven explanation builder in active language
  const buildWhyExplanation = (): string => {
    const parts: string[] = [];
    if (language === 'te') {
      parts.push(`ఈ మండిలో మీ అంచనా నికర లాభం ${formatINR(market.netReturn)}, ఇది సరిపోల్చిన అన్ని మార్కెట్లలో అత్యధికం.`);
      if (market.distanceKm <= 35) {
        parts.push(`సమీప దూరం (${market.distanceKm} km) కావున రవాణా ఖర్చు ${formatINR(market.transportCost)} తక్కువగా ఉంటుంది.`);
      }
    } else if (language === 'hi') {
      parts.push(`यह मंडी ${formatINR(market.netReturn)} का अनुमानित शुद्ध मुनाफा देती है, जो सभी मंडियों में सबसे अधिक है।`);
      if (market.distanceKm <= 35) {
        parts.push(`नजदीकी दूरी (${market.distanceKm} km) के कारण परिवहन लागत ${formatINR(market.transportCost)} कम रहती है।`);
      }
    } else if (language === 'mr') {
      parts.push(`ही बाजार समिती ${formatINR(market.netReturn)} चा अंदाजित निव्वळ नफा देते, जे सर्व पर्यायांपेक्षा सर्वाधिक आहे.`);
      if (market.distanceKm <= 35) {
        parts.push(`जवळचे अंतर (${market.distanceKm} km) असल्यामुळे वाहतूक खर्च ${formatINR(market.transportCost)} कमी राहतो.`);
      }
    } else {
      parts.push(`This mandi offers an estimated net return of ${formatINR(market.netReturn)}, the highest among all compared markets.`);
      if (market.distanceKm <= 35) {
        parts.push(`Close distance (${market.distanceKm} km) keeps your transport cost low at ${formatINR(market.transportCost)}.`);
      }
    }
    return parts.join(' ');
  };

  return (
    <div className="space-y-4" id="recommended-market-container">
      {/* Recommended Market Card */}
      <div
        className="bg-white rounded-2xl border-2 border-stone-200 shadow-md overflow-hidden relative"
        id="recommended-market-card"
      >
        {/* Orange Banner Header */}
        <div className="bg-amber-400 py-2.5 px-6 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-white" />
          <span className="text-white font-black text-lg tracking-wide drop-shadow-xs">
            {t.results.bestOptionBadge}
          </span>
        </div>

        <div className="p-6 space-y-4">
          {/* Market Name + Net Return Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-stone-950 font-display leading-tight">
                {market.name}
              </h3>
              <p className="text-sm font-bold text-stone-600 mt-1 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {market.distanceKm} km
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {Math.floor(market.distanceKm * 1.5)} {t.results.minUnit}
                </span>
              </p>
            </div>
            <div className="bg-[#165B33] text-white rounded-xl p-3 px-5 text-center shadow-md min-w-[140px] shrink-0">
              <span className="text-xs font-bold opacity-90 block mb-0.5">
                {t.results.estimatedNetReturn}
              </span>
              <span className="text-2xl font-black block">{formatINR(market.netReturn)}</span>
              <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">
                {t.results.takeHome}
              </span>
            </div>
          </div>

          {/* Smart Market Score Gauge */}
          {score !== undefined && (
            <div className={`rounded-xl p-4 border ${scoreBg}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2 text-sm font-black text-stone-800">
                  <TrendingUp className="w-4 h-4" style={{ color: scoreColor }} />
                  {t.results.smartScoreLabel}
                </span>
                <span className="text-2xl font-black" style={{ color: scoreColor }}>
                  {score}<span className="text-base font-bold text-stone-400">/100</span>
                </span>
              </div>
              {/* Main score bar */}
              <div className="w-full bg-stone-200 rounded-full h-2.5 mb-3">
                <div
                  className="h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${score}%`, backgroundColor: scoreColor }}
                />
              </div>
              {/* Sub-dimension breakdown */}
              {breakdown && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-bold text-stone-600">
                  {[
                    { label: t.results.netReturn, val: breakdown.netReturnScore },
                    { label: t.results.price, val: breakdown.priceScore },
                    { label: t.results.distance, val: breakdown.distanceScore },
                    { label: t.results.transport, val: breakdown.transportScore },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between mb-0.5">
                        <span>{item.label}</span>
                        <span className="text-stone-800">{item.val}</span>
                      </div>
                      <div className="w-full bg-stone-200 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full"
                          style={{ width: `${item.val}%`, backgroundColor: scoreColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Decision Signal */}
          <div className={`rounded-xl p-3.5 border-2 flex items-start gap-3 ${sig.bg}`}>
            {sig.icon}
            <div>
              <span className={`text-sm font-black block ${sig.text}`}>{sig.label}</span>
              <span className={`text-xs font-semibold ${sig.text} opacity-80`}>{sig.sub}</span>
            </div>
          </div>

          {/* Breakdown financials */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-700">
              <span>{t.results.grossIncomeLabel}</span>
              <span>{formatINR(market.grossIncome)}</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-700">
              <span>{t.results.transportLabel}</span>
              <span>- {formatINR(market.transportCost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base font-bold text-stone-700 pb-2.5 border-b border-stone-200">
              <span>{t.results.estMandiFee}</span>
              <span>- {formatINR(mandiFee)}</span>
            </div>
            <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-sm sm:text-base font-black text-stone-900">
                {t.results.netReturnLabel}
              </span>
              <span className="text-lg sm:text-xl font-black text-[#165B33]">{formatINR(market.netReturn)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 text-xs font-bold text-stone-500">
            <div className="flex items-center gap-2">
              <span className="text-[#165B33] bg-emerald-100 p-1 rounded-md">
                {t.results.mandiPriceLabel}
              </span>
              <span>₹{market.pricePerKg * 100} {t.results.perQuintal}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#165B33] bg-emerald-100 p-1 rounded-md">
                {t.results.distanceLabel}
              </span>
              <span>{market.distanceKm} km</span>
            </div>
          </div>

          {/* Why this market explanation */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h4 className="text-sm font-black text-stone-900 flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-amber-500" />
              {t.results.whyThisMarket}
            </h4>
            <p className="text-sm font-semibold text-stone-600 leading-relaxed">
              {buildWhyExplanation()}
            </p>
            <div className="mt-3 text-right">
              <button type="button" className="text-[#165B33] text-sm font-black hover:underline flex items-center gap-1 justify-end w-full cursor-pointer">
                {t.results.viewFullDetails} <Navigation className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
