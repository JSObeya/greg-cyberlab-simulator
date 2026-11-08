import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    Award,
    CheckCircle2,
    XCircle,
    RotateCcw,
    Clock,
    FileSpreadsheet,
    ArrowLeft,
    CheckSquare,
    Shield,
    AlertTriangle,
    Printer,
    FileText,
    HelpCircle,
    User,
    Calendar,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface QuestionReview {
    id: number;
    prompt: string;
    points: number;
    explanation?: string;
    user_selected_option?: string | null;
    correct_option_id?: string | null;
    is_correct: boolean;
    options: Array<{
        id: string;
        text: string;
        is_correct: boolean;
    }>;
}

interface Props {
    quiz: {
        id: number;
        title: string;
        category: string;
        time_limit_minutes: number;
        passing_score_percentage: number;
        max_attempts: number;
        cohort?: { id: number; name: string; code: string } | null;
        programme?: { id: number; title: string; code: string } | null;
    };
    attempt: {
        id: number;
        attempt_number: number;
        status: string;
        total_score: number;
        score_percentage: number;
        is_passed: boolean;
        started_at: string;
        submitted_at: string;
        time_spent_display: string;
    };
    candidate: {
        id: number;
        name: string;
        email: string;
        phone?: string;
    } | null;
    can_retake: boolean;
    can_review_answers: boolean;
    questions_review: QuestionReview[];
    isStaff: boolean;
}

