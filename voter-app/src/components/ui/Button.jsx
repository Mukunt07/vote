import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export const Button = ({ children, onClick, disabled, variant = 'primary', className, ...props }) => {
    const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-500",
        secondary: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50",
        danger: "bg-rose-600 text-white hover:bg-rose-700",
        gradient: "bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/10 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
