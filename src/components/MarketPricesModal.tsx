import React from 'react';
import { X, TrendingUp, Info } from 'lucide-react';
import { getMarketPrices } from '../services/api';
import { Language, MarketPriceRecord } from '../types';
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
  const [markets, setMarkets] = React.useState<MarketPriceRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [dataState, setDataState] = React.useState<'live' | 'cached' | 'unavailable'>('unavailable');
  const [dataSource, setDataSource] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    setLoadError(null);
    getMarketPrices()
      .then((result) => {
        setMarkets(result.records);
        setDataState(result.data_state);
        setDataSource(result.source);
        setLastUpdated(result.last_updated);
        setLoadError(result.message || null);
      })
      .catch(() => setLoadError('Live market data is temporarily unavailable.'))
      .finally(() => setIsLoading(false));
  }, [isOpen]);

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

        <div className="my-5 grid gap-3 sm:grid-cols-3">
          <div className={`rounded-xl border-2 p-3 ${dataState === 'live' ? 'border-emerald-200 bg-emerald-50' : dataState === 'cached' ? 'border-amber-200 bg-amber-50' : 'border-stone-200 bg-stone-50'}`}>
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">Data status</p>
            <p className="font-black text-stone-900">{dataState === 'live' ? 'LIVE DATA' : dataState === 'cached' ? 'CACHED DATA' : 'UNAVAILABLE'}</p>
          </div>
          <div className="rounded-xl border-2 border-stone-200 bg-stone-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">Last updated</p>
            <p className="font-black text-stone-900">{lastUpdated ? new Date(lastUpdated).toLocaleString('en-IN') : 'Not available'}</p>
          </div>
          <div className="rounded-xl border-2 border-stone-200 bg-stone-50 p-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-stone-500">Data source</p>
            <p className="font-black text-stone-900">{dataSource || 'Not available'}</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="my-5 p-4 rounded-2xl bg-[#F0F4F0] border-2 border-[#DCE4DC] text-sm text-[#1B4332] flex items-start gap-2.5 font-bold">
          <Info className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <span>
            <strong className="font-black">{t.marketPricesModal.noticeTitle}: </strong>{t.marketPricesModal.noticeText}
          </span>
        </div>

        {/* Market Rates Table */}
        <div className="overflow-x-auto rounded-2xl border-2 border-stone-200">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-[#F7F9F7] text-stone-900 text-sm font-black uppercase tracking-wider border-b-2 border-stone-200">
                <th className="p-4">{t.marketPricesModal.mandiCol}</th>
                <th className="p-4">{t.marketPricesModal.locationCol}</th>
                <th className="p-4">{t.input.cropLabel}</th>
                <th className="p-4 text-right">Min / max / modal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {isLoading && (
                <tr><td colSpan={4} className="p-6 text-center font-bold">Loading live market prices...</td></tr>
              )}
              {!isLoading && markets.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50">
                  <td className="p-4 font-black text-stone-950">{m.name}</td>
                  <td className="p-4 text-stone-700 text-sm font-bold">{m.location}</td>
                  <td className="p-4 text-stone-700 font-bold">{m.crop || Object.keys(m.cropPrices || {})[0] || 'Market price'}</td>
                  <td className="p-4 text-right font-black text-[#165B33] text-base">
                    {m.minimum_price === null || m.minimum_price === undefined ? '—' : `₹${m.minimum_price}`} / {m.maximum_price === null || m.maximum_price === undefined ? '—' : `₹${m.maximum_price}`} / {m.modal_price === null || m.modal_price === undefined ? '—' : `₹${m.modal_price}`}<span className="block text-xs text-stone-500">{m.unit || 'official unit'}</span>
                  </td>
                </tr>
              ))}
              {!isLoading && markets.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center font-bold">{loadError || 'Live market data is temporarily unavailable.'}</td></tr>
              )}
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
