import { useEffect, useState, useRef, memo, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { X, Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react';
import Draggable from 'react-draggable';
import { ResizableBox, type ResizeCallbackData } from 'react-resizable';

// Import CSS for resizable (or we can style handles ourselves)
// Note: Usually requires some CSS for the handles.
import 'react-resizable/css/styles.css';

interface TerminalProps {
    projectId: string;
    projectName: string;
    onClose: () => void;
    zIndex: number;
    onFocus: () => void;
}

const SOCKET_URL = 'http://localhost:3000';

const LogContent = memo(({ projectId }: { projectId: string }) => {
    const [cLogs, setLogs] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
            socketRef.current?.emit('join-project', projectId);
        });

        socketRef.current.on('log', (data: string) => {
            setLogs(prev => {
                const next = [...prev, data];
                return next.length > 500 ? next.slice(-500) : next;
            });
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave-project', projectId);
                socketRef.current.disconnect();
            }
        };
    }, [projectId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [cLogs]);

    return (
        <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#1e1e1e]" ref={scrollRef}>
            {cLogs.length === 0 ? (
                <div className="text-gray-600 italic select-none">Waiting for logs...</div>
            ) : (
                <pre className="whitespace-pre-wrap break-all leading-relaxed font-mono text-xs">
                    {cLogs.map((log, i) => (
                        <span key={i}>{log}</span>
                    ))}
                </pre>
            )}
        </div>
    );
});

export function Terminal({ projectId, projectName, onClose, zIndex, onFocus }: TerminalProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [size, setSize] = useState({ width: 600, height: 400 });
    const nodeRef = useRef(null);

    const defaultPos = useMemo(() => ({
        x: 50 + Math.random() * 50,
        y: 50 + Math.random() * 50
    }), []);

    const onResize = (_: any, data: ResizeCallbackData) => {
        setSize({ width: data.size.width, height: data.size.height });
    };

    const terminalWidth = isExpanded ? window.innerWidth * 0.8 : size.width;
    const terminalHeight = isExpanded ? window.innerHeight * 0.8 : size.height;

    return (
        <Draggable
            handle=".terminal-header"
            nodeRef={nodeRef}
            onStart={onFocus}
            defaultPosition={defaultPos}
        >
            <div
                ref={nodeRef}
                className={`fixed bg-[#1e1e1e] text-gray-300 shadow-2xl border border-gray-700 rounded-lg flex flex-col font-mono text-sm overflow-hidden ${isExpanded ? 'transition-all duration-300' : ''}`}
                style={{
                    zIndex,
                    width: terminalWidth,
                    height: terminalHeight
                }}
                onClick={onFocus}
            >
                {/* Header handle for dragging */}
                <div className="terminal-header flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700 select-none cursor-move rounded-t-lg shrink-0">
                    <div className="flex items-center gap-2">
                        <TerminalIcon size={14} className="text-green-500" />
                        <span className="font-semibold text-xs text-white uppercase tracking-wider truncate max-w-[200px]">{projectName}</span>
                    </div>
                    <div className="flex items-center gap-2">
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

                <div className="flex-1 flex flex-col relative min-h-0">
                    <LogContent projectId={projectId} />

                    {/* Only show resize handle when not expanded */}
                    {!isExpanded && (
                        <ResizableBox
                            width={size.width}
                            height={size.height}
                            minConstraints={[300, 200]}
                            maxConstraints={[1200, 800]}
                            onResize={onResize}
                            handle={<span className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize bg-transparent z-50 flex items-center justify-center">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-600 opacity-50">
                                    <path d="M10 0L0 10M10 5L5 10M10 8L8 10" stroke="currentColor" strokeWidth="1" />
                                </svg>
                            </span>}
                        >
                            <div style={{ width: 0, height: 0 }} />
                        </ResizableBox>
                    )}
                </div>
            </div>
        </Draggable>
    );
}
