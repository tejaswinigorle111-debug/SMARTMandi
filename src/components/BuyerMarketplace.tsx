import React, { useEffect, useState } from 'react';
import { Check, Filter, MapPin, RefreshCw, Search, ShoppingCart, Star, Truck, X } from 'lucide-react';
import {
  BuyerListing,
  BuyerListingFilters,
  createBuyerOrder,
  getBuyerOrders,
  getBuyerTracking,
  makeOffer,
  reviewBuyerOrder,
  searchBuyerListings,
} from '../services/buyer';

interface BuyerMarketplaceProps {
  onAuthExpired: () => void;
}

const initialFilters: BuyerListingFilters = { page: 1, page_size: 12 };

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm font-bold text-stone-500">{message}</div>;
}

export const BuyerMarketplace: React.FC<BuyerMarketplaceProps> = ({ onAuthExpired }) => {
  const [filters, setFilters] = useState<BuyerListingFilters>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<BuyerListingFilters>(initialFilters);
  const [listings, setListings] = useState<BuyerListing[]>([]);
  const [total, setTotal] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedListing, setSelectedListing] = useState<BuyerListing | null>(null);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof getBuyerOrders>>['items']>([]);
  const [offerQuantity, setOfferQuantity] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerExpiry, setOfferExpiry] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [reviewRating, setReviewRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadListings = async (nextFilters = filters) => {
    setLoading(true); setError(null);
    try {
      const result = await searchBuyerListings(nextFilters);
      setListings(result.items); setTotal(result.total); setHasNext(result.has_next);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load marketplace listings';
      setError(message);
      if (message.toLowerCase().includes('session') || message.toLowerCase().includes('authentication')) onAuthExpired();
    } finally { setLoading(false); }
  };

  const loadOrders = async () => {
    try { setOrders((await getBuyerOrders()).items); } catch (loadError) { setError(loadError instanceof Error ? loadError.message : 'Unable to load orders'); }
  };

  useEffect(() => { void loadListings(); void loadOrders(); }, []);

  const applyFilters = (event: React.FormEvent) => {
    event.preventDefault();
    const next = { ...draftFilters, page: 1 };
    setFilters(next); void loadListings(next);
  };

  const setGpsFilter = () => {
    if (!navigator.geolocation) { setError('Location is not supported by this browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { ...draftFilters, latitude: position.coords.latitude, longitude: position.coords.longitude, page: 1 };
        setDraftFilters(next); setFilters(next); void loadListings(next);
      },
      () => setError('Location permission was denied. Distance filtering needs your permission.'),
      { timeout: 8000, enableHighAccuracy: false },
    );
  };

  const toggleCompare = (id: number) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id].slice(-3));

  const submitOffer = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selectedListing) return;
    setWorking(true); setError(null); setNotice(null);
    try { await makeOffer(selectedListing.id, Number(offerQuantity), Number(offerPrice), offerExpiry ? new Date(offerExpiry).toISOString() : undefined); setNotice('Offer submitted to the farmer.'); setSelectedListing(null); await loadListings(); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Unable to submit offer'); }
    finally { setWorking(false); }
  };

  const submitOrder = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selectedListing) return;
    setWorking(true); setError(null); setNotice(null);
    try { await createBuyerOrder(selectedListing.id, Number(orderQuantity), Number(orderPrice)); setNotice('Order created. Payment remains pending until confirmed by the payment workflow.'); setSelectedListing(null); await loadListings(); await loadOrders(); }
    catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Unable to create order'); }
    finally { setWorking(false); }
  };

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault(); if (!reviewOrderId) return;
    setWorking(true); setError(null);
    try { await reviewBuyerOrder(reviewOrderId, Number(reviewRating), reviewComment); setNotice('Review submitted.'); setReviewOrderId(null); }
    catch (reviewError) { setError(reviewError instanceof Error ? reviewError.message : 'Unable to submit review'); }
    finally { setWorking(false); }
  };

  const comparedListings = listings.filter((listing) => selectedIds.includes(listing.id));

  return (
    <section className="border-y border-[#CFDFD1] bg-[#F7FAF7] py-10" id="buyer-marketplace">
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-black uppercase tracking-wider text-[#2D6A4F]">Buyer / Retailer / Seller workspace</p><h2 className="text-3xl font-black text-stone-950">Browse farmer listings</h2></div><button type="button" onClick={() => { void loadListings(); void loadOrders(); }} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 font-black text-stone-700"><RefreshCw className="h-4 w-4" /> Refresh</button></div>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{notice}</p>}

        <form onSubmit={applyFilters} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2"><Filter className="h-5 w-5 text-[#2D6A4F]" /><h3 className="text-xl font-black">Search and filter listings</h3></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-black text-stone-700 lg:col-span-2">Search crop, variety, district, or state<input value={draftFilters.query || ''} onChange={(event) => setDraftFilters({ ...draftFilters, query: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>
            {(['crop', 'location', 'quality'] as const).map((field) => <label key={field} className="text-sm font-black text-stone-700">{field}<input value={draftFilters[field] || ''} onChange={(event) => setDraftFilters({ ...draftFilters, [field]: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>)}
            {(['min_price', 'max_price', 'min_quantity', 'max_quantity', 'max_distance_km'] as const).map((field) => <label key={field} className="text-sm font-black text-stone-700">{field.replaceAll('_', ' ')}<input type="number" min="0" step="0.01" value={draftFilters[field] || ''} onChange={(event) => setDraftFilters({ ...draftFilters, [field]: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>)}
            <label className="text-sm font-black text-stone-700">Harvest from<input type="date" value={draftFilters.harvest_from || ''} onChange={(event) => setDraftFilters({ ...draftFilters, harvest_from: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>
            <label className="text-sm font-black text-stone-700">Harvest to<input type="date" value={draftFilters.harvest_to || ''} onChange={(event) => setDraftFilters({ ...draftFilters, harvest_to: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2.5" /></label>
          </div>
          <div className="mt-4 flex flex-wrap gap-2"><button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[#165B33] px-5 py-2.5 font-black text-white"><Search className="h-4 w-4" /> Search database</button><button type="button" onClick={setGpsFilter} className="inline-flex items-center gap-2 rounded-xl border border-stone-300 bg-white px-5 py-2.5 font-black text-stone-700"><MapPin className="h-4 w-4" /> Use my location for distance</button></div>
        </form>

        {comparedListings.length > 1 && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-xl font-black text-stone-950">Compare listings</h3><button type="button" onClick={() => setSelectedIds([])} className="text-sm font-black text-stone-600">Clear</button></div><div className="grid gap-3 md:grid-cols-3">{comparedListings.map((listing) => <div key={listing.id} className="rounded-xl border border-emerald-200 bg-white p-3 text-sm"><p className="font-black">{listing.crop}</p><p className="font-bold">Price: {listing.expected_price === null || listing.expected_price === undefined ? 'Not provided' : `₹${listing.expected_price}/${listing.unit}`}</p><p className="font-bold">Quantity: {listing.quantity} {listing.unit}</p><p className="font-bold">Distance: {listing.distance_km === null || listing.distance_km === undefined ? 'Not calculated' : `${listing.distance_km} km`}</p></div>)}</div></div>}

        <div className="flex items-center justify-between"><p className="text-sm font-black text-stone-600">{total} database listing{total === 1 ? '' : 's'}</p><p className="text-xs font-bold text-stone-500">Page {filters.page || 1}</p></div>
        {loading ? <EmptyState message="Loading listings from the database..." /> : listings.length === 0 ? <EmptyState message="No real listings match these filters." /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{listings.map((listing) => <article key={listing.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-black text-stone-950">{listing.crop}{listing.variety ? ` · ${listing.variety}` : ''}</h3><p className="text-sm font-bold text-stone-500">{listing.farmer_name}{listing.fpo_name ? ` · ${listing.fpo_name}` : ''}</p></div><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-800">{listing.status}</span></div><div className="mt-4 space-y-1 text-sm font-bold text-stone-700"><p>Quantity: {listing.quantity} {listing.unit}</p><p>Quality: {listing.quality || 'Not provided'}</p><p>Expected price: {listing.expected_price === null || listing.expected_price === undefined ? 'Not provided' : `₹${listing.expected_price}/${listing.unit}`}</p><p>Location: {[listing.village, listing.district, listing.state].filter(Boolean).join(', ') || 'Not provided'}</p><p>Distance: {listing.distance_km === null || listing.distance_km === undefined ? 'Not calculated' : `${listing.distance_km} km`}</p><p>Harvest: {listing.expected_harvest_date || 'Not provided'}</p></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setSelectedListing(listing); setOfferQuantity(String(listing.quantity)); setOfferPrice(listing.expected_price?.toString() || ''); setOrderQuantity(String(listing.quantity)); setOrderPrice(listing.expected_price?.toString() || ''); }} className="inline-flex items-center gap-1 rounded-lg bg-[#165B33] px-3 py-2 text-xs font-black text-white"><ShoppingCart className="h-3 w-3" /> Offer / order</button><button type="button" onClick={() => toggleCompare(listing.id)} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-black ${selectedIds.includes(listing.id) ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-stone-300'}`}><Check className="h-3 w-3" /> Compare</button></div></article>)}</div>}

        <div className="flex justify-between"><button type="button" disabled={(filters.page || 1) <= 1 || loading} onClick={() => { const next = { ...filters, page: (filters.page || 1) - 1 }; setFilters(next); void loadListings(next); }} className="rounded-xl border border-stone-300 bg-white px-4 py-2 font-black disabled:opacity-40">Previous</button><button type="button" disabled={!hasNext || loading} onClick={() => { const next = { ...filters, page: (filters.page || 1) + 1 }; setFilters(next); void loadListings(next); }} className="rounded-xl border border-stone-300 bg-white px-4 py-2 font-black disabled:opacity-40">Next</button></div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Truck className="h-5 w-5 text-[#2D6A4F]" /><h3 className="text-xl font-black">My orders and delivery</h3></div>{orders.length === 0 ? <EmptyState message="No orders yet." /> : <div className="space-y-3">{orders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-3"><div><p className="font-black">Order #{order.id} · {order.crop}</p><p className="text-sm font-bold text-stone-500">{order.quantity} kg · ₹{order.agreed_price_per_kg}/kg · {order.status}</p><p className="text-xs font-bold text-stone-500">Payment: {order.payment_status || 'Not recorded'} · Delivery: {order.shipment_status || 'Not assigned'}</p></div><div className="flex gap-2"><button type="button" onClick={async () => { try { const result = await getBuyerTracking(order.id); setNotice(`Order #${order.id}: ${result.status}`); } catch (trackingError) { setError(trackingError instanceof Error ? trackingError.message : 'Unable to load tracking'); } }} className="rounded-lg border border-stone-300 px-3 py-2 text-xs font-black">Track</button>{['DELIVERED', 'COMPLETED'].includes(order.status) && <button type="button" onClick={() => setReviewOrderId(order.id)} className="inline-flex items-center gap-1 rounded-lg border border-stone-300 px-3 py-2 text-xs font-black"><Star className="h-3 w-3" /> Review</button>}</div></div>)}</div>}</div>

        {selectedListing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-5 flex items-start justify-between"><div><h3 className="text-2xl font-black">{selectedListing.crop}</h3><p className="text-sm font-bold text-stone-500">Create an offer or order using verified listing data.</p></div><button type="button" onClick={() => setSelectedListing(null)}><X className="h-5 w-5" /></button></div><div className="grid gap-5 md:grid-cols-2"><form onSubmit={submitOffer} className="space-y-3 rounded-xl border border-stone-200 p-4"><h4 className="font-black">Make offer</h4><input required type="number" min="0.001" step="0.001" value={offerQuantity} onChange={(event) => setOfferQuantity(event.target.value)} placeholder="Quantity" className="w-full rounded-lg border border-stone-300 px-3 py-2" /><input required type="number" min="0.01" step="0.01" value={offerPrice} onChange={(event) => setOfferPrice(event.target.value)} placeholder="Offered price / kg" className="w-full rounded-lg border border-stone-300 px-3 py-2" /><button disabled={working} className="w-full rounded-lg bg-[#165B33] px-3 py-2 font-black text-white">Submit offer</button></form><form onSubmit={submitOrder} className="space-y-3 rounded-xl border border-stone-200 p-4"><h4 className="font-black">Create order</h4><input required type="number" min="0.001" step="0.001" value={orderQuantity} onChange={(event) => setOrderQuantity(event.target.value)} placeholder="Quantity" className="w-full rounded-lg border border-stone-300 px-3 py-2" /><input required type="number" min="0.01" step="0.01" value={orderPrice} onChange={(event) => setOrderPrice(event.target.value)} placeholder="Agreed price / kg" className="w-full rounded-lg border border-stone-300 px-3 py-2" /><button disabled={working} className="w-full rounded-lg border border-[#165B33] px-3 py-2 font-black text-[#165B33]">Create order</button></form></div></div></div>}

        {reviewOrderId && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><form onSubmit={submitReview} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><h3 className="text-xl font-black">Review order #{reviewOrderId}</h3><button type="button" onClick={() => setReviewOrderId(null)}><X className="h-5 w-5" /></button></div><select value={reviewRating} onChange={(event) => setReviewRating(event.target.value)} className="w-full rounded-lg border border-stone-300 px-3 py-2"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Average</option><option value="2">2 - Poor</option><option value="1">1 - Very poor</option></select><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} placeholder="Comment (optional)" className="min-h-24 w-full rounded-lg border border-stone-300 px-3 py-2" /><button disabled={working} className="w-full rounded-lg bg-[#165B33] px-3 py-2 font-black text-white">Submit review</button></form></div>}
      </div>
    </section>
  );
};
