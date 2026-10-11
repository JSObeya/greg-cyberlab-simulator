import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronRight, Layers, Users, Clock, Award } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface CoursesIndexProps {
    courses: any[];
}

export default function CoursesIndex({ courses }: CoursesIndexProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cybersecurity Training Programmes & Courses</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Official curriculum at Greg & Co. ICT Academy — Makurdi</p>
                    </div>
                </div>
            }
        >
            <Head title="Courses & Programmes - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {courses.map((course) => {
                        const totalModules = course.modules?.length || 0;
                        const totalLabs = course.modules?.reduce(
                            (acc: number, mod: any) =>
                                acc + (mod.lessons?.reduce((lAcc: number, l: any) => lAcc + (l.laboratories?.length || 0), 0) || 0),
                            0
                        ) || 0;

                        return (
                            <div
                                key={course.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                                            {course.level}
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {course.cohorts?.length || 0} Cohorts Active
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-snug">
                                        {course.title}
                                    </h3>

                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                        {course.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            <span><strong>{totalModules}</strong> Modules</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span><strong>{totalLabs}</strong> Simulated Labs</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 flex justify-end">
                                    <Link
                                        href={route('courses.show', course.slug)}
                                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                                    >
                                        Explore Syllabus & Labs <ChevronRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
