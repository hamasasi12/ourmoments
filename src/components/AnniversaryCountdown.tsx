'use client';

import { useEffect, useState } from 'react';

interface AnniversaryCountdownProps {
    anniversaryDate: string | null | undefined;
    partnerName?: string | null;
}

export default function AnniversaryCountdown({ anniversaryDate, partnerName }: AnniversaryCountdownProps) {
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (!anniversaryDate) return;

        const calculate = () => {
            const now = new Date();

            // How long together
            const totalDaysTogether = Math.floor(
                (now.getTime() - new Date(anniversaryDate).getTime()) / (1000 * 60 * 60 * 24)
            );

            // Next anniversary
            const next = new Date(anniversaryDate);
            next.setFullYear(now.getFullYear());
            if (next <= now) next.setFullYear(now.getFullYear() + 1);

            const diff = next.getTime() - now.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds, totalDays: Math.max(0, totalDaysTogether) });
        };

        calculate();
        const timer = setInterval(calculate, 1000);
        return () => clearInterval(timer);
    }, [anniversaryDate]);

    if (!mounted) return null;

    if (!anniversaryDate) {
        return (
            <div className="glass-card p-6 text-center animate-fade-up">
                <p className="font-playfair text-lg opacity-60" style={{ color: 'var(--foreground)' }}>
                    Set your anniversary date in{' '}
                    <a href="/settings" className="underline" style={{ color: 'var(--gold)' }}>Settings</a>{' '}
                    to see your countdown 💕
                </p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 sm:p-8 animate-fade-up">
            <p className="font-playfair text-center text-sm italic mb-4 opacity-70" style={{ color: 'var(--foreground)' }}>
                {partnerName ? `You & ${partnerName} · ` : ''}
                {countdown.totalDays} days together 💕
            </p>

            <p className="text-center text-xs uppercase tracking-widest mb-5 opacity-50 font-sans">
                Next anniversary in
            </p>

            <div className="grid grid-cols-4 gap-3 sm:gap-4">
                {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Mins' },
                    { value: countdown.seconds, label: 'Secs' },
                ].map(({ value, label }) => (
                    <div
                        key={label}
                        className="flex flex-col items-center p-3 rounded-xl"
                        style={{ background: 'linear-gradient(135deg, rgba(107,39,55,0.1), rgba(201,168,76,0.1))' }}
                    >
                        <span
                            className="font-playfair text-3xl sm:text-4xl font-semibold tabular-nums"
                            style={{ color: 'var(--wine)' }}
                        >
                            {String(value).padStart(2, '0')}
                        </span>
                        <span className="text-xs mt-1 opacity-60 tracking-wide">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
