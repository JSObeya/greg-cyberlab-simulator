import React, { useState } from 'react';
import axios from 'axios';
import {
    Search,
    Shield,
    Server,
    AlertTriangle,
    Save,
    RotateCcw,
    Send,
    Check,
    HelpCircle
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface AuthorisedDiscoveryConsoleProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function AuthorisedDiscoveryConsole({
    laboratory,
    attempt,
    onReset,
}: AuthorisedDiscoveryConsoleProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'scope' | 'discovery' | 'services' | 'vulnerabilities'>('scope');

    // 1. Scope Compliance
    const [scopeCompliance, setScopeCompliance] = useState({
        in_scope_target_verified: initialState.scope_compliance?.in_scope_target_verified || true,
        out_of_scope_avoided: initialState.scope_compliance?.out_of_scope_avoided || true,
    });

    // 2. Discovery Interpretation
    const [discoveryInterpretation, setDiscoveryInterpretation] = useState({
        live_hosts_count: initialState.discovery_interpretation?.live_hosts_count || 1,
        latency_or_status: initialState.discovery_interpretation?.latency_or_status || 'Host is up (0.00042s latency); 0% packet loss via ping.',
    });

    // 3. Service Inventory
    const [serviceInventory, setServiceInventory] = useState({
        ftp_service: initialState.service_inventory?.ftp_service || 'vsftpd 2.3.4 (Port 21/tcp)',
        http_service: initialState.service_inventory?.http_service || 'Apache httpd 2.4.49 (Port 80/tcp)',
        ssh_service: initialState.service_inventory?.ssh_service || 'OpenSSH 8.9p1 Ubuntu (Port 22/tcp)',
    });

    // 4. Unexpected Exposure & Escalation
    const [unexpectedExposure, setUnexpectedExposure] = useState({
        backdoor_version_identified: initialState.unexpected_exposure?.backdoor_version_identified || true,
        ftp_vulnerability_noted: initialState.unexpected_exposure?.ftp_vulnerability_noted || 'vsftpd 2.3.4 contains a notorious backdoor vulnerability (CVE-2011-2523) triggered via smiley-face string.',
    });

    const [escalationNote, setEscalationNote] = useState(
        initialState.escalation_note ||
        'CRITICAL ESCALATION: Target host 10.10.10.50 is running backdoored vsftpd 2.3.4 and vulnerable Apache 2.4.49 path traversal. Disconnect from network and patch immediately.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        scope_compliance: scopeCompliance,
        discovery_interpretation: discoveryInterpretation,
        service_inventory: serviceInventory,
        unexpected_exposure: unexpectedExposure,
        escalation_note: escalationNote,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Discovery draft saved.');
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
                        onClick={() => setActiveTab('scope')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'scope'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        1. Scope Compliance (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('discovery')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'discovery'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Search className="w-3.5 h-3.5" />
                        2. Discovery & Ping (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'services'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Server className="w-3.5 h-3.5" />
                        3. Service Inventory (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('vulnerabilities')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'vulnerabilities'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        4. Exposure & Escalation (30 pts)
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

            {/* Tab 1: Scope */}
            {activeTab === 'scope' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: Authorised Scope Validation (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Verify that discovery scans are strictly constrained to authorized training subnets.
                        </p>
                    </div>

                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 space-y-1">
                        <p className="font-bold">Authorised Engagement Window & Targets:</p>
                        <p>Target Server: <strong>10.10.10.50</strong> (Department Server)</p>
                        <p>Authorised Subnet: <strong>10.10.10.0/24</strong> | Prohibited: Public WAN / Hostinger server host</p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scopeCompliance.in_scope_target_verified}
                                onChange={(e) => setScopeCompliance({ ...scopeCompliance, in_scope_target_verified: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>Target 10.10.10.50 Confirmed In-Scope:</strong> Verified against the engagement rules of engagement.
                            </span>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scopeCompliance.out_of_scope_avoided}
                                onChange={(e) => setScopeCompliance({ ...scopeCompliance, out_of_scope_avoided: e.target.checked })}
                                className="rounded text-blue-600 focus:ring-0"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200">
                                <strong>Out-of-Scope Targets Avoided:</strong> No external internet probing or production infrastructure scanning initiated.
                            </span>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab 2: Discovery */}
            {activeTab === 'discovery' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: Discovery & Ping Verification (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Interpret ICMP echo results to confirm host liveness.
                        </p>
                    </div>

                    <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">
                        <p className="text-slate-400 font-bold mb-2"># ping -c 3 10.10.10.50</p>
                        <p>PING 10.10.10.50 (10.10.10.50) 56(84) bytes of data.</p>
                        <p>64 bytes from 10.10.10.50: icmp_seq=1 ttl=64 time=0.412 ms</p>
                        <p>64 bytes from 10.10.10.50: icmp_seq=2 ttl=64 time=0.388 ms</p>
                        <p>64 bytes from 10.10.10.50: icmp_seq=3 ttl=64 time=0.405 ms</p>
                        <p className="text-emerald-400">--- 10.10.10.50 ping statistics ---</p>
                        <p className="text-emerald-400">3 packets transmitted, 3 received, 0% packet loss, time 2003ms</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Live Hosts Count Discovered" />
                            <TextInput
                                type="number"
                                value={discoveryInterpretation.live_hosts_count}
                                onChange={(e) => setDiscoveryInterpretation({ ...discoveryInterpretation, live_hosts_count: parseInt(e.target.value) || 1 })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                        <div>
                            <InputLabel value="Latency & Packet Loss Summary" />
                            <TextInput
                                value={discoveryInterpretation.latency_or_status}
                                onChange={(e) => setDiscoveryInterpretation({ ...discoveryInterpretation, latency_or_status: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Services */}
            {activeTab === 'services' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Service Fingerprinting Inventory (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Examine simulated `nmap -sV` banner detection on the target host.
                        </p>
                    </div>

                    <div className="bg-slate-950 text-slate-200 p-4 rounded-xl font-mono text-xs border border-slate-800">
                        <p className="text-slate-400 font-bold mb-2"># nmap -sV 10.10.10.50</p>
                        <p>PORT     STATE SERVICE VERSION</p>
                        <p className="text-red-400">21/tcp   open  ftp     vsftpd 2.3.4</p>
                        <p className="text-yellow-400">80/tcp   open  http    Apache httpd 2.4.49 ((Unix))</p>
                        <p className="text-blue-400">22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.6</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="FTP Service & Version (Port 21)" />
                            <TextInput
                                value={serviceInventory.ftp_service}
                                onChange={(e) => setServiceInventory({ ...serviceInventory, ftp_service: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="HTTP Web Server & Version (Port 80)" />
                            <TextInput
                                value={serviceInventory.http_service}
                                onChange={(e) => setServiceInventory({ ...serviceInventory, http_service: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="SSH Server & Version (Port 22)" />
                            <TextInput
                                value={serviceInventory.ssh_service}
                                onChange={(e) => setServiceInventory({ ...serviceInventory, ssh_service: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Vulnerabilities */}
            {activeTab === 'vulnerabilities' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4 & 5: Exposure Identification & Escalation (30 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Flag dangerous legacy software packages and document immediate triage response.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Vulnerability Analysis (vsftpd 2.3.4 / Apache 2.4.49)" />
                            <TextInput
                                value={unexpectedExposure.ftp_vulnerability_noted}
                                onChange={(e) => setUnexpectedExposure({ ...unexpectedExposure, ftp_vulnerability_noted: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Urgent Analyst Escalation Note" />
                            <textarea
                                value={escalationNote}
                                onChange={(e) => setEscalationNote(e.target.value)}
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
                        Submit service inventory and escalation notes for 100-point rubric grading (Pass mark: 70%).
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
