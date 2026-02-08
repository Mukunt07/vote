import React, { useEffect, useState } from 'react';
import { Users, Vote, Clock, Activity, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { MetricCard, Card } from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalVotes: 0,
        activeVoters: 0,
        lastVoteTime: 'Waiting...'
    });
    const [trendData, setTrendData] = useState([]);
    const [recentVotes, setRecentVotes] = useState([]);

    useEffect(() => {
        // Listen to votes count & trend
        const unsubVotes = onSnapshot(collection(db, "votes"), (snapshot) => {
            setStats(prev => ({ ...prev, totalVotes: snapshot.size }));

            // Process trend data (Group by Hour)
            const buckets = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.timestamp) {
                    const date = new Date(data.timestamp);
                    const hour = date.getHours().toString().padStart(2, '0') + ':00';
                    buckets[hour] = (buckets[hour] || 0) + 1;
                }
            });
            // Fill missing hours for smoother chart
            const now = new Date();
            for (let i = 0; i < 6; i++) {
                const hour = new Date(now.getTime() - i * 60 * 60 * 1000).getHours().toString().padStart(2, '0') + ':00';
                if (!buckets[hour]) buckets[hour] = 0;
            }

            const trend = Object.keys(buckets).map(time => ({ time, votes: buckets[time] }))
                .sort((a, b) => a.time.localeCompare(b.time));
            setTrendData(trend.slice(-8));

            // Calculate Last Vote Time
            if (!snapshot.empty) {
                const times = snapshot.docs
                    .map(d => d.data().timestamp)
                    .filter(t => t)
                    .sort((a, b) => new Date(b) - new Date(a));

                if (times.length > 0) {
                    const lastTime = new Date(times[0]);
                    const diff = Math.floor((Date.now() - lastTime) / 1000);
                    setStats(prev => ({
                        ...prev,
                        lastVoteTime: diff < 60 ? `${diff}s ago` : `${Math.floor(diff / 60)}m ago`
                    }));
                }
            }
        });

        // Listen to voters count
        const unsubVoters = onSnapshot(collection(db, "face_registry"), (snapshot) => {
            setStats(prev => ({ ...prev, activeVoters: snapshot.size }));
        });

        // Listen for Recent Activity (Last 50 votes)
        const q = query(collection(db, "votes"), orderBy("timestamp", "desc"), limit(50));
        const unsubRecent = onSnapshot(q, (snapshot) => {
            const votes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRecentVotes(votes);
        });

        return () => {
            unsubVotes();
            unsubVoters();
            unsubRecent();
        };
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Election Command Center</h1>
                <p className="text-slate-400 mt-1">System status and live polling surveillance.</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Ballots"
                    value={stats.totalVotes.toLocaleString()}
                    icon={Vote}
                    trend="Live Count"
                    trendUp={true}
                    color="emerald"
                />
                <MetricCard
                    title="Verified Biometrics"
                    value={stats.activeVoters.toLocaleString()}
                    icon={ShieldCheck}
                    trend="Face ID Secure"
                    trendUp={true}
                    color="blue"
                />
                <MetricCard
                    title="Hourly Velocity"
                    value={trendData.length > 0 ? trendData[trendData.length - 1].votes : 0}
                    icon={TrendingUp}
                    trend="Votes / Hour"
                    trendUp={true}
                    color="amber"
                />
                <MetricCard
                    title="Real-time Latency"
                    value={stats.lastVoteTime}
                    icon={Activity}
                    trend="Last Interaction"
                    color="purple"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <Card className="lg:col-span-2 min-h-[400px] bg-slate-800/40 backdrop-blur border-slate-700/50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Voting Traffic</h3>
                            <p className="text-slate-400 text-sm">Incoming vote volume over time</p>
                        </div>
                        <div className="flex gap-2 text-sm text-slate-400 bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <span className="px-3 py-1 bg-slate-700 text-white rounded-md shadow-sm">Live</span>
                        </div>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData.length > 0 ? trendData : [{ time: 'Now', votes: 0 }]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorVotes" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }}
                                    itemStyle={{ color: '#10b981' }}
                                    formatter={(value) => [`${value} Votes`, 'Traffic']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="votes"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVotes)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Recent Activity Feed */}
                <Card className="h-[600px] bg-slate-800/40 backdrop-blur border-slate-700/50 flex flex-col">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                            <p className="text-slate-400 text-sm">Live ledger updates</p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {recentVotes.length > 0 ? (
                            recentVotes.map((vote) => (
                                <div key={vote.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800/50 hover:border-slate-700 transition-all group">
                                    <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${vote.party === 'Dravida Munnetra Kazhagam' ? 'bg-red-500' :
                                        vote.party === 'Tamizhaga Vetri Kazhagam' ? 'bg-yellow-500' :
                                            vote.party === 'All India Anna Dravida Munnetra Kazhagam' ? 'bg-emerald-500' :
                                                vote.party === 'None Of The Above' ? 'bg-slate-500' :
                                                    'bg-orange-500'
                                        }`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-medium text-slate-200">
                                                Vote Cast for <span className="text-white font-bold">{vote.candidateName}</span>
                                            </p>
                                            <span className="text-xs font-mono text-slate-500 whitespace-nowrap">
                                                {new Date(vote.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px] font-mono opacity-60 group-hover:opacity-100 transition-opacity">
                                            Hash: {vote.faceHash?.substring(0, 16)}...
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
                                <Clock size={24} className="opacity-20" />
                                <p>Waiting for incoming votes...</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800">
                        <div className="flex justify-between items-center text-xs text-slate-400">
                            <span>Blockchain Status</span>
                            <span className="flex items-center gap-1.5 text-emerald-400">
                                <ShieldCheck size={12} /> Encrypted & Immutable
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
