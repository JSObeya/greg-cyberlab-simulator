import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    BarChart3,
    CheckSquare,
    Users,
    Download,
    FileSpreadsheet,
    Award,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Filter,
    Search,
    Shield,
    ArrowUpRight,
    HelpCircle,
    User,
    Layers
} from 'lucide-react';

interface Metrics {
    total_attempts: number;
    unique_candidates: number;
    passed_attempts: number;
    pass_rate: number;
    average_score: number;
}

interface Distribution {
    below_50: number;
    range_50_69: number;
    range_70_84: number;
    range_85_100: number;
}

interface HardestQuestion {
    question_id: number;
    quiz_title: string;
    prompt: string;
    total_responses: number;
    correct_responses: number;
    accuracy_rate: number;
    error_rate: number;
}

interface RecentResult {
    id: number;
    quiz_id: number;
    quiz_title: string;
    candidate_name: string;
    candidate_email: string;
    cohort_name: string;
    attempt_number: number;
    score_percentage: number;
    total_score: number;
    is_passed: boolean;
    submitted_at: string;
}

interface CohortStat {
    cohort_id: number;
    name: string;
    code: string;
    enrolled_count: number;
    attempts_count: number;
    pass_rate: number;
    average_score: number;
}

interface Props {
    metrics: Metrics;
    distribution: Distribution;
    hardest_questions: HardestQuestion[];
    recent_results: RecentResult[];
    cohort_breakdown: CohortStat[];
    quizzes: Array<{ id: number; title: string }>;
    cohorts: Array<{ id: number; name: string; code: string }>;
    programmes: Array<{ id: number; title: string; code: string }>;
    filters: {
        quiz_id?: number | null;
        cohort_id?: number | null;
        programme_id?: number | null;
    };
}

