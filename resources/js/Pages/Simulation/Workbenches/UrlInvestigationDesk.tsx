import React, { useState } from 'react';
import axios from 'axios';
import {
    Link2,
    Shield,
    AlertTriangle,
    CheckCircle2,
    Save,
    RotateCcw,
    Send,
    Check,
    Lock,
    ExternalLink,
    Search
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface UrlDeskProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function UrlInvestigationDesk({
    laboratory,
    attempt,
    onReset,
}: UrlDeskProps) {
    const initialState = attempt.autosaved_state || {};

    const urlSamples = [
        {
            id: 'url_1',
            raw: 'http://login.microsoft.com.account-update.example.test/auth?token=92',
            scheme: 'http',
            subdomain: 'login.microsoft.com',
            registered_domain: 'account-update.example.test',
            port: '80 (default)',
            path: '/auth',
            query: 'token=92',
            brand: 'Microsoft',
            actual_owner: 'account-update.example.test',
            expected: 'deceptive',
        },
        {
            id: 'url_2',
            raw: 'https://courses.gregicthub.com/cybersecurity',
            scheme: 'https',
            subdomain: 'courses',
            registered_domain: 'gregicthub.com',
            port: '443 (default)',
            path: '/cybersecurity',
            query: 'none',
            brand: 'Greg & Co. ICT Academy',
            actual_owner: 'gregicthub.com',
            expected: 'safe',
        },
        {
            id: 'url_3',
            raw: 'https://192.168.50.10:8443/api/v1/auth',
            scheme: 'https',
            subdomain: 'none (direct IP)',
            registered_domain: '192.168.50.10 (Private Subnet)',
            port: '8443 (custom management)',
            path: '/api/v1/auth',
            query: 'none',
            brand: 'Internal Virtual Host',
            actual_owner: '192.168.50.10',
            expected: 'suspicious',
        },
        {
            id: 'url_4',
            raw: 'http://secure.bank.example.test/claim-funds',
            scheme: 'http',
            subdomain: 'secure.bank',
            registered_domain: 'example.test',
            port: '80 (default)',
            path: '/claim-funds',
            query: 'none',
            brand: 'Commercial Bank',
            actual_owner: 'example.test',
            expected: 'deceptive',
        },
        {
            id: 'url_5',
            raw: 'https://www.iana.org/domains/reserved',
            scheme: 'https',
            subdomain: 'www',
            registered_domain: 'iana.org',
            port: '443 (default)',
            path: '/domains/reserved',
            query: 'none',
            brand: 'IANA',
            actual_owner: 'iana.org',
            expected: 'safe',
        },
    ];

    const [selectedUrl, setSelectedUrl] = useState(urlSamples[0]);

    // 1. URL Parsing check
    const [urlParsing, setUrlParsing] = useState({
        scheme: initialState.url_parsing?.scheme || 'http',
        hostname: initialState.url_parsing?.hostname || 'login.microsoft.com.account-update.example.test',
        registered_domain: initialState.url_parsing?.registered_domain || 'account-update.example.test',
        path: initialState.url_parsing?.path || '/auth',
        query: initialState.url_parsing?.query || 'token=92',
    });

    // 2. Deception Indicators
    const [deceptionIndicators, setDeceptionIndicators] = useState({
        deceptive_subdomain: initialState.deception_indicators?.deceptive_subdomain || true,
        typosquatting: initialState.deception_indicators?.typosquatting || true,
        unusual_port: initialState.deception_indicators?.unusual_port || true,
    });

    // 3. HTTPS explanation
    const [httpsExplanation, setHttpsExplanation] = useState(
        initialState.https_explanation ||
        'HTTPS encrypts data in transit to prevent local eavesdropping, but it does NOT verify that the destination website owner is honest or benevolent. Attackers routinely obtain valid TLS certificates for phishing sites.'
    );

    // 4. Classifications across 5 samples
    const [classifications, setClassifications] = useState<Record<string, string>>(
        initialState.url_classifications || {}
    );

    // 5. Safe action
    const [safeAction, setSafeAction] = useState(
        initialState.safe_action ||
        'Block deceptive domains on the boundary DNS resolver, do not submit credentials or tokens, and report URLs to the security operations centre.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        url_parsing: urlParsing,
        deception_indicators: deceptionIndicators,
        https_explanation: httpsExplanation,
        url_classifications: classifications,
        safe_action: safeAction,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('URL analysis draft saved.');
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
                        <Link2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        URL Investigation Desk ({Object.keys(classifications).length}/5 Analysed)
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

            {/* URL Inspector Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                        Inert URL Samples (RFC 2606 Reserved)
                    </span>
                    {urlSamples.map((u) => {
                        const isSelected = selectedUrl.id === u.id;
                        const assigned = classifications[u.id];
                        return (
                            <div
                                key={u.id}
                                onClick={() => setSelectedUrl(u)}
                                className={`p-3 rounded-xl border cursor-pointer transition ${
                                    isSelected
                                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-xs'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                            >
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                                        Claimed: {u.brand}
                                    </span>
                                    {assigned && (
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                            assigned === 'deceptive'
                                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                                : assigned === 'safe'
                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        }`}>
                                            {assigned}
                                        </span>
                                    )}
                                </div>
                                <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 truncate">
                                    {u.raw}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Inspected Address
                                </span>
                                <h3 className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 break-all">
                                    {selectedUrl.raw}
                                </h3>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {(['safe', 'suspicious', 'deceptive'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setClassifications({ ...classifications, [selectedUrl.id]: cat })}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize transition ${
                                            classifications[selectedUrl.id] === cat
                                                ? cat === 'deceptive'
                                                    ? 'bg-rose-600 text-white border-rose-600'
                                                    : cat === 'safe'
                                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                                    : 'bg-amber-500 text-white border-amber-500'
                                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Deconstructed Anatomy Table */}
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-mono">
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Scheme</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedUrl.scheme}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Subdomain</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedUrl.subdomain}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-rose-500 font-bold block">Registered Domain</span>
                                <span className="font-bold text-rose-600 dark:text-rose-400">{selectedUrl.registered_domain}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Port</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedUrl.port}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Path</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedUrl.path}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 block">Query Parameters</span>
                                <span className="font-bold text-slate-900 dark:text-white">{selectedUrl.query}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                        <span className="font-bold block">Domain Ownership Rationale:</span>
                        <p>
                            In modern URI specification (RFC 3986), the rightmost domain before the Top-Level Domain determines legal zone ownership. Even though the subdomain contains "{selectedUrl.brand}", the actual web host is controlled by <strong>{selectedUrl.registered_domain}</strong>.
                        </p>
                    </div>
                </div>
            </div>

            {/* Assessment Worksheet */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Protocol Theory & Containment (Rubric: 100 Points)
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        Explain the Limits of HTTPS and Recommend Safe Actions
                    </h3>
                </div>

                <div>
                    <InputLabel value="Why does the presence of HTTPS (green padlock) NOT prove a site is legitimate? (Rubric: 15 Points):" />
                    <textarea
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3"
                        value={httpsExplanation}
                        onChange={(e) => setHttpsExplanation(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <InputLabel value="Safest Next Defensive Action (Rubric: 10 Points):" />
                    <TextInput
                        className="mt-1 w-full text-xs"
                        value={safeAction}
                        onChange={(e) => setSafeAction(e.target.value)}
                        required
                    />
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => handleAutosave(false)}
                        className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Save Draft
                    </button>
                    <PrimaryButton type="submit" disabled={isSubmitting || Object.keys(classifications).length < 5}>
                        <Send className="w-3.5 h-3.5 me-1.5" />
                        {isSubmitting ? 'Evaluating Rubric...' : 'Submit Laboratory 5 for Evaluation'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
