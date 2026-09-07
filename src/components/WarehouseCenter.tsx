import React, { useEffect, useState } from 'react';
import { Check, RefreshCw, Warehouse } from 'lucide-react';
import { AuthUser, hasRole } from '../services/auth';
import { decideWarehouseBooking, getWarehouseBookings, getWarehouseCapacity, receiveWarehouseInventory, releaseWarehouseInventory, reportWarehouseSpoilage } from '../services/transactions';

export const WarehouseCenter: React.FC<{ user: AuthUser }> = ({ user }) => {
  const isManager = hasRole(user, ['WAREHOUSE_MANAGER', 'ADMIN']);
  const [capacity, setCapacity] = useState<Array<{ id: number; name: string; capacity_kg: number; used_capacity_kg: number; available_capacity_kg: number; status: string }>>([]);
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [receive, setReceive] = useState({ booking_id: '', crop: '', quantity: '', grade: '', location: '', exit: '' });
  const [inventory, setInventory] = useState({ id: '', quantity: '', reason: '' });

  const load = async () => {
    try {
      setCapacity(await getWarehouseCapacity());
      setBookings(await getWarehouseBookings(isManager ? 'REQUESTED' : 'ALL'));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load warehouse data');
    }
  };

  useEffect(() => { void load(); }, []);

  const run = async (action: () => Promise<unknown>, success: string) => {
    setError('');
    setMessage('');
    try {
      await action();
      setMessage(success);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Warehouse request failed');
    }
  };

  return <section className="border-b border-[#CFDFD1] bg-[#F7FAF7] py-8"><div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between"><div><p className="text-sm font-black uppercase tracking-wider text-[#2D6A4F]">Warehouse operations</p><h2 className="text-2xl font-black">Storage capacity and inventory</h2></div><button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 font-black"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
    {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}
    {error && <p className="rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{capacity.map((item) => <div key={item.id} className="rounded-2xl border border-stone-200 bg-white p-4"><div className="flex items-center gap-2"><Warehouse className="h-5 w-5 text-[#2D6A4F]" /><h3 className="font-black">{item.name}</h3></div><p className="mt-2 text-sm font-bold">Used: {item.used_capacity_kg.toLocaleString()} kg</p><p className="text-sm font-bold text-emerald-800">Available: {item.available_capacity_kg.toLocaleString()} kg</p><p className="text-xs font-bold text-stone-500">Capacity: {item.capacity_kg.toLocaleString()} kg · {item.status}</p></div>)}</div>
    {isManager && <div className="rounded-2xl border border-stone-200 bg-white p-5"><div className="mb-3 flex items-center gap-2"><Check className="h-5 w-5 text-[#2D6A4F]" /><h3 className="font-black">Booking approvals</h3></div>{bookings.length === 0 ? <p className="text-sm font-bold text-stone-500">No requested bookings.</p> : <div className="space-y-2">{bookings.map((booking) => <div key={String(booking.id)} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"><p className="text-sm font-bold">Booking #{String(booking.id)} · {String(booking.quantity_kg)} kg · {String(booking.farmer_name)}</p><div className="flex gap-2"><button type="button" onClick={() => void run(() => decideWarehouseBooking(Number(booking.id), 'CONFIRMED'), 'Booking confirmed.')} className="rounded-lg bg-[#165B33] px-3 py-1.5 text-xs font-black text-white">Approve</button><button type="button" onClick={() => void run(() => decideWarehouseBooking(Number(booking.id), 'CANCELLED'), 'Booking cancelled.')} className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-black text-rose-700">Reject</button></div></div>)}</div>}</div>}
    <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="mb-3 font-black">Receive inventory</h3><form className="grid gap-2 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); void run(() => receiveWarehouseInventory({ booking_id: Number(receive.booking_id), commodity_name: receive.crop, quantity_kg: Number(receive.quantity), quality_grade: receive.grade || undefined, storage_location: receive.location || undefined, expected_exit_date: receive.exit || undefined }), 'Inventory received into warehouse.'); }}><input required type="number" placeholder="Confirmed booking ID" className="rounded-lg border p-2" value={receive.booking_id} onChange={(event) => setReceive({ ...receive, booking_id: event.target.value })} /><input required placeholder="Crop" className="rounded-lg border p-2" value={receive.crop} onChange={(event) => setReceive({ ...receive, crop: event.target.value })} /><input required type="number" placeholder="Quantity kg" className="rounded-lg border p-2" value={receive.quantity} onChange={(event) => setReceive({ ...receive, quantity: event.target.value })} /><input placeholder="Quality grade" className="rounded-lg border p-2" value={receive.grade} onChange={(event) => setReceive({ ...receive, grade: event.target.value })} /><input placeholder="Storage location" className="rounded-lg border p-2" value={receive.location} onChange={(event) => setReceive({ ...receive, location: event.target.value })} /><input type="date" className="rounded-lg border p-2" value={receive.exit} onChange={(event) => setReceive({ ...receive, exit: event.target.value })} /><button className="rounded-lg bg-[#165B33] px-4 py-2 font-black text-white sm:col-span-2">Receive stock</button></form></div>
    <div className="rounded-2xl border border-stone-200 bg-white p-5"><h3 className="mb-3 font-black">Spoilage or release</h3><form className="space-y-2" onSubmit={(event) => { event.preventDefault(); void run(() => reportWarehouseSpoilage(Number(inventory.id), { quantity_kg: Number(inventory.quantity), reason: inventory.reason }), 'Spoilage recorded.'); }}><input required type="number" placeholder="Inventory ID" className="w-full rounded-lg border p-2" value={inventory.id} onChange={(event) => setInventory({ ...inventory, id: event.target.value })} /><input required type="number" placeholder="Quantity kg" className="w-full rounded-lg border p-2" value={inventory.quantity} onChange={(event) => setInventory({ ...inventory, quantity: event.target.value })} /><input required placeholder="Reason" className="w-full rounded-lg border p-2" value={inventory.reason} onChange={(event) => setInventory({ ...inventory, reason: event.target.value })} /><div className="flex gap-2"><button className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-black text-rose-700">Report spoilage</button><button type="button" onClick={() => void run(() => releaseWarehouseInventory(Number(inventory.id), { quantity_kg: Number(inventory.quantity), reason: inventory.reason }), 'Inventory released.')} className="rounded-lg bg-[#165B33] px-3 py-2 text-sm font-black text-white">Release stock</button></div></form></div></div>
  </div></section>;
};
