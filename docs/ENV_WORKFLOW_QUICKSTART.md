# Environment Workflow Quick Start

## 🚀 Quick Start Commands

### Development (Recommended for local work)
```bash
# Start with Docker (MongoDB + App)
npm run docker:dev

# Or run locally (MongoDB in Docker, App on host)
docker-compose up mongodb -d
npm run dev
```

### Production
```bash
# 1. Create production environment file
cp .env.production.example .env.production

# 2. Edit .env.production with real credentials
vim .env.production  # or use your favorite editor

# 3. Start production stack
npm run docker:prod
```

---

## 📁 File Structure Created

```
inclusive-learning-ai/
├── env.config.js                 # ✨ Environment loader
├── .env.example                  # Template
├── .env.development              # ✅ Tracked - Dev config
├── .env.production.example       # Template for production
├── .env.production               # ❌ NOT tracked - Real secrets
├── docker-compose.yml            # Base configuration
├── docker-compose.dev.yml        # ✨ Development override
├── docker-compose.prod.yml       # ✨ Production override
├── Dockerfile                    # ✨ Updated with multi-stage
├── scripts/
│   └── deploy.sh                # ✨ Deployment script
├── src/app/api/health/
│   └── route.ts                 # ✨ Health check endpoint
└── docs/
    └── environment-configuration.md  # Full documentation
```

---

## 🔄 Environment Selection Flow

```
Development:
  npm run docker:dev
  → docker-compose.dev.yml
  → env_file: .env.development
  → NODE_ENV=development
  → Hot-reload enabled

Production:
  npm run docker:prod
  → docker-compose.prod.yml
  → env_file: .env.production
  → NODE_ENV=production
  → Optimized build
```

---

## 📝 Next Steps

1. **Configure Your API Keys** (`.env.development`)
   - Add OpenAI API key
   - Add Pinecone credentials
   - Add Serper API key (optional)

2. **Test Development Environment**
   ```bash
   npm run docker:dev
   # Visit: http://localhost:3005
   # Health check: http://localhost:3005/api/health
   ```

3. **For Production**
   ```bash
   # Create production env
   cp .env.production.example .env.production
   
   # Edit with real credentials
   nano .env.production
   
   # Generate strong JWT secret
   openssl rand -base64 32
   
   # Test locally if needed
   npm run docker:prod
   
   # Deploy to server
   ./scripts/deploy.sh user@production-server.com
   ```

---

## 🎯 Key Features Implemented

✅ **Single Source of Truth**
- One `.env` file per environment
- Auto-loads based on `NODE_ENV`
- No configuration duplication

✅ **Git-Safe**
- `.env.development` tracked for team consistency
- `.env.production` never committed
- Clear separation of dev/prod secrets

✅ **Docker-Optimized**
- Multi-stage Dockerfile (development/production targets)
- Separate docker-compose overrides
- Hot-reload in dev, optimized build in prod

✅ **Production-Ready**
- Health check endpoint
- Resource limits
- Non-root user
- Automated deployment script

✅ **Developer-Friendly**
- Simple npm scripts
- Clear documentation
- Easy switching between environments

---

## 🔍 Verify Installation

```bash
# 1. Check files exist
ls -la env.config.js .env.development docker-compose.dev.yml

# 2. Verify gitignore works
git check-ignore .env.production
# Should output: .env.production

# 3. Test development environment
npm run docker:dev

# 4. Check health
curl http://localhost:3005/api/health

# 5. View logs
npm run docker:logs
```

---

## 📚 Documentation

- **Full Guide**: [docs/environment-configuration.md](environment-configuration.md)
- **Docker Setup**: [docker-setup.md](docker-setup.md)
- **Platform Docs**: [PLATFORM_DOCUMENTATION.md](PLATFORM_DOCUMENTATION.md)

---

## 🆘 Common Commands

```bash
# Development
npm run docker:dev              # Start dev environment
npm run docker:dev:build        # Rebuild and start
npm run docker:dev:down         # Stop dev environment

# Production
npm run docker:prod             # Start prod environment
npm run docker:prod:build       # Rebuild and start
npm run docker:prod:down        # Stop prod environment

# Utilities
npm run docker:logs             # View logs
npm run docker:clean            # Clean up everything
docker-compose ps               # Check status
```

---

## 🎉 You're All Set!

Your environment workflow is now configured:
- ✅ Automatic environment detection
- ✅ Separate dev/prod configurations
- ✅ Docker-optimized builds
- ✅ Production deployment ready
- ✅ Health monitoring enabled

**Start developing:**
```bash
npm run docker:dev
```

**Questions?** Check the full documentation at [docs/environment-configuration.md](environment-configuration.md)
