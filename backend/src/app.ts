import 'dotenv/config';
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

// Serve property assets from frontend public directory if available
const frontendPublicDir = path.resolve(__dirname, '../../frontend/public');
if (fs.existsSync(frontendPublicDir)) {
  app.use('/indian-properties', express.static(path.join(frontendPublicDir, 'indian-properties')));
  app.use('/properties', express.static(path.join(frontendPublicDir, 'properties')));
}

// CORS — allow all client origins dynamically with credentials
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
