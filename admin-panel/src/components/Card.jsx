import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export function Card({ children, className }) {
    return (
        <div className={cn("bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm", className)}>
            {children}
        </div>
    );
}

export function MetricCard({ title, value, icon: Icon, trend, trendUp }) {
    return (
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-medium text-slate-400">{title}</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg text-emerald-500">
                    <Icon size={24} />
                </div>
            </div>
            {trend && (
                <div className={cn("mt-4 flex items-center text-sm", trendUp ? "text-emerald-500" : "text-rose-500")}>
                    <span>{trend}</span>
                    <span className="ml-2 text-slate-500">vs last hour</span>
                </div>
            )}
        </Card>
    );
}
