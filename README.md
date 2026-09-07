# SMARTMandi

Farmer-focused market decision support: compare nearby mandi prices, distance, and transport costs using official **data.gov.in** market data.

## Run locally

**Prerequisites:** Node.js and Python 3.11+

1. Install frontend dependencies: `npm install`
2. Install backend dependencies:
   `pip install -r Backend/requirements.txt`
3. Copy `Backend/.env.example` to `Backend/.env` and set:
   - `DATA_GOV_API_KEY` (from https://data.gov.in/)
   - `DATA_GOV_RESOURCE_ID` (default is the daily mandi price resource)
   - `DATA_GOV_PRICE_UNIT` (`INR/quintal` or `INR/kg`)
   - Cost params (`TRANSPORT_RATE_PER_KM_PER_KG`, etc.)
4. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if the API is not on port 8000.
5. Run both: `npm run start`

Open the frontend at http://localhost:3000. API at http://127.0.0.1:8000.

## Accurate live data

- `/markets` and `/recommend` both use `MarketDataService` + the same `DATA_GOV_*` env config.
- Recommendations use `compare_markets` (transport, storage, platform fee) and grounded `ai_service` intelligence.
- If the live API is missing or fails, the API reports **unavailable** instead of inventing prices.
- Optional `GOOGLE_MAPS_API_KEY` improves geocoding and road distance.
- Never commit `Backend/.env` — rotate any key that was previously pushed to git.

## Useful health checks

- `GET /health`
- `GET /government-data-health`
- `GET /db-health` (when `DATABASE_URL` is set)
