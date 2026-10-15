const { execSync } = require('child_process');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');

// Ensure database URL env vars exist for prisma generate without crashing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/postgres";
}
if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

try {
  console.log('[generate-client] Generating Prisma Client inside backend...');
  const fs = require('fs');
  const prismaBin = path.join(backendDir, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
  const cmd = fs.existsSync(prismaBin) ? `"${prismaBin}" generate` : 'npx prisma generate';
  
  execSync(cmd, {
    cwd: backendDir,
    stdio: 'inherit',
    env: process.env,
  });
  console.log('[generate-client] Prisma Client generated successfully.');
} catch (error) {
  console.error('[generate-client] Error running prisma generate:', error.message || error);
  if (process.env.npm_lifecycle_event === 'postinstall') {
    console.warn('[generate-client] Skipping fatal exit during postinstall phase. Prisma generate will run during build.');
  } else {
    process.exit(1);
  }
}

