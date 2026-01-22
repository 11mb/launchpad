import { type FC } from 'react';
import type { Project } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Play, Square, ExternalLink, Folder, Terminal } from 'lucide-react';

interface ProjectGroupCardProps {
    path: string;
    projects: Project[];
    onStart: (project: Project) => void;
    onStop: (project: Project) => void;
    onViewLogs: (project: Project) => void;
}

export const ProjectGroupCard: FC<ProjectGroupCardProps> = ({ path, projects, onStart, onStop, onViewLogs }) => {
    const folderName = path.split('/').pop() || path;
    const runningCount = projects.filter(p => p.status === 'RUNNING').length;

    return (
        <div className="bg-card rounded-3xl shadow-soft p-6 transition-all hover:shadow-lg flex flex-col gap-4 border border-gray-50 h-full bg-white text-left">
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-400 bg-gray-50 border border-gray-100">
                        <Folder size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-primary tracking-tight">{folderName}</h3>
                        <div className="text-secondary text-sm mt-0.5 text-gray-400">
                            {projects.length} Launchers • {runningCount} Active
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 flex-grow">
                {projects.map(project => {
                    const isRunning = project.status === 'RUNNING';
                    return (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                            <div className="flex-1 min-w-0 mr-3">
                                <div className="font-semibold text-sm truncate" title={project.config.name}>{project.config.name}</div>
                                {project.config.port && (
                                    <div className="text-xs text-gray-400 font-mono">:{project.config.port}</div>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge status={project.status} />

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`!p-2 h-8 w-8 hover:bg-gray-200 ${isRunning ? 'text-red-500' : 'text-green-600'}`}
                                    onClick={() => isRunning ? onStop(project) : onStart(project)}
                                    title={isRunning ? "Stop" : "Start"}
                                >
                                    {isRunning ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                                </Button>

                                <button
                                    onClick={() => onViewLogs(project)}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
                                    title="View Logs"
                                >
                                    <Terminal size={14} />
                                </button>

                                {project.config.port && (
                                    <a
                                        href={`http://localhost:${project.config.port}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
                                        title="Open in Browser"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
