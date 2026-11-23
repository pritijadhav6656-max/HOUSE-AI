"""
HOUSE AI - Automated Unit & Integration Tests for Python ML Service
Tests health endpoint, model info endpoint, valid prediction (Maharashtra -> Navi Mumbai -> Vashi),
invalid inputs, missing features, and unsupported location coverage handling.
"""
import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import app


class HouseAIMLServiceTests(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_health_endpoint(self):
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(data["modelLoaded"])

    def test_02_model_info_endpoint(self):
        res = self.client.get("/info")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        info = data["data"]
        self.assertIn("metrics", info)
        self.assertIn("r2Score", info["metrics"])
        self.assertGreater(info["metrics"]["r2Score"], 0.85)
        self.assertEqual(len(info["algorithmComparison"]), 3)

    def test_03_valid_prediction_vashi_navi_mumbai(self):
        payload = {
            "state": "Maharashtra",
            "district": "Thane",
            "city": "Navi Mumbai",
            "locality": "Vashi",
            "propertyType": "Apartment / Flat",
            "area": 1000,
            "bhk": 2,
            "bathrooms": 2,
            "balconies": 1,
            "houseAge": 5,
            "furnishingStatus": "Semi-Furnished",
            "parking": "Yes",
            "floorNumber": 4,
            "totalFloors": 12,
        }
        res = self.client.post("/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertTrue(data["coverageSupported"])
        self.assertIsNotNone(data["predictedPrice"])
        self.assertGreater(data["predictedPrice"], 5000000)
        self.assertAlmostEqual(data["pricePerSqFt"], round(data["predictedPrice"] / 1000, 2), places=1)

    def test_04_unsupported_location_coverage(self):
        payload = {
            "state": "Arunachal Pradesh",
            "district": "Papum Pare",
            "city": "Itanagar",
            "locality": "Ganga Market",
            "propertyType": "Apartment / Flat",
            "area": 1100,
            "bhk": 2,
            "bathrooms": 2,
            "houseAge": 3,
        }
        res = self.client.post("/predict", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertFalse(data["coverageSupported"])
        self.assertIsNone(data["predictedPrice"])
        self.assertEqual(data["predictionStatus"], "unsupported_location")

    def test_05_invalid_input_negative_area(self):
        payload = {
            "state": "Maharashtra",
            "city": "Navi Mumbai",
            "locality": "Vashi",
            "propertyType": "Apartment / Flat",
            "area": -450,
            "bhk": 2,
            "bathrooms": 2,
            "houseAge": 5,
        }
        res = self.client.post("/predict", json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])

    def test_06_missing_features(self):
        payload = {
            "state": "Maharashtra",
            "city": "Navi Mumbai",
        }
        res = self.client.post("/predict", json=payload)
        self.assertEqual(res.status_code, 400)
        data = res.get_json()
        self.assertFalse(data["success"])


if __name__ == "__main__":
    unittest.main()
