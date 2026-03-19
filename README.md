# AgriBridge — Farmer Interface

Minimal digital agriculture platform for smallholder farmers in Rwanda.
One week build · FastAPI backend · React Native mobile app.

---

## Project structure

```
agribridge/
├── docker-compose.yml       ← starts backend + database
├── .gitignore
├── backend/                 ← FastAPI + PostgreSQL (the API)
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/env.py
│   ├── scripts/seed.py      ← seeds Rwanda market prices
│   └── app/
│       ├── main.py
│       ├── models.py
│       ├── core/config.py
│       ├── core/security.py
│       ├── db/session.py
│       └── api/
│           ├── auth.py      ← OTP login
│           ├── farms.py
│           ├── crops.py
│           ├── activities.py
│           └── market.py
└── mobile/                  ← Expo React Native (the farmer UI)
    ├── App.js
    ├── package.json
    └── app/
        ├── navigation/      ← screen routing
        ├── store/           ← Zustand global state
        ├── utils/           ← Axios client + theme
        ├── components/      ← reusable UI pieces
        └── screens/
            ├── auth/        ← Login, OTP, Register
            ├── home/        ← Dashboard
            ├── crops/       ← Crop list + add form
            ├── market/      ← Market prices
            └── record/      ← Log farm activity
```

---

## Day 1 — start the backend

```bash
# 1. Start PostgreSQL + FastAPI
docker compose up --build

# 2. Create database tables (new terminal)
docker compose exec api alembic revision --autogenerate -m "init"
docker compose exec api alembic upgrade head

# 3. Seed Rwanda market prices
docker compose exec api python scripts/seed.py

# 4. Verify
curl http://localhost:8000/health
# → {"status":"ok","service":"AgriBridge API"}
```

Open Swagger at **http://localhost:8000/docs** to test all endpoints.

---

## Day 3 — start the mobile app

**Step 1 — find your machine's local IP**
```bash
# Mac / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

**Step 2 — update the API base URL**
Open `mobile/app/utils/apiClient.js` and replace `192.168.x.x` with your IP:
```js
'http://192.168.1.42:8000/api/v1'  // example
```

**Step 3 — install and run**
```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your Android phone.

---

## OTP for demo

The OTP is hardcoded as **`123456`** for development.
Do NOT use in production — wire Africa's Talking after submission.

---

## Farmer screens

| Screen        | What the farmer does                   |
|---------------|----------------------------------------|
| LoginScreen   | Enter phone number                     |
| OTPScreen     | Enter 123456                           |
| RegisterScreen| Enter name + district (first time only)|
| HomeScreen    | See farm stats + advisory alerts       |
| CropsScreen   | View registered crops                  |
| AddCropScreen | Register a new crop                    |
| MarketScreen  | Check Rwanda crop prices by district   |
| RecordScreen  | Log fertiliser, harvest, etc.          |

---

## Deploy (Day 6)

**Backend → Render.com**
1. Push to GitHub
2. New Web Service → connect repo → set root to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add env vars: `DATABASE_URL`, `JWT_SECRET`, `APP_ENV=production`
6. Add a Render PostgreSQL database → copy the connection string

**Mobile → APK**
```bash
cd mobile
npx eas build --platform android --profile preview
```
Download the `.apk` → share via WhatsApp → install on test phone → record screen.
