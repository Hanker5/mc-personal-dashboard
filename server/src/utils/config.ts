import path from 'path';

export const config = {
  minecraft: {
    serverPath: process.env.MC_SERVER_PATH || '/opt/minecraft',
    serverJar: process.env.MC_SERVER_JAR || 'server.jar',
    minRam: process.env.MC_MIN_RAM || '1G',
    maxRam: process.env.MC_MAX_RAM || '4G',
    get jarPath(): string {
      return path.join(this.serverPath, this.serverJar);
    },
    get logPath(): string {
      return path.join(this.serverPath, 'logs', 'latest.log');
    },
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  },
};
