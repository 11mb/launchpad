import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md';
    className?: string;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    className = '',
    children,
    ...props
}) => {
    const baseStyles = "rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 flex items-center justify-center";

    const sizes = {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2"
    };

    const variants = {
        primary: "bg-primary text-white hover:bg-gray-800 shadow-md hover:shadow-lg focus:ring-gray-900 border border-transparent",
        secondary: "bg-white text-secondary border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow focus:ring-gray-200",
        ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-black border-transparent shadow-none"
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

