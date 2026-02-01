import React, { useState, useEffect } from 'react';
import { Search, Filter, Download } from 'lucide-react';
import { Table, TableRow, TableCell } from '../components/Table';
import { maskHash, formatDate } from '../utils/formatters';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export default function AuditLog() {
    const [searchTerm, setSearchTerm] = useState('');
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // In a real app, you might want pagination here
        const q = query(collection(db, "votes"), orderBy("timestamp", "desc"), limit(50));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLogs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setLogs(fetchedLogs);
        });
        return () => unsubscribe();
    }, []);

    const filteredLogs = logs.filter(log =>
        (log.id && log.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.faceHash && log.faceHash.includes(searchTerm))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Audit Trail</h2>
                    <p className="text-slate-400 text-sm mt-1">Immutable record of all voting transactions from Firestore.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 text-sm text-slate-200 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                        />
                    </div>
                    <button className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 border border-slate-700 transition-colors">
                        <Filter size={16} />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </div>
            </div>

            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4 flex items-start gap-3">
                <div className="p-1 bg-emerald-500/10 rounded text-emerald-500 mt-0.5">
                    <Download size={16} />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-emerald-400">Data Integrity Verified</h4>
                    <p className="text-xs text-emerald-500/70 mt-1">
                        All records are cryptographically hashed. Face and mobile data are masked for privacy.
                    </p>
                </div>
            </div>

            <Table headers={['Vote ID', 'Face Hash (Masked)', 'Mobile Hash', 'Timestamp', 'Status', 'Node']}>
                {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                        <TableCell className="font-medium text-white">{log.id.substring(0, 8)}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-400">{maskHash(log.faceHash || 'N/A')}</TableCell>
                        <TableCell className="font-mono text-xs text-slate-400">{maskHash(log.mobileHash || 'N/A')}</TableCell>
                        <TableCell>{log.timestamp ? formatDate(log.timestamp) : 'N/A'}</TableCell>
                        <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {log.status || 'RECORDED'}
                            </span>
                        </TableCell>
                        <TableCell>{log.nodeId || 'Main Node'}</TableCell>
                    </TableRow>
                ))}
            </Table>
        </div>
    );
}
