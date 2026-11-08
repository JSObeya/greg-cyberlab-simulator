import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    KeyRound,
    Shield,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Eye,
    EyeOff,
    FileSpreadsheet,
    Download,
    Upload,
    AlertCircle,
    FileText,
    Check,
    Trash2,
    CheckCheck,
    Clock,
    LayoutGrid,
    Table as TableIcon,
    Loader2,
    GraduationCap,
    UserCheck,
    UserX,
    ChevronDown,
    X
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    programmes?: ProgrammeOption[];
}

interface UsersProps {
    users: {
        data: UserItem[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
    };
    stats?: {
        total: number;
        active: number;
        pending: number;
    };
    roles: Array<{ value: string; label: string }>;
    programmes?: ProgrammeOption[];
}

export default function UsersManagement({
    users,
    filters = {},
    stats = { total: 0, active: 0, pending: 0 },
    roles,
    programmes = [],
}: UsersProps) {
    const { flash, auth } = usePage<any>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkRoleModalOpen, setIsBulkRoleModalOpen] = useState(false);
    const [isBulkProgrammeModalOpen, setIsBulkProgrammeModalOpen] = useState(false);
    const [bulkTargetRole, setBulkTargetRole] = useState('trainee');
    const [bulkTargetProgrammeId, setBulkTargetProgrammeId] = useState<string>('');
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    // Password Visibility Toggles
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Form for Creating New User
    const createForm = useForm({
        name: '',
        email: '',
        role: 'trainee',
        phone: '',
        password: '',
        programme_ids: [] as number[],
    });

    // Form for Updating Existing User
    const editForm = useForm({
        name: '',
        email: '',
        role: 'trainee',
        phone: '',
        is_active: true,
        password: '',
        programme_ids: [] as number[],
    });

    // Form for Bulk CSV Import
    const importForm = useForm({
        csv_file: null as File | null,
    });

    // Selection helpers
    const allCurrentIds = users.data.map((u) => u.id);
    const isAllSelected = allCurrentIds.length > 0 && allCurrentIds.every((id) => selectedIds.includes(id));
    const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

