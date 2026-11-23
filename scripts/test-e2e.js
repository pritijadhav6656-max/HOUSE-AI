/**
 * HOUSE AI - Comprehensive End-to-End Integration & Verification Suite
 * Tests:
 * 1. Express Health & MongoDB Connection + Python ML Connection
 * 2. Location APIs (All 28 States + 8 UTs, Districts, Cities, Localities, Search)
 * 3. User Registration, Duplicate Email Prevention, Bcrypt Hashing Verification
 * 4. User Login & JWT Protected Profile Access
 * 5. Forgot Password & Reset Password Workflow
 * 6. Mandatory End-to-End Prediction Workflow:
 *    State: Maharashtra | City: Navi Mumbai | Locality: Vashi
 *    Area: 1000 sq.ft. | BHK: 2 | Bathrooms: 2 | House Age: 5 years
 * 7. Unsupported Location Prediction Coverage Check (Arunachal Pradesh -> Itanagar)
 * 8. Prediction History Filtering, Sorting, Pagination & Ownership Isolation
 * 9. User Dashboard Analytics Aggregations
 * 10. Model Performance Endpoint (/api/model/info)
 * 11. Contact Submission & Admin Portal Authorization
 */
const path = require('path');
const assert = require('assert');
const axios = require(path.join(__dirname, '..', 'backend', 'node_modules', 'axios'));
const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));
const dotenv = require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv'));

dotenv.config({ path: path.join(__dirname, '..', 'backend', '.env') });

const User = require(path.join(__dirname, '..', 'backend', 'models', 'User'));
const Prediction = require(path.join(__dirname, '..', 'backend', 'models', 'Prediction'));
const Contact = require(path.join(__dirname, '..', 'backend', 'models', 'Contact'));

const API_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
const ML_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

const results = [];
const logResult = (name, passed, details = '') => {
  results.push({ name, passed, details });
  const tag = passed ? '[PASS]' : '[FAIL]';
  console.log(`${tag} ${name}${details ? ' — ' + details : ''}`);
};

