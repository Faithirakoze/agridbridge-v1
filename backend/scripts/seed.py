"""
Seed Rwanda market prices.
Run once after migrations:
  docker compose exec api python scripts/seed.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.db.session import SessionLocal
from app.models import MarketPrice

PRICES = [
    ("maize",        320, "Kimironko Market", "Kigali"),
    ("beans",        680, "Nyabugogo Market", "Kigali"),
    ("irish_potato", 210, "Kimironko Market", "Kigali"),
    ("sorghum",      290, "Nyabugogo Market", "Kigali"),
    ("sweet_potato", 180, "Kimironko Market", "Kigali"),
    ("cassava",      150, "Nyabugogo Market", "Kigali"),
    ("maize",        305, "Musanze Market",   "Musanze"),
    ("beans",        650, "Musanze Market",   "Musanze"),
    ("irish_potato", 195, "Musanze Market",   "Musanze"),
    ("maize",        310, "Huye Market",      "Huye"),
    ("beans",        660, "Huye Market",      "Huye"),
    ("sorghum",      275, "Huye Market",      "Huye"),
]

db = SessionLocal()
try:
    if db.query(MarketPrice).count() == 0:
        for crop, price, market, district in PRICES:
            db.add(MarketPrice(crop_type=crop, price_rwf=price, market_name=market, district=district))
        db.commit()
        print(f"Seeded {len(PRICES)} market prices.")
    else:
        print("Already seeded — skipping.")
finally:
    db.close()
