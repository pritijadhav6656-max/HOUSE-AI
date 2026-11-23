# HOUSE AI — Architecture & REST API Reference

## 1. End-to-End Request Lifecycle

1. **User Interaction (React + Vite):** The user selects a location (`Country → State/UT → District → City → Locality`) and enters property attributes (`propertyType`, `area`, `bhk`, `bathrooms`, `balconies`, `houseAge`, `furnishingStatus`, `parking`, `floorNumber`, `totalFloors`).
2. **Express Validation (`POST /api/predictions`):** The JWT-protected Express endpoint validates all fields via `express-validator`.
3. **Python ML Inference (`POST http://127.0.0.1:8000/predict`):** Express forwards the validated payload via Axios to the Flask ML microservice.
4. **Coverage & Prediction:** Flask checks `model_info.json` for city-level training coverage, runs Scikit-learn `Pipeline.predict()`, computes `pricePerSqFt`, and returns structured JSON.
5. **MongoDB Persistence (`houseprice_ai.predictions`):** Express saves the prediction record linked to `req.user._id` and returns the saved document to React.

## 2. Database Schema Summary (`houseprice_ai`)

- **`users`**: `name`, `email` (unique), `password` (bcrypt hashed), `role` (`user` | `admin`), `phone`, `profileImage`, `isActive`, `notificationPreferences`, `resetPasswordToken`, `resetPasswordExpire`, timestamps.
- **`predictions`**: `userId` (ObjectId ref `User`), `country`, `state`, `district`, `city`, `locality`, `propertyType`, `area`, `bhk`, `bathrooms`, `balconies`, `houseAge`, `furnishingStatus`, `parking`, `floorNumber`, `totalFloors`, `predictedPrice`, `pricePerSqFt`, `modelName`, `modelVersion`, `predictionCoverage`, `predictionStatus`, `disclaimer`, `createdAt`.
- **`locations`**: `country`, `state`, `administrativeType`, `district`, `city`, `locality`, `stateCode`, `districtCode`, `cityCode`, `mlCovered`, `baseRateSqFt`, `isActive`.
- **`modelresults`**: `modelName`, `algorithm`, `r2Score`, `mae`, `rmse`, `datasetRecords`, `trainingRecords`, `testingRecords`, `trainingDate`, `modelVersion`, `supportedLocations`, `isSynthetic`.
- **`contacts`**: `name`, `email`, `subject`, `message`, `status` (`pending` | `resolved`), timestamps.
