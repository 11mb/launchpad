export interface ProjectConfig {
    name: string;
    port?: number;
    startCommand?: string;
    color?: string;
    category?: string;
    tags?: string[];
}

export interface Project {
    id: string;
    path: string;
    config: ProjectConfig;
    status: 'RUNNING' | 'STOPPED';
}
