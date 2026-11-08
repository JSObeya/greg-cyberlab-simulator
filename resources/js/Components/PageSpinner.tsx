import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Shield, Loader2, Cpu } from 'lucide-react';

interface PageSpinnerProps {
    minDurationMs?: number;
}

export default function PageSpinner({ minDurationMs = 250 }: PageSpinnerProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let startTime = 0;
        let progressTimer: any = null;

        const removeStartListener = router.on('start', () => {
            startTime = Date.now();
            setIsLoading(true);
            setProgress(15);

            // Increment progress smoothly
            progressTimer = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev;
                    return prev + Math.floor(Math.random() * 12) + 5;
                });
            }, 120);
        });

        const removeProgressListener = router.on('progress', (event) => {
            if (event.detail.progress?.percentage) {
                setProgress(Math.max(event.detail.progress.percentage, 25));
            }
        });

        const removeFinishListener = router.on('finish', () => {
            if (progressTimer) clearInterval(progressTimer);
            setProgress(100);

            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minDurationMs - elapsed);

            setTimeout(() => {
                setIsLoading(false);
                setProgress(0);
            }, remaining + 120);
        });

        return () => {
            removeStartListener();
            removeProgressListener();
            removeFinishListener();
            if (progressTimer) clearInterval(progressTimer);
        };
    }, [minDurationMs]);

    if (!isLoading && progress === 0) {
        return null;
    }

    return (
        <>
            {/* Top Glowing Progress Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none">
                <div
                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all duration-200 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Floating Cyber Glass Spinner Overlay */}
            {isLoading && (
                <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 dark:bg-slate-950/95 border border-blue-500/40 shadow-2xl shadow-blue-500/20 backdrop-blur-md text-white">
                        <div className="relative flex items-center justify-center">
                            {/* Outer Pulsing Ring */}
                            <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-400 animate-spin" />
                            {/* Inner Icon */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                            </div>
                        </div>

                        <div className="text-left">
                            <p className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                                <span>Loading CyberLab...</span>
                            </p>
                            <p className="text-[10px] text-cyan-300/80 font-mono">
                                Synchronizing session {progress}%
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

/**
 * Reusable inline spinner for buttons and cards
 */
export function InlineSpinner({ className = 'w-4 h-4 text-blue-500' }: { className?: string }) {
    return <Loader2 className={`animate-spin ${className}`} />;
}

