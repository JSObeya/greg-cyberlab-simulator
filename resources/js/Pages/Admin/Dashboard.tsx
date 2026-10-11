import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldAlert, Users, Award, FileSpreadsheet, Activity, CheckCircle, Clock } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface AdminDashboardProps {
    stats: {
        totalUsers: number;
        trainees: number;
        instructors: number;
        courses: number;
        publishedLabs: number;
        totalAttempts: number;
        passedAttempts: number;
    };
    recentAttempts: any[];
}

export default function AdminDashboard({ stats, recentAttempts }: AdminDashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Administrator Operations Center
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Greg & Co. ICT Academy — Makurdi Cybersecurity Training Facility
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={route('reports.export')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Export Safe CSV Report
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Admin Operations - Greg Cyberlab" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-2">
                                <Users className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Users</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalUsers}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.trainees} Trainees | {stats.instructors} Instructors</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-2">
                                <ShieldAlert className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Labs</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.publishedLabs}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">100% Educational Sandbox Enforced</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <div className="flex items-center gap-3 text-indigo-600 dark:text-indigo-400 mb-2">
                                <Activity className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lab Attempts</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalAttempts}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{stats.passedAttempts} Passed Demonstrations</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400 mb-2">
                                <Award className="w-5 h-5" />
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Success Rate</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">
                                {stats.totalAttempts > 0 ? Math.round((stats.passedAttempts / stats.totalAttempts) * 100) : 100}%
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Passing Grade Threshold: 70%</p>
                        </div>
                    </div>

                    {/* Recent Submissions Table */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Lab Demonstrations</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Real-time simulation audit logs</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-6">Trainee</th>
                                        <th className="py-3 px-6">Laboratory</th>
                                        <th className="py-3 px-6">Score</th>
                                        <th className="py-3 px-6">Status</th>
                                        <th className="py-3 px-6">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {recentAttempts.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                            <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                                                {att.user?.name}
                                                <span className="block text-[11px] text-slate-400 font-normal">{att.user?.email}</span>
                                            </td>
                                            <td className="py-3.5 px-6">{att.laboratory?.title}</td>
                                            <td className="py-3.5 px-6 font-bold">{att.final_score}%</td>
                                            <td className="py-3.5 px-6">
                                                {att.is_passed ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full text-[11px]">
                                                        <CheckCircle className="w-3.5 h-3.5" /> Passed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full text-[11px]">
                                                        <Clock className="w-3.5 h-3.5" /> In Review
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-6 text-slate-400">{new Date(att.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
