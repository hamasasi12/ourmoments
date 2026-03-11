'use client';

import { useEffect, useRef, useState } from 'react';

export default function MusicPlayer() {
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio('/music/ambient.mp3');
        audio.loop = true;
        audio.volume = 0.35;
        audioRef.current = audio;
        return () => { audio.pause(); audio.src = ''; };
    }, []);

    const toggle = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            audioRef.current.play().then(() => setPlaying(true)).catch(() => { });
        }
    };

    return (
        <button
            onClick={toggle}
            aria-label={playing ? 'Pause music' : 'Play ambient music'}
            title={playing ? 'Pause music' : 'Play ambient music'}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{
                background: playing
                    ? 'linear-gradient(135deg, #6B2737, #8B3A4D)'
                    : 'rgba(255,255,255,0.85)',
                border: '1.5px solid var(--card-border)',
                backdropFilter: 'blur(12px)',
                boxShadow: playing ? '0 0 0 0 rgba(107,39,55,0.4)' : 'none',
                animation: playing ? 'pulseGold 2s ease-in-out infinite' : 'none',
            }}
        >
            {playing ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#FAF3E0">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
            ) : (
                <span style={{ fontSize: '18px' }}>🎵</span>
            )}
        </button>
    );
}
