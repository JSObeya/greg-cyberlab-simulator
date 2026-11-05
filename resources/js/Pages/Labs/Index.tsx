import React, { useState, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Lock
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
    courses_count?: number;
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
    workspaces = [],
    filters = {},
    stats,
}: LabsIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedProgramme, setSelectedProgramme] = useState<string>(filters.programme_id || '');
    const [selectedWorkspace, setSelectedWorkspace] = useState<string>(filters.workspace || '');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>(filters.difficulty || '');
    const [selectedStatus, setSelectedStatus] = useState<string>('all'); // all, completed, in_progress, not_attempted

    // Client-side instant filtering for lightning-fast responsiveness
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

    const getWorkspaceBadge = (ws: string) => {
        switch (ws) {
            case 'kali_terminal':
                return {
                    label: 'Kali Terminal',
                    icon: <Terminal className="w-3.5 h-3.5 text-blue-400" />,
                    bg: 'bg-blue-950/70 border-blue-800/60 text-blue-300',
                };
            case 'phishing_analyzer':
                return {
                    label: 'Phishing Analyzer',
                    icon: <ShieldCheck className="w-3.5 h-3.5 text-red-400" />,
                    bg: 'bg-red-950/70 border-red-800/60 text-red-300',
                };
            case 'log_auditor':
                return {
                    label: 'Log Forensics',
                    icon: <Activity className="w-3.5 h-3.5 text-emerald-400" />,
                    bg: 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300',
                };
            case 'packet_inspector':
                return {
                    label: 'PCAP Inspector',
                    icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
                    bg: 'bg-cyan-950/70 border-cyan-800/60 text-cyan-300',
                };
            case 'soc_queue':
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
                            Direct-access cybersecurity simulation workbenches, tactical scenarios, and terminal operations.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
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
                            <span className="text-xs font-semibold text-slate-400">
                                / {stats.total_labs}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Mastery Progress
                        </span>
                        <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                            <span>{stats.completion_percentage}%</span>
                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ms-2">
                                <div
                                    className="h-full bg-cyan-500 rounded-full transition-all"
                                    style={{ width: `${stats.completion_percentage}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Sandbox Security
                        </span>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                            <Lock className="w-4 h-4 shrink-0" />
                            <span>100% Air-Gapped Simulation</span>
                        </div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                        {/* Text Search */}
                        <div className="md:col-span-4 relative">
                            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by lab title, topic, or scenario..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Programme Selector */}
                        <div className="md:col-span-3">
                            <select
                                value={selectedProgramme}
                                onChange={(e) => setSelectedProgramme(e.target.value)}
                                className="w-full py-2.5 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                            >
                                <option value="">-- All Academic Programmes --</option>
                                {programmes.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        [{p.code}] {p.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Workspace Selector */}
                        <div className="md:col-span-3">
                            <select
                                value={selectedWorkspace}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                className="w-full py-2.5 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                            >
                                <option value="">-- All 6 Workbenches --</option>
                                {workspaces.map((w) => (
                                    <option key={w.value} value={w.value}>
                                        {w.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Selector */}
                        <div className="md:col-span-2">
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value)}
                                className="w-full py-2.5 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white text-xs focus:ring-blue-500"
                            >
                                <option value="">All Difficulties</option>
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                    </div>

                    {/* Status Pills */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-slate-400 text-[11px] font-bold me-1">Status:</span>
                            {[
                                { key: 'all', label: 'All Laboratories' },
                                { key: 'completed', label: 'Completed' },
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

                            return (
                                <div
                                    key={lab.id}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 hover:border-blue-400 dark:hover:border-blue-500/60 transition group flex flex-col justify-between"
                                >
                                    <div className="space-y-3">
                                        {/* Card Top Header: Workspace + Difficulty */}
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border ${ws.bg}`}>
                                                {ws.icon}
                                                <span>{ws.label}</span>
                                            </span>

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

                                        {/* Launch CTA */}
                                        <Link
                                            href={route('simulation.show', lab.slug)}
                                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                                                isCompleted
                                                    ? 'bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-slate-700 dark:text-slate-300 hover:text-blue-600'
                                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                                            }`}
                                        >
                                            <Play className="w-3 h-3 fill-current" />
                                            <span>{isCompleted ? 'Re-run Lab' : hasActiveAttempt ? 'Resume' : 'Launch Lab'}</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

