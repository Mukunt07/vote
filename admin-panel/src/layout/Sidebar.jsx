import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, FileText, Activity, ShieldCheck, LogOut, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const NavItem = ({ icon: Icon, label, active, to, onClick, collapsed }) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            "flex items-center w-full px-4 py-3 mb-1 transition-colors rounded-lg group",
            active
                ? "bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 rounded-l-none"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        )}
    >
        <Icon size={20} className={cn("shrink-0", active ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200")} />
        {!collapsed && <span className="ml-3 font-medium text-sm">{label}</span>}
    </Link>
);

export default function Sidebar({ mobileOpen, setMobileOpen, activePage, onLogout, user }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'results', label: 'Live Results', icon: CheckCircle, path: '/results' },
        { id: 'audit', label: 'Audit Log', icon: FileText, path: '/audit' },
        { id: 'status', label: 'System Status', icon: Activity, path: '/status' },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-slate-950/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-300 lg:translate-x-0 lg:static lg:shrink-0",
                mobileOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="flex items-center h-16 px-6 border-b border-slate-800">
                        <img src="/logo.png" alt="SecureVote Logo" className="w-8 h-8 object-contain" />
                        <span className="ml-3 text-lg font-bold tracking-tight text-white">
                            Secure<span className="text-emerald-500">Vote</span>
                        </span>
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="ml-auto lg:hidden text-slate-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-3 py-6 space-y-1">
                        {menuItems.map((item) => (
                            <NavItem
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                active={activePage === item.id}
                                to={item.path}
                                onClick={() => setMobileOpen(false)}
                            />
                        ))}
                    </nav>

                    {/* Footer User Info */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center p-3 rounded-xl bg-slate-800/50">
                            {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold">
                                    {user?.email?.[0].toUpperCase() || 'A'}
                                </div>
                            )}
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-white truncate" title={user?.email}>{user?.email || 'N/A'}</p>
                                <p className="text-xs text-emerald-500">Authorized</p>
                            </div>
                        </div>
                        <button
                            onClick={onLogout}
                            className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-slate-400 transition-colors rounded-lg hover:text-white hover:bg-slate-800 hover:bg-red-500/10 hover:text-red-400 group"
                        >
                            <LogOut size={16} className="mr-2 group-hover:text-red-400" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
