import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import {
    Users,
    Plus,
    Calendar,
    ShieldCheck,
    CheckCircle2,
    Pencil,
    X,
    BookOpen,
    GraduationCap,
    Clock,
    Layers,
    UserCheck
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CourseOption {
    id: number;
    title: string;
    programme_id?: number | null;
}

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
}

interface SessionOption {
    id: number;
    name: string;
    code: string;
}

interface UserOption {
    id: number;
    name: string;
    email: string;
    role?: string;
}

interface CohortItem {
    id: number;
    course_id: number | string;
    course?: CourseOption | null;
    programme_id?: number | string | null;
    programme?: ProgrammeOption | null;
    academic_session_id?: number | string | null;
    academic_session?: SessionOption | null;
    academicSession?: SessionOption | null;
    name: string;
    code: string;
    start_date?: string | null;
    end_date?: string | null;
    max_capacity?: number;
    status?: string;
    is_active?: boolean;
    instructors?: UserOption[];
    users?: UserOption[];
}

interface CohortsIndexProps {
    cohorts: CohortItem[];
    courses: CourseOption[];
    programmes?: ProgrammeOption[];
    sessions?: SessionOption[];
    instructors?: UserOption[];
    trainees?: UserOption[];
}

export default function CohortsIndex({
    cohorts,
    courses,
    programmes = [],
    sessions = [],
    instructors = [],
    trainees = [],
}: CohortsIndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingCohort, setEditingCohort] = useState<CohortItem | null>(null);

    // Form for Creating New Cohort
    const createForm = useForm({
        course_id: courses[0]?.id || '',
        programme_id: '' as number | string,
        academic_session_id: '' as number | string,
        name: '',
        code: '',
        start_date: '',
        end_date: '',
        max_capacity: 30,
        status: 'active',
        instructor_ids: [] as number[],
    });

    // Form for Updating Existing Cohort
    const editForm = useForm({
        course_id: '' as number | string,
        programme_id: '' as number | string,
        academic_session_id: '' as number | string,
        name: '',
        code: '',
        start_date: '',
        end_date: '',
        max_capacity: 30,
        status: 'active',
        is_active: true,
        instructor_ids: [] as number[],
    });

    const formatDateForInput = (dateStr?: string | null) => {
        if (!dateStr) return '';
        try {
            return dateStr.substring(0, 10);
        } catch {
            return '';
        }
    };

    const formatDateDisplay = (dateStr?: string | null) => {
        if (!dateStr) return null;
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
            return dateStr.substring(0, 10);
        }
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.transform((data) => ({
            ...data,
            course_id: Number(data.course_id),
            programme_id: data.programme_id ? Number(data.programme_id) : null,
            academic_session_id: data.academic_session_id ? Number(data.academic_session_id) : null,
            max_capacity: Number(data.max_capacity) || 30,
        }));

        createForm.post(route('cohorts.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setIsCreating(false);
            },
        });
    };

    const handleEditOpen = (cohort: CohortItem) => {
        setEditingCohort(cohort);
        editForm.clearErrors();

        const instructorIds = cohort.instructors
            ? cohort.instructors.map((ins) => ins.id)
            : [];

        editForm.setData({
            course_id: cohort.course_id || '',
            programme_id: cohort.programme_id ? String(cohort.programme_id) : '',
            academic_session_id: cohort.academic_session_id ? String(cohort.academic_session_id) : '',
            name: cohort.name || '',
            code: cohort.code || '',
            start_date: formatDateForInput(cohort.start_date),
            end_date: formatDateForInput(cohort.end_date),
            max_capacity: cohort.max_capacity || 30,
            status: cohort.status || 'active',
            is_active: cohort.is_active ?? true,
            instructor_ids: instructorIds,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCohort) return;

        editForm.transform((data) => ({
            ...data,
            course_id: Number(data.course_id),
            programme_id: data.programme_id ? Number(data.programme_id) : null,
            academic_session_id: data.academic_session_id ? Number(data.academic_session_id) : null,
            max_capacity: Number(data.max_capacity) || 30,
        }));

        editForm.put(route('cohorts.update', editingCohort.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCohort(null);
                editForm.reset();
            },
        });
    };

    const toggleInstructor = (instructorId: number, isEditing: boolean = true) => {
        if (isEditing) {
            const current = editForm.data.instructor_ids;
            if (current.includes(instructorId)) {
                editForm.setData('instructor_ids', current.filter((id) => id !== instructorId));
            } else {
                editForm.setData('instructor_ids', [...current, instructorId]);
            }
        } else {
            const current = createForm.data.instructor_ids;
            if (current.includes(instructorId)) {
                createForm.setData('instructor_ids', current.filter((id) => id !== instructorId));
            } else {
                createForm.setData('instructor_ids', [...current, instructorId]);
            }
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Training Cohorts & Enrolments</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Greg & Co. ICT Academy — Class Supervision & Cohort Administration</p>
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
                {/* Cohort Creation Form */}
                {isCreating && (
                    <form onSubmit={handleCreateSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-md space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                Establish New Academy Cohort
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                Academy Stream
                            </span>
                        </div>

                        {Object.keys(createForm.errors).length > 0 && (
                            <div className="p-3.5 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-red-700 dark:text-red-300 text-xs space-y-1">
                                <p className="font-bold flex items-center gap-1.5">
                                    <X className="w-4 h-4 text-red-600" />
                                    Please correct the following errors:
                                </p>
                                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                                    {Object.entries(createForm.errors).map(([key, err]) => (
                                        <li key={key}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Programme / Course</label>
                                <select
                                    value={createForm.data.course_id}
                                    onChange={(e) => createForm.setData('course_id', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                >
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                                {createForm.errors.course_id && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.course_id}</p>}
                            </div>

                            {programmes.length > 0 && (
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Programme (Optional)</label>
                                    <select
                                        value={createForm.data.programme_id}
                                        onChange={(e) => createForm.setData('programme_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="">-- No Programme Assigned --</option>
                                        {programmes.map((p) => (
                                            <option key={p.id} value={p.id}>{p.title} ({p.code})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {sessions.length > 0 && (
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Session (Optional)</label>
                                    <select
                                        value={createForm.data.academic_session_id}
                                        onChange={(e) => createForm.setData('academic_session_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="">-- No Session Assigned --</option>
                                        {sessions.map((s) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cohort Name</label>
                                <input
                                    type="text"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Makurdi Cyber Cadets - Cohort Bravo"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                                {createForm.errors.name && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unique Cohort Code</label>
                                <input
                                    type="text"
                                    value={createForm.data.code}
                                    onChange={(e) => createForm.setData('code', e.target.value)}
                                    placeholder="e.g. MAK-2026-BRAVO"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 uppercase"
                                    required
                                />
                                {createForm.errors.code && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.code}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Capacity (Trainees)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={createForm.data.max_capacity}
                                    onChange={(e) => createForm.setData('max_capacity', parseInt(e.target.value) || 30)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={createForm.data.start_date}
                                    onChange={(e) => createForm.setData('start_date', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={createForm.data.end_date}
                                    onChange={(e) => createForm.setData('end_date', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {instructors.length > 0 && (
                            <div className="pt-2 text-xs">
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Assign Instructors / Supervisors (Optional)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {instructors.map((ins) => {
                                        const isSelected = createForm.data.instructor_ids.includes(ins.id);
                                        return (
                                            <button
                                                key={ins.id}
                                                type="button"
                                                onClick={() => toggleInstructor(ins.id, false)}
                                                className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                                                    isSelected
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                            >
                                                <UserCheck className="w-3.5 h-3.5" />
                                                <span>{ins.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                            >
                                {createForm.processing ? 'Creating...' : 'Save Cohort'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Cohorts Listing */}
                {cohorts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
                        <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">No Cohorts Established Yet</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            No training cohorts have been created yet. Establish your first cohort to organize trainees and class supervision.
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                        >
                            <Plus className="w-4 h-4" /> Create First Cohort
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cohorts.map((cohort) => {
                            const enrolledCount = cohort.users?.length || 0;
                            const maxCap = cohort.max_capacity || 30;
                            const capacityPercent = Math.min(100, Math.round((enrolledCount / maxCap) * 100));

                            const startDateFmt = formatDateDisplay(cohort.start_date);
                            const endDateFmt = formatDateDisplay(cohort.end_date);

                            return (
                                <div
                                    key={cohort.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 hover:border-blue-400 dark:hover:border-blue-500 transition group relative"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {cohort.code}
                                            </span>

                                            {cohort.status === 'completed' ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                                                    Completed
                                                </span>
                                            ) : cohort.status === 'upcoming' ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                                    Upcoming
                                                </span>
                                            ) : cohort.status === 'archived' ? (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                    Archived
                                                </span>
                                            ) : cohort.is_active !== false ? (
                                                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>

                                        {/* Edit Button in Header */}
                                        <button
                                            type="button"
                                            onClick={() => handleEditOpen(cohort)}
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-bold transition shadow-xs"
                                            title="Edit this cohort"
                                        >
                                            <Pencil className="w-3 h-3" />
                                            <span>Edit</span>
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                                            {cohort.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                            <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                            <span className="truncate">{cohort.course?.title || 'No course assigned'}</span>
                                        </p>
                                    </div>

                                    {/* Pathway & Academic Session Badges */}
                                    {(cohort.programme || cohort.academic_session || cohort.academicSession) && (
                                        <div className="flex flex-wrap gap-1.5 pt-1 text-[10px]">
                                            {cohort.programme && (
                                                <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-100 dark:border-blue-900 truncate max-w-[200px]">
                                                    {cohort.programme.title}
                                                </span>
                                            )}
                                            {(cohort.academic_session || cohort.academicSession) && (
                                                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                                    {(cohort.academic_session || cohort.academicSession)?.name}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Calendar Schedule */}
                                    {(startDateFmt || endDateFmt) && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/60">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>
                                                {startDateFmt || 'TBD'}
                                                {endDateFmt ? ` → ${endDateFmt}` : ''}
                                            </span>
                                        </div>
                                    )}

                                    {/* Capacity Progress Bar */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                <strong>{enrolledCount}</strong> of {maxCap} Trainees
                                            </span>
                                            <span className="font-bold text-[11px] text-slate-500">{capacityPercent}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-300 ${
                                                    capacityPercent >= 90
                                                        ? 'bg-amber-500'
                                                        : capacityPercent >= 100
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-600'
                                                }`}
                                                style={{ width: `${capacityPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Assigned Instructors */}
                                    {cohort.instructors && cohort.instructors.length > 0 && (
                                        <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                                <span>Instructors:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {cohort.instructors.map((ins) => (
                                                    <span
                                                        key={ins.id}
                                                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]"
                                                    >
                                                        {ins.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Card Footer */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                                        <span className="text-[11px] text-slate-400">
                                            Cohort ID: #{cohort.id}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleEditOpen(cohort)}
                                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition"
                                        >
                                            <Pencil className="w-3 h-3" /> Edit Cohort
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ============================================================ */}
                {/* EDIT COHORT MODAL                                            */}
                {/* ============================================================ */}
                {editingCohort && (
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
                                            Edit Training Cohort & Enrolment
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Modify cohort designation, syllabus track, calendar dates, capacity, and supervisors
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingCohort(null)}
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
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Target Programme / Course</label>
                                    <select
                                        value={editForm.data.course_id}
                                        onChange={(e) => editForm.setData('course_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    >
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                    {editForm.errors.course_id && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.course_id}</p>}
                                </div>

                                {programmes.length > 0 && (
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Programme (Optional)</label>
                                        <select
                                            value={editForm.data.programme_id}
                                            onChange={(e) => editForm.setData('programme_id', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        >
                                            <option value="">-- No Programme Assigned --</option>
                                            {programmes.map((p) => (
                                                <option key={p.id} value={p.id}>{p.title} ({p.code})</option>
                                            ))}
                                        </select>
                                        {editForm.errors.programme_id && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.programme_id}</p>}
                                    </div>
                                )}

                                {sessions.length > 0 && (
                                    <div>
                                        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Academic Session (Optional)</label>
                                        <select
                                            value={editForm.data.academic_session_id}
                                            onChange={(e) => editForm.setData('academic_session_id', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        >
                                            <option value="">-- No Session Assigned --</option>
                                            {sessions.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                        {editForm.errors.academic_session_id && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.academic_session_id}</p>}
                                    </div>
                                )}

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cohort Name</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    />
                                    {editForm.errors.name && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Unique Cohort Code</label>
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
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Max Capacity (Trainees)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={editForm.data.max_capacity}
                                        onChange={(e) => editForm.setData('max_capacity', parseInt(e.target.value) || 30)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    />
                                    {editForm.errors.max_capacity && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.max_capacity}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lifecycle Status</label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="active">Active (Ongoing Training)</option>
                                        <option value="upcoming">Upcoming (Admissions Open)</option>
                                        <option value="completed">Completed (Graduated)</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                    {editForm.errors.status && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.status}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={editForm.data.start_date}
                                        onChange={(e) => editForm.setData('start_date', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                    {editForm.errors.start_date && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.start_date}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={editForm.data.end_date}
                                        onChange={(e) => editForm.setData('end_date', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                    {editForm.errors.end_date && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.end_date}</p>}
                                </div>
                            </div>

                            {/* Instructors Multi-Assignment */}
                            {instructors.length > 0 && (
                                <div className="space-y-2 text-xs pt-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Assigned Instructors / Supervisors
                                    </label>
                                    <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        {instructors.map((ins) => {
                                            const isSelected = editForm.data.instructor_ids.includes(ins.id);
                                            return (
                                                <button
                                                    key={ins.id}
                                                    type="button"
                                                    onClick={() => toggleInstructor(ins.id, true)}
                                                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition flex items-center gap-1.5 ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                    }`}
                                                >
                                                    <UserCheck className="w-3.5 h-3.5" />
                                                    <span>{ins.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {editForm.errors.instructor_ids && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.instructor_ids}</p>}
                                </div>
                            )}

                            {/* Active Toggle */}
                            <div className="pt-1 flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Active Cohort (Available for trainee enrolment and laboratory tracking)</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingCohort(null)}
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
                                    <span>{editForm.processing ? 'Saving Changes...' : 'Update Cohort'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
