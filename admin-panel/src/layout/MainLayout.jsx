import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function MainLayout({ children, activePage, onNavigate, onLogout, user }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    // Map IDs to Titles
    const titles = {
        dashboard: 'Dashboard Overview',
        results: 'Live Election Results',
        audit: 'System Audit Logs',
        status: 'System Health Status',
    };

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-200 font-sans">
            <Sidebar
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                activePage={activePage}
                onNavigate={onNavigate}
                onLogout={onLogout}
                user={user}
            />

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header
                    onMenuClick={() => setMobileOpen(true)}
                    title={titles[activePage] || 'Admin Panel'}
                />

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
