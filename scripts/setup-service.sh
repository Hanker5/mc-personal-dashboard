#!/bin/bash
# Setup systemd service for MC Dashboard

set -e

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo ./setup-service.sh)"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Copy service file
cp "$SCRIPT_DIR/mc-dashboard.service" /etc/systemd/system/

# Reload systemd
systemctl daemon-reload

# Enable and start service
systemctl enable mc-dashboard
systemctl start mc-dashboard

echo "MC Dashboard service installed and started"
echo "Check status: systemctl status mc-dashboard"
echo "View logs: journalctl -u mc-dashboard -f"
