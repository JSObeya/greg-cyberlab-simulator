import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Handle,
    Position,
    NodeProps
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
    Shield,
    ShieldAlert,
    ShieldCheck,
    Server,
    Laptop,
    Skull,
    Globe,
    Network,
    Terminal,
    Play,
    RotateCcw,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Search,
    Bug,
    Eye,
    Radio,
    Activity,
    Filter,
    Lock,
    Unlock,
    FileText,
    ChevronRight,
    X,
    ArrowRight,
    Layers,
    Database,
    Zap,
    Download,
    Save,
    Flame
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type CyberTool = 'pointer' | 'wireshark' | 'nmap' | 'vuln_lens' | 'traffic_gen';

export interface DeviceData extends Record<string, any> {
    id: string;
    label: string;
    hostname: string;
    ip: string;
    type: 'firewall' | 'router' | 'web' | 'dc' | 'db' | 'workstation' | 'attacker' | 'internet' | 'siem';
    zone: 'WAN' | 'DMZ' | 'LAN' | 'EXTERNAL';
    status: 'healthy' | 'vulnerable' | 'breached' | 'protected';
    os: string;
    ports: Array<{ port: number; proto: 'tcp' | 'udp'; service: string; state: 'open' | 'filtered' | 'closed'; exposed: boolean }>;
    vulnerabilities?: Array<{
        cve: string;
        cvss: number;
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
        title: string;
        description: string;
        remediation: string;
    }>;
    firewallRules?: Array<{
        id: number;
        name: string;
        src: string;
        dst: string;
        port: string;
        proto: string;
        action: 'ALLOW' | 'DROP' | string;
        isRemediated: boolean;
        isVulnerableExposure: boolean;
    }>;
    activeTool?: CyberTool;
}

export interface PacketFrame {
    no: number;
    time: string;
    src: string;
    dst: string;
    proto: 'TCP' | 'HTTP' | 'HTTPS' | 'RDP' | 'DNS' | 'ICMP' | 'SSH';
    len: number;
    info: string;
    alert?: boolean;
    payload?: string;
}

