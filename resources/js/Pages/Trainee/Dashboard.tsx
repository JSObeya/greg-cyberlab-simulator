import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Terminal, Award, FileText, ChevronRight, CheckCircle2, User, BookOpen } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface DashboardProps {
    enrolledCourses: any[];
    attempts: any[];
    progress: {
        passedLabs: number;
        totalLabs: number;
        percentage: number;
    };
    badges: any[];
    certificates: any[];
}

export default function TraineeDashboard({
    enrolledCourses,
    attempts,
    progress,
    badges,
    certificates,
}: DashboardProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Cyber Training Cyberdeck
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Greg & Co. ICT Academy — Makurdi Campus
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Simulation Sandbox Online
                        </span>
                    </div>
                </div>
            }
        >
            <Head title="Trainee Dashboard - Greg Cyberlab" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    {/* Top Progress & Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lab Completion</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{progress.percentage}%</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{progress.passedLabs} of {progress.totalLabs} Labs Passed</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                                <Award className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Earned Badges</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{badges.length}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Operational Milestones</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <FileText className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Certificates</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{certificates.length}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Verifiable Credentials</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center gap-4">
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Terminal className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Terminal Access</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">Kali Safe</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">Simulated AST Sandboxed</p>
                            </div>
                        </div>
                    </div>

                    {/* Laboratory Curriculum List */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hands-On Cybersecurity Laboratory Modules</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Select a guided simulation scenario to engage the virtual arena</p>
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {enrolledCourses.map((course) => (
                                <div key={course.id} className="p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">{course.title}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {course.modules?.map((mod: any) =>
                                            mod.lessons?.map((lesson: any) =>
                                                lesson.laboratories?.map((lab: any) => {
                                                    const attempt = attempts.find((a) => a.laboratory_id === lab.id);
                                                    const isPassed = attempt?.is_passed;

                                                    return (
                                                        <div
                                                            key={lab.id}
                                                            className="flex flex-col justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/80"
                                                        >
                                                            <div>
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                                                        {lab.category}
                                                                    </span>
                                                                    {isPassed ? (
                                                                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-500 dark:text-slate-400">
                                                                            {lab.estimated_minutes} mins
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-2 line-clamp-2">
                                                                    {lab.title}
                                                                </h5>
                                                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                                                                    {lab.scenario_background}
                                                                </p>
                                                            </div>

                                                            <Link
                                                                href={route('simulation.show', lab.slug)}
                                                                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                                                                    isPassed
                                                                        ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                                                                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                                                                }`}
                                                            >
                                                                {isPassed ? 'Review Scenario' : 'Launch Simulation'}
                                                                <ChevronRight className="w-3.5 h-3.5" />
                                                            </Link>
                                                        </div>
                                                    );
                                                })
                                            )
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Earned Badges & Certificates */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Earned Achievement Badges
                            </h3>
                            {badges.length === 0 ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400 py-4">Complete your first lab to unlock the "First Breach Contained" achievement badge.</p>
                            ) : (
                                <div className="space-y-3">
                                    {badges.map((b) => (
                                        <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900">
                                            <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{b.name}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Official Certificates
                            </h3>
                            {certificates.length === 0 ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400 py-4">Certificates are automatically awarded once all 15 cybersecurity simulation labs are passed.</p>
                            ) : (
                                <div className="space-y-3">
                                    {certificates.map((cert) => (
                                        <div key={cert.id} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">{cert.certificate_number}</p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">Issued: {cert.issued_date}</p>
                                            </div>
                                            <Link
                                                href={route('certificate.verify', cert.verification_token)}
                                                className="text-xs text-emerald-700 dark:text-emerald-400 font-bold hover:underline"
                                            >
                                                Verify Credential
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
