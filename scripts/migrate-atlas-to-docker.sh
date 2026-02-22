#!/bin/bash

###############################################################################
# Automated Migration: MongoDB Atlas → Docker
# Inclusive Learning AI Platform
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./atlas-backup"
DOCKER_CONTAINER="inclusive-learning-mongodb"
DOCKER_DB_NAME="inclusive"
DOCKER_USERNAME="admin"
DOCKER_PASSWORD="inclusive_admin_2026"

###############################################################################
# Helper Functions
###############################################################################

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        echo "Please install $1 to continue"
        exit 1
    fi
}

###############################################################################
# Validation
###############################################################################

validate_prerequisites() {
    print_header "Validating Prerequisites"
    
    # Check required commands
    check_command "docker"
    check_command "docker-compose"
    check_command "mongodump"
    check_command "mongorestore"
    
    # Check Docker is running
    if ! docker info &> /dev/null; then
        print_error "Docker is not running"
        echo "Please start Docker Desktop and try again"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

validate_atlas_uri() {
    local uri=$1
    
    if [[ ! $uri =~ ^mongodb(\+srv)?:// ]]; then
        print_error "Invalid MongoDB URI format"
        echo "URI should start with mongodb:// or mongodb+srv://"
        exit 1
    fi
    
    print_success "Atlas URI format validated"
}

###############################################################################
# Atlas Export
###############################################################################

export_from_atlas() {
    local atlas_uri=$1
    
    print_header "Exporting Data from MongoDB Atlas"
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    print_info "Starting export from Atlas..."
    print_info "This may take several minutes depending on data size"
    
    # Export with progress
    if mongodump --uri="$atlas_uri" --out="$BACKUP_DIR" 2>&1 | tee /tmp/mongodump.log; then
        print_success "Export completed successfully"
        
        # Show exported collections
        if [ -d "$BACKUP_DIR/$DOCKER_DB_NAME" ]; then
            echo ""
            print_info "Exported collections:"
            ls -lh "$BACKUP_DIR/$DOCKER_DB_NAME/" | grep -v "^total" | awk '{print "  - " $9 " (" $5 ")"}'
            
            # Show total size
            local size=$(du -sh "$BACKUP_DIR/$DOCKER_DB_NAME" | awk '{print $1}')
            print_info "Total export size: $size"
        fi
    else
        print_error "Export failed"
        cat /tmp/mongodump.log
        exit 1
    fi
}

###############################################################################
# Docker Setup
###############################################################################

setup_docker_mongodb() {
    print_header "Setting Up Docker MongoDB"
    
    # Check if container already exists
    if docker ps -a --format '{{.Names}}' | grep -q "^$DOCKER_CONTAINER$"; then
        print_warning "Container $DOCKER_CONTAINER already exists"
        read -p "Remove existing container and start fresh? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Stopping and removing existing container..."
            docker-compose down -v mongodb
            print_success "Existing container removed"
        else
            print_info "Using existing container"
            # Ensure it's running
            if ! docker ps --format '{{.Names}}' | grep -q "^$DOCKER_CONTAINER$"; then
                docker-compose up -d mongodb
            fi
        fi
    else
        print_info "Starting MongoDB container..."
        docker-compose up -d mongodb
    fi
    
    # Wait for MongoDB to be ready
    print_info "Waiting for MongoDB to initialize..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec $DOCKER_CONTAINER mongosh \
            -u $DOCKER_USERNAME \
            -p $DOCKER_PASSWORD \
            --authenticationDatabase admin \
            --eval "db.adminCommand('ping')" &> /dev/null; then
            print_success "MongoDB is ready"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo ""
    print_error "MongoDB failed to start within expected time"
    print_info "Checking container logs..."
    docker logs --tail 50 $DOCKER_CONTAINER
    exit 1
}

###############################################################################
# Data Import
###############################################################################

import_to_docker() {
    print_header "Importing Data to Docker MongoDB"
    
    local docker_uri="mongodb://$DOCKER_USERNAME:$DOCKER_PASSWORD@localhost:27017/$DOCKER_DB_NAME?authSource=admin"
    
    print_info "Starting import to Docker..."
    
    if mongorestore \
        --uri="$docker_uri" \
        --nsInclude="$DOCKER_DB_NAME.*" \
        --drop \
        "$BACKUP_DIR/$DOCKER_DB_NAME/" 2>&1 | tee /tmp/mongorestore.log; then
        
        print_success "Import completed successfully"
        
        # Extract statistics from log
        local docs_restored=$(grep -o '[0-9]* document(s) restored successfully' /tmp/mongorestore.log | awk '{sum += $1} END {print sum}')
        if [ ! -z "$docs_restored" ]; then
            print_info "Total documents imported: $docs_restored"
        fi
    else
        print_error "Import failed"
        cat /tmp/mongorestore.log
        exit 1
    fi
}

###############################################################################
# Verification
###############################################################################

verify_migration() {
    print_header "Verifying Migration"
    
    print_info "Checking document counts..."
    
    docker exec $DOCKER_CONTAINER mongosh \
        -u $DOCKER_USERNAME \
        -p $DOCKER_PASSWORD \
        --authenticationDatabase admin \
        $DOCKER_DB_NAME \
        --quiet \
        --eval "
            print('📊 Collection Statistics:');
            print('');
            db.getCollectionNames().forEach(function(col) {
                var count = db[col].countDocuments();
                print('  ' + col + ': ' + count + ' documents');
            });
            print('');
        "
    
    print_info "Verifying indexes..."
    
    docker exec $DOCKER_CONTAINER mongosh \
        -u $DOCKER_USERNAME \
        -p $DOCKER_PASSWORD \
        --authenticationDatabase admin \
        $DOCKER_DB_NAME \
        --quiet \
        --eval "
            print('🔍 Indexes:');
            print('');
            db.getCollectionNames().forEach(function(col) {
                var indexes = db[col].getIndexes();
                if (indexes.length > 1) {  // Skip if only _id index
                    print('  ' + col + ':');
                    indexes.forEach(function(idx) {
                        if (idx.name !== '_id_') {
                            print('    - ' + idx.name);
                        }
                    });
                }
            });
            print('');
        "
    
    print_success "Verification complete"
}

###############################################################################
# Configuration Update
###############################################################################

update_env_config() {
    print_header "Updating Configuration"
    
    local env_file=".env.local"
    local docker_uri="mongodb://$DOCKER_USERNAME:$DOCKER_PASSWORD@localhost:27017/$DOCKER_DB_NAME?authSource=admin"
    
    # Backup existing .env.local
    if [ -f "$env_file" ]; then
        cp "$env_file" "$env_file.backup.$(date +%Y%m%d_%H%M%S)"
        print_info "Backed up existing $env_file"
    fi
    
    # Update or create MONGO_URI
    if [ -f "$env_file" ]; then
        if grep -q "^MONGO_URI=" "$env_file"; then
            # Comment out old URI and add new one
            sed -i.bak "s|^MONGO_URI=.*|# MONGO_URI (Atlas - migrated $(date +%Y-%m-%d))\n# &\nMONGO_URI=$docker_uri|" "$env_file"
            rm "$env_file.bak"
            print_success "Updated MONGO_URI in $env_file"
        else
            echo "" >> "$env_file"
            echo "# MongoDB Docker Configuration (migrated $(date +%Y-%m-%d))" >> "$env_file"
            echo "MONGO_URI=$docker_uri" >> "$env_file"
            print_success "Added MONGO_URI to $env_file"
        fi
    else
        cat > "$env_file" << EOF
# MongoDB Docker Configuration (migrated $(date +%Y-%m-%d))
MONGO_URI=$docker_uri
MONGO_ROOT_PASSWORD=$DOCKER_PASSWORD

# Add your other environment variables here
# OPENAI_API_KEY=
# PINECONE_API_KEY=
# JWT_SECRET=
# SERPER_API_KEY=
EOF
        print_success "Created $env_file with Docker configuration"
    fi
    
    print_info "New MongoDB URI: $docker_uri"
}

###############################################################################
# Cleanup
###############################################################################

cleanup_backups() {
    print_header "Cleanup"
    
    read -p "Keep Atlas backup files? (Y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        rm -rf "$BACKUP_DIR"
        print_success "Backup files removed"
    else
        print_info "Backup files kept at: $BACKUP_DIR"
    fi
}

###############################################################################
# Main Migration Flow
###############################################################################

main() {
    clear
    echo -e "${BLUE}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        MongoDB Atlas → Docker Migration Tool                 ║
║        Inclusive Learning AI Platform                        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Get Atlas URI if not provided as argument
    if [ -z "$1" ]; then
        echo -e "${YELLOW}Please enter your MongoDB Atlas URI:${NC}"
        echo -e "${YELLOW}(Format: mongodb+srv://username:password@cluster.mongodb.net/inclusive)${NC}"
        read -r ATLAS_URI
    else
        ATLAS_URI=$1
    fi
    
    # Confirm before proceeding
    echo ""
    print_warning "This script will:"
    echo "  1. Export data from Atlas"
    echo "  2. Set up Docker MongoDB"
    echo "  3. Import data to Docker"
    echo "  4. Update .env.local configuration"
    echo ""
    read -p "Continue with migration? (y/N): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Migration cancelled"
        exit 0
    fi
    
    # Start migration
    local start_time=$(date +%s)
    
    validate_prerequisites
    validate_atlas_uri "$ATLAS_URI"
    export_from_atlas "$ATLAS_URI"
    setup_docker_mongodb
    import_to_docker
    verify_migration
    update_env_config
    cleanup_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Success summary
    print_header "Migration Complete! 🎉"
    
    echo -e "${GREEN}"
    cat << EOF
✅ Migration completed successfully in ${duration} seconds

📋 Next Steps:
   1. Test your application: npm run dev
   2. Verify login and session loading
   3. Create a test session
   4. Once confirmed, you can pause/delete your Atlas cluster

📂 Database Connection:
   Container: $DOCKER_CONTAINER
   Database: $DOCKER_DB_NAME
   Port: 27017
   
🔧 Useful Commands:
   View logs: docker logs $DOCKER_CONTAINER
   Access DB:  docker exec -it $DOCKER_CONTAINER mongosh -u admin -p $DOCKER_PASSWORD --authenticationDatabase admin
   Stop DB:    docker-compose stop mongodb
   Start DB:   docker-compose start mongodb
   
📚 Documentation: docs/docker-setup.md
EOF
    echo -e "${NC}"
}

###############################################################################
# Execute
###############################################################################

main "$@"
