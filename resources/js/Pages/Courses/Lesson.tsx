import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Terminal,
    Shield,
    CheckCircle2,
    Lightbulb,
    FileText,
    HelpCircle,
    Flame,
    ArrowRight,
    Layers,
    Clock
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface LessonProps {
    lesson: any;
    module: any;
    course: any;
}

export default function LessonView({ lesson, module, course }: LessonProps) {
    const primaryLab = lesson.laboratories?.[0];

    // Split theory notes into structured paragraphs or bullet points
    const rawTheoryNotes: string = lesson.content || primaryLab?.theory_notes || '';
    const theoryParagraphs = rawTheoryNotes
        ? rawTheoryNotes.split('\n\n').filter((p: string) => p.trim().length > 0)
        : [];

    // Parse vocabulary items (can be array of {term, definition} or string array)
    const rawVocabulary = primaryLab?.vocabulary || [];
    const formattedVocabulary = Array.isArray(rawVocabulary)
        ? rawVocabulary.map((item: any) => {
              if (typeof item === 'string') {
                  return { term: item, definition: 'Foundational operational security concept.' };
              }
              return item;
          })
        : [];

    // Parse learning objectives
    const rawObjectives: string = primaryLab?.learning_objectives || '';
    const objectivesList = rawObjectives
        ? rawObjectives.split('\n').map((o: string) => o.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
        : [];

    // Parse instructions
    const rawInstructions: string = primaryLab?.instructions || '';
    const instructionsList = rawInstructions
        ? rawInstructions.split('\n').filter((i: string) => i.trim().length > 0)
        : [];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Link
                            href={route('courses.show', course.slug)}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold mb-1"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Back to {course.title}
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {module.title}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                            {lesson.title}
                        </h2>
                    </div>

                    {primaryLab && (
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('simulation.show', primaryLab.slug)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 transition shrink-0"
                            >
                                <Terminal className="w-4 h-4" /> Launch Interactive Lab
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    )}
                </div>
            }
        >
            <Head title={`${lesson.title} - Comprehensive Lesson Notes`} />

            <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Executive Summary Card */}
                <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/50 border border-blue-800/40 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-lg space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                                Greg and Co. ICT Academy — Curriculum Notes
                            </span>
                            <h1 className="text-lg sm:text-xl font-black text-white">
                                {lesson.title}
                            </h1>
                        </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">
                        {primaryLab?.scenario_background || (
                            <>
                                Welcome to this comprehensive study module. Cybersecurity professionals must build depth across theoretical doctrine, operational playbooks, and evidence artifacts before engaging active network environments. Review the complete curriculum notes below before launching the practical virtual laboratory simulation.
                            </>
                        )}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span>Estimated Duration: <strong>{primaryLab?.estimated_minutes || 45} mins</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Track Difficulty: <strong className="capitalize">{primaryLab?.difficulty || 'Beginner to Intermediate'}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
                            <Shield className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Passing Standard: <strong>{primaryLab?.passing_score || 70}%</strong></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Column (2 Cols) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Core Learning Objectives */}
                        {objectivesList.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Core Learning Objectives
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {objectivesList.map((obj: string, oIdx: number) => (
                                        <div
                                            key={oIdx}
                                            className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80"
                                        >
                                            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                                {oIdx + 1}
                                            </span>
                                            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                                {obj}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 2. Comprehensive Theory & Curriculum Notes */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs space-y-6">
                            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <BookOpen className="w-5 h-5 text-blue-500" />
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Theoretical Foundations & Operational Doctrine
                                </h3>
                            </div>

                            {theoryParagraphs.length > 0 ? (
                                <div className="space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {theoryParagraphs.map((para: string, pIdx: number) => {
                                        // Detect if this paragraph starts with bullet points or sub-sections
                                        const isBulletGroup = para.includes('•') || para.includes('\n•');

                                        if (isBulletGroup) {
                                            const bullets = para.split('\n').filter(Boolean);
                                            return (
                                                <div
                                                    key={pIdx}
                                                    className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 space-y-3"
                                                >
                                                    {bullets.map((bItem: string, bIdx: number) => {
                                                        const cleanItem = bItem.replace(/^[•\-\*]\s*/, '').trim();
                                                        const parts = cleanItem.split(':');
                                                        const hasHeader = parts.length > 1;

                                                        return (
                                                            <div key={bIdx} className="flex items-start gap-2.5">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                                                                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                    {hasHeader ? (
                                                                        <>
                                                                            <strong className="text-slate-900 dark:text-white font-bold">
                                                                                {parts[0]}:
                                                                            </strong>{' '}
                                                                            {parts.slice(1).join(':')}
                                                                        </>
                                                                    ) : (
                                                                        cleanItem
                                                                    )}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        }

                                        return (
                                            <p
                                                key={pIdx}
                                                className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 leading-relaxed"
                                            >
                                                {para}
                                            </p>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-900 dark:text-blue-300 text-xs">
                                    Fundamental operational security theory. Read through the scenario and vocabulary below before starting the practical assessment.
                                </div>
                            )}

                            {/* Safety & Authorisation Guardrail Callout */}
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
                                    <Shield className="w-4 h-4" />
                                    Authorisation & Safe Engagement Notice
                                </div>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                    All techniques explored in this lesson must strictly occur within the Greg Cyberlab simulation engine. Never copy tool syntax, commands, or exploit payloads to test external networks without explicit, documented authorisation.
                                </p>
                            </div>
                        </div>

                        {/* 3. Step-by-Step Simulation Instructions */}
                        {instructionsList.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-4">
                                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <FileText className="w-5 h-5 text-indigo-500" />
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                        Laboratory Execution Instructions
                                    </h3>
                                </div>

                                <div className="space-y-3">
                                    {instructionsList.map((inst: string, iIdx: number) => (
                                        <div
                                            key={iIdx}
                                            className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-3"
                                        >
                                            <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                                                {iIdx + 1}
                                            </span>
                                            <span>{inst.replace(/^\d+\.\s*/, '')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Column (1 Col) */}
                    <div className="space-y-6">
                        {/* Interactive Laboratory Launch Banner */}
                        {primaryLab && (
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full">
                                        Practical Arena
                                    </span>
                                    <span className="text-xs text-blue-100 font-medium">
                                        {primaryLab.estimated_minutes} Mins
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-base font-black text-white">
                                        {primaryLab.title}
                                    </h4>
                                    <p className="text-xs text-blue-100 mt-1 leading-relaxed">
                                        Launch the dedicated in-browser interactive workbench to complete hands-on tasks and 100-point rubric assessment.
                                    </p>
                                </div>

                                <Link
                                    href={route('simulation.show', primaryLab.slug)}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-white text-blue-700 hover:bg-blue-50 font-black text-xs rounded-xl shadow-md transition"
                                >
                                    <Terminal className="w-4 h-4" /> Launch Practical Lab
                                </Link>
                            </div>
                        )}

                        {/* Domain Vocabulary Glossary */}
                        {formattedVocabulary.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Key Operational Vocabulary
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    {formattedVocabulary.map((vocab: any, vIdx: number) => (
                                        <div
                                            key={vIdx}
                                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-1"
                                        >
                                            <span className="text-xs font-black text-blue-600 dark:text-blue-400 block">
                                                {vocab.term}
                                            </span>
                                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                                                {vocab.definition}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Laboratories In This Lesson */}
                        {lesson.laboratories?.length > 0 && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                                    <Terminal className="w-4 h-4 text-blue-500" />
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                        Associated Laboratories
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    {lesson.laboratories.map((lab: any) => (
                                        <div
                                            key={lab.id}
                                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-2 hover:border-blue-400 dark:hover:border-blue-500 transition"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                                                    {lab.category}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {lab.estimated_minutes} mins
                                                </span>
                                            </div>
                                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                                                {lab.title}
                                            </h5>
                                            <Link
                                                href={route('simulation.show', lab.slug)}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                                            >
                                                Open Lab Simulation <ChevronRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
