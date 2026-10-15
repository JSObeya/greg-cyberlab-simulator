import React, { useState } from 'react';
import {
    Wrench,
    Play,
    RotateCcw,
    Copy,
    Check,
    ExternalLink,
    ChevronRight,
    Sliders,
    Trash2,
    Shield,
    Sparkles
} from 'lucide-react';

interface CyberChefDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialInput?: string;
}

interface Operation {
    id: string;
    name: string;
    cat: string;
    desc: string;
    run?: (input: string) => string;
    runAsync?: (input: string) => Promise<string>;
}

export default function CyberChefDrawer({ isOpen, onClose, initialInput = '' }: CyberChefDrawerProps) {
    const [input, setInput] = useState(initialInput);
    const [output, setOutput] = useState('');
    const [activeRecipe, setActiveRecipe] = useState<Operation[]>([]);
    const [copied, setCopied] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'all' | 'encoding' | 'hashing' | 'triage'>('all');

    const operations: Operation[] = [
        {
            id: 'from_base64',
            name: 'From Base64',
            cat: 'encoding',
            desc: 'Decode base64 encoded strings back to plaintext',
            run: (str) => {
                try {
                    return decodeURIComponent(escape(atob(str.trim().replace(/\s/g, ''))));
                } catch {
                    return atob(str.trim().replace(/\s/g, ''));
                }
            }
        },
        {
            id: 'to_base64',
            name: 'To Base64',
            cat: 'encoding',
            desc: 'Encode string into Base64 format',
            run: (str) => btoa(unescape(encodeURIComponent(str)))
        },
        {
            id: 'to_hex',
            name: 'To Hex',
            cat: 'encoding',
            desc: 'Convert characters to hexadecimal bytes',
            run: (str) => Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, '0')).join(' ')
        },
        {
            id: 'from_hex',
            name: 'From Hex',
            cat: 'encoding',
            desc: 'Convert hex bytes back to characters',
            run: (str) => {
                const clean = str.replace(/[^0-9a-fA-F]/g, '');
                let res = '';
                for (let i = 0; i < clean.length; i += 2) {
                    res += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
                }
                return res;
            }
        },
        {
            id: 'url_decode',
            name: 'URL Decode',
            cat: 'encoding',
            desc: 'Decode percent-encoded strings (%20, %2F)',
            run: (str) => decodeURIComponent(str)
        },
        {
            id: 'url_encode',
            name: 'URL Encode',
            cat: 'encoding',
            desc: 'Encode unsafe URI characters',
            run: (str) => encodeURIComponent(str)
        },
        {
            id: 'rot13',
            name: 'ROT13',
            cat: 'encoding',
            desc: 'Rotate alphabet by 13 places',
            run: (str) => str.replace(/[a-zA-Z]/g, c => {
                const base = c <= 'Z' ? 65 : 97;
                return String.fromCharCode(base + (c.charCodeAt(0) - base + 13) % 26);
            })
        },
        {
            id: 'defang_url',
            name: 'Defang URL',
            cat: 'triage',
            desc: 'Sanitize URLs and IPs for safe inclusion in incident reports',
            run: (str) => str.replace(/http/gi, 'hxxp').replace(/\./g, '[.]')
        },
        {
            id: 'refang_url',
            name: 'Refang URL',
            cat: 'triage',
            desc: 'Restore defanged URLs (hxxp -> http, [.] -> .)',
            run: (str) => str.replace(/hxxp/gi, 'http').replace(/\[\.\]/g, '.')
        },
        {
            id: 'extract_ips',
            name: 'Extract IPv4 Addresses',
            cat: 'triage',
            desc: 'Parse and pull out unique IPv4 addresses',
            run: (str) => {
                const matches = str.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
                return matches ? Array.from(new Set(matches)).join('\n') : 'No IPv4 addresses found';
            }
        },
        {
            id: 'extract_urls',
            name: 'Extract URLs',
            cat: 'triage',
            desc: 'Extract all web URLs found in the text',
            run: (str) => {
                const matches = str.match(/https?:\/\/[^\s"'<>]+/g);
                return matches ? Array.from(new Set(matches)).join('\n') : 'No URLs found';
            }
        },
        {
            id: 'sha256',
            name: 'SHA-256 Hash',
            cat: 'hashing',
            desc: 'Generate 256-bit cryptographic digest',
            runAsync: async (str) => {
                const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
                return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            }
        },
        {
            id: 'sha1',
            name: 'SHA-1 Hash',
            cat: 'hashing',
            desc: 'Generate SHA-1 hash digest',
            runAsync: async (str) => {
                const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
                return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            }
        }
    ];

    const addOperation = (op: Operation) => {
        const newRecipe = [...activeRecipe, op];
        setActiveRecipe(newRecipe);
        bakeRecipe(input, newRecipe);
    };

    const removeOperation = (index: number) => {
        const newRecipe = activeRecipe.filter((_, i) => i !== index);
        setActiveRecipe(newRecipe);
        bakeRecipe(input, newRecipe);
    };

    const clearRecipe = () => {
        setActiveRecipe([]);
        setOutput('');
    };

    const bakeRecipe = async (rawInput: string, recipe: Operation[]) => {
        if (recipe.length === 0) {
            setOutput(rawInput);
            return;
        }

        try {
            let current = rawInput;
            for (const op of recipe) {
                if (op.runAsync) {
                    current = await op.runAsync(current);
                } else if (op.run) {
                    current = op.run(current);
                }
            }
            setOutput(current);
        } catch (err: any) {
            setOutput(`[Error during recipe execution]: ${err.message}`);
        }
    };

    const handleInputChange = (val: string) => {
        setInput(val);
        bakeRecipe(val, activeRecipe);
    };

    const copyOutput = () => {
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    const filteredOps = operations.filter(op => activeCategory === 'all' || op.cat === activeCategory);

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[580px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col font-sans transition-all duration-300">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                        <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            CyberChef Assistant
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">Sandboxed</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">Decoders, Hashes, Ciphers & SOC Defanging</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <a
                        href="/tools/cyberchef/index.html"
                        target="_blank"
                        rel="noreferrer"
                        title="Open Full Standalone CyberChef in New Window"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-bold"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Full Studio</span>
                    </a>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-sm font-bold"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Quick Operations Strip */}
            <div className="p-3 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 text-[11px]">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-2 py-0.5 rounded font-bold transition ${activeCategory === 'all' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setActiveCategory('encoding')}
                        className={`px-2 py-0.5 rounded font-bold transition ${activeCategory === 'encoding' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        Encoding
                    </button>
                    <button
                        onClick={() => setActiveCategory('hashing')}
                        className={`px-2 py-0.5 rounded font-bold transition ${activeCategory === 'hashing' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        Hashing
                    </button>
                    <button
                        onClick={() => setActiveCategory('triage')}
                        className={`px-2 py-0.5 rounded font-bold transition ${activeCategory === 'triage' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        Defang / Triage
                    </button>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                    {activeRecipe.length} in recipe
                </div>
            </div>

            {/* Operations Catalog */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5 text-xs">
                {filteredOps.map((op) => (
                    <button
                        key={op.id}
                        onClick={() => addOperation(op)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-700 hover:bg-slate-800 text-left transition flex items-center justify-between group"
                    >
                        <span className="font-bold text-slate-300 group-hover:text-cyan-400 text-[11px] truncate">{op.name}</span>
                        <span className="text-[10px] text-slate-500 font-bold px-1.5 py-0.5 rounded bg-slate-900 group-hover:bg-cyan-950 group-hover:text-cyan-300">+</span>
                    </button>
                ))}
            </div>

            {/* Active Recipe Chain */}
            <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex flex-wrap items-center gap-1.5 min-h-[44px]">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1">Recipe:</span>
                {activeRecipe.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">No recipe operations selected. Click an operation above.</span>
                ) : (
                    <>
                        {activeRecipe.map((op, idx) => (
                            <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-mono">
                                <span>{op.name}</span>
                                <button
                                    onClick={() => removeOperation(idx)}
                                    className="text-cyan-500 hover:text-red-400 font-bold ml-1"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={clearRecipe}
                            className="text-[10px] text-red-400 hover:text-red-300 ml-auto font-bold flex items-center gap-1"
                        >
                            <Trash2 className="w-3 h-3" /> Clear
                        </button>
                    </>
                )}
            </div>

            {/* Input & Output Workspace */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Input Area */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Input String / Payload</label>
                        <span className="text-[10px] text-slate-500 font-mono">{input.length} chars</span>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Paste encoded base64, hash, URL, or hex payload to process..."
                        rows={5}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono focus:border-cyan-500 focus:outline-none resize-none leading-relaxed"
                    />
                </div>

                {/* Output Area */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                        <label className="font-bold text-cyan-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" /> Baked Result
                        </label>
                        {output && (
                            <button
                                onClick={copyOutput}
                                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                {copied ? 'Copied!' : 'Copy Result'}
                            </button>
                        )}
                    </div>
                    <textarea
                        readOnly
                        value={output}
                        placeholder="Processed output will display automatically here..."
                        rows={6}
                        className="w-full bg-slate-950/90 border border-slate-800 rounded-xl p-3 text-xs text-emerald-400 font-mono focus:outline-none resize-none leading-relaxed"
                    />
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px]">All operations run locally in browser memory.</span>
                <button
                    onClick={() => {
                        setInput('R1JFRyAmIENPLiBJQ1QgQUNBREVNWSAtIENZQkVSTEFCCg==');
                        const op = operations.find(o => o.id === 'from_base64');
                        if (op) {
                            setActiveRecipe([op]);
                            bakeRecipe('R1JFRyAmIENPLiBJQ1QgQUNBREVNWSAtIENZQkVSTEFCCg==', [op]);
                        }
                    }}
                    className="text-[11px] font-bold text-cyan-400 hover:underline"
                >
                    Load Sample Base64
                </button>
            </div>
        </div>
    );
}
