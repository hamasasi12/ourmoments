export type FrameStyle = 'film-strip' | 'polaroid' | 'soft-pink' | 'dark-romance';

export interface Photobox {
    id: string;
    user_id?: string;
    image_path: string;
    caption: string | null;
    frame_style: FrameStyle | null;
    love_note: string | null;
    is_public: boolean;
    public_slug: string | null;
    created_at: string;
}

export interface GalleryItem extends Photobox {
    thumbnailUrl: string;
}

export const FRAME_STYLES: { id: FrameStyle; label: string; description: string; emoji: string }[] = [
    { id: 'film-strip', label: 'Film Strip', description: 'Classic black film border with sprocket holes', emoji: '🎞️' },
    { id: 'polaroid', label: 'Polaroid', description: 'White border with a sweet handwritten feel', emoji: '📷' },
    { id: 'soft-pink', label: 'Soft Pink', description: 'Pastel floral border, elegant for couples', emoji: '🌸' },
    { id: 'dark-romance', label: 'Dark Romance', description: 'Moody dark frame with gold accents', emoji: '🥀' },
];

export const ROMANTIC_CAPTIONS = [
    "Every moment with you is a treasure 💕",
    "You're my favorite adventure ✨",
    "In your arms is where I belong 🌙",
    "Us, always 💫",
    "Forever starts right now 💍",
    "My heart found its home in you 🏡",
    "Two souls, one love 💞",
    "You make every day golden ☀️",
    "Falling for you, every single day 🍂",
    "You are my today and all of my tomorrows 🌹",
    "Love is you and me, right here 🌷",
    "With you, I'm home 🕊️",
    "Every picture tells our story 📖",
    "Made for each other 💑",
    "Here's to us ❤️",
];
