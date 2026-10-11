import React, { useState } from 'react';
import axios from 'axios';
import {
    Terminal as TerminalIcon,
    Shield,
    CheckCircle2,
    XCircle,
    Save,
    RotateCcw,
    Send,
    Check,
    FileCode,
    Lock,
    Search
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface IntegrityConsoleProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function IntegrityVerificationConsole({
    laboratory,
    attempt,
    onReset,
}: IntegrityConsoleProps) {
    const initialState = attempt.autosaved_state || {};

    // Manifest of published hashes
    const manifest = [
        {
            filename: 'updater.bin',
            expected_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            actual_computed: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
            file_type: 'ELF 64-bit LSB executable, x86-64, dynamically linked',
            status: 'mismatch',
        },
        {
            filename: 'policy.pdf.txt',
            expected_hash: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
            actual_computed: '5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5',
            file_type: 'ASCII text, with CRLF line terminators',
            status: 'match',
        },
        {
            filename: 'backup.sql.txt',
            expected_hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
            actual_computed: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
            file_type: 'MySQL database dump text, SQL statements',
            status: 'match',
        },
    ];

    // Terminal command history inside the workbench
    const [terminalHistory, setTerminalHistory] = useState<Array<{ cmd: string; out: string }>>([
        {
            cmd: 'ls -l',
            out: "-rw-r--r-- 1 analyst analyst 1048576 Oct 11 10:15 updater.bin\n-rw-r--r-- 1 analyst analyst   40960 Oct 11 10:15 policy.pdf.txt\n-rw-r--r-- 1 analyst analyst  524288 Oct 11 10:15 backup.sql.txt\n-rw-r--r-- 1 analyst analyst     256 Oct 11 10:15 SHA256SUMS.manifest",
        },
    ]);
    const [commandInput, setCommandInput] = useState('');
    const [commandsUsed, setCommandsUsed] = useState<string[]>(initialState.commands_used || ['ls', 'sha256sum', 'file']);

    // 1. Digest comparison
    const [digestComparison, setDigestComparison] = useState({
        mismatched_file: initialState.digest_comparison?.mismatched_file || 'updater.bin',
        matched_files_count: initialState.digest_comparison?.matched_files_count || 2,
    });

    // 2. Interpretation
    const [interpretation, setInterpretation] = useState(
        initialState.interpretation ||
        'The computed SHA-256 digest for updater.bin does not match the vendor manifest checksum, proving the binary was altered or replaced during transmission. However, a hash mismatch proves difference, not who caused it.'
    );

    // 3. Chain of Custody
    const [chainOfCustody, setChainOfCustody] = useState({
        file_name: initialState.chain_of_custody?.file_name || 'updater.bin',
        computed_hash: initialState.chain_of_custody?.computed_hash || '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
        handler: initialState.chain_of_custody?.handler || attempt.user?.name || 'Trainee Forensic Analyst',
        timestamp: initialState.chain_of_custody?.timestamp || new Date().toISOString(),
    });

    // 4. Recommended Action
    const [recommendedAction, setRecommendedAction] = useState(
        initialState.recommended_action ||
        'Quarantine updater.bin immediately; do not execute. Redownload the package from the vendor signed repository over HTTPS and log the incident.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRunTerminal = (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = commandInput.trim();
        if (!cmd) return;

        let output = '';
        if (cmd === 'clear') {
            setTerminalHistory([]);
            setCommandInput('');
            return;
        }

        if (cmd.startsWith('sha256sum')) {
            const parts = cmd.split(' ');
            const target = parts[1];
            if (!target || target === 'SHA256SUMS.manifest') {
                output = "sha256sum: checking SHA256SUMS.manifest:\nupdater.bin: FAILED\npolicy.pdf.txt: OK\nbackup.sql.txt: OK\nsha256sum: WARNING: 1 computed checksum did NOT match";
            } else if (target === 'updater.bin') {
                output = "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4  updater.bin";
            } else if (target === 'policy.pdf.txt') {
                output = "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5  policy.pdf.txt";
            } else if (target === 'backup.sql.txt') {
                output = "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0  backup.sql.txt";
            } else {
                output = `sha256sum: ${target}: No such virtual file in laboratory workspace`;
            }
            if (!commandsUsed.includes('sha256sum')) setCommandsUsed([...commandsUsed, 'sha256sum']);
        } else if (cmd.startsWith('file')) {
            const parts = cmd.split(' ');
            const target = parts[1];
            if (target === 'updater.bin') {
                output = "updater.bin: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked";
            } else if (target === 'policy.pdf.txt') {
                output = "policy.pdf.txt: ASCII text, with CRLF line terminators";
            } else {
                output = `${target || 'target'}: directory or data file`;
            }
            if (!commandsUsed.includes('file')) setCommandsUsed([...commandsUsed, 'file']);
        } else if (cmd === 'ls' || cmd === 'ls -la' || cmd === 'ls -l') {
            output = "-rw-r--r-- 1 analyst analyst 1048576 Oct 11 10:15 updater.bin\n-rw-r--r-- 1 analyst analyst   40960 Oct 11 10:15 policy.pdf.txt\n-rw-r--r-- 1 analyst analyst  524288 Oct 11 10:15 backup.sql.txt\n-rw-r--r-- 1 analyst analyst     256 Oct 11 10:15 SHA256SUMS.manifest";
            if (!commandsUsed.includes('ls')) setCommandsUsed([...commandsUsed, 'ls']);
        } else {
            output = `bash: ${cmd}: safe sandbox allow-list permits: sha256sum, file, ls, cat, clear`;
        }

        setTerminalHistory((prev) => [...prev, { cmd, out: output }]);
        setCommandInput('');
    };

    const getCurrentState = () => ({
        commands_used: commandsUsed,
        ran_sha256sum: true,
        ran_ls: true,
        ran_file: true,
        digest_comparison: digestComparison,
        interpretation,
        chain_of_custody: chainOfCustody,
        recommended_action: recommendedAction,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Integrity verification draft saved.');
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
                <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Integrity Verification Console & Terminal Engine
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {saveMessage && (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            {saveMessage}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => handleAutosave(false)}
                        disabled={isSaving}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? 'Saving...' : 'Autosave'}
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                        title="Reset Virtual Scenario State"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Split Screen: Terminal on Top, Manifest Comparison Below */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Simulated CLI Sandbox (7 Cols) */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 font-mono text-xs text-slate-200 shadow-lg">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-emerald-400 text-[11px] flex items-center gap-2">
                            <TerminalIcon className="w-3.5 h-3.5" />
                            analyst@kali:~/evidence_workspace$
                        </span>
                        <span className="text-[10px] text-slate-500">sha256sum simulator</span>
                    </div>

                    <div className="h-48 overflow-y-auto space-y-2 text-[11px] leading-relaxed">
                        {terminalHistory.map((item, idx) => (
                            <div key={idx} className="space-y-0.5">
                                <div className="text-blue-400">$ {item.cmd}</div>
                                <div className="text-slate-300 whitespace-pre-line">{item.out}</div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleRunTerminal} className="flex gap-2 pt-2 border-t border-slate-800">
                        <span className="text-emerald-400">$</span>
                        <input
                            type="text"
                            className="w-full bg-transparent border-0 text-slate-100 text-xs focus:ring-0 p-0 font-mono"
                            placeholder="Try: sha256sum updater.bin or sha256sum SHA256SUMS.manifest"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                        />
                        <button type="submit" className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase">
                            Run
                        </button>
                    </form>
                </div>

                {/* Vendor Hash Manifest Card (5 Cols) */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                        Official Publisher Manifest (`SHA256SUMS`)
                    </span>
                    <div className="space-y-2 text-xs">
                        {manifest.map((item) => (
                            <div
                                key={item.filename}
                                className={`p-3 rounded-xl border ${
                                    item.status === 'mismatch'
                                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
                                        : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                                        {item.filename}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                        item.status === 'mismatch'
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-emerald-600 text-white'
                                    }`}>
                                        {item.status === 'mismatch' ? 'TAMPERED / MISMATCH' : 'AUTHENTIC MATCH'}
                                    </span>
                                </div>
                                <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 break-all">
                                    Expected: {item.expected_hash.slice(0, 32)}...
                                </div>
                                <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all">
                                    Observed: {item.actual_computed.slice(0, 32)}...
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Evidence & Chain of Custody Submission */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Chain of Custody & Interpretation (Rubric: 100 Points)
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        Document Cryptographic Digest Results
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <InputLabel value="Which virtual file showed a cryptographic hash mismatch?" />
                        <select
                            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs p-2.5 font-mono"
                            value={digestComparison.mismatched_file}
                            onChange={(e) => setDigestComparison({ ...digestComparison, mismatched_file: e.target.value })}
                        >
                            <option value="updater.bin">updater.bin (Checksum differs from manifest)</option>
                            <option value="policy.pdf.txt">policy.pdf.txt (Digest matches)</option>
                            <option value="backup.sql.txt">backup.sql.txt (Digest matches)</option>
                        </select>
                    </div>

                    <div>
                        <InputLabel value="How many files matched the vendor manifest exactly?" />
                        <TextInput
                            type="number"
                            className="mt-1 w-full text-xs font-mono"
                            value={digestComparison.matched_files_count}
                            onChange={(e) => setDigestComparison({ ...digestComparison, matched_files_count: Number(e.target.value) })}
                        />
                    </div>
                </div>

                <div>
                    <InputLabel value="Forensic Interpretation (What does a hash collision or mismatch prove?):" />
                    <textarea
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3"
                        value={interpretation}
                        onChange={(e) => setInterpretation(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <InputLabel value="Chain-of-Custody File" />
                        <TextInput
                            className="mt-1 w-full text-xs font-mono"
                            value={chainOfCustody.file_name}
                            onChange={(e) => setChainOfCustody({ ...chainOfCustody, file_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <InputLabel value="Forensic Handler" />
                        <TextInput
                            className="mt-1 w-full text-xs"
                            value={chainOfCustody.handler}
                            onChange={(e) => setChainOfCustody({ ...chainOfCustody, handler: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <InputLabel value="Recommended Immediate Action" />
                        <TextInput
                            className="mt-1 w-full text-xs"
                            value={recommendedAction}
                            onChange={(e) => setRecommendedAction(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => handleAutosave(false)}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Save Draft
                    </button>
                    <PrimaryButton type="submit" disabled={isSubmitting}>
                        <Send className="w-3.5 h-3.5 me-1.5" />
                        {isSubmitting ? 'Evaluating Rubric...' : 'Submit Laboratory 6 for Evaluation'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
