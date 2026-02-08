import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Card } from '../components/Card';
import { Download, Loader, TrendingUp } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const CANDIDATE_META = {
    'dmk': { name: 'DMK', color: '#dc2626', logo: '/parties/dmk.png' },
    'tvk': { name: 'TVK', color: '#ca8a04', logo: '/parties/tvk.jpg' },
    'aiadmk': { name: 'AIADMK', color: '#059669', logo: '/parties/aiadmk.jpg' },
    'ntk': { name: 'NTK', color: '#ea580c', logo: '/parties/ntk.jpg' },
    'nota': { name: 'NOTA', color: '#475569', logo: '/parties/nota.png' }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl">
                <div className="flex items-center gap-3 mb-2">
                    <img src={data.logo} alt={data.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                    <p className="text-white font-bold text-lg">{data.name}</p>
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-emerald-400">{payload[0].value.toLocaleString()}</span>
                    <span className="text-slate-400 text-sm">votes</span>
                </div>
            </div>
        );
    }
    return null;
};

const CustomLabel = (props) => {
    const { x, y, width, height, value } = props;
    return (
        <text x={x + width + 8} y={y + height / 2 + 4} fill="#94a3b8" fontSize="12" fontWeight="bold">
            {value}
        </text>
    );
};

export default function LiveResults() {
    const [candidateData, setCandidateData] = useState([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [loading, setLoading] = useState(true);
    const [leader, setLeader] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "votes"), (snapshot) => {
            const counts = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                const id = data.candidateId || 'unknown';
                counts[id] = (counts[id] || 0) + 1;
            });

            const chartData = Object.keys(counts).map((id) => {
                const meta = CANDIDATE_META[id] || { name: 'Independent', color: '#64748b', logo: '' };
                return {
                    id,
                    name: meta.name,
                    logo: meta.logo,
                    votes: counts[id],
                    color: meta.color
                };
            }).sort((a, b) => b.votes - a.votes);

            setCandidateData(chartData);
            setTotalVotes(snapshot.size);
            if (chartData.length > 0) setLeader(chartData[0]);
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Live Election Results</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time vote aggregation & analytics.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors text-sm font-medium">
                    <Download size={16} />
                    <span>Generate Final Report</span>
                </button>
            </div>

            {/* Leader Card */}
            {leader && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-6 shadow-2xl">
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="relative w-20 h-20 rounded-2xl p-1 bg-gradient-to-br from-amber-300 to-yellow-600 shadow-lg">
                                <img src={leader.logo} alt={leader.name} className="w-full h-full object-cover rounded-xl bg-white" />
                                <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                                    <TrendingUp size={12} /> LEADING
                                </div>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">Current Leader</p>
                                <h3 className="text-3xl font-bold text-white">{leader.name}</h3>
                                <p className="text-emerald-400 font-mono font-medium">
                                    {(leader.votes / totalVotes * 100).toFixed(1)}% <span className="text-slate-500 text-sm">of votes</span>
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-4xl font-bold text-white">{leader.votes.toLocaleString()}</p>
                            <p className="text-slate-500 text-sm">Total Votes</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 min-h-[400px] bg-slate-800/50 backdrop-blur border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6">Vote Visualizer</h3>
                    <div className="h-[300px] w-full">
                        {candidateData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={candidateData} layout="vertical" margin={{ left: 0, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={({ x, y, payload }) => {
                                            const data = candidateData.find(c => c.name === payload.value);
                                            return (
                                                <g transform={`translate(${x},${y})`}>
                                                    <image href={data?.logo} x={-140} y={-10} width={20} height={20} style={{ borderRadius: '50%' }} clipPath="circle()" />
                                                    <text x={-110} y={4} fill="#cbd5e1" fontSize={12} textAnchor="start">{payload.value}</text>
                                                </g>
                                            )
                                        }}
                                        width={150}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.2 }} />
                                    <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={24}>
                                        {candidateData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
                                <p>Waiting for votes...</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="min-h-[400px] bg-slate-800/50 backdrop-blur border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-6">Analytics</h3>
                    <div className="h-[200px] w-full relative mb-6">
                        {candidateData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={candidateData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
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

                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                        {candidateData.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <img src={entry.logo} alt={entry.name} className="w-8 h-8 rounded-lg object-cover bg-white" />
                                    <div>
                                        <p className="text-slate-200 font-medium text-sm">{entry.name}</p>
                                        <div className="w-16 h-1 rounded-full bg-slate-700 mt-1 overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${(entry.votes / totalVotes * 100)}%`, backgroundColor: entry.color }}></div>
                                        </div>
                                    </div>
                                </div>
                                <span className="font-mono text-emerald-400 font-bold">{((entry.votes / totalVotes) * 100).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
