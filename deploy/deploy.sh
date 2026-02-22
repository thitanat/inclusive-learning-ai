#!/bin/bash

# ============================================================================
# Inclusive Learning AI - Deployment Script
# ============================================================================
# Main orchestration script for automated deployment
# ============================================================================

set -e  # Exit on error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load configuration
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo "❌ Error: config.sh not found."
    echo "Please copy config.sh.example to config.sh and configure it:"
    echo "  cp $SCRIPT_DIR/config.sh.example $SCRIPT_DIR/config.sh"
    exit 1
fi

# Load VPN connection manager
source "$SCRIPT_DIR/vpn-connect.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# SSH Control Socket
SSH_CONTROL_DIR="/tmp/deploy-ssh-$$"
SSH_CONTROL_PATH="$SSH_CONTROL_DIR/control-%r@%h:%p"

# ----------------------------------------------------------------------------
# Logging & Notifications
# ----------------------------------------------------------------------------
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${CYAN}▶️  $1${NC}"
}

# ----------------------------------------------------------------------------
# GitHub Repository URL Construction
# ----------------------------------------------------------------------------
get_repo_url() {
    if [ -n "$GITHUB_TOKEN" ]; then
        # HTTPS with token authentication (for private repos)
        echo "https://${GITHUB_TOKEN}@github.com/${REPO}.git"
    else
        # Public repository (no authentication)
        echo "https://github.com/${REPO}.git"
    fi
}

# Get repository URL without exposing token in logs
get_safe_repo_url() {
    echo "https://github.com/${REPO}.git"
}

# ----------------------------------------------------------------------------
# SSH Connection Multiplexing
# ----------------------------------------------------------------------------
setup_ssh_multiplexing() {
    log_step "Setting up SSH connection multiplexing..."
    
    # Create control directory
    mkdir -p "$SSH_CONTROL_DIR"
    
    # Check if sshpass is installed
    if ! command -v sshpass &> /dev/null; then
        log_warning "sshpass not found. Installing..."
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install hudochenkov/sshpass/sshpass
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            sudo apt-get update && sudo apt-get install -y sshpass
        fi
    fi
    
    # Create master SSH connection
    if [ -n "$SERVER_PASSWORD" ]; then
        # Using password authentication
        sshpass -p "$SERVER_PASSWORD" ssh \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlMaster=auto \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -o ControlPersist=600 \
            -p "$SERVER_PORT" \
            -N -f \
            "$SERVER_USER@$SERVER_HOST" 2>&1 | grep -v "Warning"
    else
        # Using SSH key authentication
        ssh \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlMaster=auto \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -o ControlPersist=600 \
            -p "$SERVER_PORT" \
            -N -f \
            "$SERVER_USER@$SERVER_HOST" 2>&1 | grep -v "Warning"
    fi
    
    if [ $? -eq 0 ]; then
        log_success "SSH multiplexing established"
    else
        log_error "Failed to establish SSH connection"
        exit 1
    fi
}

cleanup_ssh_multiplexing() {
    log_step "Cleaning up SSH connection..."
    
    if [ -d "$SSH_CONTROL_DIR" ]; then
        ssh -o ControlPath="$SSH_CONTROL_PATH" -O exit "$SERVER_USER@$SERVER_HOST" 2>/dev/null || true
        rm -rf "$SSH_CONTROL_DIR"
    fi
    
    log_success "SSH connection closed"
}

# ----------------------------------------------------------------------------
# Remote Command Execution
# ----------------------------------------------------------------------------
remote_exec() {
    local cmd="$1"
    local use_sudo="${2:-false}"
    
    if [ "$use_sudo" = "true" ]; then
        cmd="echo '$SERVER_PASSWORD' | sudo -S $cmd"
    fi
    
    if [ -n "$SERVER_PASSWORD" ]; then
        sshpass -p "$SERVER_PASSWORD" ssh \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -p "$SERVER_PORT" \
            "$SERVER_USER@$SERVER_HOST" \
            "$cmd" 2>&1 | grep -v "Warning"
    else
        ssh \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -p "$SERVER_PORT" \
            "$SERVER_USER@$SERVER_HOST" \
            "$cmd" 2>&1 | grep -v "Warning"
    fi
}

