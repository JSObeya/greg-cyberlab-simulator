import React, { useState } from 'react';
import axios from 'axios';
import {
    Terminal as TerminalIcon,
    Folder,
    FileText,
    Key,
    Shield,
    Save,
    RotateCcw,
    Send,
    Search,
    Check,
    HelpCircle
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface KaliTerminalSimulatorProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function KaliTerminalSimulator({
    laboratory,
    attempt,
    onReset,
}: KaliTerminalSimulatorProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'terminal' | 'navigation' | 'inspection' | 'logfilter' | 'hash'>('terminal');

    // Terminal State
    const [commandInput, setCommandInput] = useState('');
    const [terminalHistory, setTerminalHistory] = useState<Array<{ command: string; output: string }>>([
        {
            command: 'sys-info',
            output: "=== GREG CYBERLAB SIMULATED KALI TERMINAL ===\nUser: analyst@kali\nWorking Directory: /home/analyst\nAvailable simulated commands: pwd, ls, cd, cat, grep, sha256sum, file, help\nType 'ls -la' to begin.",
        },
    ]);
    const [isExecuting, setIsExecuting] = useState(false);

    // 1. Navigation Evidence
    const [navEvidence, setNavEvidence] = useState({
        current_directory: initialState.navigation_evidence?.current_directory || '/home/analyst/audit_workspace',
        located_workspace: initialState.navigation_evidence?.located_workspace || true,
    });

    // 2. File Inspection
    const [fileInspection, setFileInspection] = useState({
        flag_content: initialState.file_inspection?.flag_content || 'FLAG{KALI_NAV_SUCCESS}',
        file_type_identified: initialState.file_inspection?.file_type_identified || 'ASCII text configuration flag',
    });

    // 3. Log Filtering
    const [logFiltering, setLogFiltering] = useState({
        grep_pattern_used: initialState.log_filtering?.grep_pattern_used || 'grep -i "failed" /var/log/auth.log',
        failed_login_ip: initialState.log_filtering?.failed_login_ip || '192.168.50.105',
    });

    // 4. Hash Verification
    const [hashData, setHashData] = useState({
        computed_hash: initialState.hash_verification?.computed_hash || '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        file_target: initialState.hash_verification?.file_target || 'flag.txt',
    });

    // 5. Permissions & Evidence Summary
    const [permissionsAnswer, setPermissionsAnswer] = useState(
        initialState.permissions_answer || '-rw-r--r-- (owner read/write, group read, others read only; no setuid bit).'
    );
    const [evidenceSummary, setEvidenceSummary] = useState(
        initialState.evidence_summary || 'Discovered secret flag in audit_workspace; isolated suspicious brute-force attacker IP 192.168.50.105 in auth.log.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        navigation_evidence: navEvidence,
        file_inspection: fileInspection,
        log_filtering: logFiltering,
        hash_verification: hashData,
        permissions_answer: permissionsAnswer,
        evidence_summary: evidenceSummary,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Terminal assessment draft saved.');
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch {
            if (!silent) setSaveMessage('Error saving draft.');
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

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
        } catch {
            setTerminalHistory((prev) => [
                ...prev,
                { command: cmd, output: 'bash: command execution timeout or rate limit exceeded.' },
            ]);
        } finally {
            setIsExecuting(false);
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
                        onClick={() => setActiveTab('terminal')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'terminal'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <TerminalIcon className="w-3.5 h-3.5" />
                        Simulated Kali Terminal
                    </button>
                    <button
                        onClick={() => setActiveTab('navigation')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'navigation'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Folder className="w-3.5 h-3.5" />
                        1. Navigation (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('inspection')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'inspection'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        2. File & Flag (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('logfilter')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'logfilter'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" />
                        3. Log Grep (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('hash')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'hash'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Key className="w-3.5 h-3.5" />
                        4. Hashing & Summary (35 pts)
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

            {/* Tab 1: Terminal */}
            {activeTab === 'terminal' && (
                <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 font-mono text-xs space-y-4 shadow-xl">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-slate-400">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="ml-2 font-bold text-slate-300">analyst@kali: ~</span>
                        </div>
                        <span className="text-[11px] text-slate-500">100% In-Engine Simulated Sandbox</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                        {terminalHistory.map((h, i) => (
                            <div key={i} className="space-y-1">
                                <div className="text-blue-400 flex items-center gap-2">
                                    <span className="text-emerald-400 font-bold">analyst@kali:~$</span>
                                    <span>{h.command}</span>
                                </div>
                                <div className="text-slate-300 whitespace-pre-wrap pl-4 leading-relaxed font-sans text-xs">
                                    {h.output}
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleTerminalSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
                        <span className="text-emerald-400 font-bold self-center">analyst@kali:~$</span>
                        <input
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder="Type command (e.g. ls, pwd, cd audit_workspace, cat flag.txt, grep failed auth.log)..."
                            className="flex-1 bg-transparent border-0 text-slate-100 focus:ring-0 text-xs font-mono p-0"
                            disabled={isExecuting}
                        />
                        <button
                            type="submit"
                            disabled={isExecuting || !commandInput.trim()}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs transition"
                        >
                            Run
                        </button>
                    </form>
                </div>
            )}

            {/* Tab 2: Navigation */}
            {activeTab === 'navigation' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: Navigation & Directory Audit (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Verify your current working directory and target audit workspace.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Working Directory Path (Discovered via `pwd`)" />
                            <TextInput
                                value={navEvidence.current_directory}
                                onChange={(e) => setNavEvidence({ ...navEvidence, current_directory: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Terminal Commands Reference:</p>
                            <p className="text-slate-600 dark:text-slate-400 font-mono">`pwd` — Print working directory</p>
                            <p className="text-slate-600 dark:text-slate-400 font-mono">`ls -la` — List files with permissions and hidden entries</p>
                            <p className="text-slate-600 dark:text-slate-400 font-mono">`cd audit_workspace` — Change into investigation directory</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: File Inspection */}
            {activeTab === 'inspection' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: File Inspection & Flag Discovery (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Inspect target case files using `cat` or `file` and locate the hidden flag.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Flag Content Found in flag.txt" />
                            <TextInput
                                value={fileInspection.flag_content}
                                onChange={(e) => setFileInspection({ ...fileInspection, flag_content: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="File Classification / Type" />
                            <TextInput
                                value={fileInspection.file_type_identified}
                                onChange={(e) => setFileInspection({ ...fileInspection, file_type_identified: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Log Grep */}
            {activeTab === 'logfilter' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Log Filtering with grep (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Filter `/var/log/auth.log` or scenario logs to isolate attacker brute-force attempts.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Grep Filter Syntax Used" />
                            <TextInput
                                value={logFiltering.grep_pattern_used}
                                onChange={(e) => setLogFiltering({ ...logFiltering, grep_pattern_used: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Attacker IP Address Extracted from Failed Authentications" />
                            <TextInput
                                value={logFiltering.failed_login_ip}
                                onChange={(e) => setLogFiltering({ ...logFiltering, failed_login_ip: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 5: Hashing & Summary */}
            {activeTab === 'hash' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4 & 5: Integrity Digest & Evidence Synthesis (35 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Verify hash integrity, interpret POSIX file permissions, and submit your evidence.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="SHA-256 Digest of flag.txt" />
                            <TextInput
                                value={hashData.computed_hash}
                                onChange={(e) => setHashData({ ...hashData, computed_hash: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Permissions Interpretation (-rw-r--r--)" />
                            <TextInput
                                value={permissionsAnswer}
                                onChange={(e) => setPermissionsAnswer(e.target.value)}
                                className="w-full text-xs mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Evidence Summary & Incident Findings" />
                            <textarea
                                value={evidenceSummary}
                                onChange={(e) => setEvidenceSummary(e.target.value)}
                                rows={3}
                                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Complete Laboratory Assessment</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Submit your terminal commands, findings, and evidence for 100-point rubric grading (Pass mark: 70%).
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
