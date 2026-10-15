import React, { useState, useEffect } from 'react';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';
import { ShieldCheck, Terminal, BookOpen, FileSpreadsheet, User, LogOut, Moon, Sun, ShieldAlert, Users } from 'lucide-react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const user = usePage().props.auth.user;
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') !== 'light';
        }
        return true;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode((prev) => !prev);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-200">
            <nav className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40 shadow-xs">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2.5">
                                    <img
                                        src="/images/logo.png"
                                        alt="Greg & Co. ICT Limited"
                                        className="h-10 w-auto object-contain bg-white rounded p-0.5"
                                    />
                                    <div className="hidden sm:block">
                                        <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                                            GREG CYBERLAB
                                        </span>
                                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase block">
                                            ICT Academy Makurdi
                                        </span>
                                    </div>
                                </Link>
                            </div>

                            <div className="hidden space-x-6 sm:-my-px sm:ms-8 sm:flex items-center">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="text-xs font-bold dark:text-slate-200"
                                >
                                    Dashboard
                                </NavLink>

                                <NavLink
                                    href={route('courses.index')}
                                    active={route().current('courses.*')}
                                    className="text-xs font-bold dark:text-slate-200"
                                >
                                    Curriculum
                                </NavLink>

                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'academic_coordinator') && (
                                    <NavLink
                                        href={route('admin.programmes.index')}
                                        active={route().current('admin.programmes.*')}
                                        className="text-xs font-bold dark:text-slate-200"
                                    >
                                        Programmes
                                    </NavLink>
                                )}

                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'instructor' || user.role === 'academic_coordinator') && (
                                    <NavLink
                                        href={route('cohorts.index')}
                                        active={route().current('cohorts.*')}
                                        className="text-xs font-bold dark:text-slate-200"
                                    >
                                        Cohorts
                                    </NavLink>
                                )}

                                {(user.role === 'admin' || user.role === 'super_admin') && (
                                    <NavLink
                                        href={route('admin.users.index')}
                                        active={route().current('admin.users.*')}
                                        className="text-xs font-bold dark:text-slate-200"
                                    >
                                        Users
                                    </NavLink>
                                )}

                                {(user.role === 'admin' || user.role === 'super_admin') && (
                                    <NavLink
                                        href={route('admin.audit-logs')}
                                        active={route().current('admin.audit-logs')}
                                        className="text-xs font-bold dark:text-slate-200"
                                    >
                                        Audit Trail
                                    </NavLink>
                                )}

                                <a
                                    href="/tools/cyberchef/index.html"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs font-bold text-cyan-500 hover:text-cyan-400 dark:text-cyan-400 dark:hover:text-cyan-300 flex items-center gap-1.5 px-3 py-2 transition"
                                    title="Open CyberChef Studio"
                                >
                                    🍳 CyberChef
                                </a>

                                {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'instructor') && (
                                    <a
                                        href={route('reports.export')}
                                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-2"
                                    >
                                        <FileSpreadsheet className="w-3.5 h-3.5" />
                                        Export CSV
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-3">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={toggleDarkMode}
                                aria-label="Toggle Dark Mode Theme"
                                className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                            >
                                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                            </button>

                            <div className="relative ms-2">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none"
                                            >
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                {user.name}
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 uppercase font-extrabold">
                                                    {user.role}
                                                </span>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden gap-2">
                            <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
                            >
                                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                            </button>
                            <button
                                onClick={() => setShowingNavigationDropdown((prev) => !prev)}
                                className="inline-flex items-center justify-center rounded-md p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden border-t border-slate-200 dark:border-slate-800'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink href={route('courses.index')} active={route().current('courses.*')}>
                            Curriculum
                        </ResponsiveNavLink>
                        {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'instructor') && (
                            <ResponsiveNavLink href={route('cohorts.index')} active={route().current('cohorts.*')}>
                                Cohorts
                            </ResponsiveNavLink>
                        )}
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                            <ResponsiveNavLink href={route('admin.users.index')} active={route().current('admin.users.*')}>
                                Users
                            </ResponsiveNavLink>
                        )}
                        {(user.role === 'admin' || user.role === 'super_admin') && (
                            <ResponsiveNavLink href={route('admin.audit-logs')} active={route().current('admin.audit-logs')}>
                                Audit Trail
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-slate-200 dark:border-slate-800 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-bold text-slate-800 dark:text-white">{user.name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>Profile</ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">Log Out</ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
