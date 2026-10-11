import React, { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    Terminal as TerminalIcon,
    Shield,
    BookOpen,
    HelpCircle,
    CheckCircle2,
    Send,
    AlertTriangle,
    Mail,
    FileText,
    Network,
    Activity,
    Lock
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import OrientationAndSafetyConsole from './Workbenches/OrientationAndSafetyConsole';
import RiskAssessmentBoard from './Workbenches/RiskAssessmentBoard';
import IdentitySecurityClinic from './Workbenches/IdentitySecurityClinic';
import PhishingAnalysisWorkbench from './Workbenches/PhishingAnalysisWorkbench';
import UrlInvestigationDesk from './Workbenches/UrlInvestigationDesk';
import IntegrityVerificationConsole from './Workbenches/IntegrityVerificationConsole';
import KaliTerminalSimulator from './Workbenches/KaliTerminalSimulator';
import NetworkFoundationsConsole from './Workbenches/NetworkFoundationsConsole';
import AuthorisedDiscoveryConsole from './Workbenches/AuthorisedDiscoveryConsole';
import FirewallPolicySimulator from './Workbenches/FirewallPolicySimulator';

interface ArenaProps {
    laboratory: any;
    attempt: any;
}

export default function Arena({ laboratory, attempt }: ArenaProps) {
    const hasInteractiveWorkbench = Boolean(laboratory.primary_workspace) || laboratory.category === 'phishing' || laboratory.category === 'logs' || laboratory.category === 'packets' || laboratory.category === 'soc';
    const [activeTab, setActiveTab] = useState<'briefing' | 'terminal' | 'workbench' | 'assessment'>(
        hasInteractiveWorkbench ? 'workbench' : 'briefing'
    );

    // Terminal State
    const [commandInput, setCommandInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<Array<{ command: string; output: string }>>([
        {
            command: 'sys-info',
            output: "=== GREG CYBERLAB SIMULATED KALI TERMINAL ===\nEnvironment: Sandboxed Trainee Shell\nWarning: Educational simulation engine. No real OS execution.\nType 'help' for available commands.\n",
        },
    ]);
    const [isExecuting, setIsExecuting] = useState(false);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Form for Submitting Answers
    const { data, setData, post, processing } = useForm({
        answers: {} as Record<number, { selected_option?: string; text?: string }>,
    });

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalHistory]);

    const handleTerminalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = commandInput.trim();
        if (!cmd || isExecuting) return;

        setIsExecuting(true);
        setCommandInput('');

        try {
            const res = await axios.post(route('simulation.command', attempt.id), { command: cmd });
            if (res.data.output === '__CLEAR__') {
                setTerminalHistory([]);
            } else {
                setTerminalHistory((prev) => [...prev, { command: cmd, output: res.data.output }]);
            }
        } catch (err: any) {
            setTerminalHistory((prev) => [
                ...prev,
                { command: cmd, output: 'bash: command execution timeout or rate limit exceeded.' },
            ]);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleAnswerSelect = (questionId: number, optionId: string) => {
        setData('answers', {
            ...data.answers,
            [questionId]: { selected_option: optionId },
        });
    };

    const handleSubmitAttempt = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('simulation.submit', attempt.id));
    };

    const handleResetAttempt = () => {
        if (confirm('Are you sure you want to reset your virtual scenario to starting state? Historical records will be retained.')) {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = route('simulation.reset', attempt.id);
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
            if (csrfToken) {
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
            }
            document.body.appendChild(form);
            form.submit();
        }
    };

    const renderWorkbench = () => {
        const config = laboratory.workbench_config || {};

        if (laboratory.primary_workspace === 'orientation_console' || laboratory.slug === 'lab-01-orientation-rules' || laboratory.id === 1) {
            return (
                <OrientationAndSafetyConsole
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'risk_board' || laboratory.slug === 'lab-02-assets-threats-vulnerabilities-risk' || laboratory.id === 2) {
            return (
                <RiskAssessmentBoard
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'identity_clinic' || laboratory.slug === 'lab-03-strong-passwords-and-mfa' || laboratory.id === 3) {
            return (
                <IdentitySecurityClinic
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'phishing_workbench' || laboratory.slug === 'lab-04-recognising-phishing-emails' || laboratory.id === 4) {
            return (
                <PhishingAnalysisWorkbench
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'url_desk' || laboratory.slug === 'lab-05-safe-browsing-and-suspicious-urls' || laboratory.id === 5) {
            return (
                <UrlInvestigationDesk
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'integrity_console' || laboratory.slug === 'lab-06-file-hashes-and-integrity-verification' || laboratory.id === 6) {
            return (
                <IntegrityVerificationConsole
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'linux_console' || laboratory.slug === 'lab-07-basic-linux-commands-kali-terminal' || laboratory.id === 7) {
            return (
                <KaliTerminalSimulator
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'network_diagnostics' || laboratory.slug === 'lab-08-ip-addressing-ports-protocols' || laboratory.id === 8) {
            return (
                <NetworkFoundationsConsole
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'port_scanner' || laboratory.slug === 'lab-09-simulated-host-discovery-service-id' || laboratory.id === 9) {
            return (
                <AuthorisedDiscoveryConsole
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.primary_workspace === 'firewall_simulator' || laboratory.slug === 'lab-10-firewall-rule-analysis-exposure' || laboratory.id === 10) {
            return (
                <FirewallPolicySimulator
                    laboratory={laboratory}
                    attempt={attempt}
                    onReset={handleResetAttempt}
                />
            );
        }

        if (laboratory.category === 'phishing') {
            const emails = config.emails || [];
            return (
                <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-xl flex items-center gap-3 text-amber-800 dark:text-amber-300 text-xs">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <span>Inspect headers, SPF/DKIM flags, and display-name spoofing. External links are disabled for safety.</span>
                    </div>

                    {emails.map((mail: any) => (
                        <div key={mail.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                                <p className="text-base font-bold text-slate-900 dark:text-white">{mail.subject}</p>
                                <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                                    <p><strong className="text-slate-800 dark:text-slate-200">From:</strong> {mail.sender}</p>
                                    <p><strong className="text-slate-800 dark:text-slate-200">Reply-To:</strong> <span className="text-red-600 dark:text-red-400 font-mono">{mail.reply_to}</span></p>
                                    <p><strong className="text-slate-800 dark:text-slate-200">SPF Status:</strong> <span className="px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold">{mail.spf}</span></p>
                                </div>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg font-sans text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-100 dark:border-slate-800">
                                {mail.body}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (laboratory.category === 'logs') {
            const logs = config.logs || [];
            return (
                <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-4 rounded-xl text-blue-900 dark:text-blue-300 text-xs">
                        Filter and analyze authentication events to trace the attacker's brute-force intrusion.
                    </div>
                    <div className="bg-slate-950 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto space-y-2 border border-slate-800">
                        {logs.map((log: any, i: number) => (
                            <div key={i} className="flex gap-4">
                                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                                <span className="text-emerald-400 shrink-0">[{log.service}]</span>
                                <span className={log.severity === 'critical' ? 'text-red-400 font-bold' : 'text-slate-300'}>{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (laboratory.category === 'packets') {
            const packets = config.packets || [];
            return (
                <div className="space-y-4">
                    <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 p-4 rounded-xl text-indigo-900 dark:text-indigo-300 text-xs">
                        Packet metadata captured on eth0. Inspect frame sequences and plaintext payload leaks.
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                                <tr>
                                    <th className="py-2.5 px-4">No.</th>
                                    <th className="py-2.5 px-4">Time</th>
                                    <th className="py-2.5 px-4">Source</th>
                                    <th className="py-2.5 px-4">Destination</th>
                                    <th className="py-2.5 px-4">Proto</th>
                                    <th className="py-2.5 px-4">Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-300">
                                {packets.map((pkt: any) => (
                                    <tr key={pkt.no} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                                        <td className="py-2 px-4">{pkt.no}</td>
                                        <td className="py-2 px-4 text-slate-500">{pkt.time}</td>
                                        <td className="py-2 px-4">{pkt.src}</td>
                                        <td className="py-2 px-4">{pkt.dst}</td>
                                        <td className="py-2 px-4 font-bold text-blue-600 dark:text-blue-400">{pkt.proto}</td>
                                        <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{pkt.info}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        if (laboratory.category === 'soc') {
            const alerts = config.alerts || [];
            return (
                <div className="space-y-4">
                    <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm">Security Operations Center — Active SIEM Queue</p>
                            <p className="text-xs text-slate-400">Triage incoming indicators and isolate impacted hosts</p>
                        </div>
                    </div>

                    {alerts.map((al: any) => (
                        <div key={al.id} className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900 rounded-xl p-5 shadow-xs space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-bold text-xs uppercase tracking-wider">
                                    {al.severity} Severity
                                </span>
                                <span className="text-xs text-slate-500 font-mono">{al.id}</span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{al.title}</h4>
                            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                                <div><strong className="text-slate-700 dark:text-slate-300">Affected Asset:</strong> {al.asset}</div>
                                <div><strong className="text-slate-700 dark:text-slate-300">User Account:</strong> {al.user}</div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{al.details}</p>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                No dedicated secondary workbench required for this laboratory. Use the Kali Terminal and Assessment tools.
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                {laboratory.difficulty}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">Est: {laboratory.estimated_minutes} mins</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{laboratory.title}</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('dashboard')}
                            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        >
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${laboratory.title} - Simulation Arena`} />

            <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Simulation Workspace Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl px-4 pt-2 gap-2 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('briefing')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                            activeTab === 'briefing'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        1. Scenario Briefing & Objectives
                    </button>

                    <button
                        onClick={() => setActiveTab('terminal')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                            activeTab === 'terminal'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <TerminalIcon className="w-4 h-4" />
                        2. Simulated Kali Terminal
                    </button>

                    <button
                        onClick={() => setActiveTab('workbench')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                            activeTab === 'workbench'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <Activity className="w-4 h-4" />
                        3. Investigation Workbench
                    </button>

                    <button
                        onClick={() => setActiveTab('assessment')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition whitespace-nowrap ${
                            activeTab === 'assessment'
                                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        4. Final Questions & Evaluation
                    </button>
                </div>

                {/* Tab 1: Briefing */}
                {activeTab === 'briefing' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-6 shadow-xs">
                        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-4 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center gap-3">
                            <Lock className="w-5 h-5 shrink-0" />
                            <span>{laboratory.safety_notice}</span>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Scenario Background</h3>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {laboratory.scenario_background}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Learning Objectives</h3>
                            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                                {laboratory.learning_objectives}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Step-by-Step Instructions</h3>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {laboratory.instructions}
                            </p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                onClick={() => setActiveTab('terminal')}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                            >
                                Proceed to Simulated Terminal →
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab 2: Terminal */}
                {activeTab === 'terminal' && (
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-xl overflow-hidden font-mono flex flex-col h-[580px]">
                        <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 rounded-full bg-red-500"></span>
                                <span className="w-3.5 h-3.5 rounded-full bg-yellow-500"></span>
                                <span className="w-3.5 h-3.5 rounded-full bg-green-500"></span>
                                <span className="text-xs text-slate-400 font-sans ml-2">analyst@kali: ~</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 font-sans uppercase font-bold tracking-wider">
                                SIMULATED SANDBOX — ZERO SYSTEM EXECUTION
                            </span>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs text-slate-200">
                            {terminalHistory.map((h, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <span className="text-emerald-400 font-bold">┌──(analyst㉿kali)-[~]</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <span className="text-emerald-400 font-bold">└─$</span>
                                        <span className="text-white font-bold">{h.command}</span>
                                    </div>
                                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed pl-4">
                                        {h.output}
                                    </div>
                                </div>
                            ))}
                            <div ref={terminalEndRef} />
                        </div>

                        <form onSubmit={handleTerminalSubmit} className="bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-2">
                            <span className="text-emerald-400 font-bold text-xs pl-2">└─$</span>
                            <input
                                type="text"
                                value={commandInput}
                                onChange={(e) => setCommandInput(e.target.value)}
                                placeholder="Enter safe Kali terminal command (e.g. 'help', 'ls -la', 'ip addr', 'sha256sum updater.bin')..."
                                className="flex-1 bg-transparent border-0 text-white text-xs focus:ring-0 focus:outline-none placeholder-slate-600 font-mono"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={isExecuting}
                                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-sans font-bold transition flex items-center gap-1"
                            >
                                <Send className="w-3.5 h-3.5" />
                                Run
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab 3: Workbench */}
                {activeTab === 'workbench' && renderWorkbench()}

                {/* Tab 4: Assessment Questions */}
                {activeTab === 'assessment' && (
                    <form onSubmit={handleSubmitAttempt} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-8 shadow-xs">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Laboratory Assessment & Debriefing</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Answer all scenario questions based on your simulation findings. Your score will be evaluated instantly.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {laboratory.questions?.map((q: any, qIndex: number) => (
                                <div key={q.id} className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 space-y-4">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        Question {qIndex + 1}: {q.prompt}
                                    </p>

                                    <div className="space-y-2">
                                        {q.options?.map((opt: any) => {
                                            const isSelected = data.answers[q.id]?.selected_option === opt.id;
                                            return (
                                                <button
                                                    key={opt.id}
                                                    type="button"
                                                    onClick={() => handleAnswerSelect(q.id, opt.id)}
                                                    className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition flex items-center gap-3 ${
                                                        isSelected
                                                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 font-bold'
                                                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${
                                                        isSelected ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-700 text-slate-500'
                                                    }`}>
                                                        {opt.id.toUpperCase()}
                                                    </span>
                                                    {opt.text}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                            >
                                {processing ? 'Submitting & Grading...' : 'Submit Final Answers for Scoring'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
