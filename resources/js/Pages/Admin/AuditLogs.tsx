import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ShieldAlert, Search, Filter, Clock, User, ArrowLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface AuditLog {
    id: number;
    action: string;
    entity_type: string | null;
    entity_id: number | null;
    ip_address: string;
    user_agent: string;
    payload: any;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
        role: string;
    } | null;
}

interface AuditLogsProps {
    auditLogs: {
        data: AuditLog[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        action?: string;
        entity?: string;
    };
}

export default function AuditLogs({ auditLogs, filters }: AuditLogsProps) {
    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get(
            route('admin.audit-logs'),
            {
                action: formData.get('action') as string,
                entity: formData.get('entity') as string,
            },
            { preserveState: true }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            Immutable System Audit & Security Trail
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Cryptographic tamper-evident operational logs
                        </p>
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="System Audit Logs - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Search & Filter Form */}
                <form
                    onSubmit={handleFilter}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-4 items-center"
                >
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            name="action"
                            defaultValue={filters.action || ''}
                            placeholder="Filter by action (e.g. attempt_submitted, cohort_created)..."
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        />
                    </div>
                    <div className="w-48">
                        <select
                            name="entity"
                            defaultValue={filters.entity || ''}
                            className="w-full text-xs rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            <option value="">All Entities</option>
                            <option value="Attempt">Attempt</option>
                            <option value="Cohort">Cohort</option>
                            <option value="Laboratory">Laboratory</option>
                            <option value="User">User</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1.5"
                    >
                        <Filter className="w-3.5 h-3.5" /> Apply Filter
                    </button>
                </form>

                {/* Audit Logs Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs font-sans">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">Event ID</th>
                                    <th className="py-3 px-4">Action</th>
                                    <th className="py-3 px-4">Actor</th>
                                    <th className="py-3 px-4">Entity</th>
                                    <th className="py-3 px-4">IP / User Agent</th>
                                    <th className="py-3 px-4">Payload</th>
                                    <th className="py-3 px-4">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {auditLogs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                                            #{log.id}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded text-[11px]">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 font-medium">
                                            {log.user ? (
                                                <div>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 block">{log.user.name}</span>
                                                    <span className="text-[10px] text-slate-400">{log.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">System Automation</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px]">
                                            {log.entity_type ? `${log.entity_type} #${log.entity_id}` : '—'}
                                        </td>
                                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                            {log.ip_address || '127.0.0.1'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {log.payload ? (
                                                <code className="text-[10px] bg-slate-100 dark:bg-slate-950 p-1 rounded block max-w-xs truncate text-slate-600 dark:text-slate-400">
                                                    {JSON.stringify(log.payload)}
                                                </code>
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
