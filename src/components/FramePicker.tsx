'use client';

import { FRAME_STYLES, FrameStyle } from '@/types';

interface FramePickerProps {
    selected: FrameStyle;
    onChange: (style: FrameStyle) => void;
}

export default function FramePicker({ selected, onChange }: FramePickerProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {FRAME_STYLES.map((frame) => {
                const isSelected = selected === frame.id;
                return (
                    <button
                        key={frame.id}
                        onClick={() => onChange(frame.id)}
                        className="relative p-3 rounded-xl border text-left transition-all duration-200 group"
                        style={{
                            borderColor: isSelected ? 'var(--gold)' : 'var(--card-border)',
                            background: isSelected
                                ? 'linear-gradient(135deg, rgba(201,168,76,0.12), rgba(107,39,55,0.08))'
                                : 'rgba(255,255,255,0.4)',
                            boxShadow: isSelected ? '0 0 0 2px var(--gold)' : 'none',
                            transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                        }}
                    >
                        {/* Frame Preview */}
                        <div className="w-full aspect-[3/4] rounded-lg mb-2 overflow-hidden flex items-center justify-center text-3xl"
                            style={{ background: getFramePreviewBg(frame.id) }}
                        >
                            <span className="text-2xl">{frame.emoji}</span>
                        </div>

                        <p className="text-xs font-semibold" style={{ color: isSelected ? 'var(--gold)' : 'var(--foreground)' }}>
                            {frame.label}
                        </p>
                        <p className="text-xs opacity-50 mt-0.5 leading-tight">{frame.description}</p>

                        {isSelected && (
                            <div
                                className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'var(--gold)' }}
                            >
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="white">
                                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                </svg>
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function getFramePreviewBg(id: FrameStyle): string {
    switch (id) {
        case 'film-strip': return 'linear-gradient(135deg, #111, #222)';
        case 'polaroid': return 'linear-gradient(135deg, #f8f8f0, #ece9e0)';
        case 'soft-pink': return 'linear-gradient(135deg, #FAF3E0, #F2C4BB)';
        case 'dark-romance': return 'linear-gradient(135deg, #1a0a0f, #4A1A26)';
        default: return '#ccc';
    }
}