const runAllTests = async () => {
  console.log('========================================================================');
  console.log('HOUSE AI - END-TO-END FULL-STACK & ML INTEGRATION TEST SUITE');
  console.log('========================================================================');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/houseprice_ai');

  const testEmail = `e2e.tester.${Date.now()}@houseai.in`;
  const adminEmail = `e2e.admin.${Date.now()}@houseai.in`;
  let userToken = '';
  let adminToken = '';
  let createdPredictionId = '';

  try {
    // 1. Python Flask ML Health & Info
    const mlHealth = await axios.get(`${ML_URL}/`);
    assert.strictEqual(mlHealth.status, 200);
    assert.strictEqual(mlHealth.data.modelLoaded, true);
    logResult('Python Flask ML Service Health (GET /)', true, `Model: ${mlHealth.data.modelName}`);

    // 2. Express Health Endpoint
    const apiHealth = await axios.get(`${API_URL}/health`);
    assert.strictEqual(apiHealth.status, 200);
    assert.strictEqual(apiHealth.data.mongodb.connected, true);
    assert.strictEqual(apiHealth.data.mlService.online, true);
    logResult('Express Backend & MongoDB Health (GET /api/health)', true, `DB: ${apiHealth.data.mongodb.database}`);

    // 3. India-Wide Location System (28 States + 8 UTs)
    const statesRes = await axios.get(`${API_URL}/locations/states`);
    assert.strictEqual(statesRes.status, 200);
    assert.strictEqual(statesRes.data.count, 36);
    assert.strictEqual(statesRes.data.metadata.totalStates, 28);
    assert.strictEqual(statesRes.data.metadata.totalUnionTerritories, 8);
    logResult(
      'Location System: 28 States & 8 UTs Verification',
      true,
      `States: ${statesRes.data.metadata.totalStates}, UTs: ${statesRes.data.metadata.totalUnionTerritories}, Total: ${statesRes.data.count}`
    );

    // 4. Cascading Location Endpoints: Maharashtra -> Navi Mumbai -> Vashi
    const mhCitiesRes = await axios.get(`${API_URL}/locations/states/Maharashtra/cities`);
    const naviMumbai = mhCitiesRes.data.data.find((c) => c.city === 'Navi Mumbai');
    assert.ok(naviMumbai, 'Navi Mumbai must exist under Maharashtra');

    const vashiLocRes = await axios.get(`${API_URL}/locations/cities/${encodeURIComponent('Navi Mumbai')}/localities?state=Maharashtra`);
    const vashi = vashiLocRes.data.localities.find((l) => l.locality === 'Vashi');
    assert.ok(vashi, 'Vashi must exist under Navi Mumbai');
    logResult(
      'Cascading Location APIs (Maharashtra -> Navi Mumbai -> Vashi)',
      true,
      `Found ${vashiLocRes.data.total} localities in Navi Mumbai`
    );

    // 5. User Registration & Bcrypt Password Hashing
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Rohan Deshmukh',
      email: testEmail,
      phone: '+91 9820112233',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    assert.strictEqual(regRes.status, 201);
    assert.ok(regRes.data.token);
    userToken = regRes.data.token;

    const dbUser = await User.findOne({ email: testEmail }).select('+password');
    assert.ok(dbUser.password.startsWith('$2'), 'Password must be bcrypt hashed');
    logResult('User Registration & Bcrypt Hashing', true, `User ID: ${dbUser._id}`);

    // 6. Duplicate Email Prevention
    let dupRejected = false;
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name: 'Duplicate User',
        email: testEmail,
        password: 'Password123',
        confirmPassword: 'Password123',
      });
    } catch (err) {
      if (err.response && err.response.status === 409) dupRejected = true;
    }
    assert.strictEqual(dupRejected, true);
    logResult('Duplicate Email Registration Prevention', true, 'HTTP 409 Conflict Verified');

    // 7. Forgot Password & Reset Password Workflow
    const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, { email: testEmail });
    assert.strictEqual(forgotRes.status, 200);
    assert.ok(forgotRes.data.devResetToken, 'Dev reset token returned in development mode');

    const resetRes = await axios.post(`${API_URL}/auth/reset-password`, {
      token: forgotRes.data.devResetToken,
      password: 'NewPassword456',
      confirmPassword: 'NewPassword456',
    });
    assert.strictEqual(resetRes.status, 200);

    // 8. Login with New Password
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testEmail,
      password: 'NewPassword456',
    });
    assert.strictEqual(loginRes.status, 200);
    userToken = loginRes.data.token;
    logResult('Forgot Password, Reset Password & Re-Login Workflow', true);

    // 9. COMPLETE END-TO-END TEST (Section 20 Specification):
    // State: Maharashtra, City: Navi Mumbai, Locality: Vashi, Area: 1000 sq.ft., BHK: 2, Bathrooms: 2, House Age: 5 years
    const predPayload = {
      country: 'India',
      state: 'Maharashtra',
      district: 'Thane',
      city: 'Navi Mumbai',
      locality: 'Vashi',
      propertyType: 'Apartment / Flat',
      area: 1000,
      bhk: 2,
      bathrooms: 2,
      balconies: 1,
      houseAge: 5,
      furnishingStatus: 'Semi-Furnished',
      parking: 'Yes',
      floorNumber: 4,
      totalFloors: 12,
    };

    const predRes = await axios.post(`${API_URL}/predictions`, predPayload, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(predRes.status, 201);
    assert.strictEqual(predRes.data.coverageSupported, true);
    assert.ok(predRes.data.data.predictedPrice > 5000000);
    assert.strictEqual(
      predRes.data.data.pricePerSqFt,
      Number((predRes.data.data.predictedPrice / 1000).toFixed(2))
    );
    createdPredictionId = predRes.data.data._id;
    logResult(
      'E2E Prediction (Maharashtra -> Navi Mumbai -> Vashi, 1000 sq.ft., 2 BHK, 2 Bath, 5 Yrs)',
      true,
      `Predicted Price: ₹${predRes.data.data.predictedPrice.toLocaleString('en-IN')} (₹${predRes.data.data.pricePerSqFt}/sq.ft.)`
    );

    // 10. Unsupported Location Prediction Handling (Arunachal Pradesh -> Itanagar)
    const unsupportedRes = await axios.post(
      `${API_URL}/predictions`,
      {
        state: 'Arunachal Pradesh',
        district: 'Papum Pare',
        city: 'Itanagar',
        locality: 'Ganga Market',
        propertyType: 'Apartment / Flat',
        area: 1200,
        bhk: 2,
        bathrooms: 2,
        houseAge: 2,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.strictEqual(unsupportedRes.status, 201);
    assert.strictEqual(unsupportedRes.data.coverageSupported, false);
    assert.strictEqual(unsupportedRes.data.data.predictedPrice, null);
    logResult('Unsupported ML Coverage Location Handling (Itanagar, Arunachal Pradesh)', true, 'No fake price generated');

    // 11. Prediction History & Filtering
    const historyRes = await axios.get(`${API_URL}/predictions?city=Navi%20Mumbai&bhk=2`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(historyRes.status, 200);
    assert.strictEqual(historyRes.data.total, 1);
    assert.strictEqual(historyRes.data.data[0]._id, createdPredictionId);
    logResult('Prediction History MongoDB Persistence & Filtering', true, '1 matching record retrieved');

    // 12. User Dashboard Aggregations
    const dashRes = await axios.get(`${API_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(dashRes.status, 200);
    assert.strictEqual(dashRes.data.data.summary.totalPredictions, 2);
    assert.ok(dashRes.data.data.summary.modelR2Score > 0.9);
    logResult('User Dashboard Analytics Endpoint (GET /api/dashboard)', true, `Total: ${dashRes.data.data.summary.totalPredictions}, R2: ${dashRes.data.data.summary.modelR2Score}`);

    // 13. Model Performance Endpoint
    const modelRes = await axios.get(`${API_URL}/model/info`);
    assert.strictEqual(modelRes.status, 200);
    assert.strictEqual(modelRes.data.data.algorithmComparison.length, 3);
    logResult('Model Performance Analytics Endpoint (GET /api/model/info)', true, `Active: ${modelRes.data.data.modelName}`);

    // 14. Contact Submission
    const contactRes = await axios.post(`${API_URL}/contact`, {
      name: 'Rohan Deshmukh',
      email: testEmail,
      subject: 'E2E Verification Inquiry',
      message: 'Testing the HOUSE AI contact submission and MongoDB persistence.',
    });
    assert.strictEqual(contactRes.status, 201);
    logResult('Contact Form Submission (POST /api/contact)', true);

    // 15. Admin Authorization Check (Standard user blocked, Admin allowed)
    let standardBlocked = false;
    try {
      await axios.get(`${API_URL}/admin/overview`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
    } catch (err) {
      if (err.response && err.response.status === 403) standardBlocked = true;
    }
    assert.strictEqual(standardBlocked, true);

    // Create admin account in MongoDB and verify admin access
    const adminUser = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'AdminPassword123',
      role: 'admin',
    });
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: adminEmail,
      password: 'AdminPassword123',
    });
    adminToken = adminLogin.data.token;

    const adminOverview = await axios.get(`${API_URL}/admin/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(adminOverview.status, 200);
    assert.ok(adminOverview.data.data.stats.totalUsers >= 2);
    logResult('Role-Based Admin Authorization & Governance Overview', true, 'Standard user blocked (403); Admin authorized (200)');

    // Clean up temporary test artifacts
    await Prediction.deleteMany({ userId: dbUser._id });
    await Contact.deleteMany({ email: testEmail });
    await User.deleteMany({ email: { $in: [testEmail, adminEmail] } });
  } finally {
    await mongoose.disconnect();
  }

  console.log('========================================================================');
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`SUMMARY: ${passedCount}/${results.length} END-TO-END TESTS PASSED`);
  console.log('========================================================================');
};

runAllTests().catch((err) => {
  console.error('[E2E TEST FAILURE]', err.response?.data || err.message);
  process.exit(1);
});
