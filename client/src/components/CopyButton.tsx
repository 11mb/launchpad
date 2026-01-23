import { type FC, useState } from 'react';
import { Copy, Check } from 'lucide-react';

export const CopyButton: FC<{ text: string }> = ({ text }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button
            onClick={handleCopy}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
            title="Copy Path"
        >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
        </button>
    );
};
