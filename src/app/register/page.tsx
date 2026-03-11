'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '', displayName: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (key: string, value: string) => {
        setForm((f) => ({ ...f, [key]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            // Auto-login after register
            const signInRes = await signIn('credentials', {
                email: form.email,
                password: form.password,
                redirect: false,
            });

            if (signInRes?.error) {
                setError('Account created! Please sign in.');
                router.push('/login');
            } else {
                router.push('/create');
                router.refresh();
            }
        } catch {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20">
            <div className="w-full max-w-md animate-fade-up">
                <div className="text-center mb-8">
                    <h1 className="font-playfair text-4xl mb-2" style={{ color: 'var(--wine)' }}>
                        Begin your story 🌹
                    </h1>
                    <p className="opacity-60 text-sm">Create a free account to get started</p>
                </div>

                <form onSubmit={handleSubmit} className="glass-card p-8 flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-70">Your name</label>
                        <input
                            type="text"
                            value={form.displayName}
                            onChange={(e) => handleChange('displayName', e.target.value)}
                            className="input-romantic"
                            placeholder="e.g. Sofia"
                            autoComplete="name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-70">Email</label>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="input-romantic"
                            placeholder="your@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 opacity-70">Password <span className="opacity-50 text-xs">(min. 8 characters)</span></label>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className="input-romantic"
                            placeholder="••••••••"
                            required
                            minLength={8}
                            autoComplete="new-password"
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
                                Creating account…
                            </span>
                        ) : 'Create Account'}
                    </button>

                    <p className="text-center text-sm opacity-60">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium underline" style={{ color: 'var(--gold)' }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
