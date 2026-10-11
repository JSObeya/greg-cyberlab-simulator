import React, { useState } from 'react';
import axios from 'axios';
import {
    Mail,
    AlertTriangle,
    Shield,
    CheckCircle2,
    XCircle,
    Save,
    RotateCcw,
    Send,
    Check,
    ExternalLink,
    FileText,
    HelpCircle
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

interface PhishingWorkbenchProps {
    laboratory: any;
    attempt: any;
    onReset: () => void;
}

export default function PhishingAnalysisWorkbench({
    laboratory,
    attempt,
    onReset,
}: PhishingWorkbenchProps) {
    const initialState = attempt.autosaved_state || {};

    const emails = [
        {
            id: 'mail_01',
            sender: 'Chief Accountant <accountant@greg-acaddemy.ng>',
            reply_to: 'bursar.secure.transfer@gmail.com',
            subject: 'URGENT: Executive Wire Transfer Authorization Needed by 2:00 PM',
            date: 'Today at 08:42 UTC',
            spf: 'SoftFail (Sender IP not in SPF record)',
            dkim: 'None',
            dmarc: 'Fail (p=none)',
            body: 'Good morning,\nPlease authorize immediate transfer of NGN 3,450,000 to the attached contractor account before 2:00 PM to avoid breach of academy works contract.\nClick below to verify authorization token:\n[Verify Transfer Token: http://portal.example.test/auth-login?id=992]',
            destination_url: 'http://portal.example.test/auth-login?id=992',
            expected_type: 'phishing',
        },
        {
            id: 'mail_02',
            sender: 'Registrar Office <registrar@gregicthub.com>',
            reply_to: 'registrar@gregicthub.com',
            subject: 'Academic Calendar Update: First Semester Examinations Schedule',
            date: 'Yesterday at 14:15 UTC',
            spf: 'Pass',
            dkim: 'Pass (v=1; a=rsa-sha256; d=gregicthub.com)',
            dmarc: 'Pass (p=reject)',
            body: 'Dear Students and Faculty,\nPlease find the updated examination timetable for the 2026 academic session published on the student noticeboard. No login or verification is required.\nKind regards,\nRegistrar',
            destination_url: 'None',
            expected_type: 'legitimate',
        },
        {
            id: 'mail_03',
            sender: 'IT Helpdesk <support@microsoft-account-verify.example.test>',
            reply_to: 'noreply@microsoft-account-verify.example.test',
            subject: 'Security Alert: Your Academy Password Expires in 2 Hours',
            date: 'Today at 09:10 UTC',
            spf: 'Pass (Sender matches foreign domain)',
            dkim: 'Pass',
            dmarc: 'Fail (Domain alignment mismatch)',
            body: 'Your academy Microsoft 365 password will expire today. Keep your current password by clicking below and entering your credentials:\n[Keep Current Password: http://login.microsoft.example.test/renew]',
            destination_url: 'http://login.microsoft.example.test/renew',
            expected_type: 'phishing',
        },
        {
            id: 'mail_04',
            sender: 'James Terfa <j.terfa@student.gregicthub.com>',
            reply_to: 'j.terfa@student.gregicthub.com',
            subject: 'Question regarding Laboratory 4 Grade Submission',
            date: 'Today at 11:20 UTC',
            spf: 'Pass',
            dkim: 'Pass',
            dmarc: 'Pass',
            body: 'Hello Instructor, I submitted my assignment yesterday but my dashboard shows pending. Could you please check? Thank you.',
            destination_url: 'None',
            expected_type: 'suspicious',
        },
        {
            id: 'mail_05',
            sender: 'Library System <library@gregicthub.com>',
            reply_to: 'library@gregicthub.com',
            subject: 'Automated Loan Reminder: Network Security Fundamentals',
            date: '2 days ago at 16:00 UTC',
            spf: 'Pass',
            dkim: 'Pass',
            dmarc: 'Pass',
            body: 'Your textbook loan is due in 3 days. Please return it to the circulation desk. No action is required if already returned.',
            destination_url: 'None',
            expected_type: 'legitimate',
        },
        {
            id: 'mail_06',
            sender: 'Greg Mail Admin <postmaster@gregict-alert.example.test>',
            reply_to: 'support@gregict-alert.example.test',
            subject: 'Mailbox Storage Limit Exceeded (98% Full)',
            date: 'Today at 07:30 UTC',
            spf: 'Neutral',
            dkim: 'None',
            dmarc: 'None',
            body: 'Your mailbox exceeded storage quota. Inactive messages will be deleted unless you increase storage quota now:\n[Increase Storage Quota: http://storage-quota.example.test/expand]',
            destination_url: 'http://storage-quota.example.test/expand',
            expected_type: 'phishing',
        },
    ];

    const [selectedEmail, setSelectedEmail] = useState(emails[0]);

    // State for classification across all 6 messages
    const [classifications, setClassifications] = useState<Record<string, string>>(
        initialState.email_classifications || {}
    );

    // Indicator checklist
    const [indicators, setIndicators] = useState<string[]>(
        initialState.indicators || [
            'Display Name / Domain Typo (greg-acaddemy.ng)',
            'Reply-To Discrepancy (Free Gmail Address)',
            'Artificial Urgency & Financial Pressure',
            'Inert External Destination Link',
            'SPF SoftFail Authentication Mismatch',
        ]
    );

    const [headerInterpretation, setHeaderInterpretation] = useState({
        spf_mismatch: initialState.header_interpretation?.spf_mismatch || true,
        reply_to_discrepancy: initialState.header_interpretation?.reply_to_discrepancy || true,
    });

    const [safeActions, setSafeActions] = useState({
        do_not_click: initialState.safe_actions?.do_not_click || true,
        report_channel: initialState.safe_actions?.report_channel || true,
        containment_step: initialState.safe_actions?.containment_step || true,
    });

    const [reasoning, setReasoning] = useState(
        initialState.reasoning ||
        'The email exhibits display-name typosquatting, SPF soft-fail discrepancy, free webmail reply-to address, and high urgency requesting financial disbursement.'
    );

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getCurrentState = () => ({
        email_classifications: classifications,
        indicators,
        header_interpretation: headerInterpretation,
        safe_actions: safeActions,
        reasoning,
    });

    const handleAutosave = async (silent = false) => {
        if (!silent) setIsSaving(true);
        try {
            await axios.post(route('simulation.autosave', attempt.id), { state: getCurrentState() });
            if (!silent) {
                setSaveMessage('Phishing workbench draft saved.');
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
                        <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Phishing Analysis Workbench ({Object.keys(classifications).length}/6 Classifications)
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

            {/* Email Inbox & Inspector Split View */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inbox List (4 Cols) */}
                <div className="lg:col-span-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block px-1">
                        Simulated Helpdesk Queue (6 Messages)
                    </span>
                    {emails.map((m) => {
                        const isSelected = selectedEmail.id === m.id;
                        const assigned = classifications[m.id];
                        return (
                            <div
                                key={m.id}
                                onClick={() => setSelectedEmail(m)}
                                className={`p-3 rounded-xl border cursor-pointer transition ${
                                    isSelected
                                        ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-xs'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                                }`}
                            >
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                    <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                                        {m.sender.split('<')[0]}
                                    </span>
                                    {assigned && (
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                                            assigned === 'phishing'
                                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                                                : assigned === 'legitimate'
                                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                                : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        }`}>
                                            {assigned}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                                    {m.subject}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    {m.date}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Email Viewer & Forensic Headers (8 Cols) */}
                <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
                    <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                {selectedEmail.subject}
                            </h3>
                            <div className="flex items-center gap-1.5">
                                {(['legitimate', 'phishing', 'suspicious'] as const).map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setClassifications({ ...classifications, [selectedEmail.id]: cat })}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-bold border capitalize transition ${
                                            classifications[selectedEmail.id] === cat
                                                ? cat === 'phishing'
                                                    ? 'bg-rose-600 text-white border-rose-600'
                                                    : cat === 'legitimate'
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

                        {/* Sanitized Headers Table */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1.5">
                            <div><span className="text-slate-500">From:</span> <strong className="text-slate-900 dark:text-white">{selectedEmail.sender}</strong></div>
                            <div><span className="text-slate-500">Reply-To:</span> <span className="text-rose-600 dark:text-rose-400 font-bold">{selectedEmail.reply_to}</span></div>
                            <div className="flex flex-wrap gap-4 pt-1">
                                <div><span className="text-slate-500">SPF:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEmail.spf}</span></div>
                                <div><span className="text-slate-500">DKIM:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEmail.dkim}</span></div>
                                <div><span className="text-slate-500">DMARC:</span> <span className="font-bold text-slate-800 dark:text-slate-200">{selectedEmail.dmarc}</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Email Body */}
                    <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed p-4 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 font-sans">
                        {selectedEmail.body}
                    </div>

                    {/* Inert Link Preview */}
                    {selectedEmail.destination_url !== 'None' && (
                        <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                                        Inert Link Destination Preview (Zero Outbound Request)
                                    </span>
                                    <span className="font-mono text-amber-950 dark:text-amber-200 text-xs">
                                        {selectedEmail.destination_url}
                                    </span>
                                </div>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold">
                                INERT
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Indicator Checklist & Submission Form */}
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Forensic Reasoning & Containment (Rubric: 100 Points)
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                        Document Findings & Recommend Containment Actions
                    </h3>
                </div>

                <div>
                    <InputLabel value="Analytical Reasoning (Why are the classified messages suspicious or authentic?):" />
                    <textarea
                        rows={3}
                        className="mt-1 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs p-3"
                        value={reasoning}
                        onChange={(e) => setReasoning(e.target.value)}
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
                    <PrimaryButton type="submit" disabled={isSubmitting || Object.keys(classifications).length < 6}>
                        <Send className="w-3.5 h-3.5 me-1.5" />
                        {isSubmitting ? 'Evaluating Rubric...' : 'Submit Laboratory 4 for Evaluation'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}
