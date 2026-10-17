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
    Check
} from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
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
    };
    roles: Array<{ value: string; label: string }>;
}

export default function UsersManagement({ users, filters, roles }: UsersProps) {
    const { flash } = usePage<any>().props;

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

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
    });

    // Form for Updating Existing User
    const editForm = useForm({
        name: '',
        email: '',
        role: 'trainee',
        phone: '',
        is_active: true,
        password: '',
    });

    // Form for Bulk CSV Import
    const importForm = useForm({
        csv_file: null as File | null,
    });

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        router.get(
            route('admin.users.index'),
            {
                search: formData.get('search') as string,
                role: formData.get('role') as string,
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
        if (confirm(`Are you sure you want to deactivate account for ${user.name}?`)) {
            router.delete(route('admin.users.destroy', user.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                            User & Credential Management
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Configure roles, access policies, bulk CSV provisioning, and reset passwords
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Bulk CSV Import Button */}
                        <button
                            type="button"
                            onClick={() => setIsImportModalOpen(true)}
                            className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                            title="Upload CSV to provision multiple users at once"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            <span>Bulk Import CSV</span>
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
                            placeholder="Search by trainee name or email..."
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

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600 dark:text-slate-400">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-6">User</th>
                                    <th className="py-3 px-6">Role</th>
                                    <th className="py-3 px-6">Status</th>
                                    <th className="py-3 px-6">Phone</th>
                                    <th className="py-3 px-6">Registered</th>
                                    <th className="py-3 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="py-3 px-6">
                                            <p className="font-bold text-slate-900 dark:text-white">{user.name}</p>
                                            <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                                        </td>
                                        <td className="py-3 px-6">
                                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-[11px]">
                                                    <XCircle className="w-3.5 h-3.5" /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-6 font-mono text-[11px]">
                                            {user.phone || '-'}
                                        </td>
                                        <td className="py-3 px-6 text-slate-400">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-6 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditOpen(user)}
                                                className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg font-bold"
                                            >
                                                Edit / Reset
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user)}
                                                className="px-2.5 py-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg font-bold"
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links */}
                    {users.links.length > 3 && (
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
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

                {/* ============================================================ */}
                {/* MODAL 1: BULK CSV IMPORT MODAL                               */}
                {/* ============================================================ */}
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <form
                            onSubmit={handleImportSubmit}
                            className="bg-white dark:bg-slate-900 w-full max-w-lg p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                    Bulk Provision Users via CSV
                                </h3>
                                <a
                                    href={route('admin.users.sample-csv')}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800"
                                    title="Download ready-to-fill CSV template"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Sample CSV Template
                                </a>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-slate-600 dark:text-slate-400">
                                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <AlertCircle className="w-4 h-4 text-emerald-500" />
                                        CSV Formatting Instructions:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-0.5 font-mono text-[11px]">
                                        <li>Required Headers: <strong>name, email</strong></li>
                                        <li>Optional Headers: <strong>role, password, phone</strong></li>
                                        <li>Valid roles: <strong>trainee, instructor, admin, auditor</strong> (default: trainee)</li>
                                        <li>If password is blank, system assigns default: <strong>Password@123</strong></li>
                                        <li>Duplicate emails are safely skipped without failing the batch.</li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        Select CSV File
                                    </label>
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 text-center bg-slate-50 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                                        <input
                                            type="file"
                                            id="csv_file_input"
                                            accept=".csv,text/csv,text/plain"
                                            onChange={(e) => importForm.setData('csv_file', e.target.files ? e.target.files[0] : null)}
                                            className="hidden"
                                            required
                                        />
                                        <label htmlFor="csv_file_input" className="cursor-pointer space-y-2 block">
                                            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                                            {importForm.data.csv_file ? (
                                                <div className="text-slate-800 dark:text-slate-200 font-bold font-mono">
                                                    {importForm.data.csv_file.name} ({(importForm.data.csv_file.size / 1024).toFixed(1)} KB)
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                                                        Click to choose CSV file
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block">
                                                        Accepts .csv files up to 5MB
                                                    </span>
                                                </>
                                            )}
                                        </label>
                                    </div>
                                    {importForm.errors.csv_file && (
                                        <p className="mt-1.5 text-xs text-red-600">{importForm.errors.csv_file}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        importForm.reset();
                                    }}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={importForm.processing || !importForm.data.csv_file}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                                >
                                    {importForm.processing ? 'Importing...' : 'Upload & Provision'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ============================================================ */}
                {/* MODAL 2: CREATE SINGLE USER MODAL (WITH PASSWORD TOGGLE)     */}
                {/* ============================================================ */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <form
                            onSubmit={handleCreateSubmit}
                            className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
                        >
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                                Create New User Account
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="e.g. Trainee Jane Doe"
                                        required
                                    />
                                    {createForm.errors.name && <p className="mt-1 text-xs text-red-600">{createForm.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="user@gregco.local"
                                        required
                                    />
                                    {createForm.errors.email && <p className="mt-1 text-xs text-red-600">{createForm.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                    <select
                                        value={createForm.data.role}
                                        onChange={(e) => createForm.setData('role', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number (Optional)</label>
                                    <input
                                        type="text"
                                        value={createForm.data.phone}
                                        onChange={(e) => createForm.setData('phone', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="+234..."
                                    />
                                </div>

                                {/* Initial Password Field with Show/Hide Toggle */}
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCreatePassword ? 'text' : 'password'}
                                            value={createForm.data.password}
                                            onChange={(e) => createForm.setData('password', e.target.value)}
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white pr-10"
                                            placeholder="Min. 8 characters"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCreatePassword(!showCreatePassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                            title={showCreatePassword ? 'Hide password' : 'Show password'}
                                            tabIndex={-1}
                                        >
                                            {showCreatePassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {createForm.errors.password && <p className="mt-1 text-xs text-red-600">{createForm.errors.password}</p>}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ============================================================ */}
                {/* MODAL 3: EDIT USER & RESET PASSWORD (WITH PASSWORD TOGGLE)   */}
                {/* ============================================================ */}
                {editingUser && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <form
                            onSubmit={handleEditSubmit}
                            className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
                        >
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <KeyRound className="w-5 h-5 text-blue-600" />
                                Edit User / Update Password
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        required
                                    />
                                    {editForm.errors.name && <p className="mt-1 text-xs text-red-600">{editForm.errors.name}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editForm.data.email}
                                        onChange={(e) => editForm.setData('email', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        required
                                    />
                                    {editForm.errors.email && <p className="mt-1 text-xs text-red-600">{editForm.errors.email}</p>}
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Role</label>
                                    <select
                                        value={editForm.data.role}
                                        onChange={(e) => editForm.setData('role', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    >
                                        {roles.map((r) => (
                                            <option key={r.value} value={r.value}>{r.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Reset Password Field with Show/Hide Toggle */}
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showEditPassword ? 'text' : 'password'}
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            placeholder="New password..."
                                            className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEditPassword(!showEditPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                                            title={showEditPassword ? 'Hide password' : 'Show password'}
                                            tabIndex={-1}
                                        >
                                            {showEditPassword ? (
                                                <EyeOff className="w-4 h-4" />
                                            ) : (
                                                <Eye className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                    {editForm.errors.password && <p className="mt-1 text-xs text-red-600">{editForm.errors.password}</p>}
                                </div>

                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={editForm.data.is_active}
                                        onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                        className="rounded border-slate-300 dark:border-slate-700 text-blue-600"
                                    />
                                    <label htmlFor="is_active" className="font-bold text-slate-700 dark:text-slate-300">
                                        Account Active & Enabled
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
