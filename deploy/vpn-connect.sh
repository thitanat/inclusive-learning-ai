#!/bin/bash

# ============================================================================
# VPN Connection Manager
# ============================================================================
# Handles VPN connection establishment and management for secure deployments
# ============================================================================

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Load configuration
if [ -f "$SCRIPT_DIR/config.sh" ]; then
    source "$SCRIPT_DIR/config.sh"
else
    echo "❌ Error: config.sh not found. Please copy config.sh.example to config.sh and configure it."
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ----------------------------------------------------------------------------
# Check if VPN is already connected
# ----------------------------------------------------------------------------
check_vpn_connection() {
    if pgrep -x "openconnect" > /dev/null; then
        return 0  # Connected
    elif pgrep -x "openvpn" > /dev/null; then
        return 0  # Connected
    else
        return 1  # Not connected
    fi
}

# ----------------------------------------------------------------------------
# Connect to VPN using OpenConnect (Cisco AnyConnect)
# ----------------------------------------------------------------------------
connect_openconnect() {
    echo -e "${BLUE}🔌 Connecting to VPN via OpenConnect...${NC}"
    
    # Check if openconnect is installed
    if ! command -v openconnect &> /dev/null; then
        echo -e "${YELLOW}⚠️  OpenConnect not found. Installing...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install openconnect
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "$SUDO_PASSWORD" | sudo -S apt-get update && sudo -S apt-get install -y openconnect
        fi
    fi
    
    # Connect with both sudo password and VPN password
    (echo "${SUDO_PASSWORD}"; sleep 1; echo "${VPN_PASSWORD}") | sudo -S openconnect \
        --user="${VPN_USERNAME}" \
        --passwd-on-stdin \
        --background \
        "${VPN_HOST}" 2>&1 | grep -v "password"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPN connected successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to connect to VPN${NC}"
        return 1
    fi
}

# ----------------------------------------------------------------------------
# Connect to VPN using OpenVPN
# ----------------------------------------------------------------------------
connect_openvpn() {
    echo -e "${BLUE}🔌 Connecting to VPN via OpenVPN...${NC}"
    
    # Check if openvpn is installed
    if ! command -v openvpn &> /dev/null; then
        echo -e "${YELLOW}⚠️  OpenVPN not found. Installing...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            brew install openvpn
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            echo "$SUDO_PASSWORD" | sudo -S apt-get update && sudo -S apt-get install -y openvpn
        fi
    fi
    
    # Look for VPN config file
    VPN_CONFIG="$SCRIPT_DIR/vpn-config.ovpn"
    if [ ! -f "$VPN_CONFIG" ]; then
        echo -e "${RED}❌ VPN config file not found: $VPN_CONFIG${NC}"
        return 1
    fi
    
    # Connect
    echo "$SUDO_PASSWORD" | sudo -S openvpn --config "$VPN_CONFIG" --daemon
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ VPN connected successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to connect to VPN${NC}"
        return 1
    fi
}

# ----------------------------------------------------------------------------
# Main VPN connection function
# ----------------------------------------------------------------------------
connect_vpn() {
    # Skip VPN if configured
    if [ "$VPN_SKIP" = true ]; then
        echo -e "${YELLOW}⏭️  VPN connection skipped (VPN_SKIP=true)${NC}"
        return 0
    fi
    
    # Check if already connected
    if check_vpn_connection; then
        echo -e "${GREEN}✅ VPN already connected${NC}"
        return 0
    fi
    
    # Connect based on protocol
    case "$VPN_PROTOCOL" in
        openconnect)
            connect_openconnect
            ;;
        openvpn)
            connect_openvpn
            ;;
        *)
            echo -e "${RED}❌ Unknown VPN protocol: $VPN_PROTOCOL${NC}"
            echo -e "${YELLOW}Supported protocols: openconnect, openvpn${NC}"
            return 1
            ;;
    esac
}

# ----------------------------------------------------------------------------
# Disconnect VPN
# ----------------------------------------------------------------------------
disconnect_vpn() {
    if [ "$VPN_SKIP" = true ]; then
        return 0
    fi
    
    echo -e "${BLUE}🔌 Disconnecting VPN...${NC}"
    
    # Kill OpenConnect
    if pgrep -x "openconnect" > /dev/null; then
        echo "$SUDO_PASSWORD" | sudo -S pkill -9 openconnect
    fi
    
    # Kill OpenVPN
    if pgrep -x "openvpn" > /dev/null; then
        echo "$SUDO_PASSWORD" | sudo -S pkill -9 openvpn
    fi
    
    echo -e "${GREEN}✅ VPN disconnected${NC}"
}

# ----------------------------------------------------------------------------
# Get VPN status
# ----------------------------------------------------------------------------
vpn_status() {
    if check_vpn_connection; then
        echo -e "${GREEN}✅ VPN is CONNECTED${NC}"
        
        if pgrep -x "openconnect" > /dev/null; then
            echo -e "   Protocol: OpenConnect"
        elif pgrep -x "openvpn" > /dev/null; then
            echo -e "   Protocol: OpenVPN"
        fi
        
        return 0
    else
        echo -e "${YELLOW}⚠️  VPN is NOT connected${NC}"
        return 1
    fi
}

# ----------------------------------------------------------------------------
# Main script execution (if called directly)
# ----------------------------------------------------------------------------
if [ "${BASH_SOURCE[0]}" -ef "$0" ]; then
    case "${1:-}" in
        connect)
            connect_vpn
            ;;
        disconnect)
            disconnect_vpn
            ;;
        status)
            vpn_status
            ;;
        *)
            echo "Usage: $0 {connect|disconnect|status}"
            echo ""
            echo "Commands:"
            echo "  connect    - Establish VPN connection"
            echo "  disconnect - Terminate VPN connection"
            echo "  status     - Check VPN connection status"
            exit 1
            ;;
    esac
fi
