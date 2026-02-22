# 🎯 Environment Configuration - Quick Reference

## ✅ Implementation Complete

Your project now uses **`env.config.js`** to automatically load the correct environment file based on `NODE_ENV`.

---

## 📁 Current Environment Files

| File | Git Tracked | Purpose |
|------|-------------|---------|
| `.env.development` | ✅ Yes | Development configuration (with dev API keys) |
| `.env.example` | ✅ Yes | Template for reference |
| `.env.production.example` | ✅ Yes | Production template |
| `.env.production` | ❌ NO | **Create this for production** (NOT tracked) |

### ❌ Removed Files
- `.env` - Deleted (redundant)
- `.env.local` - Deleted (conflicts with workflow)
- `.env.local.backup.*` - Deleted (old backup)

---

## 🔄 How It Works Now

### 1. **Instrumentation Hook** (`src/instrumentation.ts`)
```typescript
// Runs BEFORE any code in your app
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    require('../env.config.js');  // Loads env based on NODE_ENV
  }
}
```

### 2. **Environment Loader** (`env.config.js`)
```javascript
// Automatically selects:
// - .env.development when NODE_ENV=development
// - .env.production when NODE_ENV=production
```

### 3. **Next.js Config** (`next.config.ts`)
```typescript
experimental: {
  instrumentationHook: true,  // Enables the hook
}
```

---

## 🚀 Usage

### Local Development
```bash
# Uses .env.development automatically
npm run dev

# Or explicitly
NODE_ENV=development npm run dev
```

**Console output:**
```
✅ Loading environment from: .env.development
📦 Environment: development
🔧 Environment configuration loaded via instrumentation hook
```

### Docker Development
```bash
# Uses .env.development (via docker-compose.dev.yml)
npm run docker:dev
```

### Production Build
```bash
# First, create .env.production from template
cp .env.production.example .env.production

# Edit with real production credentials
nano .env.production

# Run production
NODE_ENV=production npm run start
```

### Docker Production
```bash
# Ensure .env.production exists with real credentials
npm run docker:prod
```

---

## ⚙️ Environment Variables

### Development (`.env.development`)
```bash
NODE_ENV=development
MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin
OPENAI_API_KEY=sk-proj-... (development key)
SERPER_API_KEY=643a9c... (development key)
JWT_SECRET=dev-jwt-secret-change-in-production
```

### Production (`.env.production`) - **YOU NEED TO CREATE THIS**
```bash
# Copy from example
cp .env.production.example .env.production

# Then update with:
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/inclusive  # Real Atlas
OPENAI_API_KEY=sk-proj-...  # Production key
JWT_SECRET=<strong-random-secret>  # Generate: openssl rand -base64 32
```

---

## 🔍 Verification

### Check which environment is loaded:
```bash
# Start dev server and look for console output
npm run dev

# You should see:
# ✅ Loading environment from: .env.development
# 📦 Environment: development
```

### Test environment selection:
```bash
# Development
NODE_ENV=development node -e "require('./env.config.js'); console.log('MONGO_URI:', process.env.MONGO_URI)"

# Production (after creating .env.production)
NODE_ENV=production node -e "require('./env.config.js'); console.log('MONGO_URI:', process.env.MONGO_URI)"
```

---

## 🐛 Troubleshooting

### Environment not loading
```bash
# Check NODE_ENV
echo $NODE_ENV

# Verify files exist
ls -la .env.development .env.production

# Check instrumentation is enabled
grep -A2 "experimental" next.config.ts
```

### Wrong environment loaded
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Missing variables
```bash
# Check what's loaded
NODE_ENV=development node -e "require('./env.config.js'); console.log(process.env)" | grep -E "(MONGO_URI|OPENAI_API_KEY)"
```

---

## 📊 Environment Flow

```
┌─────────────────────────────────────────────┐
│  Next.js starts                             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  src/instrumentation.ts register() runs     │
│  BEFORE any other code                      │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  env.config.js loads                        │
│  Reads NODE_ENV → loads .env.{NODE_ENV}     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  process.env populated with variables       │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  Backend files use process.env              │
│  • src/lib/db.ts                            │
│  • src/lib/optimizedPipeline.ts            │
│  • src/app/api/*                            │
└─────────────────────────────────────────────┘
```

---

## ✨ Benefits

1. **Single Source of Truth** - One mechanism for all environments
2. **Clean Separation** - Development vs Production configs
3. **Git Safe** - Production secrets never committed
4. **Docker Compatible** - Works with docker-compose env_file
5. **Explicit Control** - Know exactly which .env file is loaded

---

## 🎯 Next Steps

### For Development (Ready to Use!)
```bash
npm run dev  # ✅ Uses .env.development
```

### For Production (Setup Required)
```bash
# 1. Create production env file
cp .env.production.example .env.production

# 2. Edit with real credentials
nano .env.production

# 3. Verify it's gitignored
git check-ignore .env.production  # Should output: .env.production

# 4. Deploy
NODE_ENV=production npm run start
# OR
npm run docker:prod
```

---

## 📚 Related Documentation

- **Full Guide**: [docs/environment-configuration.md](docs/environment-configuration.md)
- **Docker Setup**: [docs/docker-setup.md](docs/docker-setup.md)
- **Next.js Instrumentation**: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

---

**Last Updated**: 2026-02-22
**Status**: ✅ Implemented and Ready
