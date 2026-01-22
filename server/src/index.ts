import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { scanForProjects } from './scanner';
import { getProjectStatus, startProject, stopProject, processEvents } from './process-manager';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all for local dev
        methods: ["GET", "POST"]
    }
});

const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Determine root dir to scan
// const SCAN_ROOT = path.resolve(__dirname, '../../../'); 
const PROJECTS_ROOT = path.resolve(process.cwd(), '../../');

console.log(`Scanning for projects in: ${PROJECTS_ROOT}`);

// Forward process logs to socket rooms
processEvents.on('log', (projectId, data) => {
    io.to(projectId).emit('log', data);
});

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('join-project', (projectId) => {
        socket.join(projectId);
        console.log(`Client joined project room: ${projectId}`);
    });

    socket.on('leave-project', (projectId) => {
        socket.leave(projectId);
        console.log(`Client left project room: ${projectId}`);
    });
});

app.get('/api/projects', async (req, res) => {
    try {
        const projects = await scanForProjects(PROJECTS_ROOT);
        const projectsWithStatus = await Promise.all(projects.map(async p => ({
            ...p,
            status: await getProjectStatus(p.id, p.config.port)
        })));
        res.json(projectsWithStatus);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to scan projects' });
    }
});

app.post('/api/projects/start', async (req, res) => {
    const { path: projectPath, id } = req.body;
    if (!projectPath) return res.status(400).json({ error: 'Path is required' });
    if (!id) return res.status(400).json({ error: 'ID is required' });

    // Security check
    if (!projectPath.startsWith(PROJECTS_ROOT)) {
        return res.status(403).json({ error: 'Invalid project path' });
    }

    try {
        const fs = require('fs');
        const content = fs.readFileSync(path.join(projectPath, '.launchpad'), 'utf-8');
        const parsed = JSON.parse(content);
        const configs = Array.isArray(parsed) ? parsed : [parsed];

        const targetConfig = configs.find((c: any) => {
            const computedId = `${projectPath}::${c.name}`;
            return computedId === id;
        });

        if (!targetConfig) {
            return res.status(404).json({ error: 'Configuration not found for this ID' });
        }

        await startProject({
            id,
            path: projectPath,
            config: targetConfig
        });

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/projects/stop', async (req, res) => {
    const { path: projectPath, id } = req.body;
    if (!projectPath) return res.status(400).json({ error: 'Path is required' });
    if (!id) return res.status(400).json({ error: 'ID is required' });

    try {
        const fs = require('fs');
        let port: number | undefined;
        try {
            const content = fs.readFileSync(path.join(projectPath, '.launchpad'), 'utf-8');
            const parsed = JSON.parse(content);
            const configs = Array.isArray(parsed) ? parsed : [parsed];

            const targetConfig = configs.find((c: any) => {
                const computedId = `${projectPath}::${c.name}`;
                return computedId === id;
            });

            if (targetConfig) {
                port = targetConfig.port;
            }
        } catch (e) {
            console.warn(`Could not read config for stopping ${id}`);
        }

        await stopProject(id, port);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

httpServer.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
