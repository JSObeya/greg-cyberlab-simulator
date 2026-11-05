import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
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
    Layers,
    UserPlus,
    UserCheck,
    Trash2,
    Search,
    Shield
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CoordinatorItem {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AssignedUserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    pivot?: {
        enrolled_at?: string;
        status?: string;
        notes?: string;
    };
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
    users_count?: number;
    users?: AssignedUserItem[];
}

interface ProgrammesIndexProps {
    programmes: ProgrammeItem[];
    coordinators: CoordinatorItem[];
    allUsers?: Array<{ id: number; name: string; email: string; role: string }>;
}

export default function ProgrammesIndex({ programmes, coordinators, allUsers = [] }: ProgrammesIndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingProgramme, setEditingProgramme] = useState<ProgrammeItem | null>(null);
    const [managingUsersProgramme, setManagingUsersProgramme] = useState<ProgrammeItem | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState('');

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

    // Form for Assigning Users to a Programme
    const assignForm = useForm({
        user_ids: [] as number[],
        status: 'active',
        notes: '',
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.transform((data) => ({
            ...data,
            coordinator_id: data.coordinator_id ? Number(data.coordinator_id) : null,
        }));

        createForm.post(route('admin.programmes.store'), {
            preserveScroll: true,
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
            coordinator_id: prog.coordinator_id ? String(prog.coordinator_id) : '',
            description: prog.description || '',
            entry_requirements: prog.entry_requirements || '',
            objectives: prog.objectives || '',
            is_active: prog.is_active ?? true,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProgramme) return;

        editForm.transform((data) => ({
            ...data,
            coordinator_id: data.coordinator_id ? Number(data.coordinator_id) : null,
        }));

        editForm.put(route('admin.programmes.update', editingProgramme.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingProgramme(null);
            },
        });
    };

    const handleManageUsersOpen = (prog: ProgrammeItem) => {
        setManagingUsersProgramme(prog);
        setUserSearchTerm('');
        assignForm.reset();
    };

    const toggleUserSelection = (userId: number) => {
        if (assignForm.data.user_ids.includes(userId)) {
            assignForm.setData('user_ids', assignForm.data.user_ids.filter((id) => id !== userId));
        } else {
            assignForm.setData('user_ids', [...assignForm.data.user_ids, userId]);
        }
    };

    const handleAssignUsersSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!managingUsersProgramme) return;

        assignForm.post(route('admin.programmes.assign-users', managingUsersProgramme.id), {
            preserveScroll: true,
            onSuccess: () => {
                assignForm.reset();
                // update local copy
                const updated = programmes.find((p) => p.id === managingUsersProgramme.id);
                if (updated) {
                    setManagingUsersProgramme(updated);
                }
            },
        });
    };

    const handleRemoveUser = (userId: number, userName: string) => {
        if (!managingUsersProgramme) return;
        if (!confirm(`Are you sure you want to remove ${userName} from this academic programme?`)) {
            return;
        }

        router.delete(route('admin.programmes.remove-user', [managingUsersProgramme.id, userId]), {
            preserveScroll: true,
            onSuccess: () => {
                const updated = programmes.find((p) => p.id === managingUsersProgramme.id);
                if (updated) {
                    setManagingUsersProgramme(updated);
                }
            },
        });
    };

    // Filter available users not yet in this programme
    const enrolledUserIds = new Set(managingUsersProgramme?.users?.map((u) => u.id) || []);
    const availableUsersToAssign = allUsers.filter((u) => !enrolledUserIds.has(u.id)).filter((u) => {
        if (!userSearchTerm) return true;
        return (
            u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
            u.role.toLowerCase().includes(userSearchTerm.toLowerCase())
        );
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                            Academic Programmes & Training Pathways
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Establish curricula, assign trainees, and manage accredited military and professional pathways.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                    >
                        {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        <span>{isCreating ? 'Close Form' : 'Establish New Programme'}</span>
                    </button>
                </div>
            }
        >
            <Head title="Academic Programmes - Greg Cyberlab LMS" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Programme Creation Form */}
                {isCreating && (
                    <form
                        onSubmit={handleCreateSubmit}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4"
                    >
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <Briefcase className="w-4 h-4 text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                Establish Academic Programme
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
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
                            The academy database is ready for your academic pathways. Click below to establish your first diploma or professional certification programme.
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
                        {programmes.map((prog) => {
                            const enrolledCount = prog.users_count ?? prog.users?.length ?? 0;
                            return (
                                <div
                                    key={prog.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition group relative flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
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
                                            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                                                {prog.description}
                                            </p>
                                        )}

                                        <div className="grid grid-cols-3 gap-2.5 pt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                                                <span className="truncate"><strong>{prog.courses_count || 0}</strong> Courses</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <Users className="w-4 h-4 text-emerald-500 shrink-0" />
                                                <span className="truncate"><strong>{prog.cohorts_count || 0}</strong> Cohorts</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <UserCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                                                <span className="truncate"><strong>{enrolledCount}</strong> Trainees</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <div>
                                            {prog.coordinator ? (
                                                <span>Coordinator: <strong className="text-slate-800 dark:text-slate-200">{prog.coordinator.name}</strong></span>
                                            ) : (
                                                <span className="italic text-slate-400">No Coordinator Assigned</span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleManageUsersOpen(prog)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
                                                title="Assign trainees and security personnel to this programme"
                                            >
                                                <UserPlus className="w-3.5 h-3.5" />
                                                <span>Assign Trainees ({enrolledCount})</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ============================================================ */}
                {/* MANAGE TRAINEES & USERS MODAL                                */}
                {/* ============================================================ */}
                {managingUsersProgramme && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-3xl p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                                            Assign & Manage Programme Trainees
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {managingUsersProgramme.title} ({managingUsersProgramme.code})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setManagingUsersProgramme(null)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Section 1: Currently Enrolled Users */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-emerald-500" />
                                        Currently Assigned Trainees & Users ({managingUsersProgramme.users?.length || 0})
                                    </h4>
                                </div>

                                {(!managingUsersProgramme.users || managingUsersProgramme.users.length === 0) ? (
                                    <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-center text-xs text-slate-400">
                                        No users or trainees currently assigned directly to this programme. Use the form below to assign candidates.
                                    </div>
                                ) : (
                                    <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                                        {managingUsersProgramme.users.map((u) => (
                                            <div key={u.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-950/60 transition">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800 dark:text-white">{u.name}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                            {u.role}
                                                        </span>
                                                        {u.pivot?.status && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                                                                {u.pivot.status}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400">
                                                        {u.email}
                                                        {u.pivot?.enrolled_at && (
                                                            <span> • Enrolled: {new Date(u.pivot.enrolled_at).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveUser(u.id, u.name)}
                                                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition"
                                                    title={`Remove ${u.name} from programme`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Section 2: Assign New Candidates Form */}
                            <form onSubmit={handleAssignUsersSubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-blue-500" />
                                    Assign Available Trainees to this Programme
                                </h4>

                                <div className="space-y-3">
                                    {/* Search input */}
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={userSearchTerm}
                                            onChange={(e) => setUserSearchTerm(e.target.value)}
                                            placeholder="Search candidate by name, email, or role..."
                                            className="w-full pl-9 pr-4 py-2 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Available candidates list */}
                                    {availableUsersToAssign.length === 0 ? (
                                        <p className="text-xs text-slate-400 italic py-2">
                                            {allUsers.length === 0
                                                ? 'No candidate users in the system yet.'
                                                : 'All available candidates have already been assigned to this programme.'}
                                        </p>
                                    ) : (
                                        <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 divide-y divide-slate-100 dark:divide-slate-800/60 space-y-1">
                                            {availableUsersToAssign.map((user) => {
                                                const isSelected = assignForm.data.user_ids.includes(user.id);
                                                return (
                                                    <label
                                                        key={user.id}
                                                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                                                            isSelected
                                                                ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-900 dark:text-blue-200'
                                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleUserSelection(user.id)}
                                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <div>
                                                                <span className="font-bold">{user.name}</span>
                                                                <span className="text-[11px] text-slate-400 block">{user.email}</span>
                                                            </div>
                                                        </div>
                                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                                            {user.role}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-slate-500">
                                            Selected: <strong className="text-blue-600 dark:text-blue-400">{assignForm.data.user_ids.length}</strong> candidate(s)
                                        </span>

                                        <button
                                            type="submit"
                                            disabled={assignForm.processing || assignForm.data.user_ids.length === 0}
                                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>{assignForm.processing ? 'Assigning...' : `Assign Selected (${assignForm.data.user_ids.length})`}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
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

                            {Object.keys(editForm.errors).length > 0 && (
                                <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs space-y-1">
                                    <p className="font-bold flex items-center gap-1.5">
                                        <X className="w-4 h-4 text-red-600" />
                                        Please correct the following errors:
                                    </p>
                                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                        {Object.entries(editForm.errors).map(([key, err]) => (
                                            <li key={key}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

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
                                        rows={3}
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