# ----------------------------------------------------------------------------
# File Upload
# ----------------------------------------------------------------------------
upload_file() {
    local local_file="$1"
    local remote_file="$2"
    
    log_step "Uploading $local_file to server..."
    
    if [ -n "$SERVER_PASSWORD" ]; then
        sshpass -p "$SERVER_PASSWORD" scp \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -P "$SERVER_PORT" \
            "$local_file" \
            "$SERVER_USER@$SERVER_HOST:$remote_file" 2>&1 | grep -v "Warning"
    else
        scp \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -P "$SERVER_PORT" \
            "$local_file" \
            "$SERVER_USER@$SERVER_HOST:$remote_file" 2>&1 | grep -v "Warning"
    fi
    
    if [ $? -eq 0 ]; then
        log_success "File uploaded successfully"
    else
        log_error "Failed to upload file"
        return 1
    fi
}

# ----------------------------------------------------------------------------
# Docker Installation Check
# ----------------------------------------------------------------------------
check_and_install_docker() {
    log_step "Checking Docker installation..."
    
    if remote_exec "command -v docker" false > /dev/null 2>&1; then
        log_success "Docker is already installed"
    else
        log_warning "Docker not found. Installing Docker..."
        
        remote_exec "curl -fsSL https://get.docker.com -o get-docker.sh" false
        remote_exec "sh get-docker.sh" true
        remote_exec "rm get-docker.sh" false
        remote_exec "usermod -aG docker $SERVER_USER" true
        
        log_success "Docker installed successfully"
    fi
    
    # Check Docker Compose
    if remote_exec "command -v docker" false > /dev/null 2>&1; then
        if remote_exec "docker compose version" false > /dev/null 2>&1; then
            log_success "Docker Compose is available"
        else
            log_error "Docker Compose not found"
            exit 1
        fi
    fi
}

# ----------------------------------------------------------------------------
# Application Health Check
# ----------------------------------------------------------------------------
health_check() {
    log_step "Performing health check..."
    
    local retries=0
    local max_retries=$HEALTH_CHECK_RETRIES
    
    while [ $retries -lt $max_retries ]; do
        if remote_exec "curl -f http://localhost:$APP_PORT/api/health" false > /dev/null 2>&1; then
            log_success "Application is healthy!"
            return 0
        fi
        
        retries=$((retries + 1))
        log_info "Health check attempt $retries/$max_retries..."
        sleep $HEALTH_CHECK_INTERVAL
    done
    
    log_error "Health check failed after $max_retries attempts"
    return 1
}

# ----------------------------------------------------------------------------
# MongoDB Atlas Migration
# ----------------------------------------------------------------------------
prompt_atlas_migration() {
    log_step "MongoDB Atlas Migration"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Do you want to migrate data from MongoDB Atlas to Docker?${NC}"
    echo -e "${BLUE}This will:${NC}"
    echo -e "  • Restore existing backup from atlas-backup directory"
    echo -e "  • Import data into the Docker MongoDB container"
    echo -e "  • Preserve all users, sessions, and finetune data"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e ""
    
    while true; do
        read -p "$(echo -e ${GREEN}Run Atlas migration? [y/n]: ${NC})" yn
        case $yn in
            [Yy]* )
                log_info "Starting Atlas to Docker migration..."
                run_atlas_migration
                break
                ;;
            [Nn]* )
                log_warning "Skipping Atlas migration"
                log_info "You can run migration later using the migrate-atlas-to-docker.sh script"
                break
                ;;
            * )
                echo -e "${RED}Please answer yes (y) or no (n).${NC}"
                ;;
        esac
    done
}

