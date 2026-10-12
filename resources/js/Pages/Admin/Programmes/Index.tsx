import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    GraduationCap,
    Plus,
    BookOpen,
    Users,
    Clock,
    CheckCircle2,
    Calendar,
    ChevronRight,
    Briefcase
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProgrammesIndexProps {
    programmes: any[];
    coordinators: any[];
}

export default function ProgrammesIndex({ programmes, coordinators }: ProgrammesIndexProps) {
    const [isCreating, setIsCreating] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        code: '',
        department: 'Cybersecurity Operations & Defence',
        duration: '3 Months (Intensive)',
        delivery_mode: 'hybrid',
        coordinator_id: coordinators[0]?.id || '',
        description: '',
        entry_requirements: 'Basic computing knowledge, computer networking fundamentals, or instructor assessment.',
        objectives: 'Equip trainees with hands-on skills in SOC operations, defensive triage, threat analysis, and simulated lab execution.',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.programmes.store'), {
            onSuccess: () => {
                reset();
                setIsCreating(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            Academic Programmes & Pathways
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Greg & Co. ICT Academy — Enterprise Curriculum Architecture
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                        <Plus className="w-4 h-4" /> Establish New Programme
                    </button>
                </div>
            }
        >
            <Head title="Academic Programmes - Greg Cyberlab LMS" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Programme Creation Form */}
                {isCreating && (
                    <form
                        onSubmit={handleSubmit}
                        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-lg space-y-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" /> Establish Academic Programme
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                LMS Core
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Title</label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. Diploma in Cyber Defense & SOC Operations"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                                {errors.title && <p className="text-red-500 text-[10px] mt-1">{errors.title}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Code</label>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="e.g. DCD-2026"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 uppercase"
                                    required
                                />
                                {errors.code && <p className="text-red-500 text-[10px] mt-1">{errors.code}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department / Track</label>
                                <input
                                    type="text"
                                    value={data.department}
                                    onChange={(e) => setData('department', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Duration</label>
                                <input
                                    type="text"
                                    value={data.duration}
                                    onChange={(e) => setData('duration', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Mode</label>
                                <select
                                    value={data.delivery_mode}
                                    onChange={(e) => setData('delivery_mode', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                >
                                    <option value="hybrid">Hybrid (Classroom & Virtual Simulator)</option>
                                    <option value="online">100% Online Distance Learning</option>
                                    <option value="in_person">In-Person Academy Lab (Makurdi Campus)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lead Academic Coordinator</label>
                                <select
                                    value={data.coordinator_id}
                                    onChange={(e) => setData('coordinator_id', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                >
                                    <option value="">-- Assign Coordinator --</option>
                                    {coordinators.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Overview & Description</label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={2}
                                    placeholder="Executive description of what the programme accomplishes..."
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
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                            >
                                {processing ? 'Establishing...' : 'Establish Academic Programme'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Programmes Listing */}
                {programmes.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
                        <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">No Academic Programmes Created Yet</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            The academy database is ready for your academic pathways. Click below to establish your first diploma or professional certification programme, or run the academy database seeder on the server.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                        >
                            <Plus className="w-4 h-4" /> Establish First Programme
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {programmes.map((prog) => (
                        <div
                            key={prog.id}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                    {prog.code || 'PRG'}
                                </span>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                    {prog.delivery_mode}
                                </span>
                            </div>

                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                                    {prog.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {prog.department} • {prog.duration}
                                </p>
                            </div>

                            {prog.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                    {prog.description}
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <BookOpen className="w-4 h-4 text-blue-500" />
                                    <span><strong>{prog.courses_count || 0}</strong> Courses</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <Users className="w-4 h-4 text-emerald-500" />
                                    <span><strong>{prog.cohorts_count || 0}</strong> Cohorts Active</span>
                                </div>
                            </div>

                            {prog.coordinator && (
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span>Coordinator: <strong className="text-slate-800 dark:text-slate-200">{prog.coordinator.name}</strong></span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
