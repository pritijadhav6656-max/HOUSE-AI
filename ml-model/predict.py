"""
HOUSE AI - Prediction & Coverage Validation Engine
Loads the serialized Scikit-learn Pipeline and model_info.json, validates input features,
verifies location coverage, and executes inference.
"""
import json
import os
from datetime import datetime, timezone

import joblib
import pandas as pd

from preprocessing import (
    ALL_REQUIRED_FEATURES,
    VALID_FURNISHING_STATUS,
    VALID_PARKING,
    VALID_PROPERTY_TYPES,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_ARTIFACT_PATH = os.path.join(BASE_DIR, "models", "best_house_price_model.joblib")
MODEL_INFO_PATH = os.path.join(BASE_DIR, "models", "model_info.json")

_CACHED_MODEL = None
_CACHED_INFO = None


def load_model_artifacts(force_reload: bool = False):
    """
    Loads the trained model pipeline and model_info.json from disk.
    """
    global _CACHED_MODEL, _CACHED_INFO
    if not force_reload and _CACHED_MODEL is not None and _CACHED_INFO is not None:
        return _CACHED_MODEL, _CACHED_INFO

    if not os.path.exists(MODEL_ARTIFACT_PATH) or not os.path.exists(MODEL_INFO_PATH):
        return None, None

    _CACHED_MODEL = joblib.load(MODEL_ARTIFACT_PATH)
    with open(MODEL_INFO_PATH, "r", encoding="utf-8") as f:
        _CACHED_INFO = json.load(f)

    return _CACHED_MODEL, _CACHED_INFO


def validate_prediction_payload(payload: dict) -> tuple[bool, list[str], dict]:
    """
    Validates incoming property prediction request payload and normalizes types.
    """
    errors = []
    if not isinstance(payload, dict):
        return False, ["Request payload must be a valid JSON object."], {}

    required_fields = ["state", "city", "locality", "propertyType", "area", "bhk", "bathrooms", "houseAge"]
    for field in required_fields:
        val = payload.get(field)
        if val is None or (isinstance(val, str) and not val.strip()):
            errors.append(f"Field '{field}' is required.")

    if errors:
        return False, errors, {}

    state = str(payload.get("state", "")).strip()
    district = str(payload.get("district", "")).strip()
    city = str(payload.get("city", "")).strip()
    locality = str(payload.get("locality", "")).strip()
    property_type = str(payload.get("propertyType", "Apartment / Flat")).strip()
    furnishing_status = str(payload.get("furnishingStatus", "Semi-Furnished")).strip()
    parking = str(payload.get("parking", "Yes")).strip()

    if property_type not in VALID_PROPERTY_TYPES:
        errors.append(f"Unsupported propertyType '{property_type}'. Allowed: {VALID_PROPERTY_TYPES}")

    if furnishing_status not in VALID_FURNISHING_STATUS:
        errors.append(f"Unsupported furnishingStatus '{furnishing_status}'. Allowed: {VALID_FURNISHING_STATUS}")

    if parking not in VALID_PARKING:
        errors.append(f"Unsupported parking value '{parking}'. Allowed: {VALID_PARKING}")

    try:
        area = float(payload.get("area"))
        if area <= 0 or area > 50000:
            errors.append("Area must be greater than 0 and up to 50,000 sq.ft.")
    except (TypeError, ValueError):
        errors.append("Area must be a valid positive number.")
        area = 0.0

    try:
        bhk = int(payload.get("bhk"))
        if bhk < 1 or bhk > 15:
            errors.append("BHK must be an integer between 1 and 15.")
    except (TypeError, ValueError):
        errors.append("BHK must be a valid positive integer.")
        bhk = 0

    try:
        bathrooms = int(payload.get("bathrooms"))
        if bathrooms < 1 or bathrooms > 15:
            errors.append("Bathrooms must be an integer between 1 and 15.")
    except (TypeError, ValueError):
        errors.append("Bathrooms must be a valid positive integer.")
        bathrooms = 0

    try:
        house_age = float(payload.get("houseAge"))
        if house_age < 0 or house_age > 100:
            errors.append("House age cannot be negative (must be between 0 and 100 years).")
    except (TypeError, ValueError):
        errors.append("House age must be a valid non-negative number.")
        house_age = 0.0

    try:
        balconies = int(payload.get("balconies", 1))
        if balconies < 0 or balconies > 10:
            errors.append("Balconies must be between 0 and 10.")
    except (TypeError, ValueError):
        errors.append("Balconies must be a valid integer.")
        balconies = 1

    try:
        floor_number = int(payload.get("floorNumber", 2))
        total_floors = int(payload.get("totalFloors", max(5, floor_number)))
        if floor_number < 0 or total_floors < 1 or floor_number > total_floors:
            errors.append("Floor number must be non-negative and cannot exceed total building floors.")
    except (TypeError, ValueError):
        errors.append("Floor number and total floors must be valid integers.")
        floor_number, total_floors = 2, 5

    if errors:
        return False, errors, {}

    normalized = {
        "state": state,
        "district": district,
        "city": city,
        "locality": locality,
        "propertyType": property_type,
        "area": area,
        "bhk": bhk,
        "bathrooms": bathrooms,
        "balconies": balconies,
        "houseAge": house_age,
        "furnishingStatus": furnishing_status,
        "parking": parking,
        "floorNumber": floor_number,
        "totalFloors": total_floors,
    }
    return True, [], normalized


def execute_prediction(payload: dict) -> tuple[int, dict]:
    """
    Runs model availability check, input validation, location coverage check, and prediction.
    Returns (http_status_code, response_dict).
    """
    pipeline, model_info = load_model_artifacts()
    if pipeline is None or model_info is None:
        return 503, {
            "success": False,
            "error": "ModelUnavailable",
            "message": "Trained ML model artifacts are not available. Please run train.py first.",
        }

    is_valid, errors, cleaned_input = validate_prediction_payload(payload)
    if not is_valid:
        return 400, {
            "success": False,
            "error": "ValidationError",
            "message": errors[0],
            "errors": errors,
        }

    supported_locs = model_info.get("supportedLocations", {})
    city_to_localities = supported_locs.get("cityToLocalities", {})
    state_to_cities = supported_locs.get("stateToCities", {})

    state = cleaned_input["state"]
    city = cleaned_input["city"]
    locality = cleaned_input["locality"]
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # Check state-city and ML coverage
    city_covered = city in city_to_localities
    if not city_covered:
        return 200, {
            "success": True,
            "coverageSupported": False,
            "predictionStatus": "unsupported_location",
            "predictedPrice": None,
            "pricePerSqFt": None,
            "state": state,
            "district": cleaned_input["district"],
            "city": city,
            "locality": locality,
            "modelName": model_info["modelName"],
            "algorithm": model_info["algorithm"],
            "modelVersion": model_info["modelVersion"],
            "predictionCoverage": f"Unsupported ML Coverage — Insufficient training data for {city}, {state}",
            "coverageMessage": (
                f"While {city} ({state}) is available in the HOUSE AI India-Wide Location Database, "
                f"the active machine learning model ({model_info['modelName']}) does not yet have verified "
                f"training coverage for {city}. To prevent misleading estimates, no synthetic price was generated."
            ),
            "predictionTimestamp": timestamp,
            "disclaimer": model_info["datasetInfo"]["disclaimer"],
        }

    # Check if state matches the city's state in training coverage
    valid_cities_for_state = state_to_cities.get(state, [])
    if city not in valid_cities_for_state:
        return 400, {
            "success": False,
            "error": "LocationMismatch",
            "message": f"City '{city}' does not belong to state '{state}' in the administrative hierarchy.",
        }

    covered_localities = city_to_localities.get(city, [])
    if locality in covered_localities:
        coverage_label = "Full Micro-Market Coverage (State, City & Locality Verified)"
    else:
        coverage_label = f"City-Level ML Coverage ({city} Verified; Locality Generalized)"

    feature_row = pd.DataFrame([{k: cleaned_input[k] for k in ALL_REQUIRED_FEATURES}])
    raw_pred = float(pipeline.predict(feature_row)[0])
    predicted_price = round(max(500000.0, raw_pred), 0)
    price_per_sqft = round(predicted_price / cleaned_input["area"], 2)

    return 200, {
        "success": True,
        "coverageSupported": True,
        "predictionStatus": "completed",
        "predictedPrice": predicted_price,
        "pricePerSqFt": price_per_sqft,
        "state": state,
        "district": cleaned_input["district"],
        "city": city,
        "locality": locality,
        "propertyDetails": {
            "propertyType": cleaned_input["propertyType"],
            "area": cleaned_input["area"],
            "bhk": cleaned_input["bhk"],
            "bathrooms": cleaned_input["bathrooms"],
            "balconies": cleaned_input["balconies"],
            "houseAge": cleaned_input["houseAge"],
            "furnishingStatus": cleaned_input["furnishingStatus"],
            "parking": cleaned_input["parking"],
            "floorNumber": cleaned_input["floorNumber"],
            "totalFloors": cleaned_input["totalFloors"],
        },
        "modelName": model_info["modelName"],
        "algorithm": model_info["algorithm"],
        "modelVersion": model_info["modelVersion"],
        "modelMetrics": model_info["metrics"],
        "predictionCoverage": coverage_label,
        "predictionTimestamp": timestamp,
        "isSyntheticDataset": model_info["datasetInfo"]["isSynthetic"],
        "disclaimer": model_info["datasetInfo"]["disclaimer"],
    }
