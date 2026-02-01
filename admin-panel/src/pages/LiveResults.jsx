import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Card } from '../components/Card';
import { Download, Loader } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const COLORS = ['#10b981', '#3b82f6', '#6366f1', '#f59e0b', '#ec4899', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-lg">
                <p className="text-white font-medium">{label || payload[0].name}</p>
                <p className="text-emerald-400 font-bold">{payload[0].value.toLocaleString()} votes</p>
            </div>
        );
    }
    return null;
};

export default function LiveResults() {
    const [candidateData, setCandidateData] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Aggregation Listener
        const unsubscribe = onSnapshot(collection(db, "votes"), (snapshot) => {
            const counts = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const name = data.candidateName || 'Unknown';
                counts[name] = (counts[name] || 0) + 1;
            });

            const chartData = Object.keys(counts).map((name, index) => ({
                name,
                votes: counts[name],
                color: COLORS[index % COLORS.length]
            })).sort((a, b) => b.votes - a.votes);

            setCandidateData(chartData);
            setTotalVotes(snapshot.size);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px] text-emerald-500">
                <Loader className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Live Election Results</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time data visualization from Firestore.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors">
                    <Download size={16} />
                    <span>Export Report</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Vote Distribution</h3>
                    <div className="h-[300px] w-full">
                        {candidateData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={candidateData} layout="vertical" margin={{ left: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.4 }} />
                                    <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={32}>
                                        {candidateData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">No votes cast yet.</div>
                        )}
                    </div>
                </Card>

                <Card className="min-h-[400px]">
                    <h3 className="text-lg font-semibold text-white mb-6">Share by Percentage</h3>
                    <div className="h-[300px] w-full relative">
                        {candidateData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={candidateData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="votes"
                                        strokeWidth={0}
                                    >
                                        {candidateData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">No data</div>
                        )}
                        {totalVotes > 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold text-white">{totalVotes.toLocaleString()}</span>
                                <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Total Votes</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 space-y-2">
                        {candidateData.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                                    <span className="text-slate-300">{entry.name}</span>
                                </div>
                                <span className="font-mono text-slate-400">{((entry.votes / totalVotes) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
