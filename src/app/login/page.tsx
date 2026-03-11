'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/gallery';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await signIn('credentials', {
            email,
            password,
            redirect: false,
        });

        setLoading(false);

        if (res?.error) {
            setError('Invalid email or password. Please try again.');
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
            <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-romantic"
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 opacity-70">Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-romantic"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                />
            </div>

            {error && (
                <div className="text-sm rounded-lg px-4 py-3" style={{ background: 'rgba(107,39,55,0.12)', color: 'var(--wine)' }}>
                    {error}
                </div>
            )}

            <button type="submit" className="btn-primary justify-center w-full" disabled={loading}>
                {loading ? (
                    <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
                        </svg>
                        Signing in…
                    </span>
                ) : 'Sign In'}
            </button>

            <p className="text-center text-sm opacity-60">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-medium underline" style={{ color: 'var(--gold)' }}>
                    Create one
                </Link>
            </p>
        </form>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md animate-fade-up">
                <div className="text-center mb-8">
                    <h1 className="font-playfair text-4xl mb-2" style={{ color: 'var(--wine)' }}>
                        Welcome back 💕
                    </h1>
                    <p className="opacity-60 text-sm">Sign in to continue your story</p>
                </div>

                <Suspense fallback={<div className="glass-card p-8 animate-pulse opacity-60" style={{ minHeight: 280 }} />}>
                    <LoginForm />
                </Suspense>
            </div>
        </div>
    );
}