run_atlas_migration() {
    local migration_script="migrate-atlas-to-docker.sh"
    
    # Check if migration script exists locally
    if [ ! -f "$SCRIPT_DIR/$migration_script" ]; then
        log_error "Migration script not found: $SCRIPT_DIR/$migration_script"
        log_warning "Skipping migration"
        return 1
    fi
    
    # Check if backup directory exists
    if [ ! -d "$PROJECT_ROOT/atlas-backup" ]; then
        log_error "Backup directory not found: $PROJECT_ROOT/atlas-backup"
        log_warning "Please ensure atlas-backup directory exists with MongoDB backup files"
        return 1
    fi
    
    log_step "Uploading migration script to server..."
    upload_file "$SCRIPT_DIR/$migration_script" "$SERVER_DEPLOY_PATH/$migration_script"
    
    log_step "Uploading atlas-backup directory to server..."
    if [ -n "$SERVER_PASSWORD" ]; then
        sshpass -p "$SERVER_PASSWORD" scp -r \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -P "$SERVER_PORT" \
            "$PROJECT_ROOT/atlas-backup" \
            "$SERVER_USER@$SERVER_HOST:$SERVER_DEPLOY_PATH/" 2>&1 | grep -v "Warning"
    else
        scp -r \
            -o StrictHostKeyChecking=no \
            -o UserKnownHostsFile=/dev/null \
            -o ControlPath="$SSH_CONTROL_PATH" \
            -P "$SERVER_PORT" \
            "$PROJECT_ROOT/atlas-backup" \
            "$SERVER_USER@$SERVER_HOST:$SERVER_DEPLOY_PATH/" 2>&1 | grep -v "Warning"
    fi
    
    log_step "Making migration script executable..."
    remote_exec "chmod +x $SERVER_DEPLOY_PATH/$migration_script" false
    
    log_step "Running migration on server..."
    echo -e "${CYAN}This may take a few minutes depending on data size...${NC}"
    remote_exec "cd $SERVER_DEPLOY_PATH && ./$migration_script" false
    
    if [ $? -eq 0 ]; then
        log_success "Atlas migration completed successfully!"
    else
        log_error "Migration failed. Please check the logs above."
        return 1
    fi
}

# ----------------------------------------------------------------------------
# Deployment Commands
# ----------------------------------------------------------------------------