export default function ExamResult({
    quiz,
    attempt,
    candidate,
    can_retake,
    can_review_answers,
    questions_review,
    isStaff,
}: Props) {
    const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct'>('all');

    const correctCount = questions_review.filter((q) => q.is_correct).length;
    const incorrectCount = questions_review.length - correctCount;

    const filteredQuestions = questions_review.filter((q) => {
        if (reviewFilter === 'correct') return q.is_correct;
        if (reviewFilter === 'incorrect') return !q.is_correct;
        return true;
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('exams.index')}
                            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Result Dossier</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Formal Scoring, Qualification Assessment & Doctrine Review</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Dossier</span>
                        </button>

                        {can_retake && (
                            <Link
                                href={route('exams.take', quiz.id)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Retake Exam</span>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Result: ${quiz.title}`} />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Hero Result Dossier Card */}
                <div className={`rounded-3xl border p-8 text-center space-y-6 relative overflow-hidden shadow-2xl transition-all ${
                    attempt.is_passed
                        ? 'bg-gradient-to-b from-emerald-950/40 to-slate-900/90 border-emerald-500/40 text-emerald-400'
                        : 'bg-gradient-to-b from-rose-950/40 to-slate-900/90 border-rose-500/40 text-rose-400'
                }`}>
                    {/* Background tactical pattern */}
                    <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.3))] -z-10"></div>

                    {/* Badge Icon */}
                    <div className={`w-20 h-20 rounded-3xl mx-auto flex items-center justify-center border shadow-xl ${
                        attempt.is_passed
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-emerald-500/20'
                            : 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-rose-500/20'
                    }`}>
                        {attempt.is_passed ? <CheckCircle2 className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                    </div>

                    {/* Qualification Title */}
                    <div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                            attempt.is_passed
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                        }`}>
                            {attempt.is_passed ? 'Operational Standard Met — Qualified' : 'Qualification Threshold Not Reached'}
                        </span>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-3">
                            {attempt.score_percentage}% Score
                        </h1>
                        <p className="text-xs text-slate-400 mt-1">
                            {quiz.title} • Attempt #{attempt.attempt_number}
                        </p>
                    </div>

                    {/* KPI Telemetry Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xs">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Points</div>
                            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{attempt.total_score} Pts</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xs">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass Benchmark</div>
                            <div className="text-lg font-black text-emerald-400 mt-1">{quiz.passing_score_percentage}% Required</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xs">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Elapsed</div>
                            <div className="text-lg font-black text-slate-900 dark:text-white mt-1">{attempt.time_spent_display}</div>
                        </div>

                        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 backdrop-blur-xs">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Candidate</div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                                {candidate?.name || 'Trainee'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Candidate & Cohort Operational Metadata */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Email</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{candidate?.email}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Cohort</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                            {quiz.cohort ? `${quiz.cohort.name} (${quiz.cohort.code})` : 'General Candidate'}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Submission Date</div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{attempt.submitted_at}</div>
                    </div>
                </div>

                {/* Question-by-Question Review Section */}
                {can_review_answers ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                                    Detailed Question Review & Operational Rationale
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Analyze candidate responses against authorized doctrine
                                </p>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                                <button
                                    onClick={() => setReviewFilter('all')}
                                    className={`px-3 py-1.5 rounded-lg transition ${
                                        reviewFilter === 'all'
                                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    All ({questions_review.length})
                                </button>
                                <button
                                    onClick={() => setReviewFilter('incorrect')}
                                    className={`px-3 py-1.5 rounded-lg transition ${
                                        reviewFilter === 'incorrect'
                                            ? 'bg-rose-500/20 text-rose-400 shadow-xs'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Missed ({incorrectCount})
                                </button>
                                <button
                                    onClick={() => setReviewFilter('correct')}
                                    className={`px-3 py-1.5 rounded-lg transition ${
                                        reviewFilter === 'correct'
                                            ? 'bg-emerald-500/20 text-emerald-400 shadow-xs'
                                            : 'text-slate-400 hover:text-slate-200'
                                    }`}
                                >
                                    Correct ({correctCount})
                                </button>
                            </div>
                        </div>

                        {/* Questions Review List */}
                        <div className="space-y-4">
                            {filteredQuestions.map((q, idx) => (
                                <div
                                    key={q.id}
                                    className={`rounded-2xl border p-5 transition space-y-3 bg-white dark:bg-slate-900 ${
                                        q.is_correct
                                            ? 'border-emerald-500/30'
                                            : 'border-rose-500/30'
                                    }`}
                                >
                                    {/* Question Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-2.5">
                                            <span className={`w-7 h-7 rounded-xl font-black text-xs flex items-center justify-center shrink-0 ${
                                                q.is_correct
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                            }`}>
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                                                    {q.prompt}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                    {q.points} Points Available
                                                </span>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {q.is_correct ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1">
                                                    <XCircle className="w-3.5 h-3.5" /> Missed
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Options Comparison */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-9">
                                        {q.options.map((opt) => {
                                            const wasSelected = q.user_selected_option === opt.id;
                                            const isCorrectAnswer = opt.is_correct;

                                            return (
                                                <div
                                                    key={opt.id}
                                                    className={`p-3 rounded-xl text-xs flex items-center gap-2.5 border ${
                                                        isCorrectAnswer
                                                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold'
                                                            : wasSelected && !isCorrectAnswer
                                                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 font-bold line-through'
                                                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black uppercase shrink-0 ${
                                                        isCorrectAnswer
                                                            ? 'bg-emerald-500 text-slate-950'
                                                            : wasSelected
                                                            ? 'bg-rose-500 text-white'
                                                            : 'bg-slate-200 dark:bg-slate-700'
                                                    }`}>
                                                        {opt.id}
                                                    </span>
                                                    <span className="truncate">{opt.text}</span>
                                                    {isCorrectAnswer && (
                                                        <span className="ml-auto text-[10px] uppercase font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                                                            Correct Answer
                                                        </span>
                                                    )}
                                                    {wasSelected && !isCorrectAnswer && (
                                                        <span className="ml-auto text-[10px] uppercase font-black text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded">
                                                            Your Choice
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Operational Rationale Callout */}
                                    {q.explanation && (
                                        <div className="ml-9 p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                                            <div className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider flex items-center gap-1">
                                                <Shield className="w-3.5 h-3.5" /> Operational Rationale & Doctrine:
                                            </div>
                                            <p className="leading-relaxed">{q.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                        Detailed question solutions are restricted for this examination. Please consult your Lead Instructor for briefing.
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
