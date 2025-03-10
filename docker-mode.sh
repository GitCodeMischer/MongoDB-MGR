#!/bin/bash

# Script to switch MongoDB Statistics Docker container between development and production modes

MODE=$1

if [ "$MODE" == "dev" ] || [ "$MODE" == "development" ]; then
  echo "Switching to Development Mode..."
  # Create a temporary file with development configuration
  cat > docker-compose.yml.tmp << EOL
services:
  mongodb-statistics:
    build:
      context: .
      dockerfile: Dockerfile
      target: development
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
EOL
  mv docker-compose.yml.tmp docker-compose.yml
  echo "Configuration updated for development mode"
  
elif [ "$MODE" == "prod" ] || [ "$MODE" == "production" ]; then
  echo "Switching to Production Mode..."
  # Create a temporary file with production configuration
  cat > docker-compose.yml.tmp << EOL
services:
  mongodb-statistics:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:3000"
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
EOL
  mv docker-compose.yml.tmp docker-compose.yml
  echo "Configuration updated for production mode"
  
else
  echo "Error: Please specify mode (dev/development or prod/production)"
  echo "Usage: ./docker-mode.sh dev|prod"
  exit 1
fi

echo ""
echo "To apply changes, run:"
echo "docker-compose down && docker-compose up -d" 