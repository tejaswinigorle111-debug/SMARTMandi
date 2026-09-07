<<<<<<< HEAD
"""Legacy compatibility export; official market data comes from MarketDataService."""

MARKETS = []
=======
MARKETS = [
    # Tomato Markets
    {
        "id": 1,
        "name": "Nashik Market",
        "location": "Nashik, Maharashtra",
        "crop": "Tomato",
        "price_per_kg": 25,
        "distance_km": 35,
        "transport_rate": 0.05
    },
    {
        "id": 2,
        "name": "Pune Market",
        "location": "Pune, Maharashtra",
        "crop": "Tomato",
        "price_per_kg": 28,
        "distance_km": 65,
        "transport_rate": 0.05
    },
    {
        "id": 3,
        "name": "Ahmednagar Market",
        "location": "Ahmednagar, Maharashtra",
        "crop": "Tomato",
        "price_per_kg": 26,
        "distance_km": 30,
        "transport_rate": 0.05
    },
    {
        "id": 4,
        "name": "Narayangaon Mandi",
        "location": "Pune Rural, Maharashtra",
        "crop": "Tomato",
        "price_per_kg": 27,
        "distance_km": 45,
        "transport_rate": 0.05
    },
    {
        "id": 5,
        "name": "Kolhapur APMC",
        "location": "Kolhapur, Maharashtra",
        "crop": "Tomato",
        "price_per_kg": 29,
        "distance_km": 95,
        "transport_rate": 0.05
    },

    # Rice Markets
    {
        "id": 6,
        "name": "Nagpur Grain Mandi",
        "location": "Nagpur, Maharashtra",
        "crop": "Rice",
        "price_per_kg": 36,
        "distance_km": 80,
        "transport_rate": 0.04
    },
    {
        "id": 7,
        "name": "Pune Grain Yard",
        "location": "Pune, Maharashtra",
        "crop": "Rice",
        "price_per_kg": 35,
        "distance_km": 60,
        "transport_rate": 0.04
    },
    {
        "id": 8,
        "name": "Nashik Grains Market",
        "location": "Nashik, Maharashtra",
        "crop": "Rice",
        "price_per_kg": 33,
        "distance_km": 35,
        "transport_rate": 0.04
    },
    {
        "id": 9,
        "name": "Gondia Rice Mandi",
        "location": "Gondia, Maharashtra",
        "crop": "Rice",
        "price_per_kg": 38,
        "distance_km": 110,
        "transport_rate": 0.04
    },

    # Cotton Markets
    {
        "id": 10,
        "name": "Jalgaon Cotton Yard",
        "location": "Jalgaon, Maharashtra",
        "crop": "Cotton",
        "price_per_kg": 78,
        "distance_km": 50,
        "transport_rate": 0.06
    },
    {
        "id": 11,
        "name": "Yavatmal APMC Mandi",
        "location": "Yavatmal, Maharashtra",
        "crop": "Cotton",
        "price_per_kg": 81,
        "distance_km": 90,
        "transport_rate": 0.06
    },
    {
        "id": 12,
        "name": "Akola Cotton Market",
        "location": "Akola, Maharashtra",
        "crop": "Cotton",
        "price_per_kg": 76,
        "distance_km": 40,
        "transport_rate": 0.06
    },
    {
        "id": 13,
        "name": "Aurangabad Cotton Yard",
        "location": "Chhatrapati Sambhajinagar, Maharashtra",
        "crop": "Cotton",
        "price_per_kg": 75,
        "distance_km": 35,
        "transport_rate": 0.06
    },

    # Chilli Markets
    {
        "id": 14,
        "name": "Nagpur Chilli Market",
        "location": "Nagpur, Maharashtra",
        "crop": "Chilli",
        "price_per_kg": 195,
        "distance_km": 75,
        "transport_rate": 0.07
    },
    {
        "id": 15,
        "name": "Nandurbar Red Chilli Yard",
        "location": "Nandurbar, Maharashtra",
        "crop": "Chilli",
        "price_per_kg": 205,
        "distance_km": 95,
        "transport_rate": 0.07
    },
    {
        "id": 16,
        "name": "Pune Vegetable Yard",
        "location": "Pune, Maharashtra",
        "crop": "Chilli",
        "price_per_kg": 190,
        "distance_km": 55,
        "transport_rate": 0.07
    },
    {
        "id": 17,
        "name": "Nashik Spice Mandi",
        "location": "Nashik, Maharashtra",
        "crop": "Chilli",
        "price_per_kg": 182,
        "distance_km": 30,
        "transport_rate": 0.07
    },

    # Maize Markets
    {
        "id": 18,
        "name": "Nashik Grain Yard",
        "location": "Nashik, Maharashtra",
        "crop": "Maize",
        "price_per_kg": 24,
        "distance_km": 35,
        "transport_rate": 0.045
    },
    {
        "id": 19,
        "name": "Dhule Corn Yard",
        "location": "Dhule, Maharashtra",
        "crop": "Maize",
        "price_per_kg": 26,
        "distance_km": 60,
        "transport_rate": 0.045
    },
    {
        "id": 20,
        "name": "Ahmednagar Grains Mandi",
        "location": "Ahmednagar, Maharashtra",
        "crop": "Maize",
        "price_per_kg": 23,
        "distance_km": 28,
        "transport_rate": 0.045
    },
    {
        "id": 21,
        "name": "Pune Grain Market",
        "location": "Pune, Maharashtra",
        "crop": "Maize",
        "price_per_kg": 25,
        "distance_km": 65,
        "transport_rate": 0.045
    },

    # Onion Markets
    {
        "id": 22,
        "name": "Lasalgaon Onion Mandi",
        "location": "Lasalgaon, Maharashtra",
        "crop": "Onion",
        "price_per_kg": 26,
        "distance_km": 40,
        "transport_rate": 0.05
    },
    {
        "id": 23,
        "name": "Nashik Onion Market",
        "location": "Nashik, Maharashtra",
        "crop": "Onion",
        "price_per_kg": 22,
        "distance_km": 35,
        "transport_rate": 0.05
    },
    {
        "id": 24,
        "name": "Pune Onion Market",
        "location": "Pune, Maharashtra",
        "crop": "Onion",
        "price_per_kg": 24,
        "distance_km": 65,
        "transport_rate": 0.05
    },
    {
        "id": 25,
        "name": "Ahmednagar Onion Yard",
        "location": "Ahmednagar, Maharashtra",
        "crop": "Onion",
        "price_per_kg": 23,
        "distance_km": 30,
        "transport_rate": 0.05
    }
]
>>>>>>> d0499aae7177a6bd6ca71bedf07ed448f122649c
