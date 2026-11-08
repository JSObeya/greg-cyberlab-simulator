import React, { useState, useEffect } from 'react';
import {
    Wrench,
    Play,
    RotateCcw,
    Copy,
    Check,
    ExternalLink,
    ChevronDown,
    ChevronRight,
    Sliders,
    Trash2,
    Shield,
    Sparkles,
    SlidersHorizontal,
    FileText,
    ArrowDown,
    HelpCircle,
    X
} from 'lucide-react';

interface CyberChefDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    initialInput?: string;
}

interface ArgDefinition {
    name: string;
    label: string;
    type: 'select' | 'text' | 'number' | 'boolean';
    value: any;
    options?: string[];
}

interface CatalogOperation {
    id: string;
    name: string;
    cat: 'encoding' | 'hashing' | 'triage' | 'ciphers';
    desc: string;
    args: ArgDefinition[];
    getSignature: (args: Record<string, any>) => string;
    run?: (input: string, args: Record<string, any>) => string;
    runAsync?: (input: string, args: Record<string, any>) => Promise<string>;
}

interface RecipeItemInstance {
    instanceId: string;
    catalogId: string;
    name: string;
    cat: string;
    desc: string;
    argsDef: ArgDefinition[];
    args: Record<string, any>;
    isExpanded: boolean;
    isEnabled: boolean;
    getSignature: (args: Record<string, any>) => string;
    run?: (input: string, args: Record<string, any>) => string;
    runAsync?: (input: string, args: Record<string, any>) => Promise<string>;
}

