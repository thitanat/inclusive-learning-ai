# Environment Configuration Guide

## Overview

This project uses a **single source of truth** environment configuration system that automatically loads the correct `.env` file based on `NODE_ENV`. This ensures consistency across development, staging, and production environments.

---

## 📂 Environment File Structure

### Git Tracking Status

| File | Tracked in Git | Purpose |
|------|---------------|---------|
| `.env.example` | ✅ Yes | Template with all available variables |
| `.env.development` | ✅ Yes | Development configuration (safe values only) |
| `.env.production.example` | ✅ Yes | Production template |
| `.env.production` | ❌ **NO** | **Real production secrets (NEVER commit!)** |
| `.env.local` | ❌ **NO** | Local overrides |
| `.env` | ❌ **NO** | Generic fallback |

---

## 🔄 How It Works

### 1. Automatic Environment Loading

The `env.config.js` file automatically loads the correct environment file:

```javascript
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;  // e.g., .env.development, .env.production
```

**Loading Priority:**
1. `.env.{NODE_ENV}` (e.g., `.env.development`, `.env.production`)
2. `.env` (fallback if environment-specific file not found)

### 2. Environment Selection

Set `NODE_ENV` to determine which `.env` file to use:

```bash
# Development
NODE_ENV=development npm run dev

# Production
NODE_ENV=production npm start
```

---

## 🚀 Usage Workflows

### Local Development (No Docker)

```bash
# Development mode with hot-reload
npm run dev              # Uses .env.development automatically

# Or explicitly set environment
npm run dev:local        # NODE_ENV=development npm run dev
```

### Docker Development

```bash
# Start development environment
npm run docker:dev       # Uses .env.development + docker-compose.dev.yml

# With rebuild
npm run docker:dev:build

# Stop and clean up
npm run docker:dev:down
```

**What happens:**
- Loads `docker-compose.yml` + `docker-compose.dev.yml`
- Uses `env_file: - .env.development`
- Mounts source code for hot-reload
- Connects to MongoDB via Docker network
- Runs `npm run dev` inside container

### Docker Production

```bash
# Start production environment
npm run docker:prod      # Uses .env.production + docker-compose.prod.yml

# With rebuild
npm run docker:prod:build

# Stop and clean up
npm run docker:prod:down
```

**What happens:**
- Loads `docker-compose.yml` + `docker-compose.prod.yml`
- Uses `env_file: - .env.production`
- No volume mounts (code baked into image)
- Optimized production build
- Resource limits applied
- Healthchecks enabled

### Production Deployment

```bash
# Deploy to remote server
./scripts/deploy.sh user@production-server.com
```

**Deployment process:**
1. Validates `.env.production` exists locally
2. Creates deployment package
3. Uploads to remote server via SSH
4. Runs Docker Compose in production mode
5. Shows deployment status

---

## 🐳 Docker Compose Architecture

### Base Configuration (`docker-compose.yml`)

Defines core services (MongoDB) with default settings.

### Development Override (`docker-compose.dev.yml`)

```yaml
services:
  app:
    target: development      # Uses Dockerfile development stage
    env_file:
      - .env.development     # Loads dev environment
    volumes:
      - .:/app              # Hot-reload
    command: npm run dev
```

### Production Override (`docker-compose.prod.yml`)

```yaml
services:
  app:
    target: production       # Uses Dockerfile production stage
    env_file:
      - .env.production      # Loads prod environment
    # No volumes - code is in image
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G
```

---

## 📦 Multi-Stage Dockerfile

### Stage 1: `base`
Common dependencies and package installation

### Stage 2: `deps`
Install all dependencies (including devDependencies)

### Stage 3: `development` ⬅️ **Development Target**
- Includes all dependencies
- Mounts source code
- Runs `npm run dev`
- Hot-reload enabled

### Stage 4: `builder`
Builds optimized production assets

### Stage 5: `production` ⬅️ **Production Target**
- Only production dependencies
- Optimized build
- Non-root user
- Healthcheck included
- Runs `node server.js`

---

## 🔧 npm Scripts Reference

### Local Development
```bash
npm run dev              # Development server (default)
npm run dev:local        # Development with NODE_ENV=development
npm run start:dev        # Production build, dev environment
npm run start:prod       # Production build, prod environment
```

### Docker Commands
```bash
npm run docker:dev       # Start dev environment
npm run docker:dev:build # Start dev with rebuild
npm run docker:dev:down  # Stop dev environment

npm run docker:prod      # Start prod environment
npm run docker:prod:build # Start prod with rebuild
npm run docker:prod:down # Stop prod environment

npm run docker:logs      # View container logs
npm run docker:clean     # Clean up containers and volumes
```

---

## ⚙️ Environment Variables

