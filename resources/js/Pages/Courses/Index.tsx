import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronRight,
    Layers,
    Users,
    Clock,
    Award,
    Plus,
    Pencil,
    X,
    CheckCircle2,
    GraduationCap,
    ShieldCheck,
    FileText,
    Target
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
}

interface InstructorOption {
    id: number;
    name: string;
    email: string;
}

interface CourseItem {
    id: number;
    title: string;
    slug: string;
    code?: string | null;
    programme_id?: number | string | null;
    programme?: ProgrammeOption | null;
    summary?: string | null;
    description: string;
    level: string;
    credit_hours?: number;
    estimated_duration_hours?: number;
    passing_score?: number;
    status?: string;
    is_published?: boolean;
    modules?: any[];
    cohorts?: any[];
    instructors?: InstructorOption[];
}

interface CoursesIndexProps {
    courses: CourseItem[];
    programmes?: ProgrammeOption[];
    instructors?: InstructorOption[];
    canManage?: boolean;
}

export default function CoursesIndex({
    courses,
    programmes = [],
    instructors = [],
    canManage = false,
}: CoursesIndexProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);

    // Form for Adding New Course
    const createForm = useForm({
        title: '',
        code: '',
        programme_id: (programmes[0]?.id || '') as number | string,
        level: 'beginner',
        credit_hours: 3,
        estimated_duration_hours: 40,
        passing_score: 70,
        status: 'published',
        is_published: true,
        summary: '',
        description: '',
        instructor_ids: [] as number[],
    });

    // Form for Updating Course
    const editForm = useForm({
        title: '',
        code: '',
        programme_id: '' as number | string,
        level: 'beginner',
        credit_hours: 3,
        estimated_duration_hours: 40,
        passing_score: 70,
        status: 'published',
        is_published: true,
        summary: '',
        description: '',
        instructor_ids: [] as number[],
    });

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.transform((data) => ({
            ...data,
            programme_id: data.programme_id ? Number(data.programme_id) : null,
            credit_hours: Number(data.credit_hours) || 3,
            estimated_duration_hours: Number(data.estimated_duration_hours) || 40,
            passing_score: Number(data.passing_score) || 70,
        }));

        createForm.post(route('courses.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                setIsCreating(false);
            },
        });
    };

    const handleEditOpen = (course: CourseItem) => {
        setEditingCourse(course);
        editForm.clearErrors();

        const instructorIds = course.instructors
            ? course.instructors.map((ins) => ins.id)
            : [];

        editForm.setData({
            title: course.title || '',
            code: course.code || '',
            programme_id: course.programme_id ? String(course.programme_id) : '',
            level: course.level || 'beginner',
            credit_hours: course.credit_hours || 3,
            estimated_duration_hours: course.estimated_duration_hours || 40,
            passing_score: course.passing_score || 70,
            status: course.status || 'published',
            is_published: course.is_published ?? true,
            summary: course.summary || '',
            description: course.description || '',
            instructor_ids: instructorIds,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCourse) return;

        editForm.transform((data) => ({
            ...data,
            programme_id: data.programme_id ? Number(data.programme_id) : null,
            credit_hours: Number(data.credit_hours) || 3,
            estimated_duration_hours: Number(data.estimated_duration_hours) || 40,
            passing_score: Number(data.passing_score) || 70,
        }));

        editForm.put(route('courses.update', editingCourse.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCourse(null);
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            Cybersecurity Training Programmes & Courses
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Official curriculum at Greg & Co. ICT Academy — Makurdi
                        </p>
                    </div>

                    {canManage && (
                        <button
                            onClick={() => setIsCreating(!isCreating)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                        >
                            <Plus className="w-4 h-4" /> Add New Course
                        </button>
                    )}
                </div>
            }
        >
            <Head title="Courses & Programmes - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Course Creation Form (Collapsible) */}
                {isCreating && canManage && (
                    <form
                        onSubmit={handleCreateSubmit}
                        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-lg space-y-5"
                    >
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-500" />
                                Establish New Curriculum Course
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded">
                                LMS Syllabus
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
                            <div className="lg:col-span-2">
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="e.g. Applied Threat Hunting & Active Defence"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                                {createForm.errors.title && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.title}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Course Code
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.code}
                                    onChange={(e) => createForm.setData('code', e.target.value)}
                                    placeholder="e.g. CYB-205"
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 uppercase"
                                />
                                {createForm.errors.code && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.code}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Target Academic Programme
                                </label>
                                <select
                                    value={createForm.data.programme_id}
                                    onChange={(e) => createForm.setData('programme_id', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                >
                                    <option value="">-- Standalone Course / No Programme --</option>
                                    {programmes.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.title} ({p.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Curriculum Level
                                </label>
                                <select
                                    value={createForm.data.level}
                                    onChange={(e) => createForm.setData('level', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                >
                                    <option value="beginner">Beginner (Foundational)</option>
                                    <option value="intermediate">Intermediate (Practitioner)</option>
                                    <option value="advanced">Advanced (Specialist / SOC)</option>
                                    <option value="beginner_to_intermediate">Beginner to Intermediate</option>
                                    <option value="intermediate_to_advanced">Intermediate to Advanced</option>
                                    <option value="all_levels">All Levels</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Credit Hours
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="60"
                                    value={createForm.data.credit_hours}
                                    onChange={(e) => createForm.setData('credit_hours', parseInt(e.target.value) || 3)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Estimated Duration (Hours)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="500"
                                    value={createForm.data.estimated_duration_hours}
                                    onChange={(e) => createForm.setData('estimated_duration_hours', parseInt(e.target.value) || 40)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Passing Score Threshold (%)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={createForm.data.passing_score}
                                    onChange={(e) => createForm.setData('passing_score', parseInt(e.target.value) || 70)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Publication Status
                                </label>
                                <select
                                    value={createForm.data.status}
                                    onChange={(e) => createForm.setData('status', e.target.value)}
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                >
                                    <option value="published">Published (Visible to Learners)</option>
                                    <option value="draft">Draft (Curriculum Development)</option>
                                    <option value="review">Under Review (Pending Approval)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Course Summary (Short overview)
                                </label>
                                <input
                                    type="text"
                                    value={createForm.data.summary}
                                    onChange={(e) => createForm.setData('summary', e.target.value)}
                                    placeholder="Brief single-sentence synopsis of this course syllabus..."
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Full Course Syllabus Description
                                </label>
                                <textarea
                                    value={createForm.data.description}
                                    onChange={(e) => createForm.setData('description', e.target.value)}
                                    rows={3}
                                    placeholder="Detailed overview of curriculum competencies, lab outcomes, and learning tracks..."
                                    className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    required
                                />
                                {createForm.errors.description && <p className="text-red-500 text-[10px] mt-1">{createForm.errors.description}</p>}
                            </div>
                        </div>

                        {instructors.length > 0 && (
                            <div className="pt-2 text-xs">
                                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                                    Assign Course Instructors (Optional)
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
                                                <GraduationCap className="w-3.5 h-3.5" />
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
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                            >
                                {createForm.processing ? 'Establishing...' : 'Save Course Curriculum'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Courses Listing */}
                {courses.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-4 shadow-xs">
                        <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">No Courses Established Yet</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                            The academy curriculum catalogue is ready for training courses and lab modules.
                        </p>
                        {canManage && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition"
                            >
                                <Plus className="w-4 h-4" /> Add First Course
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {courses.map((course) => {
                            const totalModules = course.modules?.length || 0;
                            const totalLabs =
                                course.modules?.reduce(
                                    (acc: number, mod: any) =>
                                        acc +
                                        (mod.lessons?.reduce(
                                            (lAcc: number, l: any) => lAcc + (l.laboratories?.length || 0),
                                            0
                                        ) || 0),
                                    0
                                ) || 0;

                            return (
                                <div
                                    key={course.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between group relative"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                                    {course.level}
                                                </span>
                                                {course.code && (
                                                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {course.code}
                                                    </span>
                                                )}
                                                {course.status && course.status !== 'published' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                                                        {course.status}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {course.cohorts?.length || 0} Cohorts Active
                                                </span>
                                                {canManage && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditOpen(course)}
                                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-bold transition shadow-xs"
                                                        title="Edit course curriculum"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                        <span>Edit</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Programme / Pathway Badge */}
                                        {course.programme && (
                                            <div>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[11px] font-bold border border-blue-100 dark:border-blue-900/50">
                                                    <GraduationCap className="w-3 h-3" />
                                                    {course.programme.title}
                                                </span>
                                            </div>
                                        )}

                                        <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                                            {course.title}
                                        </h3>

                                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                            {course.summary || course.description}
                                        </p>

                                        {/* Course Metric Highlights */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                                                <span className="truncate"><strong>{totalModules}</strong> Modules</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                <span className="truncate"><strong>{totalLabs}</strong> Labs</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                                <span className="truncate"><strong>{course.estimated_duration_hours || 40}</strong>h</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                                                <Target className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                                                <span className="truncate">Pass: <strong>{course.passing_score || 70}</strong>%</span>
                                            </div>
                                        </div>

                                        {/* Assigned Instructors */}
                                        {course.instructors && course.instructors.length > 0 && (
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-1">
                                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">Instructors:</span>
                                                {course.instructors.map((ins) => (
                                                    <span
                                                        key={ins.id}
                                                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]"
                                                    >
                                                        {ins.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Bar / Footer */}
                                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 mt-6 flex items-center justify-between gap-3">
                                        {canManage ? (
                                            <button
                                                type="button"
                                                onClick={() => handleEditOpen(course)}
                                                className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition"
                                            >
                                                <Pencil className="w-3 h-3" /> Edit Course
                                            </button>
                                        ) : (
                                            <span className="text-[11px] text-slate-400">Greg & Co. ICT Academy</span>
                                        )}

                                        <Link
                                            href={route('courses.show', course.slug)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                                        >
                                            <span>Explore Syllabus & Labs</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* ============================================================ */}
                {/* EDIT COURSE MODAL                                            */}
                {/* ============================================================ */}
                {editingCourse && canManage && (
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
                                            Edit Course Curriculum
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                            Update syllabus metadata, level, passing score, and assigned instructors
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                                <div className="lg:col-span-2">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Course Title
                                    </label>
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
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.code}
                                        onChange={(e) => editForm.setData('code', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 uppercase"
                                    />
                                    {editForm.errors.code && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.code}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Academic Programme
                                    </label>
                                    <select
                                        value={editForm.data.programme_id}
                                        onChange={(e) => editForm.setData('programme_id', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="">-- Standalone Course / No Programme --</option>
                                        {programmes.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} ({p.code})
                                            </option>
                                        ))}
                                    </select>
                                    {editForm.errors.programme_id && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.programme_id}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Curriculum Level
                                    </label>
                                    <select
                                        value={editForm.data.level}
                                        onChange={(e) => editForm.setData('level', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="beginner">Beginner (Foundational)</option>
                                        <option value="intermediate">Intermediate (Practitioner)</option>
                                        <option value="advanced">Advanced (Specialist / SOC)</option>
                                        <option value="beginner_to_intermediate">Beginner to Intermediate</option>
                                        <option value="intermediate_to_advanced">Intermediate to Advanced</option>
                                        <option value="all_levels">All Levels</option>
                                    </select>
                                    {editForm.errors.level && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.level}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Credit Hours
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="60"
                                        value={editForm.data.credit_hours}
                                        onChange={(e) => editForm.setData('credit_hours', parseInt(e.target.value) || 3)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Estimated Duration (Hours)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="500"
                                        value={editForm.data.estimated_duration_hours}
                                        onChange={(e) => editForm.setData('estimated_duration_hours', parseInt(e.target.value) || 40)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Passing Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={editForm.data.passing_score}
                                        onChange={(e) => editForm.setData('passing_score', parseInt(e.target.value) || 70)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Workflow Status
                                    </label>
                                    <select
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    >
                                        <option value="published">Published</option>
                                        <option value="draft">Draft</option>
                                        <option value="review">Under Review</option>
                                        <option value="archived">Archived</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Course Summary (Short overview)
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.data.summary}
                                        onChange={(e) => editForm.setData('summary', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Full Course Description
                                    </label>
                                    <textarea
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                                        required
                                    />
                                    {editForm.errors.description && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.description}</p>}
                                </div>
                            </div>

                            {/* Instructors Multi-Assignment */}
                            {instructors.length > 0 && (
                                <div className="space-y-2 text-xs pt-1">
                                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                                        Assigned Course Instructors
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
                                                    <GraduationCap className="w-3.5 h-3.5" />
                                                    <span>{ins.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {editForm.errors.instructor_ids && <p className="text-red-500 text-[10px] mt-1">{editForm.errors.instructor_ids}</p>}
                                </div>
                            )}

                            {/* Active / Published Toggle */}
                            <div className="pt-1 flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={editForm.data.is_published}
                                        onChange={(e) => editForm.setData('is_published', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>Publish Course (Make accessible to Academy trainees)</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingCourse(null)}
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
                                    <span>{editForm.processing ? 'Saving Changes...' : 'Update Course Curriculum'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
