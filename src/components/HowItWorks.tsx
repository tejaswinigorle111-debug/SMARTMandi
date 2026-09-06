import React from 'react';
import { Sprout, Scale, Truck, Award } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface HowItWorksProps {
  language: Language;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({ language }) => {
  const t = getTranslation(language);

  const stepIcons = [
    <Sprout className="w-6 h-6 text-[#2D6A4F]" key="icon-1" />,
    <Scale className="w-6 h-6 text-[#2D6A4F]" key="icon-2" />,
    <Truck className="w-6 h-6 text-[#2D6A4F]" key="icon-3" />,
    <Award className="w-6 h-6 text-[#2D6A4F]" key="icon-4" />,
  ];

  return (
    <section id="how-it-works" className="relative overflow-hidden py-16 sm:py-24 bg-linear-to-b from-[#F3F8F3] via-[#EAF3EB] to-[#F1F7F1] border-t border-emerald-900/10 scroll-mt-16">
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-radial from-emerald-100/40 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-sm font-black uppercase tracking-wide mb-3 border border-emerald-300 shadow-2xs">
            {t.howItWorks.badge}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-stone-950 tracking-tight font-display">
            {t.howItWorks.heading}
          </h2>
          <p className="mt-3 text-lg sm:text-xl font-bold text-stone-800">
            {t.howItWorks.subText}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {t.howItWorks.steps.map((step, idx) => (
            <div
              key={step.num}
              className="relative p-7 rounded-3xl bg-white border-2 border-stone-200 hover:border-emerald-600 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:bg-emerald-100 transition-colors">
                    {stepIcons[idx]}
                  </div>
                  <span className="text-4xl font-black text-emerald-800/40 font-display">
                    {step.num}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-stone-950 mb-2.5 font-display">
                  {step.title}
                </h3>
                <p className="text-stone-800 text-base font-semibold leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone-200 flex items-center text-sm font-extrabold text-[#165B33]">
                <span>{`${t.howItWorks.stepPrefix} ${step.num} ${t.howItWorks.ofSteps}`}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
