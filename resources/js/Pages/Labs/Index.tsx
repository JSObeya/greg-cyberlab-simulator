import React, { useState, useMemo } from 'react';
import { Head, Link, usePage, useForm, router } from '@inertiajs/react';
import {
    FlaskConical,
    Terminal,
    ShieldCheck,
    Activity,
    BookOpen,
    Award,
    Search,
    Filter,
    ChevronRight,
    Clock,
    CheckCircle2,
    Play,
    RotateCcw,
    Sparkles,
    Cpu,
    Radar,
    GraduationCap,
    Lock,
    Plus,
    Pencil,
    Trash2,
    CheckSquare,
    Square,
    X,
    Loader2,
    Check,
    Wrench,
    SlidersHorizontal
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
    courses_count?: number;
}

interface CourseOption {
    id: number;
    title: string;
    code: string;
    programme_id?: number;
}

interface WorkspaceOption {
    value: string;
    label: string;
}

interface LabItem {
    id: number;
    title: string;
    slug: string;
    category: string;
    difficulty: string;
    estimated_minutes: number;
    passing_score: number;
    primary_workspace: string;
    scenario_background: string;
    learning_objectives?: string;
    course?: {
        id: number;
        title: string;
        code: string;
        programme?: {
            id: number;
            title: string;
            code: string;
        } | null;
    } | null;
    user_progress: {
        is_completed: boolean;
        has_active_attempt: boolean;
        attempts_count: number;
        best_score?: number | null;
        last_attempt_id?: number | null;
    };
}

interface LabsIndexProps {
    laboratories: LabItem[];
    programmes: ProgrammeOption[];
    courses?: CourseOption[];
    workspaces: WorkspaceOption[];
    filters: {
        search?: string;
        programme_id?: string;
        difficulty?: string;
        workspace?: string;
    };
    stats: {
        total_labs: number;
        completed_count: number;
        completion_percentage: number;
    };
}

