import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Users, Plus, Calendar, ShieldCheck, CheckCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CohortsIndexProps {
    cohorts: any[];
    courses: any[];
}

export default function CohortsIndex({ cohorts, courses }: CohortsIndexProps) {
    const { data, setData, post, processing, reset } = useForm({
        course_id: courses[0]?.id || '',
        name: '',
        code: '',
        start_date: '',
        end_date: '',
    });

    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('cohorts.store'), {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Training Cohorts & Enrolments</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Greg & Co. ICT Academy — Class Supervision</p>
                    </div>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                        <Plus className="w-4 h-4" /> Create New Cohort
                    </button>
                </div>
            }
        >
            <Head title="Cohorts & Enrolments - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Cohort Creation Modal / Inline Form */}
                {isCreating && (
                    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-md space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Establish New Academy Cohort</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Programme / Course</label>
                                <select
                                    value={data.course_id}
                                    onChange={(e) => setData('course_id', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cohort Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Makurdi Cyber Cadets - Cohort Bravo"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unique Cohort Code</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="e.g. MAK-2026-BRAVO"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                            >
                                {processing ? 'Creating...' : 'Save Cohort'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Cohorts Listing */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cohorts.map((cohort) => (
                        <div key={cohort.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                    {cohort.code}
                                </span>
                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                                </span>
                            </div>

                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{cohort.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{cohort.course?.title}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span><strong>{cohort.users?.length || 0}</strong> Trainees Enrolled</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