// ============================================================================
// CUSTOM DEVICE NODE COMPONENT
// ============================================================================
const DeviceNode = ({ data, selected }: any) => {
    const isBreached = data.status === 'breached';
    const isVulnerable = data.status === 'vulnerable';

    const getIcon = () => {
        switch (data.type) {
            case 'firewall':
                return data.status === 'protected' ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                ) : (
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                );
            case 'attacker':
                return <Skull className="w-5 h-5 text-red-500 animate-pulse" />;
            case 'internet':
                return <Globe className="w-5 h-5 text-blue-400" />;
            case 'web':
                return <Server className="w-5 h-5 text-cyan-400" />;
            case 'dc':
                return <Server className="w-5 h-5 text-purple-400" />;
            case 'db':
                return <Database className="w-5 h-5 text-yellow-400" />;
            case 'siem':
                return <Activity className="w-5 h-5 text-emerald-400" />;
            default:
                return <Laptop className="w-5 h-5 text-slate-300" />;
        }
    };

    const getZoneColor = () => {
        switch (data.zone) {
            case 'WAN':
            case 'EXTERNAL':
                return 'bg-red-500/10 text-red-400 border-red-500/30';
            case 'DMZ':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            case 'LAN':
                return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            default:
                return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        }
    };

    return (
        <div
            className={`relative rounded-xl p-3 min-w-[170px] max-w-[210px] transition-all backdrop-blur-md shadow-lg select-none ${
                isBreached
                    ? 'border-2 border-red-500 bg-red-950/80 shadow-red-500/40 animate-pulse'
                    : isVulnerable
                    ? 'border-2 border-amber-500 bg-slate-900/90 shadow-amber-500/20'
                    : selected
                    ? 'border-2 border-cyan-400 bg-slate-900 shadow-cyan-400/30 ring-2 ring-cyan-400/20'
                    : 'border border-slate-700/80 bg-slate-900/90 hover:border-slate-500'
            }`}
        >
            {/* Connection Handles */}
            <Handle
                type="target"
                position={Position.Left}
                className="w-3 h-3 bg-cyan-400 border-2 border-slate-900 !rounded-full -left-1.5"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="w-3 h-3 bg-cyan-400 border-2 border-slate-900 !rounded-full -right-1.5"
            />
            <Handle
                type="target"
                position={Position.Top}
                id="top"
                className="w-2.5 h-2.5 bg-blue-400 border-2 border-slate-900 !rounded-full -top-1.5"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                id="bottom"
                className="w-2.5 h-2.5 bg-purple-400 border-2 border-slate-900 !rounded-full -bottom-1.5"
            />

            {/* Header with Zone Badge */}
            <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5">
                    {getIcon()}
                    <span className="text-xs font-bold text-slate-100 truncate">{data.label}</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold ${getZoneColor()}`}>
                    {data.zone}
                </span>
            </div>

            {/* IP Address & Hostname */}
            <div className="bg-slate-950/80 rounded px-2 py-1 border border-slate-800/80 font-mono text-[10px] space-y-0.5">
                <div className="text-cyan-300 font-semibold flex items-center justify-between">
                    <span>{data.ip}</span>
                    <span className="text-[9px] text-slate-500">IPv4</span>
                </div>
                <div className="text-slate-400 truncate text-[9px]">{data.hostname}</div>
            </div>

            {/* Active Port Pills */}
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap gap-1">
                {data.ports?.slice(0, 3).map((p: any) => (
                    <span
                        key={p.port}
                        className={`text-[8px] font-mono px-1 rounded flex items-center gap-0.5 ${
                            p.exposed && p.port === 3389
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold animate-pulse'
                                : 'bg-slate-800 text-slate-300'
                        }`}
                        title={`${p.service} (${p.proto.toUpperCase()})`}
                    >
                        {p.port}
                        <span className="opacity-60">{p.service}</span>
                    </span>
                ))}
                {data.ports?.length > 3 && (
                    <span className="text-[8px] font-mono px-1 text-slate-500">
                        +{data.ports.length - 3}
                    </span>
                )}
            </div>

            {/* Vulnerability Alert Marker */}
            {isVulnerable && (
                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="truncate">WAN Exposure Alert</span>
                </div>
            )}
            {isBreached && (
                <div className="mt-1.5 flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/50">
                    <Flame className="w-3 h-3 shrink-0" />
                    <span className="truncate">RDP Hijacked!</span>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// INITIAL TOPOLOGY PRESET (LAB 10 DMZ & ROGUE RDP SCENARIO)
// ============================================================================
const initialDevices: DeviceData[] = [
    {
        id: 'dev_attacker',
        label: 'External Adversary',
        hostname: 'kali-recon.threat.net',
        ip: '198.51.100.44',
        type: 'attacker',
        zone: 'EXTERNAL',
        status: 'healthy',
        os: 'Kali Linux 2024.1 (Offensive Pentest)',
        ports: [
            { port: 4444, proto: 'tcp', service: 'msf-handler', state: 'open', exposed: true }
        ],
        vulnerabilities: []
    },
    {
        id: 'dev_internet',
        label: 'Public Internet / WAN',
        hostname: 'edge-gw.isp.net',
        ip: '203.0.113.1',
        type: 'internet',
        zone: 'WAN',
        status: 'healthy',
        os: 'Cisco BGP Border Gateway',
        ports: [
            { port: 80, proto: 'tcp', service: 'http', state: 'open', exposed: false },
            { port: 443, proto: 'tcp', service: 'https', state: 'open', exposed: false }
        ],
        vulnerabilities: []
    },
    {
        id: 'dev_firewall',
        label: 'Perimeter Next-Gen Firewall',
        hostname: 'ngfw-perimeter.corp.local',
        ip: '203.0.113.254',
        type: 'firewall',
        zone: 'WAN',
        status: 'vulnerable',
        os: 'pfSense 2.7.2-RELEASE (Stateful Inspection)',
        ports: [
            { port: 443, proto: 'tcp', service: 'webconfig', state: 'filtered', exposed: false },
            { port: 22, proto: 'tcp', service: 'ssh', state: 'filtered', exposed: false }
        ],
        firewallRules: [
            {
                id: 1,
                name: 'Allow Inbound HTTPS to DMZ Web',
                src: '0.0.0.0/0',
                dst: '192.168.10.80',
                port: '443',
                proto: 'TCP',
                action: 'ALLOW',
                isRemediated: true,
                isVulnerableExposure: false
            },
            {
                id: 2,
                name: 'WAN to Domain Controller (UNSAFE EXPOSURE)',
                src: '0.0.0.0/0',
                dst: '10.0.0.10',
                port: '3389',
                proto: 'TCP',
                action: 'ALLOW',
                isRemediated: false,
                isVulnerableExposure: true
            },
            {
                id: 3,
                name: 'Authenticated VPN to LAN Admin',
                src: '172.16.0.0/24',
                dst: '10.0.0.0/24',
                port: 'ANY',
                proto: 'ANY',
                action: 'ALLOW',
                isRemediated: true,
                isVulnerableExposure: false
            },
            {
                id: 4,
                name: 'Default Inbound Deny',
                src: 'ANY',
                dst: 'ANY',
                port: 'ANY',
                proto: 'ANY',
                action: 'DROP',
                isRemediated: true,
                isVulnerableExposure: false
            }
        ]
    },
    {
        id: 'dev_dmz_web',
        label: 'DMZ Public Web Server',
        hostname: 'web01.corp.gregicthub.com',
        ip: '192.168.10.80',
        type: 'web',
        zone: 'DMZ',
        status: 'healthy',
        os: 'Ubuntu 22.04 LTS (Nginx 1.18.0)',
        ports: [
            { port: 80, proto: 'tcp', service: 'http', state: 'open', exposed: false },
            { port: 443, proto: 'tcp', service: 'https', state: 'open', exposed: true },
            { port: 22, proto: 'tcp', service: 'ssh', state: 'filtered', exposed: false }
        ],
        vulnerabilities: [
            {
                cve: 'CVE-2022-22965',
                cvss: 7.5,
                severity: 'HIGH',
                title: 'Spring4Shell Remote Code Execution',
                description: 'Spring Framework DataBinder vulnerability allowing arbitrary class loader access.',
                remediation: 'Upgrade application runtime to Spring Boot 2.6.6+.'
            }
        ]
    },
    {
        id: 'dev_domain_controller',
        label: 'Core Domain Controller (AD DS)',
        hostname: 'dc01.corp.local',
        ip: '10.0.0.10',
        type: 'dc',
        zone: 'LAN',
        status: 'vulnerable',
        os: 'Windows Server 2022 Datacenter',
        ports: [
            { port: 53, proto: 'tcp', service: 'domain', state: 'open', exposed: false },
            { port: 88, proto: 'tcp', service: 'kerberos', state: 'open', exposed: false },
            { port: 389, proto: 'tcp', service: 'ldap', state: 'open', exposed: false },
            { port: 3389, proto: 'tcp', service: 'ms-wbt-server (RDP)', state: 'open', exposed: true }
        ],
        vulnerabilities: [
            {
                cve: 'CVE-2019-0708',
                cvss: 9.8,
                severity: 'CRITICAL',
                title: 'BlueKeep Pre-Authentication RCE in Remote Desktop',
                description: 'Critical Remote Code Execution in RDP service without authentication. Wormable.',
                remediation: 'Immediately block WAN 0.0.0.0/0 inbound access on port 3389 at Perimeter Firewall. Restrict to internal management VPN.'
            }
        ]
    },
    {
        id: 'dev_database',
        label: 'Production DB Cluster',
        hostname: 'sql-prod.corp.local',
        ip: '10.0.0.50',
        type: 'db',
        zone: 'LAN',
        status: 'healthy',
        os: 'Debian 12 Bookworm (PostgreSQL 16.2)',
        ports: [
            { port: 5432, proto: 'tcp', service: 'postgresql', state: 'open', exposed: false }
        ],
        vulnerabilities: []
    },
    {
        id: 'dev_workstation',
        label: 'Admin Workstation',
        hostname: 'admin-pc.corp.local',
        ip: '10.0.0.105',
        type: 'workstation',
        zone: 'LAN',
        status: 'healthy',
        os: 'Windows 11 Enterprise (Security Operations)',
        ports: [
            { port: 135, proto: 'tcp', service: 'epmap', state: 'open', exposed: false },
            { port: 445, proto: 'tcp', service: 'microsoft-ds', state: 'open', exposed: false }
        ],
        vulnerabilities: []
    },
    {
        id: 'dev_siem',
        label: 'Central SIEM Log Vault',
        hostname: 'siem-collector.corp.local',
        ip: '10.0.0.250',
        type: 'siem',
        zone: 'LAN',
        status: 'healthy',
        os: 'Security Onion 2.4 (Elasticsearch / Wazuh / Suricata)',
        ports: [
            { port: 514, proto: 'udp', service: 'syslog', state: 'open', exposed: false },
            { port: 9200, proto: 'tcp', service: 'elasticsearch', state: 'open', exposed: false }
        ],
        vulnerabilities: []
    }
];

// Initial Node Placements
const initialNodes: Node[] = [
    {
        id: 'dev_attacker',
        type: 'deviceNode',
        position: { x: 30, y: 150 },
        data: initialDevices[0]
    },
    {
        id: 'dev_internet',
        type: 'deviceNode',
        position: { x: 260, y: 150 },
        data: initialDevices[1]
    },
    {
        id: 'dev_firewall',
        type: 'deviceNode',
        position: { x: 490, y: 150 },
        data: initialDevices[2]
    },
    {
        id: 'dev_dmz_web',
        type: 'deviceNode',
        position: { x: 740, y: 30 },
        data: initialDevices[3]
    },
    {
        id: 'dev_domain_controller',
        type: 'deviceNode',
        position: { x: 740, y: 180 },
        data: initialDevices[4]
    },
    {
        id: 'dev_database',
        type: 'deviceNode',
        position: { x: 990, y: 100 },
        data: initialDevices[5]
    },
    {
        id: 'dev_workstation',
        type: 'deviceNode',
        position: { x: 740, y: 330 },
        data: initialDevices[6]
    },
    {
        id: 'dev_siem',
        type: 'deviceNode',
        position: { x: 990, y: 260 },
        data: initialDevices[7]
    }
];

// Initial Edges
const initialEdges: Edge[] = [
    {
        id: 'e_att_inet',
        source: 'dev_attacker',
        target: 'dev_internet',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 }
    },
    {
        id: 'e_inet_fw',
        source: 'dev_internet',
        target: 'dev_firewall',
        animated: true,
        style: { stroke: '#38bdf8', strokeWidth: 2.5 }
    },
    {
        id: 'e_fw_dmz',
        source: 'dev_firewall',
        target: 'dev_dmz_web',
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 }
    },
    {
        id: 'e_fw_dc',
        source: 'dev_firewall',
        target: 'dev_domain_controller',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2.5 }
    },
    {
        id: 'e_fw_ws',
        source: 'dev_firewall',
        target: 'dev_workstation',
        style: { stroke: '#10b981', strokeWidth: 2 }
    },
    {
        id: 'e_dmz_db',
        source: 'dev_dmz_web',
        target: 'dev_database',
        style: { stroke: '#64748b', strokeWidth: 1.5, strokeDasharray: '4 4' }
    },
    {
        id: 'e_dc_siem',
        source: 'dev_domain_controller',
        target: 'dev_siem',
        style: { stroke: '#10b981', strokeWidth: 1.5 }
    }
];

// Simulated Packet Traces for Wireshark Tool
const samplePackets: PacketFrame[] = [
    { no: 1, time: '0.000000', src: '198.51.100.44:51234', dst: '203.0.113.254:3389', proto: 'TCP', len: 66, info: '[TCP SYN] Seq=0 Win=64240 Len=0 MSS=1460', alert: true },
    { no: 2, time: '0.001240', src: '203.0.113.254:3389', dst: '10.0.0.10:3389', proto: 'TCP', len: 66, info: '[NAT FORWARD] Rule #2 match: 0.0.0.0/0 -> 10.0.0.10:3389', alert: true },
    { no: 3, time: '0.002150', src: '10.0.0.10:3389', dst: '198.51.100.44:51234', proto: 'TCP', len: 66, info: '[TCP SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0', alert: true },
    { no: 4, time: '0.003410', src: '198.51.100.44:51234', dst: '10.0.0.10:3389', proto: 'RDP', len: 104, info: 'Client T.125 Connection Request (CR_TPDU) [Target: dc01.corp.local]', alert: true },
    { no: 5, time: '0.012480', src: '192.168.10.80:443', dst: '203.0.113.5:54992', proto: 'HTTPS', len: 1420, info: 'Application Data (TLSv1.3 Encrypted Record)', alert: false },
    { no: 6, time: '0.015690', src: '10.0.0.105:53', dst: '10.0.0.10:53', proto: 'DNS', len: 78, info: 'Standard query 0x1a4b A dc01.corp.local', alert: false },
    { no: 7, time: '0.021000', src: '10.0.0.10:514', dst: '10.0.0.250:514', proto: 'TCP', len: 320, info: 'Syslog Event: EventID 4624 (Logon Type 10 - RemoteInteractive) Account: Administrator', alert: true }
];

// ============================================================================
// MAIN COMPONENT: NetworkTopologyCanvas
// ============================================================================
interface NetworkTopologyCanvasProps {
    laboratory?: any;
    attempt?: any;
    onRemediateRule?: (ruleId: number, newAction: 'ALLOW' | 'DROP' | string) => void;
    onSaveState?: (state: any) => void;
}

export default function NetworkTopologyCanvas({
    laboratory,
    attempt,
    onRemediateRule,
    onSaveState
}: NetworkTopologyCanvasProps) {
    const nodeTypes = useMemo(() => ({ deviceNode: DeviceNode }), []);

    // Tool State
    const [activeTool, setActiveTool] = useState<CyberTool>('pointer');

    // Devices & Graph State
    const [devices, setDevices] = useState<DeviceData[]>(initialDevices);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    // Selected Inspection State
    const [selectedDevice, setSelectedDevice] = useState<DeviceData | null>(devices[2]); // Default select firewall
    const [selectedLink, setSelectedLink] = useState<Edge | null>(null);

    // Wireshark Sniffer Drawer State
    const [isSnifferOpen, setIsSnifferOpen] = useState(false);
    const [snifferFilter, setSnifferFilter] = useState<'ALL' | 'TCP' | 'RDP' | 'HTTPS' | 'DNS'>('ALL');
    const [capturedPackets, setCapturedPackets] = useState<PacketFrame[]>(samplePackets);
    const [selectedPacket, setSelectedPacket] = useState<PacketFrame | null>(samplePackets[3]);

    // Nmap Port Scan Modal State
    const [isNmapModalOpen, setIsNmapModalOpen] = useState(false);
    const [nmapTarget, setNmapTarget] = useState<DeviceData | null>(null);
    const [nmapScanning, setNmapScanning] = useState(false);
    const [nmapOutput, setNmapOutput] = useState<string>('');

    // Vulnerability Lens Modal State
    const [isVulnModalOpen, setIsVulnModalOpen] = useState(false);
    const [vulnTarget, setVulnTarget] = useState<DeviceData | null>(null);

    // Traffic Generator Attack Simulator State
    const [isAttackRunning, setIsAttackRunning] = useState(false);
    const [attackOutcome, setAttackOutcome] = useState<{
        success: boolean;
        title: string;
        message: string;
        blockedByRule?: string;
    } | null>(null);

    // Activity Log
    const [logs, setLogs] = useState<Array<{ id: number; time: string; type: 'info' | 'warn' | 'threat' | 'success'; text: string }>>([
        { id: 1, time: '20:15:00', type: 'info', text: 'Network Topology Arena initialized. 8 Nodes active across WAN, DMZ, and LAN.' },
        { id: 2, time: '20:15:02', type: 'warn', text: 'Perimeter Inspection: Firewall Rule #2 allows WAN 0.0.0.0/0 direct TCP 3389 inbound.' },
        { id: 3, time: '20:15:04', type: 'threat', text: 'Active Indicator: External IP 198.51.100.44 probing port 3389 on 10.0.0.10.' }
    ]);

    const addLog = useCallback((type: 'info' | 'warn' | 'threat' | 'success', text: string) => {
        const time = new Date().toTimeString().split(' ')[0];
        setLogs((prev) => [{ id: Date.now(), time, type, text }, ...prev.slice(0, 49)]);
    }, []);

    // ------------------------------------------------------------------------
    // FIREWALL RULE REMEDIATION LOGIC
    // ------------------------------------------------------------------------
    const handleToggleRule = (ruleId: number) => {
        let nextAction: string = 'ALLOW';

        setDevices((prev) =>
            prev.map((dev) => {
                if (dev.id !== 'dev_firewall' || !dev.firewallRules) return dev;

                const updatedRules = dev.firewallRules.map((r) => {
                    if (r.id !== ruleId) return r;
                    nextAction = r.action === 'ALLOW' ? 'DROP' : 'ALLOW';
                    const isRemediated = r.isVulnerableExposure ? nextAction === 'DROP' : true;
                    return { ...r, action: nextAction, isRemediated };
                });

                const stillVulnerable = updatedRules.some((r) => r.isVulnerableExposure && r.action === 'ALLOW');

                return {
                    ...dev,
                    status: stillVulnerable ? 'vulnerable' : 'protected',
                    firewallRules: updatedRules
                };
            })
        );

        // Also update Domain Controller status
        setDevices((prev) =>
            prev.map((dev) => {
                if (dev.id === 'dev_domain_controller') {
                    return {
                        ...dev,
                        status: nextAction === 'DROP' ? 'healthy' : 'vulnerable'
                    };
                }
                return dev;
            })
        );

        if (ruleId === 2) {
            if (nextAction === 'DROP') {
                addLog('success', 'Firewall Rule #2 REMEDIATED: Inbound WAN TCP 3389 changed to DROP. Domain Controller is now protected!');
            } else {
                addLog('threat', 'Firewall Rule #2 reverted to ALLOW! Domain Controller port 3389 is dangerously exposed to WAN.');
            }
        } else {
            addLog('info', `Firewall Rule #${ruleId} toggled to ${nextAction}.`);
        }

        if (onRemediateRule) {
            onRemediateRule(ruleId, nextAction);
        }
    };

    // Keep Node graph in sync with device state changes
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => {
                const dev = devices.find((d) => d.id === node.id);
                if (!dev) return node;
                return {
                    ...node,
                    data: {
                        ...dev,
                        activeTool
                    }
                };
            })
        );
    }, [devices, activeTool]);

    // ------------------------------------------------------------------------
    // NODE / EDGE CLICK HANDLERS BASED ON ACTIVE HUD TOOL
    // ------------------------------------------------------------------------
    const onNodeClick = useCallback(
        (_: any, node: Node) => {
            const dev = devices.find((d) => d.id === node.id);
            if (!dev) return;

            setSelectedDevice(dev);

            if (activeTool === 'nmap') {
                runNmapScan(dev);
            } else if (activeTool === 'vuln_lens') {
                setVulnTarget(dev);
                setIsVulnModalOpen(true);
                addLog('info', `Vulnerability Lens: Inspecting security profile of ${dev.label} (${dev.ip}).`);
            } else if (activeTool === 'traffic_gen') {
                runSimulatedAttack(dev);
            } else {
                addLog('info', `Pointer: Inspected ${dev.label} [Zone: ${dev.zone}, IP: ${dev.ip}].`);
            }
        },
        [activeTool, devices, addLog]
    );

    const onEdgeClick = useCallback(
        (_: any, edge: Edge) => {
            setSelectedLink(edge);
            if (activeTool === 'wireshark') {
                setIsSnifferOpen(true);
                addLog('info', `Wireshark: Attaching virtual network tap on link ${edge.source} -> ${edge.target}.`);
            } else {
                addLog('info', `Selected Network Cable link [${edge.source} -> ${edge.target}].`);
            }
        },
        [activeTool, addLog]
    );

    // ------------------------------------------------------------------------
    // NMAP SCAN SIMULATION
    // ------------------------------------------------------------------------
    const runNmapScan = (target: DeviceData) => {
        setNmapTarget(target);
        setIsNmapModalOpen(true);
        setNmapScanning(true);
        setNmapOutput(`Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}
Initiating ARP Ping Scan against ${target.ip}
Completed ARP Ping Scan at 0.01s, 1 host up
Initiating Parallel SYN Stealth Scan at port range 1-10000...
Scanning ${target.ip} [${target.ports.length + 5} ports]`);

        setTimeout(() => {
            let output = `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toISOString()}
Nmap scan report for ${target.hostname} (${target.ip})
Host is up (0.0028s latency).
MAC Address: 52:54:00:12:34:56 (QEMU/KVM Virtual NIC)

PORT     STATE SERVICE      VERSION
`;

            target.ports.forEach((p) => {
                const portStr = `${p.port}/${p.proto}`.padEnd(9);
                const stateStr = p.state.padEnd(8);
                const svcStr = p.service.padEnd(12);
                const ver = p.port === 3389 ? 'Microsoft Remote Desktop (RDP) [VULNERABLE]' : 'Verified service';
                output += `${portStr} ${stateStr} ${svcStr} ${ver}
`;
            });

            output += `
Service Info: OS: ${target.os}; CPE: cpe:/o:microsoft:windows
Aggressive OS guesses: ${target.os} (98%)
Network Distance: 1 hop

Host script results:
|_ smb-os-discovery: SUCCESS
|_ rdp-vuln-ms12-020: Clean`;

            if (target.ports.some((p) => p.port === 3389 && p.exposed)) {
                output += `
|! rdp-vuln-cve2019-0708 (BlueKeep): VULNERABLE!
|   Risk Level: CRITICAL (CVSS 9.8)
|_  State: State: VULNERABLE (Exploitable without credentials over WAN)`;
            }

            setNmapOutput(output);
            setNmapScanning(false);
            addLog('threat', `Nmap: Completed scan on ${target.ip}. Open ports: ${target.ports.map((p) => p.port).join(', ')}.`);
        }, 1200);
    };

    // ------------------------------------------------------------------------
    // TRAFFIC GENERATOR / ATTACK SIMULATION
    // ------------------------------------------------------------------------
    const runSimulatedAttack = (target: DeviceData) => {
        setIsAttackRunning(true);
        setAttackOutcome(null);

        const fw = devices.find((d) => d.id === 'dev_firewall');
        const rule2 = fw?.firewallRules?.find((r) => r.id === 2);
        const isRdpBlocked = rule2?.action === 'DROP';

        addLog('warn', `Traffic Generator: Initiating simulated RDP penetration probe against ${target.label} (${target.ip}:3389)...`);

        // Highlight attack path along edges
        setEdges((eds) =>
            eds.map((e) => {
                if (e.id === 'e_att_inet' || e.id === 'e_inet_fw' || e.id === 'e_fw_dc') {
                    return { ...e, animated: true, style: { stroke: '#ef4444', strokeWidth: 3.5 } };
                }
                return e;
            })
        );

        setTimeout(() => {
            if (target.id === 'dev_domain_controller' && !isRdpBlocked) {
                // Attack succeeds -> Breach!
                setAttackOutcome({
                    success: false,
                    title: 'CRITICAL SECURITY BREACH: EXPLOIT SUCCEEDED',
                    message: 'Adversary successfully established unauthorized RDP session to Domain Controller (10.0.0.10:3389)! The perimeter firewall permitted direct WAN traffic via unhardened Rule #2.'
                });

                setDevices((prev) =>
                    prev.map((d) => (d.id === 'dev_domain_controller' ? { ...d, status: 'breached' } : d))
                );

                addLog('threat', 'EXPLOIT SUCCESSFUL! Unauthorized RDP Session established on 10.0.0.10:3389. Remediate Firewall Rule #2 immediately!');
            } else {
                // Attack blocked -> Defended!
                setAttackOutcome({
                    success: true,
                    title: 'ATTACK BLOCKED & DEFENDED SUCCESSFULLY',
                    message: 'Perimeter Next-Gen Firewall dropped the unauthorized TCP 3389 probe at the WAN interface. Domain Controller remained secure inside the LAN.',
                    blockedByRule: 'Rule #2: WAN_DENY_RDP (DROP)'
                });

                setDevices((prev) =>
                    prev.map((d) => (d.id === 'dev_domain_controller' ? { ...d, status: 'healthy' } : d))
                );

                addLog('success', 'DEFENSE SUCCESS: Attack packet dropped by Firewall Rule #2. Zero unauthorized packets reached internal LAN.');
            }

            setIsAttackRunning(false);

            // Reset edge styles
            setTimeout(() => {
                setEdges(initialEdges);
            }, 3000);
        }, 1500);
    };

    // Filter packets for Wireshark Drawer
    const filteredPackets = useMemo(() => {
        if (snifferFilter === 'ALL') return capturedPackets;
        return capturedPackets.filter((p) => p.proto === snifferFilter);
    }, [capturedPackets, snifferFilter]);

    return (
        <div className="flex flex-col h-[750px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden relative select-none font-sans text-slate-100">
            {/* ================================================================ */}
            {/* TOP HEADER & FLOATING HUD TOOLBAR                                */}
            {/* ================================================================ */}
            <div className="bg-slate-900/90 border-b border-slate-800 p-3 flex flex-wrap items-center justify-between gap-3 z-10 backdrop-blur-md">
                {/* Left: Title & Status */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400">
                        <Network className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-100">Interactive Cyber Network Topology Canvas</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                                Live Reactive Lab
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                            Drag nodes, click cables to sniff traffic, or select HUD probe tools to audit security.
                        </p>
                    </div>
                </div>

                {/* Center: VIRTUAL CYBER DIAGNOSTIC TOOLS HUD */}
                <div className="flex items-center gap-1 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setActiveTool('pointer')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeTool === 'pointer'
                                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Pointer / Inspect Tool (Select and view devices)"
                    >
                        <Layers className="w-3.5 h-3.5" />
                        Inspect
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTool('wireshark');
                            setIsSnifferOpen(true);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeTool === 'wireshark'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Wireshark Packet Sniffer (Click any network cable to capture packets)"
                    >
                        <Radio className="w-3.5 h-3.5 text-blue-300" />
                        Sniffer (Wireshark)
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTool('nmap')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeTool === 'nmap'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Nmap Port Scanner (Click any host to run live port probe)"
                    >
                        <Terminal className="w-3.5 h-3.5 text-purple-300" />
                        Nmap Probe
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTool('vuln_lens')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeTool === 'vuln_lens'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                        title="Vulnerability Lens (Click any host to inspect CVEs and hardening)"
                    >
                        <Bug className="w-3.5 h-3.5 text-amber-300" />
                        CVE Lens
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setActiveTool('traffic_gen');
                            const dc = devices.find((d) => d.id === 'dev_domain_controller');
                            if (dc) runSimulatedAttack(dc);
                        }}
                        disabled={isAttackRunning}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            activeTool === 'traffic_gen'
                                ? 'bg-red-600 text-white shadow-md shadow-red-600/30 font-black animate-pulse'
                                : 'text-red-400 hover:text-red-300 hover:bg-red-950/40'
                        }`}
                        title="Traffic Generator & Attack Simulator (Inject attack packet to test firewall defenses)"
                    >
                        <Zap className="w-3.5 h-3.5" />
                        {isAttackRunning ? 'Simulating...' : 'Attack Sim'}
                    </button>
                </div>

                {/* Right: Quick Firewall Status LED */}
                <div className="flex items-center gap-2">
                    {devices.find((d) => d.id === 'dev_firewall')?.status === 'protected' ? (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-mono font-bold">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Remediated & Protected</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/80 text-red-300 text-xs font-mono font-bold animate-pulse">
                            <ShieldAlert className="w-4 h-4 text-red-400" />
                            <span>Rule #2 WAN Exposed!</span>
                        </div>
                    )}
                </div>
            </div>

            {/* ================================================================ */}
            {/* ACTIVE TOOL ADVISORY BANNER                                      */}
            {/* ================================================================ */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-slate-500 font-bold">ACTIVE PROBE:</span>
                    {activeTool === 'pointer' && <span className="text-cyan-400">Inspect Mode: Click any node or cable for specs</span>}
                    {activeTool === 'wireshark' && <span className="text-blue-400">Wireshark Active: Click any network link to inspect frame captures</span>}
                    {activeTool === 'nmap' && <span className="text-purple-400">Nmap Scanner Active: Click any device node to probe open ports</span>}
                    {activeTool === 'vuln_lens' && <span className="text-amber-400">Vulnerability Lens Active: Click any host to inspect CVE exposures</span>}
                    {activeTool === 'traffic_gen' && <span className="text-red-400">Traffic Generator Active: Testing packet transit across Firewall</span>}
                </div>
                <div className="text-slate-500 flex items-center gap-3">
                    <span>Controls: Drag to pan | Scroll to zoom</span>
                </div>
            </div>

            {/* ================================================================ */}
            {/* REACT FLOW CANVAS AREA                                           */}
            {/* ================================================================ */}
            <div className="flex-1 w-full h-full relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes as any}
                    onNodeClick={onNodeClick}
                    onEdgeClick={onEdgeClick}
                    fitView
                    minZoom={0.5}
                    maxZoom={1.5}
                    className="bg-slate-950"
                >
                    <Background color="#1e293b" gap={20} size={1} />
                    <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 !fill-slate-200" />
                    <MiniMap
                        className="!bg-slate-900/90 !border-slate-800 !rounded-xl overflow-hidden"
                        nodeColor={(n: any) => {
                            if (n.data?.type === 'attacker') return '#ef4444';
                            if (n.data?.type === 'firewall') return '#38bdf8';
                            if (n.data?.type === 'dc') return '#a855f7';
                            if (n.data?.type === 'web') return '#06b6d4';
                            return '#64748b';
                        }}
                    />
                </ReactFlow>

                {/* Attack Outcome Floating Alert */}
                {attackOutcome && (
                    <div
                        className={`absolute top-4 left-1/2 -translate-x-1/2 max-w-xl w-full p-4 rounded-xl border-2 backdrop-blur-md shadow-2xl z-30 transition-all ${
                            attackOutcome.success
                                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100 shadow-emerald-500/20'
                                : 'bg-red-950/90 border-red-500 text-red-100 shadow-red-500/40 animate-bounce'
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                                {attackOutcome.success ? (
                                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                    <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                    <h4 className="font-bold text-sm">{attackOutcome.title}</h4>
                                    <p className="text-xs mt-1 text-slate-200 leading-relaxed">{attackOutcome.message}</p>
                                    {attackOutcome.blockedByRule && (
                                        <div className="mt-2 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold inline-block border border-emerald-700/60">
                                            Protected by: {attackOutcome.blockedByRule}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAttackOutcome(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ================================================================ */}
            {/* BOTTOM COLLAPSIBLE DOCK: INSPECTOR & FIREWALL RULES              */}
            {/* ================================================================ */}
            <div className="bg-slate-900 border-t border-slate-800 p-3 max-h-56 overflow-y-auto z-10">
                <div className="flex flex-col md:flex-row items-stretch gap-4">
                    {/* Device Specs Column */}
                    {selectedDevice && (
                        <div className="w-full md:w-1/3 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">
                                    Device Inspector
                                </span>
                                <span className="text-[9px] font-mono text-slate-500">ID: {selectedDevice.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm text-slate-100">{selectedDevice.label}</h4>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                    {selectedDevice.ip}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">{selectedDevice.os}</p>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                                <button
                                    type="button"
                                    onClick={() => runNmapScan(selectedDevice)}
                                    className="px-2 py-1 rounded bg-purple-950/80 border border-purple-800 text-purple-300 hover:bg-purple-900 text-[10px] font-bold transition flex items-center gap-1"
                                >
                                    <Terminal className="w-3 h-3" /> Run Port Scan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVulnTarget(selectedDevice);
                                        setIsVulnModalOpen(true);
                                    }}
                                    className="px-2 py-1 rounded bg-amber-950/80 border border-amber-800 text-amber-300 hover:bg-amber-900 text-[10px] font-bold transition flex items-center gap-1"
                                >
                                    <Bug className="w-3 h-3" /> View CVEs
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Interactive Firewall Remediation Panel */}
                    <div className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-cyan-400" />
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200 font-mono">
                                    Perimeter Firewall Active Ruleset (Ordered Top-To-Bottom)
                                </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">
                                Click Action button to remediate exposures
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left font-mono text-[10px]">
                                <thead>
                                    <tr className="text-slate-500 border-b border-slate-800 uppercase">
                                        <th className="pb-1 font-semibold">#</th>
                                        <th className="pb-1 font-semibold">Rule Name</th>
                                        <th className="pb-1 font-semibold">Source</th>
                                        <th className="pb-1 font-semibold">Destination</th>
                                        <th className="pb-1 font-semibold">Port</th>
                                        <th className="pb-1 font-semibold text-center">Action</th>
                                        <th className="pb-1 font-semibold text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                    {devices
                                        .find((d) => d.id === 'dev_firewall')
                                        ?.firewallRules?.map((rule) => (
                                            <tr key={rule.id} className="hover:bg-slate-900/60">
                                                <td className="py-1.5 text-slate-400">{rule.id}</td>
                                                <td className="py-1.5 font-bold text-slate-200">
                                                    {rule.name}
                                                    {rule.isVulnerableExposure && (
                                                        <span className="ml-1.5 text-[8px] px-1 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase font-black">
                                                            Target Task
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-1.5 text-slate-400">{rule.src}</td>
                                                <td className="py-1.5 text-slate-400">{rule.dst}</td>
                                                <td className="py-1.5 text-cyan-300 font-bold">{rule.port}</td>
                                                <td className="py-1.5 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleRule(rule.id)}
                                                        className={`px-2 py-0.5 rounded text-[9px] font-extrabold transition cursor-pointer ${
                                                            rule.action === 'ALLOW'
                                                                ? rule.isVulnerableExposure
                                                                    ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                                                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                                        }`}
                                                        title="Click to switch action between ALLOW and DROP"
                                                    >
                                                        {rule.action} (Click to toggle)
                                                    </button>
                                                </td>
                                                <td className="py-1.5 text-right font-bold">
                                                    {rule.isVulnerableExposure ? (
                                                        rule.action === 'DROP' ? (
                                                            <span className="text-emerald-400 flex items-center justify-end gap-1">
                                                                <CheckCircle2 className="w-3 h-3" /> Hardened
                                                            </span>
                                                        ) : (
                                                            <span className="text-red-400 flex items-center justify-end gap-1">
                                                                <XCircle className="w-3 h-3" /> Vulnerable
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-slate-400">Compliant</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================================================================ */}
            {/* BOTTOM WIRESHARK SNIFFER DRAWER                                  */}
            {/* ================================================================ */}
            {isSnifferOpen && (
                <div className="absolute bottom-0 left-0 right-0 h-80 bg-slate-900 border-t-2 border-blue-600 shadow-2xl z-40 flex flex-col font-mono text-xs">
                    {/* Sniffer Header */}
                    <div className="bg-slate-950 p-2.5 px-4 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded bg-blue-950 border border-blue-800 text-blue-400">
                                <Radio className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-slate-100">Virtual Wireshark Protocol Sniffer</h4>
                                <span className="text-[10px] text-slate-400">Interface: eth0 (Promiscuous Mode)</span>
                            </div>
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex items-center gap-1">
                            {(['ALL', 'TCP', 'RDP', 'HTTPS', 'DNS'] as const).map((proto) => (
                                <button
                                    key={proto}
                                    type="button"
                                    onClick={() => setSnifferFilter(proto)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                        snifferFilter === proto
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {proto}
                                </button>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsSnifferOpen(false)}
                            className="text-slate-400 hover:text-white p-1"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Packet Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-950/80 sticky top-0 text-slate-400 uppercase text-[9px] border-b border-slate-800">
                                <tr>
                                    <th className="py-1.5 px-3">No.</th>
                                    <th className="py-1.5 px-3">Time</th>
                                    <th className="py-1.5 px-3">Source</th>
                                    <th className="py-1.5 px-3">Destination</th>
                                    <th className="py-1.5 px-3">Protocol</th>
                                    <th className="py-1.5 px-3">Length</th>
                                    <th className="py-1.5 px-3">Info Summary</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40 text-slate-300">
                                {filteredPackets.map((pkt) => (
                                    <tr
                                        key={pkt.no}
                                        onClick={() => setSelectedPacket(pkt)}
                                        className={`hover:bg-slate-800/60 cursor-pointer ${
                                            selectedPacket?.no === pkt.no
                                                ? 'bg-blue-950/80 border-l-2 border-blue-400'
                                                : ''
                                        } ${pkt.alert ? 'text-red-300 font-semibold' : ''}`}
                                    >
                                        <td className="py-1.5 px-3 text-slate-500">{pkt.no}</td>
                                        <td className="py-1.5 px-3 text-slate-400">{pkt.time}</td>
                                        <td className="py-1.5 px-3">{pkt.src}</td>
                                        <td className="py-1.5 px-3">{pkt.dst}</td>
                                        <td className="py-1.5 px-3 font-bold text-blue-400">{pkt.proto}</td>
                                        <td className="py-1.5 px-3 text-slate-400">{pkt.len}</td>
                                        <td className="py-1.5 px-3">
                                            {pkt.info}
                                            {pkt.alert && (
                                                <span className="ml-2 text-[8px] px-1 py-0.2 rounded bg-red-500/20 text-red-300 uppercase font-black">
                                                    Suspect
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Frame Details Panel */}
                    {selectedPacket && (
                        <div className="bg-slate-950 p-2 px-4 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
                            <div className="flex items-center gap-4 text-slate-200 font-bold">
                                <span>Frame {selectedPacket.no}: {selectedPacket.len} bytes on wire</span>
                                <span>Ethernet II, Src: 52:54:00:12:34:56, Dst: 52:54:00:ab:cd:ef</span>
                                <span>Internet Protocol Version 4, Src: {selectedPacket.src.split(':')[0]}</span>
                            </div>
                            <div className="text-slate-400 font-mono text-[9px] truncate">
                                Transmission Control Protocol, Src Port: {selectedPacket.src.split(':')[1]}, Dst Port: {selectedPacket.dst.split(':')[1]}, Flags: [SYN, ACK]
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ================================================================ */}
            {/* NMAP SCAN MODAL                                                  */}
            {/* ================================================================ */}
            {isNmapModalOpen && nmapTarget && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-purple-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-mono flex flex-col">
                        <div className="bg-slate-950 p-3 px-4 border-b border-slate-800 flex items-center justify-between text-purple-300">
                            <div className="flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-purple-400" />
                                <span className="font-bold text-sm">Nmap Port Probe: {nmapTarget.label} ({nmapTarget.ip})</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsNmapModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-4 bg-slate-950 text-slate-300 text-xs whitespace-pre-wrap font-mono h-80 overflow-y-auto leading-relaxed border-b border-slate-800">
                            {nmapOutput}
                            {nmapScanning && (
                                <div className="mt-2 text-purple-400 animate-pulse font-bold">
                                    [~] Probing TCP sockets... Analyzing TTL response...
                                </div>
                            )}
                        </div>
                        <div className="p-3 bg-slate-900 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Target OS: {nmapTarget.os}</span>
                            <button
                                type="button"
                                onClick={() => setIsNmapModalOpen(false)}
                                className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================ */}
            {/* VULNERABILITY LENS MODAL                                         */}
            {/* ================================================================ */}
            {isVulnModalOpen && vulnTarget && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-amber-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden font-sans flex flex-col text-slate-100">
                        <div className="bg-slate-950 p-3 px-4 border-b border-slate-800 flex items-center justify-between text-amber-300">
                            <div className="flex items-center gap-2">
                                <Bug className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-sm font-mono">
                                    Vulnerability Assessment: {vulnTarget.label} ({vulnTarget.ip})
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsVulnModalOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
                            {vulnTarget.vulnerabilities && vulnTarget.vulnerabilities.length > 0 ? (
                                vulnTarget.vulnerabilities.map((v) => (
                                    <div
                                        key={v.cve}
                                        className="bg-slate-950 p-4 rounded-xl border border-red-500/30 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                                                {v.cve}
                                            </span>
                                            <span className="text-xs font-bold text-red-400">
                                                CVSS {v.cvss} ({v.severity})
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-sm text-slate-100">{v.title}</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">{v.description}</p>
                                        <div className="mt-2 p-2.5 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                                            <strong>Required Remediation:</strong> {v.remediation}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400 space-y-2">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                                    <p className="text-sm font-bold text-slate-200">Zero Critical Vulnerabilities Detected</p>
                                    <p className="text-xs text-slate-500">
                                        Asset complies with current hardening guidelines. All listening ports are restricted to internal zones.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 px-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-mono">Zone: {vulnTarget.zone}</span>
                            <button
                                type="button"
                                onClick={() => setIsVulnModalOpen(false)}
                                className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
                            >
                                Close Lens
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
