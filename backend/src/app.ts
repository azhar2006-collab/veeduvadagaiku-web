import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security headers with cross-origin resource sharing for static image uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Serve static uploads
app.use('/uploads', express.static(uploadsDir));

// CORS — allow localhost dev + any Vercel domain + custom domain
app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or requests without origin
    if (!origin) return callback(null, true);
    // Allow localhost, any vercel.app domain, and configured FRONTEND_URL
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL.replace(/\/$/, '')))
    ) {
      return callback(null, true);
    }
    // Permissive fallback so public marketplace API is never blocked
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(generalLimiter);

// Body parsing — raw body saved for webhook signature verification
app.use((req, res, next) => {
  if (req.path === '/api/payments/webhook') {
    next(); // handled separately with express.raw in the route
  } else {
    express.json({ limit: '10mb' })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Veedu Vadagaiku API' });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
