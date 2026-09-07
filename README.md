<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6ee88a87-de42-446a-9768-0272960f96a4

## Run Locally

**Prerequisites:** Node.js and Python 3.11+


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the backend is not on port 8000.
<<<<<<< HEAD
3. Add `DATA_GOV_API_KEY`, the current official `DATA_GOV_RESOURCE_ID`, and its verified `DATA_GOV_PRICE_UNIT` (`INR/quintal` or `INR/kg`) to `Backend/.env` (plus Supabase values if those health checks are needed).
4. Optionally add a server-side `GOOGLE_MAPS_API_KEY` with Geocoding API and Routes API enabled. Without it, the app uses Open-Meteo/Nominatim for geocoding and labels distances as straight-line; it never claims road distance.
5. Configure `TRANSPORT_RATE_PER_KM_PER_KG`, `STORAGE_COST_PER_KG`, `PLATFORM_FEE_PERCENT`, and `OTHER_COST_PER_KG` from actual current cost schedules before using net-realization comparison. If any are missing, comparison is unavailable.
6. Run both app and API:
=======
3. Add `DATA_GOV_API_KEY` to `Backend/.env` (plus Supabase values if those health checks are needed).
4. Run both app and API:
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
   `npm run start`

Open the frontend at `http://localhost:3000`. The backend API is available at `http://127.0.0.1:8000`.

<<<<<<< HEAD
The API requests live mandi prices from the explicitly configured official data.gov.in resource. If credentials, the resource identifier, unit metadata, or the service are unavailable, the recommendation flow reports that live market data is unavailable rather than displaying estimated or bundled market values.
=======
The API requests live Maharashtra mandi prices from data.gov.in when `DATA_GOV_API_KEY` is configured. If that service is unavailable, it returns the bundled local market data so the recommendation flow remains usable.
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
