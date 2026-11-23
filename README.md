# HOUSE AI — Complete India-Wide AI Real Estate Price Prediction Platform

**HOUSE AI** is a zero-to-one, full-stack **MERN (MongoDB, Express.js, React 18, Node.js)** and **Python Scikit-learn Machine Learning** platform built from scratch for residential property valuation, hierarchical India-wide location intelligence, portfolio analytics, and machine learning observability.

---

## 1. Project Introduction & Objectives

Residential property valuation across India requires both macro-regional context (State/UT, District, City) and micro-market structural context (Locality, Built-up Area, BHK, Bathrooms, Property Age, Floor Level, Furnishing, Parking).

**Core Objectives of HOUSE AI:**
1. **Complete India-Wide Administrative Location Database:** Support all **28 Indian States** and **8 Union Territories** (36 administrative units), covering **125 Districts**, **150 Cities/Towns**, and **820 Localities** through cascading, searchable dropdowns.
2. **Honest Location Coverage vs. ML Training Coverage:** Clearly separate cities present in the location database from cities with verified machine learning training representation (`77` urban centers covered by ML training; `73` additional cities selectable with explicit insufficient-coverage notices rather than fabricated estimates).
3. **Rigorous Scikit-learn Regression Pipeline:** Benchmark **Linear Regression**, **Random Forest Regressor**, and **Gradient Boosting Regressor** using a leak-free `ColumnTransformer` preprocessing pipeline, selecting the highest-performing model (`Gradient Boosting Regressor`, Test $R^2 = 0.9712$).
4. **Full-Stack Persistence & Governance:** Persist users, predictions, model evaluation artifacts, locations, and contact inquiries in MongoDB (`houseprice_ai`) with JWT authentication, bcrypt password hashing, and a dedicated Administrator Control Center.

---

## 2. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, JavaScript JSX, Tailwind CSS 3, React Router DOM v6, Axios, Recharts, Lucide React, React Context API |
| **Backend** | Node.js, Express.js, Mongoose (MongoDB), JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `express-validator`, `helmet`, `cors`, `express-rate-limit`, `dotenv`, Axios |
| **Machine Learning** | Python 3.11, Flask, Flask-CORS, Scikit-learn, Pandas, NumPy, Joblib, Matplotlib |
| **Database** | MongoDB (`houseprice_ai` database) |

---

## 3. System Architecture

```text
React 18 + Vite Frontend (http://localhost:5173)
       |
       |  Axios REST Calls (JWT Bearer Auth)
       v
Node.js + Express Backend (http://localhost:5000)
       |
       +-----> MongoDB Database (mongodb://127.0.0.1:27017/houseprice_ai)
       |       Collections: users, predictions, locations, modelresults, contacts
       |
       |  Axios Microservice Request
       v
Python Flask ML Service (http://127.0.0.1:8000)
       |
       v
Serialized Scikit-learn Pipeline (best_house_price_model.joblib + model_info.json)
```

---

## 4. Folder Structure

```text
HOUSE AI/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/       # Navbar, Sidebar, Footer, LocationSelector, SearchableSelect, StatCard, etc.
│   │   ├── constants/        # Property types, furnishing options, color tokens
│   │   ├── context/          # AuthContext.jsx, ToastContext.jsx
│   │   ├── hooks/            # useDebounce.js
│   │   ├── layouts/          # PublicLayout.jsx, DashboardLayout.jsx
│   │   ├── pages/            # All 16 public, authenticated, and admin pages
│   │   ├── services/         # Central Axios instance (api.js)
│   │   ├── utils/            # Currency/date formatters & HTML/PDF report generator
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── .env.example
│
├── backend/
│   ├── config/               # db.js & india_locations.json
│   ├── controllers/          # auth, user, location, prediction, dashboard, model, admin, contact
│   ├── middleware/           # authMiddleware.js, errorMiddleware.js
│   ├── models/               # User.js, Prediction.js, Location.js, ModelResult.js, Contact.js
│   ├── routes/               # Express modular routers
│   ├── services/             # mlService.js, locationService.js
│   ├── utils/                # tokenUtils.js
│   ├── validators/           # requestValidators.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── ml-model/
│   ├── data/
│   │   ├── raw/
│   │   ├── processed/        # india_housing_cleaned.csv (12,606 cleaned records)
│   │   ├── synthetic/        # india_housing_synthetic.csv (12,982 raw synthetic records)
│   │   └── location_data/    # india_locations.json (28 States, 8 UTs, 125 Districts, 150 Cities, 820 Localities)
│   ├── models/               # best_house_price_model.joblib & model_info.json
│   ├── notebooks/
│   ├── tests/                # test_ml_service.py
│   ├── app.py                # Flask microservice on http://127.0.0.1:8000
│   ├── evaluate.py           # R², MAE, RMSE, CV, feature importance & scatter sampling
│   ├── generate_location_master.py
│   ├── predict.py            # Validation, coverage check & inference engine
│   ├── preprocessing.py      # Data cleaning & Scikit-learn ColumnTransformer
│   ├── train.py              # Dataset generation, model benchmarking & serialization
│   ├── requirements.txt
│   └── README.md
│
├── scripts/
│   ├── create-admin.js       # Secure CLI utility to provision an administrator account
│   └── test-e2e.js           # Full-stack automated E2E verification suite
├── docs/
│   └── ARCHITECTURE_AND_API.md
├── PROJECT_SETUP.md
├── README.md
├── .gitignore
└── start-project.ps1
```

