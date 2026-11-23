"""
HOUSE AI - Data Preprocessing & Pipeline Module
Implements data cleaning, outlier removal, feature validation, and Scikit-learn ColumnTransformer.
"""
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CATEGORICAL_FEATURES = [
    "state",
    "city",
    "locality",
    "propertyType",
    "furnishingStatus",
    "parking",
]

NUMERICAL_FEATURES = [
    "area",
    "bhk",
    "bathrooms",
    "balconies",
    "houseAge",
    "floorNumber",
    "totalFloors",
]

ALL_REQUIRED_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET_COLUMN = "price"

VALID_PROPERTY_TYPES = [
    "Apartment / Flat",
    "Independent House",
    "Villa",
    "Residential Property",
]

VALID_FURNISHING_STATUS = [
    "Unfurnished",
    "Semi-Furnished",
    "Fully Furnished",
]

VALID_PARKING = ["Yes", "No"]


def clean_housing_dataframe(df: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    """
    Performs rigorous data cleaning:
    1. Duplicate detection and removal
    2. Missing-value handling
    3. Invalid price and area removal
    4. Outlier investigation and filtering on price-per-sqft
    """
    initial_count = len(df)
    cleaned = df.copy()

    # 1. Duplicate removal
    before_dedup = len(cleaned)
    cleaned = cleaned.drop_duplicates()
    duplicates_removed = before_dedup - len(cleaned)

    # 2. Drop rows missing essential target or location fields
    essential_cols = ["state", "city", "locality", "propertyType", "area", "bhk", "bathrooms", "price"]
    before_na = len(cleaned)
    cleaned = cleaned.dropna(subset=essential_cols)
    missing_dropped = before_na - len(cleaned)

    # Fill optional defaults if missing
    cleaned["balconies"] = cleaned["balconies"].fillna(1)
    cleaned["houseAge"] = cleaned["houseAge"].fillna(0)
    cleaned["furnishingStatus"] = cleaned["furnishingStatus"].fillna("Semi-Furnished")
    cleaned["parking"] = cleaned["parking"].fillna("Yes")
    cleaned["floorNumber"] = cleaned["floorNumber"].fillna(2)
    cleaned["totalFloors"] = cleaned["totalFloors"].fillna(5)

    # 3. Invalid price and area removal
    before_invalid = len(cleaned)
    cleaned = cleaned[
        (cleaned["price"] > 500000)
        & (cleaned["price"] < 500000000)
        & (cleaned["area"] >= 200)
        & (cleaned["area"] <= 20000)
        & (cleaned["bhk"] >= 1)
        & (cleaned["bhk"] <= 10)
        & (cleaned["bathrooms"] >= 1)
        & (cleaned["bathrooms"] <= 10)
        & (cleaned["houseAge"] >= 0)
        & (cleaned["houseAge"] <= 100)
    ]
    invalid_removed = before_invalid - len(cleaned)

    # 4. Outlier investigation per city using price_per_sqft quantiles
    cleaned["price_per_sqft"] = cleaned["price"] / cleaned["area"]
    before_outlier = len(cleaned)

    city_bounds = cleaned.groupby("city")["price_per_sqft"].transform(
        lambda s: (s >= s.quantile(0.01)) & (s <= s.quantile(0.99))
    )
    cleaned = cleaned[city_bounds.astype(bool)].drop(columns=["price_per_sqft"])
    outliers_removed = before_outlier - len(cleaned)

    report = {
        "initialRecords": int(initial_count),
        "duplicatesRemoved": int(duplicates_removed),
        "missingDropped": int(missing_dropped),
        "invalidRemoved": int(invalid_removed),
        "outliersRemoved": int(outliers_removed),
        "finalCleanedRecords": int(len(cleaned)),
    }
    return cleaned.reset_index(drop=True), report


def build_preprocessor() -> ColumnTransformer:
    """
    Builds a leak-free Scikit-learn ColumnTransformer for numerical and categorical features.
    """
    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, NUMERICAL_FEATURES),
            ("cat", categorical_transformer, CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    return preprocessor
