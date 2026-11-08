import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    CheckSquare,
    Users,
    BarChart3,
    Plus,
    UploadCloud,
    Download,
    FileSpreadsheet,
    Clock,
    Award,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Trash2,
    Pencil,
    Eye,
    Play,
    RotateCcw,
    Layers,
    BookOpen,
    HelpCircle,
    FileText,
    Search,
    Filter,
    X,
    ChevronRight,
    Sparkles,
    Shield
} from 'lucide-react';

interface QuizItem {
    id: number;
    title: string;
    slug: string;
    description?: string;
    category: string;
    time_limit_minutes: number;
    passing_score_percentage: number;
    max_attempts: number;
    is_published: boolean;
    randomize_questions: boolean;
    randomize_options: boolean;
    show_correct_answers_after: boolean;
    questions_count: number;
    attempts_count: number;
    cohort?: { id: number; name: string; code: string } | null;
    programme?: { id: number; title: string; code: string } | null;
    course?: { id: number; title: string; code: string } | null;
    created_at: string;
    user_progress: {
        attempts_used: number;
        can_attempt: boolean;
        in_progress_attempt_id?: number | null;
        has_passed: boolean;
        best_score?: number | null;
        latest_attempt_id?: number | null;
    };
}

interface CohortOption {
    id: number;
    name: string;
    code: string;
}

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
}

interface CourseOption {
    id: number;
    title: string;
    code: string;
}

interface QuestionItem {
    id: number;
    prompt: string;
    points: number;
    explanation?: string;
    order: number;
    options: Array<{
        id: string;
        text: string;
        is_correct: boolean;
    }>;
}

interface Props {
    exams: QuizItem[];
    cohorts: CohortOption[];
    programmes: ProgrammeOption[];
    courses: CourseOption[];
    stats: {
        total_exams: number;
        published_exams: number;
        total_questions: number;
        total_attempts: number;
        average_pass_rate: number;
    };
    isStaff: boolean;
    filters: {
        cohort_id?: string;
        programme_id?: string;
        category?: string;
    };
}

