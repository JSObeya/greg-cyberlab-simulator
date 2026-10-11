import React, { useState } from 'react';
import axios from 'axios';
import {
    Key,
    Shield,
    Lock,
    Save,
    RotateCcw,
    Send,
    Check,
    Smartphone,
    Fingerprint,
    CheckSquare
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface IdentitySecurityClinicProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function IdentitySecurityClinic({
    laboratory,
    attempt,
    onReset,
}: IdentitySecurityClinicProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'passwords' | 'factors' | 'planning' | 'checklist'>('passwords');

    // 1. Password Evaluation
    const [passwordRanking, setPasswordRanking] = useState({
        weakest: initialState.password_ranking?.weakest || 'password123',
        strongest: initialState.password_ranking?.strongest || 'correct-horse-battery-staple',
    });

    const [reuseExplanation, setReuseExplanation] = useState(
        initialState.reuse_explanation ||
        'Password reuse enables credential stuffing attacks where an adversary replays breach databases from external sites against corporate portals.'
    );

    // 2. Factor Classification
    const [factorClassification, setFactorClassification] = useState<Record<string, string>>(
        initialState.factor_classification || {
            password: 'knowledge',
            sms_otp: 'possession',
            hardware_key: 'possession',
            biometric: 'inherence',
        }
    );

    // 3. MFA Recommendations
    const [mfaRecommendations, setMfaRecommendations] = useState({
        admin: initialState.mfa_recommendations?.admin || 'Hardware FIDO2 WebAuthn Security Key with physical touch verification',
        instructor: initialState.mfa_recommendations?.instructor || 'App-based TOTP Authenticator (Google Authenticator / Microsoft Authenticator)',
        trainee: initialState.mfa_recommendations?.trainee || 'App-based TOTP Authenticator with emergency recovery codes',
    });

    // 4. Identity Checklist
    const [checklist, setChecklist] = useState<string[]>(
        initialState.identity_checklist || [
            'Prohibit shared administrative accounts',
            'Enforce minimum 16-character passphrases',
            'Mandate MFA across all external access portals',
        ]
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        password_ranking: passwordRanking,
        reuse_explanation: reuseExplanation,
        factor_classification: factorClassification,
        mfa_recommendations: mfaRecommendations,
        identity_checklist: checklist,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Identity clinic draft saved.');
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
                        onClick={() => setActiveTab('passwords')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'passwords'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        1. Passwords & Entropy
                    </button>
                    <button
                        onClick={() => setActiveTab('factors')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'factors'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        2. MFA Factor Types
                    </button>
                    <button
                        onClick={() => setActiveTab('planning')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'planning'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        3. Tiered MFA Planning
                    </button>
                    <button
                        onClick={() => setActiveTab('checklist')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            activeTab === 'checklist'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        4. Security Checklist
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

            {/* TAB 1: Passwords & Entropy */}
            {activeTab === 'passwords' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Credential Analysis (40 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Password Quality & Credential Stuffing Prevention
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                            <InputLabel value="Identify the Weakest Pattern (Vulnerable to Dictionary Attack):" />
                            <select
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs p-2.5"
                                value={passwordRanking.weakest}
                                onChange={(e) => setPasswordRanking({ ...passwordRanking, weakest: e.target.value })}
                            >
                                <option value="password123">password123 (Short, common dictionary word)</option>
                                <option value="Admin2026!">Admin2026! (Predictable calendar year substitution)</option>
                                <option value="correct-horse-battery-staple">correct-horse-battery-staple (High entropy passphrase)</option>
                            </select>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2">
                            <InputLabel value="Identify the Strongest Pattern (Maximum Resistance to Guessing):" />
                            <select
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs p-2.5"
                                value={passwordRanking.strongest}
                                onChange={(e) => setPasswordRanking({ ...passwordRanking, strongest: e.target.value })}
                            >
                                <option value="correct-horse-battery-staple">correct-horse-battery-staple (4 random words, 28 chars)</option>
                                <option value="P@ssw0rd!">P@ssw0rd! (8 chars, standard leetspeak)</option>
                                <option value="Admin2026!">Admin2026! (10 chars, predictable)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <InputLabel value="Credential Stuffing & Password Reuse Explanation (Rubric: 15 Points):" />
                        <textarea
                            rows={3}
                            className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3"
                            value={reuseExplanation}
                            onChange={(e) => setReuseExplanation(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton onClick={() => { setActiveTab('factors'); handleAutosave(true); }}>
                            Continue to Factor Types &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* TAB 2: Factor Types */}
            {activeTab === 'factors' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Authentication Dimensions (20 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Classify Multi-Factor Authentication Types
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Map each mechanism to: Something you know (Knowledge), Something you have (Possession), or Something you are (Inherence).
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            { id: 'password', name: 'Master Passphrase / PIN', icon: Key },
                            { id: 'sms_otp', name: 'SMS 6-Digit One-Time Code', icon: Smartphone },
                            { id: 'hardware_key', name: 'FIDO2 USB / NFC Security Key', icon: Shield },
                            { id: 'biometric', name: 'Biometric Touch / Face Recognition', icon: Fingerprint },
                        ].map((m) => (
                            <div
                                key={m.id}
                                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-900 dark:text-white">
                                    <m.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    {m.name}
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    {(['knowledge', 'possession', 'inherence'] as const).map((factor) => (
                                        <button
                                            key={factor}
                                            type="button"
                                            onClick={() => setFactorClassification({ ...factorClassification, [m.id]: factor })}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition ${
                                                factorClassification[m.id] === factor
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            {factor}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between">
                        <SecondaryButton onClick={() => setActiveTab('passwords')}>&larr; Previous</SecondaryButton>
                        <PrimaryButton onClick={() => { setActiveTab('planning'); handleAutosave(true); }}>
                            Continue to MFA Planning &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* TAB 3: Tiered MFA Planning */}
            {activeTab === 'planning' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Contextual Deployment (25 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Proportionate MFA & Account Recovery Architecture
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Super Administrator & Infrastructure Accounts (Highest Privilege):" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={mfaRecommendations.admin}
                                onChange={(e) => setMfaRecommendations({ ...mfaRecommendations, admin: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel value="Instructor & Examination Faculty Accounts:" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={mfaRecommendations.instructor}
                                onChange={(e) => setMfaRecommendations({ ...mfaRecommendations, instructor: e.target.value })}
                            />
                        </div>
                        <div>
                            <InputLabel value="Student & Trainee Laboratory Accounts:" />
                            <TextInput
                                className="mt-1 w-full text-xs"
                                value={mfaRecommendations.trainee}
                                onChange={(e) => setMfaRecommendations({ ...mfaRecommendations, trainee: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <SecondaryButton onClick={() => setActiveTab('factors')}>&larr; Previous</SecondaryButton>
                        <PrimaryButton onClick={() => { setActiveTab('checklist'); handleAutosave(true); }}>
                            Continue to Checklist &rarr;
                        </PrimaryButton>
                    </div>
                </div>
            )}

            {/* TAB 4: Checklist & Submit */}
            {activeTab === 'checklist' && (
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                            Governance Checklist (15 Points)
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                            Academy Identity Security Policy Checklist
                        </h3>
                    </div>

                    <div className="space-y-2.5">
                        {[
                            'Prohibit shared administrative accounts across IT staff',
                            'Enforce minimum 16-character passphrases for all accounts',
                            'Mandate MFA across all external access portals without SMS fallback',
                            'Implement slow, salted password hashing algorithms (Argon2id/Bcrypt)',
                            'Store recovery codes in an encrypted vault rather than insecure notes',
                        ].map((rule, idx) => {
                            const isChecked = checklist.includes(rule);
                            return (
                                <label
                                    key={idx}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                                        checked={isChecked}
                                        onChange={() => {
                                            if (isChecked) {
                                                setChecklist(checklist.filter((c) => c !== rule));
                                            } else {
                                                setChecklist([...checklist, rule]);
                                            }
                                        }}
                                    />
                                    {rule}
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                        <SecondaryButton onClick={() => setActiveTab('planning')}>&larr; Previous</SecondaryButton>
                        <PrimaryButton type="submit" disabled={isSubmitting}>
                            <Send className="w-3.5 h-3.5 me-1.5" />
                            {isSubmitting ? 'Submitting...' : 'Submit Laboratory 3 for Evaluation'}
                        </PrimaryButton>
                    </div>
                </form>
            )}
        </div>
    );
}
