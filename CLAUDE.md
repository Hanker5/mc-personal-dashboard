# Minecraft Server Dashboard

A personal web application for managing a Minecraft server hosted on Ubuntu Server LTS.

## Project Overview

This project provides a mobile-friendly web interface to remotely manage a self-hosted Minecraft server. The dashboard allows server administration without needing SSH access or direct console interaction.

### Core Features

- **Server Control**: Start, stop, and restart the Minecraft server
- **Log Viewer**: Real-time server log streaming and historical log access
- **Player Activity**: View online players, connection history, and activity metrics
- **Server Status**: Display server health, memory usage, and uptime

## Architecture

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Process Management**: Child process management for Minecraft server control
- **WebSocket**: Socket.io for real-time log streaming and status updates

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for mobile-first responsive design
- **State Management**: React hooks and context

### Deployment Target
- Ubuntu Server LTS on dedicated hardware (old laptop)
- Minecraft Java Edition server
- Systemd service for process management

## Project Structure

```
mc-personal-dashboard/
├── server/                 # Backend Node.js application
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── routes/        # API route handlers
│   │   ├── services/      # Business logic (MC server control, log parsing)
│   │   └── utils/         # Helper utilities
│   └── package.json
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   └── App.tsx
│   └── package.json
├── scripts/               # Deployment and setup scripts
└── CLAUDE.md
```

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (backend)
cd server && npm run dev

# Run development server (frontend)
cd client && npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## API Endpoints

### Server Control
- `POST /api/server/start` - Start the Minecraft server
- `POST /api/server/stop` - Gracefully stop the server
- `POST /api/server/restart` - Restart the server
- `GET /api/server/status` - Get current server status

### Logs
- `GET /api/logs` - Fetch recent log entries
- `WS /ws/logs` - WebSocket stream for real-time logs

### Players
- `GET /api/players` - Get list of online players
- `GET /api/players/history` - Get player connection history

## Configuration

Environment variables:
- `MC_SERVER_PATH` - Path to Minecraft server directory
- `MC_SERVER_JAR` - Name of the server JAR file
- `MC_MIN_RAM` - Minimum RAM allocation (e.g., "1G")
- `MC_MAX_RAM` - Maximum RAM allocation (e.g., "4G")
- `PORT` - Web server port (default: 3000)
- `AUTH_SECRET` - Secret for basic authentication

## Security Considerations

- Basic authentication required for all endpoints
- Server runs on local network only (not exposed to internet)
- HTTPS recommended if exposing beyond local network
- Rate limiting on server control endpoints

## Code Conventions

- Use TypeScript for type safety
- Follow ESLint and Prettier configurations
- Use async/await for asynchronous operations
- Meaningful variable and function names
- Keep components small and focused
