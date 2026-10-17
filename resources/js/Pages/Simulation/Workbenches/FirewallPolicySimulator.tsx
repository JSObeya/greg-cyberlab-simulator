import React, { useState } from 'react';
import axios from 'axios';
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    Save,
    RotateCcw,
    Send,
    Check,
    HelpCircle,
    Sliders,
    Network
} from 'lucide-react';
import NetworkTopologyCanvas from '@/Components/Simulation/NetworkTopologyCanvas';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface FirewallPolicySimulatorProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function FirewallPolicySimulator({
    laboratory,
    attempt,
    onReset,
}: FirewallPolicySimulatorProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'topology' | 'rules' | 'unsafe' | 'corrected' | 'testing'>('topology');

    // 1. Traffic Evaluation
    const [trafficEvaluation, setTrafficEvaluation] = useState({
        allow_http_inbound: initialState.traffic_evaluation?.allow_http_inbound ?? true,
        drop_telnet_inbound: initialState.traffic_evaluation?.drop_telnet_inbound ?? true,
        default_deny_enforced: initialState.traffic_evaluation?.default_deny_enforced ?? true,
    });

    // 2. Unsafe Rule Identification
    const [unsafeRules, setUnsafeRules] = useState({
        rule_exposed_rdp: initialState.unsafe_rules?.rule_exposed_rdp ?? true,
        rule_permissive_telnet: initialState.unsafe_rules?.rule_permissive_telnet ?? true,
        flagged_rule_ids: initialState.unsafe_rules?.flagged_rule_ids || ['rule_3389_all', 'rule_23_all'],
    });

    // 3. Corrected Policy
    const [correctedPolicy, setCorrectedPolicy] = useState({
        rdp_restricted_to_vpn: initialState.corrected_policy?.rdp_restricted_to_vpn || 'Restrict Port 3389 (RDP) to source subnet 10.10.10.0/24 (Management VPN only).',
        inbound_default_drop: initialState.corrected_policy?.inbound_default_drop || 'Default Deny on WAN interface; drop all unsolicited inbound traffic.',
    });

    // 4. Policy Tests & Change Record
    const [policyTests, setPolicyTests] = useState<string[]>(
        initialState.policy_tests || ['Test Inbound Port 80 -> ALLOW', 'Test Inbound Port 3389 from WAN -> DROP', 'Test Inbound Port 23 -> DROP']
    );

    const [changeRecord, setChangeRecord] = useState(
        initialState.change_record ||
        'FIREWALL CHANGE TICKET #FW-2026-08: Removed permissive WAN 0.0.0.0/0 rules for Port 3389 and 23. Implemented default-deny and restricted management ports to authenticated VPN.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        traffic_evaluation: trafficEvaluation,
        unsafe_rules: unsafeRules,
        corrected_policy: correctedPolicy,
        policy_tests: policyTests,
        change_record: changeRecord,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Firewall policy draft saved.');
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
                        onClick={() => setActiveTab('topology')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'topology'
                                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-black'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:text-cyan-400'
                        }`}
                    >
                        <Network className="w-3.5 h-3.5 text-cyan-400" />
                        Interactive Topology & HUD (Visual Lab)
                    </button>

                    <button
                        onClick={() => setActiveTab('rules')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'rules'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Network className="w-3.5 h-3.5" />
                        1. Active Rules Table (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('unsafe')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'unsafe'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        2. Unsafe Exposure (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('corrected')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'corrected'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Sliders className="w-3.5 h-3.5" />
                        3. Hardened Policy (30 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('testing')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'testing'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        4. Testing & Audit (20 pts)
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

            {/* Tab 0: Interactive Topology & HUD */}
            {activeTab === 'topology' && (
                <div className="space-y-4">
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-3">
                            <span className="p-2 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold text-xs uppercase font-mono">
                                Lab 10 Arena
                            </span>
                            <div>
                                <p className="font-bold text-slate-100 text-sm">Visual Defense Topology & Firewall Policy Remediation</p>
                                <p className="text-slate-400 text-xs">
                                    Use the <strong>Virtual Diagnostic HUD</strong> (Wireshark sniffer, Nmap probe, CVE lens) and <strong>Attack Simulator</strong> to audit the network. Click <strong>Action</strong> on Rule #2 to harden the perimeter.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setActiveTab('rules')}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 shrink-0"
                        >
                            View Rules Table <Sliders className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <NetworkTopologyCanvas
                        laboratory={laboratory}
                        attempt={attempt}
                        onRemediateRule={(ruleId, newAction) => {
                            if (ruleId === 2) {
                                setUnsafeRules((prev) => ({
                                    ...prev,
                                    rule_exposed_rdp: newAction === 'ALLOW',
                                }));
                                handleAutosave(true);
                            }
                        }}
                    />
                </div>
            )}

            {/* Tab 1: Rules Table */}
            {activeTab === 'rules' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: Firewall Ruleset Evaluation (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Review the ordered stateful inspection table. Note that rules execute from top to bottom (first match wins).
                        </p>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-mono">
                                <tr>
                                    <th className="p-3">Order</th>
                                    <th className="p-3">Source</th>
                                    <th className="p-3">Destination</th>
                                    <th className="p-3">Port / Protocol</th>
                                    <th className="p-3">Action</th>
                                    <th className="p-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-slate-700 dark:text-slate-300">
                                <tr>
                                    <td className="p-3 font-bold">10</td>
                                    <td className="p-3">0.0.0.0/0 (WAN)</td>
                                    <td className="p-3">10.10.10.50</td>
                                    <td className="p-3">TCP 80, 443</td>
                                    <td className="p-3 text-emerald-600 font-bold">ALLOW</td>
                                    <td className="p-3 text-slate-400">Web Traffic</td>
                                </tr>
                                <tr className="bg-red-50/50 dark:bg-red-950/20">
                                    <td className="p-3 font-bold text-red-600">20</td>
                                    <td className="p-3 text-red-600">0.0.0.0/0 (WAN)</td>
                                    <td className="p-3">10.10.10.10 (DC)</td>
                                    <td className="p-3 font-bold text-red-600">TCP 3389 (RDP)</td>
                                    <td className="p-3 text-emerald-600 font-bold">ALLOW</td>
                                    <td className="p-3 text-red-600 font-bold">CRITICAL EXPOSURE</td>
                                </tr>
                                <tr className="bg-red-50/50 dark:bg-red-950/20">
                                    <td className="p-3 font-bold text-red-600">30</td>
                                    <td className="p-3 text-red-600">0.0.0.0/0 (WAN)</td>
                                    <td className="p-3">10.10.10.50</td>
                                    <td className="p-3 font-bold text-red-600">TCP 23 (Telnet)</td>
                                    <td className="p-3 text-emerald-600 font-bold">ALLOW</td>
                                    <td className="p-3 text-red-600 font-bold">CLEARTEXT EXPOSURE</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-bold">99</td>
                                    <td className="p-3">Any</td>
                                    <td className="p-3">Any</td>
                                    <td className="p-3">Any</td>
                                    <td className="p-3 text-red-600 font-bold">DROP</td>
                                    <td className="p-3 text-slate-400">Default Deny</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Unsafe Exposure */}
            {activeTab === 'unsafe' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: Flag Dangerous Inbound Rules (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Identify which firewall rules directly expose administrative or unencrypted management ports to the WAN.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={unsafeRules.rule_exposed_rdp}
                                onChange={(e) => setUnsafeRules({ ...unsafeRules, rule_exposed_rdp: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Rule 20 (TCP 3389 RDP Allowed from WAN 0.0.0.0/0):</strong>
                                <p className="text-red-700 dark:text-red-300">Exposes Domain Controller directly to remote desktop brute-force and BlueKeep exploits.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={unsafeRules.rule_permissive_telnet}
                                onChange={(e) => setUnsafeRules({ ...unsafeRules, rule_permissive_telnet: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Rule 30 (TCP 23 Telnet Allowed from WAN 0.0.0.0/0):</strong>
                                <p className="text-red-700 dark:text-red-300">Unencrypted cleartext protocol subject to credential sniffing and MITM interception.</p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab 3: Hardened Policy */}
            {activeTab === 'corrected' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Policy Remediation & Least Privilege (30 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Specify hardened rule definitions following the principle of least privilege.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Hardened RDP Management Access Policy" />
                            <TextInput
                                value={correctedPolicy.rdp_restricted_to_vpn}
                                onChange={(e) => setCorrectedPolicy({ ...correctedPolicy, rdp_restricted_to_vpn: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Default Deny & Drop Enforcement" />
                            <TextInput
                                value={correctedPolicy.inbound_default_drop}
                                onChange={(e) => setCorrectedPolicy({ ...correctedPolicy, inbound_default_drop: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Testing & Audit */}
            {activeTab === 'testing' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4 & 5: Verification Tests & Change Record (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Document validation test cases and the change authorization record.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">Validation Test Suite (Executed):</p>
                            {policyTests.map((t, idx) => (
                                <p key={idx} className="font-mono text-emerald-600 dark:text-emerald-400">✓ {t}</p>
                            ))}
                        </div>

                        <div>
                            <InputLabel value="Operational Change Ticket Record" />
                            <textarea
                                value={changeRecord}
                                onChange={(e) => setChangeRecord(e.target.value)}
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
                        Submit hardened firewall rules and testing records for 100-point rubric grading (Pass mark: 70%).
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
