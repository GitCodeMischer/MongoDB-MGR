# Development Stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# Builder Stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

# Ensure next.config.mjs correctly configures standalone output
RUN sed -i 's/output:.*standalone.*/output: "standalone",/' next.config.mjs || echo "Couldn't update next.config.mjs"
RUN cat next.config.mjs

# Build the application
RUN npm run build

# Check build output
RUN ls -la .next || echo "No .next directory"
RUN ls -la .next/standalone || echo "No standalone directory"

# Production Stage - Regular Next.js Mode
FROM node:18-alpine AS production

WORKDIR /app

# Copy public folder
COPY --from=builder /app/public ./public/

# Copy necessary files for regular mode 
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/.next ./.next/
COPY --from=builder /app/node_modules ./node_modules/

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# Use npm start as the default command
CMD ["npm", "start"] 