    const handleToggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !allCurrentIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...allCurrentIds])));
        }
    };

    const handleToggleSelectOne = (id: number) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get(
            route('admin.users.index'),
            {
                search: formData.get('search') as string,
                role: formData.get('role') as string,
                status: filters.status || '',
            },
            { preserveState: true }
        );
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            route('admin.users.index'),
            {
                ...filters,
                status: status === 'all' ? '' : status,
            },
            { preserveState: true }
        );
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.users.store'), {
            onSuccess: () => {
                createForm.reset();
                setIsCreateModalOpen(false);
            },
        });
    };

    const handleEditOpen = (user: UserItem) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            is_active: user.is_active,
            password: '',
            programme_ids: user.programmes ? user.programmes.map((p) => p.id) : [],
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        editForm.put(route('admin.users.update', editingUser.id), {
            onSuccess: () => {
                setEditingUser(null);
            },
        });
    };

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!importForm.data.csv_file) return;

        importForm.post(route('admin.users.import-csv'), {
            onSuccess: () => {
                importForm.reset();
                setIsImportModalOpen(false);
            },
        });
    };

    const handleDelete = (user: UserItem) => {
        if (confirm(`Are you sure you want to delete / deactivate the account for ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    const handleSingleApprove = (user: UserItem) => {
        router.post(route('admin.users.approve', user.id), {}, {
            preserveScroll: true,
        });
    };

    // Bulk action dispatcher
    const executeBulkAction = (action: string, extraData: Record<string, any> = {}) => {
        if (selectedIds.length === 0) return;

        if (action === 'delete') {
            if (!confirm(`Are you sure you want to delete ${selectedIds.length} selected user account(s)?`)) {
                return;
            }
        }

        setIsProcessingBulk(true);
        router.post(
            route('admin.users.bulk-action'),
            {
                user_ids: selectedIds,
                action,
                ...extraData,
            },
            {
                onFinish: () => {
                    setIsProcessingBulk(false);
                    setSelectedIds([]);
                    setIsBulkRoleModalOpen(false);
                    setIsBulkProgrammeModalOpen(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                            <span>User & Credential Management</span>
                            {stats.pending > 0 && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 animate-pulse">
                                    <Clock className="w-3 h-3" />
                                    {stats.pending} Pending Approval
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Select one or all users to manage, approve registrations, update roles, assign programmes, and delete accounts
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                            <button
                                type="button"
                                onClick={() => setViewMode('table')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                                    viewMode === 'table'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Table View"
                            >
                                <TableIcon className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('cards')}
                                className={`p-1.5 rounded-lg text-xs font-bold transition ${
                                    viewMode === 'cards'
                                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                                title="Card View"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Bulk CSV Import Button */}
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                            title="Upload CSV to provision multiple users at once"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Bulk Import</span>
                        </button>

                        {/* Single User Create Button */}
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                        >
                            <UserPlus className="w-4 h-4" />
                            <span>New User Account</span>
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Users Management - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                {/* Flash Messages Alert */}
                {flash?.success && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs shadow-xs">
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span className="font-semibold">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-800 dark:text-red-300 text-xs shadow-xs">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                        <span className="font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* Status Tabs Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handleStatusFilter('all')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                !filters.status
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            <span>All Users</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                                {stats.total}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleStatusFilter('active')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                filters.status === 'active'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                            }`}
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Active</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800">
                                {stats.active}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleStatusFilter('pending')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                                filters.status === 'pending'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-amber-600 dark:text-amber-400 hover:bg-slate-50'
                            }`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending Approval</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                stats.pending > 0 ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-800'
                            }`}>
                                {stats.pending}
                            </span>
                        </button>
                    </div>

                    {/* Quick Selection Status */}
                    <div className="flex items-center gap-3 text-xs">
                        <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-semibold"
                        >
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                ref={(input) => {
                                    if (input) input.indeterminate = isSomeSelected;
                                }}
                                onChange={handleToggleSelectAll}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{isAllSelected ? 'Deselect All' : 'Select All Page'}</span>
                        </button>

                        {selectedIds.length > 0 && (
                            <span className="text-blue-600 dark:text-blue-400 font-bold">
                                {selectedIds.length} user(s) selected
                            </span>
                        )}
                    </div>
                </div>

                {/* Floating / Sticky Bulk Action Bar */}
                {selectedIds.length > 0 && (
                    <div className="sticky top-20 z-30 p-3.5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white border-2 border-blue-500/80 shadow-2xl flex flex-wrap items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs">
                                {selectedIds.length} Selected
                            </span>
                            <span className="text-xs text-slate-300">
                                Apply bulk administrative command to selected users:
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {/* Approve Selected */}
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => executeBulkAction('approve')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>Approve Selected</span>
                            </button>

                            {/* Activate */}
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => executeBulkAction('activate')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Activate</span>
                            </button>

                            {/* Deactivate */}
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => executeBulkAction('deactivate')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                            </button>

                            {/* Change Role Modal Open */}
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => setIsBulkRoleModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <Shield className="w-3.5 h-3.5" />
                                <span>Change Role</span>
                            </button>

                            {/* Assign Programme Modal Open */}
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => setIsBulkProgrammeModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <GraduationCap className="w-3.5 h-3.5" />
                                <span>Assign Programme</span>
                            </button>

                            {/* Delete Selected */}
                            <button
                                type="button"
                                disabled={isProcessingBulk}
                                onClick={() => executeBulkAction('delete')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete Selected</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedIds([])}
                                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                                title="Clear Selection"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Search & Filter Toolbar */}
                <form
                    onSubmit={handleSearch}
                    className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap gap-4 items-center"
                >
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            name="search"
                            defaultValue={filters.search || ''}
                            placeholder="Search by user/cadet name or official email..."
                            className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-48">
                        <select
                            name="role"
                            defaultValue={filters.role || ''}
                            className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-blue-500 focus:ring-blue-500"
                        >
                            <option value="">All User Roles</option>
                            {roles.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                    >
                        <Search className="w-3.5 h-3.5" /> Filter
                    </button>
                </form>

                {/* Users Display: Table vs Cards */}
                {viewMode === 'table' ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="py-3 px-4 w-10">
                                            <input
                                                type="checkbox"
                                                checked={isAllSelected}
                                                ref={(input) => {
                                                    if (input) input.indeterminate = isSomeSelected;
                                                }}
                                                onChange={handleToggleSelectAll}
                                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                        </th>
                                        <th className="py-3 px-4">User Details</th>
                                        <th className="py-3 px-4">Role</th>
                                        <th className="py-3 px-4">Programmes</th>
                                        <th className="py-3 px-4">Approval / Status</th>
                                        <th className="py-3 px-4">Phone</th>
                                        <th className="py-3 px-4">Registered</th>
                                        <th className="py-3 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {users.data.map((user) => {
                                        const isSelected = selectedIds.includes(user.id);
                                        return (
                                            <tr
                                                key={user.id}
                                                className={`transition ${
                                                    isSelected
                                                        ? 'bg-blue-50/70 dark:bg-blue-950/40'
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                }`}
                                            >
                                                <td className="py-3 px-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleSelectOne(user.id)}
                                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                                    <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.programmes && user.programmes.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {user.programmes.map((p) => (
                                                                <span
                                                                    key={p.id}
                                                                    title={p.title}
                                                                    className="inline-block px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold"
                                                                >
                                                                    {p.code}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px] italic">None</span>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4">
                                                    {user.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                                            <CheckCircle className="w-3.5 h-3.5" /> Active
                                                        </span>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                                                                <Clock className="w-3.5 h-3.5" /> Pending Approval
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSingleApprove(user)}
                                                                className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[10px] shadow-xs transition"
                                                                title="Approve & Activate Account"
                                                            >
                                                                Approve
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 font-mono text-[11px]">
                                                    {user.phone || '-'}
                                                </td>
                                                <td className="py-3 px-4 text-slate-400">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                                                    <button
                                                        onClick={() => handleEditOpen(user)}
                                                        className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-bold transition"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="px-2.5 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-bold transition"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    /* User Cards Grid View */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.data.map((user) => {
                            const isSelected = selectedIds.includes(user.id);
                            return (
                                <div
                                    key={user.id}
                                    className={`rounded-2xl border p-5 shadow-xs transition flex flex-col justify-between space-y-4 ${
                                        isSelected
                                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-blue-500/10'
                                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSelectOne(user.id)}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-0.5"
                                                />
                                                <div>
                                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                                                        {user.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-mono truncate max-w-[200px]">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>

                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {user.role}
                                            </span>
                                        </div>

                                        {/* Status & Approval */}
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                                            <span className="text-slate-400">Account Status:</span>
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-[11px] bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                                                    <Clock className="w-3.5 h-3.5" /> Pending
                                                </span>
                                            )}
                                        </div>

                                        {/* Programmes Pill */}
                                        <div className="space-y-1">
                                            <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Programmes:</p>
                                            {user.programmes && user.programmes.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.programmes.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold"
                                                        >
                                                            {p.code}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 italic">No programme enrolled</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Footer Actions */}
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                        {!user.is_active ? (
                                            <button
                                                type="button"
                                                onClick={() => handleSingleApprove(user)}
                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-1.5"
                                            >
                                                <CheckCheck className="w-3.5 h-3.5" /> Approve
                                            </button>
                                        ) : (
                                            <div className="text-[11px] text-slate-400 font-mono">
                                                {user.phone || 'No phone'}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => handleEditOpen(user)}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {users.links.length > 3 && (
                    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                        <span className="text-slate-500">
                            Page {users.current_page} of {users.last_page}
                        </span>
                        <div className="flex gap-1">
                            {users.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg ${
                                        link.active
                                            ? 'bg-blue-600 text-white font-bold'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Bulk Role Change */}
            {isBulkRoleModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-purple-600" />
                                <span>Bulk Role Assignment</span>
                            </h3>
                            <button onClick={() => setIsBulkRoleModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Apply new role to all <strong>{selectedIds.length}</strong> selected users:
                        </p>
                        <select
                            value={bulkTargetRole}
                            onChange={(e) => setBulkTargetRole(e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            {roles.map((r) => (
                                <option key={r.value} value={r.value}>
                                    {r.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsBulkRoleModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => executeBulkAction('change_role', { role: bulkTargetRole })}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs"
                            >
                                Update {selectedIds.length} Roles
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Bulk Programme Assignment */}
            {isBulkProgrammeModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-600" />
                                <span>Bulk Programme Enrollment</span>
                            </h3>
                            <button onClick={() => setIsBulkProgrammeModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Enroll all <strong>{selectedIds.length}</strong> selected users into the chosen programme:
                        </p>
                        <select
                            value={bulkTargetProgrammeId}
                            onChange={(e) => setBulkTargetProgrammeId(e.target.value)}
                            className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                            <option value="">-- Select Programme --</option>
                            {programmes.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.code})
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsBulkProgrammeModalOpen(false)}
                                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-600 dark:text-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={!bulkTargetProgrammeId}
                                onClick={() => executeBulkAction('assign_programme', { programme_id: bulkTargetProgrammeId })}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs disabled:opacity-50"
                            >
                                Enroll {selectedIds.length} Users
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create User */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                                <span>Provision User Account</span>
                            </h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name / Cadet Rank
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    placeholder="e.g. Sub-Lt John Adebayo"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Official Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    placeholder="officer@cyberlab.ng"
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Assigned Role
                                    </label>
                                    <select
                                        value={createForm.data.role}
                                        onChange={(e) => createForm.setData('role', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Phone / Duty Extension
                                    </label>
                                    <input
                                        type="text"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        placeholder="+234 803 000 0000"
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Initial Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCreatePassword ? 'text' : 'password'}
                                        required
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        placeholder="Min 8 characters"
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCreatePassword(!showCreatePassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                                    >
                                        {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Enroll in Programmes (Optional)
                                </label>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    {programmes.map((p) => {
                                        const isChecked = createForm.data.programme_ids.includes(p.id);
                                        return (
                                            <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const cur = createForm.data.programme_ids;
                                                        createForm.setData(
                                                            'programme_ids',
                                                            e.target.checked ? [...cur, p.id] : cur.filter((x) => x !== p.id)
                                                        );
                                                    }}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{p.title}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">({p.code})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs inline-flex items-center gap-1.5"
                                >
                                    {createForm.processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Create User</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit User */}
            {editingUser && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-blue-600" />
                                <span>Edit Account & Reset Password</span>
                            </h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Role
                                    </label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value)}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>
                                                {r.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={editForm.data.is_active ? '1' : '0'}
                                        onChange={(e) => editForm.setData('is_active', e.target.value === '1')}
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        <option value="1">Active / Approved</option>
                                        <option value="0">Suspended / Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                    className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    New Password (leave blank to keep current)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showEditPassword ? 'text' : 'password'}
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full text-xs rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                                    >
                                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    Enrolled Programmes
                                </label>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    {programmes.map((p) => {
                                        const isChecked = editForm.data.programme_ids.includes(p.id);
                                        return (
                                            <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const cur = editForm.data.programme_ids;
                                                        editForm.setData(
                                                            'programme_ids',
                                                            e.target.checked ? [...cur, p.id] : cur.filter((x) => x !== p.id)
                                                        );
                                                    }}
                                                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{p.title}</span>
                                                <span className="text-[10px] text-slate-400 font-mono">({p.code})</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs inline-flex items-center gap-1.5"
                                >
                                    {editForm.processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Bulk CSV Import */}
            {isImportModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                <span>Bulk CSV Import</span>
                            </h3>
                            <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-4">
                            <p className="text-xs text-slate-500">
                                Upload a CSV file with headers: <code className="text-blue-500">name, email, role, phone, password</code>.
                            </p>

                            <input
                                type="file"
                                accept=".csv,.txt"
                                required
                                onChange={(e) => importForm.setData('csv_file', e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300"
                            />

                            <div className="flex justify-between items-center pt-2">
                                <a
                                    href={route('admin.users.sample-csv')}
                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold"
                                >
                                    <Download className="w-3.5 h-3.5" /> Sample CSV
                                </a>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsImportModalOpen(false)}
                                        className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={importForm.processing}
                                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs inline-flex items-center gap-1.5"
                                    >
                                        {importForm.processing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                        <span>Upload & Import</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
