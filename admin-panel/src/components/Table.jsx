import React from 'react';

export function Table({ headers, children }) {
    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="bg-slate-800/50 text-xs uppercase text-slate-200">
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx} className="px-6 py-4 font-medium tracking-wider">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {children}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function TableRow({ children }) {
    return (
        <tr className="transition-colors hover:bg-slate-800/30">
            {children}
        </tr>
    );
}

export function TableCell({ children, className }) {
    return (
        <td className={`px-6 py-4 whitespace-nowrap ${className || ''}`}>
            {children}
        </td>
    );
}
