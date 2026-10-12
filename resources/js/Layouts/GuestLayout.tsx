import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/" className="flex flex-col items-center gap-2">
                    <img
                        src="/images/logo.png"
                        alt="Greg & Co. ICT Limited"
                        className="h-14 w-auto object-contain bg-white rounded-lg p-1 shadow-xs"
                    />
                    <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                        GREG CYBERLAB <span className="text-blue-500">SIMULATOR</span>
                    </span>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-6 shadow-md sm:max-w-md sm:rounded-2xl">
                {children}
            </div>
        </div>
    );
}
