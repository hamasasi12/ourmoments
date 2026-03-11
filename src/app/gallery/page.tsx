'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Photobox } from '@/types';

export default function GalleryPage() {
    const [items, setItems] = useState<Photobox[]>([]);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [lightbox, setLightbox] = useState<Photobox | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const observerRef = useRef<HTMLDivElement>(null);

    const fetchMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        const url = '/api/photobox/list' + (cursor ? `?cursor=${cursor}` : '');
        const res = await fetch(url);
        const data = await res.json();
        setItems((prev) => [...prev, ...data.items]);
        setCursor(data.nextCursor);
        setHasMore(!!data.nextCursor);
        setLoading(false);
    }, [cursor, hasMore, loading]);

    // Initial fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { fetchMore(); }, []);

    // Infinite scroll observer
    useEffect(() => {
        const el = observerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) fetchMore();
        }, { threshold: 0.1 });
        obs.observe(el);
        return () => obs.disconnect();
    }, [fetchMore]);

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this photobox?')) return;
        setDeleting(id);
        await fetch(`/api/photobox/${id}`, { method: 'DELETE' });
        setItems((prev) => prev.filter((p) => p.id !== id));
        if (lightbox?.id === id) setLightbox(null);
        setDeleting(null);
    };

    const handleDownload = (item: Photobox) => {
        const a = document.createElement('a');
        a.href = `/api/files/${item.image_path}`;
        a.download = `ourmoments-${item.id}.png`;
        a.click();
    };

    const getImageUrl = (path: string) => `/api/files/${path}`;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-playfair text-4xl" style={{ color: 'var(--wine)' }}>Your Gallery 💌</h1>
                    <p className="text-sm opacity-60 mt-1">All your precious moments, beautifully kept</p>
                </div>
                <a href="/create" className="btn-primary text-sm hidden sm:inline-flex">
                    ✨ Create New
                </a>
            </div>

            {/* Grid */}
            {items.length === 0 && !loading ? (
                <div className="text-center py-24 glass-card animate-fade-up">
                    <div className="text-5xl mb-4">📷</div>
                    <h2 className="font-playfair text-2xl mb-3" style={{ color: 'var(--wine)' }}>No photoboxes yet</h2>
                    <p className="opacity-60 text-sm mb-6">Create your first one and start your story</p>
                    <a href="/create" className="btn-primary text-sm">✨ Create Photobox</a>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map((item, i) => (
                        <div
                            key={item.id}
                            className="group relative rounded-2xl overflow-hidden cursor-pointer animate-fade-up glass-card p-0"
                            style={{ animationDelay: `${(i % 12) * 0.05}s` }}
                            onClick={() => setLightbox(item)}
                        >
                            <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getImageUrl(item.image_path)}
                                    alt={item.caption || 'Photobox'}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />

                                {/* Love note overlay */}
                                {item.love_note && (
                                    <div className="love-note-overlay p-4">
                                        <p className="text-sm leading-relaxed">❤️ {item.love_note}</p>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                                        style={{ background: 'rgba(0,0,0,0.65)' }}
                                        onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                                        title="Download"
                                    >
                                        ⬇
                                    </button>
                                    <button
                                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                                        style={{ background: 'rgba(107,39,55,0.85)' }}
                                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                                        disabled={deleting === item.id}
                                        title="Delete"
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>

                            <div className="p-3">
                                {item.caption && (
                                    <p className="text-xs font-medium line-clamp-2 opacity-80">{item.caption}</p>
                                )}
                                <p className="text-xs opacity-40 mt-1">
                                    {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                {item.is_public && item.public_slug && (
                                    <a
                                        href={`/p/${item.public_slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs mt-1 inline-block"
                                        style={{ color: 'var(--gold)' }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        🔗 Public link
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Infinite scroll trigger */}
            <div ref={observerRef} className="h-8 mt-6" />
            {loading && (
                <div className="text-center py-6 opacity-60 text-sm animate-pulse">Loading more…</div>
            )}

            {/* Lightbox */}
            {lightbox && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
                    onClick={() => setLightbox(null)}
                >
                    <div
                        className="relative max-w-lg w-full glass-card overflow-hidden animate-fade-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={getImageUrl(lightbox.image_path)}
                            alt={lightbox.caption || 'Photobox'}
                            className="w-full"
                        />
                        <div className="p-5">
                            {lightbox.caption && (
                                <p className="font-playfair text-lg italic mb-1" style={{ color: 'var(--wine)' }}>
                                    {lightbox.caption}
                                </p>
                            )}
                            <p className="text-xs opacity-50 mb-4">
                                {new Date(lightbox.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            {lightbox.love_note && (
                                <div className="rounded-lg p-4 mb-4 text-sm italic"
                                    style={{ background: 'rgba(107,39,55,0.08)', color: 'var(--wine)', border: '1px solid var(--card-border)' }}>
                                    ❤️ {lightbox.love_note}
                                </div>
                            )}
                            <div className="flex gap-3 flex-wrap">
                                <button className="btn-gold text-sm" onClick={() => handleDownload(lightbox)}>⬇️ Download</button>
                                <button className="btn-outline text-sm" style={{ color: 'red' }}
                                    onClick={() => handleDelete(lightbox.id)} disabled={deleting === lightbox.id}>
                                    🗑 Delete
                                </button>
                                {lightbox.is_public && lightbox.public_slug && (
                                    <a href={`/p/${lightbox.public_slug}`} target="_blank" rel="noreferrer" className="btn-outline text-sm">
                                        🔗 Share
                                    </a>
                                )}
                                <button className="btn-outline text-sm" onClick={() => setLightbox(null)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
