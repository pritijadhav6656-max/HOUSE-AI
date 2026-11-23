# HOUSE AI — Python Machine Learning Microservice Documentation

This directory (`ml-model/`) contains the standalone Python 3.11 Machine Learning pipeline and Flask inference service for **HOUSE AI**.

---

## 1. Dataset Details & Provenance

- **Dataset Name:** HOUSE AI India Urban Residential Synthetic Benchmark Dataset
- **Dataset Type:** Synthetic Benchmark Dataset (`isSynthetic: true`)
- **File Locations:**
  - Location Master: `data/location_data/india_locations.json` (`28` States, `8` Union Territories, `125` Districts, `150` Cities, `820` Localities)
  - Raw Synthetic Dataset: `data/synthetic/india_housing_synthetic.csv` (`12,982` records)
  - Cleaned Processed Dataset: `data/processed/india_housing_cleaned.csv` (`12,606` records)
- **Provenance & Disclosure:** Generated deterministically (`seed=42`) from city base rates, locality micro-market multipliers, property type factors, structural BHK/bathroom synergies, and age depreciation curves. Separated from `data/raw/` so verified real-world property transaction datasets can be loaded without altering the pipeline structure.

---

## 2. Data Preprocessing Pipeline (`preprocessing.py`)

1. **Duplicate Detection:** Removes exact duplicate rows (`45` removed).
2. **Missing-Value Handling:** Drops records missing core target/location fields; imputes numeric features with median values and categorical features with mode values.
3. **Invalid Record Removal:** Filters out non-positive or extreme prices and invalid built-up areas outside `[200, 20000]` sq.ft. (`1` anomaly record removed).
4. **Outlier Filtering:** Removes city-level `price_per_sqft` outliers outside the `1st` to `99th` percentiles (`330` outliers removed).
5. **Scikit-learn `ColumnTransformer`:**
   - **Numerical Features (7):** `area`, `bhk`, `bathrooms`, `balconies`, `houseAge`, `floorNumber`, `totalFloors` → `SimpleImputer(strategy='median')` + `StandardScaler()`
   - **Categorical Features (6):** `state`, `city`, `locality`, `propertyType`, `furnishingStatus`, `parking` → `SimpleImputer(strategy='most_frequent')` + `OneHotEncoder(handle_unknown='ignore')`

---

## 3. Benchmarked Algorithms & Actual Evaluation Metrics

Trained on `10,084` training records (`80%`) and evaluated on `2,522` testing records (`20%`) with `random_state=42`:

| Algorithm | Train $R^2$ | Test $R^2$ | 3-Fold CV $R^2$ | Test MAE (INR) | Test RMSE (INR) | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Gradient Boosting Regressor** | `0.9760` | **`0.9712`** | **`0.9543`** | **`₹8,75,376`** | **`₹13,98,555`** | **Selected Active Model** |
| **Random Forest Regressor** | `0.9776` | `0.9310` | `0.9126` | `₹13,40,360` | `₹21,63,139` | Benchmarked |
| **Linear Regression** | `0.8808` | `0.8677` | `0.8579` | `₹15,99,225` | `₹29,95,706` | Benchmarked |

---

## 4. Serialized Model Artifacts (`models/`)

- `models/best_house_price_model.joblib`: Serialized Scikit-learn `Pipeline` containing the fitted `ColumnTransformer` and `GradientBoostingRegressor`.
- `models/model_info.json`: Complete metadata artifact containing model name (`HOUSE-AI-GradientBoostingRegressor-v1.0.0`), training date, metrics, algorithm comparison array, grouped feature importance percentages, 80 stratified Actual vs. Predicted test samples, and supported location coverage mappings.

---

## 5. Flask Microservice API (`http://127.0.0.1:8000`)

### `GET /`
Returns service health and whether the model artifacts are loaded.

### `GET /info`
Returns the full `model_info.json` payload for the Express backend and React Model Performance Dashboard.

### `POST /predict`
Validates incoming JSON against the 13 model features, checks whether the selected city is within the `77` ML-covered Indian cities, and returns either:
- A complete valuation (`predictedPrice`, `pricePerSqFt`, `predictionCoverage`, `modelName`, `modelVersion`, `disclaimer`) when `coverageSupported: true`, or
- An honest `unsupported_location` response (`coverageSupported: false`, `predictedPrice: null`) when the selected city has insufficient training data.
