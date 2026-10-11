import React from 'react';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheck, Terminal, Award, Lock, BookOpen, Activity, ChevronRight, CheckCircle2, UserCheck } from 'lucide-react';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Greg Cyberlab Simulator — ICT Academy Makurdi" />

            {/* Navigation Header */}
            <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Greg & Co. ICT Limited"
                            className="h-12 w-auto object-contain bg-white rounded-lg p-1"
                        />
                        <div>
                            <span className="text-lg font-black tracking-tight text-white block leading-tight">
                                GREG CYBERLAB <span className="text-blue-500">SIMULATOR</span>
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                                Greg & Co. ICT Academy — Makurdi, Benue State
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
                            >
                                <Terminal className="w-4 h-4" />
                                Go to Cyberdeck Dashboard
                            </Link>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
                                >
                                    Enter Lab Arena <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-800/60">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        100% Safe Browser-Based Cyber Simulation Arena
                    </div>

                    <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-tight">
                        Hands-On Cybersecurity Training for the Next Generation of Defenders
                    </h1>

                    <p className="text-slate-400 text-base max-w-2xl mx-auto leading-relaxed">
                        Master Kali Linux command forensics, network packet captures, phishing triage, SIEM alert response, and defensive hygiene in an educational simulation sandbox.
                    </p>

                    <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                        <Link
                            href={route('login')}
                            className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition flex items-center gap-2"
                        >
                            Launch Simulation Laboratory <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Fictional Sandbox Guarantee */}
                    <div className="pt-6 max-w-2xl mx-auto">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-center gap-2">
                            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span><strong>Educational Guardrails Active:</strong> All terminals, packets, logs, and targets run in isolated software models. Zero interaction with external networks.</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quick Demo Credentials Banner */}
            <section className="bg-slate-900/90 border-b border-slate-800 py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center mb-4">
                        Quick Demonstration Credentials (Preloaded)
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="text-blue-400 font-bold block mb-1">Super Administrator</span>
                            <span className="text-slate-300 block">User: admin@gregcyberlab.test</span>
                            <span className="text-slate-400 block">Pass: CyberAdmin2026!</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="text-indigo-400 font-bold block mb-1">Lead Instructor</span>
                            <span className="text-slate-300 block">User: instructor@gregcyberlab.test</span>
                            <span className="text-slate-400 block">Pass: Instructor2026!</span>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                            <span className="text-emerald-400 font-bold block mb-1">Trainee Cadet</span>
                            <span className="text-slate-300 block">User: student@gregcyberlab.test</span>
                            <span className="text-slate-400 block">Pass: Trainee2026!</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6 Specialized Simulation Workbenches Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <h2 className="text-3xl font-black text-white">6 Interactive Cyber Workbenches</h2>
                    <p className="text-sm text-slate-400">
                        Purpose-built training workspaces engineered for trainees at Greg & Co. ICT Academy in Makurdi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-3">
                        <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl w-fit">
                            <Terminal className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Simulated Kali Terminal</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            AST token allow-listed terminal emulator executing `sha256sum`, `nmap -sV`, `cat`, `grep`, and `ip` in a virtual filesystem.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-3">
                        <div className="p-3 bg-red-600/20 text-red-400 rounded-xl w-fit">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Phishing Analysis Workbench</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Dissect email headers, examine SPF/DKIM flags, and detect typosquatted domains with disabled external links.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-3">
                        <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl w-fit">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Log Forensics Workbench</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Filter `/var/log/auth.log` and Apache access logs to trace brute-force attacks and isolate attacker IPs.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-3">
                        <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Packet Metadata Inspector</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Investigate TCP 3-way handshakes and unencrypted cleartext credential leaks from sanitised PCAP-derived JSON frames.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-3">
                        <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl w-fit">
                            <Award className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">SOC Alert Queue & Triage</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Triage simulated SIEM alerts (True Positive, False Positive) and isolate compromised endpoints following NIST guidelines.
                        </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition space-y-3">
                        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl w-fit">
                            <UserCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white">Verifiable Certifications</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Automatic grading, milestone achievement badges, and cryptographic certificate verification codes for employers.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-10 bg-slate-950 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2">
                    <p className="font-bold text-slate-400">Greg Cyberlab Simulator — Greg & Co. ICT Academy</p>
                    <p>Makurdi, Benue State, Nigeria • Built for Safe Hands-On Defensive Cybersecurity Training</p>
                </div>
            </footer>
        </div>
    );
}
