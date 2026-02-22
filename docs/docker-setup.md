# Docker Setup Guide
## Inclusive Learning AI Platform

This guide provides detailed instructions for setting up and managing the MongoDB Docker container for local development.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Docker Compose Configuration](#docker-compose-configuration)
3. [Environment Variables](#environment-variables)
4. [MongoDB Initialization](#mongodb-initialization)
5. [Common Commands](#common-commands)
6. [Troubleshooting](#troubleshooting)
7. [Production Considerations](#production-considerations)

---

## 🚀 Quick Start

### Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Node.js 20+ for running the Next.js application

### 5-Minute Setup

```bash
# 1. Create environment file
cp .env.example .env.local

# 2. Edit .env.local with your API keys (required)
# - OPENAI_API_KEY
# - PINECONE_API_KEY
# - JWT_SECRET
# - Optionally change MONGO_ROOT_PASSWORD

# 3. Start MongoDB
docker-compose up -d mongodb

# 4. Verify MongoDB is running
docker ps | grep mongodb

# 5. Install dependencies
npm install

# 6. Run the application
npm run dev

# 7. Open http://localhost:3005
```

---

## 🐋 Docker Compose Configuration

### Services

#### MongoDB Service
- **Image:** `mongo:6.0` (matches production MongoDB 6.x series)
- **Container Name:** `inclusive-learning-mongodb`
- **Port:** `27017` (mapped to host)
- **Restart Policy:** `unless-stopped` (auto-restart on system boot)
- **Volumes:**
  - `mongodb_data` - Database files (persistent)
  - `mongodb_config` - Configuration files
  - `./mongo-init` - Initialization scripts (read-only)
- **Network:** `inclusive-network` (isolated network)
- **Health Check:** Ping database every 10 seconds

### Architecture

```
Host Machine (localhost:27017)
    ↓
Docker Network (inclusive-network)
    ↓
MongoDB Container (port 27017)
    ↓
Persistent Volumes
    ├── mongodb_data (database files)
    └── mongodb_config (config files)
```

---

## 🔐 Environment Variables

### Required Variables

```env
# MongoDB Configuration
MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin
MONGO_ROOT_PASSWORD=inclusive_admin_2026  # Change in production!

# AI Services (REQUIRED)
OPENAI_API_KEY=sk-your-key-here
PINECONE_API_KEY=your-pinecone-key
JWT_SECRET=your-secure-secret-change-this

# Optional
SERPER_API_KEY=your-serper-key  # For web search
```

### Connection String Breakdown

```
mongodb://       - Protocol
admin:password@  - Username and password
localhost:27017  - Host and port
/inclusive       - Database name
?authSource=admin - Authentication database
```

### For Production

```bash
# Generate secure JWT secret
openssl rand -base64 32

# Use strong passwords
MONGO_ROOT_PASSWORD=$(openssl rand -base64 24)
```

---

## 📊 MongoDB Initialization

The `mongo-init/01-init.js` script runs automatically on first container startup.

### What It Creates

1. **Database:** `inclusive`
2. **Collections:**
   - `users` - User accounts and authentication
   - `sessions` - Lesson planning sessions
   - `finetune_data` - AI feedback data

3. **Indexes:**
   - **users:**
     - Unique index on `email`
     - Index on `createdAt` (sorting)
   - **sessions:**
     - Compound index on `userId` + `createdAt`
     - Compound index on `subject` + `level`
     - Text index on `lessonTopic` (search)
   - **finetune_data:**
     - Compound index on `userId` + `timestamp`
     - Index on `metadata.qualityLabel`
     - Index on `feedback.overallScore`

### Verify Initialization

```bash
# Check logs
docker logs inclusive-learning-mongodb | grep "initialization"

# List collections
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "db.getCollectionNames()"

# Check indexes on users collection
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "db.users.getIndexes()"
```

---

## 🛠️ Common Commands

### Container Management

```bash
# Start MongoDB (background)
docker-compose up -d mongodb

# Start and view logs
docker-compose up mongodb

# Stop MongoDB
docker-compose stop mongodb

# Restart MongoDB
docker-compose restart mongodb

# Remove container (keeps data)
docker-compose rm -f mongodb

# Remove container and volumes (⚠️ DELETES ALL DATA)
docker-compose down -v
```

### Monitoring

```bash
# View live logs
docker logs -f inclusive-learning-mongodb

# Check container status
docker ps -a | grep mongodb

# View resource usage
docker stats inclusive-learning-mongodb

# Check health status
docker inspect inclusive-learning-mongodb | grep -A 10 Health
```

### Database Access

```bash
# MongoDB Shell (mongosh)
docker exec -it inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin

# Quick queries
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "db.users.countDocuments()"

docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "db.sessions.find().limit(1).pretty()"
```

### Backup & Restore

```bash
# Backup entire database
docker exec inclusive-learning-mongodb mongodump \
  -u admin -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --db inclusive \
  --out /data/backup

# Copy backup to host
docker cp inclusive-learning-mongodb:/data/backup ./backup-$(date +%Y%m%d)

# Restore from backup
docker cp ./backup-20260222 inclusive-learning-mongodb:/data/restore
docker exec inclusive-learning-mongodb mongorestore \
  -u admin -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --db inclusive \
  /data/restore/inclusive

# Export specific collection to JSON
docker exec inclusive-learning-mongodb mongoexport \
  -u admin -p inclusive_admin_2026 \
  --authenticationDatabase admin \
  --db inclusive \
  --collection users \
  --out /data/users.json

docker cp inclusive-learning-mongodb:/data/users.json ./users.json
```

---

## 🔧 Troubleshooting

### MongoDB Won't Start

**Check if port 27017 is already in use:**
```bash
lsof -i :27017
# If in use, kill the process or change the port in docker-compose.yml
```

**Check Docker logs:**
```bash
docker logs inclusive-learning-mongodb
```

**Remove and recreate container:**
```bash
docker-compose down
docker-compose up -d mongodb
```

### Connection Refused

**Verify MongoDB is running:**
```bash
docker ps | grep mongodb
```

**Check if healthcheck passes:**
```bash
docker inspect inclusive-learning-mongodb | grep -A 5 Health
```

**Test connection from host:**
```bash
mongosh "mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin"
```

### Application Can't Connect

**Check MONGO_URI in .env.local:**
```env
# Must match Docker password
MONGO_URI=mongodb://admin:inclusive_admin_2026@localhost:27017/inclusive?authSource=admin
```

**Verify from inside the app:**
```bash
# Start app in debug mode
DEBUG=* npm run dev
```

### Data Not Persisting

**Check volumes:**
```bash
docker volume ls | grep mongodb
docker volume inspect inclusive-learning-ai_mongodb_data
```

**Ensure you're not using `-v` flag when stopping:**
```bash
# ❌ Wrong (deletes volumes)
docker-compose down -v

# ✅ Correct (keeps data)
docker-compose stop
```

### Permission Errors

**Fix ownership (Linux/macOS):**
```bash
sudo chown -R $(id -u):$(id -g) ./mongo-init
```

### Indexes Not Created

**Re-run init script:**
```bash
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin < mongo-init/01-init.js
```

**Manually create indexes:**
```bash
docker exec inclusive-learning-mongodb mongosh -u admin -p inclusive_admin_2026 --authenticationDatabase admin inclusive --eval "db.users.createIndex({email: 1}, {unique: true})"
```

---

## 🚀 Production Considerations

### Security

1. **Change default password:**
   ```env
   MONGO_ROOT_PASSWORD=$(openssl rand -base64 24)
   ```

2. **Use secrets management:**
   - Docker Secrets
   - Kubernetes Secrets
   - AWS Secrets Manager
   - Azure Key Vault

3. **Enable SSL/TLS:**
   ```yaml
   command: --tlsMode requireTLS --tlsCertificateKeyFile /etc/ssl/mongodb.pem
   ```

4. **Restrict network access:**
   ```yaml
   ports:
     - "127.0.0.1:27017:27017"  # Only localhost
   ```

### Performance

1. **Adjust WiredTiger cache:**
   ```yaml
   command: --wiredTigerCacheSizeGB 4  # 50% of available RAM
   ```

2. **Enable oplog for replication:**
   ```yaml
   command: --replSet rs0 --oplogSize 100
   ```

3. **Mount volumes on SSD:**
   ```yaml
   volumes:
     mongodb_data:
       driver: local
       driver_opts:
         type: none
         o: bind
         device: /mnt/fast-ssd/mongodb
   ```

### Backup Strategy

1. **Automated daily backups:**
   ```bash
   # Add to crontab
   0 2 * * * docker exec inclusive-learning-mongodb mongodump -u admin -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin --out /data/backup/$(date +\%Y\%m\%d)
   ```

2. **Retention policy:**
   ```bash
   # Keep last 7 days
   find /backup -type d -mtime +7 -exec rm -rf {} \;
   ```

3. **Off-site backup:**
   ```bash
   # Sync to S3
   aws s3 sync ./backup s3://inclusive-learning-backups/mongodb/
   ```

### Monitoring

1. **Enable MongoDB monitoring:**
   ```yaml
   environment:
     - MONGODB_ENABLE_MONITORING=true
   ```

2. **Use MongoDB Compass for GUI:**
   ```
   Connection String: mongodb://admin:password@localhost:27017/?authSource=admin
   ```

3. **Prometheus metrics:**
   - Use `mongodb_exporter` sidecar container

### High Availability

For production, consider:
- MongoDB Replica Set (3+ nodes)
- Sharding for massive scale
- Managed services (MongoDB Atlas, AWS DocumentDB)

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. View container logs: `docker logs inclusive-learning-mongodb`
3. Verify environment configuration
4. Test MongoDB connection directly
5. Check Docker Desktop dashboard for resource limits

---

**Last Updated:** February 22, 2026  
**MongoDB Version:** 6.0  
**Docker Compose Version:** 3.8
