import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertOctagon, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';

export default function AlreadyVoted() {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-rose-500/10 border-2 border-rose-100">
                        <AlertOctagon size={64} className="text-rose-500" strokeWidth={1.5} />
                    </div>
                </motion.div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Access Denied</h1>
                <p className="text-slate-500 font-medium leading-relaxed max-w-xs">
                    Our secure registry indicates that a vote has already been cast with these credentials.
                </p>

                <div className="mt-8 mb-8 p-4 bg-orange-50 rounded-xl border border-orange-100 text-left w-full max-w-xs">
                    <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-1">Security Alert</h4>
                    <p className="text-xs text-orange-700">ErrorCode: <span className="font-mono">DUPLICATE_ENTRY_REJECTED</span></p>
                    <p className="text-[10px] text-orange-600/80 mt-2">
                        Violation of "One Person, One Vote" protocol is a punishable offense under Election Laws.
                    </p>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors"
                >
                    <ArrowLeft size={16} /> Return to Home
                </button>
            </div>
        </Layout>
    );
}
