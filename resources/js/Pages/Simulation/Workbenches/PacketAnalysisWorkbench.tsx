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
    FileSpreadsheet,
    Lock
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface PacketAnalysisWorkbenchProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function PacketAnalysisWorkbench({
    laboratory,
    attempt,
    onReset,
}: PacketAnalysisWorkbenchProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'stream' | 'handshake' | 'leak' | 'remediation'>('stream');

    const config = laboratory.workbench_config || {};
    const samplePackets = config.packets || [
        { no: 1, time: '0.000', src: '10.10.10.20', dst: '10.10.10.80', proto: 'TCP', length: 74, info: '54321 → 80 [SYN] Seq=0 Win=64240' },
        { no: 2, time: '0.002', src: '10.10.10.80', dst: '10.10.10.20', proto: 'TCP', length: 74, info: '80 → 54321 [SYN, ACK] Seq=0 Ack=1 Win=65160' },
        { no: 3, time: '0.003', src: '10.10.10.20', dst: '10.10.10.80', proto: 'TCP', length: 54, info: '54321 → 80 [ACK] Seq=1 Ack=1' },
        { no: 4, time: '0.015', src: '10.10.10.20', dst: '10.10.10.80', proto: 'HTTP', length: 420, info: 'POST /api/login HTTP/1.1 (application/x-www-form-urlencoded: user=admin&pass=AdminSecret2026!)' },
    ];

    // 1. Frame Filtering
    const [frameFilter, setFrameFilter] = useState({
        target_frame_no: initialState.frame_filtering?.target_frame_no || 4,
        protocol_filtered: initialState.frame_filtering?.protocol_filtered || 'HTTP',
    });

    // 2. Handshake Sequence
    const [handshakeSeq, setHandshakeSeq] = useState({
        syn_detected: initialState.handshake_sequence?.syn_detected ?? true,
        syn_ack_detected: initialState.handshake_sequence?.syn_ack_detected ?? true,
        ack_detected: initialState.handshake_sequence?.ack_detected ?? true,
    });

    // 3. Intercepted Credentials
    const [interceptedCreds, setInterceptedCreds] = useState({
        username: initialState.intercepted_credentials?.username || 'admin',
        password: initialState.intercepted_credentials?.password || 'AdminSecret2026!',
    });

    // 4. Evidence Citation
    const [evidenceCitation, setEvidenceCitation] = useState(
        initialState.evidence_citation ||
        'Frame #4 (Time 0.015s, TCP port 80): Plaintext HTTP POST payload containing user=admin&pass=AdminSecret2026!.'
    );

    // 5. Remediation Strategy
    const [remediationStrategy, setRemediationStrategy] = useState(
        initialState.remediation_strategy ||
        'Enforce HTTPS / TLS 1.3 across all authentication endpoints. Redirect HTTP port 80 traffic to HTTPS port 443; reject cleartext credentials.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        frame_filtering: frameFilter,
        handshake_sequence: handshakeSeq,
        intercepted_credentials: interceptedCreds,
        evidence_citation: evidenceCitation,
        remediation_strategy: remediationStrategy,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Packet analysis draft saved.');
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
                        onClick={() => setActiveTab('stream')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'stream'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        Captured Frames
                    </button>
                    <button
                        onClick={() => setActiveTab('handshake')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'handshake'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        1. TCP Handshake (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('leak')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'leak'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" />
                        2. Credential Leak (45 pts)
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
                        3. TLS Remediation (30 pts)
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

            {/* Tab 1: Frame Stream */}
            {activeTab === 'stream' && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-xs">
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
                            {samplePackets.map((pkt: any) => (
                                <tr key={pkt.no} className={pkt.no === 4 ? 'bg-red-50/60 dark:bg-red-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}>
                                    <td className="py-2 px-4 font-bold">{pkt.no}</td>
                                    <td className="py-2 px-4 text-slate-500">{pkt.time}</td>
                                    <td className="py-2 px-4">{pkt.src}</td>
                                    <td className="py-2 px-4">{pkt.dst}</td>
                                    <td className="py-2 px-4 font-bold text-blue-600 dark:text-blue-400">{pkt.proto}</td>
                                    <td className={pkt.no === 4 ? 'py-2 px-4 font-bold text-red-600 dark:text-red-400' : 'py-2 px-4 text-slate-700 dark:text-slate-300'}>
                                        {pkt.info}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 2: TCP Handshake */}
            {activeTab === 'handshake' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: TCP 3-Way Handshake Reconstruction (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Verify the three-way connection establishment frames between client and server.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={handshakeSeq.syn_detected}
                                onChange={(e) => setHandshakeSeq({ ...handshakeSeq, syn_detected: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>Frame 1 [SYN]:</strong> Client 10.10.10.20:54321 initiates connection to server port 80.
                            </span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={handshakeSeq.syn_ack_detected}
                                onChange={(e) => setHandshakeSeq({ ...handshakeSeq, syn_ack_detected: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>Frame 2 [SYN, ACK]:</strong> Server 10.10.10.80 acknowledges and synchronizes sequence.
                            </span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={handshakeSeq.ack_detected}
                                onChange={(e) => setHandshakeSeq({ ...handshakeSeq, ack_detected: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>Frame 3 [ACK]:</strong> Client completes handshake; socket moves to ESTABLISHED state.
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab 3: Credential Leak */}
            {activeTab === 'leak' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: Plaintext Credential Exposure (45 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Extract cleartext credentials transmitted inside HTTP POST payload frame #4.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Intercepted Username" />
                            <TextInput
                                value={interceptedCreds.username}
                                onChange={(e) => setInterceptedCreds({ ...interceptedCreds, username: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Intercepted Plaintext Password" />
                            <TextInput
                                value={interceptedCreds.password}
                                onChange={(e) => setInterceptedCreds({ ...interceptedCreds, password: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Formal Evidence Citation (Frame & Timestamp)" />
                        <TextInput
                            value={evidenceCitation}
                            onChange={(e) => setEvidenceCitation(e.target.value)}
                            className="w-full text-xs mt-1"
                        />
                    </div>
                </div>
            )}

            {/* Tab 4: TLS Remediation */}
            {activeTab === 'remediation' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Transport Layer Security Enforcement (30 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Document transport security mandates to eliminate cleartext interception.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Remediation Strategy & Transport Security Mandate" />
                            <textarea
                                value={remediationStrategy}
                                onChange={(e) => setRemediationStrategy(e.target.value)}
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
                        Submit packet frame citations and credentials for 100-point rubric grading (Pass mark: 70%).
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
