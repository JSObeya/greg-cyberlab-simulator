import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CheckSquare,
    Clock,
    AlertTriangle,
    Shield,
    ChevronLeft,
    ChevronRight,
    Flag,
    CheckCircle2,
    Send,
    RotateCcw,
    Sparkles,
    HelpCircle,
    Info,
    ArrowLeft,
    Zap
} from 'lucide-react';

interface QuestionOption {
    id: string;
    text: string;
}

interface QuestionItem {
    id: number;
    prompt: string;
    points: number;
    type: string;
    options: QuestionOption[];
}

interface AttemptData {
    id: number;
    attempt_number: number;
    started_at: string;
    expires_at?: string | null;
    seconds_remaining?: number | null;
    answers_state: Record<string, string>;
}

interface Props {
    quiz: {
        id: number;
        title: string;
        description?: string;
        instructions?: string;
        category: string;
        time_limit_minutes: number;
        passing_score_percentage: number;
        total_questions: number;
        total_points: number;
    };
    attempt: AttemptData | null;
    questions: QuestionItem[];
}

export default function ExamTake({ quiz, attempt: initialAttempt, questions }: Props) {
    const [attempt, setAttempt] = useState<AttemptData | null>(initialAttempt);
    const [isStarting, setIsStarting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>(initialAttempt?.answers_state || {});
    const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
    const [secondsLeft, setSecondsLeft] = useState<number | null>(initialAttempt?.seconds_remaining ?? null);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Live Countdown Timer
    useEffect(() => {
        if (secondsLeft === null || secondsLeft <= 0 || !attempt) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    handleAutoSubmitOnExpiry();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [secondsLeft, attempt]);

    // Handle timer expiration
    const handleAutoSubmitOnExpiry = () => {
        if (!attempt || isSubmitting) return;
        setIsSubmitting(true);
        alert('Time has expired! Submitting your examination answers now.');
        router.post(route('exams.submit', attempt.id), {
            answers: answers,
        });
    };

    // Format Seconds into HH:MM:SS
    const formatTime = (totalSeconds: number | null) => {
        if (totalSeconds === null) return 'Untimed';
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Start Exam Attempt
    const handleStartAttempt = async () => {
        setIsStarting(true);
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('exams.start', quiz.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            const data = await res.json();
            if (res.ok && data.attempt) {
                setAttempt(data.attempt);
                setAnswers(data.attempt.answers_state || {});
                setSecondsLeft(data.attempt.seconds_remaining ?? null);
            } else {
                alert(data.message || 'Unable to start examination attempt.');
            }
        } catch (err) {
            console.error(err);
            alert('Network error while starting attempt.');
        } finally {
            setIsStarting(false);
        }
    };

    // Select Answer Option & Trigger Autosave
    const handleSelectOption = (questionId: number, optionId: string) => {
        if (!attempt) return;

        const updatedAnswers = {
            ...answers,
            [questionId]: optionId,
        };
        setAnswers(updatedAnswers);
        setSyncStatus('saving');

        if (autosaveTimeoutRef.current) {
            clearTimeout(autosaveTimeoutRef.current);
        }

        // Debounced Autosave (1.2 seconds)
        autosaveTimeoutRef.current = setTimeout(async () => {
            try {
                const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
                const res = await fetch(route('exams.autosave', attempt.id), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': csrfToken || '',
                    },
                    body: JSON.stringify({ answers: updatedAnswers }),
                });
                if (res.ok) {
                    setSyncStatus('synced');
                } else {
                    setSyncStatus('error');
                }
            } catch (err) {
                console.error(err);
                setSyncStatus('error');
            }
        }, 1200);
    };

    // Toggle Flag Question
    const toggleFlag = (questionId: number) => {
        setFlaggedQuestions((prev) => {
            const next = new Set(prev);
            if (next.has(questionId)) {
                next.delete(questionId);
            } else {
                next.add(questionId);
            }
            return next;
        });
    };

    // Final Submission Handler
    const handleConfirmSubmit = () => {
        if (!attempt || isSubmitting) return;
        setIsSubmitting(true);
        router.post(route('exams.submit', attempt.id), {
            answers: answers,
        });
    };

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(answers).length;
    const progressPercentage = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
    const isUrgent = secondsLeft !== null && secondsLeft < 300;
    const isCritical = secondsLeft !== null && secondsLeft < 60;

    // View 1: Briefing & Instructions (Attempt not yet active)
    if (!attempt) {
        return (
            <AuthenticatedLayout
                header={
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('exams.index')}
                                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Examination Briefing</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Tactical Readiness Protocol & Assessment Directives</p>
                            </div>
                        </div>
                    </div>
                }
            >
                <Head title={`Briefing: ${quiz.title}`} />

                <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-8 space-y-6 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mx-auto shadow-inner">
                            <Shield className="w-8 h-8" />
                        </div>

                        <div>
                            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {quiz.category.replace('_', ' ')}
                            </span>
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
                                {quiz.title}
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-lg mx-auto">
                                {quiz.description || 'Formal military multiple choice assessment testing domain competencies, tactical cybersecurity rules of engagement, and doctrinal knowledge.'}
                            </p>
                        </div>

                        {/* Test Specifications Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-cyan-400" /> Time Limit
                                </div>
                                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                                    {quiz.time_limit_minutes > 0 ? `${quiz.time_limit_minutes} Minutes` : 'Untimed'}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <CheckSquare className="w-3 h-3 text-emerald-400" /> Questions
                                </div>
                                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                                    {quiz.total_questions} Questions
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Shield className="w-3 h-3 text-indigo-400" /> Pass Mark
                                </div>
                                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                                    {quiz.passing_score_percentage}% Score
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-400" /> Points Total
                                </div>
                                <div className="text-base font-black text-slate-900 dark:text-white mt-1">
                                    {quiz.total_points} Points
                                </div>
                            </div>
                        </div>

                        {/* Rules & Integrity Directives */}
                        <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-left space-y-2">
                            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Info className="w-4 h-4" /> Examination Rules & Instructions
                            </h4>
                            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                                <li>Once you click <strong>Initiate Examination</strong>, the operational countdown will begin immediately.</li>
                                <li>All answer selections autosave continuously in real-time to the secure defense cluster.</li>
                                <li>You may navigate forward and backward between questions, or flag uncertain items for review.</li>
                                <li>If the timer runs out, all currently saved responses will be automatically finalized and submitted.</li>
                            </ul>
                        </div>

                        {/* Start Action */}
                        <div className="pt-2">
                            {quiz.total_questions > 0 ? (
                                <button
                                    onClick={handleStartAttempt}
                                    disabled={isStarting}
                                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-wider transition shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
                                >
                                    {isStarting ? 'Initiating Secure Terminal...' : 'Initiate Examination Attempt'}
                                </button>
                            ) : (
                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 text-xs font-bold">
                                    No questions have been configured for this examination yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    // View 2: Active Examination Terminal (Cockpit)
    return (
        <AuthenticatedLayout>
            <Head title={`Taking: ${quiz.title}`} />

            <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-slate-950">
                {/* Sticky Top HUD Bar */}
                <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Title & Progress */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 hidden sm:block">
                                <CheckSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-md">
                                    {quiz.title}
                                </h1>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] font-bold text-slate-400">
                                        Question {currentIndex + 1} of {questions.length}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                    <span className="text-[11px] font-bold text-indigo-400">
                                        {answeredCount} of {questions.length} Answered ({progressPercentage}%)
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Timer & Autosave Status */}
                        <div className="flex items-center gap-4">
                            {/* Autosave Sync Status */}
                            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                                {syncStatus === 'saving' ? (
                                    <span className="text-amber-400 flex items-center gap-1">
                                        <RotateCcw className="w-3 h-3 animate-spin" /> Syncing...
                                    </span>
                                ) : syncStatus === 'error' ? (
                                    <span className="text-rose-400 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Sync Error
                                    </span>
                                ) : (
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Answers Synced
                                    </span>
                                )}
                            </div>

                            {/* Live Countdown Timer */}
                            <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-sm flex items-center gap-2 transition-all ${
                                isCritical
                                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse shadow-lg shadow-rose-500/20'
                                    : isUrgent
                                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white'
                            }`}>
                                <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-400' : isUrgent ? 'text-amber-400' : 'text-indigo-400'}`} />
                                <span>{formatTime(secondsLeft)}</span>
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={() => setIsSubmitModalOpen(true)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wide transition shadow-xs flex items-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>Submit Exam</span>
                            </button>
                        </div>
                    </div>

                    {/* Linear Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Main Exam Content Grid */}
                <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                    {/* Center: Current Question Card */}
                    <div className="lg:col-span-3 space-y-6">
                        {currentQuestion ? (
                            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-6">
                                {/* Question Header */}
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <span className="px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 font-black text-xs">
                                            Scenario {currentIndex + 1}
                                        </span>
                                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-xs">
                                            {currentQuestion.points} Points
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => toggleFlag(currentQuestion.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                            flaggedQuestions.has(currentQuestion.id)
                                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-amber-400' : ''}`} />
                                        <span>{flaggedQuestions.has(currentQuestion.id) ? 'Flagged for Review' : 'Flag for Review'}</span>
                                    </button>
                                </div>

                                {/* Question Prompt */}
                                <div className="py-2">
                                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                                        {currentQuestion.prompt}
                                    </h2>
                                </div>

                                {/* Options Radio Group */}
                                <div className="space-y-3">
                                    {currentQuestion.options.map((option) => {
                                        const isSelected = answers[currentQuestion.id] === option.id;
                                        return (
                                            <div
                                                key={option.id}
                                                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                                                className={`group p-4 rounded-2xl border-2 cursor-pointer transition-all duration-150 flex items-start gap-4 ${
                                                    isSelected
                                                        ? 'bg-indigo-500/10 border-indigo-500 dark:border-indigo-400 shadow-md shadow-indigo-500/10'
                                                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                {/* Option Letter Indicator */}
                                                <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center shrink-0 uppercase transition ${
                                                    isSelected
                                                        ? 'bg-indigo-600 text-white shadow-xs'
                                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 group-hover:bg-slate-200 dark:group-hover:bg-slate-600'
                                                }`}>
                                                    {option.id}
                                                </div>

                                                {/* Text */}
                                                <div className="flex-1 pt-1 text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                                    {option.text}
                                                </div>

                                                {/* Check Circle */}
                                                {isSelected && (
                                                    <div className="text-indigo-400 pt-1 shrink-0">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Navigation Footers */}
                                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        disabled={currentIndex === 0}
                                        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Previous
                                    </button>

                                    {currentIndex < questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                                        >
                                            Next Question <ChevronRight className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsSubmitModalOpen(true)}
                                            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider transition shadow-xs"
                                        >
                                            <Send className="w-4 h-4" /> Complete & Submit
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-xs font-bold">
                                No questions loaded.
                            </div>
                        )}
                    </div>

                    {/* Right: Question Navigation Grid Drawer */}
                    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Question Registry
                            </h3>
                            <span className="text-[11px] text-indigo-400 font-bold">
                                {answeredCount}/{questions.length} done
                            </span>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-400">
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded bg-indigo-600"></span> Answered
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Flagged
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-800"></span> Unanswered
                            </div>
                        </div>

                        {/* Question Grid Buttons */}
                        <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                            {questions.map((q, idx) => {
                                const isAnswered = !!answers[q.id];
                                const isFlagged = flaggedQuestions.has(q.id);
                                const isCurrent = currentIndex === idx;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`relative h-10 rounded-xl font-bold text-xs transition flex items-center justify-center ${
                                            isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900 z-10' : ''
                                        } ${
                                            isFlagged
                                                ? 'bg-amber-500 text-slate-950 font-black'
                                                : isAnswered
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    >
                                        {idx + 1}
                                        {isFlagged && (
                                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-1 ring-white"></span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Direct Submit from Sidebar */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setIsSubmitModalOpen(true)}
                                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
                            >
                                <Send className="w-3.5 h-3.5" /> Finalize Examination
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submission Confirmation Safety Modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                            <Send className="w-7 h-7" />
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                Finalize & Submit Examination?
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                                Your answers will be immediately evaluated and scored against operational criteria.
                            </p>
                        </div>

                        {/* Breakdown */}
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-3 gap-2 text-center">
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Answered</div>
                                <div className="text-base font-black text-emerald-400 mt-0.5">{answeredCount}</div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Unanswered</div>
                                <div className={`text-base font-black mt-0.5 ${questions.length - answeredCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                    {questions.length - answeredCount}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase">Flagged</div>
                                <div className="text-base font-black text-amber-400 mt-0.5">{flaggedQuestions.size}</div>
                            </div>
                        </div>

                        {questions.length - answeredCount > 0 && (
                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 text-left">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>You have {questions.length - answeredCount} unanswered questions that will receive 0 points.</span>
                            </div>
                        )}

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsSubmitModalOpen(false)}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                Return to Test
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={isSubmitting}
                                className="w-1/2 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-wider transition shadow-xs"
                            >
                                {isSubmitting ? 'Evaluating...' : 'Confirm Submit'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
