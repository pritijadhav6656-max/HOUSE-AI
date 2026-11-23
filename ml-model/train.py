"""
HOUSE AI - Machine Learning Training & Benchmarking Pipeline
Generates the synthetic India-wide housing benchmark dataset, cleans & preprocesses features,
trains Linear Regression, Random Forest, and Gradient Boosting models, evaluates metrics,
and serializes the best model and metadata artifacts.
"""
import hashlib
import json
import os
from datetime import datetime, timezone

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from evaluate import (
    build_actual_vs_predicted_samples,
    evaluate_model_pipeline,
    extract_grouped_feature_importance,
)
from generate_location_master import generate_master_dataset
from preprocessing import (
    ALL_REQUIRED_FEATURES,
    CATEGORICAL_FEATURES,
    NUMERICAL_FEATURES,
    TARGET_COLUMN,
    VALID_FURNISHING_STATUS,
    VALID_PARKING,
    VALID_PROPERTY_TYPES,
    build_preprocessor,
    clean_housing_dataframe,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
LOCATION_JSON_PATH = os.path.join(BASE_DIR, "data", "location_data", "india_locations.json")
SYNTHETIC_CSV_PATH = os.path.join(BASE_DIR, "data", "synthetic", "india_housing_synthetic.csv")
PROCESSED_CSV_PATH = os.path.join(BASE_DIR, "data", "processed", "india_housing_cleaned.csv")
MODEL_ARTIFACT_PATH = os.path.join(BASE_DIR, "models", "best_house_price_model.joblib")
MODEL_INFO_PATH = os.path.join(BASE_DIR, "models", "model_info.json")


def _locality_factor(city: str, locality: str) -> float:
    """
    Deterministic micro-market factor (0.86 to 1.24) based on city+locality hash
    with explicit calibration for benchmark localities.
    """
    explicit_factors = {
        ("Navi Mumbai", "Vashi"): 1.08,
        ("Navi Mumbai", "Kharghar"): 0.94,
        ("Navi Mumbai", "Nerul"): 1.05,
        ("Navi Mumbai", "Seawoods"): 1.12,
        ("Navi Mumbai", "Panvel"): 0.78,
        ("Navi Mumbai", "Ulwe"): 0.82,
        ("Mumbai", "Worli"): 1.32,
        ("Mumbai", "Lower Parel"): 1.24,
        ("Bengaluru", "Koramangala"): 1.22,
        ("Bengaluru", "Indiranagar"): 1.25,
        ("Bengaluru", "Whitefield"): 1.02,
        ("Bengaluru", "Electronic City"): 0.78,
        ("Gurugram", "Golf Course Road"): 1.35,
        ("Gurugram", "Sohna Road"): 0.88,
        ("Hyderabad", "Jubilee Hills"): 1.30,
        ("Hyderabad", "Gachibowli"): 1.08,
        ("Pune", "Koregaon Park"): 1.28,
        ("Pune", "Hinjewadi"): 0.89,
    }
    if (city, locality) in explicit_factors:
        return explicit_factors[(city, locality)]

    digest = hashlib.md5(f"{city}::{locality}".encode("utf-8")).hexdigest()
    norm = (int(digest[:6], 16) % 380) / 1000.0  # 0.000 to 0.379
    return round(0.86 + norm, 3)


def generate_synthetic_dataset(location_master: dict, seed: int = 42) -> pd.DataFrame:
    """
    Generates a synthetic residential housing dataset across all ML-covered Indian cities.
    Clearly separated into data/synthetic/ and labeled as synthetic benchmark data.
    """
    rng = np.random.default_rng(seed)
    ml_cities = location_master["mlCoveredCities"]

    records = []
    property_type_weights = [0.62, 0.16, 0.10, 0.12]
    property_type_multipliers = {
        "Apartment / Flat": 1.00,
        "Independent House": 1.14,
        "Villa": 1.35,
        "Residential Property": 0.96,
    }
    furnishing_multipliers = {
        "Unfurnished": 0.94,
        "Semi-Furnished": 1.00,
        "Fully Furnished": 1.08,
    }

    for city_entry in ml_cities:
        state = city_entry["state"]
        district = city_entry["district"]
        city = city_entry["city"]
        base_rate = float(city_entry["baseRateSqFt"])
        localities = city_entry["localities"]

        for locality in localities:
            loc_mult = _locality_factor(city, locality)
            # Generate 24 properties per covered locality (~12,500+ total records)
            n_samples = 24
            for _ in range(n_samples):
                prop_type = rng.choice(VALID_PROPERTY_TYPES, p=property_type_weights)
                bhk = int(rng.choice([1, 2, 3, 4, 5], p=[0.16, 0.42, 0.28, 0.10, 0.04]))

                # Realistic area distribution by BHK and property type
                base_area_by_bhk = {1: 560, 2: 980, 3: 1450, 4: 2150, 5: 3100}[bhk]
                if prop_type == "Villa":
                    base_area_by_bhk = int(base_area_by_bhk * 1.35)
                elif prop_type == "Independent House":
                    base_area_by_bhk = int(base_area_by_bhk * 1.18)

                area = int(max(300, rng.normal(base_area_by_bhk, base_area_by_bhk * 0.15)))
                bathrooms = int(max(1, min(bhk + int(rng.choice([0, 0, 1])), 7)))
                balconies = int(max(0, min(bhk, int(rng.choice([0, 1, 2, 3], p=[0.1, 0.45, 0.35, 0.1])))))
                house_age = int(rng.integers(0, 26))
                furnishing = str(rng.choice(VALID_FURNISHING_STATUS, p=[0.28, 0.50, 0.22]))
                parking = str(rng.choice(VALID_PARKING, p=[0.82, 0.18]))

                if prop_type in ("Villa", "Independent House"):
                    total_floors = int(rng.integers(1, 4))
                    floor_number = int(rng.integers(0, total_floors + 1))
                else:
                    total_floors = int(rng.integers(4, 28))
                    floor_number = int(rng.integers(1, total_floors + 1))

                # Pricing formula with domain realism
                effective_rate = (
                    base_rate
                    * loc_mult
                    * property_type_multipliers[prop_type]
                    * furnishing_multipliers[furnishing]
                )

                # Age depreciation (-0.8% per year, capped at -24%)
                age_factor = max(0.76, 1.0 - (house_age * 0.008))
                # High-floor rise premium & parking bonus
                floor_factor = 1.0 + min(0.06, floor_number * 0.0025)
                parking_factor = 1.03 if parking == "Yes" else 0.98
                # Bathroom & BHK configuration synergy
                config_bonus = (bhk * 85000.0) + (bathrooms * 45000.0) + (balconies * 20000.0)

                noise = rng.normal(1.0, 0.032)
                raw_price = ((area * effective_rate * age_factor * floor_factor * parking_factor) + config_bonus) * noise
                price = round(max(650000.0, raw_price), -3)

                records.append(
                    {
                        "state": state,
                        "district": district,
                        "city": city,
                        "locality": locality,
                        "propertyType": prop_type,
                        "area": area,
                        "bhk": bhk,
                        "bathrooms": bathrooms,
                        "balconies": balconies,
                        "houseAge": house_age,
                        "furnishingStatus": furnishing,
                        "parking": parking,
                        "floorNumber": floor_number,
                        "totalFloors": total_floors,
                        "price": price,
                    }
                )

    df = pd.DataFrame(records)

    # Inject a small number of duplicates and anomalies so preprocessing pipeline demonstrates real cleaning
    dup_sample = df.sample(n=45, random_state=seed)
    anomaly_rows = pd.DataFrame(
        [
            {
                "state": "Maharashtra",
                "district": "Thane",
                "city": "Navi Mumbai",
                "locality": "Vashi",
                "propertyType": "Apartment / Flat",
                "area": -100,
                "bhk": 2,
                "bathrooms": 2,
                "balconies": 1,
                "houseAge": 5,
                "furnishingStatus": "Semi-Furnished",
                "parking": "Yes",
                "floorNumber": 3,
                "totalFloors": 10,
                "price": -5000,
            }
        ]
    )
    df_with_raw_noise = pd.concat([df, dup_sample, anomaly_rows], ignore_index=True)

    os.makedirs(os.path.dirname(SYNTHETIC_CSV_PATH), exist_ok=True)
    df_with_raw_noise.to_csv(SYNTHETIC_CSV_PATH, index=False)
    return df_with_raw_noise


def run_training_pipeline():
    print("=" * 72)
    print("HOUSE AI - PYTHON MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 72)

    if not os.path.exists(LOCATION_JSON_PATH):
        generate_master_dataset()

    with open(LOCATION_JSON_PATH, "r", encoding="utf-8") as f:
        location_master = json.load(f)

    print("[1/6] Generating synthetic India-wide residential benchmark dataset...")
    raw_df = generate_synthetic_dataset(location_master, seed=42)
    print(f"      Raw synthetic dataset generated: {len(raw_df)} records.")

    print("[2/6] Running data cleaning, outlier removal, and validation...")
    cleaned_df, cleaning_report = clean_housing_dataframe(raw_df)
    os.makedirs(os.path.dirname(PROCESSED_CSV_PATH), exist_ok=True)
    cleaned_df.to_csv(PROCESSED_CSV_PATH, index=False)
    print(f"      Cleaned dataset saved: {len(cleaned_df)} records. Cleaning report: {cleaning_report}")

    X = cleaned_df[ALL_REQUIRED_FEATURES]
    y = cleaned_df[TARGET_COLUMN]

    print("[3/6] Performing 80/20 train/test split (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )
    print(f"      Training records: {len(X_train)} | Testing records: {len(X_test)}")

    candidate_models = {
        "Linear Regression": LinearRegression(),
        "Random Forest Regressor": RandomForestRegressor(
            n_estimators=90,
            max_depth=22,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1,
        ),
        "Gradient Boosting Regressor": GradientBoostingRegressor(
            n_estimators=220,
            learning_rate=0.09,
            max_depth=6,
            subsample=0.85,
            random_state=42,
        ),
    }

    print("[4/6] Training and benchmarking regression algorithms...")
    comparison_results = []
    trained_pipelines = {}
    test_predictions_map = {}

    for algo_name, estimator in candidate_models.items():
        print(f"      -> Training {algo_name}...")
        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor()),
                ("regressor", estimator),
            ]
        )
        pipeline.fit(X_train, y_train)
        eval_metrics = evaluate_model_pipeline(pipeline, X_train, y_train, X_test, y_test, cv_folds=3)

        trained_pipelines[algo_name] = pipeline
        test_predictions_map[algo_name] = eval_metrics["yTestPred"]

        comparison_results.append(
            {
                "algorithm": algo_name,
                "trainR2Score": eval_metrics["trainR2Score"],
                "r2Score": eval_metrics["r2Score"],
                "mae": eval_metrics["mae"],
                "rmse": eval_metrics["rmse"],
                "cvR2Mean": eval_metrics["cvR2Mean"],
                "cvR2Std": eval_metrics["cvR2Std"],
            }
        )
        print(
            f"         Test R2: {eval_metrics['r2Score']:.4f} | "
            f"MAE: ₹{eval_metrics['mae']:,.0f} | "
            f"RMSE: ₹{eval_metrics['rmse']:,.0f} | "
            f"CV R2: {eval_metrics['cvR2Mean']:.4f}"
        )

    # Select best model by Test R2 Score (tie-break by lowest RMSE)
    comparison_results.sort(key=lambda x: (x["r2Score"], -x["rmse"]), reverse=True)
    best_summary = comparison_results[0]
    best_algo_name = best_summary["algorithm"]
    best_pipeline = trained_pipelines[best_algo_name]
    best_y_pred = test_predictions_map[best_algo_name]

    print(f"[5/6] Selected Best Algorithm: {best_algo_name} (Test R2 = {best_summary['r2Score']})")

    feature_importance = extract_grouped_feature_importance(best_pipeline)
    actual_vs_predicted = build_actual_vs_predicted_samples(X_test, y_test, best_y_pred, sample_size=80)

    # Build supported location coverage lookup
    supported_states = sorted(cleaned_df["state"].unique().tolist())
    supported_cities = sorted(cleaned_df["city"].unique().tolist())
    city_to_localities = (
        cleaned_df.groupby("city")["locality"]
        .apply(lambda s: sorted(s.unique().tolist()))
        .to_dict()
    )
    state_to_cities = (
        cleaned_df.groupby("state")["city"]
        .apply(lambda s: sorted(s.unique().tolist()))
        .to_dict()
    )

    training_timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    model_version = "1.0.0"
    model_name = f"HOUSE-AI-{best_algo_name.replace(' ', '')}-v{model_version}"

    os.makedirs(os.path.dirname(MODEL_ARTIFACT_PATH), exist_ok=True)
    joblib.dump(best_pipeline, MODEL_ARTIFACT_PATH)

    model_info = {
        "modelName": model_name,
        "algorithm": best_algo_name,
        "modelVersion": model_version,
        "trainingDate": training_timestamp,
        "status": "ready",
        "metrics": {
            "r2Score": best_summary["r2Score"],
            "trainR2Score": best_summary["trainR2Score"],
            "mae": best_summary["mae"],
            "rmse": best_summary["rmse"],
            "cvR2Mean": best_summary["cvR2Mean"],
            "cvR2Std": best_summary["cvR2Std"],
        },
        "datasetInfo": {
            "datasetName": "HOUSE AI India Urban Residential Synthetic Benchmark Dataset",
            "isSynthetic": True,
            "datasetType": "Synthetic Benchmark Dataset",
            "provenance": "Programmatically generated from HOUSE AI India Location Master base rates, micro-market locality multipliers, and structural property depreciation models.",
            "disclaimer": "Predictions are generated by a machine learning model trained on a structured synthetic benchmark dataset for educational and analytical decision-support purposes. Estimates do not constitute an official certified property valuation or real-world transaction guarantee.",
            "rawRecords": cleaning_report["initialRecords"],
            "datasetRecords": cleaning_report["finalCleanedRecords"],
            "trainingRecords": int(len(X_train)),
            "testingRecords": int(len(X_test)),
            "cleaningReport": cleaning_report,
        },
        "algorithmComparison": comparison_results,
        "featureImportance": feature_importance,
        "actualVsPredicted": actual_vs_predicted,
        "supportedFeatures": {
            "categorical": CATEGORICAL_FEATURES,
            "numerical": NUMERICAL_FEATURES,
            "propertyTypes": VALID_PROPERTY_TYPES,
            "furnishingStatuses": VALID_FURNISHING_STATUS,
            "parkingOptions": VALID_PARKING,
        },
        "supportedLocations": {
            "totalStatesInDatabase": location_master["metadata"]["totalStates"],
            "totalUTsInDatabase": location_master["metadata"]["totalUnionTerritories"],
            "totalDistrictsInDatabase": location_master["metadata"]["totalDistricts"],
            "totalCitiesInDatabase": location_master["metadata"]["totalCities"],
            "totalLocalitiesInDatabase": location_master["metadata"]["totalLocalities"],
            "coveredStatesCount": len(supported_states),
            "coveredCitiesCount": len(supported_cities),
            "coveredLocalitiesCount": sum(len(v) for v in city_to_localities.values()),
            "states": supported_states,
            "cities": supported_cities,
            "stateToCities": state_to_cities,
            "cityToLocalities": city_to_localities,
        },
    }

    with open(MODEL_INFO_PATH, "w", encoding="utf-8") as f:
        json.dump(model_info, f, indent=2, ensure_ascii=False)

    print("[6/6] Saved trained model and model_info.json successfully.")
    print(f"      Model Artifact : {MODEL_ARTIFACT_PATH}")
    print(f"      Metadata File  : {MODEL_INFO_PATH}")
    print("=" * 72)
    return model_info


if __name__ == "__main__":
    run_training_pipeline()
