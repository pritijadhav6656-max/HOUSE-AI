"""
HOUSE AI - Model Evaluation & Feature Importance Module
Computes R2 Score, MAE, RMSE, Cross-Validation scores, and aggregated feature importances.
"""
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import cross_val_score

from preprocessing import CATEGORICAL_FEATURES, NUMERICAL_FEATURES


def evaluate_model_pipeline(pipeline, X_train, y_train, X_test, y_test, cv_folds: int = 3) -> dict:
    """
    Evaluates a trained Scikit-learn Pipeline on train and test sets plus cross-validation.
    """
    y_train_pred = pipeline.predict(X_train)
    y_test_pred = pipeline.predict(X_test)

    train_r2 = float(r2_score(y_train, y_train_pred))
    test_r2 = float(r2_score(y_test, y_test_pred))
    test_mae = float(mean_absolute_error(y_test, y_test_pred))
    test_rmse = float(np.sqrt(mean_squared_error(y_test, y_test_pred)))

    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=cv_folds, scoring="r2", n_jobs=-1)
    cv_r2_mean = float(np.mean(cv_scores))
    cv_r2_std = float(np.std(cv_scores))

    return {
        "trainR2Score": round(train_r2, 4),
        "r2Score": round(test_r2, 4),
        "mae": round(test_mae, 2),
        "rmse": round(test_rmse, 2),
        "cvR2Mean": round(cv_r2_mean, 4),
        "cvR2Std": round(cv_r2_std, 4),
        "yTestPred": y_test_pred,
    }


def extract_grouped_feature_importance(pipeline) -> list[dict]:
    """
    Extracts and aggregates feature importances from tree-based or linear models
    back into the original human-readable feature groups.
    """
    preprocessor = pipeline.named_steps["preprocessor"]
    regressor = pipeline.named_steps["regressor"]

    if hasattr(regressor, "feature_importances_"):
        raw_importances = np.abs(regressor.feature_importances_)
    elif hasattr(regressor, "coef_"):
        raw_importances = np.abs(np.ravel(regressor.coef_))
    else:
        return []

    num_count = len(NUMERICAL_FEATURES)
    grouped = {}

    label_map = {
        "area": "Built-up Area (sq.ft.)",
        "bhk": "BHK Configuration",
        "bathrooms": "Bathrooms Count",
        "balconies": "Balconies Count",
        "houseAge": "Property Age (Years)",
        "floorNumber": "Floor Level",
        "totalFloors": "Total Building Floors",
        "state": "State / UT Macro Factor",
        "city": "City Valuation Index",
        "locality": "Locality Micro-Market",
        "propertyType": "Property Type",
        "furnishingStatus": "Furnishing Status",
        "parking": "Parking Availability",
    }

    for idx, feat in enumerate(NUMERICAL_FEATURES):
        grouped[feat] = float(raw_importances[idx])

    cat_encoder = preprocessor.named_transformers_["cat"].named_steps["onehot"]
    cursor = num_count
    for feat, categories in zip(CATEGORICAL_FEATURES, cat_encoder.categories_):
        cat_len = len(categories)
        grouped[feat] = float(np.sum(raw_importances[cursor : cursor + cat_len]))
        cursor += cat_len

    total = sum(grouped.values()) or 1.0
    result = []
    for key, val in grouped.items():
        pct = round((val / total) * 100.0, 2)
        result.append(
            {
                "feature": key,
                "label": label_map.get(key, key),
                "importance": round(val / total, 4),
                "percentage": pct,
            }
        )

    result.sort(key=lambda x: x["importance"], reverse=True)
    return result


def build_actual_vs_predicted_samples(
    X_test: pd.DataFrame, y_test: pd.Series, y_pred: np.ndarray, sample_size: int = 80
) -> list[dict]:
    """
    Selects a deterministic stratified sample of test predictions for the Actual vs Predicted chart.
    """
    rng = np.random.default_rng(42)
    n = min(sample_size, len(y_test))
    indices = rng.choice(len(y_test), size=n, replace=False)

    samples = []
    X_reset = X_test.reset_index(drop=True)
    y_reset = y_test.reset_index(drop=True)

    for idx in sorted(indices):
        actual_val = float(y_reset.iloc[idx])
        pred_val = float(max(500000.0, y_pred[idx]))
        row = X_reset.iloc[idx]
        samples.append(
            {
                "id": int(idx),
                "city": str(row["city"]),
                "state": str(row["state"]),
                "locality": str(row["locality"]),
                "area": int(row["area"]),
                "bhk": int(row["bhk"]),
                "actualPrice": round(actual_val, 0),
                "predictedPrice": round(pred_val, 0),
                "actualLakhs": round(actual_val / 100000.0, 2),
                "predictedLakhs": round(pred_val / 100000.0, 2),
            }
        )
    return samples
