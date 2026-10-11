import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Users, UserPlus, KeyRound, Shield, CheckCircle, XCircle, Search, Filter } from 'lucide-react';
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
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);

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
                            Configure roles, access policies, and reset trainee/instructor passwords
                        </p>
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                    >
                        <UserPlus className="w-4 h-4" /> Add New User
                    </button>
                </div>
            }
        >
            <Head title="Users Management - Greg Cyberlab" />

            <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
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
                        <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                </form>

                {/* Users Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-4">User</th>
                                    <th className="py-3 px-4">Role</th>
                                    <th className="py-3 px-4">Contact</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Created</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {users.data.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                        <td className="py-3 px-4">
                                            <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="font-mono font-bold text-[10px] uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                                            {u.phone || '—'}
                                        </td>
                                        <td className="py-3 px-4">
                                            {u.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle className="w-3.5 h-3.5" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                                                    <XCircle className="w-3.5 h-3.5" /> Suspended
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right space-x-2">
                                            <button
                                                onClick={() => handleEditOpen(u)}
                                                className="px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                            >
                                                Edit / Reset Password
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u)}
                                                className="px-2.5 py-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline"
                                            >
                                                Deactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create User Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                        <form
                            onSubmit={handleCreateSubmit}
                            className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
                        >
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-600" />
                                Add New Academy User
                            </h3>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={createForm.data.email}
                                        onChange={(e) => createForm.setData('email', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        required
                                    />
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
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Initial Password</label>
                                    <input
                                        type="password"
                                        value={createForm.data.password}
                                        onChange={(e) => createForm.setData('password', e.target.value)}
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                        placeholder="Min. 8 characters"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
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

                {/* Edit User & Reset Password Modal */}
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
                                <div>
                                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        Reset Password <span className="text-slate-400 font-normal">(Leave blank to keep unchanged)</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={editForm.data.password}
                                        onChange={(e) => editForm.setData('password', e.target.value)}
                                        placeholder="New password..."
                                        className="w-full rounded-xl border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                                    />
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

                            <div className="flex justify-end gap-2 pt-2">
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
