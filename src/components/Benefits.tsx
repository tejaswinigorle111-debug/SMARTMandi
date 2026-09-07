import React from 'react';
import { UserCheck, Fuel, Mic, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface BenefitsProps {
  language: Language;
}

export const Benefits: React.FC<BenefitsProps> = ({ language }) => {
  const t = getTranslation(language);

  const cardIcons = [
    <UserCheck className="w-5 h-5 text-[#2D6A4F]" key="icon-b-1" />,
    <Fuel className="w-5 h-5 text-[#2D6A4F]" key="icon-b-2" />,
    <Mic className="w-5 h-5 text-[#2D6A4F]" key="icon-b-3" />,
    <HelpCircle className="w-5 h-5 text-[#2D6A4F]" key="icon-b-4" />,
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-linear-to-b from-[#EBF3EC] via-[#F3F8F3] to-[#E8F2EA] border-t border-emerald-900/10">
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-radial from-emerald-100/40 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-sm font-black uppercase tracking-wide mb-3 border border-emerald-300 shadow-2xs">
            {t.whySmartMandi.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight font-display">
            {t.whySmartMandi.heading}
          </h2>
          <p className="mt-3 text-lg sm:text-xl font-bold text-stone-800">
            {t.whySmartMandi.subText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.whySmartMandi.cards.map((card, idx) => (
            <div
              key={card.tag}
              className="bg-white rounded-3xl p-7 shadow-sm border-2 border-stone-200 hover:border-emerald-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-950 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full">
                    {card.tag}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    {cardIcons[idx]}
                  </div>
                </div>

                <h3 className="text-xl font-black text-stone-950 mb-2 font-display">
                  {card.title}
                </h3>
                <p className="text-stone-800 text-base font-semibold leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex items-center gap-2 text-sm font-bold text-stone-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>{t.whySmartMandi.verifiedMetric}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
