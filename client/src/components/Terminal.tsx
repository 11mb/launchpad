import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react';
import Draggable from 'react-draggable';

interface TerminalProps {
    projectId: string;
    projectName: string;
    onClose: () => void;
    zIndex: number;
    onFocus: () => void;
}

const SOCKET_URL = 'http://localhost:3000';

export function Terminal({ projectId, projectName, onClose, zIndex, onFocus }: TerminalProps) {
    const [cLogs, setLogs] = useState<string[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);
    const nodeRef = useRef(null);

    useEffect(() => {
        // Connect to socket
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
            socketRef.current?.emit('join-project', projectId);
        });

        socketRef.current.on('log', (data: string) => {
            setLogs(prev => [...prev, data]);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave-project', projectId);
                socketRef.current.disconnect();
            }
        };
    }, [projectId]);

    useEffect(() => {
        // Auto scroll
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [cLogs]);

    return (
        <Draggable handle=".terminal-header" nodeRef={nodeRef} onStart={onFocus}>
            <div
                ref={nodeRef}
                className={`fixed bg-[#1e1e1e] text-gray-300 shadow-2xl transition-height duration-300 border border-gray-700 rounded-lg flex flex-col font-mono text-sm ${isExpanded ? 'w-[80vw] h-[80vh]' : 'w-[600px] h-[400px]'}`}
                style={{ zIndex, top: '100px', left: '100px' }}
                onClick={onFocus}
            >
                <div className="terminal-header flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700 select-none cursor-move rounded-t-lg">
                    <div className="flex items-center gap-2">
                        <TerminalIcon size={14} className="text-green-500" />
                        <span className="font-semibold text-xs text-white uppercase tracking-wider">{projectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                            className="p-1 hover:bg-white/10 rounded px-2 text-xs text-gray-500 hover:text-white transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                        >
                            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded text-gray-400 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#1e1e1e]" ref={scrollRef}>
                    {cLogs.length === 0 ? (
                        <div className="text-gray-600 italic select-none">Waiting for logs...</div>
                    ) : (
                        <pre className="whitespace-pre-wrap break-all leading-relaxed">
                            {cLogs.map((log, i) => (
                                <span key={i}>{log}</span>
                            ))}
                        </pre>
                    )}
                </div>
            </div>
        </Draggable>
    );
}