export default function ExamIndex({
    exams,
    cohorts,
    programmes,
    courses,
    stats,
    isStaff,
    filters,
}: Props) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedCohort, setSelectedCohort] = useState(filters.cohort_id || 'all');

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [editingExam, setEditingExam] = useState<QuizItem | null>(null);

    // Questions Management Modal
    const [questionModalExam, setQuestionModalExam] = useState<QuizItem | null>(null);
    const [examQuestions, setExamQuestions] = useState<QuestionItem[]>([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [isAddQuestionFormOpen, setIsAddQuestionFormOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);

    // Create / Edit Exam Form
    const examForm = useForm({
        title: '',
        description: '',
        instructions: '',
        category: 'cybersecurity',
        cohort_id: '',
        programme_id: '',
        course_id: '',
        time_limit_minutes: 30,
        passing_score_percentage: 70,
        max_attempts: 3,
        randomize_questions: true,
        randomize_options: true,
        show_correct_answers_after: true,
        is_published: true,
    });

    // Create from CSV Form
    const csvExamForm = useForm({
        title: '',
        description: '',
        category: 'cybersecurity',
        cohort_id: '',
        programme_id: '',
        time_limit_minutes: 30,
        passing_score_percentage: 70,
        max_attempts: 3,
        is_published: true,
        csv_file: null as File | null,
    });

    // Single Question Form
    const [questionPrompt, setQuestionPrompt] = useState('');
    const [questionPoints, setQuestionPoints] = useState(5);
    const [questionExplanation, setQuestionExplanation] = useState('');
    const [optA, setOptA] = useState('');
    const [optB, setOptB] = useState('');
    const [optC, setOptC] = useState('');
    const [optD, setOptD] = useState('');
    const [correctOpt, setCorrectOpt] = useState('a');
    const [questionSaving, setQuestionSaving] = useState(false);

    // Import CSV to existing exam form
    const importToExamForm = useForm({
        csv_file: null as File | null,
    });

    // Filtered Exams
    const filteredExams = exams.filter((exam) => {
        const matchesSearch =
            exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exam.description && exam.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (exam.cohort && exam.cohort.name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = selectedCategory === 'all' || exam.category === selectedCategory;
        const matchesCohort = selectedCohort === 'all' || String(exam.cohort?.id) === selectedCohort;
        return matchesSearch && matchesCategory && matchesCohort;
    });

    const openCreateModal = () => {
        examForm.reset();
        examForm.setData({
            title: '',
            description: '',
            instructions: 'Read each scenario carefully. Select the most accurate operational response.',
            category: 'cybersecurity',
            cohort_id: cohorts[0]?.id ? String(cohorts[0].id) : '',
            programme_id: programmes[0]?.id ? String(programmes[0].id) : '',
            course_id: '',
            time_limit_minutes: 30,
            passing_score_percentage: 70,
            max_attempts: 3,
            randomize_questions: true,
            randomize_options: true,
            show_correct_answers_after: true,
            is_published: true,
        });
        setEditingExam(null);
        setIsCreateModalOpen(true);
    };

    const openEditModal = (exam: QuizItem) => {
        setEditingExam(exam);
        examForm.setData({
            title: exam.title,
            description: exam.description || '',
            instructions: '',
            category: exam.category,
            cohort_id: exam.cohort ? String(exam.cohort.id) : '',
            programme_id: exam.programme ? String(exam.programme.id) : '',
            course_id: exam.course ? String(exam.course.id) : '',
            time_limit_minutes: exam.time_limit_minutes,
            passing_score_percentage: exam.passing_score_percentage,
            max_attempts: exam.max_attempts,
            randomize_questions: exam.randomize_questions,
            randomize_options: exam.randomize_options,
            show_correct_answers_after: exam.show_correct_answers_after,
            is_published: exam.is_published,
        });
        setIsCreateModalOpen(true);
    };

    const handleExamFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingExam) {
            examForm.put(route('exams.update', editingExam.id), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setEditingExam(null);
                },
            });
        } else {
            examForm.post(route('exams.store'), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                },
            });
        }
    };

    const handleDeleteExam = (exam: QuizItem) => {
        if (confirm(`Are you sure you want to delete examination "${exam.title}"? All associated questions will be removed.`)) {
            router.delete(route('exams.destroy', exam.id));
        }
    };

    const handleCsvExamSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        csvExamForm.post(route('exams.create-from-csv'), {
            onSuccess: () => {
                setIsCsvModalOpen(false);
                csvExamForm.reset();
            },
        });
    };

    // Open Questions Modal
    const openQuestionsModal = async (exam: QuizItem) => {
        setQuestionModalExam(exam);
        setIsLoadingQuestions(true);
        setIsAddQuestionFormOpen(false);
        setEditingQuestion(null);
        try {
            const res = await fetch(route('exams.questions', exam.id));
            const data = await res.json();
            setExamQuestions(data.questions || []);
        } catch (err) {
            console.error('Failed to load questions', err);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleSaveQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionModalExam) return;

        setQuestionSaving(true);
        const optionsPayload = [
            { id: 'a', text: optA, is_correct: correctOpt === 'a' },
            { id: 'b', text: optB, is_correct: correctOpt === 'b' },
            ...(optC.trim() ? [{ id: 'c', text: optC, is_correct: correctOpt === 'c' }] : []),
            ...(optD.trim() ? [{ id: 'd', text: optD, is_correct: correctOpt === 'd' }] : []),
        ];

        try {
            const url = editingQuestion
                ? route('exams.questions.update', [questionModalExam.id, editingQuestion.id])
                : route('exams.questions.store', questionModalExam.id);
            const method = editingQuestion ? 'PUT' : 'POST';

            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
                body: JSON.stringify({
                    prompt: questionPrompt,
                    points: questionPoints,
                    explanation: questionExplanation,
                    options: optionsPayload,
                }),
            });

            if (res.ok) {
                // Refresh questions list
                const refreshRes = await fetch(route('exams.questions', questionModalExam.id));
                const data = await refreshRes.json();
                setExamQuestions(data.questions || []);
                setIsAddQuestionFormOpen(false);
                setEditingQuestion(null);
                setQuestionPrompt('');
                setQuestionExplanation('');
                setOptA('');
                setOptB('');
                setOptC('');
                setOptD('');
                setCorrectOpt('a');
            } else {
                const errData = await res.json();
                alert(errData.message || 'Error saving question');
            }
        } catch (err) {
            console.error(err);
            alert('Network error while saving question');
        } finally {
            setQuestionSaving(false);
        }
    };

    const handleEditQuestionClick = (q: QuestionItem) => {
        setEditingQuestion(q);
        setQuestionPrompt(q.prompt);
        setQuestionPoints(q.points);
        setQuestionExplanation(q.explanation || '');
        const optAMap = q.options.find((o) => o.id === 'a')?.text || '';
        const optBMap = q.options.find((o) => o.id === 'b')?.text || '';
        const optCMap = q.options.find((o) => o.id === 'c')?.text || '';
        const optDMap = q.options.find((o) => o.id === 'd')?.text || '';
        setOptA(optAMap);
        setOptB(optBMap);
        setOptC(optCMap);
        setOptD(optDMap);
        const correct = q.options.find((o) => o.is_correct)?.id || 'a';
        setCorrectOpt(correct);
        setIsAddQuestionFormOpen(true);
    };

    const handleDeleteQuestion = async (q: QuestionItem) => {
        if (!questionModalExam || !confirm('Delete this question from examination?')) return;
        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            const res = await fetch(route('exams.questions.destroy', [questionModalExam.id, q.id]), {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            if (res.ok) {
                setExamQuestions((prev) => prev.filter((item) => item.id !== q.id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleImportToExam = (e: React.FormEvent) => {
        e.preventDefault();
        if (!questionModalExam || !importToExamForm.data.csv_file) return;
        importToExamForm.post(route('exams.import-csv', questionModalExam.id), {
            onSuccess: () => {
                importToExamForm.reset();
                openQuestionsModal(questionModalExam);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                <CheckSquare className="w-5 h-5" />
                            </span>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    MCQ Examination & Assessment Engine
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Timed Cyber Doctrine Tests, Interactive Evaluation & Automated Scoring
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {isStaff && (
                            <>
                                <a
                                    href={route('exams.template-csv')}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
                                    title="Download standard CSV template for exam question bulk import"
                                >
                                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>CSV Template</span>
                                </a>

                                <button
                                    onClick={() => setIsCsvModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                                >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Import Exam (CSV)</span>
                                </button>

                                <button
                                    onClick={openCreateModal}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New Exam</span>
                                </button>
                            </>
                        )}

                        <a
                            href={route('exams.export-results')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-xs"
                            title="Export all examination attempts to CSV"
                        >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Export Results</span>
                        </a>

                        <Link
                            href={route('exams.analytics')}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white transition shadow-xs"
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>Result Analytics</span>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="MCQ Examinations & Assessments - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Cohorts & Assessments Submenu Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    {isStaff && (
                        <Link
                            href={route('cohorts.index')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                        >
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Cohorts Directory</span>
                        </Link>
                    )}
                    <button
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs"
                    >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>MCQ Examinations</span>
                    </button>
                    {isStaff && (
                        <Link
                            href={route('exams.analytics')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition"
                        >
                            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Result Analytics</span>
                        </Link>
                    )}
                </div>

                {/* Key Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Exams</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_exams}</div>
                            <div className="text-[10px] text-emerald-400 font-medium">{stats.published_exams} Published</div>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Questions in Bank</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_questions}</div>
                            <div className="text-[10px] text-slate-400 font-medium">MCQ Scenarios</div>
                        </div>
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400">
                            <HelpCircle className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exams Taken</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total_attempts}</div>
                            <div className="text-[10px] text-indigo-400 font-medium">Trainee Submissions</div>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Pass Rate</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.average_pass_rate}%</div>
                            <div className="text-[10px] text-amber-400 font-medium">Cohort Qualification</div>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400">
                            <Award className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search examinations, doctrines, or cohorts..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                            <Filter className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-bold text-slate-400">Cohort:</span>
                            <select
                                value={selectedCohort}
                                onChange={(e) => setSelectedCohort(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Cohorts</option>
                                {cohorts.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-400">Category:</span>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="all">All Categories</option>
                                <option value="cybersecurity">Cybersecurity</option>
                                <option value="naval_ops">Naval Operations</option>
                                <option value="military_intelligence">Military Intelligence</option>
                                <option value="opsec">Operational Security (OPSEC)</option>
                                <option value="access_control">Access Control & CIA</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Examinations Grid */}
                {filteredExams.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                            <CheckSquare className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Examinations Found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                            {isStaff
                                ? "Establish your first timed MCQ exam or import questions in bulk from CSV to test cadets."
                                : "There are currently no active examinations assigned to your training cohort. Check back during scheduled assessment periods."}
                        </p>
                        {isStaff && (
                            <div className="mt-4 flex items-center justify-center gap-2">
                                <button
                                    onClick={openCreateModal}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                                >
                                    Create First Exam
                                </button>
                                <button
                                    onClick={() => setIsCsvModalOpen(true)}
                                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
                                >
                                    Import from CSV
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredExams.map((exam) => {
                            const prog = exam.user_progress;
                            return (
                                <div
                                    key={exam.id}
                                    className="flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-200 shadow-xs hover:shadow-lg p-5 group"
                                >
                                    <div>
                                        {/* Top Badges */}
                                        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                    {exam.category.replace('_', ' ')}
                                                </span>
                                                {exam.cohort && (
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                        {exam.cohort.code}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {!exam.is_published && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400">
                                                        Draft
                                                    </span>
                                                )}
                                                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {exam.time_limit_minutes > 0 ? `${exam.time_limit_minutes}m` : 'Untimed'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Title & Description */}
                                        <div className="mt-3">
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-400 transition">
                                                {exam.title}
                                            </h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                {exam.description || 'Comprehensive multiple choice assessment testing operational readiness and doctrine application.'}
                                            </p>
                                        </div>

                                        {/* Metrics Pill Grid */}
                                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Questions</div>
                                                <div className="text-sm font-black text-slate-800 dark:text-slate-200 mt-0.5">{exam.questions_count}</div>
                                            </div>
                                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Pass Mark</div>
                                                <div className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-0.5">{exam.passing_score_percentage}%</div>
                                            </div>
                                            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                                                <div className="text-[10px] font-bold text-slate-400 uppercase">Attempts</div>
                                                <div className="text-sm font-black text-indigo-400 mt-0.5">
                                                    {prog.attempts_used} / {exam.max_attempts > 0 ? exam.max_attempts : '∞'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Trainee Progress Feedback Banner */}
                                        <div className="mt-3">
                                            {prog.in_progress_attempt_id ? (
                                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5 animate-spin" /> Attempt In Progress
                                                    </span>
                                                    <Link
                                                        href={route('exams.take', exam.id)}
                                                        className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[10px] uppercase transition"
                                                    >
                                                        Resume Test
                                                    </Link>
                                                </div>
                                            ) : prog.best_score !== undefined && prog.best_score !== null ? (
                                                <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
                                                    prog.has_passed
                                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                }`}>
                                                    <span className="flex items-center gap-1.5">
                                                        {prog.has_passed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                        Best Score: {prog.best_score}% {prog.has_passed ? '(Passed)' : '(Failed)'}
                                                    </span>
                                                    {prog.latest_attempt_id && (
                                                        <Link
                                                            href={route('exams.result', [exam.id, prog.latest_attempt_id])}
                                                            className="text-[11px] underline font-bold"
                                                        >
                                                            Review
                                                        </Link>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
                                                    <AlertCircle className="w-3.5 h-3.5" /> Not yet attempted
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Footers */}
                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                        {/* Primary Take Exam button for Trainees & Staff */}
                                        {prog.in_progress_attempt_id ? (
                                            <Link
                                                href={route('exams.take', exam.id)}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wide transition shadow-xs"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Resume Examination
                                            </Link>
                                        ) : prog.can_attempt && exam.questions_count > 0 ? (
                                            <Link
                                                href={route('exams.take', exam.id)}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                                            >
                                                <Play className="w-3.5 h-3.5" />
                                                {prog.attempts_used > 0 ? 'Retake Examination' : 'Start Examination'}
                                            </Link>
                                        ) : exam.questions_count === 0 ? (
                                            <button
                                                disabled
                                                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed"
                                            >
                                                No Questions Added Yet
                                            </button>
                                        ) : (
                                            <button
                                                disabled
                                                className="w-full px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold text-xs cursor-not-allowed"
                                            >
                                                Max Attempts Exhausted
                                            </button>
                                        )}

                                        {/* Staff Administrative Bar */}
                                        {isStaff && (
                                            <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                                                <button
                                                    onClick={() => openQuestionsModal(exam)}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[11px] transition"
                                                    title="Manage Questions & CSV Upload"
                                                >
                                                    <HelpCircle className="w-3 h-3" /> Questions ({exam.questions_count})
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    <a
                                                        href={route('exams.export-results', { quiz_id: exam.id })}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                        title="Export this exam's results to CSV"
                                                    >
                                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => openEditModal(exam)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                        title="Edit Exam Parameters"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteExam(exam)}
                                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                                        title="Delete Exam"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal: Create or Edit Examination */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <CheckSquare className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        {editingExam ? 'Edit MCQ Examination' : 'Establish New MCQ Examination'}
                                    </h3>
                                    <p className="text-xs text-slate-400">Configure parameters, passing marks, and cohort affiliation</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleExamFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Examination Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={examForm.data.title}
                                    onChange={(e) => examForm.setData('title', e.target.value)}
                                    placeholder="e.g. Naval Cyber Doctrine & CIA Triad Qualification Exam"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Target Cohort
                                    </label>
                                    <select
                                        value={examForm.data.cohort_id}
                                        onChange={(e) => examForm.setData('cohort_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Cohorts (Global Access)</option>
                                        {cohorts.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Academic Programme
                                    </label>
                                    <select
                                        value={examForm.data.programme_id}
                                        onChange={(e) => examForm.setData('programme_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">General (All Programmes)</option>
                                        {programmes.map((p) => (
                                            <option key={p.id} value={p.id}>{p.title} ({p.code})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Time Limit (Minutes)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="300"
                                        required
                                        value={examForm.data.time_limit_minutes}
                                        onChange={(e) => examForm.setData('time_limit_minutes', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-[10px] text-slate-400">Set 0 for untimed examination</span>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Passing Mark (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        required
                                        value={examForm.data.passing_score_percentage}
                                        onChange={(e) => examForm.setData('passing_score_percentage', parseInt(e.target.value) || 70)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Max Allowed Attempts
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        required
                                        value={examForm.data.max_attempts}
                                        onChange={(e) => examForm.setData('max_attempts', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="text-[10px] text-slate-400">0 = unlimited retakes</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Description & Instructions
                                </label>
                                <textarea
                                    rows={3}
                                    value={examForm.data.description}
                                    onChange={(e) => examForm.setData('description', e.target.value)}
                                    placeholder="Enter instructions, security guidelines, and test rules for trainees..."
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={examForm.data.randomize_questions}
                                        onChange={(e) => examForm.setData('randomize_questions', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Randomize Question Order</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={examForm.data.randomize_options}
                                        onChange={(e) => examForm.setData('randomize_options', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Randomize Option Choices</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={examForm.data.show_correct_answers_after}
                                        onChange={(e) => examForm.setData('show_correct_answers_after', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Show Explanations After Submission</span>
                                </label>

                                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={examForm.data.is_published}
                                        onChange={(e) => examForm.setData('is_published', e.target.checked)}
                                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <span>Publish Immediately</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={examForm.processing}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                                >
                                    {editingExam ? 'Save Changes' : 'Establish Examination'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Bulk Create Exam from CSV */}
            {isCsvModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
                    <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <UploadCloud className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Import Entire Exam from CSV
                                    </h3>
                                    <p className="text-xs text-slate-400">Upload multiple choice scenarios and establish exam in 1 click</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCsvModalOpen(false)}
                                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleCsvExamSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                    Examination Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={csvExamForm.data.title}
                                    onChange={(e) => csvExamForm.setData('title', e.target.value)}
                                    placeholder="e.g. Naval Provost Module 3 Identity & Access Security Exam"
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Target Cohort
                                    </label>
                                    <select
                                        value={csvExamForm.data.cohort_id}
                                        onChange={(e) => csvExamForm.setData('cohort_id', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">All Cohorts (Global)</option>
                                        {cohorts.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={csvExamForm.data.category}
                                        onChange={(e) => csvExamForm.setData('category', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="cybersecurity">Cybersecurity</option>
                                        <option value="naval_ops">Naval Operations</option>
                                        <option value="military_intelligence">Military Intelligence</option>
                                        <option value="opsec">Operational Security (OPSEC)</option>
                                        <option value="access_control">Access Control & CIA</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Time Limit (m)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={csvExamForm.data.time_limit_minutes}
                                        onChange={(e) => csvExamForm.setData('time_limit_minutes', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Pass Mark (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        required
                                        value={csvExamForm.data.passing_score_percentage}
                                        onChange={(e) => csvExamForm.setData('passing_score_percentage', parseInt(e.target.value) || 70)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        Max Attempts
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="10"
                                        required
                                        value={csvExamForm.data.max_attempts}
                                        onChange={(e) => csvExamForm.setData('max_attempts', parseInt(e.target.value) || 0)}
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                                    />
                                </div>
                            </div>

                            {/* CSV File Input */}
                            <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center space-y-2">
                                <FileSpreadsheet className="w-8 h-8 text-emerald-400 mx-auto" />
                                <div>
                                    <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                                        <span>Click to Select CSV File</span>
                                        <input
                                            type="file"
                                            accept=".csv,text/csv,text/plain"
                                            required
                                            onChange={(e) => csvExamForm.setData('csv_file', e.target.files ? e.target.files[0] : null)}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        {csvExamForm.data.csv_file ? csvExamForm.data.csv_file.name : 'Expected columns: prompt, option_a, option_b, option_c, option_d, correct_option, points, explanation'}
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <a
                                        href={route('exams.template-csv')}
                                        className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline"
                                    >
                                        <Download className="w-3 h-3" /> Download Sample CSV Template
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCsvModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={csvExamForm.processing || !csvExamForm.data.csv_file}
                                    className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
                                >
                                    Upload & Create Exam
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Question Management & Bulk Questions CSV Import */}
            {questionModalExam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
                    <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 my-8 max-h-[90vh] flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                                    <HelpCircle className="w-5 h-5" />
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Questions: {questionModalExam.title}
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Total Questions: {examQuestions.length} • Category: {questionModalExam.category}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setEditingQuestion(null);
                                        setQuestionPrompt('');
                                        setQuestionExplanation('');
                                        setOptA('');
                                        setOptB('');
                                        setOptC('');
                                        setOptD('');
                                        setCorrectOpt('a');
                                        setIsAddQuestionFormOpen(!isAddQuestionFormOpen);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>{isAddQuestionFormOpen ? 'Close Form' : 'Add Question'}</span>
                                </button>
                                <button
                                    onClick={() => setQuestionModalExam(null)}
                                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Add / Edit Question Form Accordion */}
                        {isAddQuestionFormOpen && (
                            <form onSubmit={handleSaveQuestion} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 shrink-0">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                        <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                                        {editingQuestion ? 'Edit Question' : 'Add New Question'}
                                    </h4>
                                    <span className="text-[11px] text-slate-400">Select radio button for the correct answer</span>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                                        Question Scenario / Prompt *
                                    </label>
                                    <textarea
                                        rows={2}
                                        required
                                        value={questionPrompt}
                                        onChange={(e) => setQuestionPrompt(e.target.value)}
                                        placeholder="Enter the question scenario..."
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Option A */}
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="radio"
                                            name="correct_choice"
                                            id="opt_a_radio"
                                            checked={correctOpt === 'a'}
                                            onChange={() => setCorrectOpt('a')}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="opt_a_radio" className="text-xs font-bold text-slate-400 uppercase">A:</label>
                                        <input
                                            type="text"
                                            required
                                            value={optA}
                                            onChange={(e) => setOptA(e.target.value)}
                                            placeholder="Option A text..."
                                            className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none p-0"
                                        />
                                    </div>

                                    {/* Option B */}
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="radio"
                                            name="correct_choice"
                                            id="opt_b_radio"
                                            checked={correctOpt === 'b'}
                                            onChange={() => setCorrectOpt('b')}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="opt_b_radio" className="text-xs font-bold text-slate-400 uppercase">B:</label>
                                        <input
                                            type="text"
                                            required
                                            value={optB}
                                            onChange={(e) => setOptB(e.target.value)}
                                            placeholder="Option B text..."
                                            className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none p-0"
                                        />
                                    </div>

                                    {/* Option C */}
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="radio"
                                            name="correct_choice"
                                            id="opt_c_radio"
                                            checked={correctOpt === 'c'}
                                            onChange={() => setCorrectOpt('c')}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="opt_c_radio" className="text-xs font-bold text-slate-400 uppercase">C:</label>
                                        <input
                                            type="text"
                                            value={optC}
                                            onChange={(e) => setOptC(e.target.value)}
                                            placeholder="Option C text (optional)..."
                                            className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none p-0"
                                        />
                                    </div>

                                    {/* Option D */}
                                    <div className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                        <input
                                            type="radio"
                                            name="correct_choice"
                                            id="opt_d_radio"
                                            checked={correctOpt === 'd'}
                                            onChange={() => setCorrectOpt('d')}
                                            className="text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="opt_d_radio" className="text-xs font-bold text-slate-400 uppercase">D:</label>
                                        <input
                                            type="text"
                                            value={optD}
                                            onChange={(e) => setOptD(e.target.value)}
                                            placeholder="Option D text (optional)..."
                                            className="w-full bg-transparent border-none text-xs text-slate-800 dark:text-slate-100 focus:outline-none p-0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                    <div className="md:col-span-3">
                                        <input
                                            type="text"
                                            value={questionExplanation}
                                            onChange={(e) => setQuestionExplanation(e.target.value)}
                                            placeholder="Operational rationale / explanation (revealed to trainees after test)..."
                                            className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase">Points:</span>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                value={questionPoints}
                                                onChange={(e) => setQuestionPoints(parseInt(e.target.value) || 5)}
                                                className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddQuestionFormOpen(false)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={questionSaving}
                                        className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                                    >
                                        {questionSaving ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Questions List */}
                        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                            {isLoadingQuestions ? (
                                <div className="p-8 text-center text-slate-400 text-xs font-bold">
                                    Loading examination questions...
                                </div>
                            ) : examQuestions.length === 0 ? (
                                <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                                    No questions currently added to this exam. Add questions individually above or upload via CSV below.
                                </div>
                            ) : (
                                examQuestions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition space-y-2"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-start gap-2.5">
                                                <span className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 font-black text-xs flex items-center justify-center shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                                                        {q.prompt}
                                                    </p>
                                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                                                        {q.points} Points
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => handleEditQuestionClick(q)}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                                    title="Edit Question"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteQuestion(q)}
                                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                                    title="Delete Question"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Choices */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 pl-8">
                                            {q.options.map((opt) => (
                                                <div
                                                    key={opt.id}
                                                    className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 ${
                                                        opt.is_correct
                                                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold'
                                                            : 'bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300'
                                                    }`}
                                                >
                                                    <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black uppercase shrink-0">
                                                        {opt.id}
                                                    </span>
                                                    <span className="truncate">{opt.text}</span>
                                                    {opt.is_correct && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400 shrink-0" />}
                                                </div>
                                            ))}
                                        </div>

                                        {q.explanation && (
                                            <div className="pl-8 text-[11px] text-slate-400 italic">
                                                <span className="font-bold text-slate-500 dark:text-slate-400 not-italic">Rationale: </span>
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Bulk CSV Import to this specific exam footer */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                            <form onSubmit={handleImportToExam} className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <div>
                                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Bulk Import Questions from CSV</div>
                                        <div className="text-[10px] text-slate-400">Add questions to this existing exam via spreadsheet</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <input
                                        type="file"
                                        accept=".csv,text/csv,text/plain"
                                        onChange={(e) => importToExamForm.setData('csv_file', e.target.files ? e.target.files[0] : null)}
                                        className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-slate-200 dark:file:bg-slate-700 file:text-slate-700 dark:file:text-slate-200 cursor-pointer"
                                    />
                                    <button
                                        type="submit"
                                        disabled={importToExamForm.processing || !importToExamForm.data.csv_file}
                                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 disabled:opacity-50 transition shadow-xs"
                                    >
                                        Import
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
