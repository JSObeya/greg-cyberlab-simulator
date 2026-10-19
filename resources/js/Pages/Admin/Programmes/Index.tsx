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
    Briefcase,
    Pencil,
    X,
    FileText,
    Target,
    Layers
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CoordinatorItem {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface ProgrammeItem {
    id: number;
    title: string;
    code: string;
    slug?: string;
    department: string;
    duration: string;
    delivery_mode: string;
    coordinator_id: number | string | null;
    coordinator?: CoordinatorItem | null;
    description: string | null;
    entry_requirements: string | null;
    objectives: string | null;
    is_active: boolean;
    courses_count?: number;
    cohorts_count?: number;
}

interface ProgrammesIndexProps {
    programmes: ProgrammeItem[];
    coordinators: CoordinatorItem[];
}

export default function ProgrammesIndex({ programmes, coordinators }: ProgrammesIndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingProgramme, setEditingProgramme] = useState<ProgrammeItem | null>(null);

    // Form for Establishing a New Programme
    const createForm = useForm({
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

    // Form for Updating an Existing Programme
    const editForm = useForm({
        title: '',
        code: '',
        department: '',
        duration: '',
        delivery_mode: 'hybrid',
        coordinator_id: '' as number | string,
        description: '',
        entry_requirements: '',
        objectives: '',
        is_active: true,
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.programmes.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreating(false);
            },
        });
    };

    const handleEditOpen = (prog: ProgrammeItem) => {
        setEditingProgramme(prog);
        editForm.clearErrors();
        editForm.setData({
            title: prog.title || '',
            code: prog.code || '',
            department: prog.department || '',
            duration: prog.duration || '',
            delivery_mode: prog.delivery_mode || 'hybrid',
            coordinator_id: prog.coordinator_id || '',
            description: prog.description || '',
            entry_requirements: prog.entry_requirements || '',
            objectives: prog.objectives || '',
            is_active: prog.is_active ?? true,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProgramme) return;

        editForm.put(route('admin.programmes.update', editingProgramme.id), {
            onSuccess: () => {
                setEditingProgramme(null);
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
                        onSubmit={handleCreateSubmit}
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
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="e.g. Diploma in Cyber Defense & SOC Operations"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                                {createForm.errors.title && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.title}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Code</label>
                                <input
                                    type="text"
                                    value={createForm.data.code}
                                    onChange={(e) => createForm.setData('code', e.target.value)}
                                    placeholder="e.g. DCD-2026"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 uppercase"
                                    required
                                />
                                {createForm.errors.code && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.code}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department / Track</label>
                                <input
                                    type="text"
                                    value={createForm.data.department}
                                    onChange={(e) => createForm.setData('department', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Duration</label>
                                <input
                                    type="text"
                                    value={createForm.data.duration}
                                    onChange={(e) => createForm.setData('duration', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Mode</label>
                                <select
                                    value={createForm.data.delivery_mode}
                                    onChange={(e) => createForm.setData('delivery_mode', e.target.value)}
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
                                    value={createForm.data.coordinator_id}
                                    onChange={(e) => createForm.setData('coordinator_id', e.target.value)}
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
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
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
                                disabled={createForm.processing}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                            >
                                {createForm.processing ? 'Establishing...' : 'Establish Academic Programme'}
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
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition group relative"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                            {prog.code || 'PRG'}
                                        </span>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                            {prog.delivery_mode.replace('_', ' ')}
                                        </span>
                                        {prog.is_active === false && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                                Inactive
                                            </span>
                                        )}
                                    </div>

                                    {/* Edit Button in Card Header */}
                                    <button
                                        type="button"
                                        onClick={() => handleEditOpen(prog)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl text-xs font-bold transition shadow-xs"
                                        title="Edit this academic programme"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span>Edit</span>
                                    </button>
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

                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <div>
                                        {prog.coordinator ? (
                                            <span>Coordinator: <strong className="text-slate-800 dark:text-slate-200">{prog.coordinator.name}</strong></span>
                                        ) : (
                                            <span className="italic text-slate-400">No Coordinator Assigned</span>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => handleEditOpen(prog)}
                                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
                                    >
                                        <Pencil className="w-3 h-3" /> Edit Programme
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ============================================================ */}
                {/* EDIT PROGRAMME MODAL                                          */}
                {/* ============================================================ */}
                {editingProgramme && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                        <form
                            onSubmit={handleEditSubmit}
                            className="bg-white dark:bg-slate-900 w-full max-w-2xl p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                                        <Pencil className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                            Edit Academic Programme
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Update syllabus specifications, academic requirements, and assigned coordinator
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingProgramme(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Title</label>
                                    <input
                                        type="text"
                                        value={editForm.data.title}
                                        onChange={(e) => editForm.setData('title', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    />
                                    {editForm.errors.title && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.title}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Code</label>
                                    <input
                                        type="text"
                                        value={editForm.data.code}
                                        onChange={(e) => editForm.setData('code', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 uppercase"
                                        required
                                    />
                                    {editForm.errors.code && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.code}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Department / Track</label>
                                    <input
                                        type="text"
                                        value={editForm.data.department}
                                        onChange={(e) => editForm.setData('department', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    />
                                    {editForm.errors.department && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.department}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Duration</label>
                                    <input
                                        type="text"
                                        value={editForm.data.duration}
                                        onChange={(e) => editForm.setData('duration', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    />
                                    {editForm.errors.duration && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.duration}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Delivery Mode</label>
                                    <select
                                        value={editForm.data.delivery_mode}
                                        onChange={(e) => editForm.setData('delivery_mode', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="hybrid">Hybrid (Classroom & Virtual Simulator)</option>
                                        <option value="online">100% Online Distance Learning</option>
                                        <option value="in_person">In-Person Academy Lab (Makurdi Campus)</option>
                                    </select>
                                    {editForm.errors.delivery_mode && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.delivery_mode}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lead Academic Coordinator</label>
                                    <select
                                        value={editForm.data.coordinator_id}
                                        onChange={(e) => editForm.setData('coordinator_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="">-- Assign Coordinator --</option>
                                        {coordinators.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} ({c.email})
                                            </option>
                                        ))}
                                    </select>
                                    {editForm.errors.coordinator_id && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.coordinator_id}</p>}
                                </div>
                            </div>

                            <div className="space-y-4 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Programme Overview & Description</label>
                                    <textarea
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        rows={2}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                    {editForm.errors.description && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.description}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Entry Requirements</label>
                                        <textarea
                                            value={editForm.data.entry_requirements}
                                            onChange={(e) => editForm.setData('entry_requirements', e.target.value)}
                                            rows={2}
                                            placeholder="Prerequisites, background knowledge..."
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        />
                                        {editForm.errors.entry_requirements && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.entry_requirements}</p>}
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Learning Objectives</label>
                                        <textarea
                                            value={editForm.data.objectives}
                                            onChange={(e) => editForm.setData('objectives', e.target.value)}
                                            rows={2}
                                            placeholder="Core learning outcomes..."
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        />
                                        {editForm.errors.objectives && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.objectives}</p>}
                                    </div>
                                </div>

                                <div className="pt-1 flex items-center gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                        <input
                                            type="checkbox"
                                            checked={editForm.data.is_active}
                                            onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                            className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Active Programme (Available for enrolment and courses)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingProgramme(null)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>{editForm.processing ? 'Saving Changes...' : 'Update Programme'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