# Initialize deployment (first-time setup)
init_deployment() {
    echo -e "${MAGENTA}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         🚀 INITIALIZING DEPLOYMENT                        ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Setup connections
    connect_vpn
    setup_ssh_multiplexing
    
    # Install prerequisites
    check_and_install_docker
    
    # Clone repository
    local repo_url=$(get_repo_url)
    local safe_url=$(get_safe_repo_url)
    
    log_step "Cloning repository from $safe_url (branch: $REPO_BRANCH)..."
    remote_exec "rm -rf $SERVER_DEPLOY_PATH" false || true
    
    # Clone with token (output filtered to hide token)
    if remote_exec "git clone -b $REPO_BRANCH $repo_url $SERVER_DEPLOY_PATH 2>&1 | grep -v 'Cloning\|remote:'" false; then
        log_success "Repository cloned successfully"
    else
        log_error "Failed to clone repository"
        log_info "Make sure your GitHub token has the required permissions (repo scope)"
        cleanup_ssh_multiplexing
        exit 1
    fi
    
    # Upload environment file
    if [ -f "$PROJECT_ROOT/$ENV_FILE" ]; then
        upload_file "$PROJECT_ROOT/$ENV_FILE" "$SERVER_DEPLOY_PATH/$REMOTE_ENV_FILE"
    else
        log_error "Environment file not found: $PROJECT_ROOT/$ENV_FILE"
        cleanup_ssh_multiplexing
        exit 1
    fi
    
    # Build and start containers
    log_step "Building Docker images..."
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES build" true
    
    log_step "Starting containers..."
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES up -d" true
    
    # Health check
    sleep 5
    health_check
    
    # Prompt for Atlas migration
    echo ""
    prompt_atlas_migration
    echo ""
    
    # Show status
    get_status
    
    cleanup_ssh_multiplexing
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         ✅ DEPLOYMENT INITIALIZED SUCCESSFULLY            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Update deployment (pull changes and restart)
update_deployment() {
    echo -e "${MAGENTA}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         🔄 UPDATING DEPLOYMENT                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    # Update remote URL with token (in case it changed)
    local repo_url=$(get_repo_url)
    log_step "Updating repository remote URL..."
    remote_exec "cd $SERVER_DEPLOY_PATH && git remote set-url origin $repo_url" false
    
    # Pull latest changes
    log_step "Pulling latest code from $REPO_BRANCH..."
    if remote_exec "cd $SERVER_DEPLOY_PATH && git pull origin $REPO_BRANCH 2>&1 | grep -v 'From https'" false; then
        log_success "Code updated successfully"
    else
        log_error "Failed to pull latest changes"
        cleanup_ssh_multiplexing
        exit 1
    fi
    
    # Upload updated environment file
    if [ -f "$PROJECT_ROOT/$ENV_FILE" ]; then
        upload_file "$PROJECT_ROOT/$ENV_FILE" "$SERVER_DEPLOY_PATH/$REMOTE_ENV_FILE"
    fi
    
    # Rebuild and restart
    log_step "Rebuilding Docker images..."
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES build" true
    
    log_step "Restarting containers with zero-downtime..."
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES up -d --force-recreate" true
    
    # Health check
    sleep 5
    health_check
    
    # Show status
    get_status
    
    cleanup_ssh_multiplexing
    
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         ✅ DEPLOYMENT UPDATED SUCCESSFULLY                ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Restart containers
restart_deployment() {
    echo -e "${MAGENTA}🔄 Restarting containers...${NC}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES restart" true
    
    sleep 5
    health_check
    get_status
    
    cleanup_ssh_multiplexing
    
    log_success "Containers restarted successfully"
}

# Start containers
start_deployment() {
    echo -e "${MAGENTA}▶️  Starting containers...${NC}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES up -d" true
    
    sleep 5
    health_check
    get_status
    
    cleanup_ssh_multiplexing
    
    log_success "Containers started successfully"
}

# Stop containers
stop_deployment() {
    echo -e "${MAGENTA}⏹️  Stopping containers...${NC}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES down" true
    
    cleanup_ssh_multiplexing
    
    log_success "Containers stopped successfully"
}

# View logs
view_logs() {
    local service="${1:-}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    if [ -n "$service" ]; then
        log_step "Viewing logs for service: $service"
        remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES logs --tail=100 -f $service" true
    else
        log_step "Viewing all logs"
        remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES logs --tail=100 -f" true
    fi
    
    cleanup_ssh_multiplexing
}

# Get deployment status
get_status() {
    connect_vpn
    setup_ssh_multiplexing
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}📊 DEPLOYMENT STATUS${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES ps" true
    
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    cleanup_ssh_multiplexing
}

# Rollback to previous version
rollback_deployment() {
    echo -e "${YELLOW}⏪ Rolling back to previous version...${NC}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    log_step "Reverting to previous commit..."
    remote_exec "cd $SERVER_DEPLOY_PATH && git reset --hard HEAD~1" false
    
    log_step "Rebuilding and restarting..."
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES build" true
    remote_exec "cd $SERVER_DEPLOY_PATH && docker compose $DOCKER_COMPOSE_FILES up -d --force-recreate" true
    
    sleep 5
    health_check
    
    cleanup_ssh_multiplexing
    
    log_success "Rollback completed"
}

# Cleanup old Docker resources
cleanup_docker() {
    echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"
    
    connect_vpn
    setup_ssh_multiplexing
    
    remote_exec "docker system prune -af --volumes" true
    
    cleanup_ssh_multiplexing
    
    log_success "Docker cleanup completed"
}

# ----------------------------------------------------------------------------
# Cleanup on exit
# ----------------------------------------------------------------------------
cleanup() {
    cleanup_ssh_multiplexing
}

trap cleanup EXIT INT TERM

# ----------------------------------------------------------------------------
# Main script execution
# ----------------------------------------------------------------------------
show_usage() {
    echo "Inclusive Learning AI - Deployment Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  init        - Initialize deployment (first-time setup)"
    echo "  update      - Update deployment (pull changes and restart)"
    echo "  restart     - Restart containers"
    echo "  start       - Start containers"
    echo "  stop        - Stop containers"
    echo "  logs [svc]  - View logs (optionally for specific service)"
    echo "  status      - Show deployment status"
    echo "  rollback    - Rollback to previous version"
    echo "  cleanup     - Clean up old Docker resources"
    echo ""
    echo "Examples:"
    echo "  $0 init              # First-time deployment"
    echo "  $0 update            # Update with latest code"
    echo "  $0 logs app          # View app service logs"
    echo "  $0 status            # Check deployment status"
    echo ""
}

# Main command dispatcher
case "${1:-}" in
    init)
        init_deployment
        ;;
    update)
        update_deployment
        ;;
    restart)
        restart_deployment
        ;;
    start)
        start_deployment
        ;;
    stop)
        stop_deployment
        ;;
    logs)
        view_logs "${2:-}"
        ;;
    status)
        get_status
        ;;
    rollback)
        rollback_deployment
        ;;
    cleanup)
        cleanup_docker
        ;;
    *)
        show_usage
        exit 1
        ;;
esac

exit 0
