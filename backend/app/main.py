from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, farms, crops, activities, market

app = FastAPI(title="AgriBridge API", version="1.0.0", docs_url="/docs")

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,       prefix="/api/v1/auth",       tags=["auth"])
app.include_router(farms.router,      prefix="/api/v1/farms",      tags=["farms"])
app.include_router(crops.router,      prefix="/api/v1/crops",      tags=["crops"])
app.include_router(activities.router, prefix="/api/v1/activities", tags=["activities"])
app.include_router(market.router,     prefix="/api/v1/market",     tags=["market"])

@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "service": "AgriBridge API"}
