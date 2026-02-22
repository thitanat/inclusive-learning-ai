# Migration Guide: MongoDB Atlas → Docker
## Inclusive Learning AI Platform

This guide walks you through migrating your data from MongoDB Atlas to a local Docker container.

---

## 📋 Overview

**Migration Steps:**
1. Export data from MongoDB Atlas
2. Set up Docker MongoDB container
3. Import data to Docker container
4. Update application configuration
5. Verify migration
6. (Optional) Decommission Atlas cluster

**Estimated Time:** 15-30 minutes  
**Downtime:** ~5 minutes (for configuration switch)

---

## ⚠️ Before You Start

### Prerequisites

- [ ] Docker Desktop installed and running
- [ ] MongoDB Database Tools installed (for mongodump/mongorestore)
- [ ] Access to MongoDB Atlas cluster
- [ ] Atlas connection string with credentials
- [ ] Sufficient disk space for data export

### Install MongoDB Tools

**macOS:**
```bash
brew install mongodb/brew/mongodb-database-tools
```

**Ubuntu/Debian:**
```bash
wget https://fastdl.mongodb.org/tools/db/mongodb-database-tools-ubuntu2204-x86_64-100.9.4.deb
sudo dpkg -i mongodb-database-tools-ubuntu2204-x86_64-100.9.4.deb
```

**Windows:**
```powershell
# Download from: https://www.mongodb.com/try/download/database-tools
# Install using the MSI installer
```

### Check Current Data Size

```bash
# Log into MongoDB Atlas
mongosh "mongodb+srv://your-cluster.mongodb.net/" --username your-user

# Check database size
use inclusive
db.stats(1024*1024)  // Size in MB
```

---

## 🔄 Migration Process

### Step 1: Export Data from MongoDB Atlas

```bash
# Create backup directory
mkdir -p ./atlas-backup
cd ./atlas-backup

# Export entire 'inclusive' database from Atlas
mongodump \
  --uri="mongodb+srv://username:password@your-cluster.mongodb.net/inclusive?retryWrites=true&w=majority" \
  --out=./

# Verify export
ls -lh ./inclusive/
# Should see: users.bson, sessions.bson, finetune_data.bson, and metadata.json files
```

**Expected Output:**
```
./inclusive/
├── finetune_data.bson
├── finetune_data.metadata.json
├── sessions.bson
├── sessions.metadata.json
├── users.bson
└── users.metadata.json
```

**Verify export size:**
```bash
du -sh ./inclusive/
# Example: 245M  ./inclusive/
```

---

### Step 2: Set Up Docker MongoDB

```bash
# Navigate to project root
cd /path/to/inclusive-learning-ai

# Ensure docker-compose.yml exists
cat docker-compose.yml

# Create/update .env.local with Docker connection
cat > .env.local << 'EOF'
# MongoDB Docker Configuration
MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin
MONGO_ROOT_PASSWORD=inclusive_admin_2026

# Your existing API keys
OPENAI_API_KEY=your-key-here
PINECONE_API_KEY=your-key-here
JWT_SECRET=your-secret-here
SERPER_API_KEY=your-key-here
EOF

# Start MongoDB container
docker-compose up -d mongodb

# Wait for initialization (30-60 seconds)
sleep 30

# Check MongoDB is running
docker ps | grep mongodb

# View initialization logs
docker logs inclusive-learning-mongodb
```

**Verify MongoDB is ready:**
```bash
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
```

Expected: `{ ok: 1 }`

---

### Step 3: Import Data to Docker

```bash
# Import data from backup
mongorestore \
  --uri="mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin" \
  --nsInclude="inclusive.*" \
  --drop \
  ./atlas-backup/inclusive/

# The --drop flag removes existing collections before importing
# The --nsInclude limits import to 'inclusive' database only
```

**Expected Output:**
```
preparing collections to restore from
reading metadata for inclusive.users from atlas-backup/inclusive/users.metadata.json
reading metadata for inclusive.sessions from atlas-backup/inclusive/sessions.metadata.json
reading metadata for inclusive.finetune_data from atlas-backup/inclusive/finetune_data.metadata.json
restoring inclusive.users from atlas-backup/inclusive/users.bson
restoring inclusive.sessions from atlas-backup/inclusive/sessions.bson
restoring inclusive.finetune_data from atlas-backup/inclusive/finetune_data.bson
145 document(s) restored successfully. 0 document(s) failed to restore.
523 document(s) restored successfully. 0 document(s) failed to restore.
89 document(s) restored successfully. 0 document(s) failed to restore.
```

---

### Step 4: Verify Import

```bash
# Check document counts
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  inclusive \
  --eval "
    print('Users:', db.users.countDocuments());
    print('Sessions:', db.sessions.countDocuments());
    print('Finetune Data:', db.finetune_data.countDocuments());
  "

# Compare with Atlas counts (should match)
mongosh "mongodb+srv://your-cluster.mongodb.net/inclusive" \
  --username your-user \
  --eval "
    print('Users:', db.users.countDocuments());
    print('Sessions:', db.sessions.countDocuments());
    print('Finetune Data:', db.finetune_data.countDocuments());
  "
```

**Verify indexes:**
```bash
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  inclusive \
  --eval "db.users.getIndexes()"

# Should show email_unique_idx and createdAt_idx
```

**Spot-check data integrity:**
```bash
# Query a sample user
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  inclusive \
  --eval "db.users.findOne()"

# Query a sample session
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  inclusive \
  --eval "db.sessions.findOne({}, {lessonTopic: 1, subject: 1, level: 1})"
```

