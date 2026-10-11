import React, { useState } from 'react';
import axios from 'axios';
import {
    Globe,
    Shield,
    Lock,
    Save,
    RotateCcw,
    Send,
    Check,
    AlertTriangle,
    Cookie,
    FileText
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface WebRequestInspectorProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function WebRequestInspector({
    laboratory,
    attempt,
    onReset,
}: WebRequestInspectorProps) {
    const initialState = attempt.autosaved_state || {};

    const [activeTab, setActiveTab] = useState<'headers' | 'cookies' | 'security' | 'backlog'>('headers');

    // 1. Request Interpretation
    const [requestInterp, setRequestInterp] = useState({
        http_status_code: initialState.request_interpretation?.http_status_code || 200,
        server_banner_identified: initialState.request_interpretation?.server_banner_identified || 'Apache/2.4.52 (Ubuntu) with PHP/8.3.0 banner leak',
    });

    // 2. Cookie Security Analysis
    const [cookieSecurity, setCookieSecurity] = useState({
        missing_httponly: initialState.cookie_security_analysis?.missing_httponly ?? true,
        missing_secure: initialState.cookie_security_analysis?.missing_secure ?? true,
        missing_samesite: initialState.cookie_security_analysis?.missing_samesite ?? true,
    });

    // 3. Missing Security Headers
    const [missingHeaders, setMissingHeaders] = useState({
        missing_csp: initialState.missing_security_headers?.missing_csp ?? true,
        missing_x_frame_options: initialState.missing_security_headers?.missing_x_frame_options ?? true,
        missing_hsts: initialState.missing_security_headers?.missing_hsts ?? true,
    });

    // 4. Remediation Priority
    const [remediationPriority, setRemediationPriority] = useState(
        initialState.remediation_priority ||
        'Priority 1: Enforce HttpOnly and Secure on session cookie to prevent XSS theft. Priority 2: Deploy Content-Security-Policy and X-Frame-Options: DENY against clickjacking.'
    );

    // 5. Verification Test Command
    const [testCommand, setTestCommand] = useState(
        initialState.verification_test_command || 'curl -I https://portal.example.test'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        request_interpretation: requestInterp,
        cookie_security_analysis: cookieSecurity,
        missing_security_headers: missingHeaders,
        remediation_priority: remediationPriority,
        verification_test_command: testCommand,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Web request draft saved.');
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
                        onClick={() => setActiveTab('headers')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'headers'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        1. Response Headers (20 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('cookies')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'cookies'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Cookie className="w-3.5 h-3.5" />
                        2. Cookie Flags (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'security'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <Shield className="w-3.5 h-3.5" />
                        3. Defensive Headers (25 pts)
                    </button>
                    <button
                        onClick={() => setActiveTab('backlog')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                            activeTab === 'backlog'
                                ? 'bg-slate-900 text-white dark:bg-blue-600 dark:text-white'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        4. Remediation Backlog (30 pts)
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

            {/* Tab 1: Response Headers */}
            {activeTab === 'headers' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 1: HTTP Response Header Audit (20 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Analyze the simulated `curl -I https://portal.example.test` response headers.
                        </p>
                    </div>

                    <div className="bg-slate-950 text-slate-200 p-5 rounded-2xl font-mono text-xs border border-slate-800 space-y-1 shadow-xl">
                        <p className="text-emerald-400 font-bold mb-2">HTTP/1.1 200 OK</p>
                        <p><span className="text-slate-400">Date:</span> Sun, 11 Oct 2026 12:00:00 GMT</p>
                        <p className="text-red-400"><span className="text-slate-400">Server:</span> Apache/2.4.52 (Ubuntu)</p>
                        <p className="text-red-400"><span className="text-slate-400">X-Powered-By:</span> PHP/8.3.0</p>
                        <p className="text-yellow-400"><span className="text-slate-400">Set-Cookie:</span> session=xyz987; Path=/;</p>
                        <p><span className="text-slate-400">Content-Type:</span> text/html; charset=UTF-8</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="HTTP Status Code" />
                            <TextInput
                                type="number"
                                value={requestInterp.http_status_code}
                                onChange={(e) => setRequestInterp({ ...requestInterp, http_status_code: parseInt(e.target.value) || 200 })}
                                className="w-full text-xs font-mono mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Information Disclosure Banners" />
                            <TextInput
                                value={requestInterp.server_banner_identified}
                                onChange={(e) => setRequestInterp({ ...requestInterp, server_banner_identified: e.target.value })}
                                className="w-full text-xs mt-1"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Cookie Flags */}
            {activeTab === 'cookies' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 2: Cookie Security Flag Deficiencies (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Inspect the `Set-Cookie` header attributes: `session=xyz987; Path=/;`
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cookieSecurity.missing_httponly}
                                onChange={(e) => setCookieSecurity({ ...cookieSecurity, missing_httponly: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Missing HttpOnly Flag:</strong>
                                <p className="text-red-700 dark:text-red-300">Allows client-side JavaScript (`document.cookie`) to read session token during XSS attacks.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cookieSecurity.missing_secure}
                                onChange={(e) => setCookieSecurity({ ...cookieSecurity, missing_secure: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Missing Secure Flag:</strong>
                                <p className="text-red-700 dark:text-red-300">Allows session cookie to be transmitted over unencrypted HTTP cleartext connections.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={cookieSecurity.missing_samesite}
                                onChange={(e) => setCookieSecurity({ ...cookieSecurity, missing_samesite: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Missing SameSite Flag:</strong>
                                <p className="text-red-700 dark:text-red-300">Leaves application vulnerable to Cross-Site Request Forgery (CSRF) via cross-site requests.</p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab 3: Defensive Headers */}
            {activeTab === 'security' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 3: Missing Security Headers Audit (25 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Flag critical defensive HTTP response headers absent from the web server response.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={missingHeaders.missing_csp}
                                onChange={(e) => setMissingHeaders({ ...missingHeaders, missing_csp: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Content-Security-Policy (CSP) Missing:</strong>
                                <p className="text-red-700 dark:text-red-300">No restrictions on script injection sources; elevated risk of Cross-Site Scripting.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={missingHeaders.missing_x_frame_options}
                                onChange={(e) => setMissingHeaders({ ...missingHeaders, missing_x_frame_options: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">X-Frame-Options Missing:</strong>
                                <p className="text-red-700 dark:text-red-300">Allows webpage embedding in malicious iframe overlays, exposing users to clickjacking.</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl cursor-pointer">
                            <input
                                type="checkbox"
                                checked={missingHeaders.missing_hsts}
                                onChange={(e) => setMissingHeaders({ ...missingHeaders, missing_hsts: e.target.checked })}
                                className="rounded text-red-600 focus:ring-0"
                            />
                            <div className="text-xs">
                                <strong className="text-red-900 dark:text-red-200">Strict-Transport-Security (HSTS) Missing:</strong>
                                <p className="text-red-700 dark:text-red-300">Browser not forced to communicate strictly over encrypted HTTPS channels.</p>
                            </div>
                        </label>
                    </div>
                </div>
            )}

            {/* Tab 4: Remediation Backlog */}
            {activeTab === 'backlog' && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">Task 4 & 5: Remediation Priority & Verification (30 Points)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Document engineering remediation tickets and post-implementation verification commands.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <InputLabel value="Hardening Priority Rationale" />
                            <textarea
                                value={remediationPriority}
                                onChange={(e) => setRemediationPriority(e.target.value)}
                                rows={3}
                                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-3 mt-1"
                            />
                        </div>

                        <div>
                            <InputLabel value="Post-Deployment Verification Command" />
                            <TextInput
                                value={testCommand}
                                onChange={(e) => setTestCommand(e.target.value)}
                                className="w-full text-xs font-mono mt-1"
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
                        Submit header audit findings and remediation backlog for 100-point rubric grading (Pass mark: 70%).
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
