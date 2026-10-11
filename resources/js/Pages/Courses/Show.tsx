import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, ChevronLeft, Terminal, Shield, CheckCircle } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CourseShowProps {
    course: any;
}

export default function CourseShow({ course }: CourseShowProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href={route('courses.index')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold">
                                <ChevronLeft className="w-3.5 h-3.5" /> All Courses
                            </Link>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{course.title}</h2>
                    </div>
                </div>
            }
        >
            <Head title={`${course.title} - Syllabus`} />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                {/* Course Header Banner */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs space-y-4">
                    <span className="px-2.5 py-1 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase">
                        Curriculum Track: {course.level}
                    </span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl">
                        {course.description}
                    </p>
                </div>

                {/* Modules & Lessons Hierarchy */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Curriculum Modules & Laboratory Roadmaps</h3>

                    {course.modules?.map((mod: any, mIdx: number) => (
                        <div key={mod.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                            <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                                        {mIdx + 1}
                                    </span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{mod.title}</h4>
                                </div>
                                <span className="text-xs text-slate-400 font-medium">{mod.lessons?.length || 0} Lessons</span>
                            </div>

                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {mod.lessons?.map((lesson: any) => (
                                    <div key={lesson.id} className="p-6 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{lesson.title}</h5>
                                            </div>
                                            <Link
                                                href={route('lessons.show', lesson.slug)}
                                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Read Lesson Notes →
                                            </Link>
                                        </div>

                                        {/* Nested Laboratories */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                                            {lesson.laboratories?.map((lab: any) => (
                                                <div
                                                    key={lab.id}
                                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between hover:bg-white dark:hover:bg-slate-800/60 transition"
                                                >
                                                    <div>
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                                                            {lab.category}
                                                        </span>
                                                        <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">{lab.title}</p>
                                                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Duration: {lab.estimated_minutes} mins</span>
                                                    </div>
                                                    <Link
                                                        href={route('simulation.show', lab.slug)}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs shrink-0 ml-4"
                                                    >
                                                        Launch
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