### Application Settings
```bash
NODE_ENV=development          # Environment (development/production)
PORT=3005                     # Server port
HOSTNAME=localhost            # Bind address
```

### Database
```bash
# Local Docker MongoDB
MONGO_URI=mongodb://admin:password@localhost:27017/inclusive?authSource=admin
MONGO_ROOT_PASSWORD=inclusive_admin_2026

# Production MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/inclusive
```

### Authentication
```bash
JWT_SECRET=your-secret-key    # Generate with: openssl rand -base64 32
```

### AI Services
```bash
OPENAI_API_KEY=sk-...         # OpenAI API key
SERPER_API_KEY=...            # Serper API key (web search)
PINECONE_API_KEY=...          # Pinecone API key (vector DB)
PINECONE_ENVIRONMENT=...      # Pinecone environment
PINECONE_INDEX=...            # Pinecone index name
```

### Next.js
```bash
NEXT_PUBLIC_API_URL=http://localhost:3005
NEXT_TELEMETRY_DISABLED=1
```

### Optional
```bash
DEBUG=true                    # Enable debug mode
LOG_LEVEL=debug              # Log level (debug/info/error)
USE_OPTIMIZED_PIPELINE=true  # LangChain optimization
```

---

## 🔒 Security Best Practices

### Development Environment (`.env.development`)
✅ **CAN** be committed to git
✅ Use placeholder/test API keys
✅ Safe for team sharing
✅ No sensitive production data

### Production Environment (`.env.production`)
❌ **NEVER** commit to git
❌ Contains real credentials
❌ Generate strong secrets
❌ Rotate keys regularly

### Secret Generation
```bash
# Generate JWT secret
openssl rand -base64 32

# Generate random password
openssl rand -hex 16
```

---

## 🏗️ Setup Instructions

### First-Time Setup

1. **Copy environment template:**
   ```bash
   # Development is already created
   # Create production env from template
   cp .env.production.example .env.production
   ```

2. **Configure `.env.production`:**
   - Add real API keys
   - Set strong JWT secret
   - Configure production MongoDB URI
   - Update NEXT_PUBLIC_API_URL to production domain

3. **Verify `.gitignore`:**
   ```bash
   # Ensure .env.production is ignored
   git check-ignore .env.production
   # Should output: .env.production
   ```

4. **Start development:**
   ```bash
   npm run docker:dev
   ```

---

## 🔍 Environment Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     User Command                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  npm run docker:dev        │  npm run docker:prod           │
└─────────────────────────────────────────────────────────────┘
                │                           │
                ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│ docker-compose.dev.yml   │  │ docker-compose.prod.yml      │
└──────────────────────────┘  └──────────────────────────────┘
                │                           │
                ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│ env_file:                │  │ env_file:                    │
│  - .env.development      │  │  - .env.production           │
└──────────────────────────┘  └──────────────────────────────┘
                │                           │
                ▼                           ▼
┌──────────────────────────┐  ┌──────────────────────────────┐
│ NODE_ENV=development     │  │ NODE_ENV=production          │
└──────────────────────────┘  └──────────────────────────────┘
                │                           │
                ▼                           ▼
┌──────────────────────────────────────────────────────────────┐
│              env.config.js loads correct .env file           │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                   Application starts                         │
└──────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Environment not loading
```bash
# Check which environment is active
echo $NODE_ENV

# Verify file exists
ls -la .env.development .env.production

# Check Docker Compose config
docker-compose -f docker-compose.yml -f docker-compose.dev.yml config
```

### MongoDB connection issues
```bash
# Check MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongodb

# Test connection
docker exec -it inclusive-learning-mongodb mongosh \
  --username admin --password inclusive_admin_2026
```

### Build failures
```bash
# Clean rebuild
npm run docker:clean
npm run docker:dev:build
```

---

## 📚 Quick Reference

| Scenario | Command |
|----------|---------|
| Local dev (no Docker) | `npm run dev` |
| Docker dev | `npm run docker:dev` |
| Docker prod | `npm run docker:prod` |
| Deploy to server | `./scripts/deploy.sh user@server.com` |
| View logs | `npm run docker:logs` |
| Clean up | `npm run docker:clean` |
| Check health | `curl http://localhost:3005/api/health` |

---

## 🎯 Summary

**Single Source of Truth:**
- Each Docker Compose override file → points to ONE `.env.{environment}` file
- `env.config.js` → auto-loads based on `NODE_ENV`
- No duplicate configuration
- Consistent across all environments

**Development:**
- `.env.development` tracked in git
- Safe for team collaboration
- Hot-reload enabled
- Debug mode active

**Production:**
- `.env.production` NOT tracked
- Contains real secrets
- Optimized builds
- Resource limits enforced
- Healthchecks enabled
