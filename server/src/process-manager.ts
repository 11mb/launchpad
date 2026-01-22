import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import { Project } from './scanner';
import { EventEmitter } from 'events';

export const processEvents = new EventEmitter();

interface RunningProcess {
    process: ChildProcess;
    startTime: number;
}

// Map project ID to running process
const runningProcesses = new Map<string, RunningProcess>();

import { createConnection } from 'net';

// Helper to check if a port is in use
function isPortInUse(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = createConnection(port); // Defaults to localhost (IPv4/IPv6)
        socket.setTimeout(500); // Set a timeout
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.on('error', (err) => {
            socket.destroy();
            resolve(false);
        });
    });
}

export async function getProjectStatus(id: string, port?: number): Promise<'RUNNING' | 'STOPPED'> {
    // First check our internal map
    const proc = runningProcesses.get(id);
    if (proc && proc.process.exitCode === null) {
        return 'RUNNING';
    }

    // Then check the port if provided
    if (port) {
        try {
            const inUse = await isPortInUse(port);
            // console.log(`Checking port ${port} for ${id}: ${inUse}`); 
            if (inUse) return 'RUNNING';
        } catch (err) {
            console.error(`Error checking port ${port}:`, err);
        }
    }

    return 'STOPPED';
}

export async function startProject(project: Project): Promise<void> {
    const id = project.id;
    if (await getProjectStatus(id, project.config.port) === 'RUNNING') {
        throw new Error('Project is already running');
    }

    const command = project.config.startCommand;
    if (!command) {
        throw new Error('No start command defined');
    }

    console.log(`[Launchpad] Starting in ${project.path} (ID: ${id})`);
    console.log(`[Launchpad] Command: ${command}`);

    const child = spawn(command, {
        cwd: project.path,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'] // changed from 'inherit' to pipe
    });

    if (child.stdout) {
        child.stdout.on('data', (data) => {
            processEvents.emit('log', id, data.toString());
            process.stdout.write(`[${id}] ${data}`); // Also log to server console
        });
    }

    if (child.stderr) {
        child.stderr.on('data', (data) => {
            processEvents.emit('log', id, data.toString());
            process.stderr.write(`[${id}] ${data}`);
        });
    }

    runningProcesses.set(id, {
        process: child,
        startTime: Date.now()
    });

    child.on('error', (err) => {
        console.error(`Failed to start project ${project.config.name}:`, err);
    });

    child.on('exit', (code) => {
        console.log(`Project ${project.config.name} (ID: ${id}) exited with code ${code}`);
        runningProcesses.delete(id);
    });
}

import { exec } from 'child_process';

// Helper to kill process by port
function killProcessByPort(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        // Find PID using lsof
        exec(`lsof -t -i:${port}`, (err, stdout) => {
            if (err) {
                // If lsof fails (e.g. no process found), we consider it success (already stopped)
                resolve();
                return;
            }

            const pids = stdout.trim().split('\n');
            if (pids.length === 0 || (pids.length === 1 && pids[0] === '')) {
                resolve();
                return;
            }

            // Kill found PIDs
            const killCmd = `kill -9 ${pids.join(' ')}`;
            exec(killCmd, (killErr) => {
                if (killErr) {
                    console.error(`Failed to kill PIDs on port ${port}`, killErr);
                    // reject(killErr); // Don't reject, maybe permission issue, but main goal is to try.
                }
                resolve();
            });
        });
    });
}

export async function stopProject(id: string, port?: number): Promise<void> {
    const proc = runningProcesses.get(id);
    if (proc) {
        // Kill known process
        if (proc.process.pid) {
            await new Promise<void>((resolve) => {
                treeKill(proc.process.pid!, 'SIGTERM', () => resolve());
            });
        }
        runningProcesses.delete(id);
    }

    // Also ensure port is free (fallback for orphaned processes)
    if (port) {
        await killProcessByPort(port);
    }
}
