import React, { useEffect, useState } from 'react';
import { HandCoins } from 'lucide-react';
import { getPublicPooledLots, PublicPooledLot, submitBulkOffer } from '../services/fpo';

export const BulkBuyerOffer: React.FC = () => {
  const [lots, setLots] = useState<PublicPooledLot[]>([]);
  const [lotId, setLotId] = useState('');
  const [price, setPrice] = useState('');
  const [expiry, setExpiry] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { void getPublicPooledLots().then(setLots).catch(() => undefined); }, []);
  const selectedLot = lots.find((lot) => lot.id === Number(lotId));
  return <div className="rounded-2xl border border-stone-200 bg-white p-5"><div className="mb-3 flex items-center gap-2"><HandCoins className="h-5 w-5 text-[#2D6A4F]" /><h3 className="font-black">Bulk offer to an FPO lot</h3></div>{message && <p className="mb-2 rounded-lg bg-emerald-50 p-2 text-sm font-bold text-emerald-800">{message}</p>}<form className="space-y-2" onSubmit={(event) => { event.preventDefault(); if (!selectedLot) return; void submitBulkOffer(selectedLot.id, Number(price), expiry ? new Date(expiry).toISOString() : undefined).then(() => setMessage('Bulk offer submitted.')).catch(() => setMessage('Bulk offer could not be submitted.')); }}><select required value={lotId} onChange={(event) => setLotId(event.target.value)} className="w-full rounded-lg border bg-white p-2"><option value="">Select pooled crop lot</option>{lots.filter((lot) => ['OPEN', 'OFFERED'].includes(lot.status)).map((lot) => <option key={lot.id} value={lot.id}>{lot.commodity} · {lot.fpo_name} · {lot.total_quantity_kg} kg</option>)}</select><input required type="number" min="0.01" step="0.01" placeholder="Offer price / kg" value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-lg border p-2" /><label className="block text-xs font-black text-stone-600">Offer expiry<input type="datetime-local" value={expiry} onChange={(event) => setExpiry(event.target.value)} className="mt-1 w-full rounded-lg border p-2 text-sm" /></label><button className="rounded-lg bg-[#165B33] px-4 py-2 font-black text-white">Submit bulk offer</button></form></div>;
};
