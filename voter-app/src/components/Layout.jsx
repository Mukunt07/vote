import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-orange-500 selection:text-white">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>

            <div className="w-full max-w-md bg-white shadow-2xl min-h-screen flex flex-col relative overflow-hidden border-x border-slate-200">
                {/* Header */}
                <header className="px-6 py-4 bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-2 rounded-xl text-white shadow-lg shadow-orange-500/20">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h1 className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight leading-none">Tamil Nadu</h1>
                            <p className="text-[10px] font-medium text-orange-600 uppercase tracking-widest">State Election 2026</p>
                        </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </header>

                <main className="flex-1 flex flex-col relative z-10 bg-gradient-to-b from-slate-50 to-white">
                    {children}
                </main>

                {/* Footer */}
                <footer className="py-8 px-6 text-center bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">
                            Official Survey & Project
                        </p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                            Tamil Nadu Election 2026 Sentiment Analysis<br />
                            A Collegiate Engineering Project
                        </p>
                    </div>

                    <div className="pt-4 border-t border-slate-200/60">
                        <h4 className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mb-2 underline underline-offset-2">
                            Terms & Conditions
                        </h4>
                        <p className="text-[9px] text-slate-400 leading-tight text-balance">
                            This is a <strong>simulated voting platform</strong> created for academic purposes.
                            Votes cast here are part of a public opinion survey and carry no legal weight.
                            Biometric data is processed locally into anonymous hashes to prevent duplicates.
                            By using this app, you agree to participate in this research project.
                        </p>
                    </div>

                    <p className="text-[8px] text-slate-300 font-mono mt-2">
                        v1.2.0 Hardened Build
                    </p>
                </footer>
            </div>
        </div>
    );
}
