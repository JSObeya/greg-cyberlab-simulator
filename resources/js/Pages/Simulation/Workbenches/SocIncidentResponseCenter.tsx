import React, { useState } from 'react';
import axios from 'axios';
import {
    ShieldAlert,
    Activity,
    Lock,
    Save,
    RotateCcw,
    Send,
    Check,
    AlertTriangle,
    Clock,
    FileText,
    Server,
    Shield
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface SocIncidentResponseCenterProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function SocIncidentResponseCenter({
    laboratory,
    attempt,
    onReset,
}: SocIncidentResponseCenterProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'queue' | 'triage' | 'timeline' | 'containment' | 'report'>('queue');

    const config = laboratory.workbench_config || {};
    const sampleAlerts = config.alerts || [
        { id: 'AL-1092', severity: 'critical', title: 'Suspicious PowerShell Download & Execution', asset: 'WS-FINANCE-04', user: 'bursar', details: 'PowerShell invoked with -EncodedCommand downloading dropper from external source.' },
        { id: 'AL-1088', severity: 'high', title: 'Repeated Failed SSH Logins Followed by Success', asset: 'SRV-BASTION-01', user: 'deploy', details: '450 failed logins from 192.168.50.120 followed by successful authentication.' },
        { id: 'AL-1075', severity: 'low', title: 'Routine Antivirus Signature Update', asset: 'WS-CADET-12', user: 'system', details: 'Daily definition database synchronized successfully.' },
    ];

    // 1. Alert Triage
    const [alertTriage, setAlertTriage] = useState({
        critical_alert_isolated: initialState.alert_triage?.critical_alert_isolated ?? true,
        false_positive_eliminated: initialState.alert_triage?.false_positive_eliminated ?? true,
    });

    // 2. Scope & Severity
    const [scopeAndSeverity, setScopeAndSeverity] = useState({
        compromised_host_identified: initialState.scope_and_severity?.compromised_host_identified || 'SRV-BASTION-01 and WS-FINANCE-04',
        severity_rating_assigned: initialState.scope_and_severity?.severity_rating_assigned || 'P1 - Critical Security Incident',
    });

    // 3. Incident Timeline
    const [incidentTimeline, setIncidentTimeline] = useState<string[]>(
        initialState.incident_timeline || [
            'T0: Attacker initiates reconnaissance against training subnet',
            'T1: Brute-force credential stuffing against bastion SSH daemon',
            'T2: Unauthorized access gained to deploy account and payload execution attempted',
            'T3: SOC detection triggers AL-1092 and AL-1088 security alerts'
        ]
    );

    // 4. Containment Actions
    const [containmentActions, setContainmentActions] = useState({
        host_network_isolated: initialState.containment_actions?.host_network_isolated ?? true,
        compromised_account_disabled: initialState.containment_actions?.compromised_account_disabled ?? true,
        firewall_block_attacker_ip: initialState.containment_actions?.firewall_block_attacker_ip ?? true,
    });

    // 5. Evidence Handling & Preservation
    const [evidencePreservation, setEvidencePreservation] = useState(
        initialState.evidence_preservation ||
        'Preserved volatile RAM capture; exported cryptographic SHA-256 hashes of /var/log/auth.log; maintained chain of custody form.'
    );

    // 6. Recovery Plan
    const [recoveryPlan, setRecoveryPlan] = useState(
        initialState.recovery_plan ||
        'Reimage compromised endpoints from golden templates; rotate all shared service credentials; re-enable network interfaces under continuous monitoring.'
    );

    // 7. Incident Report
    const [incidentReport, setIncidentReport] = useState(
        initialState.incident_report ||
        'CAPSTONE INCIDENT REPORT #IR-2026-FINAL: Attackers targeted bastion SSH and bursar workstation. Rapid isolation contained lateral movement. Full remediation and credential rotation completed successfully.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        alert_triage: alertTriage,
        scope_and_severity: scopeAndSeverity,
        incident_timeline: incidentTimeline,
        containment_actions: containmentActions,
        evidence_preservation: evidencePreservation,
        recovery_plan: recoveryPlan,
        incident_report: incidentReport,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('SOC capstone draft saved.');
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
                        onClick={() => setActiveTab('queue')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'queue'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Alert Queue
                    </button>
                    <button
                        onClick={() => setActiveTab('triage')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'triage'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Activity className="w-3.5 h-3.5" />
                        1. Triage & Scope (30 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('timeline')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'timeline'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        2. Timeline (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('containment')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'containment'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Lock className="w-3.5 h-3.5" />
                        3. Containment & Evidence (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('report')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'report'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        4. Final Report (25 pts)
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

            {/* Tab 1: Queue */}
            {activeTab === 'queue' && (
                <div className="space-y-4">
                    <div className="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
                        <div>
                            <p className="font-bold text-sm">Security Operations Center — Active Incident Queue</p>
                            <p className="text-xs text-slate-400">Triage incoming indicators and isolate impacted hosts</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {sampleAlerts.map((al: any) => (
                            <div key={al.id} className="bg-white dark:bg-slate-900 border-2 border-red-200 dark:border-red-900 rounded-2xl p-5 shadow-xs space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                        al.severity === 'critical' ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    }`}>
                                        {al.severity} Severity
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono">{al.id}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{al.title}</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <div><strong className="text-slate-700 dark:text-slate-300">Affected Asset:</strong> {al.asset}</div>
                                    <div><strong className="text-slate-700 dark:text-slate-300">User Account:</strong> {al.user}</div>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{al.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 2: Triage & Scope */}
            {activeTab === 'triage' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: Alert Triage & Scope Identification (30 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Isolate critical security incidents and assign incident severity ratings.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={alertTriage.critical_alert_isolated}
                                    onChange={(e) => setAlertTriage({ ...alertTriage, critical_alert_isolated: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="text-xs text-slate-800 dark:text-slate-200">
                                    <strong>Isolate Critical Dropper Alert (AL-1092 & AL-1088):</strong> Flag suspicious execution on finance workstation and bastion login.
                                </span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={alertTriage.false_positive_eliminated}
                                    onChange={(e) => setAlertTriage({ ...alertTriage, false_positive_eliminated: e.target.checked })}
                                    className="rounded text-blue-600 focus:ring-0"
                                />
                                <span className="text-xs text-slate-800 dark:text-slate-200">
                                    <strong>Filter Routine Background Noise (AL-1075):</strong> Exclude normal antivirus definition updates from incident response queue.
                                </span>
                            </label>
                        </div>

                        <div>
                            <InputLabel value="Impacted Assets in Scope" />
                            <TextInput
                                value={scopeAndSeverity.compromised_host_identified}
                                onChange={(e) => setScopeAndSeverity({ ...scopeAndSeverity, compromised_host_identified: e.target.value })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Assigned Incident Severity Rating" />
                            <TextInput
                                value={scopeAndSeverity.severity_rating_assigned}
                                onChange={(e) => setScopeAndSeverity({ ...scopeAndSeverity, severity_rating_assigned: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Timeline */}
            {activeTab === 'timeline' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: Attack Chain Timeline (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Correlate incoming telemetry into an end-to-end attack narrative.
                        </p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                        {incidentTimeline.map((item, idx) => (
                            <p key={idx} className="font-mono text-slate-700 dark:text-slate-300">
                                • {item}
                            </p>
                        ))}
                    </div>
                </div>
            )}

            {/* Tab 4: Containment & Evidence */}
            {activeTab === 'containment' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Incident Containment & Forensics (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Trigger emergency containment actions and preserve digital evidence integrity.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={containmentActions.host_network_isolated}
                                    onChange={(e) => setContainmentActions({ ...containmentActions, host_network_isolated: e.target.checked })}
                                    className="rounded text-red-600 focus:ring-0"
                                />
                                <span className="text-xs text-red-900 dark:text-red-200">
                                    <strong>Network Isolation:</strong> Quarantine WS-FINANCE-04 from the internal VLAN to prevent lateral infection.
                                </span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={containmentActions.compromised_account_disabled}
                                    onChange={(e) => setContainmentActions({ ...containmentActions, compromised_account_disabled: e.target.checked })}
                                    className="rounded text-red-600 focus:ring-0"
                                />
                                <span className="text-xs text-red-900 dark:text-red-200">
                                    <strong>Disable Compromised Accounts:</strong> Lock account "deploy" and invalidate active session tokens.
                                </span>
                            </label>

                            <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={containmentActions.firewall_block_attacker_ip}
                                    onChange={(e) => setContainmentActions({ ...containmentActions, firewall_block_attacker_ip: e.target.checked })}
                                    className="rounded text-red-600 focus:ring-0"
                                />
                                <span className="text-xs text-red-900 dark:text-red-200">
                                    <strong>Edge Firewall Block:</strong> Blacklist adversary IP 192.168.50.120 at the perimeter router.
                                </span>
                            </label>
                        </div>

                        <div>
                            <InputLabel value="Forensic Evidence Preservation Record" />
                            <TextInput
                                value={evidencePreservation}
                                onChange={(e) => setEvidencePreservation(e.target.value)}
                                className="w-full text-xs mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 5: Final Report */}
            {activeTab === 'report' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4: Recovery & Capstone Debrief Report (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Document eradication/recovery procedures and synthesize the final capstone incident report.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="System Recovery & Restoration Plan" />
                            <TextInput
                                value={recoveryPlan}
                                onChange={(e) => setRecoveryPlan(e.target.value)}
                                className="w-full text-xs mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Capstone Executive Incident Report" />
                            <textarea
                                value={incidentReport}
                                onChange={(e) => setIncidentReport(e.target.value)}
                                rows={4}
                                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Submission Section */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Complete Capstone Laboratory Assessment</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Submit incident response evidence and capstone report for 100-point rubric grading (Pass mark: 70%).
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
