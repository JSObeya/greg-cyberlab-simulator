import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    HelpCircle,
    Save,
    Send,
    Lock,
    Clock,
    FileText,
    RotateCcw,
    Sparkles,
    Check
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface ActivityCard {
    id: string;
    title: string;
    description: string;
    correct_category: 'permitted' | 'prohibited' | 'ask_instructor';
}

interface CiaIncident {
    id: string;
    title: string;
    description: string;
    correct_objective: 'confidentiality' | 'integrity' | 'availability';
}

interface ReadinessQuestion {
    id: number;
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
}

interface OrientationConsoleProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function OrientationAndSafetyConsole({
    laboratory,
    attempt,
    onReset,
}: OrientationConsoleProps) {
    const config = laboratory.workbench_config || {};
    const activityCards: ActivityCard[] = config.activity_cards || [];
    const ciaIncidents: CiaIncident[] = config.cia_incidents || [];
    const readinessQuestions: ReadinessQuestion[] = laboratory.readiness_questions || [];

    // State restoration from autosaved_state
    const initialState = attempt.autosaved_state || {};

    const [activeSection, setActiveSection] = useState<'brief' | 'readiness' | 'cards' | 'cia' | 'evidence'>('brief');

    // Section 1: Scope Identification
    const [scopeAnswers, setScopeAnswers] = useState({
        subnet: initialState.scope_answers?.subnet || '',
        window_identified: initialState.scope_answers?.window_identified || false,
        external_out_of_scope: initialState.scope_answers?.external_out_of_scope || false,
    });

    // Section 2: Readiness Pre-Check
    const [readinessAnswers, setReadinessAnswers] = useState<Record<number, number>>(
        initialState.readiness_answers || {}
    );
    const [readinessSubmitted, setReadinessSubmitted] = useState(false);

    // Section 3: Activity Cards
    const [cardAssignments, setCardAssignments] = useState<Record<string, 'permitted' | 'prohibited' | 'ask_instructor'>>(
        initialState.activity_classifications || {}
    );

    // Section 4: CIA Triad
    const [ciaMatches, setCiaMatches] = useState<Record<string, 'confidentiality' | 'integrity' | 'availability'>>(
        initialState.cia_matches || {}
    );

    // Section 5: Evidence & Sign-off
    const [evidence, setEvidence] = useState({
        date: initialState.evidence_record?.date || new Date().toISOString().split('T')[0],
        time: initialState.evidence_record?.time || new Date().toTimeString().slice(0, 5),
        trainee: initialState.evidence_record?.trainee || attempt.user?.name || '',
        source: initialState.evidence_record?.source || 'Orientation Engagement Brief 192.168.50.0/24',
        observation: initialState.evidence_record?.observation || '',
        conclusion: initialState.evidence_record?.conclusion || '',
        action: initialState.evidence_record?.action || 'Document boundaries and seek written sign-off before commencing simulated scans.',
    });

    const [safetyAcknowledged, setSafetyAcknowledged] = useState<boolean>(
        Boolean(attempt.safety_acknowledged_at || initialState.safety_acknowledged)
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Collect current unified state
    const getCurrentState = () => ({
        scope_answers: scopeAnswers,
        readiness_answers: readinessAnswers,
        activity_classifications: cardAssignments,
        cia_matches: ciaMatches,
        evidence_record: evidence,
        safety_acknowledged: safetyAcknowledged,
    });

    // Autosave handler
    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            const payload = getCurrentState();
            await axios.post(route('simulation.autosave', attempt.id), { state: payload });
            if (!silent) {
                setSaveMessage('Progress saved to server.');
                setTimeout(() => setSaveMessage(null), 3000);
            }
        } catch (err) {
            if (!silent) setSaveMessage('Error saving draft.');
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

    // Acknowledge safety policy
    const handleAcknowledgeSafety = async () => {
        try {
            await axios.post(route('simulation.acknowledge-safety', attempt.id), {
                version: laboratory.version || '1.0.0',
            });
            setSafetyAcknowledged(true);
            setSaveMessage('Digital safety agreement signed & recorded.');
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (err) {
            setSaveMessage('Failed to record digital acknowledgement.');
        }
    };

    // Final Submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!safetyAcknowledged) {
            alert('You must accept the Safety Acknowledgement before submitting this laboratory.');
            return;
        }

        setIsSubmitting(true);
        try {
            const submissionPayload = {
                rubric_submission: true,
                ...getCurrentState(),
            };

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

            Object.entries(submissionPayload).forEach(([key, val]) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = typeof val === 'object' ? JSON.stringify(val) : String(val);
                form.appendChild(input);
            });

            document.body.appendChild(form);
            form.submit();
        } catch (err) {
            setIsSubmitting(false);
            alert('Error submitting laboratory attempt.');
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Navigation Bar of the Console */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap gap-1.5">
                    <button
                        onClick={() => setActiveSection('brief')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeSection === 'brief'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        1. Scope & Rules
                    </button>
                    <button
                        onClick={() => setActiveSection('readiness')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeSection === 'readiness'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <HelpCircle className="w-3.5 h-3.5" />
                        2. Readiness Check
                    </button>
                    <button
                        onClick={() => setActiveSection('cards')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeSection === 'cards'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        3. Activity Sorting ({Object.keys(cardAssignments).length}/5)
                    </button>
                    <button
                        onClick={() => setActiveSection('cia')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeSection === 'cia'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Lock className="w-3.5 h-3.5" />
                        4. CIA Matching ({Object.keys(ciaMatches).length}/3)
                    </button>
                    <button
                        onClick={() => setActiveSection('evidence')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeSection === 'evidence'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        5. Evidence & Sign-off
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

            {/* SECTION 1: Scope & Rules of Engagement */}
            {activeSection === 'brief' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                Official Rules of Engagement
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                                GregSOC Trainee Engagement Scope (192.168.50.0/24)
                            </h3>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Authorised Simulation
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                            <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                                Authorised Subnet
                            </div>
                            <div className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                                192.168.50.0/24
                            </div>
                            <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                                Strictly limited to fictional sandbox addresses.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                            <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                                Scheduled Window
                            </div>
                            <div className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                09:00 UTC - 17:00 UTC
                            </div>
                            <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                                Operations outside approved timeframes are prohibited.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                            <div className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-1">
                                Permitted Tools
                            </div>
                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                Simulated Kali Terminal & AST Parsers
                            </div>
                            <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                                No external or unlisted tools permitted.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40">
                            <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300 mb-2">
                                <CheckCircle2 className="w-4 h-4" />
                                IN-SCOPE TARGETS & ACTIONS
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                                <li>Fictional training subnet (192.168.50.1 – 192.168.50.254)</li>
                                <li>Assigned workstation case files and auth logs</li>
                                <li>Simulated service discovery and packet metadata review</li>
                            </ul>
                        </div>
                        <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                            <div className="flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300 mb-2">
                                <XCircle className="w-4 h-4" />
                                STRICTLY OUT-OF-SCOPE (PROHIBITED)
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                                <li>Hostinger server operating system, cPanel, or host SSH port</li>
                                <li>External Internet websites and public IP addresses</li>
                                <li>Other trainees accounts and production academy servers</li>
                            </ul>
                        </div>
                    </div>

                    {/* Scope Verification Input */}
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-3">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            Scope Identification Check (Rubric: 20 Points)
                        </h4>
                        <div>
                            <InputLabel value="Enter the authorized subnet exactly as stated in the brief:" />
                            <TextInput
                                className="mt-1 w-full max-w-sm text-xs font-mono"
                                placeholder="e.g. 192.168.50.0/24"
                                value={scopeAnswers.subnet}
                                onChange={(e) => setScopeAnswers({ ...scopeAnswers, subnet: e.target.value })}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 pt-1">
                            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                    checked={scopeAnswers.window_identified}
                                    onChange={(e) => setScopeAnswers({ ...scopeAnswers, window_identified: e.target.checked })}
                                />
                                I have noted the scheduled timeframe (09:00 - 17:00 UTC).
                            </label>
                            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                    checked={scopeAnswers.external_out_of_scope}
                                    onChange={(e) => setScopeAnswers({ ...scopeAnswers, external_out_of_scope: e.target.checked })}
                                />
                                I confirm external internet hosts and server cPanel/SSH are out-of-scope.
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton onClick={() => { setActiveSection('readiness'); handleAutosave(true); }}>
                            Continue to Readiness Check &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* SECTION 2: Readiness Pre-Check */}
            {activeSection === 'readiness' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Knowledge Pre-Flight
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Curriculum Readiness Check
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Demonstrate comprehension of the training ethics, boundaries, and evidence standards from the curriculum notes.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {readinessQuestions.map((q, idx) => (
                            <div key={q.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
                                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px]">
                                        {idx + 1}
                                    </span>
                                    {q.question}
                                </div>
                                <div className="space-y-1.5 pl-7">
                                    {q.options.map((opt, optIdx) => (
                                        <label
                                            key={optIdx}
                                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                                readinessAnswers[q.id] === optIdx
                                                    ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-900 dark:text-blue-200 font-semibold'
                                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name={`readiness_${q.id}`}
                                                className="text-blue-600 focus:ring-blue-500"
                                                checked={readinessAnswers[q.id] === optIdx}
                                                onChange={() => setReadinessAnswers({ ...readinessAnswers, [q.id]: optIdx })}
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                                {readinessSubmitted && (
                                    <div className={`mt-2 p-2.5 rounded-lg text-xs ${
                                        readinessAnswers[q.id] === q.correct_index
                                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                                            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                                    }`}>
                                        <span className="font-bold">Explanation: </span>
                                        {q.explanation}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <button
                            type="button"
                            onClick={() => setReadinessSubmitted(true)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Verify Readiness Answers
                        </button>
                        <PrimaryButton onClick={() => { setActiveSection('cards'); handleAutosave(true); }}>
                            Continue to Activity Sorting &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* SECTION 3: Activity Cards Classification */}
            {activeSection === 'cards' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Practical Classification (Rubric: 30 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Classify Proposed Engagement Activities
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Sort each of the five activity cards into <strong>Permitted</strong>, <strong>Prohibited</strong>, or <strong>Ask the Instructor</strong> based on the engagement brief.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {activityCards.map((card) => {
                            const assigned = cardAssignments[card.id];
                            return (
                                <div
                                    key={card.id}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            {card.title}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* Accessible Toggle Button Group */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setCardAssignments({ ...cardAssignments, [card.id]: 'permitted' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                assigned === 'permitted'
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            Permitted
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCardAssignments({ ...cardAssignments, [card.id]: 'prohibited' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                assigned === 'prohibited'
                                                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            Prohibited
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCardAssignments({ ...cardAssignments, [card.id]: 'ask_instructor' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                assigned === 'ask_instructor'
                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            Ask Instructor
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <SecondaryButton onClick={() => setActiveSection('readiness')}>
                            &larr; Previous Step
                        </SecondaryButton>
                        <PrimaryButton onClick={() => { setActiveSection('cia'); handleAutosave(true); }}>
                            Continue to CIA Triad &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* SECTION 4: CIA Triad Matching */}
            {activeSection === 'cia' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Security Objectives (Rubric: 20 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Match Incidents to the CIA Triad
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Align each observed incident to whether it primarily compromises <strong>Confidentiality</strong>, <strong>Integrity</strong>, or <strong>Availability</strong>.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {ciaIncidents.map((incident) => {
                            const matched = ciaMatches[incident.id];
                            return (
                                <div
                                    key={incident.id}
                                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row md:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                            {incident.title}
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
                                            {incident.description}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() => setCiaMatches({ ...ciaMatches, [incident.id]: 'confidentiality' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                matched === 'confidentiality'
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            Confidentiality
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCiaMatches({ ...ciaMatches, [incident.id]: 'integrity' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                matched === 'integrity'
                                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            Integrity
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCiaMatches({ ...ciaMatches, [incident.id]: 'availability' })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                                matched === 'availability'
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            Availability
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <SecondaryButton onClick={() => setActiveSection('cards')}>
                            &larr; Previous Step
                        </SecondaryButton>
                        <PrimaryButton onClick={() => { setActiveSection('evidence'); handleAutosave(true); }}>
                            Continue to Evidence Worksheet &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* SECTION 5: Evidence Record & Safety Sign-off */}
            {activeSection === 'evidence' && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Evidence & Compliance Sign-off (Rubric: 30 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Evidence Record & Ethical Agreement
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Complete the structured incident evidence worksheet, distinguishing factual observation from deductive conclusions, and confirm your digital safety signature.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <InputLabel value="Date" />
                            <TextInput
                                className="mt-1 w-full text-xs font-mono"
                                value={evidence.date}
                                onChange={(e) => setEvidence({ ...evidence, date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <InputLabel value="Time (UTC)" />
                            <TextInput
                                className="mt-1 w-full text-xs font-mono"
                                value={evidence.time}
                                onChange={(e) => setEvidence({ ...evidence, time: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <InputLabel value="Trainee Analyst" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={evidence.trainee}
                                onChange={(e) => setEvidence({ ...evidence, trainee: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Evidence Source / Artifact" />
                        <TextInput
                            className="mt-1 w-full text-xs font-mono"
                            value={evidence.source}
                            onChange={(e) => setEvidence({ ...evidence, source: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Empirical Observation (What was directly observed?)" />
                            <textarea
                                rows={3}
                                className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="State exact facts observed without speculative assumptions..."
                                value={evidence.observation}
                                onChange={(e) => setEvidence({ ...evidence, observation: e.target.value })}
                                required
                            />
                            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                E.g. Observed 192.168.50.0/24 subnet defined as the singular authorized target in the engagement charter.
                            </p>
                        </div>
                        <div>
                            <InputLabel value="Analytical Conclusion (What does the evidence deduce?)" />
                            <textarea
                                rows={3}
                                className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3 focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Deduce security impact and boundaries based on the facts..."
                                value={evidence.conclusion}
                                onChange={(e) => setEvidence({ ...evidence, conclusion: e.target.value })}
                                required
                            />
                            <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                E.g. Any scan outside 192.168.50.0/24 lacks legal authorization and violates rules of engagement.
                            </p>
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Defensive Action / Next Step" />
                        <TextInput
                            className="mt-1 w-full text-xs"
                            value={evidence.action}
                            onChange={(e) => setEvidence({ ...evidence, action: e.target.value })}
                            required
                        />
                    </div>

                    {/* Digital Safety Acknowledgement Box */}
                    <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/30 space-y-3">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200">
                                    Mandatory Digital Safety Acknowledgement (Rubric: 10 Points)
                                </h4>
                                <p className="text-[11px] text-blue-800 dark:text-blue-300 mt-1 leading-relaxed">
                                    I hereby acknowledge and agree that all tools and activities in the Greg Cybersecurity Training Simulator are for authorized educational simulation only. I agree never to execute commands against unauthorized networks, external internet hosts, or production infrastructure, and to comply with the Nigerian Cybercrimes Act.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-blue-200/80 dark:border-blue-900/60">
                            <label className="flex items-center gap-2 text-xs font-bold text-blue-950 dark:text-blue-200 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="rounded border-blue-400 text-blue-600 focus:ring-blue-500"
                                    checked={safetyAcknowledged}
                                    onChange={(e) => {
                                        setSafetyAcknowledged(e.target.checked);
                                        if (e.target.checked) handleAcknowledgeSafety();
                                    }}
                                />
                                I accept the rules of engagement and digital safety policy (Version {laboratory.version || '1.0.0'}).
                            </label>
                            {attempt.safety_acknowledged_at && (
                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                                    Signed: {new Date(attempt.safety_acknowledged_at).toUTCString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                        <SecondaryButton onClick={() => setActiveSection('cia')}>
                            &larr; Previous Step
                        </SecondaryButton>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => handleAutosave(false)}
                                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Save Draft
                            </button>
                            <PrimaryButton type="submit" disabled={isSubmitting || !safetyAcknowledged}>
                                <Send className="w-3.5 h-3.5 me-1.5" />
                                {isSubmitting ? 'Evaluating 100-pt Rubric...' : 'Submit Laboratory 1 for Grading'}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            )}
        </div>
    );
}
