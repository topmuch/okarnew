# OKAR - Dockerfile for Coolify
FROM node:20-alpine

# Install required packages
RUN apk add --no-cache git libc6-compat sqlite

WORKDIR /app

# Clone the repository
RUN git clone https://github.com/topmuch/okarnew.git .

# Install dependencies with npm (more reliable than bun in Docker)
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=file:/app/data/okar.db
RUN npm run build

# Create data directory with proper permissions
RUN mkdir -p /app/data && chmod 777 /app/data

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=== OKAR Starting ==="' >> /app/start.sh && \
    echo 'mkdir -p /app/data' >> /app/start.sh && \
    echo 'export DATABASE_URL=file:/app/data/okar.db' >> /app/start.sh && \
    echo 'export PORT=3001' >> /app/start.sh && \
    echo 'export HOSTNAME=0.0.0.0' >> /app/start.sh && \
    echo 'export NODE_ENV=production' >> /app/start.sh && \
    echo 'echo "Running prisma db push..."' >> /app/start.sh && \
    echo 'npx prisma db push --skip-generate 2>/dev/null || echo "DB push warning (may already exist)"' >> /app/start.sh && \
    echo 'echo "Running seed..."' >> /app/start.sh && \
    echo 'npx tsx prisma/seed.ts 2>/dev/null || echo "Seed warning (may already have data)"' >> /app/start.sh && \
    echo 'echo "Starting Next.js server on port 3001..."' >> /app/start.sh && \
    echo 'exec node .next/standalone/server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# IMPORTANT: Must match Coolify port setting
EXPOSE 3001

# Set environment variables
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL=file:/app/data/okar.db
ENV NODE_ENV=production

# Start using the script
CMD ["/app/start.sh"]
