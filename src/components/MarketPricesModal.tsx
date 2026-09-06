import React from 'react';
import { X, TrendingUp, Info } from 'lucide-react';
import { demoMarkets, cropOptions } from '../data/demoMarkets';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MarketPricesModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const MarketPricesModal: React.FC<MarketPricesModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  const t = getTranslation(language);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#E8ECE8] p-6 sm:p-8">
        <div className="flex items-start justify-between pb-4 border-b border-[#E8ECE8]">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#2D6A4F]" />
              <h3 className="text-2xl font-black text-[#1A1C1A] font-display">
                {t.marketPricesModal.title}
              </h3>
            </div>
            <p className="text-sm text-[#5C635C] mt-1 font-medium">
              {t.marketPricesModal.subtitle}
            </p>
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

        {/* Disclaimer */}
        <div className="my-5 p-4 rounded-2xl bg-[#F0F4F0] border-2 border-[#DCE4DC] text-sm text-[#1B4332] flex items-start gap-2.5 font-bold">
          <Info className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <span>
            <strong className="font-black">Sample Market Data Notice:</strong> The rates shown below are indicative benchmark prices gathered for demonstration and mandi decision support. Future mandi integration will connect via the regional e-NAM/APMC mandi gateway.
          </span>
        </div>

        {/* Market Rates Table */}
        <div className="overflow-x-auto rounded-2xl border-2 border-stone-200">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-[#F7F9F7] text-stone-900 text-sm font-black uppercase tracking-wider border-b-2 border-stone-200">
                <th className="p-4">Mandi Yard</th>
                <th className="p-4">Location</th>
                {cropOptions.map((c) => (
                  <th key={c.id} className="p-4 text-center">
                    {c.id} (₹/kg)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {demoMarkets.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50">
                  <td className="p-4 font-black text-stone-950">{m.name}</td>
                  <td className="p-4 text-stone-700 text-sm font-bold">{m.location}</td>
                  {cropOptions.map((c) => (
                    <td key={c.id} className="p-4 text-center font-black text-[#165B33] text-base">
                      ₹{m.cropPrices[c.id]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-[#1A1C1A] hover:bg-[#2D6A4F] text-white font-black px-7 py-3 rounded-xl text-base transition-colors border border-[#1A1C1A]"
          >
            {t.marketPricesModal.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