---

## 5. Quick Start & Running the Services

See [PROJECT_SETUP.md](file:///C:/Users/pankaj/OneDrive/Documents/Antigravity/HOUSE%20AI/PROJECT_SETUP.md) for detailed Windows PowerShell commands.

### Option A: One-Click Windows PowerShell Startup
```powershell
cd "C:\Users\pankaj\OneDrive\Documents\Antigravity\HOUSE AI"
.\start-project.ps1
```

### Option B: Manual Service Startup (3 PowerShell Terminals)

**Terminal 1 — Python Flask ML Service (`http://127.0.0.1:8000`):**
```powershell
cd "C:\Users\pankaj\OneDrive\Documents\Antigravity\HOUSE AI\ml-model"
.\venv\Scripts\Activate.ps1
python train.py
python app.py
```

**Terminal 2 — Node.js + Express Backend (`http://localhost:5000`):**
```powershell
cd "C:\Users\pankaj\OneDrive\Documents\Antigravity\HOUSE AI\backend"
npm run dev
```

**Terminal 3 — React + Vite Frontend (`http://localhost:5173`):**
```powershell
cd "C:\Users\pankaj\OneDrive\Documents\Antigravity\HOUSE AI\frontend"
npm run dev
```

---

## 6. REST API Overview

| Prefix | Endpoints | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET /api/health` | Reports Express, MongoDB (`houseprice_ai`), and Python ML service status |
| `/api/auth` | `POST /register`, `POST /login`, `POST /forgot-password`, `POST /reset-password`, `GET /me`, `POST /logout` | Complete JWT authentication & password reset workflow |
| `/api/users` | `GET /profile`, `PUT /profile`, `PUT /change-password` | User profile & password management |
| `/api/locations` | `GET /countries`, `GET /states`, `GET /states/:stateId/districts`, `GET /states/:stateId/cities`, `GET /cities/:cityId/localities`, `GET /search?q=` | India-wide cascading location endpoints (28 States + 8 UTs) |
| `/api/predictions` | `POST /`, `GET /`, `GET /:id`, `DELETE /:id` | ML price estimation, MongoDB persistence, filtering, sorting & deletion |
| `/api/dashboard` | `GET /` | User analytics aggregations, monthly activity, city/BHK distributions |
| `/api/model` | `GET /info` | Live ML model metrics, algorithm comparison, feature importance, scatter data |
| `/api/contact` | `POST /` | Public contact inquiry submission |
| `/api/admin` | `GET /overview`, `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`, `GET /predictions`, `GET /contacts`, `PATCH /contacts/:id`, `DELETE /contacts/:id` | Protected role-based administrator control center |

---

## 7. Dataset Provenance & ML Limitations

- **Dataset Provenance:** The active model is trained on the **HOUSE AI India Urban Residential Synthetic Benchmark Dataset** (`12,982` raw records, `12,606` cleaned records after duplicate and outlier removal; `10,084` training records and `2,522` testing records).
- **Synthetic Disclosure:** Synthetic benchmark prices are calibrated for realistic analytical and educational demonstration and do **not** represent real-world government property transaction deeds or official certified legal valuations.
- **Geographic ML Coverage:** All `28` States, `8` Union Territories, `125` Districts, `150` Cities, and `820` Localities are selectable in the UI. Of those `150` cities, `77` major urban centers have verified ML training coverage. When a user selects one of the remaining `73` cities, the Python service returns a clear `unsupported_location` coverage status instead of inventing a price.

---

## 8. Future Scope

1. Import verified RERA and state stamp-duty transaction datasets into `ml-model/data/raw/`.
2. Expand ML training coverage from `77` cities to all tier-3 municipal towns across India.
3. Integrate spatial coordinates (distance to metro transit, IT corridors, schools, and hospitals) and quantile prediction intervals.
