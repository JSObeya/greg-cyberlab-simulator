import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';

interface VerifyProps {
    certificate: {
        certificate_number: string;
        recipient_name: string;
        course_title: string;
        programme_title?: string;
        cohort_name?: string;
        score?: number;
        letter_grade?: string;
        issued_date: string;
        verification_token?: string;
        is_valid: boolean;
    };
}

export default function Verify({ certificate }: VerifyProps) {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <Head title={`Verify Credential - ${certificate.certificate_number}`} />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex p-3 rounded-2xl bg-cyan-950/60 border border-cyan-800 text-cyan-400 mb-3 shadow-inner">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-wide">Greg & Co. ICT Academy</h2>
                <p className="text-xs text-slate-400">Official Cybersecurity Credential & Registry Verification</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-slate-800/90 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-700/80 space-y-6 backdrop-blur">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 text-xs font-bold">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>Authentic Academy Credential Verified & In Good Standing</span>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="border-b border-slate-700/60 pb-3 flex justify-between items-end">
                            <div>
                                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Certificate Number</span>
                                <p className="text-cyan-300 font-mono font-bold text-sm mt-0.5">{certificate.certificate_number}</p>
                            </div>
                            {certificate.letter_grade && (
                                <span className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-black">
                                    Grade: {certificate.letter_grade} ({certificate.score}%)
                                </span>
                            )}
                        </div>

                        <div className="border-b border-slate-700/60 pb-3">
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Graduate Trainee</span>
                            <p className="text-white font-bold text-base mt-0.5">{certificate.recipient_name}</p>
                        </div>

                        <div className="border-b border-slate-700/60 pb-3">
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Accredited Course</span>
                            <p className="text-slate-200 font-bold text-xs mt-0.5">{certificate.course_title}</p>
                            {certificate.programme_title && (
                                <p className="text-slate-400 text-[11px] mt-0.5 font-medium">{certificate.programme_title}</p>
                            )}
                        </div>

                        {certificate.cohort_name && (
                            <div className="border-b border-slate-700/60 pb-3">
                                <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Cohort Group</span>
                                <p className="text-slate-200 font-medium text-xs mt-0.5">{certificate.cohort_name}</p>
                            </div>
                        )}

                        <div>
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Date of Certification</span>
                            <p className="text-slate-300 font-medium text-xs mt-0.5">{certificate.issued_date}</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 text-center">
                        <Link
                            href="/"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            Return to Greg Cyberlab Academy Portal
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
