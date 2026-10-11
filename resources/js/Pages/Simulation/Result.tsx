import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Award, CheckCircle2, XCircle, ChevronLeft, RotateCcw, BookOpen } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ResultProps {
    attempt: any;
}

export default function Result({ attempt }: ResultProps) {
    const isPassed = attempt.is_passed;
    const lab = attempt.laboratory;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Laboratory Debrief & Results</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{lab.title}</p>
                    </div>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 dark:border-slate-700 text-xs font-bold rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title={`Results - ${lab.title}`} />

            <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Result Hero Banner */}
                <div className={`p-8 rounded-2xl border text-center space-y-4 shadow-sm ${
                    isPassed
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50/60 dark:bg-red-950/40 border-red-200 dark:border-red-800'
                }`}>
                    <div className="inline-flex p-4 rounded-full bg-white dark:bg-slate-900 shadow-sm">
                        {isPassed ? (
                            <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                        )}
                    </div>

                    <div>
                        <h3 className={`text-2xl font-black ${isPassed ? 'text-emerald-900 dark:text-emerald-200' : 'text-red-900 dark:text-red-200'}`}>
                            {isPassed ? 'Laboratory Objectives Successfully Mastered!' : 'Passing Threshold Not Reached'}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            Passing score required: {lab.passing_score}%
                        </p>
                    </div>

                    <div className="inline-block px-6 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-3xl font-black text-slate-900 dark:text-white">
                        {attempt.final_score}%
                    </div>
                </div>

                {/* Remediation & Instructor Debrief */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-xs">
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Remediation & Technical Debrief</h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            {lab.remediation_explanation}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">Expected Forensic Findings</h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            {lab.expected_findings}
                        </p>
                    </div>

                    {/* Question Breakdown */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Question Breakdown & Feedback</h4>
                        <div className="space-y-4">
                            {attempt.answers?.map((ans: any, idx: number) => (
                                <div key={ans.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-900 dark:text-white">Question #{idx + 1}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            ans.is_correct
                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                                                : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                                        }`}>
                                            {ans.is_correct ? 'Correct (+20 pts)' : 'Incorrect (0 pts)'}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400">{ans.feedback}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 flex justify-between items-center">
                        <Link
                            href={route('simulation.show', lab.slug)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Retry Simulation Lab
                        </Link>

                        <Link
                            href={route('dashboard')}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                            Continue Learning Track →
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
