import React, { useEffect, useState } from 'react';
import { Layers, Plus, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react';
import {
  addFpoMember, calculateFpoSettlements, createFpoLot, decideFpoOffer, FarmerRecord,
  getAvailableFarmers, getFpoLotOffers, getFpoMemberListings, getFpoMembers, getFpoLots,
  getFpos, FpoListing, FpoMember, FpoRecord, PooledLotRecord, removeFpoMember, reviewFpoLotQuality,
} from '../services/fpo';

export const FpoAggregationCenter: React.FC<{ onAuthExpired: () => void }> = ({ onAuthExpired }) => {
  const [fpos, setFpos] = useState<FpoRecord[]>([]);
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [members, setMembers] = useState<FpoMember[]>([]);
  const [memberListings, setMemberListings] = useState<FpoListing[]>([]);
  const [lots, setLots] = useState<PooledLotRecord[]>([]);
  const [offers, setOffers] = useState<Array<{ offer_id: number; buyer_name: string; quantity_kg: number; offered_price_per_kg: number; status: string; expires_at: string | null }>>([]);
  const [fpoId, setFpoId] = useState('');
  const [farmerId, setFarmerId] = useState('');
  const [listingId, setListingId] = useState('');
  const [crop, setCrop] = useState('');
  const [quantity, setQuantity] = useState('');
  const [qualityStandard, setQualityStandard] = useState('');
  const [grade, setGrade] = useState('');
  const [selectedLot, setSelectedLot] = useState<number | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const selectedFpo = Number(fpoId || 0);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setError(''); setNotice('');
    try { await action(); setNotice(success); }
    catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Request failed';
      setError(message);
      if (/session|authentication/i.test(message)) onAuthExpired();
    }
  };

  const load = async () => {
    try {
      const [fpoData, farmerData, lotData] = await Promise.all([getFpos(), getAvailableFarmers(), getFpoLots()]);
      setFpos(fpoData); setFarmers(farmerData); setLots(lotData);
      if (!fpoId && fpoData[0]) setFpoId(String(fpoData[0].id));
    } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load FPO data'); }
  };

  useEffect(() => { void load(); }, []);
  useEffect(() => {
    if (selectedFpo) void getFpoMembers(selectedFpo).then(setMembers).catch(() => undefined);
  }, [selectedFpo]);
  useEffect(() => {
    setListingId(''); setMemberListings([]);
    if (selectedFpo && farmerId && members.some((member) => member.farmer_user_id === farmerId)) {
      void getFpoMemberListings(selectedFpo, farmerId).then(setMemberListings).catch(() => undefined);
    }
  }, [selectedFpo, farmerId, members]);

  return (
    <section className="rounded-2xl border border-stone-200 bg-[#F7FAF7] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Layers className="h-5 w-5 text-[#2D6A4F]" /><div><p className="text-xs font-black uppercase tracking-wider text-[#2D6A4F]">FPO operations</p><h3 className="text-2xl font-black">Aggregation center</h3></div></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-black"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
      {notice && <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm font-bold text-emerald-800">{notice}</p>}
      {error && <p className="mt-3 rounded-lg bg-rose-50 p-2 text-sm font-bold text-rose-800">{error}</p>}
      <label className="mt-4 block max-w-md text-sm font-black">Managed FPO<select value={fpoId} onChange={(event) => setFpoId(event.target.value)} className="mt-1 w-full rounded-lg border bg-white p-2">{fpos.map((fpo) => <option key={fpo.id} value={fpo.id}>{fpo.name}{fpo.registration_number ? ` · ${fpo.registration_number}` : ''}</option>)}</select></label>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><h4 className="font-black">Members</h4><div className="mt-2 flex gap-2"><select value={farmerId} onChange={(event) => setFarmerId(event.target.value)} className="min-w-0 flex-1 rounded-lg border p-2 text-sm"><option value="">Select farmer</option>{farmers.filter((farmer) => !members.some((member) => member.farmer_user_id === farmer.farmer_user_id)).map((farmer) => <option key={farmer.farmer_user_id} value={farmer.farmer_user_id}>{farmer.farmer_name}{farmer.phone ? ` · ${farmer.phone}` : ''}</option>)}</select><button type="button" disabled={!farmerId || !selectedFpo} onClick={() => void run(async () => { await addFpoMember(selectedFpo, farmerId); setMembers(await getFpoMembers(selectedFpo)); setFarmerId(''); }, 'Farmer added to FPO.')} className="rounded-lg bg-[#165B33] p-2 text-white"><Plus className="h-4 w-4" /></button></div><ul className="mt-3 space-y-2 text-sm font-bold">{members.map((member) => <li key={member.farmer_user_id} className="flex items-center justify-between gap-2 border-b pb-2"><span>{member.farmer_name}</span><button type="button" onClick={() => void run(async () => { await removeFpoMember(selectedFpo, member.farmer_user_id); setMembers(await getFpoMembers(selectedFpo)); }, 'Farmer removed.')} className="text-rose-700"><Trash2 className="h-4 w-4" /></button></li>)}</ul></div>

        <form className="rounded-xl border bg-white p-4" onSubmit={(event) => { event.preventDefault(); void run(async () => { await createFpoLot(selectedFpo, { commodity_name: crop, target_price_per_kg: null, quality_standard: qualityStandard, members: [{ farmer_user_id: farmerId, listing_id: Number(listingId), quantity_kg: Number(quantity) }] }); setCrop(''); setQuantity(''); setQualityStandard(''); setListingId(''); await load(); }, 'Pooled crop lot created.'); }}><h4 className="font-black">Create pooled lot</h4><input required placeholder="Crop" value={crop} onChange={(event) => setCrop(event.target.value)} className="mt-2 w-full rounded-lg border p-2" /><select required value={farmerId} onChange={(event) => setFarmerId(event.target.value)} className="mt-2 w-full rounded-lg border bg-white p-2"><option value="">Select contributing farmer</option>{members.map((member) => <option key={member.farmer_user_id} value={member.farmer_user_id}>{member.farmer_name}</option>)}</select><select required value={listingId} onChange={(event) => setListingId(event.target.value)} className="mt-2 w-full rounded-lg border bg-white p-2"><option value="">Select source listing</option>{memberListings.map((listing) => <option key={listing.listing_id} value={listing.listing_id}>{listing.crop}{listing.variety ? ` · ${listing.variety}` : ''} · {listing.quantity} {listing.unit}</option>)}</select><input required type="number" min="0.001" step="0.001" placeholder="Quantity kg" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 w-full rounded-lg border p-2" /><input required placeholder="Quality standard" value={qualityStandard} onChange={(event) => setQualityStandard(event.target.value)} className="mt-2 w-full rounded-lg border p-2" /><button className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#165B33] px-3 py-2 text-sm font-black text-white"><Plus className="h-4 w-4" /> Create lot</button></form>

        <div className="rounded-xl border bg-white p-4"><h4 className="font-black">Quality and offers</h4><select value={selectedLot || ''} onChange={(event) => { const id = Number(event.target.value); setSelectedLot(id || null); if (id) void getFpoLotOffers(id).then(setOffers).catch(() => undefined); }} className="mt-2 w-full rounded-lg border bg-white p-2"><option value="">Select pooled lot</option>{lots.map((lot) => <option key={lot.lot_id} value={lot.lot_id}>{lot.commodity} · {lot.fpo_name} · {lot.total_quantity_kg} kg</option>)}</select><input placeholder="Quality grade" value={grade} onChange={(event) => setGrade(event.target.value)} className="mt-2 w-full rounded-lg border p-2" /><button type="button" disabled={!selectedLot || !grade || !qualityStandard} onClick={() => void run(() => reviewFpoLotQuality(selectedLot!, { quality_grade: grade, quality_standard: qualityStandard }), 'Quality standardized.')} className="mt-2 inline-flex items-center gap-1 rounded-lg border border-[#165B33] px-3 py-2 text-sm font-black text-[#165B33]"><ShieldCheck className="h-4 w-4" /> Save grade</button>{offers.length > 0 && <div className="mt-3 space-y-2 text-xs font-bold">{offers.map((offer) => <div key={offer.offer_id} className="rounded-lg bg-stone-50 p-2"><p>{offer.buyer_name} · ₹{offer.offered_price_per_kg}/kg · {offer.status}</p><button type="button" onClick={() => void run(async () => { await calculateFpoSettlements(offer.offer_id); }, 'Settlements calculated per farmer.')} className="mt-1 rounded border px-2 py-1">Calculate settlement</button></div>)}</div>}</div>
      </div>
    </section>
  );
};
