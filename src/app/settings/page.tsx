'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const router = useRouter();
    const [form, setForm] = useState({ displayName: '', partnerName: '', anniversaryDate: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/settings')
            .then((r) => r.json())
            .then((data) => {
                if (data.user) {
                    setForm({
                        displayName: data.user.display_name || '',
                        partnerName: data.user.partner_name || '',
                        anniversaryDate: data.user.anniversary_date
                            ? data.user.anniversary_date.slice(0, 10)
                            : '',
                    });
                }
                setLoading(false);
            });
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSaved(false);

        const res = await fetch('/api/settings', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        setSaving(false);

        if (res.ok) {
            setSaved(true);
            await update({ displayName: form.displayName, partnerName: form.partnerName, anniversaryDate: form.anniversaryDate });
            setTimeout(() => setSaved(false), 3000);
        } else {
            setError('Failed to save. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse opacity-60 font-playfair text-xl" style={{ color: 'var(--wine)' }}>
                    Loading…
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-4 py-10">
            <div className="text-center mb-8 animate-fade-up">
                <h1 className="font-playfair text-4xl mb-2" style={{ color: 'var(--wine)' }}>Settings 💕</h1>
                <p className="opacity-60 text-sm">Personalize your OurMoments experience</p>
            </div>

            <form onSubmit={handleSave} className="glass-card p-8 flex flex-col gap-5 animate-fade-up delay-100">
                <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Your Display Name</label>
                    <input
                        type="text"
                        className="input-romantic"
                        value={form.displayName}
                        onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                        placeholder="e.g. Sofia"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">Partner&apos;s Name</label>
                    <input
                        type="text"
                        className="input-romantic"
                        value={form.partnerName}
                        onChange={(e) => setForm((f) => ({ ...f, partnerName: e.target.value }))}
                        placeholder="e.g. Marco"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 opacity-70">
                        Anniversary Date <span className="opacity-50 text-xs">(used for the countdown on your home page)</span>
                    </label>
                    <input
                        type="date"
                        className="input-romantic"
                        value={form.anniversaryDate}
                        onChange={(e) => setForm((f) => ({ ...f, anniversaryDate: e.target.value }))}
                    />
                </div>

                {error && (
                    <div className="text-sm rounded-lg px-4 py-3" style={{ background: 'rgba(107,39,55,0.12)', color: 'var(--wine)' }}>
                        {error}
                    </div>
                )}

                {saved && (
                    <div className="text-sm rounded-lg px-4 py-3 animate-fade-in"
                        style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
                        ✅ Saved successfully!
                    </div>
                )}

                <div className="flex gap-3">
                    <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                        {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button type="button" className="btn-outline" onClick={() => router.back()}>
                        Cancel
                    </button>
                </div>
            </form>

            {/* Account info */}
            <div className="glass-card p-6 mt-6 animate-fade-up delay-200">
                <h2 className="font-playfair text-lg mb-3" style={{ color: 'var(--wine)' }}>Account</h2>
                <p className="text-sm opacity-60">
                    Signed in as <strong className="opacity-90">{session?.user?.email}</strong>
                </p>
            </div>
        </div>
    );
}
