# Use specific Node version with better performance

FROM node:20-alpine AS builder
 
# Set working directory

WORKDIR /app
 
# Add these lines to accept the build argument
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Install build dependencies for native modules if needed

RUN apk add --no-cache python3 make g++
 
# Set Node.js memory limit and optimization flags

ENV NODE_OPTIONS="--max-old-space-size=4096"

ENV CI=false
 
# Copy package files first for better Docker layer caching

COPY package*.json ./
 
# Optimized npm install

RUN npm ci \
    --no-audit \
    --no-fund \
    --prefer-offline \
    --progress=false \
    --legacy-peer-deps \
&& npm cache clean --force
 
# Copy source code (separate layer for better caching)

COPY . .
 
# Build with aggressive optimizations

RUN GENERATE_SOURCEMAP=false \
    INLINE_RUNTIME_CHUNK=false \
    BUILD_PATH=./build \
    npm run build
 
# Production stage - minimal Node.js with serve

FROM node:20-alpine
 
# Install serve globally with optimizations

RUN npm install -g serve@14 \
    --no-audit \
    --no-fund \
    --progress=false \
&& npm cache clean --force
 
WORKDIR /app

# Accept dynamic port

ARG SERVICE_PORT=3020

ENV SERVICE_PORT=$SERVICE_PORT
# Copy only the built application

COPY --from=builder /app/dist ./build
 
 
EXPOSE ${SERVICE_PORT}
 
# Use shell form to allow ENV variable substitution

CMD sh -c "serve -s build -l ${SERVICE_PORT} --no-clipboard --no-compression"