import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { castVote } from '../lib/voting';

const CANDIDATES = [
    { id: 'dmk', name: 'DMK', party: 'Dravida Munnetra Kazhagam', color: 'bg-red-600', logo: '/parties/dmk.png' },
    { id: 'tvk', name: 'TVK', party: 'Tamizhaga Vetri Kazhagam', color: 'bg-yellow-600', logo: '/parties/tvk.jpg' },
    { id: 'aiadmk', name: 'AIADMK', party: 'All India Anna Dravida Munnetra Kazhagam', color: 'bg-emerald-600', logo: '/parties/aiadmk.jpg' },
    { id: 'ntk', name: 'NTK', party: 'Naam Tamilar Katchi', color: 'bg-orange-600', logo: '/parties/ntk.jpg' },
];

export default function VotingScreen() {
    const location = useLocation();
    const navigate = useNavigate();
    const { mobile, faceHash, faceDescriptor } = location.state || {};

    const [selectedId, setSelectedId] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!mobile || !faceHash) {
        return (
            <Layout>
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-slate-100 p-4 rounded-full mb-4"><Info size={32} className="text-slate-400" /></div>
                    <p className="text-slate-500 font-medium">Session expired or invalid.</p>
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold">Restart</button>
                </div>
            </Layout>
        );
    }

    const handleSubmit = async () => {
        if (!selectedId) return;
        setSubmitting(true);
        setError('');

        const candidate = CANDIDATES.find(c => c.id === selectedId);

        try {
            await castVote({
                mobile,
                faceHash,
                faceDescriptor,
                candidateId: candidate.id,
                candidateName: candidate.name,
                party: candidate.party
            });
            navigate('/success');
        } catch (err) {
            console.error(err);
            // Handle Firestore permissions (Rule rejection) OR Custom AI Duplicate Error
            if (err.message.includes('permission-denied') ||
                err.code === 'permission-denied' ||
                err.message.includes('already voted') ||
                err.message.includes('Duplicate')) {
                navigate('/already-voted');
            } else {
                // Show specific error if available, else generic
                setError(err.message || 'Vote failed. Please try again or contact support.');
                setSubmitting(false);
            }
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col px-4 pt-6 pb-32">
                <div className="mb-6 px-2">
                    <h2 className="text-2xl font-semibold text-slate-900">Official Ballot</h2>
                    <p className="text-slate-500 text-sm mt-1">Select one candidate from the list below.</p>
                </div>

                <div className="space-y-4">
                    {CANDIDATES.map((candidate) => {
                        const isSelected = selectedId === candidate.id;
                        return (
                            <motion.div
                                key={candidate.id}
                                layout
                                onClick={() => setSelectedId(candidate.id)}
                                className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 overflow-hidden group ${isSelected
                                    ? 'border-orange-500 bg-orange-50/50 shadow-lg ring-1 ring-orange-200'
                                    : 'border-slate-100 bg-white hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                {isSelected && (
                                    <motion.div
                                        layoutId="highlight"
                                        className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent pointer-events-none"
                                    />
                                )}

                                <div className={`relative z-10 w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden bg-white border ${isSelected ? 'border-orange-200' : 'border-slate-100'}`}>
                                    <img src={candidate.logo} alt={candidate.party} className="w-full h-full object-contain p-2" />
                                </div>

                                <div className="flex-1 relative z-10">
                                    <h3 className={`font-semibold text-lg leading-tight ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                                        {candidate.name}
                                    </h3>
                                    <p className={`text-xs font-medium uppercase tracking-wide mt-1 ${isSelected ? 'text-orange-600' : 'text-slate-400'}`}>
                                        {candidate.party}
                                    </p>
                                </div>

                                <div className={`relative z-10 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-300 text-transparent'
                                    }`}>
                                    <Check size={16} strokeWidth={3} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Error Toast */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-4 right-4 bg-rose-600 text-white p-4 rounded-xl text-center text-sm font-medium shadow-2xl z-50"
                    >
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sticky Action Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pt-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-40">
                <div className="max-w-md mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={!selectedId || submitting}
                        className="w-full h-16 bg-gradient-to-r from-slate-900 to-slate-800 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500 text-white font-medium rounded-2xl text-lg shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? (
                            <>Processing Vote...</>
                        ) : (
                            <>Confirm Vote <Check size={20} className="ml-1" /></>
                        )}
                    </button>
                </div>
            </div>
        </Layout>
    );
}
