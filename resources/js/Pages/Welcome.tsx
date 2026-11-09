import React from 'react';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    ShieldCheck,
    Terminal,
    Award,
    Lock,
    BookOpen,
    Activity,
    ChevronRight,
    UserCheck,
    Cpu,
    Radar,
    Server,
    ShieldAlert,
    CheckCircle2,
    Flame,
    Zap,
    UserPlus,
    Clock,
    ArrowRight
} from 'lucide-react';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
            <Head title="Greg Cyberlab Simulator — ICT Academy Makurdi" />

            {/* Subtle cyber background grid & gradients */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-blue-600/10 blur-[130px] pointer-events-none rounded-full" />
            <div className="fixed top-96 right-0 w-[400px] h-[300px] bg-cyan-600/10 blur-[120px] pointer-events-none rounded-full" />

            {/* Navigation Header */}
            <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/images/logo.png"
                            alt="Greg & Co. ICT Limited"
                            className="h-11 w-auto object-contain bg-white rounded-lg p-1 shadow-md shadow-blue-500/10"
                        />
                        <div>
                            <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-tight">
                                GREG CYBERLAB <span className="text-blue-500">SIMULATOR</span>
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                                Greg & Co. ICT Academy — Makurdi, Benue State
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition flex items-center gap-2"
                            >
                                <Terminal className="w-4 h-4" />
                                <span>Cyberdeck Dashboard</span>
                            </Link>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3">
                                <Link
                                    href={route('login')}
                                    className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition flex items-center gap-1.5"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Trainee Registration</span>
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="hidden sm:flex px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition items-center gap-1.5"
                                >
                                    <span>Enter Arena</span> <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-12 sm:pt-16 pb-16 sm:pb-24 border-b border-slate-800/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-500/30 text-blue-300 text-xs font-medium shadow-inner shadow-blue-500/10 backdrop-blur-xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="font-semibold text-emerald-400">Tactical Cyber Simulation</span>
                        <span className="text-slate-500">•</span>
                        <span>100% Safe Browser-Sandboxed Arena</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl mx-auto leading-[1.15]">
                        Hands-On Cybersecurity & AI Defense for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400">Modern Security Personnel</span>
                    </h1>

                    <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Master Kali Linux command forensics, packet inspection, phishing triage, SIEM alert response, CIA Triad enforcement, OPSEC protocols, and AI threat mitigation in an isolated simulation sandbox.
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                        <Link
                            href={auth.user ? route('labs.index') : route('login')}
                            className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition flex items-center gap-2 group"
                        >
                            <span>Launch Simulation Laboratories</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        {!auth.user && (
                            <Link
                                href={route('register')}
                                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition flex items-center gap-2 group border border-emerald-400/30"
                            >
                                <UserPlus className="w-4 h-4" />
                                <span>Self-Register as Trainee</span>
                            </Link>
                        )}
                        <Link
                            href={auth.user ? route('courses.index') : route('login')}
                            className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold text-sm transition flex items-center gap-2"
                        >
                            <BookOpen className="w-4 h-4 text-cyan-400" />
                            <span>View Academic Curriculum</span>
                        </Link>
                    </div>

                    {/* Educational Sandbox Security Guardrail */}
                    <div className="pt-4 max-w-2xl mx-auto">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 text-[11px] text-slate-400 flex items-center justify-center gap-2.5 backdrop-blur-xs shadow-xs">
                            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                                <strong className="text-slate-200">Educational Guardrails Active:</strong> All terminals, packets, logs, and targets run in isolated software models. Zero interaction with external networks.
                            </span>
                        </div>
                    </div>

                    {/* Cyber Simulation UI Showcase Card */}
                    <div className="pt-8 max-w-4xl mx-auto">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-blue-950/40 overflow-hidden text-left">
                            {/* Window header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800/90">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                    <span className="ms-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
                                        <Terminal className="w-3.5 h-3.5 text-blue-400" />
                                        <span>greg-cyberdeck // simulation-session-01 [AST Sandbox]</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800/50">
                                        ONLINE • SANDBOX SAFE
                                    </span>
                                </div>
                            </div>

                            {/* Simulated Terminal & Telemetry Body */}
                            <div className="p-5 font-mono text-xs space-y-3 bg-slate-950/60">
                                <div className="text-slate-500 text-[11px]">
                                    # Greg & Co. ICT Academy — Tactical Cyber Simulation Kernel v2.4
                                </div>
                                <div className="text-slate-400">
                                    <span className="text-emerald-400 font-bold">trainee@greg-cyberlab:~$</span> nmap -sV -p 22,80,443,3389 192.168.10.0/24
                                </div>
                                <div className="text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800/80 leading-relaxed text-[11px]">
                                    Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-05 22:50 UTC<br />
                                    Nmap scan report for nav-provost-gw.local (192.168.10.1)<br />
                                    PORT     STATE SERVICE       VERSION<br />
                                    22/tcp   open  ssh           OpenSSH 9.2p1 (Tactical RBAC enforced)<br />
                                    80/tcp   open  http          Apache/2.4.57 (Defensive Header Guard)<br />
                                    443/tcp  open  ssl/https     TLSv1.3 (Cipher: AES_256_GCM_SHA384)<br />
                                    3389/tcp closed ms-wbt-server<br />
                                    <span className="text-emerald-400">✓ AST Safe Terminal Verified: SHA256 integrity token matches military syllabus.</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 gap-2">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1 text-blue-400">
                                            <Radar className="w-3.5 h-3.5" /> CIA Triad Verified
                                        </span>
                                        <span className="flex items-center gap-1 text-indigo-400">
                                            <Cpu className="w-3.5 h-3.5" /> AI Threat Telemetry Active
                                        </span>
                                    </div>
                                    <div className="text-slate-500">
                                        Air-Gapped In-Browser AST Runtime
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Training Pillars / Capability Badges */}
            <section className="border-b border-slate-800/60 bg-slate-900/40 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-white">20+</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tactical Labs</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-cyan-400">6 Specialized</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cyber Workbenches</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-emerald-400">100% Client-Side</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zero Network Risk</div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-2xl font-black text-indigo-400">Mil-Spec & OPSEC</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Provost Aligned</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Cadet Admission & Self-Registration Flow */}
            <section className="py-14 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-emerald-950/20 to-slate-950 p-6 sm:p-10 shadow-2xl shadow-emerald-950/20">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
                            <div className="space-y-2 max-w-2xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                    <span>Academy Admission & Registration Directive</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    Cadet Self-Registration with Administrator Approval
                                </h2>
                                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                    All new trainees and naval security personnel can self-register online. In accordance with operational security regulations, newly created accounts remain inactive until vetted and activated by an academy Administrator.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                                <Link
                                    href={route('register')}
                                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-emerald-600/30 transition flex items-center gap-2"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Begin Trainee Self-Registration</span>
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm transition"
                                >
                                    Sign In to Active Account
                                </Link>
                            </div>
                        </div>

                        {/* 3-Step Lifecycle */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
                            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 font-black text-sm flex items-center justify-center border border-blue-500/30">
                                        01
                                    </div>
                                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">Step 1</span>
                                </div>
                                <h3 className="font-bold text-sm text-white">Online Trainee Registration</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Cadets fill out their profile, including official email, rank/cadet designation, and select their assigned training programme (e.g. Basic Cybersecurity & AI for Security Personnel).
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 font-black text-sm flex items-center justify-center border border-amber-500/30">
                                        02
                                    </div>
                                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">Step 2</span>
                                </div>
                                <h3 className="font-bold text-sm text-white">Administrator Vetting & Activation</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Registrations are placed in the <span className="text-amber-400 font-medium">Pending Approval</span> queue. Lead Instructors or Super Admins verify cadet identity and click <span className="text-emerald-400 font-medium">Approve</span> to activate the profile.
                                </p>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/30">
                                        03
                                    </div>
                                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">Step 3</span>
                                </div>
                                <h3 className="font-bold text-sm text-white">Tactical Cyber Simulation Access</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    The trainee logs in to launch their assigned simulation curriculum, practice in the 6 interactive workbenches, and take timed MCQ assessments with instant analytics.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6 Specialized Simulation Workbenches Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                        <Flame className="w-3.5 h-3.5 text-amber-400" />
                        Interactive Defense Environments
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">6 Interactive Cyber Workbenches</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Purpose-built simulated workspaces engineered for trainees and security personnel at Greg & Co. ICT Academy in Makurdi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Workbench 1 */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 transition space-y-3 group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl group-hover:scale-105 transition-transform">
                                <Terminal className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/40">
                                Terminal
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Simulated Kali Terminal</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            AST token allow-listed terminal emulator executing <code className="text-blue-300">sha256sum</code>, <code className="text-blue-300">nmap</code>, <code className="text-blue-300">cat</code>, <code className="text-blue-300">grep</code>, and <code className="text-blue-300">chmod</code> in a safe virtual filesystem.
                        </p>
                    </div>

                    {/* Workbench 2 */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-500/5 transition space-y-3 group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-red-600/20 text-red-400 rounded-xl group-hover:scale-105 transition-transform">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/40">
                                Email Triage
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Phishing Analysis Workbench</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Dissect email headers, examine SPF/DKIM flags, and detect typosquatted domains and spear-phishing campaigns with safe non-functional links.
                        </p>
                    </div>

                    {/* Workbench 3 */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/5 transition space-y-3 group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl group-hover:scale-105 transition-transform">
                                <Activity className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                                Log Auditing
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Log Forensics Workbench</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Filter <code className="text-emerald-300">/var/log/auth.log</code> and web access logs to trace brute-force attacks, unauthorized root escalation, and isolate hostile IPs.
                        </p>
                    </div>

                    {/* Workbench 4 */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/5 transition space-y-3 group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-cyan-600/20 text-cyan-400 rounded-xl group-hover:scale-105 transition-transform">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                                PCAP Frames
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Packet Metadata Inspector</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Investigate TCP 3-way handshakes, unencrypted cleartext credential leaks, and DNS exfiltration channels from sanitised PCAP-derived JSON frames.
                        </p>
                    </div>

                    {/* Workbench 5 */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 transition space-y-3 group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl group-hover:scale-105 transition-transform">
                                <Award className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                                SIEM SOC
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">SOC Alert Queue & Triage</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Triage simulated SIEM alerts (True Positive vs. False Positive) and isolate compromised endpoints following NIST Computer Security Incident Handling guidelines.
                        </p>
                    </div>

                    {/* Workbench 6 */}
                    <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/50 hover:shadow-xl hover:shadow-purple-500/5 transition space-y-3 group">
                        <div className="flex items-center justify-between">
                            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl group-hover:scale-105 transition-transform">
                                <UserCheck className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/40">
                                Credentialing
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">Verifiable Certifications</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Automatic grading, milestone achievement badges, and cryptographic certificate verification tokens for military commanders, employers, and auditors.
                        </p>
                    </div>
                </div>
            </section>

            {/* Academic & Defense Alignment Banner */}
            <section className="border-t border-slate-800/80 bg-slate-900/60 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950 border border-blue-500/30 text-xs font-semibold text-blue-400">
                                <Zap className="w-3.5 h-3.5 text-blue-400" />
                                Comprehensive Security Syllabus
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                Tailored for Military Provost, SOC Analysts & Security Personnel
                            </h2>
                            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                Our curriculum combines foundational defensive cybersecurity with artificial intelligence threat defense. Personnel learn hands-on Operational Security (OPSEC), classified information safeguarding, and cyber warfare counter-measures within an authentic yet zero-risk sandbox.
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-300">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>CIA Triad Practical Labs</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Military OPSEC Counter-Recon</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>AI Voice Clone & Deepfake Triage</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <span>Multi-Level Access Control (RBAC)</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-4">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <Server className="w-4 h-4 text-blue-400" />
                                Academy Information
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Greg Cyberlab Simulator is engineered by Greg & Co. ICT Limited to provide safe, browser-based hands-on cyber defense labs for trainees, military contingents, and cybersecurity apprentices across Nigeria and West Africa.
                            </p>
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <Link
                                    href={route('register')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    <span>Trainee Self-Registration</span>
                                </Link>
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
                                >
                                    <span>Sign In to Arena</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800/80 py-10 bg-slate-950 text-center text-xs text-slate-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
                        <Link href={route('login')} className="hover:text-white transition">Sign In</Link>
                        <span>•</span>
                        <Link href={route('register')} className="text-emerald-400 hover:text-emerald-300 transition">Trainee Self-Registration</Link>
                        <span>•</span>
                        <Link href={route('courses.index')} className="hover:text-white transition">Academic Curriculum</Link>
                        <span>•</span>
                        <Link href={route('labs.index')} className="hover:text-white transition">Simulation Laboratories</Link>
                    </div>
                    <p className="font-bold text-slate-400">Greg Cyberlab Simulator — Greg & Co. ICT Academy</p>
                    <p>Makurdi, Benue State, Nigeria • Built for Safe Hands-On Defensive Cybersecurity & AI Training</p>
                </div>
            </footer>
        </div>
    );
}
