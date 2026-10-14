FROM node:20-alpine

WORKDIR /app

# Install OpenSSL required by Prisma engine on Alpine
RUN apk add --no-cache openssl

# Copy backend package files and Prisma schema
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies inside the container
RUN npm install

# Copy configuration and source files
COPY backend/tsconfig.json ./
COPY backend/scripts ./scripts
COPY backend/src ./src

# Set build-time dummy database URLs so `npx prisma generate` validates schema without errors
# Runtime environment variables from Railway will override these when the server starts
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV DIRECT_URL="postgresql://postgres:postgres@localhost:5432/postgres"

# Generate Prisma client and compile TypeScript
RUN npx prisma generate
RUN npm run build

# Default environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the compiled Node.js backend
CMD ["node", "dist/server.js"]
