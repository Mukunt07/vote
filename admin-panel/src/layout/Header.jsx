import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';

export default function Header({ onMenuClick, title }) {
    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 lg:px-8 sticky top-0 z-10 w-full">
            <button
                onClick={onMenuClick}
                className="p-2 -ml-2 text-slate-400 rounded-lg lg:hidden hover:text-white hover:bg-slate-800"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center justify-between w-full ml-4 lg:ml-0">
                <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>

                <div className="flex items-center gap-4">
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search audit logs..."
                            className="h-9 w-64 bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                        />
                    </div>
                    <button className="p-2 text-slate-400 rounded-full hover:text-white hover:bg-slate-800 relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-slate-900"></span>
                    </button>
                </div>
            </div>
        </header>
    );
}
