import fs from 'fs/promises';
import path from 'path';
import { Dirent } from 'fs';

export interface ProjectConfig {
    name: string;
    port?: number;
    startCommand?: string;
    color?: string;
    category?: string;
    tags?: string[];
}

export interface Project {
    id: string; // Unique identifier for the launcher instance
    path: string;
    config: ProjectConfig;
}

const MARKER_FILE = '.launchpad';
const MAX_DEPTH = 5;

// Helper to check if file exists
async function fileExists(filePath: string): Promise<boolean> {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function scanForProjects(rootDir: string, depth: number = 0): Promise<Project[]> {
    const projects: Project[] = [];

    if (depth > MAX_DEPTH) return [];

    let entries: Dirent[];
    try {
        entries = await fs.readdir(rootDir, { withFileTypes: true });
    } catch (err) {
        // Permission denied or other error, skip
        return [];
    }

    // Check if current dir is a project
    const markerPath = path.join(rootDir, MARKER_FILE);
    if (await fileExists(markerPath)) {
        try {
            const content = await fs.readFile(markerPath, 'utf-8');
            const parsed = JSON.parse(content);
            const configs: ProjectConfig[] = Array.isArray(parsed) ? parsed : [parsed];

            configs.forEach(config => {
                // Generate a stable ID. 
                // Using path + name is decent. 
                const id = `${rootDir}::${config.name}`;
                projects.push({
                    id,
                    path: rootDir,
                    config
                });
            });

            // Assuming nested projects are unlikely or we still want to scan deeper? 
            // Let's assume projects don't contain other projects for now to save time, 
            // but if they do, we can continue. Let's continue scanning.
        } catch (err) {
            console.error(`Failed to parse ${markerPath}`, err);
        }
    }

    // Recurse into directories
    const subDirs = entries.filter(ent => ent.isDirectory() && !ent.name.startsWith('.') && ent.name !== 'node_modules');

    for (const dir of subDirs) {
        const subProjects = await scanForProjects(path.join(rootDir, dir.name), depth + 1);
        projects.push(...subProjects);
    }

    return projects;
}
