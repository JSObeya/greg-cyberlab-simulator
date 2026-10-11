import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ShieldCheck, Award } from 'lucide-react';

interface VerifyProps {
    certificate: {
        certificate_number: string;
        recipient_name: string;
        course_title: string;
        issued_date: string;
        is_valid: boolean;
    };
}

export default function Verify({ certificate }: VerifyProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <Head title={`Verify Credential - ${certificate.certificate_number}`} />

            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex p-3 rounded-2xl bg-blue-50 text-blue-600 mb-3">
                    <ShieldCheck className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Greg & Co. ICT Academy</h2>
                <p className="text-xs text-slate-500">Official Cybersecurity Credential Registry</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
                <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200/80 space-y-6">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-5 h-5 shrink-0" />
                        <span>Authentic Credential Verified & Valid</span>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Certificate Number</span>
                            <p className="text-slate-900 font-mono font-bold text-sm mt-0.5">{certificate.certificate_number}</p>
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Graduate Trainee</span>
                            <p className="text-slate-900 font-bold text-base mt-0.5">{certificate.recipient_name}</p>
                        </div>

                        <div className="border-b border-slate-100 pb-3">
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Accredited Programme</span>
                            <p className="text-slate-900 font-bold text-xs mt-0.5">{certificate.course_title}</p>
                        </div>

                        <div>
                            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold">Date of Certification</span>
                            <p className="text-slate-900 font-medium text-xs mt-0.5">{certificate.issued_date}</p>
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
