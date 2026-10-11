import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Terminal, Shield, Award, CheckCircle, FileSpreadsheet } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface InstructorDashboardProps {
    stats: {
        activeLabs: number;
        totalSubmissions: number;
        pendingReviews: number;
    };
    recentSubmissions: any[];
}

export default function InstructorDashboard({ stats, recentSubmissions }: InstructorDashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Instructor Cohort Command
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Supervision & Laboratory Grading Workbench
                        </p>
                    </div>
                    <div>
                        <a
                            href={route('reports.export')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Download Results CSV
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Instructor Command - Greg Cyberlab" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Curriculum Scenarios</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.activeLabs}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">15 Preconfigured Sandboxed Labs</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Trainee Submissions</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.totalSubmissions}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Automated Scoring Evaluated</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pending Reviews</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats.pendingReviews}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ready for Manual Verification</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Cohort Trainee Submissions</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-100 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4">Trainee</th>
                                        <th className="py-3 px-4">Lab Title</th>
                                        <th className="py-3 px-4">Score</th>
                                        <th className="py-3 px-4">Result</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                    {recentSubmissions.map((sub) => (
                                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{sub.user?.name}</td>
                                            <td className="py-3 px-4">{sub.laboratory?.title}</td>
                                            <td className="py-3 px-4 font-bold">{sub.final_score}%</td>
                                            <td className="py-3 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                                                {sub.is_passed ? 'Passed' : 'Needs Review'}
                                            </td>
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
