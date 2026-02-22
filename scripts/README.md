# Migration Scripts

## Automated Atlas to Docker Migration

### Quick Start

Run the automated migration script:

```bash
./scripts/migrate-atlas-to-docker.sh
```

Or provide your Atlas URI directly:

```bash
./scripts/migrate-atlas-to-docker.sh "mongodb+srv://username:password@cluster.mongodb.net/inclusive"
```

### What It Does

The script automatically handles:

✅ **Validation** - Checks all prerequisites (Docker, MongoDB tools)  
✅ **Export** - Downloads all data from Atlas  
✅ **Setup** - Starts Docker MongoDB container  
✅ **Import** - Imports data to Docker  
✅ **Verification** - Validates document counts and indexes  
✅ **Configuration** - Updates `.env.local` with new connection  

### Prerequisites

1. **Docker Desktop** - Must be running
   ```bash
   # Check: docker info should work
   docker info
   ```

2. **MongoDB Database Tools** - Required for mongodump/mongorestore
   
   **macOS:**
   ```bash
   brew install mongodb/brew/mongodb-database-tools
   ```
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get install mongodb-database-tools
   ```
   
   **Verify:**
   ```bash
   mongodump --version
   mongorestore --version
   ```

3. **MongoDB Atlas URI** - Your connection string with credentials
   ```
   Format: mongodb+srv://username:password@cluster.mongodb.net/inclusive
   ```

### Usage Examples

**Interactive mode** (script prompts for URI):
```bash
./scripts/migrate-atlas-to-docker.sh
```

**Direct mode** (provide URI as argument):
```bash
./scripts/migrate-atlas-to-docker.sh "your-atlas-uri-here"
```

**With quotes for special characters:**
```bash
./scripts/migrate-atlas-to-docker.sh "mongodb+srv://user:p@ssw0rd!@cluster.mongodb.net/inclusive"
```

### What Happens During Migration

1. **Prerequisite Check** (5 seconds)
   - Validates Docker is running
   - Checks MongoDB tools installed
   - Validates Atlas URI format

2. **Atlas Export** (1-5 minutes, depends on data size)
   - Creates `./atlas-backup` directory
   - Downloads all collections
   - Shows progress and file sizes

3. **Docker Setup** (30-60 seconds)
   - Starts MongoDB container
   - Waits for initialization
   - Verifies connection

4. **Data Import** (1-5 minutes)
   - Imports all collections
   - Recreates indexes
   - Shows document counts

5. **Verification** (10 seconds)
   - Counts documents per collection
   - Lists all indexes
   - Spot-checks data

6. **Configuration Update** (5 seconds)
   - Backs up existing `.env.local`
   - Updates MongoDB URI to Docker
   - Preserves other environment variables

### After Migration

**Test your application:**
```bash
npm run dev
# Visit http://localhost:3005
```

**Verify data:**
```bash
# Access MongoDB shell
docker exec -it inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  inclusive

# Check collections
show collections
db.users.countDocuments()
db.sessions.countDocuments()
```

**Manage Docker MongoDB:**
```bash
# View logs
docker logs inclusive-learning-mongodb

# Stop database
docker-compose stop mongodb

# Start database
docker-compose start mongodb

# Restart database
docker-compose restart mongodb

# Remove completely
docker-compose down -v mongodb
```

### Troubleshooting

**"mongodump: command not found"**
```bash
# Install MongoDB tools
brew install mongodb/brew/mongodb-database-tools  # macOS
```

**"Cannot connect to Docker daemon"**
```bash
# Start Docker Desktop application
# Wait for it to fully start, then retry
```

**"Authentication failed" during export**
```bash
# Check your Atlas URI has correct credentials
# Format: mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/inclusive
# Ensure special characters in password are URL-encoded
```

**"Container already exists"**
```bash
# Script will prompt to remove and recreate
# Or manually remove first:
docker-compose down -v mongodb
./scripts/migrate-atlas-to-docker.sh
```

**Migration succeeded but app can't connect**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Rollback to Atlas

If you need to rollback:

1. Stop Docker MongoDB:
   ```bash
   docker-compose stop mongodb
   ```

2. Restore `.env.local` from backup:
   ```bash
   # Find backup file
   ls -la .env.local.backup.*
   
   # Restore it
   cp .env.local.backup.YYYYMMDD_HHMMSS .env.local
   ```

3. Restart application:
   ```bash
   npm run dev
   ```

### Safety Features

The script includes several safety checks:

- ✅ Validates prerequisites before starting
- ✅ Backs up `.env.local` before modifying
- ✅ Confirms before proceeding with migration
- ✅ Asks before removing existing container
- ✅ Asks before deleting backup files
- ✅ Preserves Atlas backup in `./atlas-backup`

### Files Created/Modified

**Created:**
- `./atlas-backup/` - Atlas data export
- `.env.local.backup.*` - Backup of original config

**Modified:**
- `.env.local` - Updated with Docker MongoDB URI

### Getting Help

- **Full documentation:** [docs/atlas-to-docker-migration.md](../docs/atlas-to-docker-migration.md)
- **Docker setup guide:** [docs/docker-setup.md](../docs/docker-setup.md)
- **View script source:** [migrate-atlas-to-docker.sh](./migrate-atlas-to-docker.sh)

---

**Total Migration Time:** ~5-15 minutes (depending on data size)  
**Estimated Downtime:** ~30 seconds (configuration switch)