export default function ExamAnalytics({
    metrics,
    distribution,
    hardest_questions,
    recent_results,
    cohort_breakdown,
    quizzes,
    cohorts,
    programmes,
    filters,
}: Props) {
    const [selectedQuiz, setSelectedQuiz] = useState<string>(filters.quiz_id ? String(filters.quiz_id) : '');
    const [selectedCohort, setSelectedCohort] = useState<string>(filters.cohort_id ? String(filters.cohort_id) : '');
    const [selectedProgramme, setSelectedProgramme] = useState<string>(filters.programme_id ? String(filters.programme_id) : '');
    const [tableSearch, setTableSearch] = useState('');

    const handleFilterChange = (quizId: string, cohortId: string, progId: string) => {
        router.get(
            route('exams.analytics'),
            {
                quiz_id: quizId || undefined,
                cohort_id: cohortId || undefined,
                programme_id: progId || undefined,
            },
            { preserveState: true }
        );
    };

    // Calculate percentage for score brackets
    const totalDist =
        distribution.below_50 +
        distribution.range_50_69 +
        distribution.range_70_84 +
        distribution.range_85_100 || 1;

    const pDistinction = Math.round((distribution.range_85_100 / totalDist) * 100);
    const pProficient = Math.round((distribution.range_70_84 / totalDist) * 100);
    const pDeveloping = Math.round((distribution.range_50_69 / totalDist) * 100);
    const pRemediation = Math.round((distribution.below_50 / totalDist) * 100);

    const filteredResults = recent_results.filter((res) => {
        const query = tableSearch.toLowerCase();
        return (
            res.candidate_name.toLowerCase().includes(query) ||
            res.candidate_email.toLowerCase().includes(query) ||
            res.quiz_title.toLowerCase().includes(query) ||
            res.cohort_name.toLowerCase().includes(query)
        );
    });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <BarChart3 className="w-5 h-5" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Examination Telemetry & Result Analytics
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Real-time Scoring Distributions, Knowledge Gap Forensics & Cohort Benchmarking
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={route('exams.export-results', {
                                quiz_id: selectedQuiz || undefined,
                                cohort_id: selectedCohort || undefined,
                                programme_id: selectedProgramme || undefined,
                            })}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                            title="Download complete result export matching active filters"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Export Results CSV</span>
                        </a>
                    </div>
                </div>
            }
        >
            <Head title="Examination Result Analytics - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Cohorts & Assessments Submenu Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <Link
                        href={route('cohorts.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                    >
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Cohorts Directory</span>
                    </Link>
                    <Link
                        href={route('exams.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                    >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>MCQ Examinations</span>
                    </Link>
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs"
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Result Analytics</span>
                    </button>
                </div>

                {/* Filter Toolbar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Filter className="w-4 h-4 text-cyan-400" /> Filter Analytics:
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <select
                            value={selectedQuiz}
                            onChange={(e) => {
                                setSelectedQuiz(e.target.value);
                                handleFilterChange(e.target.value, selectedCohort, selectedProgramme);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Examinations</option>
                            {quizzes.map((q) => (
                                <option key={q.id} value={q.id}>{q.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <select
                            value={selectedCohort}
                            onChange={(e) => {
                                setSelectedCohort(e.target.value);
                                handleFilterChange(selectedQuiz, e.target.value, selectedProgramme);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Cohorts</option>
                            {cohorts.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <select
                            value={selectedProgramme}
                            onChange={(e) => {
                                setSelectedProgramme(e.target.value);
                                handleFilterChange(selectedQuiz, selectedCohort, e.target.value);
                            }}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        >
                            <option value="">All Programmes</option>
                            {programmes.map((p) => (
                                <option key={p.id} value={p.id}>{p.title} ({p.code})</option>
                            ))}
                        </select>
                    </div>

                    {(selectedQuiz || selectedCohort || selectedProgramme) && (
                        <button
                            onClick={() => {
                                setSelectedQuiz('');
                                setSelectedCohort('');
                                setSelectedProgramme('');
                                handleFilterChange('', '', '');
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Attempts</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.total_attempts}</div>
                            <div className="text-[10px] text-emerald-400 font-medium">{metrics.passed_attempts} Qualified</div>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Unique Candidates</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.unique_candidates}</div>
                            <div className="text-[10px] text-cyan-400 font-medium">Cadets Examined</div>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overall Pass Rate</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.pass_rate}%</div>
                            <div className="text-[10px] text-emerald-400 font-medium">Met Standards</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Cohort Avg Score</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.average_score}%</div>
                            <div className="text-[10px] text-amber-400 font-medium">Evaluation Mean</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Score Distribution Curve & Performance Brackets */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-400" />
                                Candidate Score Distribution Brackets
                            </h3>
                            <p className="text-xs text-slate-400">Operational readiness breakdown across all examined trainees</p>
                        </div>
                        <span className="text-xs font-bold text-slate-400">
                            {metrics.total_attempts} Evaluated Attempts
                        </span>
                    </div>

                    <div className="space-y-4 pt-2">
                        {/* Distinction */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className="text-emerald-400 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                                    Distinction / Combat Ready (85% – 100%)
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">
                                    {distribution.range_85_100} Cadets ({pDistinction}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pDistinction}%` }}></div>
                            </div>
                        </div>

                        {/* Proficient */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className="text-cyan-400 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                                    Proficient / Standard Met (70% – 84%)
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">
                                    {distribution.range_70_84} Cadets ({pProficient}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div className="bg-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${pProficient}%` }}></div>
                            </div>
                        </div>

                        {/* Developing */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className="text-amber-400 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                                    Developing Competency (50% – 69%)
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">
                                    {distribution.range_50_69} Cadets ({pDeveloping}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pDeveloping}%` }}></div>
                            </div>
                        </div>

                        {/* Remediation */}
                        <div>
                            <div className="flex items-center justify-between text-xs font-bold mb-1">
                                <span className="text-rose-400 flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                                    Critical Remediation Required (&lt; 50%)
                                </span>
                                <span className="text-slate-800 dark:text-slate-200">
                                    {distribution.below_50} Cadets ({pRemediation}%)
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${pRemediation}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hardest Questions & Knowledge Gaps Analysis */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-400" />
                                Knowledge Gap Forensics: Questions with Highest Error Rates
                            </h3>
                            <p className="text-xs text-slate-400">
                                Top scenarios where trainees struggled; recommended for doctrine re-briefing
                            </p>
                        </div>
                    </div>

                    {hardest_questions.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            No question failure data recorded yet.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-2.5 px-3">Examination</th>
                                        <th className="py-2.5 px-3">Scenario Prompt</th>
                                        <th className="py-2.5 px-3 text-center">Responses</th>
                                        <th className="py-2.5 px-3 text-center">Correct</th>
                                        <th className="py-2.5 px-3 text-right">Error Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {hardest_questions.map((hq) => (
                                        <tr key={hq.question_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-3 font-bold text-indigo-400 max-w-[180px] truncate">
                                                {hq.quiz_title}
                                            </td>
                                            <td className="py-3 px-3 text-slate-800 dark:text-slate-200 max-w-md">
                                                {hq.prompt}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">
                                                {hq.total_responses}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-emerald-400">
                                                {hq.correct_responses} ({hq.accuracy_rate}%)
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                                    hq.error_rate >= 60
                                                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                }`}>
                                                    {hq.error_rate}% Error
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Cohort Performance Matrix */}
                {cohort_breakdown.length > 0 && (
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                    Cohort Performance Matrix
                                </h3>
                                <p className="text-xs text-slate-400">Comparative assessment metrics across enrolled military classes</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-2.5 px-3">Cohort Designation</th>
                                        <th className="py-2.5 px-3">Code</th>
                                        <th className="py-2.5 px-3 text-center">Enrolled Cadets</th>
                                        <th className="py-2.5 px-3 text-center">Total Attempts</th>
                                        <th className="py-2.5 px-3 text-center">Pass Rate</th>
                                        <th className="py-2.5 px-3 text-right">Mean Score</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {cohort_breakdown.map((c) => (
                                        <tr key={c.cohort_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                                                {c.name}
                                            </td>
                                            <td className="py-3 px-3 font-mono text-indigo-400 font-bold">
                                                {c.code}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-300">
                                                {c.enrolled_count}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-slate-600 dark:text-slate-300">
                                                {c.attempts_count}
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                                                    c.pass_rate >= 70
                                                        ? 'bg-emerald-500/10 text-emerald-400'
                                                        : 'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                    {c.pass_rate}%
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-right font-black text-slate-900 dark:text-white">
                                                {c.average_score}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Trainee Examination Registry */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <CheckSquare className="w-5 h-5 text-indigo-400" />
                                Trainee Assessment Registry & Submissions
                            </h3>
                            <p className="text-xs text-slate-400">Complete log of recent candidate test submissions</p>
                        </div>

                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={tableSearch}
                                onChange={(e) => setTableSearch(e.target.value)}
                                placeholder="Search by cadet name, email, or exam..."
                                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            />
                        </div>
                    </div>

                    {filteredResults.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                            No trainee submissions recorded matching search criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                        <th className="py-2.5 px-3">Candidate</th>
                                        <th className="py-2.5 px-3">Examination</th>
                                        <th className="py-2.5 px-3">Cohort</th>
                                        <th className="py-2.5 px-3 text-center">Attempt</th>
                                        <th className="py-2.5 px-3 text-center">Score</th>
                                        <th className="py-2.5 px-3 text-center">Qualification</th>
                                        <th className="py-2.5 px-3 text-right">Submitted</th>
                                        <th className="py-2.5 px-3 text-right">Dossier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredResults.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                            <td className="py-3 px-3">
                                                <div className="font-bold text-slate-900 dark:text-white">{r.candidate_name}</div>
                                                <div className="text-[10px] text-slate-400">{r.candidate_email}</div>
                                            </td>
                                            <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                                                {r.quiz_title}
                                            </td>
                                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400">
                                                {r.cohort_name}
                                            </td>
                                            <td className="py-3 px-3 text-center font-bold text-slate-500 dark:text-slate-400">
                                                #{r.attempt_number}
                                            </td>
                                            <td className="py-3 px-3 text-center font-black text-slate-900 dark:text-white">
                                                {r.score_percentage}%
                                            </td>
                                            <td className="py-3 px-3 text-center">
                                                {r.is_passed ? (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        QUALIFIED
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        FAILED
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                                                {r.submitted_at}
                                            </td>
                                            <td className="py-3 px-3 text-right">
                                                <Link
                                                    href={route('exams.result', [r.quiz_id, r.id])}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline"
                                                >
                                                    View <ArrowUpRight className="w-3 h-3" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

