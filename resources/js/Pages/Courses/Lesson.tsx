import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface LessonProps {
    lesson: any;
    module: any;
    course: any;
}

export default function LessonView({ lesson, module, course }: LessonProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <Link
                            href={route('courses.show', course.slug)}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold mb-1"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Back to {course.title}
                        </Link>
                        <h2 className="text-xl font-bold text-slate-900">{lesson.title}</h2>
                        <p className="text-xs text-slate-500">{module.title}</p>
                    </div>
                </div>
            }
        >
            <Head title={`${lesson.title} - Lesson Content`} />

            <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
                    <div className="prose max-w-none text-xs text-slate-700 leading-relaxed space-y-4">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 font-medium">
                            Welcome to <strong>{lesson.title}</strong>. Study the theoretical foundational concepts before proceeding to the practical simulation environment below.
                        </div>

                        <p>
                            In modern defensive cybersecurity, understanding the theoretical mechanisms behind protocols, vulnerabilities, and forensic traces is essential to achieving consistent incident containment.
                        </p>
                    </div>

                    {/* Associated Hands-On Laboratories */}
                    {lesson.laboratories?.length > 0 && (
                        <div className="pt-6 border-t border-slate-100 space-y-4">
                            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-blue-600" />
                                Associated Practical Simulation Laboratories
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {lesson.laboratories.map((lab: any) => (
                                    <div
                                        key={lab.id}
                                        className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                                                {lab.category}
                                            </span>
                                            <span className="text-xs text-slate-500">Est. {lab.estimated_minutes} mins</span>
                                        </div>
                                        <h4 className="text-sm font-bold text-slate-900">{lab.title}</h4>
                                        <Link
                                            href={route('simulation.show', lab.slug)}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                                        >
                                            Engage Virtual Simulation Lab <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
