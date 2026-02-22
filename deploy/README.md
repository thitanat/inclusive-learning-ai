# 🚀 Inclusive Learning AI - Deployment Guide

Automated deployment system for the Inclusive Learning AI platform using Docker, SSH multiplexing, and optional VPN connectivity.

---

## 📁 Directory Structure

```
deploy/
├── config.sh.example   # Configuration template (copy to config.sh)
├── config.sh           # Actual credentials (GITIGNORED - never commit!)
├── deploy.sh           # Main deployment orchestration script
├── vpn-connect.sh      # VPN connection manager
└── README.md           # This file
```

---

## 🔧 Quick Start

### 1. Initial Setup

```bash
# Navigate to deploy directory
cd deploy/

# Copy configuration template
cp config.sh.example config.sh

# Edit configuration with your credentials
nano config.sh  # or use your preferred editor
```

### 2. Configure Your Deployment

Edit `config.sh` and fill in:

**Required:**
- `SERVER_HOST` - Your remote server IP or domain
- `SERVER_USER` - SSH username
- `SERVER_PASSWORD` - SSH password (or leave empty if using SSH keys)
- `REPO` - GitHub repository in format `owner/repo-name`
- `REPO_BRANCH` - Branch to deploy (e.g., `main`, `production`)

**GitHub Authentication (for private repositories):**
- `GITHUB_TOKEN` - Personal Access Token (leave empty for public repos)

**Optional (VPN):**
- Set `VPN_SKIP=true` if you don't need VPN
- Otherwise configure VPN credentials

### 3. Setup GitHub Authentication (for Private Repos)

#### **Generate Personal Access Token**

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens)
2. Click **"Generate new token (classic)"**
3. Give it a descriptive name (e.g., "Inclusive Learning AI Deployment")
4. Select scopes:
   - ✅ **repo** (Full control of private repositories)
