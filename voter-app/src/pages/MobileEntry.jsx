import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Smartphone, ArrowRight, Loader } from 'lucide-react';
import Layout from '../components/Layout';

export default function MobileEntry() {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validateMobile = (num) => /^[0-9]{10}$/.test(num);

    const handleContinue = async () => {
        if (!validateMobile(mobile)) {
            setError('Enter a valid 10-digit mobile number.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            navigate('/face-scan', { state: { mobile } });
        } catch (err) {
            console.error(err);
            setError('System error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col justify-center px-8 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8 relative z-10"
                >
                    <div className="text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-orange-200 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 shadow-xl text-orange-600 mb-2">
                                <Smartphone size={40} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Voter Login</h2>
                            <p className="text-slate-500 font-normal text-sm mt-2 leading-relaxed max-w-[260px] mx-auto">
                                Enter your mobile number to check eligibility.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="relative bg-white rounded-xl shadow-sm border border-slate-100 focus-within:border-orange-400 focus-within:ring-4 focus-within:ring-orange-100 transition-all">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-lg select-none pointer-events-none">
                                +91
                            </span>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setMobile(val);
                                    setError('');
                                }}
                                className="w-full h-14 pl-14 pr-4 bg-transparent text-lg font-medium tracking-widest outline-none rounded-xl text-slate-900 placeholder:text-slate-300"
                                placeholder="00000 00000"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-rose-50 text-rose-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 border border-rose-100"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                {error}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 relative z-20">
                <button
                    onClick={handleContinue}
                    disabled={mobile.length !== 10 || loading}
                    className="w-full h-16 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 text-white font-medium rounded-2xl text-lg shadow-xl shadow-slate-200/50 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    {loading ? <Loader className="animate-spin" /> : <>Continue <ArrowRight size={20} /></>}
                </button>
            </div>
        </Layout>
    );
}