export default function CyberChefDrawer({ isOpen, onClose, initialInput = '' }: CyberChefDrawerProps) {
    const [input, setInput] = useState(initialInput);
    const [output, setOutput] = useState('');
    const [activeRecipe, setActiveRecipe] = useState<RecipeItemInstance[]>([]);
    const [copied, setCopied] = useState(false);
    const [recipeCopied, setRecipeCopied] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'all' | 'encoding' | 'hashing' | 'triage' | 'ciphers'>('all');
    const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
    const [recipeTextInput, setRecipeTextInput] = useState('');

    useEffect(() => {
        if (initialInput && initialInput !== input) {
            setInput(initialInput);
            bakeRecipe(initialInput, activeRecipe);
        }
    }, [initialInput]);

    const operationsCatalog: CatalogOperation[] = [
        {
            id: 'from_hex',
            name: 'From Hex',
            cat: 'encoding',
            desc: 'Converts hexadecimal bytes back to ASCII or UTF-8 text',
            args: [
                {
                    name: 'delimiter',
                    label: 'Delimiter',
                    type: 'select',
                    value: 'Auto',
                    options: ['Auto', 'None', 'Space', '0x', 'Comma', 'Semi-colon', 'Colon', 'Line feed']
                }
            ],
            getSignature: (args) => `('${args.delimiter}')`,
            run: (str, args) => {
                const delim = args.delimiter || 'Auto';
                let hex = str;
                if (delim === 'Auto') {
                    hex = hex.replace(/0x/gi, '').replace(/[^0-9a-fA-F]/g, '');
                } else if (delim === 'Space') {
                    hex = hex.split(/\s+/).join('');
                } else if (delim === 'Comma') {
                    hex = hex.split(',').join('');
                } else if (delim === 'Colon') {
                    hex = hex.split(':').join('');
                } else if (delim === '0x') {
                    hex = hex.replace(/0x/gi, '').replace(/\s+/g, '');
                } else if (delim === 'None') {
                    hex = hex.replace(/\s+/g, '');
                } else {
                    hex = hex.replace(/[^0-9a-fA-F]/g, '');
                }

                let res = '';
                for (let i = 0; i < hex.length; i += 2) {
                    const byte = hex.substr(i, 2);
                    if (byte.length === 2) {
                        res += String.fromCharCode(parseInt(byte, 16));
                    }
                }
                return res;
            }
        },
        {
            id: 'to_hex',
            name: 'To Hex',
            cat: 'encoding',
            desc: 'Converts characters to hexadecimal byte representation',
            args: [
                {
                    name: 'delimiter',
                    label: 'Delimiter',
                    type: 'select',
                    value: 'Space',
                    options: ['Space', 'None', '0x', 'Comma', 'Colon', 'Line feed']
                }
            ],
            getSignature: (args) => `('${args.delimiter}')`,
            run: (str, args) => {
                const delim = args.delimiter || 'Space';
                const bytes = Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, '0'));
                if (delim === 'Space') return bytes.join(' ');
                if (delim === 'None') return bytes.join('');
                if (delim === '0x') return bytes.map(b => '0x' + b).join(' ');
                if (delim === 'Comma') return bytes.join(',');
                if (delim === 'Colon') return bytes.join(':');
                if (delim === 'Line feed') return bytes.join('\n');
                return bytes.join(' ');
            }
        },
        {
            id: 'from_base64',
            name: 'From Base64',
            cat: 'encoding',
            desc: 'Decode base64 encoded strings back to plaintext',
            args: [
                {
                    name: 'alphabet',
                    label: 'Alphabet',
                    type: 'select',
                    value: 'A-Za-z0-9+/=',
                    options: ['A-Za-z0-9+/=', 'A-Za-z0-9-_']
                },
                {
                    name: 'removeNonAlphabet',
                    label: 'Remove non-alphabet chars',
                    type: 'boolean',
                    value: true
                },
                {
                    name: 'strictMode',
                    label: 'Strict mode',
                    type: 'boolean',
                    value: false
                }
            ],
            getSignature: (args) => `('${args.alphabet}',${args.removeNonAlphabet},${args.strictMode})`,
            run: (str, args) => {
                let cleaned = str;
                if (args.removeNonAlphabet) {
                    cleaned = cleaned.replace(/\s+/g, '');
                }
                if (args.alphabet === 'A-Za-z0-9-_') {
                    cleaned = cleaned.replace(/-/g, '+').replace(/_/g, '/');
                    while (cleaned.length % 4) cleaned += '=';
                }
                try {
                    return decodeURIComponent(escape(atob(cleaned)));
                } catch {
                    return atob(cleaned);
                }
            }
        },
        {
            id: 'to_base64',
            name: 'To Base64',
            cat: 'encoding',
            desc: 'Encode string into Base64 format',
            args: [
                {
                    name: 'alphabet',
                    label: 'Alphabet',
                    type: 'select',
                    value: 'A-Za-z0-9+/=',
                    options: ['A-Za-z0-9+/=', 'A-Za-z0-9-_']
                }
            ],
            getSignature: (args) => `('${args.alphabet}')`,
            run: (str, args) => {
                let b64 = btoa(unescape(encodeURIComponent(str)));
                if (args.alphabet === 'A-Za-z0-9-_') {
                    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                }
                return b64;
            }
        },
        {
            id: 'xor',
            name: 'XOR',
            cat: 'ciphers',
            desc: 'Bitwise XOR operation against a key with multiple encoding formats',
            args: [
                {
                    name: 'key',
                    label: 'Key',
                    type: 'text',
                    value: '42'
                },
                {
                    name: 'keyFormat',
                    label: 'Key Format',
                    type: 'select',
                    value: 'Hex',
                    options: ['Hex', 'UTF8', 'Decimal']
                }
            ],
            getSignature: (args) => `('${args.key}', '${args.keyFormat}')`,
            run: (str, args) => {
                let keyBytes: number[] = [];
                const keyStr = args.key || '00';
                if (args.keyFormat === 'Hex') {
                    const clean = keyStr.replace(/[^0-9a-fA-F]/g, '');
                    for (let i = 0; i < clean.length; i += 2) {
                        keyBytes.push(parseInt(clean.substr(i, 2), 16) || 0);
                    }
                } else if (args.keyFormat === 'Decimal') {
                    keyBytes = [parseInt(keyStr, 10) & 0xff];
                } else {
                    keyBytes = Array.from(new TextEncoder().encode(keyStr));
                }

                if (keyBytes.length === 0) keyBytes = [0];

                const inputBytes = new TextEncoder().encode(str);
                const outputBytes = new Uint8Array(inputBytes.length);

                for (let i = 0; i < inputBytes.length; i++) {
                    outputBytes[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
                }

                return new TextDecoder('utf-8', { fatal: false }).decode(outputBytes);
            }
        },
        {
            id: 'rot13',
            name: 'ROT13',
            cat: 'ciphers',
            desc: 'Rotate alphabet characters by N positions (default 13)',
            args: [
                {
                    name: 'amount',
                    label: 'Amount (0-25)',
                    type: 'number',
                    value: 13
                }
            ],
            getSignature: (args) => `(${args.amount})`,
            run: (str, args) => {
                const shift = (parseInt(args.amount) || 13) % 26;
                return str.replace(/[a-zA-Z]/g, c => {
                    const isUpper = c <= 'Z';
                    const base = isUpper ? 65 : 97;
                    return String.fromCharCode(base + (c.charCodeAt(0) - base + shift) % 26);
                });
            }
        },
        {
            id: 'url_decode',
            name: 'URL Decode',
            cat: 'encoding',
            desc: 'Decode percent-encoded strings (%20, %2F)',
            args: [],
            getSignature: () => `()`,
            run: (str) => decodeURIComponent(str)
        },
        {
            id: 'url_encode',
            name: 'URL Encode',
            cat: 'encoding',
            desc: 'Encode unsafe URI characters',
            args: [],
            getSignature: () => `()`,
            run: (str) => encodeURIComponent(str)
        },
        {
            id: 'defang_url',
            name: 'Defang URL',
            cat: 'triage',
            desc: 'Sanitize URLs and IPs for safe inclusion in incident reports',
            args: [
                {
                    name: 'defangHttp',
                    label: 'Defang http -> hxxp',
                    type: 'boolean',
                    value: true
                },
                {
                    name: 'defangDots',
                    label: 'Defang dots -> [.]',
                    type: 'boolean',
                    value: true
                }
            ],
            getSignature: (args) => `(${args.defangHttp}, ${args.defangDots})`,
            run: (str, args) => {
                let res = str;
                if (args.defangHttp) res = res.replace(/http/gi, 'hxxp');
                if (args.defangDots) res = res.replace(/\./g, '[.]');
                return res;
            }
        },
        {
            id: 'refang_url',
            name: 'Refang URL',
            cat: 'triage',
            desc: 'Restore defanged URLs (hxxp -> http, [.] -> .)',
            args: [],
            getSignature: () => `()`,
            run: (str) => str.replace(/hxxp/gi, 'http').replace(/\[\.\]/g, '.')
        },
        {
            id: 'extract_ips',
            name: 'Extract IPv4 Addresses',
            cat: 'triage',
            desc: 'Parse and pull out unique IPv4 addresses',
            args: [
                {
                    name: 'uniqueOnly',
                    label: 'Unique Only',
                    type: 'boolean',
                    value: true
                }
            ],
            getSignature: (args) => `(${args.uniqueOnly})`,
            run: (str, args) => {
                const matches = str.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g);
                if (!matches) return 'No IPv4 addresses found';
                return args.uniqueOnly ? Array.from(new Set(matches)).join('\n') : matches.join('\n');
            }
        },
        {
            id: 'extract_urls',
            name: 'Extract URLs',
            cat: 'triage',
            desc: 'Extract all web URLs found in the text',
            args: [
                {
                    name: 'uniqueOnly',
                    label: 'Unique Only',
                    type: 'boolean',
                    value: true
                }
            ],
            getSignature: (args) => `(${args.uniqueOnly})`,
            run: (str, args) => {
                const matches = str.match(/https?:\/\/[^\s"'<>]+/g);
                if (!matches) return 'No URLs found';
                return args.uniqueOnly ? Array.from(new Set(matches)).join('\n') : matches.join('\n');
            }
        },
        {
            id: 'sha256',
            name: 'SHA-256 Hash',
            cat: 'hashing',
            desc: 'Generate 256-bit cryptographic digest',
            args: [],
            getSignature: () => `()`,
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
            args: [],
            getSignature: () => `()`,
            runAsync: async (str) => {
                const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(str));
                return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
            }
        },
        {
            id: 'entropy',
            name: 'Entropy',
            cat: 'hashing',
            desc: 'Calculates Shannon entropy score (0 to 8 bits). >7.2 indicates encryption.',
            args: [],
            getSignature: () => `()`,
            run: (str) => {
                if (!str.length) return 'Entropy: 0.0000 bits';
                const freq: Record<string, number> = {};
                for (let i = 0; i < str.length; i++) {
                    freq[str[i]] = (freq[str[i]] || 0) + 1;
                }
                let ent = 0;
                for (const char in freq) {
                    const p = freq[char] / str.length;
                    ent -= p * Math.log2(p);
                }
                const note = ent >= 7.2 ? ' [HIGH ENTROPY - ENCRYPTED/COMPRESSED]' : ' [NORMAL TEXT ENTROPY]';
                return `Shannon Entropy: ${ent.toFixed(4)} bits per byte${note}`;
            }
        }
    ];

    const addOperation = (catOp: CatalogOperation, initialArgs: Record<string, any> | null = null) => {
        const argsState: Record<string, any> = {};
        (catOp.args || []).forEach(arg => {
            argsState[arg.name] = (initialArgs && initialArgs[arg.name] !== undefined)
                ? initialArgs[arg.name]
                : arg.value;
        });

        const newInstance: RecipeItemInstance = {
            instanceId: 'op_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            catalogId: catOp.id,
            name: catOp.name,
            cat: catOp.cat,
            desc: catOp.desc,
            argsDef: catOp.args || [],
            args: argsState,
            isExpanded: true, // Open by default for interaction!
            isEnabled: true,
            getSignature: catOp.getSignature,
            run: catOp.run,
            runAsync: catOp.runAsync
        };

        const newRecipe = [...activeRecipe, newInstance];
        setActiveRecipe(newRecipe);
        bakeRecipe(input, newRecipe);
    };

    const removeOperation = (index: number) => {
        const newRecipe = activeRecipe.filter((_, i) => i !== index);
        setActiveRecipe(newRecipe);
        bakeRecipe(input, newRecipe);
    };

    const toggleOperationExpand = (index: number) => {
        const newRecipe = [...activeRecipe];
        newRecipe[index].isExpanded = !newRecipe[index].isExpanded;
        setActiveRecipe(newRecipe);
    };

    const toggleOperationEnabled = (index: number) => {
        const newRecipe = [...activeRecipe];
        newRecipe[index].isEnabled = !newRecipe[index].isEnabled;
        setActiveRecipe(newRecipe);
        bakeRecipe(input, newRecipe);
    };

    const updateOpArgument = (index: number, argName: string, val: any) => {
        const newRecipe = [...activeRecipe];
        newRecipe[index].args = {
            ...newRecipe[index].args,
            [argName]: val
        };
        setActiveRecipe(newRecipe);
        bakeRecipe(input, newRecipe);
    };

    const clearRecipe = () => {
        setActiveRecipe([]);
        setOutput('');
    };

    const bakeRecipe = async (rawInput: string, recipe: RecipeItemInstance[]) => {
        const activeOps = recipe.filter(op => op.isEnabled);
        if (activeOps.length === 0) {
            setOutput(rawInput);
            return;
        }

        try {
            let current = rawInput;
            for (const op of activeOps) {
                if (op.runAsync) {
                    current = await op.runAsync(current, op.args);
                } else if (op.run) {
                    current = op.run(current, op.args);
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

    const copyRecipeSyntax = () => {
        if (activeRecipe.length === 0) return;
        const text = activeRecipe.map(op => `${op.name}${op.getSignature(op.args)}`).join('\n');
        navigator.clipboard.writeText(text);
        setRecipeCopied(true);
        setTimeout(() => setRecipeCopied(false), 2000);
    };

    const applyPastedRecipe = () => {
        const lines = recipeTextInput.trim().split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;
            const match = trimmed.match(/^([a-zA-Z0-9_\-\s]+)\((.*)\)$/);
            let opName = trimmed;
            let rawArgs = '';
            if (match) {
                opName = match[1].trim();
                rawArgs = match[2].trim();
            }

            const found = operationsCatalog.find(o => 
                o.name.toLowerCase() === opName.toLowerCase() || 
                o.id.toLowerCase() === opName.toLowerCase()
            );

            if (found) {
                const parsedArgs: Record<string, any> = {};
                if (rawArgs) {
                    const tokens = rawArgs.split(',').map(t => {
                        let s = t.trim();
                        if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
                            return s.substring(1, s.length - 1);
                        }
                        if (s.toLowerCase() === 'true') return true;
                        if (s.toLowerCase() === 'false') return false;
                        if (!isNaN(Number(s))) return Number(s);
                        return s;
                    });
                    (found.args || []).forEach((argDef, i) => {
                        if (tokens[i] !== undefined) {
                            parsedArgs[argDef.name] = tokens[i];
                        }
                    });
                }
                addOperation(found, parsedArgs);
            }
        });
        setIsLoadModalOpen(false);
        setRecipeTextInput('');
    };

    if (!isOpen) return null;

    const filteredOps = operationsCatalog.filter(op => activeCategory === 'all' || op.cat === activeCategory);

    return (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[620px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col font-sans transition-all duration-300">
            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-800 text-cyan-400">
                        <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                            CyberChef Assistant
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">Interactive</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">Decoders, Hashes, Ciphers & Tactical Recipe Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsLoadModalOpen(true)}
                        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition"
                        title="Load / Paste Recipe Syntax"
                    >
                        Paste Recipe
                    </button>
                    <a
                        href="/tools/cyberchef/index.html"
                        target="_blank"
                        rel="noreferrer"
                        title="Open Full Standalone CyberChef in New Window"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1 text-[11px] font-bold"
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Studio</span>
                    </a>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 text-sm font-bold"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Operations Filter Pill Bar */}
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
                        onClick={() => setActiveCategory('ciphers')}
                        className={`px-2 py-0.5 rounded font-bold transition ${activeCategory === 'ciphers' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        Ciphers
                    </button>
                    <button
                        onClick={() => setActiveCategory('triage')}
                        className={`px-2 py-0.5 rounded font-bold transition ${activeCategory === 'triage' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                    >
                        Triage
                    </button>
                </div>

                <div className="text-[10px] text-slate-400 font-mono">
                    {activeRecipe.length} ops in recipe
                </div>
            </div>

            {/* Quick Operations Palette */}
            <div className="p-3 bg-slate-900 border-b border-slate-800 max-h-32 overflow-y-auto grid grid-cols-2 gap-1.5 text-xs shrink-0">
                {filteredOps.map((op) => (
                    <button
                        key={op.id}
                        onClick={() => addOperation(op)}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-700 hover:bg-slate-800 text-left transition flex items-center justify-between group"
                    >
                        <span className="font-bold text-slate-300 group-hover:text-cyan-400 text-[11px] truncate">
                            {op.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold px-1.5 py-0.2 rounded bg-slate-900 group-hover:bg-cyan-950 group-hover:text-cyan-300">
                            +
                        </span>
                    </button>
                ))}
            </div>

            {/* Interactive Recipe Pipeline Deck */}
            <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Recipe Pipeline (Click card to configure args)
                    </span>
                </div>
                {activeRecipe.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyRecipeSyntax}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold"
                        >
                            {recipeCopied ? 'Copied Recipe!' : 'Copy Recipe'}
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                            onClick={clearRecipe}
                            className="text-[10px] text-red-400 hover:text-red-300"
                        >
                            Clear
                        </button>
                    </div>
                )}
            </div>

            {/* Recipe Items with Interactive Configuration Trays */}
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto border-b border-slate-800 bg-slate-950/40 shrink-0">
                {activeRecipe.length === 0 ? (
                    <div className="text-center py-4 text-xs text-slate-500 italic">
                        No recipe operations selected. Click an operation from above or paste a recipe.
                    </div>
                ) : (
                    activeRecipe.map((item, index) => (
                        <div
                            key={item.instanceId}
                            className={`rounded-xl border transition overflow-hidden ${
                                !item.isEnabled
                                    ? 'opacity-50 border-slate-800 bg-slate-950'
                                    : item.isExpanded
                                    ? 'border-cyan-500/50 bg-slate-900 shadow-sm'
                                    : 'border-slate-800 bg-slate-900/70'
                            }`}
                        >
                            {/* Card Header Row */}
                            <div
                                onClick={() => toggleOperationExpand(index)}
                                className="px-3 py-1.5 bg-slate-950/80 flex items-center justify-between cursor-pointer select-none"
                            >
                                <div className="flex items-center gap-2 overflow-hidden pr-2">
                                    <span className="text-cyan-400 font-bold text-[10px]">
                                        {item.isExpanded ? '▼' : '▶'}
                                    </span>
                                    <span className="w-4 h-4 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] flex items-center justify-center font-bold shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className="font-bold text-slate-200 text-xs truncate">
                                        {item.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-950/50 px-1 rounded border border-cyan-900/60 truncate">
                                        {item.getSignature ? item.getSignature(item.args) : '()'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleOperationEnabled(index);
                                        }}
                                        className={`px-1 py-0.5 rounded text-[9px] font-bold ${item.isEnabled ? 'text-emerald-400 hover:bg-emerald-950/60' : 'text-slate-500 hover:bg-slate-800'}`}
                                    >
                                        {item.isEnabled ? 'ON' : 'BYP'}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeOperation(index);
                                        }}
                                        className="text-slate-500 hover:text-red-400 text-xs px-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Configuration Box (Interactive Tray) */}
                            {item.isExpanded && item.argsDef.length > 0 && (
                                <div className="p-2.5 bg-slate-900 border-t border-slate-800/80 space-y-2 text-xs">
                                    {item.argsDef.map((arg) => (
                                        <div key={arg.name} className="flex items-center justify-between gap-2">
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {arg.label}:
                                            </span>

                                            {arg.type === 'select' ? (
                                                <select
                                                    value={item.args[arg.name]}
                                                    onChange={(e) => updateOpArgument(index, arg.name, e.target.value)}
                                                    className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                                                >
                                                    {arg.options?.map((opt) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : arg.type === 'boolean' ? (
                                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!item.args[arg.name]}
                                                        onChange={(e) => updateOpArgument(index, arg.name, e.target.checked)}
                                                        className="rounded bg-slate-800 border-slate-700 text-cyan-600 focus:ring-0"
                                                    />
                                                    <span className="text-[11px] text-slate-300">
                                                        {item.args[arg.name] ? 'Yes' : 'No'}
                                                    </span>
                                                </label>
                                            ) : (
                                                <input
                                                    type="text"
                                                    value={item.args[arg.name]}
                                                    onChange={(e) => updateOpArgument(index, arg.name, e.target.value)}
                                                    className="w-36 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Split Input & Output Editor */}
            <div className="flex-1 flex flex-col min-h-0 bg-slate-950 p-4 space-y-3 overflow-y-auto">
                {/* Input Area */}
                <div className="flex-1 flex flex-col min-h-[120px]">
                    <div className="flex items-center justify-between pb-1.5 text-xs">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Input Payload</span>
                        <button
                            onClick={() => handleInputChange('')}
                            className="text-slate-500 hover:text-slate-300 text-[10px]"
                        >
                            Clear
                        </button>
                    </div>
                    <textarea
                        value={input}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder="Paste or type raw forensic text, hex bytes, or base64 token..."
                        className="flex-1 w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                    />
                </div>

                {/* Output Area */}
                <div className="flex-1 flex flex-col min-h-[120px]">
                    <div className="flex items-center justify-between pb-1.5 text-xs">
                        <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            Decoded / Baked Output
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleInputChange(output)}
                                className="text-slate-400 hover:text-slate-200 text-[10px] bg-slate-800 px-2 py-0.5 rounded"
                            >
                                Output ➔ Input
                            </button>
                            <button
                                onClick={copyOutput}
                                className="text-cyan-400 hover:text-cyan-300 text-[10px] flex items-center gap-1 font-bold"
                            >
                                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copied ? 'Copied' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>
                    <textarea
                        value={output}
                        readOnly
                        placeholder="Baked result will appear here..."
                        className="flex-1 w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-emerald-300 placeholder-slate-600 focus:outline-none font-mono resize-none"
                    />
                </div>
            </div>

            {/* Modal: Load Recipe Syntax */}
            {isLoadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-cyan-400" /> Paste CyberChef Recipe
                            </h3>
                            <button onClick={() => setIsLoadModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div>
                            <p className="text-[11px] text-slate-400 mb-2">
                                Paste standard recipe lines:
                            </p>
                            <textarea
                                rows={5}
                                value={recipeTextInput}
                                onChange={(e) => setRecipeTextInput(e.target.value)}
                                placeholder="From Hex('Auto')&#10;From Base64('A-Za-z0-9+/=',true,false)"
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-cyan-300 font-mono placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                onClick={() => setIsLoadModalOpen(false)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={applyPastedRecipe}
                                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
                            >
                                Apply Recipe
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