5. Click **"Generate token"**
6. Copy the token (you won't see it again!)
7. Add to `config.sh`:
   ```bash
   GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
   REPO="your-username/inclusive-learning-ai"
   REPO_BRANCH="main"
   ```

#### **Public Repositories**
For public repositories, simply leave `GITHUB_TOKEN` empty:
```bash
GITHUB_TOKEN=""
REPO="your-username/inclusive-learning-ai"
REPO_BRANCH="main"
```

### 4. Make Scripts Executable

```bash
chmod +x deploy.sh vpn-connect.sh
```

### 5. Deploy!

```bash
# First-time deployment
./deploy.sh init

# Subsequent updates
./deploy.sh update
```

---

## 📚 Available Commands

### Deployment Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `./deploy.sh init` | **First-time deployment** | Initial setup - clones repo, builds images, starts containers |
| `./deploy.sh update` | **Update deployment** | Pull latest code, rebuild, and restart with zero downtime |
| `./deploy.sh restart` | **Restart containers** | Restart without pulling new code or rebuilding |
| `./deploy.sh start` | **Start containers** | Start stopped containers |
| `./deploy.sh stop` | **Stop containers** | Stop all running containers |
| `./deploy.sh status` | **Show status** | Display current deployment status |
| `./deploy.sh logs` | **View all logs** | Stream logs from all services |
| `./deploy.sh logs app` | **View service logs** | Stream logs from specific service |
| `./deploy.sh rollback` | **Rollback** | Revert to previous Git commit |
| `./deploy.sh cleanup` | **Cleanup Docker** | Remove unused images, containers, volumes |

### VPN Commands (Standalone)

```bash
# Connect to VPN manually
./vpn-connect.sh connect

# Check VPN status
./vpn-connect.sh status

# Disconnect from VPN
./vpn-connect.sh disconnect
```

---

## 🔄 Typical Workflows

### First-Time Deployment

```bash
./deploy.sh init
```

**What happens:**
1. ✅ Connects to VPN (if configured)
2. ✅ Establishes SSH connection with multiplexing
3. ✅ Checks and installs Docker (if needed)
4. ✅ Clones your Git repository
5. ✅ Uploads `.env.production` file
6. ✅ Builds Docker images
7. ✅ Starts containers
8. ✅ Performs health check
9. ✅ **Prompts for MongoDB Atlas migration** (interactive)
10. ✅ Shows deployment status

**MongoDB Atlas Migration:**
During first-time deployment, you'll be prompted:
```
Do you want to migrate data from MongoDB Atlas to Docker?
This will:
  • Restore existing backup from atlas-backup directory
  • Import data into the Docker MongoDB container
  • Preserve all users, sessions, and finetune data

Run Atlas migration? [y/n]:
```

- **Choose `y`** - Migrates your data from `atlas-backup/` to Docker MongoDB
- **Choose `n`** - Skips migration (you can run it later manually)

**Prerequisites for Migration:**
- Ensure `atlas-backup/` directory exists in your project root
- Should contain MongoDB backup files (.bson and .metadata.json)
- Migration script will be uploaded and executed on the server

### Regular Updates

```bash
./deploy.sh update
```

**What happens:**
1. ✅ Pulls latest code from Git
2. ✅ Uploads updated `.env.production`
3. ✅ Rebuilds Docker images
4. ✅ Restarts containers with zero downtime
5. ✅ Performs health check
6. ✅ Shows deployment status

### Emergency Rollback

```bash
./deploy.sh rollback
```

**What happens:**
1. ✅ Reverts Git to previous commit
2. ✅ Rebuilds from previous code
3. ✅ Restarts containers
4. ✅ Performs health check

### View Live Logs

```bash
# All services
./deploy.sh logs

# Specific service
./deploy.sh logs app
./deploy.sh logs mongodb

# Exit logs: Ctrl+C
```

### Manual MongoDB Atlas Migration

If you skipped the migration during initial deployment, you can run it manually later:

**On the remote server:**
```bash
# SSH into your server
ssh user@your-server

# Navigate to deployment directory
cd /var/www/inclusive-learning-ai  # or your SERVER_DEPLOY_PATH

# Run migration script
./migrate-atlas-to-docker.sh
```

**Prerequisites:**
- Containers must be running (`docker compose ps`)
- `atlas-backup/` directory must exist with backup files
- Migration script must be executable (`chmod +x migrate-atlas-to-docker.sh`)

**What gets migrated:**
- 👤 Users collection
- 📝 Sessions collection  
- 🎯 Finetune data collection
- 📊 All indexes and metadata

---

## 🔐 Security Best Practices

### ⚠️ Critical: Credential Security

```bash
# ✅ DO:
chmod 600 config.sh                    # Restrict file permissions
git status                             # Verify config.sh is not tracked
echo "deploy/config.sh" >> .gitignore  # Ensure it's ignored

# ❌ DON'T:
git add deploy/config.sh               # NEVER commit credentials
chmod 777 config.sh                    # NEVER make it world-readable
```

### SSH Authentication Options

**Option 1: Password Authentication** (Easier setup)
```bash
SERVER_PASSWORD="your_password"
```

**Option 2: SSH Key Authentication** (More secure)
```bash
# Leave SERVER_PASSWORD empty
SERVER_PASSWORD=""

# Setup SSH key on your local machine
ssh-copy-id -p $SERVER_PORT $SERVER_USER@$SERVER_HOST
```

### VPN Security

- VPN credentials are only in memory during deployment
- `SUDO_PASSWORD` is used for local VPN connection only
- VPN automatically disconnects on script exit

### GitHub Token Security

**🔐 Token Protection:**
```bash
# ✅ DO:
# - Store token only in config.sh (which is gitignored)
# - Use fine-grained tokens with minimal required scopes
# - Set token expiration dates
# - Rotate tokens regularly

# ❌ DON'T:
# - Never commit tokens to Git
# - Never share tokens in plain text
# - Never use tokens in URLs that get logged
```

**Token Scopes Required:**
- **Public repos**: No token needed
- **Private repos**: `repo` scope (Full control of private repositories)

**Token Security Features:**
- ✅ Tokens are not exposed in deployment logs
- ✅ Git output is filtered to hide authentication URLs
- ✅ Tokens are used only for clone/pull operations
- ✅ Repository URLs display without tokens in logs

**Revoke Token If Compromised:**
1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Find the compromised token
3. Click **"Delete"** or **"Revoke"**
4. Generate a new token
5. Update `config.sh` with the new token

---

## 🎛️ Configuration Reference

### Server Configuration

```bash
SERVER_HOST="192.168.1.100"                        # Server IP or hostname
SERVER_USER="deploy"                               # SSH username
SERVER_PASSWORD="secure_password"                  # SSH password (or empty for keys)
SERVER_PORT="22"                                   # SSH port
SERVER_DEPLOY_PATH="/var/www/inclusive-learning"  # Deployment directory
```

### VPN Configuration

```bash
VPN_SKIP=false                          # Set true to skip VPN
VPN_HOST="vpn.company.com"              # VPN server
VPN_USERNAME="vpn_user"                 # VPN username
VPN_PASSWORD="vpn_pass"                 # VPN password
VPN_PROTOCOL="openconnect"              # openconnect or openvpn
SUDO_PASSWORD="local_sudo_pass"         # For local VPN connection
```

### Repository Configuration

```bash
# GitHub Personal Access Token (leave empty for public repos)
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"

# Repository in format: owner/repository-name
REPO="username/inclusive-learning-ai"

# Branch to deploy
REPO_BRANCH="main"                      # or "production", "staging", etc.
```

### Docker Configuration

```bash
DOCKER_COMPOSE_FILES="-f docker-compose.yml -f docker-compose.prod.yml"
CONTAINER_NAME="inclusive-app"
APP_PORT="3000"
MONGODB_PORT="27017"
```

### Health Check Configuration

```bash
DEPLOY_TIMEOUT=600                      # Max deployment time (seconds)
HEALTH_CHECK_RETRIES=30                 # Number of health check attempts
HEALTH_CHECK_INTERVAL=2                 # Seconds between checks
```

---

## 🏗️ Architecture Overview

### SSH Connection Multiplexing

**How it works:**
- Creates a single persistent SSH connection
- All subsequent commands reuse this connection
- Dramatically faster than repeated SSH connections
- Automatically cleaned up on script exit

**Benefits:**
- ⚡ **10x faster** subsequent commands
- 🔐 Single authentication
- 💾 Lower resource usage

### Password Management

<table>
<tr>
<th>Password Type</th>
<th>Purpose</th>
<th>When Used</th>
</tr>
<tr>
<td><code>SERVER_PASSWORD</code></td>
<td>SSH authentication</td>
<td>All remote commands</td>
</tr>
<tr>
<td><code>SUDO_PASSWORD</code></td>
<td>Local sudo for VPN</td>
<td>VPN connection only</td>
</tr>
<tr>
<td><code>VPN_PASSWORD</code></td>
<td>VPN authentication</td>
<td>VPN connection only</td>
</tr>
</table>

### Deployment Flow

```
┌──────────────┐
│  Start       │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Connect VPN  │ (optional)
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ SSH Multiplexing │
└──────┬───────────┘
       │
       ▼
┌──────────────┐
│ Git Pull     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Upload .env  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Docker Build │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Docker Up    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Health Check │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Cleanup      │
└──────────────┘
```

---

## 🐛 Troubleshooting

### SSH Connection Issues

```bash
# Problem: Permission denied
# Solution: Check credentials in config.sh

# Problem: Host key verification failed
# Solution: Script uses StrictHostKeyChecking=no (in VPN/trusted networks)

# Problem: Connection timeout
# Solution: Check VPN connection or server firewall
```

### VPN Connection Issues

```bash
# Check VPN status
./vpn-connect.sh status

# Manual VPN connection
./vpn-connect.sh connect

# Install VPN client (macOS)
brew install openconnect

# Install VPN client (Linux)
sudo apt-get install openconnect
```

### Docker Issues

```bash
# View container status
./deploy.sh status

# View detailed logs
./deploy.sh logs

# Check specific service
./deploy.sh logs mongodb

# Cleanup and rebuild
./deploy.sh cleanup
./deploy.sh update
```

### Health Check Failures

```bash
# Check application logs
./deploy.sh logs app

# Verify environment variables
ssh $SERVER_USER@$SERVER_HOST "cat $SERVER_DEPLOY_PATH/.env.production"

# Manual container inspection
ssh $SERVER_USER@$SERVER_HOST
cd $SERVER_DEPLOY_PATH
docker compose ps
docker compose logs app
```

---

## 📊 Command Reference Matrix

| Command | VPN | SSH | Git Pull | Env Upload | Rebuild | Restart | Health Check |
|---------|-----|-----|----------|------------|---------|---------|--------------|
| `init`    | ✅ | ✅ | Clone    | ✅        | ✅     | ✅      | ✅          |
| `update`  | ✅ | ✅ | ✅      | ✅        | ✅     | ✅      | ✅          |
| `restart` | ✅ | ✅ | ❌      | ❌        | ❌     | ✅      | ✅          |
| `start`   | ✅ | ✅ | ❌      | ❌        | ❌     | ✅      | ✅          |
| `stop`    | ✅ | ✅ | ❌      | ❌        | ❌     | ❌      | ❌          |
| `logs`    | ✅ | ✅ | ❌      | ❌        | ❌     | ❌      | ❌          |
| `status`  | ✅ | ✅ | ❌      | ❌        | ❌     | ❌      | ❌          |
| `rollback`| ✅ | ✅ | Revert  | ❌        | ✅     | ✅      | ✅          |
| `cleanup` | ✅ | ✅ | ❌      | ❌        | ❌     | ❌      | ❌          |

---

## 🌍 Environment File Management

The deployment script automatically uploads your local `.env.production` file to the server. This ensures:

- ✅ Environment variables stay in sync
- ✅ Secrets are not in Git repository
- ✅ Different environments have different configs

**Important:** Always keep `.env.production` updated locally before deploying!

---

## 🔄 Zero-Downtime Deployments

The `update` command uses `docker compose up -d --force-recreate` which:

1. Builds new images
2. Starts new containers
3. Switches traffic to new containers
4. Removes old containers

This provides **zero-downtime updates** for your application.

---

## 📝 Best Practices

### Before Deploying

- [ ] Test changes locally
- [ ] Update `.env.production` if needed
- [ ] Commit and push code to Git
- [ ] Review recent commits
- [ ] Check deployment status

### During Deployment

- [ ] Monitor logs: `./deploy.sh logs`
- [ ] Check health status
- [ ] Verify functionality
- [ ] Test critical features

### After Deployment

- [ ] Verify application is running
- [ ] Check logs for errors
- [ ] Test user-facing features
- [ ] Monitor for issues
- [ ] Keep rollback option ready

### Emergency Procedures

```bash
# Quick rollback
./deploy.sh rollback

# Stop everything
./deploy.sh stop

# View logs to diagnose
./deploy.sh logs
```

---

## 🎯 Customization for Other Projects

To adapt this deployment system for other projects:

1. **Update `config.sh`:**
   - Server credentials (`SERVER_HOST`, `SERVER_USER`, `SERVER_PASSWORD`)
   - GitHub token (`GITHUB_TOKEN`) - if private repository
   - Repository path (`REPO`) - in format `owner/repo-name`
   - Branch name (`REPO_BRANCH`)
   - Docker Compose files (`DOCKER_COMPOSE_FILES`)
   - Application ports (`APP_PORT`, `MONGODB_PORT`)

2. **Modify Health Check:**
   - Edit `health_check()` function in `deploy.sh`
   - Update health endpoint URL

3. **Adjust Docker Commands:**
   - Modify `DOCKER_COMPOSE_FILES` variable
   - Update service names

4. **Custom Deployment Steps:**
   - Add functions in `deploy.sh`
   - Insert steps in deployment workflow

---

## 📞 Support

For issues or questions:

1. Check logs: `./deploy.sh logs`
2. Verify configuration: `cat config.sh`
3. Test VPN: `./vpn-connect.sh status`
4. Check server access: `ssh $SERVER_USER@$SERVER_HOST`

---

## 📄 License

This deployment system is part of the Inclusive Learning AI project.

---

**Happy Deploying! 🚀**
