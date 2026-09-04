import React from 'react';
import { X, ShieldCheck, Database, Layers, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';
import smartMandiLogo from '../assets/images/smartmandi_logo_1788515902109.jpg';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = getTranslation(language);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8ECE8] p-6 sm:p-8">
        <div className="flex items-start justify-between pb-4 border-b border-[#E8ECE8]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-700/20 shadow-xs bg-white shrink-0 p-1 flex items-center justify-center">
              <img
                src={smartMandiLogo}
                alt="SMARTMandi Emblem Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs font-black text-[#1B4332] uppercase tracking-wider block">
                {t.aboutModal.subtitle}
              </span>
              <h3 className="text-2xl font-black text-[#1A1C1A] font-display mt-0.5">
                {t.aboutModal.title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[#5C635C] hover:text-[#1A1C1A] rounded-full hover:bg-[#F0F4F0] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-6 space-y-6 text-base text-stone-800 font-medium">
          {/* Problem Statement Card */}
          <div className="p-5 rounded-2xl bg-[#F0F4F0] border-2 border-[#DCE4DC]">
            <h4 className="font-black text-[#1B4332] text-sm uppercase tracking-wider mb-1.5">
              Problem Statement
            </h4>
            <p className="text-lg font-black text-stone-950">
              "{t.aboutModal.problemStatement}"
            </p>
            <p className="mt-2.5 text-stone-800 leading-relaxed text-sm font-semibold">
              {t.aboutModal.description}
            </p>
          </div>

          {/* Planned Technical Architecture */}
          <div>
            <h4 className="font-black text-stone-950 text-base mb-3">
              {t.aboutModal.architectureTitle}
            </h4>
            <div className="p-4 bg-[#F7F9F7] rounded-2xl border-2 border-stone-200 space-y-3 font-mono text-sm text-stone-950 font-bold">
              <div className="flex items-center gap-2 text-[#165B33] font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
                <span>React Frontend (Interactive Decision Interface)</span>
              </div>
              <div className="pl-4 text-stone-600 font-bold">↓ REST JSON API</div>
              <div className="flex items-center gap-2 text-stone-900">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                <span>FastAPI REST Microservice</span>
              </div>
              <div className="pl-4 text-stone-600 font-bold">↓ Connection Pool</div>
              <div className="flex items-center gap-2 text-stone-900">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                <span>PostgreSQL Database</span>
              </div>
              <div className="pl-4 text-stone-600 font-bold">↓ Data Ingestion</div>
              <div className="flex items-center gap-2 text-stone-900">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-700" />
                <span>National Agricultural Market (e-NAM / APMC) Feed</span>
              </div>
              <div className="pl-4 text-stone-600 font-bold">↓ Decision Solver</div>
              <div className="flex items-center gap-2 text-[#165B33] font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-[#165B33]" />
                <span>Net Return Recommendation Engine</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#165B33] hover:bg-[#114828] text-white font-black px-7 py-3 rounded-xl text-base transition-colors border border-[#165B33]"
          >
            {t.aboutModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
