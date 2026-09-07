import React from 'react';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { CalculatedMarketResult, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MapRouteViewProps {
  latitude?: number;
  longitude?: number;
  recommendedMarket: CalculatedMarketResult;
  allMarkets: CalculatedMarketResult[];
  language: Language;
}

export const MapRouteView: React.FC<MapRouteViewProps> = ({
  latitude,
  longitude,
  recommendedMarket,
  allMarkets,
  language,
}) => {
  const t = getTranslation(language);
  const mt = t.map;
  const hasLocation = latitude !== undefined && longitude !== undefined;

  return (
    <div
      className="bg-white rounded-2xl border-2 border-stone-200 shadow-sm overflow-hidden"
      id="map-route-view"
    >
      {/* Header */}
      <div className="bg-stone-50 border-b border-stone-200 px-5 py-3.5 flex items-center gap-2">
        <Navigation className="w-5 h-5 text-emerald-700" />
        <h3 className="text-base font-black text-stone-900">{mt.title}</h3>
      </div>

      <div className="p-5">
        {!hasLocation ? (
          /* No GPS — show unavailable state */
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-stone-400" />
            </div>
            <p className="text-sm font-black text-stone-600">{mt.dataUnavailable}</p>
            <p className="text-xs font-semibold text-stone-400">
              {mt.gpsPrompt || 'Use the "Use GPS" button in the form to enable map view.'}
            </p>
          </div>
        ) : (
          /* GPS available — show visual route diagram */
          <div className="space-y-4">
            <p className="text-xs font-bold text-stone-500">{mt.subtitle}</p>

            {/* Visual SVG Route */}
            <div className="relative bg-stone-50 rounded-xl border border-stone-200 p-4">
              {/* Farmer Pin */}
              <div className="flex items-start gap-3 mb-1">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="w-0.5 bg-emerald-300 flex-1 my-1" style={{ height: 32 }} />
                </div>
                <div className="pt-1">
                  <p className="text-xs font-black text-stone-700">{mt.farmerLocation}</p>
                  <p className="text-xs font-bold text-stone-500">
                    {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
                  </p>
                </div>
              </div>

              {/* Route Lines for each market */}
              {allMarkets.map((market, idx) => (
                <div key={market.id} className="flex items-start gap-3 mb-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        market.isRecommended
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-stone-100 border-stone-300'
                      }`}
                    >
                      <span className="text-xs font-black text-stone-700">
                        {market.isRecommended ? '⭐' : `${idx + 1}`}
                      </span>
                    </div>
                    {idx < allMarkets.length - 1 && (
                      <div className="w-0.5 bg-stone-200 my-1" style={{ height: 16 }} />
                    )}
                  </div>
                  <div className="pt-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-xs font-black ${
                          market.isRecommended ? 'text-emerald-800' : 'text-stone-700'
                        }`}
                      >
                        {market.name}
                        {market.isRecommended && (
                          <span className="ml-1.5 bg-emerald-100 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                            {mt.recommendedMandi}
                          </span>
                        )}
                      </p>
<<<<<<< HEAD
                      <div>
                        <p className="mt-1 text-[11px] font-bold text-stone-500">
                          {market.crop || 'Crop unavailable'} · Min {market.minimumPrice ?? '—'} · Max {market.maximumPrice ?? '—'} · Modal {market.modalPrice ?? '—'} {market.priceUnit || ''}
                        </p>
                        <p className="text-[11px] font-bold text-stone-400">
                          {market.lastUpdated ? `Last updated: ${new Date(market.lastUpdated).toLocaleString('en-IN')}` : 'Last updated unavailable'}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                        {market.roadDistanceKm !== undefined && market.roadDistanceKm !== null
                          ? `Road: ${market.roadDistanceKm} km`
                          : `Straight-line: ${market.straightLineDistanceKm ?? market.distanceKm} km`}
                      </span>
                    </div>
                    {market.directionsUrl && (
                      <a href={market.directionsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-black text-emerald-700 hover:underline">
                        Directions
                      </a>
                    )}
=======
                      <span className="text-xs font-bold text-stone-500 bg-white border border-stone-200 px-2 py-0.5 rounded-full">
                        {mt.routeDistance}: {market.distanceKm} km
                      </span>
                    </div>
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] font-bold text-stone-400 text-center">
<<<<<<< HEAD
              Straight-line distance uses GPS coordinates. Road distance appears only when Routes API data is available.
=======
              {mt.distanceDisclaimer || '* Distances are approximate estimates. Use Google Maps for navigation.'}
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
