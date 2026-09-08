import React, { useEffect, useState } from 'react';
import { Boxes, Check, Copy, Pencil, QrCode, RefreshCw, X } from 'lucide-react';
import {
  cancelCropLot,
  createCropLot,
  CropLot,
  CropLotStatus,
  getCropLots,
  ListingUnit,
  updateCropLot,
} from '../services/farmer';

interface CropLotManagerProps {
  onAuthExpired: () => void;
}

type LotForm = {
  commodity_name: string;
  variety: string;
  quantity: string;
  unit: ListingUnit;
  location: string;
  harvest_date: string;
  photos: string;
  quality_grade: string;
  quality_details: string;
  expected_price: string;
  availability_date: string;
  fpo_id: string;
  status: CropLotStatus;
};

const emptyForm: LotForm = {
  commodity_name: '', variety: '', quantity: '', unit: 'kg', location: '', harvest_date: '', photos: '',
  quality_grade: '', quality_details: '', expected_price: '', availability_date: '', fpo_id: '', status: 'DRAFT',
};

const statuses: CropLotStatus[] = ['DRAFT', 'ACTIVE', 'PUBLISHED', 'RESERVED', 'EXPIRED', 'CANCELLED'];

export const CropLotManager: React.FC<CropLotManagerProps> = ({ onAuthExpired }) => {
  const [lots, setLots] = useState<CropLot[]>([]);
  const [form, setForm] = useState<LotForm>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadLots = async () => {
    setLoading(true); setError('');
    try {
      setLots(await getCropLots());
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load crop lots';
      setError(message);
      if (message.toLowerCase().includes('session') || message.toLowerCase().includes('authentication')) onAuthExpired();
    } finally { setLoading(false); }
  };

  useEffect(() => { void loadLots(); }, []);

  const setField = <K extends keyof LotForm>(field: K, value: LotForm[K]) => setForm((current) => ({ ...current, [field]: value }));

  const editLot = (lot: CropLot) => {
    setEditingId(lot.id);
    setForm({
      commodity_name: lot.crop, variety: lot.variety || '', quantity: String(lot.quantity), unit: lot.unit,
      location: lot.location || '', harvest_date: lot.harvest_date || '', photos: lot.photos.join(', '),
      quality_grade: lot.quality_grade || '', quality_details: lot.quality_details || '',
      expected_price: lot.expected_price === null ? '' : String(lot.expected_price),
      availability_date: lot.availability_date || '', fpo_id: lot.fpo_id ? String(lot.fpo_id) : '', status: lot.status,
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const input = {
      commodity_name: form.commodity_name.trim(),
      variety: form.variety.trim() || null,
      quantity: Number(form.quantity), unit: form.unit, location: form.location.trim(),
      harvest_date: form.harvest_date || null,
      photos: form.photos.split(',').map((photo) => photo.trim()).filter(Boolean),
      quality_grade: form.quality_grade.trim() || null, quality_details: form.quality_details.trim() || null,
      expected_price: form.expected_price ? Number(form.expected_price) : null,
      availability_date: form.availability_date || null,
      fpo_id: form.fpo_id ? Number(form.fpo_id) : null, status: form.status,
    };
    try {
      if (editingId) await updateCropLot(editingId, input);
      else await createCropLot({ ...input, commodity_name: form.commodity_name.trim() });
      setForm(emptyForm); setEditingId(null); setNotice(editingId ? 'Crop lot updated.' : 'Crop lot created.'); await loadLots();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'Unable to save crop lot'); }
    finally { setSaving(false); }
  };

  const removeLot = async (id: number) => {
    setError('');
    try { await cancelCropLot(id); setNotice('Crop lot cancelled.'); await loadLots(); }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : 'Unable to cancel crop lot'); }
  };

  const copyQr = async (payload: string) => { await navigator.clipboard?.writeText(payload); setNotice('QR payload copied.'); };

  return (
    <section className="space-y-5 rounded-2xl border border-stone-200 bg-[#F7FAF7] p-5 shadow-sm" id="crop-lot-manager">
      <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Boxes className="h-5 w-5 text-[#2D6A4F]" /><div><p className="text-xs font-black uppercase tracking-wider text-[#2D6A4F]">Reusable inventory workflow</p><h3 className="text-2xl font-black text-stone-950">Digital crop lots</h3></div></div><button type="button" onClick={() => void loadLots()} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-black"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}
      {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</p>}
      <form onSubmit={submit} className="grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-black text-stone-700">Crop<input required value={form.commodity_name} onChange={(event) => setField('commodity_name', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Variety<input value={form.variety} onChange={(event) => setField('variety', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Quantity<input required type="number" min="0.001" step="0.001" value={form.quantity} onChange={(event) => setField('quantity', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Unit<select value={form.unit} onChange={(event) => setField('unit', event.target.value as ListingUnit)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"><option>kg</option><option>quintal</option><option>tonne</option><option>piece</option><option>crate</option></select></label>
        <label className="text-sm font-black text-stone-700 lg:col-span-2">Location<input required value={form.location} onChange={(event) => setField('location', event.target.value)} placeholder="Village, district, state" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Harvest date<input type="date" value={form.harvest_date} onChange={(event) => setField('harvest_date', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Availability date<input type="date" value={form.availability_date} onChange={(event) => setField('availability_date', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Quality grade<input value={form.quality_grade} onChange={(event) => setField('quality_grade', event.target.value)} placeholder="A, B, export grade" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Expected price<input type="number" min="0" step="0.01" value={form.expected_price} onChange={(event) => setField('expected_price', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">FPO ID (optional)<input type="number" min="1" value={form.fpo_id} onChange={(event) => setField('fpo_id', event.target.value)} className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700">Status<select value={form.status} onChange={(event) => setField('status', event.target.value as CropLotStatus)} className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="text-sm font-black text-stone-700 sm:col-span-2 lg:col-span-4">Photos<input value={form.photos} onChange={(event) => setField('photos', event.target.value)} placeholder="Comma-separated HTTPS photo URLs" className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <label className="text-sm font-black text-stone-700 sm:col-span-2 lg:col-span-4">Quality details<textarea value={form.quality_details} onChange={(event) => setField('quality_details', event.target.value)} className="mt-1 min-h-16 w-full rounded-lg border border-stone-300 px-3 py-2" /></label>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-[#165B33] px-4 py-2 font-black text-white"><Check className="h-4 w-4" /> {editingId ? 'Update lot' : 'Create lot'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }} className="inline-flex items-center gap-2 rounded-lg border border-stone-300 px-4 py-2 font-black"><X className="h-4 w-4" /> Cancel edit</button>}</div>
      </form>
      {loading ? <p className="rounded-xl bg-white p-5 text-center text-sm font-bold text-stone-500">Loading crop lots...</p> : lots.length === 0 ? <p className="rounded-xl bg-white p-5 text-center text-sm font-bold text-stone-500">No digital crop lots yet.</p> : <div className="grid gap-3 md:grid-cols-2">{lots.map((lot) => <article key={lot.id} className="rounded-xl border border-stone-200 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><h4 className="text-lg font-black">{lot.crop}{lot.variety ? ` · ${lot.variety}` : ''}</h4><p className="text-xs font-black text-[#2D6A4F]">{lot.lot_code} · {lot.status}</p></div><QrCode className="h-6 w-6 text-[#165B33]" /></div><p className="mt-2 text-sm font-bold text-stone-700">{lot.quantity} {lot.unit} · {lot.location || 'Location unavailable'}</p><p className="text-sm font-bold text-stone-600">Available: {lot.availability_date || 'Not provided'} · Grade: {lot.quality_grade || 'Not provided'}</p><p className="mt-2 break-all rounded-lg bg-stone-50 p-2 text-xs font-bold text-stone-500">{lot.qr_payload}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void copyQr(lot.qr_payload)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-black"><Copy className="h-3 w-3" /> Copy QR payload</button><button type="button" onClick={() => editLot(lot)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-black"><Pencil className="h-3 w-3" /> Edit</button>{!['SOLD', 'ORDERED', 'CANCELLED'].includes(lot.status) && <button type="button" onClick={() => void removeLot(lot.id)} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-black text-rose-700">Cancel lot</button>}</div></article>)}</div>}
    </section>
  );
};
