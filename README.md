# Minecraft Server Dashboard

A mobile-friendly web dashboard for managing your personal Minecraft server. Control your server, view logs, and monitor player activity from your phone.

## Features

- **Server Control** - Start, stop, and restart your Minecraft server
- **Real-time Logs** - Stream server logs live via WebSocket
- **Player Tracking** - See who's online and recent join/leave activity
- **Mobile-First** - Designed for phone access with responsive UI
- **Simple Auth** - Basic authentication to protect your server

## Screenshots

| Dashboard | Logs | Players |
|-----------|------|---------|
| Server status & controls | Live log streaming | Online players list |

## Requirements

- **Server Machine** (Ubuntu Server LTS recommended)
  - Node.js 20+
  - Java 21+ (for Minecraft)
  - 4GB+ RAM recommended

- **Minecraft Server**
  - Java Edition server jar
  - Configured and ready to run

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/mc-personal-dashboard.git
cd mc-personal-dashboard
npm install
```

### 2. Configure

Copy the example environment file and edit it:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
# Path to your Minecraft server directory
MC_SERVER_PATH=/opt/minecraft

# Name of your server jar file
MC_SERVER_JAR=server.jar

# RAM allocation
MC_MIN_RAM=1G
MC_MAX_RAM=4G

# Dashboard port
PORT=3001

# Login credentials (change these!)
AUTH_USERNAME=admin
AUTH_PASSWORD=your-secure-password
```

### 3. Run Development Server

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 5173).

Open http://localhost:5173 in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Deployment on Ubuntu Server

### Automated Installation

```bash
sudo ./scripts/install.sh
```

This will:
- Install Node.js and Java if needed
- Create a `minecraft` user
- Set up the dashboard in `/opt/mc-dashboard`
- Create a `.env` file for you to configure

### Set Up Systemd Service

```bash
sudo ./scripts/setup-service.sh
```

The dashboard will now start automatically on boot.

### Service Commands

```bash
# Check status
sudo systemctl status mc-dashboard

# View logs
sudo journalctl -u mc-dashboard -f

# Restart
sudo systemctl restart mc-dashboard

# Stop
sudo systemctl stop mc-dashboard
```

## Setting Up Your Minecraft Server

If you don't have a Minecraft server yet:

```bash
# Create directory
sudo mkdir -p /opt/minecraft
sudo chown $USER:$USER /opt/minecraft
cd /opt/minecraft

# Download server jar (replace URL with latest version)
wget https://piston-data.mojang.com/v1/objects/SERVER_JAR_URL/server.jar

# Accept EULA
echo "eula=true" > eula.txt

# Configure server.properties as needed
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/server/status` | Get server status |
| POST | `/api/server/start` | Start the server |
| POST | `/api/server/stop` | Stop the server |
| POST | `/api/server/restart` | Restart the server |
| POST | `/api/server/command` | Send console command |
| GET | `/api/logs` | Get recent log lines |
| GET | `/api/players` | Get online players |
| GET | `/api/players/history` | Get join/leave history |
| WS | `/socket.io` | Real-time log streaming |

All `/api/*` endpoints require Basic Authentication.

## Project Structure

```
mc-personal-dashboard/
├── server/                 # Backend (Express + Socket.io)
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   └── .env.example
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   └── pages/          # Page components
│   └── tailwind.config.js
├── scripts/                # Deployment scripts
└── package.json            # Monorepo config
```

## Security Notes

- **Change default credentials** in `.env` before deploying
- The dashboard is designed for **local network use**
- For remote access, put it behind a reverse proxy (nginx) with HTTPS
- Consider using a VPN for secure remote access

## Development

```bash
# Run in development mode (hot reload)
npm run dev

# Run only backend
npm run dev:server

# Run only frontend
npm run dev:client

# Build for production
npm run build

# Type check
cd server && npx tsc --noEmit
cd client && npx tsc --noEmit
```

## License

MIT
