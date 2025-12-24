#!/bin/bash
# MC Dashboard Installation Script for Ubuntu Server

set -e

echo "=== MC Dashboard Installation ==="

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./install.sh)"
  exit 1
fi

# Install Node.js if not present
if ! command -v node &> /dev/null; then
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Install Java if not present (for Minecraft server)
if ! command -v java &> /dev/null; then
  echo "Installing Java..."
  apt-get update
  apt-get install -y openjdk-21-jre-headless
fi

echo "Java version: $(java --version | head -1)"

# Create minecraft user if not exists
if ! id "minecraft" &>/dev/null; then
  echo "Creating minecraft user..."
  useradd -r -m -d /opt/minecraft minecraft
fi

# Create Minecraft server directory
MC_DIR="/opt/minecraft"
if [ ! -d "$MC_DIR" ]; then
  echo "Creating Minecraft server directory..."
  mkdir -p "$MC_DIR"
  chown minecraft:minecraft "$MC_DIR"
fi

# Install dashboard
DASHBOARD_DIR="/opt/mc-dashboard"
echo "Installing dashboard to $DASHBOARD_DIR..."

if [ -d "$DASHBOARD_DIR" ]; then
  rm -rf "$DASHBOARD_DIR"
fi

mkdir -p "$DASHBOARD_DIR"
cp -r . "$DASHBOARD_DIR"
cd "$DASHBOARD_DIR"

# Install dependencies
npm install

# Build
npm run build

# Create .env file if not exists
if [ ! -f "$DASHBOARD_DIR/server/.env" ]; then
  cp "$DASHBOARD_DIR/server/.env.example" "$DASHBOARD_DIR/server/.env"
  echo "Created .env file - please edit /opt/mc-dashboard/server/.env"
fi

echo ""
echo "=== Installation Complete ==="
echo "Next steps:"
echo "1. Edit /opt/mc-dashboard/server/.env with your settings"
echo "2. Download Minecraft server jar to /opt/minecraft/"
echo "3. Run: sudo systemctl enable --now mc-dashboard"
echo ""