export default function LabsIndex({
    laboratories = [],
    programmes = [],
    courses = [],
    workspaces = [],
    filters = {},
    stats,
}: LabsIndexProps) {
    const { auth, flash } = usePage<any>().props;
    const isAdmin = auth?.user?.role === 'admin' || auth?.user?.role === 'super_admin';

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProgramme, setSelectedProgramme] = useState<string>(filters.programme_id || '');
    const [selectedWorkspace, setSelectedWorkspace] = useState<string>(filters.workspace || '');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(filters.difficulty || '');
    const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, completed, in_progress, not_attempted

    // Admin Card Selection
    const [selectedLabIds, setSelectedLabIds] = useState<number[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingLab, setEditingLab] = useState<LabItem | null>(null);
    const [isBulkDifficultyModalOpen, setIsBulkDifficultyModalOpen] = useState(false);
    const [isBulkWorkspaceModalOpen, setIsBulkWorkspaceModalOpen] = useState(false);
    const [bulkDifficulty, setBulkDifficulty] = useState('intermediate');
    const [bulkWorkspace, setBulkWorkspace] = useState('kali_terminal');
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    // Form for Creating New Lab
    const createForm = useForm({
        title: '',
        course_id: courses[0]?.id || '',
        category: 'tactical_cyber',
        difficulty: 'beginner',
        primary_workspace: 'general_workbench',
        estimated_minutes: 45,
        passing_score: 75,
        scenario_background: '',
        learning_objectives: '',
    });

    // Form for Editing Existing Lab
    const editForm = useForm({
        title: '',
        category: '',
        difficulty: 'beginner',
        primary_workspace: 'general_workbench',
        estimated_minutes: 45,
        passing_score: 75,
        scenario_background: '',
        learning_objectives: '',
    });

    // Client-side instant filtering for responsiveness
    const filteredLabs = useMemo(() => {
        return laboratories.filter((lab) => {
            // Search text
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const matchesTitle = lab.title.toLowerCase().includes(term);
                const matchesScenario = lab.scenario_background?.toLowerCase().includes(term) ?? false;
                const matchesCategory = lab.category?.toLowerCase().includes(term) ?? false;
                const matchesCourse = lab.course?.title?.toLowerCase().includes(term) ?? false;
                if (!matchesTitle && !matchesScenario && !matchesCategory && !matchesCourse) {
                    return false;
                }
            }

            // Programme filter
            if (selectedProgramme) {
                if (lab.course?.programme?.id !== Number(selectedProgramme)) {
                    return false;
                }
            }

            // Workspace filter
            if (selectedWorkspace) {
                if (lab.primary_workspace !== selectedWorkspace) {
                    return false;
                }
            }

            // Difficulty filter
            if (selectedDifficulty) {
                if (lab.difficulty !== selectedDifficulty) {
                    return false;
                }
            }

            // Status filter
            if (selectedStatus === 'completed') {
                if (!lab.user_progress.is_completed) return false;
            } else if (selectedStatus === 'in_progress') {
                if (!lab.user_progress.has_active_attempt || lab.user_progress.is_completed) return false;
            } else if (selectedStatus === 'not_attempted') {
                if (lab.user_progress.attempts_count > 0) return false;
            }

            return true;
        });
    }, [laboratories, searchTerm, selectedProgramme, selectedWorkspace, selectedDifficulty, selectedStatus]);

    // Selection helpers for filtered items
    const filteredIds = filteredLabs.map((l) => l.id);
    const isAllSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedLabIds.includes(id));
    const isSomeSelected = selectedLabIds.length > 0 && !isAllSelected;

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedLabIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
        } else {
            setSelectedLabIds((prev) => Array.from(new Set([...prev, ...filteredIds])));
        }
    };

    const handleToggleSelectOne = (id: number) => {
        setSelectedLabIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.labs.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleEditOpen = (lab: LabItem) => {
        setEditingLab(lab);
        editForm.setData({
            title: lab.title,
            category: lab.category,
            difficulty: lab.difficulty,
            primary_workspace: lab.primary_workspace,
            estimated_minutes: lab.estimated_minutes,
            passing_score: lab.passing_score,
            scenario_background: lab.scenario_background,
            learning_objectives: lab.learning_objectives || '',
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLab) return;

        editForm.put(route('admin.labs.update', editingLab.id), {
            onSuccess: () => {
                setEditingLab(null);
            },
        });
    };

    const handleDeleteLab = (lab: LabItem) => {
        if (confirm(`Are you sure you want to delete simulation laboratory "${lab.title}"?`)) {
            router.delete(route('admin.labs.destroy', lab.id));
        }
    };

    const executeBulkAction = (action: string, extraData: Record<string, any> = {}) => {
        if (selectedLabIds.length === 0) return;

        if (action === 'delete') {
            if (!confirm(`Are you sure you want to delete ${selectedLabIds.length} selected laboratory card(s)?`)) {
                return;
            }
        }

        setIsProcessingBulk(true);
        router.post(
            route('admin.labs.bulk-action'),
            {
                lab_ids: selectedLabIds,
                action,
                ...extraData,
            },
            {
                onFinish: () => {
                    setIsProcessingBulk(false);
                    setSelectedLabIds([]);
                    setIsBulkDifficultyModalOpen(false);
                    setIsBulkWorkspaceModalOpen(false);
                },
            }
        );
    };

    const getWorkspaceBadge = (ws: string) => {
        switch (ws) {
            case 'kali_terminal':
                return {
                    label: 'Kali Terminal',
                    icon: <Terminal className="w-3.5 h-3.5 text-blue-400" />,
                    bg: 'bg-blue-950/70 border-blue-800/60 text-blue-300',
                };
            case 'phishing_analyzer':
            case 'phishing_workbench':
                return {
                    label: 'Phishing Analyzer',
                    icon: <ShieldCheck className="w-3.5 h-3.5 text-red-400" />,
                    bg: 'bg-red-950/70 border-red-800/60 text-red-300',
                };
            case 'log_auditor':
            case 'log_investigation':
                return {
                    label: 'Log Forensics',
                    icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
                    bg: 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300',
                };
            case 'packet_inspector':
            case 'packet_workbench':
                return {
                    label: 'PCAP Inspector',
                    icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
                    bg: 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300',
                };
            case 'soc_queue':
            case 'soc_center':
                return {
                    label: 'SIEM Triage',
                    icon: <Award className="w-3.5 h-3.5 text-amber-400" />,
                    bg: 'bg-amber-950/70 border-amber-800/60 text-amber-300',
                };
            default:
                return {
                    label: 'General Workbench',
                    icon: <Radar className="w-3.5 h-3.5 text-purple-400" />,
                    bg: 'bg-purple-950/70 border-purple-800/60 text-purple-300',
                };
        }
    };

    const getDifficultyBadge = (diff: string) => {
        switch (diff?.toLowerCase()) {
            case 'beginner':
                return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'intermediate':
                return 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'advanced':
                return 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            default:
                return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                            <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                            Simulation Laboratories Arena
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Direct-access cybersecurity simulation workbenches, tactical scenarios, and terminal operations
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-xs transition"
                            >
                                <Plus className="w-4 h-4" />
                                <span>New Laboratory</span>
                            </button>
                        )}

                        <Link
                            href={route('courses.index')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Curriculum Syllabus</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Simulation Laboratories - Greg Cyberlab" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Flash Messages Alert */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs shadow-xs">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300 text-xs shadow-xs">
                        <X className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* Stats Top Banner */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Total Simulation Labs
                        </span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{stats.total_labs}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900">
                                2 Pathways
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Your Passed Labs
                        </span>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <span>{stats.completed_count}</span>
                            <span className="text-xs font-mono font-normal text-slate-400">
                                / {stats.total_labs}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Curriculum Mastery
                        </span>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                            {stats.completion_percentage}%
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${stats.completion_percentage}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Defense Workbenches
                        </span>
                        <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <span>6 Workbenches</span>
                        </div>
                    </div>
                </div>

                {/* Sticky Bulk Action Bar for Admins */}
                {isAdmin && selectedLabIds.length > 0 && (
                    <div className="sticky top-20 z-30 p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white border-2 border-blue-500 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
                                {selectedLabIds.length} Labs Selected
                            </span>
                            <span className="text-xs text-slate-300">
                                Perform batch actions across all selected simulation cards:
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => setIsBulkDifficultyModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5" />
                                <span>Change Difficulty</span>
                            </button>

                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => setIsBulkWorkspaceModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <Wrench className="w-3.5 h-3.5" />
                                <span>Change Workspace</span>
                            </button>

                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => executeBulkAction('delete')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Selected</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedLabIds([])}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                                title="Clear Selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                        {/* Search Input */}
                        <div className="md:col-span-4 relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search simulation labs, scenarios, keywords..."
                                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Programme Pathway Filter */}
                        <div className="md:col-span-3">
                            <select
                                value={selectedProgramme}
                                onChange={(e) => setSelectedProgramme(e.target.value)}
                                className="w-full text-xs py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- All Programme Pathways --</option>
                                {programmes.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.title} ({p.code})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Workspace Filter */}
                        <div className="md:col-span-3">
                            <select
                                value={selectedWorkspace}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                className="w-full text-xs py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- All 6 Workbenches --</option>
                                {workspaces.map((ws) => (
                                    <option key={ws.value} value={ws.value}>
                                        {ws.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div className="md:col-span-2">
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full text-xs py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Difficulty --</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Quick Status Pills & Select All Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div className="flex flex-wrap items-center gap-1.5">
                            {isAdmin && (
                                <button
                                    type="button"
                                    onClick={handleToggleSelectAll}
                                    className="mr-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={(input) => {
                                            if (input) input.indeterminate = isSomeSelected;
                                        }}
                                        onChange={handleToggleSelectAll}
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span>{isAllSelected ? 'Deselect All' : 'Select All Labs'}</span>
                                </button>
                            )}

                            {[
                                { key: 'all', label: 'All Laboratories' },
                                { key: 'completed', label: 'Passed / Completed' },
                                { key: 'in_progress', label: 'In Progress' },
                                { key: 'not_attempted', label: 'Not Started' },
                            ].map((st) => (
                                <button
                                    key={st.key}
                                    type="button"
                                    onClick={() => setSelectedStatus(st.key)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                                        selectedStatus === st.key
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {st.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-slate-400 text-[11px]">
                            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredLabs.length}</strong> of {laboratories.length} laboratories
                            {selectedLabIds.length > 0 && (
                                <span className="ml-2 text-blue-600 dark:text-blue-400 font-bold">
                                    ({selectedLabIds.length} selected)
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Laboratory Cards Grid */}
                {filteredLabs.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-12 text-center space-y-3">
                        <FlaskConical className="w-8 h-8 text-slate-400 mx-auto" />
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            No laboratories match your current filters
                        </h3>
                        <p className="text-xs text-slate-400">
                            Try adjusting your search keywords, selected programme, or workspace filter.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedProgramme('');
                                setSelectedWorkspace('');
                                setSelectedDifficulty('');
                                setSelectedStatus('all');
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition mt-2"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredLabs.map((lab) => {
                            const ws = getWorkspaceBadge(lab.primary_workspace);
                            const isCompleted = lab.user_progress.is_completed;
                            const hasActiveAttempt = lab.user_progress.has_active_attempt;
                            const isSelected = selectedLabIds.includes(lab.id);

                            return (
                                <div
                                    key={lab.id}
                                    className={`rounded-2xl border p-5 shadow-xs space-y-4 transition flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-blue-500/10'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        {/* Card Top Header: Checkbox + Workspace + Difficulty */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {isAdmin && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSelectOne(lab.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                )}
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${ws.bg}`}>
                                                    {ws.icon}
                                                    <span>{ws.label}</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getDifficultyBadge(lab.difficulty)}`}>
                                                    {lab.difficulty}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Programme Pathway Pill */}
                                        {lab.course?.programme && (
                                            <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 max-w-full truncate">
                                                <GraduationCap className="w-3 h-3 text-blue-500 shrink-0" />
                                                <span className="truncate">{lab.course.programme.title}</span>
                                            </div>
                                        )}

                                        {/* Lab Title */}
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {lab.title}
                                            </h3>
                                        </div>

                                        {/* Scenario Summary */}
                                        {lab.scenario_background && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                                {lab.scenario_background}
                                            </p>
                                        )}

                                        {/* Metrics Info */}
                                        <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>~{lab.estimated_minutes} Mins</span>
                                            </div>
                                            <div className="text-right">
                                                <span>Pass Score: <strong>{lab.passing_score}%</strong></span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                        {/* Completion Status Pill */}
                                        <div>
                                            {isCompleted ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span>Passed ({lab.user_progress.best_score}%)</span>
                                                </span>
                                            ) : hasActiveAttempt ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
                                                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                                                    <span>In Progress</span>
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-medium">
                                                    Not started
                                                </span>
                                            )}
                                        </div>

                                        {/* CTA / Admin Buttons */}
                                        <div className="flex items-center gap-1.5">
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleEditOpen(lab)}
                                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                                        title="Edit Laboratory"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLab(lab)}
                                                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                                                        title="Delete Laboratory"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            )}

                                            <Link
                                                href={route('simulation.show', lab.slug)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                                                    isCompleted
                                                        ? 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600'
                                                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                                }`}
                                            >
                                                <Play className="w-3 h-3 fill-current" />
                                                <span>{isCompleted ? 'Re-run' : hasActiveAttempt ? 'Resume' : 'Launch'}</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Bulk Set Difficulty */}
            {isBulkDifficultyModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <SlidersHorizontal className="w-5 h-5 text-blue-600" />
                                <span>Batch Difficulty Level</span>
                            </h3>
                            <button onClick={() => setIsBulkDifficultyModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Apply difficulty level to all <strong>{selectedLabIds.length}</strong> selected laboratories:
                        </p>
                        <select
                            value={bulkDifficulty}
                            onChange={(e) => setBulkDifficulty(e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                        </select>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsBulkDifficultyModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeBulkAction('set_difficulty', { difficulty: bulkDifficulty })}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs"
                            >
                                Update {selectedLabIds.length} Labs
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Bulk Set Workspace */}
            {isBulkWorkspaceModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Wrench className="w-5 h-5 text-purple-600" />
                                <span>Batch Workspace Assignment</span>
                            </h3>
                            <button onClick={() => setIsBulkWorkspaceModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Assign primary workspace to all <strong>{selectedLabIds.length}</strong> selected laboratories:
                        </p>
                        <select
                            value={bulkWorkspace}
                            onChange={(e) => setBulkWorkspace(e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {workspaces.map((ws) => (
                                <option key={ws.value} value={ws.value}>
                                    {ws.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsBulkWorkspaceModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeBulkAction('set_workspace', { workspace: bulkWorkspace })}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
                            >
                                Update {selectedLabIds.length} Workspaces
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create Laboratory */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-600" />
                                <span>Create Simulation Laboratory</span>
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Laboratory Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.title}
                                    onChange={(e) => createForm.setData('title', e.target.value)}
                                    placeholder="e.g. NP-LAB 13: Tactical DNS Exfiltration Defense"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Assigned Course
                                </label>
                                <select
                                    required
                                    value={createForm.data.course_id}
                                    onChange={(e) => createForm.setData('course_id', Number(e.target.value))}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.title} ({c.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Primary Workspace
                                    </label>
                                    <select
                                        value={createForm.data.primary_workspace}
                                        onChange={(e) => createForm.setData('primary_workspace', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        {workspaces.map((ws) => (
                                            <option key={ws.value} value={ws.value}>
                                                {ws.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Difficulty Level
                                    </label>
                                    <select
                                        value={createForm.data.difficulty}
                                        onChange={(e) => createForm.setData('difficulty', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Estimated Minutes
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="300"
                                        required
                                        value={createForm.data.estimated_minutes}
                                        onChange={(e) => createForm.setData('estimated_minutes', Number(e.target.value))}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Passing Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="100"
                                        required
                                        value={createForm.data.passing_score}
                                        onChange={(e) => createForm.setData('passing_score', Number(e.target.value))}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Scenario Background & Context
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={createForm.data.scenario_background}
                                    onChange={(e) => createForm.setData('scenario_background', e.target.value)}
                                    placeholder="Describe the tactical simulation background and operational setting..."
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs inline-flex items-center gap-1.5"
                                >
                                    {createForm.processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Create Laboratory</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Laboratory */}
            {editingLab && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Pencil className="w-5 h-5 text-blue-600" />
                                <span>Edit Simulation Laboratory</span>
                            </h3>
                            <button onClick={() => setEditingLab(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Laboratory Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.title}
                                    onChange={(e) => editForm.setData('title', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Primary Workspace
                                    </label>
                                    <select
                                        value={editForm.data.primary_workspace}
                                        onChange={(e) => editForm.setData('primary_workspace', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        {workspaces.map((ws) => (
                                            <option key={ws.value} value={ws.value}>
                                                {ws.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Difficulty
                                    </label>
                                    <select
                                        value={editForm.data.difficulty}
                                        onChange={(e) => editForm.setData('difficulty', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Estimated Minutes
                                    </label>
                                    <input
                                        type="number"
                                        min="5"
                                        max="300"
                                        required
                                        value={editForm.data.estimated_minutes}
                                        onChange={(e) => editForm.setData('estimated_minutes', Number(e.target.value))}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Passing Score (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="100"
                                        required
                                        value={editForm.data.passing_score}
                                        onChange={(e) => editForm.setData('passing_score', Number(e.target.value))}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Scenario Background
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={editForm.data.scenario_background}
                                    onChange={(e) => editForm.setData('scenario_background', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingLab(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs inline-flex items-center gap-1.5"
                                >
                                    {editForm.processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
