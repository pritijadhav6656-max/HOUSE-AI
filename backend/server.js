const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB, getDbStatus } = require('./config/db');
const { checkMlServiceHealth } = require('./services/mlService');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();

const app = express();

// Security Headers & CORS
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:4173',
    ],
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// API Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});
app.use('/api', apiLimiter);

// Request Logger
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[API] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  }
  next();
});

// Health Endpoint
app.get('/api/health', async (_req, res) => {
  const dbStatus = getDbStatus();
  const mlStatus = await checkMlServiceHealth();

  return res.status(200).json({
    success: true,
    service: 'HOUSE AI Express Backend',
    expressStatus: 'operational',
    mongodb: dbStatus,
    mlService: mlStatus,
    timestamp: new Date().toISOString(),
  });
});

// API Route Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/locations', require('./routes/locationRoutes'));
app.use('/api/predictions', require('./routes/predictionRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/model', require('./routes/modelRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`HOUSE AI Backend Server running on http://localhost:${PORT}`);
    console.log(`Health Endpoint: http://localhost:${PORT}/api/health`);
    console.log(`================================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
