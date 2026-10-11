import React, { useState } from 'react';
import axios from 'axios';
import {
    Activity,
    Search,
    Shield,
    AlertTriangle,
    Save,
    RotateCcw,
    Send,
    Check,
    Clock,
    FileText
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface LogInvestigationWorkbenchProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function LogInvestigationWorkbench({
    laboratory,
    attempt,
    onReset,
}: LogInvestigationWorkbenchProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'logs' | 'filter' | 'correlation' | 'remediation'>('logs');

    const config = laboratory.workbench_config || {};
    const sampleLogs = config.logs || [
        { timestamp: '2026-10-11 02:14:01', service: 'sshd', message: 'Failed password for invalid user admin from 192.168.50.120 port 44321 ssh2', severity: 'warning' },
        { timestamp: '2026-10-11 02:14:05', service: 'sshd', message: 'Failed password for invalid user root from 192.168.50.120 port 44322 ssh2', severity: 'warning' },
        { timestamp: '2026-10-11 02:14:12', service: 'sshd', message: 'Failed password for user deploy from 192.168.50.120 port 44323 ssh2', severity: 'warning' },
        { timestamp: '2026-10-11 02:14:28', service: 'sshd', message: 'Accepted password for deploy from 192.168.50.120 port 44329 ssh2', severity: 'critical' },
    ];

    // 1. Filtering
    const [logFilter, setLogFilter] = useState({
        failed_ssh_count: initialState.log_filtering?.failed_ssh_count || 3,
        filter_syntax_used: initialState.log_filtering?.filter_syntax_used || 'grep "Failed password" /var/log/auth.log',
    });

    // 2. Correlation
    const [logCorrelation, setLogCorrelation] = useState({
        attacker_ip: initialState.log_correlation?.attacker_ip || '192.168.50.120',
        compromised_user: initialState.log_correlation?.compromised_user || 'deploy',
    });

    // 3. Incident Timeline
    const [incidentTimeline, setIncidentTimeline] = useState<string[]>(
        initialState.incident_timeline || [
            '02:14:01 UTC - Attacker 192.168.50.120 initiates brute-force attack testing user admin',
            '02:14:05 UTC - Second failed attempt against user root',
            '02:14:12 UTC - Third failed attempt against valid account deploy',
            '02:14:28 UTC - Compromise: Password accepted for user deploy; interactive session established'
        ]
    );

    // 4. Finding Statement
    const [findingStatement, setFindingStatement] = useState(
        initialState.finding_statement ||
        'Attacker at IP 192.168.50.120 executed targeted brute-force attacks against SSH on 10.10.10.5, successfully breaching user account "deploy".'
    );

    // 5. Response Recommendations
    const [responseRecs, setResponseRecs] = useState({
        disable_password_auth: initialState.response_recommendations?.disable_password_auth ?? true,
        rotate_credentials: initialState.response_recommendations?.rotate_credentials ?? true,
        install_fail2ban: initialState.response_recommendations?.install_fail2ban ?? true,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        log_filtering: logFilter,
        log_correlation: logCorrelation,
        incident_timeline: incidentTimeline,
        finding_statement: findingStatement,
        response_recommendations: responseRecs,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Log investigation draft saved.');
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch {
            if (!silent) setSaveMessage('Error saving draft.');
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('simulation.submit', attempt.id);

        const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content;
        if (csrfToken) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = '_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
        }

        const payload = {
            rubric_submission: true,
            ...getCurrentState(),
        };

        Object.entries(payload).forEach(([k, v]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = typeof v === 'object' ? JSON.stringify(v) : String(v);
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'logs'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        Log Stream
                    </button>
                    <button
                        onClick={() => setActiveTab('filter')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'filter'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" />
                        1. Filtering (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('correlation')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'correlation'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        2. Correlation & Timeline (45 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('remediation')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'remediation'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        3. Findings & Mitigation (35 pts)
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {saveMessage && (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            {saveMessage}
                        </span>
                    )}
                    <SecondaryButton onClick={() => handleAutosave(false)} disabled={isSaving} className="text-xs py-1.5">
                        <Save className="w-3.5 h-3.5 mr-1" />
                        {isSaving ? 'Saving...' : 'Save Draft'}
                    </SecondaryButton>
                    <SecondaryButton onClick={onReset} className="text-xs py-1.5 text-red-600 hover:text-red-700">
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset
                    </SecondaryButton>
                </div>
            </div>

            {/* Tab 1: Log Stream */}
            {activeTab === 'logs' && (
                <div className="space-y-4">
                    <div className="bg-slate-950 text-slate-200 font-mono text-xs p-5 rounded-2xl overflow-x-auto space-y-2 border border-slate-800 shadow-xl">
                        <p className="text-slate-500 pb-2 border-b border-slate-800">=== /var/log/auth.log STREAM ===</p>
                        {sampleLogs.map((log: any, i: number) => (
                            <div key={i} className="flex gap-4">
                                <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                                <span className="text-emerald-400 shrink-0">[{log.service}]</span>
                                <span className={log.severity === 'critical' ? 'text-red-400 font-bold' : 'text-slate-300'}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 2: Filtering */}
            {activeTab === 'filter' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: Log Pattern Filtering (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Isolate failed SSH authentication lines and record your grep or awk filter syntax.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Filter Syntax Employed" />
                            <TextInput
                                value={logFilter.filter_syntax_used}
                                onChange={(e) => setLogFilter({ ...logFilter, filter_syntax_used: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Failed Authentication Count Identified" />
                            <TextInput
                                type="number"
                                value={logFilter.failed_ssh_count}
                                onChange={(e) => setLogFilter({ ...logFilter, failed_ssh_count: parseInt(e.target.value) || 0 })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Correlation & Timeline */}
            {activeTab === 'correlation' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2 & 3: Correlation & Timeline (45 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Trace the attacker IP address across failed events to the eventual successful authentication.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Correlated Attacker IP Address" />
                            <TextInput
                                value={logCorrelation.attacker_ip}
                                onChange={(e) => setLogCorrelation({ ...logCorrelation, attacker_ip: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Compromised Account Username" />
                            <TextInput
                                value={logCorrelation.compromised_user}
                                onChange={(e) => setLogCorrelation({ ...logCorrelation, compromised_user: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <InputLabel value="Chronological Attack Timeline" />
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                            {incidentTimeline.map((item, idx) => (
                                <p key={idx} className="font-mono text-slate-700 dark:text-slate-300">
                                    • {item}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Findings & Mitigation */}
            {activeTab === 'remediation' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4 & 5: Findings Statement & Safeguards (35 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Articulate the security finding and select hardened safeguards.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Formal Finding Statement" />
                            <textarea
                                value={findingStatement}
                                onChange={(e) => setFindingStatement(e.target.value)}
                                rows={3}
                                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 mt-1"
                            />
                        </div>

                        <div className="space-y-2">
                            <InputLabel value="Recommended Defensive Actions" />
                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={responseRecs.disable_password_auth}
                                    onChange={(e) => setResponseRecs({ ...responseRecs, disable_password_auth: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="text-xs text-slate-800 dark:text-slate-200">
                                    <strong>Disable Password Authentication:</strong> Enforce SSH public-key cryptography only.
                                </span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={responseRecs.rotate_credentials}
                                    onChange={(e) => setResponseRecs({ ...responseRecs, rotate_credentials: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="text-xs text-slate-800 dark:text-slate-200">
                                    <strong>Rotate Credentials:</strong> Invalidate compromised password for account "deploy" and audit authorized_keys.
                                </span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={responseRecs.install_fail2ban}
                                    onChange={(e) => setResponseRecs({ ...responseRecs, install_fail2ban: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="text-xs text-slate-800 dark:text-slate-200">
                                    <strong>Deploy Fail2ban / Rate-Limiting:</strong> Automatically drop source IPs exceeding 5 failed authentication attempts.
                                </span>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Complete Laboratory Assessment</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Submit log correlation and timeline evidence for 100-point rubric grading (Pass mark: 70%).
                    </p>
                </div>
                <PrimaryButton onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Evaluating...' : 'Submit Lab Assessment'}
                </PrimaryButton>
            </div>
        </div>
    );
}
