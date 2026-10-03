import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { prisma } from './config/database';
import { initFirebase } from './config/firebase';

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  try {
    // Test database connection
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (dbError) {
      console.warn('⚠️  PostgreSQL Database is not reachable at DATABASE_URL.');
      console.warn('👉 Update backend/.env with your PostgreSQL credentials (local or hosted like Neon/Supabase) to enable database operations.');
    }

    // Initialize Firebase Admin
    try {
      initFirebase();
      console.log('✅ Firebase Admin initialized');
    } catch (fbError) {
      console.warn('⚠️  Firebase Admin credentials not set or invalid.');
      console.warn('👉 Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env for authentication.');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Veedu Vadagaiku API running on http://localhost:${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