---

### Step 5: Update Application Configuration

```bash
# Verify .env.local has correct Docker connection
cat .env.local | grep MONGO_URI

# Should be:
# MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin
```

**Test application connection:**
```bash
# Start Next.js app
npm run dev

# Check logs for successful connection
# Expected: "✅ Connected to Local MongoDB: inclusive"
```

---

### Step 6: Test Application Functionality

1. **Open Application:**
   ```
   http://localhost:3005
   ```

2. **Test Login:**
   - Use existing user credentials
   - Should successfully authenticate

3. **Load Existing Session:**
   - Navigate to session page
   - Click "Load Existing Session"
   - Verify old sessions appear

4. **Create New Session:**
   - Test creating a new lesson plan
   - Verify it saves to Docker MongoDB

5. **Verify Data Persistence:**
   ```bash
   # Stop and restart MongoDB
   docker-compose restart mongodb
   
   # Refresh app - data should persist
   ```

---

### Step 7: Clean Up Atlas (Optional)

**⚠️ Only after confirming migration success!**

```bash
# Create final backup from Docker (just in case)
docker exec inclusive-learning-mongodb mongodump \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --db inclusive \
  --out /data/final-backup

docker cp inclusive-learning-mongodb:/data/final-backup ./docker-backup-$(date +%Y%m%d)
```

**In MongoDB Atlas:**
1. Pause cluster (free tier - can resume later)
2. Or delete cluster (paid tier - saves costs)

---

## 🐛 Troubleshooting

### Import Fails with "Authentication Failed"

**Issue:** Wrong credentials or auth database

**Solution:**
```bash
# Verify password matches docker-compose.yml
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --eval "db.adminCommand('ping')"
```

### Document Count Mismatch

**Issue:** Partial import or filters

**Solution:**
```bash
# Re-run import without --drop to add missing documents
mongorestore \
  --uri="mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin" \
  --nsInclude="inclusive.*" \
  ./atlas-backup/inclusive/

# Or drop database and re-import fresh
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --eval "db.getSiblingDB('inclusive').dropDatabase()"

# Then re-import
mongorestore ...
```

### Application Still Using Atlas

**Issue:** Old environment variable cached

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev

# Check connection logs
```

### Indexes Missing

**Issue:** Indexes not imported or init script didn't run

**Solution:**
```bash
# Re-run init script
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin < mongo-init/01-init.js

# Or manually recreate
docker exec inclusive-learning-mongodb mongosh \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  inclusive \
  --eval "
    db.users.createIndex({email: 1}, {unique: true});
    db.sessions.createIndex({userId: 1, createdAt: -1});
  "
```

---

## 📊 Migration Checklist

Use this checklist to track progress:

- [ ] MongoDB Tools installed
- [ ] Atlas data exported with mongodump
- [ ] Export verified (files exist, size matches)
- [ ] Docker Compose file reviewed
- [ ] .env.local updated with Docker connection
- [ ] MongoDB container started
- [ ] Container health check passing
- [ ] Data imported with mongorestore
- [ ] Document counts match Atlas
- [ ] Indexes verified
- [ ] Sample data spot-checked
- [ ] Application started successfully
- [ ] Login functionality tested
- [ ] Existing sessions loaded
- [ ] New session creation works
- [ ] Data persists after container restart
- [ ] Final backup created
- [ ] Atlas cluster paused/deleted
- [ ] Team notified of migration

---

## 🔄 Rollback Plan

If migration fails and you need to rollback:

```bash
# 1. Stop Docker MongoDB
docker-compose stop mongodb

# 2. Update .env.local back to Atlas
MONGO_URI=mongodb+srv://your-cluster.mongodb.net/inclusive?retryWrites=true&w=majority

# 3. Restart application
npm run dev

# 4. Resume Atlas cluster if paused
```

---

## 📚 Post-Migration

### Set Up Automated Backups

```bash
# Create backup script
cat > scripts/backup-mongodb.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="./backups/mongodb/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

docker exec inclusive-learning-mongodb mongodump \
  -u admin \
  -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --db inclusive \
  --out /data/backup

docker cp inclusive-learning-mongodb:/data/backup "$BACKUP_DIR"
echo "Backup completed: $BACKUP_DIR"

# Keep only last 7 days
find ./backups/mongodb -type d -mtime +7 -exec rm -rf {} \;
EOF

chmod +x scripts/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /path/to/inclusive-learning-ai/scripts/backup-mongodb.sh
```

### Monitor Docker Resources

```bash
# View resource usage
docker stats inclusive-learning-mongodb

# If needed, adjust WiredTiger cache in docker-compose.yml
# command: --wiredTigerCacheSizeGB 2
```

### Update Documentation

Update your team's documentation with:
- New connection string format
- Docker management commands
- Backup procedures
- Rollback plan

---

## ✅ Success Criteria

Your migration is successful when:

✅ All data imported (matching document counts)  
✅ All indexes present  
✅ Application connects successfully  
✅ Users can log in  
✅ Sessions load correctly  
✅ New data can be created  
✅ Data persists after restarts  
✅ Performance is acceptable  
✅ Backups are automated  

---

**Migration completed successfully! 🎉**

You're now running MongoDB locally with Docker, which provides:
- Full control over your database
- No internet dependency
- Faster local development
- Cost savings (no Atlas fees for dev)
- Easy backup and restore

---

**Need Help?** Check [docs/docker-setup.md](./docker-setup.md) for troubleshooting.
