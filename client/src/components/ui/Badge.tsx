import React from 'react';

interface BadgeProps {
    status: 'RUNNING' | 'STOPPED' | string;
}

export const Badge: React.FC<BadgeProps> = ({ status }) => {
    const isRunning = status === 'RUNNING';

    // Tailwind classes based on config:
    // Running: bg-[#DEF7EC] text-[#03543F] (emerald-ish)
    // Stopped: bg-[#F3F4F6] text-[#374151] (cool gray)

    const styles = isRunning
        ? "bg-accent-running-bg text-accent-running-text"
        : "bg-accent-stopped-bg text-accent-stopped-text";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles} flex items-center gap-1.5`}>
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}></span>
            {status}
        </span>
    );
};
