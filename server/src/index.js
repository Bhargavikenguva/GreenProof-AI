import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import statsRoutes from './routes/stats.routes.js';
import healthRoutes from './routes/health.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const clientUrls = (config.clientUrl || '').split(',').map((u) => u.trim().replace(/\/$/, '')).filter(Boolean);
const allowedOrigins = [
  ...clientUrls,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS blocked origin: ' + origin));
    },
    credentials: true,
  })
);

// Rate limiting (120 requests per 15 minutes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads directory (for serving product packaging photos)
const uploadsDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'GreenProof AI API',
    description: 'AI-Powered Environmental Claim Assessment Application',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server function
export async function startServer(customPort = null) {
  await connectDB();
  const listenPort = customPort || config.port;
  return new Promise((resolve, reject) => {
    const server = app.listen(listenPort, () => {
      console.log(`GreenProof AI Server running in ${config.nodeEnv} mode on port ${listenPort}`);
      resolve({ app, server, port: listenPort });
    });
    server.on('error', reject);
  });
}

// Automatically start only if executed directly via node src/index.js
const isDirectExecution = process.argv[1] && process.argv[1].endsWith('index.js');
if (isDirectExecution && process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
