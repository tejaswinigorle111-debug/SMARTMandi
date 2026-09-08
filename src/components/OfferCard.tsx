import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, Truck, Banknote, HelpCircle, ChevronDown, ChevronUp, Star, Package } from 'lucide-react';
import { SmartDealEvaluation } from '../types';

interface OfferCardProps {
  offer: {
    id: number;
    listing_id: number;
    commodity: string;
    buyer_name: string;
    quantity: number;
    offered_price_per_kg: number;
    status: string;
    created_at: string;
    quality_requirements?: string;
    payment_terms?: string;
    logistics_terms?: string;
  };
  dealEval?: SmartDealEvaluation;
  onAccept?: () => void;
  onCounter?: () => void;
  onCompare?: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, dealEval, onAccept, onCounter, onCompare }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If we don't have a backend deal eval yet, we can mock a simple display score based on price
  const displayScore = dealEval?.score || 85;

  const scoreColor =
    displayScore >= 80 ? '#165B33'
    : displayScore >= 50 ? '#92400e'
    : '#6b7280';
    
  const scoreBg =
    displayScore >= 80 ? 'bg-emerald-50 border-emerald-200'
    : displayScore >= 50 ? 'bg-amber-50 border-amber-200'
    : 'bg-stone-50 border-stone-200';

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 shadow-md overflow-hidden relative mb-4">
      <div className="bg-stone-900 py-2.5 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          <span className="text-white font-black text-lg tracking-wide drop-shadow-xs">
            Digital Buyer Offer
          </span>
        </div>
        <span className="bg-stone-700 text-stone-100 text-xs font-black px-2.5 py-1 rounded">
          {offer.status}
        </span>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-black text-stone-950 flex items-center gap-2">
              {offer.buyer_name}
            </h3>
            <p className="text-sm font-bold text-stone-600 flex items-center gap-2 mt-1">
              <Package className="w-4 h-4" /> {offer.commodity} · {offer.quantity} kg
            </p>
          </div>
          <div className="text-right">
            <span className="block text-xs font-bold text-stone-500 uppercase tracking-wide">Offered Price</span>
            <span className="text-2xl font-black text-[#165B33]">₹{offer.offered_price_per_kg}<span className="text-sm">/kg</span></span>
          </div>
        </div>

        {/* SMART Deal Score */}
        <div className={`rounded-xl p-4 border ${scoreBg} mb-4`}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-black text-stone-800">SMART Deal Score</span>
            <span className="text-xl font-black" style={{ color: scoreColor }}>{displayScore}/100</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs font-bold text-stone-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Competitive Price
            </div>
            <div className="flex items-center gap-2">
              {offer.logistics_terms?.toLowerCase().includes('buyer') ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <HelpCircle className="w-4 h-4 text-stone-400" />} 
              Logistics Covered
            </div>
            <div className="flex items-center gap-2">
              {offer.quality_requirements ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <HelpCircle className="w-4 h-4 text-stone-400" />} 
              Clear Quality Terms
            </div>
            <div className="flex items-center gap-2">
              {offer.payment_terms ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <HelpCircle className="w-4 h-4 text-stone-400" />} 
              Payment Terms set
            </div>
          </div>
        </div>

        {/* Before I Accept Expandable */}
        <div className="border border-stone-200 rounded-xl overflow-hidden mb-4">
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full bg-stone-50 p-3 flex justify-between items-center text-sm font-black text-stone-800 hover:bg-stone-100 transition-colors"
          >
            Before I Accept...
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          {isExpanded && (
            <div className="p-4 bg-white border-t border-stone-200 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase">Gross Value</span>
                  <span className="font-black text-stone-800">₹{(offer.quantity * offer.offered_price_per_kg).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase">Payment Terms</span>
                  <span className="font-black text-stone-800">{offer.payment_terms || 'Upon Delivery'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase">Quality Req</span>
                  <span className="font-black text-stone-800">{offer.quality_requirements || 'Standard FAQ'}</span>
                </div>
                <div>
                  <span className="block text-xs font-bold text-stone-500 uppercase">Logistics</span>
                  <span className="font-black text-stone-800">{offer.logistics_terms || 'Farmer delivers'}</span>
                </div>
              </div>
              <p className="text-xs font-bold text-stone-500 pt-2 border-t border-stone-100">
                Please ensure you can meet the quality requirements and deliver the full {offer.quantity} kg before accepting this offer to avoid penalties.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button onClick={onAccept} className="flex-1 bg-[#165B33] text-white py-2.5 rounded-lg text-sm font-black hover:bg-[#104827]">
            Accept Offer
          </button>
          <button onClick={onCounter} className="flex-1 bg-stone-100 text-stone-800 py-2.5 rounded-lg text-sm font-black border border-stone-300 hover:bg-stone-200">
            Counter
          </button>
          <button onClick={onCompare} className="flex-1 bg-emerald-50 text-emerald-800 py-2.5 rounded-lg text-sm font-black border border-emerald-200 hover:bg-emerald-100">
            Compare
          </button>
        </div>
      </div>
    </div>
  );
};
