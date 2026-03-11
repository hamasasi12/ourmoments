'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);
    if (!mounted) return <div className="w-8 h-8" />;

    const isDark = theme === 'dark';

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ background: 'var(--card-border)' }}
        >
            {isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--gold)' }}>
                    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--wine)' }}>
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
            )}
        </button>
    );
}
