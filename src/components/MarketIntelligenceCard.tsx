import React from 'react';
import { AlertCircle, Brain, CheckCircle2 } from 'lucide-react';
import { MarketIntelligence } from '../types';

interface MarketIntelligenceCardProps {
  intelligence: MarketIntelligence;
}

export const MarketIntelligenceCard: React.FC<MarketIntelligenceCardProps> = ({ intelligence }) => {
  const isInsufficient = intelligence.status === 'insufficient_data';
  return (
    <div className="rounded-2xl border-2 border-stone-300 bg-white p-5 shadow-sm" id="market-intelligence-card">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#2D6A4F]" />
          <h3 className="text-xl font-black text-stone-950">AI market intelligence</h3>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-black uppercase ${isInsufficient ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
          {isInsufficient ? 'Limited data' : intelligence.recommendation_type === 'sell_now' ? 'Consider sell now' : 'Monitor'}
        </span>
      </div>

      <p className="text-sm font-bold leading-relaxed text-stone-700">{intelligence.summary}</p>
      <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        {isInsufficient ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />}
        <p className="text-sm font-black text-stone-800">{intelligence.recommendation}</p>
      </div>

      {intelligence.insights.length > 0 && (
        <ul className="mt-4 space-y-2 text-sm font-semibold text-stone-700">
          {intelligence.insights.map((insight) => <li key={insight} className="border-b border-stone-100 pb-2">{insight}</li>)}
        </ul>
      )}

      <p className="mt-4 text-xs font-bold text-stone-500">Uncertainty: {intelligence.uncertainty}</p>
      <p className="mt-2 text-xs font-bold text-stone-400">AI analysis uses verified backend market records only. It is an estimate, not a financial guarantee.</p>
    </div>
  );
};
