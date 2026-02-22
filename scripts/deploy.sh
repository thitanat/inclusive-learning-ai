#!/bin/bash
# ====================================
# Production Deployment Script
# ====================================
# Deploys the Inclusive Learning AI Platform to a remote server
# 
# Usage:
#   ./deploy.sh [server-address]
#
# Example:
#   ./deploy.sh user@production-server.com
#
# Prerequisites:
# - SSH access to production server
# - .env.production file configured locally
# - Docker and Docker Compose installed on remote server
# ====================================

set -e  # Exit on any error

# Configuration
REMOTE_SERVER="${1:-user@production-server.com}"
REMOTE_PATH="/opt/inclusive-learning-ai"
ENV_FILE=".env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env.production file not found!"
        log_info "Please create .env.production from .env.production.example"
        exit 1
    fi
    
    log_info "Prerequisites check passed ✓"
}

# Create deployment package
create_package() {
    log_info "Creating deployment package..."
    
    # Create temporary directory
    TMP_DIR=$(mktemp -d)
    
    # Copy necessary files
    rsync -av \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.git' \
        --exclude 'atlas-backup' \
        --exclude 'backups' \
        --exclude '*.log' \
        . "$TMP_DIR/"
    
    # Copy production env file
    cp "$ENV_FILE" "$TMP_DIR/.env.production"
    
    log_info "Package created at $TMP_DIR ✓"
    echo "$TMP_DIR"
}

# Upload to server
upload_to_server() {
    local package_dir=$1
    
    log_info "Uploading to $REMOTE_SERVER..."
    
    # Create remote directory if it doesn't exist
    ssh "$REMOTE_SERVER" "mkdir -p $REMOTE_PATH"
    
    # Sync files to server
    rsync -avz --delete \
        "$package_dir/" \
        "$REMOTE_SERVER:$REMOTE_PATH/"
    
    log_info "Upload complete ✓"
}

# Deploy on remote server
deploy_remote() {
    log_info "Deploying on remote server..."
    
    ssh "$REMOTE_SERVER" << 'ENDSSH'
        cd /opt/inclusive-learning-ai
        
        # Pull latest images and rebuild
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
        
        # Show status
        echo "==================================="
        echo "Deployment Status:"
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml ps
        echo "==================================="
ENDSSH
    
    log_info "Deployment complete ✓"
}

# Cleanup
cleanup() {
    if [ -n "$TMP_DIR" ] && [ -d "$TMP_DIR" ]; then
        rm -rf "$TMP_DIR"
        log_info "Cleaned up temporary files ✓"
    fi
}

# Main deployment flow
main() {
    log_info "Starting production deployment..."
    log_info "Target: $REMOTE_SERVER"
    echo ""
    
    check_prerequisites
    
    # Create package
    PACKAGE_DIR=$(create_package)
    
    # Set trap for cleanup
    trap cleanup EXIT
    
    # Upload to server
    upload_to_server "$PACKAGE_DIR"
    
    # Deploy
    deploy_remote
    
    echo ""
    log_info "🎉 Deployment successful!"
    log_info "Application should be running at: http://$(echo $REMOTE_SERVER | cut -d'@' -f2):3005"
}

# Run main function
main
