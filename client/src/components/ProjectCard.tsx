import { type FC } from 'react';
import type { Project } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Play, Square, ExternalLink, Terminal, Copy } from 'lucide-react';

interface ProjectCardProps {
    project: Project;
    onStart: (project: Project) => void;
    onStop: (project: Project) => void;
    onViewLogs: (project: Project) => void;
}

export const ProjectCard: FC<ProjectCardProps> = ({ project, onStart, onStop, onViewLogs }) => {
    const { name, port } = project.config;
    const isRunning = project.status === 'RUNNING';

    // Gradient based on "color" or hash of name if not provided
    // For now, simple gradients.
    const gradientClass = `bg-gradient-to-br from-blue-100 to-purple-100`;

    const handleAction = () => {
        if (isRunning) {
            onStop(project);
        } else {
            onStart(project);
        }
    };

    return (
        <div className="bg-card rounded-3xl shadow-soft p-6 transition-all hover:shadow-lg flex flex-col gap-4 border border-gray-50 h-full bg-white text-left">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div className="flex gap-4 items-center">
                    {/* Logo / Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-gray-400 ${gradientClass}`}>
                        {name.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-primary tracking-tight">{name}</h3>
                        <div className="flex items-center gap-2 text-secondary text-sm mt-0.5">
                            {port && (
                                <>
                                    <span className="font-mono">localhost:{port}</span>
                                    <button className="text-gray-300 hover:text-gray-500 transition-colors">
                                        <Copy size={12} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <Badge status={project.status} />
            </div>

            {/* spacer */}
            <div className="flex-grow"></div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
                <Button
                    variant={isRunning ? 'primary' : 'primary'} // Keep primary for main action? Or Stop as secondary/red? Style guide says "Primary Action: Solid Black/Dark Blue".
                    className={isRunning ? "!bg-gray-900" : "!bg-black"}
                    onClick={handleAction}
                >
                    <span className="flex items-center gap-2">
                        {isRunning ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                        {isRunning ? 'Stop' : 'Start'}
                    </span>
                </Button>

                {port && (
                    <a
                        href={`http://localhost:${port}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                        title="Open in Browser"
                    >
                        <ExternalLink size={18} />
                    </a>
                )}

                <button
                    onClick={() => onViewLogs(project)}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors ml-auto"
                    title="Toggle Terminal View"
                >
                    <Terminal size={18} />
                </button>
            </div>
        </div>
    );
};
