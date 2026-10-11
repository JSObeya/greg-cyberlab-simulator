import React, { useState } from 'react';
import axios from 'axios';
import {
    Network,
    Server,
    Shield,
    Activity,
    Save,
    RotateCcw,
    Send,
    Check,
    HelpCircle,
    ArrowRight
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface NetworkFoundationsConsoleProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function NetworkFoundationsConsole({
    laboratory,
    attempt,
    onReset,
}: NetworkFoundationsConsoleProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'addressing' | 'protocols' | 'sockets' | 'exposure'>('addressing');

    // 1. Addressing Analysis
    const [addressing, setAddressing] = useState({
        workstation_ip: initialState.addressing_analysis?.workstation_ip || '10.10.10.15',
        subnet_mask: initialState.addressing_analysis?.subnet_mask || '/24',
        network_range: initialState.addressing_analysis?.network_range || '10.10.10.1 to 10.10.10.254',
    });

    // 2. Protocol Mappings
    const [protocolMappings, setProtocolMappings] = useState<Record<string, string>>(
        initialState.protocol_mappings || {
            '22': 'ssh',
            '53': 'dns',
            '80': 'http',
            '443': 'https',
        }
    );

    // 3. Command Interpretation
    const [cmdInterpretation, setCmdInterpretation] = useState({
        ssh_listening_detected: initialState.command_interpretation?.ssh_listening_detected || true,
        mysql_local_binding_detected: initialState.command_interpretation?.mysql_local_binding_detected || true,
    });

    // 4. Exposure Decisions
    const [exposureDecisions, setExposureDecisions] = useState({
        external_ssh_policy: initialState.exposure_decisions?.external_ssh_policy || 'Restrict SSH access exclusively to internal bastion host or management VPN.',
        mysql_localhost_only: initialState.exposure_decisions?.mysql_localhost_only || 'Bind MySQL strictly to 127.0.0.1; block external network interfaces.',
    });

    // 5. Technical Explanation
    const [techExplanation, setTechExplanation] = useState(
        initialState.technical_explanation ||
        'Unnecessary listening sockets expand the attack surface. Services must be bound to loopback or protected behind network access control lists.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        addressing_analysis: addressing,
        protocol_mappings: protocolMappings,
        command_interpretation: cmdInterpretation,
        exposure_decisions: exposureDecisions,
        technical_explanation: techExplanation,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Network draft saved.');
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
                        onClick={() => setActiveTab('addressing')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'addressing'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Network className="w-3.5 h-3.5" />
                        1. IP Addressing (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('protocols')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'protocols'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Server className="w-3.5 h-3.5" />
                        2. Port Mapping (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('sockets')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'sockets'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        3. Socket Audit (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('exposure')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'exposure'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        4. Remediation (35 pts)
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

            {/* Tab 1: IP Addressing */}
            {activeTab === 'addressing' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: IP Addressing & Subnet Analysis (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Examine simulated `ip addr` outputs to determine adapter configuration and subnet boundary.
                        </p>
                    </div>

                    <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">
                        <p className="text-slate-400 font-bold mb-2"># ip addr show eth0</p>
                        <p>2: eth0: &lt;BROADCAST,MULTICAST,UP,LOWER_UP&gt; mtu 1500 qdisc fq_codel state UP</p>
                        <p className="text-emerald-400">    inet 10.10.10.15/24 brd 10.10.10.255 scope global dynamic eth0</p>
                        <p>    valid_lft 86350sec preferred_lft 86350sec</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <InputLabel value="Workstation IP Address" />
                            <TextInput
                                value={addressing.workstation_ip}
                                onChange={(e) => setAddressing({ ...addressing, workstation_ip: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                        <div>
                            <InputLabel value="Subnet Mask (CIDR)" />
                            <TextInput
                                value={addressing.subnet_mask}
                                onChange={(e) => setAddressing({ ...addressing, subnet_mask: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                        <div>
                            <InputLabel value="Usable Host Range" />
                            <TextInput
                                value={addressing.network_range}
                                onChange={(e) => setAddressing({ ...addressing, network_range: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Protocol Mappings */}
            {activeTab === 'protocols' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: Standard Port & Service Mapping (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Map well-known IANA port numbers to their underlying protocols and transport layers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { port: '22', name: 'Port 22', default: 'ssh', desc: 'Secure Shell remote administration' },
                            { port: '53', name: 'Port 53', default: 'dns', desc: 'Domain Name System name resolution' },
                            { port: '80', name: 'Port 80', default: 'http', desc: 'HyperText Transfer Protocol (Cleartext)' },
                            { port: '443', name: 'Port 443', default: 'https', desc: 'HTTP over TLS/SSL encryption' },
                        ].map((item) => (
                            <div key={item.port} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900 dark:text-white text-xs">{item.name}</span>
                                    <span className="text-[11px] text-slate-500 font-mono">{item.desc}</span>
                                </div>
                                <select
                                    value={protocolMappings[item.port] || item.default}
                                    onChange={(e) => setProtocolMappings({ ...protocolMappings, [item.port]: e.target.value })}
                                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-2"
                                >
                                    <option value="ssh">SSH (Secure Shell)</option>
                                    <option value="dns">DNS (Domain Name System)</option>
                                    <option value="http">HTTP (HyperText Transfer Protocol)</option>
                                    <option value="https">HTTPS (HTTP Secure)</option>
                                    <option value="mysql">MySQL Database</option>
                                </select>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 3: Socket Audit */}
            {activeTab === 'sockets' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Listening Sockets Audit (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Analyze `ss -tulpn` output to determine exposed network services.
                        </p>
                    </div>

                    <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">
                        <p className="text-slate-400 font-bold mb-2"># ss -tulpn</p>
                        <p>Netid  State   Recv-Q  Send-Q   Local Address:Port   Peer Address:Port  Process</p>
                        <p className="text-yellow-400">tcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=842,fd=3))</p>
                        <p className="text-emerald-400">tcp    LISTEN  0       128      127.0.0.1:3306       0.0.0.0:*          users:(("mysqld",pid=1024,fd=12))</p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cmdInterpretation.ssh_listening_detected}
                                onChange={(e) => setCmdInterpretation({ ...cmdInterpretation, ssh_listening_detected: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>SSH Daemon Identified:</strong> Listening on 0.0.0.0:22 across all physical interfaces.
                            </span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cmdInterpretation.mysql_local_binding_detected}
                                onChange={(e) => setCmdInterpretation({ ...cmdInterpretation, mysql_local_binding_detected: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>MySQL Bound to Localhost:</strong> Listening strictly on 127.0.0.1:3306, safe from external probes.
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab 4: Remediation */}
            {activeTab === 'exposure' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4 & 5: Exposure Mitigation & Rationale (35 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Establish defensive isolation policies to safeguard listening services.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="External SSH Exposure Policy" />
                            <TextInput
                                value={exposureDecisions.external_ssh_policy}
                                onChange={(e) => setExposureDecisions({ ...exposureDecisions, external_ssh_policy: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Database Local Binding Policy" />
                            <TextInput
                                value={exposureDecisions.mysql_localhost_only}
                                onChange={(e) => setExposureDecisions({ ...exposureDecisions, mysql_localhost_only: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Technical Justification" />
                            <textarea
                                value={techExplanation}
                                onChange={(e) => setTechExplanation(e.target.value)}
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
                        Submit network findings and exposure decisions for 100-point rubric grading (Pass mark: 70%).
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
