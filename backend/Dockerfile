FROM node:20-alpine

WORKDIR /app

# Install OpenSSL and libc6-compat required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package files, Prisma schema, and scripts
COPY package*.json ./
COPY prisma ./prisma/
COPY scripts ./scripts

# Set build-time dummy database URLs so Prisma client generation succeeds
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV DIRECT_URL="postgresql://postgres:postgres@localhost:5432/postgres"

# Install dependencies inside the container
RUN npm install

# Copy configuration and source files
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma client and compile TypeScript
RUN npm run build

# Default environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

# Start the compiled Node.js backend
CMD ["node", "dist/server.js"]
