import React, { useEffect, useState } from 'react';
import { Users, Vote, Clock, Activity } from 'lucide-react';
import { MetricCard, Card } from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalVotes: 0,
        activeVoters: 0,
        lastVoteTime: 'None'
    });
    const [trendData, setTrendData] = useState([]);

    useEffect(() => {
        // Listen to votes count
        const unsubVotes = onSnapshot(collection(db, "votes"), (snapshot) => {
            setStats(prev => ({ ...prev, totalVotes: snapshot.size }));

            // Process trend data (simplified for client-side demo)
            // In production, use aggregation queries or cloud functions
            const buckets = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.timestamp) {
                    const date = new Date(data.timestamp);
                    const hour = date.getHours().toString().padStart(2, '0') + ':00';
                    buckets[hour] = (buckets[hour] || 0) + 1;
                }
            });
            const trend = Object.keys(buckets).map(time => ({ time, votes: buckets[time] })).sort((a, b) => a.time.localeCompare(b.time));
            setTrendData(trend.slice(-8)); // Last 8 hours

            // Last Vote
            if (!snapshot.empty) {
                const times = snapshot.docs
                    .map(d => d.data().timestamp)
                    .filter(t => t)
                    .sort((a, b) => b - a);

                if (times.length > 0) {
                    const diff = Math.floor((Date.now() - times[0]) / 1000);
                    setStats(prev => ({
                        ...prev,
                        lastVoteTime: diff < 60 ? `${diff}s ago` : `${Math.floor(diff / 60)}m ago`
                    }));
                }
            }
        });

        // Listen to voters count (face_registry)
        const unsubVoters = onSnapshot(collection(db, "face_registry"), (snapshot) => {
            setStats(prev => ({ ...prev, activeVoters: snapshot.size }));
        });

        return () => {
            unsubVotes();
            unsubVoters();
        };
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Votes Cast"
                    value={stats.totalVotes.toLocaleString()}
                    icon={Vote}
                    trend="Live"
                    trendUp={true}
                />
                <MetricCard
                    title="Face Registry"
                    value={stats.activeVoters.toLocaleString()}
                    icon={Users}
                    trend="Synced"
                    trendUp={true}
                />
                <MetricCard
                    title="System Uptime"
                    value="99.9%"
                    icon={Activity}
                />
                <MetricCard
                    title="Last Vote"
                    value={stats.lastVoteTime}
                    icon={Clock}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-slate-900/50">
                    <h3 className="text-lg font-semibold text-white mb-6">Voting Trends (Last 24h)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <AreaChart data={trendData.length > 0 ? trendData : [{ time: 'Now', votes: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="votes" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVotes)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card className="min-h-[350px]">
                    <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-slate-400">Database Status</span>
                                <span className="text-emerald-400 font-medium">Connected</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
                                <p className="text-slate-400">Project: election2026-60409</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
