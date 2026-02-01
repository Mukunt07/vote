import React from 'react';
import { Card } from '../components/Card';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Shield, Database } from 'lucide-react';

const StatusItem = ({ label, status, details }) => {
    const getStatusConfig = (s) => {
        switch (s) {
            case 'healthy': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
            case 'warning': return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
            case 'error': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
            default: return { icon: CheckCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20' };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <div className={`p-4 rounded-lg border ${config.bg} ${config.border} flex items-start gap-4`}>
            <div className={`p-2 rounded-full bg-slate-900/50 ${config.color}`}>
                <Icon size={20} />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="font-medium text-white">{label}</h4>
                    <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>{status}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{details}</p>
            </div>
        </div>
    );
};

export default function SystemStatus() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">System Status</h2>
                    <p className="text-slate-400 text-sm mt-1">Real-time health monitoring of voting infrastructure.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium">
                    <RefreshCw size={16} />
                    <span>Refresh Status</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Server className="text-emerald-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Core Services</h3>
                    </div>

                    <StatusItem
                        label="Firestore Database"
                        status="healthy"
                        details="Connection active. Latency: 45ms. Region: asia-south1"
                    />
                    <StatusItem
                        label="Authentication Service"
                        status="healthy"
                        details="Identity provider operational. 99.99% uptime."
                    />
                    <StatusItem
                        label="Face Recognition Node"
                        status="warning"
                        details="High load detected on Node-3. Auto-scaling in progress."
                    />
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Database className="text-blue-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Data Integrity</h3>
                    </div>

                    <StatusItem
                        label="Vote Collection"
                        status="healthy"
                        details="12,450 documents. No anomalies detected."
                    />
                    <StatusItem
                        label="Face Registry"
                        status="healthy"
                        details="Sync active. Backup completed 10m ago."
                    />
                    <StatusItem
                        label="Mobile Hash Ledger"
                        status="healthy"
                        details="Consistency check passed."
                    />
                </Card>

                <Card className="col-span-1 md:col-span-2 lg:col-span-1 space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Shield className="text-purple-500" size={24} />
                        <h3 className="text-lg font-semibold text-white">Security Rules</h3>
                    </div>

                    <StatusItem
                        label="Firestore Rules"
                        status="healthy"
                        details="Mode: LOCKED. Read-only for admins."
                    />
                    <StatusItem
                        label="Admin Access"
                        status="healthy"
                        details="MFA Enforced. No unauthorized attempts."
                    />
                    <StatusItem
                        label="API Gateway"
                        status="healthy"
                        details="DDoS protection active. Traffic normal."
                    />
                </Card>
            </div>
        </div>
    );
}
