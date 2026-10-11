import React, { useState } from 'react';
import axios from 'axios';
import {
    Shield,
    AlertTriangle,
    Database,
    Lock,
    Save,
    RotateCcw,
    Send,
    Check,
    HelpCircle,
    FileSpreadsheet
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface RiskAssessmentBoardProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function RiskAssessmentBoard({
    laboratory,
    attempt,
    onReset,
}: RiskAssessmentBoardProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'classification' | 'matrix' | 'controls' | 'treatment'>('classification');

    // 1. Card classifications (asset, threat, vulnerability, control)
    const [cardClassifications, setCardClassifications] = useState<Record<string, string>>(
        initialState.card_classifications || {}
    );

    // 2. Risk calculations
    const [calculations, setCalculations] = useState({
        db_exposure: initialState.risk_calculations?.db_exposure || 25,
        wifi_default: initialState.risk_calculations?.wifi_default || 16,
    });

    const [ratingsJustification, setRatingsJustification] = useState(
        initialState.ratings_justification ||
        'Direct Internet access to database creates maximum likelihood (5) and confidentiality impact (5) yielding a Critical risk score of 25.'
    );

    // 3. Controls selection
    const [controls, setControls] = useState({
        preventive: initialState.controls_selection?.preventive || 'Network segmentation and input validation',
        detective: initialState.controls_selection?.detective || 'Automated database query audit logging',
        corrective: initialState.controls_selection?.corrective || 'Daily encrypted offsite database backups',
    });

    // 4. Treatment statement
    const [treatmentStatement, setTreatmentStatement] = useState(
        initialState.treatment_statement ||
        'Move the student database behind an internal firewall subnet; enforce strict parameterised queries and restrict administrative access to internal management IPs.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const cards = [
        { id: 'card_student_db', title: 'Student Academic Records Database', desc: 'Contains names, NIN, addresses, and grades of all academy trainees.', type: 'asset' },
        { id: 'card_sql_injection', title: 'Unsanitized User Input in Search Portal', desc: 'Web form accepts unfiltered quotation characters allowing direct SQL queries.', type: 'vulnerability' },
        { id: 'card_credential_stuffing', title: 'Automated Credential Stuffing Botnet', desc: 'External adversary testing stolen username and password pairs.', type: 'threat' },
        { id: 'card_daily_backup', title: 'Immutable Daily Snapshot Backup', desc: 'Encrypted storage copy taken every 24 hours to enable disaster recovery.', type: 'control' },
        { id: 'card_mfa_token', title: 'Hardware FIDO2 Authenticator Key', desc: 'Physical security token required to sign into administrative consoles.', type: 'control' },
    ];

    const getCurrentState = () => ({
        card_classifications: cardClassifications,
        risk_calculations: calculations,
        ratings_justification: ratingsJustification,
        controls_selection: controls,
        treatment_statement: treatmentStatement,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Risk register draft saved.');
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
                        onClick={() => setActiveTab('classification')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'classification'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        1. Classify Cards ({Object.keys(cardClassifications).length}/5)
                    </button>
                    <button
                        onClick={() => setActiveTab('matrix')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'matrix'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        2. 5x5 Risk Matrix
                    </button>
                    <button
                        onClick={() => setActiveTab('controls')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'controls'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        3. Safeguard Controls
                    </button>
                    <button
                        onClick={() => setActiveTab('treatment')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'treatment'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        4. Risk Register & Sign-off
                    </button>
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

            {/* TAB 1: Card Classification */}
            {activeTab === 'classification' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Assessment Classification (25 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Distinguish Assets, Threats, Vulnerabilities, and Controls
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Categorize each item in the fictional Makurdi ICT Academy environment.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {cards.map((c) => {
                            const val = cardClassifications[c.id];
                            return (
                                <div
                                    key={c.id}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-0.5">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            {c.title}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">{c.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {(['asset', 'threat', 'vulnerability', 'control'] as const).map((type) => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setCardClassifications({ ...cardClassifications, [c.id]: type })}
                                                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border capitalize transition ${
                                                    val === type
                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton onClick={() => { setActiveTab('matrix'); handleAutosave(true); }}>
                            Continue to 5x5 Matrix &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* TAB 2: 5x5 Risk Matrix */}
            {activeTab === 'matrix' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Quantification Formula (20 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            5x5 Risk Matrix: Score = Likelihood (1-5) &times; Impact (1-5)
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                High-Risk Item: Internet-Exposed Student Database
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Likelihood = 5 (continuous scanning botnets), Impact = 5 (mass breach of personal identifying data).
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Calculated Score:</span>
                                <span className="px-3 py-1 rounded-lg bg-rose-600 text-white font-mono font-black text-sm">
                                    {calculations.db_exposure} / 25 (CRITICAL)
                                </span>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                Medium-Risk Item: Default WiFi Pre-Shared Key
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Likelihood = 4 (physically proximal users), Impact = 4 (eavesdropping on unencrypted local streams).
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Calculated Score:</span>
                                <span className="px-3 py-1 rounded-lg bg-amber-500 text-white font-mono font-black text-sm">
                                    {calculations.wifi_default} / 25 (HIGH)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Evidence-based Rating Rationale (Rubric: 20 Points):" />
                        <textarea
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3"
                            value={ratingsJustification}
                            onChange={(e) => setRatingsJustification(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-between">
                        <SecondaryButton onClick={() => setActiveTab('classification')}>&larr; Previous</SecondaryButton>
                        <PrimaryButton onClick={() => { setActiveTab('controls'); handleAutosave(true); }}>
                            Continue to Safeguards &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* TAB 3: Controls Selection */}
            {activeTab === 'controls' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Defense-in-Depth Safeguards (25 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Select Preventive, Detective, and Corrective Controls
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="1. Preventive Control (Blocks threat before exploitation):" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={controls.preventive}
                                onChange={(e) => setControls({ ...controls, preventive: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel value="2. Detective Control (Identifies active incidents in progress):" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={controls.detective}
                                onChange={(e) => setControls({ ...controls, detective: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel value="3. Corrective Control (Restores state and limits damage post-incident):" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={controls.corrective}
                                onChange={(e) => setControls({ ...controls, corrective: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <SecondaryButton onClick={() => setActiveTab('matrix')}>&larr; Previous</SecondaryButton>
                        <PrimaryButton onClick={() => { setActiveTab('treatment'); handleAutosave(true); }}>
                            Continue to Risk Register &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* TAB 4: Treatment & Final Submission */}
            {activeTab === 'treatment' && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Risk Register Entry (10 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Executive Risk Treatment Statement
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Document the final management risk decision (Remediate, Mitigate, Transfer, Accept).
                        </p>
                    </div>

                    <div>
                        <InputLabel value="Risk Treatment Plan:" />
                        <textarea
                            rows={4}
                            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3"
                            value={treatmentStatement}
                            onChange={(e) => setTreatmentStatement(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                        <SecondaryButton onClick={() => setActiveTab('controls')}>&larr; Previous</SecondaryButton>
                        <PrimaryButton type="submit" disabled={isSubmitting}>
                            <Send className="w-3.5 h-3.5 me-1.5" />
                            {isSubmitting ? 'Submitting...' : 'Submit Laboratory 2 for Evaluation'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </div>
    );
}
