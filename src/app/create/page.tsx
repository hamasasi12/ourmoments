'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import FramePicker from '@/components/FramePicker';
import FrameCanvas, { FrameCanvasHandle } from '@/components/FrameCanvas';
import { FrameStyle, ROMANTIC_CAPTIONS, FRAME_STYLES } from '@/types';

const MAX_PHOTOS = 3;

export default function CreatePage() {
    const router = useRouter();
    const canvasRef = useRef<FrameCanvasHandle>(null);

    const [step, setStep] = useState<'upload' | 'style' | 'details' | 'preview'>('upload');
    const [photos, setPhotos] = useState<string[]>([]);       // object URLs for canvas preview
    const [photoFiles, setPhotoFiles] = useState<File[]>([]);  // actual File objects for upload
    const [frame, setFrame] = useState<FrameStyle>('film-strip');
    const [caption, setCaption] = useState('');
    const [loveNote, setLoveNote] = useState('');
    const [dateLabel, setDateLabel] = useState(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
    const [isPublic, setIsPublic] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [savedSlug, setSavedSlug] = useState<string | null>(null);
    const [generatedDataUrl, setGeneratedDataUrl] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState<number | null>(null);

    const handleFileSelect = useCallback(async (files: FileList | null, index?: number) => {
        if (!files) return;
        const fileArr = Array.from(files).slice(0, MAX_PHOTOS);

        // Lazy-load compression
        let compressImage: (file: File) => Promise<File>;
        try {
            const mod = await import('browser-image-compression');
            compressImage = (file: File) =>
                mod.default(file, { maxSizeMB: 1.5, maxWidthOrHeight: 1920, useWebWorker: true });
        } catch {
            compressImage = (file: File) => Promise.resolve(file);
        }

        const compressed = await Promise.all(fileArr.map(compressImage));
        const urls = compressed.map((f) => URL.createObjectURL(f));

        if (index !== undefined) {
            const newPhotos = [...photos];
            const newFiles = [...photoFiles];
            newPhotos[index] = urls[0];
            newFiles[index] = compressed[0];
            setPhotos(newPhotos);
            setPhotoFiles(newFiles);
        } else {
            const merged = [...photos, ...urls].slice(0, MAX_PHOTOS);
            const mergedFiles = [...photoFiles, ...compressed].slice(0, MAX_PHOTOS);
            setPhotos(merged);
            setPhotoFiles(mergedFiles);
        }
    }, [photos, photoFiles]);

    const removePhoto = (i: number) => {
        setPhotos((p) => p.filter((_, idx) => idx !== i));
        setPhotoFiles((f) => f.filter((_, idx) => idx !== i));
    };

    const handleSurpriseMe = () => {
        const randomFrame = FRAME_STYLES[Math.floor(Math.random() * FRAME_STYLES.length)].id;
        const randomCaption = ROMANTIC_CAPTIONS[Math.floor(Math.random() * ROMANTIC_CAPTIONS.length)];
        setFrame(randomFrame);
        setCaption(randomCaption);
        setStep('preview');
    };

    const handleGenerate = () => {
        setGenerating(true);
        requestAnimationFrame(() => {
            setTimeout(() => {
                const dataUrl = canvasRef.current?.getDataURL() ?? null;
                setGeneratedDataUrl(dataUrl);
                setGenerating(false);
            }, 300);
        });
    };

    const handleDownload = () => {
        if (!generatedDataUrl) return;
        const a = document.createElement('a');
        a.href = generatedDataUrl;
        a.download = `ourmoments-${frame}-${Date.now()}.png`;
        a.click();
    };

    const handleSave = async () => {
        if (!generatedDataUrl) return;
        setSaving(true);

        try {
            // Upload raw photos first
            const formData = new FormData();
            photoFiles.forEach((f) => formData.append('photos', f));

            await fetch('/api/upload', { method: 'POST', body: formData });

            // Save photobox
            const res = await fetch('/api/photobox/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: generatedDataUrl,
                    caption,
                    frameStyle: frame,
                    loveNote: loveNote || null,
                    isPublic,
                }),
            });

            const data = await res.json();
            if (data.photobox?.public_slug) setSavedSlug(data.photobox.public_slug);
            setSaving(false);
            // Show success
        } catch {
            setSaving(false);
        }
    };

    // Steps progress indicator
    const STEPS = ['upload', 'style', 'details', 'preview'] as const;
    const stepIndex = STEPS.indexOf(step);

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="font-playfair text-4xl mb-2" style={{ color: 'var(--wine)' }}>
                    Create Your Photobox ✨
                </h1>
                <p className="opacity-60 text-sm">Capture your moments in a beautiful frame</p>
            </div>

            {/* Step progress */}
            <div className="flex items-center justify-center gap-2 mb-10">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2">
                        <button
                            onClick={() => i < stepIndex + 1 && setStep(s)}
                            className="w-8 h-8 rounded-full text-xs font-semibold transition-all duration-300 flex items-center justify-center"
                            style={{
                                background: i <= stepIndex ? 'var(--wine)' : 'var(--card-border)',
                                color: i <= stepIndex ? '#FAF3E0' : 'var(--foreground)',
                                opacity: i <= stepIndex ? 1 : 0.5,
                            }}
                        >
                            {i < stepIndex ? '✓' : i + 1}
                        </button>
                        {i < STEPS.length - 1 && (
                            <div className="w-8 h-px" style={{ background: i < stepIndex ? 'var(--wine)' : 'var(--card-border)' }} />
                        )}
                    </div>
                ))}
            </div>

            {/* ── Step: Upload ── */}
            {step === 'upload' && (
                <div className="glass-card p-6 sm:p-8 animate-fade-up">
                    <h2 className="font-playfair text-2xl mb-2" style={{ color: 'var(--wine)' }}>Upload 3 Photos</h2>
                    <p className="text-sm opacity-60 mb-6">Choose exactly 3 photos to include in your photobox</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="relative aspect-square rounded-xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-200 overflow-hidden group"
                                style={{
                                    borderColor: dragOver === i ? 'var(--gold)' : (photos[i] ? 'transparent' : 'var(--card-border)'),
                                    background: photos[i] ? 'transparent' : 'rgba(255,255,255,0.3)',
                                }}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                                onDragLeave={() => setDragOver(null)}
                                onDrop={(e) => { e.preventDefault(); setDragOver(null); handleFileSelect(e.dataTransfer.files, i); }}
                                onClick={() => {
                                    const input = document.createElement('input');
                                    input.type = 'file';
                                    input.accept = 'image/*';
                                    input.onchange = (e) => handleFileSelect((e.target as HTMLInputElement).files, i);
                                    input.click();
                                }}
                            >
                                {photos[i] ? (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={photos[i]} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ background: 'rgba(0,0,0,0.6)' }}
                                            onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                                        >
                                            <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                                                <path d="M2 2l8 8M10 2l-8 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-2">
                                        <div className="text-2xl mb-1">📷</div>
                                        <p className="text-xs opacity-50">Photo {i + 1}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <label className="btn-outline text-sm cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileSelect(e.target.files)}
                            />
                            📁 Browse Photos
                        </label>

                        <button
                            className="btn-primary text-sm"
                            disabled={photos.length !== 3}
                            onClick={() => setStep('style')}
                        >
                            Next: Choose Frame →
                        </button>
                    </div>

                    {photos.length > 0 && photos.length < 3 && (
                        <p className="text-sm mt-3 opacity-60">
                            {3 - photos.length} more photo{3 - photos.length > 1 ? 's' : ''} needed
                        </p>
                    )}
                </div>
            )}

            {/* ── Step: Style ── */}
            {step === 'style' && (
                <div className="glass-card p-6 sm:p-8 animate-fade-up">
                    <h2 className="font-playfair text-2xl mb-2" style={{ color: 'var(--wine)' }}>Choose a Frame</h2>
                    <p className="text-sm opacity-60 mb-6">Pick the style that tells your story</p>

                    <FramePicker selected={frame} onChange={setFrame} />

                    <div className="flex gap-3 mt-6 flex-wrap">
                        <button className="btn-outline text-sm" onClick={() => setStep('upload')}>← Back</button>
                        <button className="btn-primary text-sm" onClick={() => setStep('details')}>
                            Next: Add Details →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step: Details ── */}
            {step === 'details' && (
                <div className="glass-card p-6 sm:p-8 animate-fade-up">
                    <h2 className="font-playfair text-2xl mb-2" style={{ color: 'var(--wine)' }}>Add Details</h2>
                    <p className="text-sm opacity-60 mb-6">A caption and a date to remember this moment</p>

                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">Caption</label>
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="input-romantic resize-none"
                                rows={2}
                                placeholder="A sweet message for your photobox…"
                                maxLength={120}
                            />
                            <p className="text-xs opacity-40 mt-1">{caption.length}/120</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">Date</label>
                            <input
                                type="date"
                                className="input-romantic"
                                value={dateLabel}
                                onChange={(e) => setDateLabel(e.target.value || dateLabel)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2 opacity-70">
                                Love Note <span className="opacity-50 text-xs">(private, visible on hover in gallery)</span>
                            </label>
                            <textarea
                                value={loveNote}
                                onChange={(e) => setLoveNote(e.target.value)}
                                className="input-romantic resize-none"
                                rows={2}
                                placeholder="A secret message just between you two…"
                                maxLength={200}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                role="switch"
                                aria-checked={isPublic}
                                onClick={() => setIsPublic(!isPublic)}
                                className="w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0"
                                style={{ background: isPublic ? 'var(--wine)' : 'var(--card-border)' }}
                            >
                                <span
                                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                                    style={{ transform: isPublic ? 'translateX(20px)' : 'translateX(0)' }}
                                />
                            </button>
                            <label className="text-sm opacity-70">Make shareable (generates a public link)</label>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 flex-wrap">
                        <button className="btn-outline text-sm" onClick={() => setStep('style')}>← Back</button>
                        <button className="btn-gold text-sm flex items-center gap-2" onClick={handleSurpriseMe}>
                            🎲 Surprise Me
                        </button>
                        <button className="btn-primary text-sm" onClick={() => setStep('preview')}>
                            Preview →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Step: Preview ── */}
            {step === 'preview' && (
                <div className="animate-fade-up">
                    <div className="glass-card p-6 sm:p-8 mb-6">
                        <h2 className="font-playfair text-2xl mb-6 text-center" style={{ color: 'var(--wine)' }}>
                            Your Photobox 🖼️
                        </h2>

                        {/* Canvas */}
                        <FrameCanvas
                            ref={canvasRef}
                            photos={photos}
                            frameStyle={frame}
                            caption={caption}
                            dateLabel={dateLabel}
                        />

                        {/* Film loading overlay */}
                        {generating && (
                            <div className="mt-4 flex items-center justify-center gap-3 opacity-70">
                                <div className="film-loading animate-film-flicker" />
                                <span className="text-sm font-medium">Generating…</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="glass-card p-6 flex flex-col gap-4">
                        {!generatedDataUrl ? (
                            <button className="btn-primary justify-center text-base" onClick={handleGenerate} disabled={generating}>
                                {generating ? '⏳ Generating…' : '✨ Generate Photobox'}
                            </button>
                        ) : (
                            <>
                                <div className="flex gap-3 flex-wrap justify-center">
                                    <button className="btn-gold text-sm" onClick={handleDownload}>
                                        ⬇️ Download PNG
                                    </button>
                                    <button className="btn-primary text-sm" onClick={handleSave} disabled={saving}>
                                        {saving ? '⏳ Saving…' : '💌 Save to Gallery'}
                                    </button>
                                    <button className="btn-outline text-sm" onClick={() => {
                                        setGeneratedDataUrl(null);
                                        setStep('details');
                                    }}>
                                        ✏️ Edit
                                    </button>
                                </div>

                                {savedSlug && (
                                    <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)' }}>
                                        <p className="text-sm font-medium mb-2" style={{ color: 'var(--gold)' }}>✅ Saved! Share link:</p>
                                        <a
                                            href={`/p/${savedSlug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-sm break-all underline"
                                            style={{ color: 'var(--wine)' }}
                                        >
                                            {typeof window !== 'undefined' ? window.location.origin : ''}/p/{savedSlug}
                                        </a>
                                        <button
                                            className="mt-2 text-xs opacity-60 hover:opacity-100 ml-3"
                                            onClick={() => {
                                                navigator.clipboard?.writeText(`${window.location.origin}/p/${savedSlug}`);
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                )}

                                {!savedSlug && generatedDataUrl && (
                                    <button className="btn-outline text-sm justify-center" onClick={() => router.push('/gallery')}>
                                        View Gallery →
                                    </button>
                                )}
                            </>
                        )}

                        <button className="btn-outline text-sm justify-center" onClick={() => setStep('details')}>
                            ← Back to Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
