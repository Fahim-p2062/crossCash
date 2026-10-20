const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// 1. Mandatory JWT_SECRET validation (Refuse startup if missing or < 32 chars)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    console.error('[Fatal Error] JWT_SECRET is missing or shorter than 32 characters in .env. Server shutting down.');
    process.exit(1);
  } else {
    console.warn('[Warning] JWT_SECRET is missing or shorter than 32 characters. Please configure it in environment variables.');
  }
}

const app = express();

// 2. Security Middleware: Helmet & Strict CORS
app.use(helmet());

const frontendOriginEnv = process.env.FRONTEND_ORIGIN;
const allowedOrigins = frontendOriginEnv
  ? frontendOriginEnv.split(',').map((o) => o.trim())
  : ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-side fetch, mobile)
    if (!origin) return callback(null, true);
    // Allow if FRONTEND_ORIGIN is '*' or matches origin, or is localhost/vercel preview
    if (
      !frontendOriginEnv ||
      frontendOriginEnv === '*' ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, origin);
    }
    return callback(null, origin);
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'X-Requested-With']
}));

// 3. Global Rate Limiter: 1000 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use(globalLimiter);

// 4. Body parser
app.use(express.json());

// 5. Auth Rate Limiter: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts from this IP, please try again after 15 minutes' }
});

// 6. Routes & Middlewares
const { verifyToken } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const biometricRoutes = require('./routes/biometric');
const userRoutes = require('./routes/user');
const transactionRoutes = require('./routes/transaction');

// Public route: Health probe
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CrossCash API is running' });
});

// Biometric auth routes
app.use('/api/auth/biometric', biometricRoutes);

// Public auth routes with rate limiting (/api/auth/register, /api/auth/login)
app.use('/api/auth', authLimiter, authRoutes);

// Protected routes (require valid JWT)
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/transactions', verifyToken, transactionRoutes);

// 7. Global Error Handler (Never leaks stack traces or internal messages)
app.use((err, req, res, next) => {
  console.error(`[Server Error] ${req.method} ${req.path}:`, err.message || 'Internal Error');
  res.status(err.status || 500).json({
    error: 'An unexpected server error occurred. Please try again later.'
  });
});

// 8. Database connection & Server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crosscash';

const dns = require('dns');
if (MONGO_URI.startsWith('mongodb+srv:')) {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch (e) {
    // ignore if cannot set custom DNS
  }
}

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.warn(`[Warning] Could not connect to MongoDB at ${MONGO_URI}: ${err.message}`);
    console.warn('[Notice] The Express server is still running on port ' + PORT + ' for API requests.');
  });

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
