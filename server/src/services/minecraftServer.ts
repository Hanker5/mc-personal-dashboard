import { spawn, ChildProcess } from 'child_process';
import { config } from '../utils/config.js';
import { EventEmitter } from 'events';

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping';

class MinecraftServerManager extends EventEmitter {
  private process: ChildProcess | null = null;
  private status: ServerStatus = 'stopped';
  private startTime: Date | null = null;

  getStatus(): { status: ServerStatus; uptime: number | null; pid: number | null } {
    return {
      status: this.status,
      uptime: this.startTime ? Date.now() - this.startTime.getTime() : null,
      pid: this.process?.pid || null,
    };
  }

  async start(): Promise<void> {
    if (this.status !== 'stopped') {
      throw new Error(`Cannot start server: current status is ${this.status}`);
    }

    this.status = 'starting';
    this.emit('status', this.status);

    const { serverPath, serverJar, minRam, maxRam } = config.minecraft;

    this.process = spawn(
      'java',
      [`-Xms${minRam}`, `-Xmx${maxRam}`, '-jar', serverJar, 'nogui'],
      {
        cwd: serverPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    this.process.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      this.emit('stdout', output);

      // Detect when server is ready
      if (output.includes('Done') && output.includes('For help')) {
        this.status = 'running';
        this.startTime = new Date();
        this.emit('status', this.status);
      }
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      this.emit('stderr', data.toString());
    });

    this.process.on('close', (code) => {
      this.status = 'stopped';
      this.process = null;
      this.startTime = null;
      this.emit('status', this.status);
      this.emit('close', code);
    });

    this.process.on('error', (err) => {
      this.emit('error', err);
      this.status = 'stopped';
      this.process = null;
      this.startTime = null;
    });
  }

  async stop(): Promise<void> {
    if (this.status !== 'running') {
      throw new Error(`Cannot stop server: current status is ${this.status}`);
    }

    this.status = 'stopping';
    this.emit('status', this.status);

    // Send stop command to Minecraft server
    this.sendCommand('stop');

    // Wait for graceful shutdown (max 30 seconds)
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (this.process) {
          this.process.kill('SIGKILL');
        }
        reject(new Error('Server stop timed out'));
      }, 30000);

      this.once('close', () => {
        clearTimeout(timeout);
        resolve();
      });
    });
  }

  async restart(): Promise<void> {
    if (this.status === 'running') {
      await this.stop();
    }
    await this.start();
  }

  sendCommand(command: string): void {
    if (!this.process?.stdin) {
      throw new Error('Server is not running');
    }
    this.process.stdin.write(`${command}\n`);
  }
}

export const minecraftServer = new MinecraftServerManager();
