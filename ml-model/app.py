"""
HOUSE AI - Python Flask Machine Learning Microservice
Exposes GET /, GET /info, and POST /predict on http://127.0.0.1:8000
"""
from datetime import datetime, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS

from predict import execute_prediction, load_model_artifacts

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def health_check():
    pipeline, model_info = load_model_artifacts()
    model_ready = pipeline is not None and model_info is not None
    return (
        jsonify(
            {
                "success": True,
                "service": "HOUSE AI Python ML Microservice",
                "status": "operational" if model_ready else "model_unavailable",
                "modelLoaded": model_ready,
                "modelName": model_info["modelName"] if model_ready else None,
                "modelVersion": model_info["modelVersion"] if model_ready else None,
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            }
        ),
        200 if model_ready else 503,
    )


@app.route("/info", methods=["GET"])
def get_model_info():
    pipeline, model_info = load_model_artifacts()
    if pipeline is None or model_info is None:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "ModelUnavailable",
                    "message": "Trained ML model artifacts are not available. Please run train.py.",
                }
            ),
            503,
        )
    return jsonify({"success": True, "data": model_info}), 200


@app.route("/predict", methods=["POST"])
def predict_property_price():
    try:
        if not request.is_json:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "InvalidContentType",
                        "message": "Content-Type must be application/json.",
                    }
                ),
                400,
            )

        payload = request.get_json(silent=True)
        if payload is None:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "InvalidJSON",
                        "message": "Malformed or empty JSON payload.",
                    }
                ),
                400,
            )

        status_code, response_data = execute_prediction(payload)
        return jsonify(response_data), status_code

    except Exception:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "InternalPredictionError",
                    "message": "An unexpected error occurred while processing the prediction request.",
                }
            ),
            500,
        )


@app.errorhandler(404)
def not_found(_err):
    return jsonify({"success": False, "error": "NotFound", "message": "Endpoint not found on ML service."}), 404


@app.errorhandler(405)
def method_not_allowed(_err):
    return jsonify({"success": False, "error": "MethodNotAllowed", "message": "HTTP method not allowed."}), 405


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=False)
