import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';

interface ProgrammeOption {
    id: number;
    title: string;
    code: string;
}

export default function Register({ programmes = [] }: { programmes?: ProgrammeOption[] }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        programme_id: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Cadet Registration" />

            <div className="mb-5 p-3.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-blue-200 text-xs flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                    <span className="font-bold block text-white">Academy Admission Directive</span>
                    <span>All new trainee registrations undergo verification and require Administrator approval before account activation.</span>
                </div>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Full Name / Rank" />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        placeholder="e.g. Sub-Lt John Adebayo"
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-1" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Official / Cadet Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        placeholder="cadet@navy-cyberlab.ng"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="phone" value="Phone / Duty Contact (Optional)" />

                        <TextInput
                            id="phone"
                            type="text"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full"
                            placeholder="+234 803 000 0000"
                            onChange={(e) => setData('phone', e.target.value)}
                        />

                        <InputError message={errors.phone} className="mt-1" />
                    </div>

                    <div>
                        <InputLabel htmlFor="programme_id" value="Assigned Programme" />

                        <select
                            id="programme_id"
                            name="programme_id"
                            value={data.programme_id}
                            onChange={(e) => setData('programme_id', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 text-sm shadow-xs focus:border-indigo-500 focus:ring-indigo-500"
                        >
                            <option value="">-- Select Programme (Optional) --</option>
                            {programmes.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title} ({p.code})
                                </option>
                            ))}
                        </select>

                        <InputError message={errors.programme_id} className="mt-1" />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-1" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-1"
                    />
                </div>

                <div className="pt-2 flex items-center justify-between">
                    <Link
                        href={route('login')}
                        className="text-xs text-gray-400 hover:text-white underline transition"
                    >
                        Already registered? Log in
                    </Link>

                    <PrimaryButton className="inline-flex items-center gap-2" disabled={processing}>
                        {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Submit Registration</span>
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
