import { notFound } from 'next/navigation';

interface PublicPhotobox {
    id: string;
    image_path: string;
    caption: string | null;
    frame_style: string | null;
    created_at: string;
    public_slug: string;
}

async function getPhotobox(slug: string): Promise<PublicPhotobox | null> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/p/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.photobox || null;
}

export default async function PublicPhotoboxPage({
    params,
}: {
    params: { slug: string };
}) {
    const photobox = await getPhotobox(params.slug);
    if (!photobox) notFound();

    const imageUrl = `/api/files/${photobox.image_path}`;
    const formattedDate = new Date(photobox.created_at).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
            {/* Ambient bg */}
            <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #E8A598, transparent)' }} />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl"
                    style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />
            </div>

            <div className="max-w-lg w-full">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-up">
                    <div className="text-3xl mb-3">💕</div>
                    <h1 className="font-playfair text-3xl sm:text-4xl" style={{ color: 'var(--wine)' }}>
                        A Moment Together
                    </h1>
                    <p className="text-sm opacity-50 mt-2">Shared with love via OurMoments</p>
                </div>

                {/* Photobox image */}
                <div className="glass-card overflow-hidden animate-fade-up delay-100 mb-6">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={photobox.caption || 'Shared photobox'}
                        className="w-full"
                    />

                    {photobox.caption && (
                        <div className="p-5 text-center">
                            <p className="font-playfair text-xl italic" style={{ color: 'var(--wine)' }}>
                                {photobox.caption}
                            </p>
                            <p className="text-xs opacity-40 mt-2">{formattedDate}</p>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <div className="text-center glass-card p-6 animate-fade-up delay-200">
                    <p className="font-playfair text-lg mb-2" style={{ color: 'var(--wine)' }}>
                        Create your own photobox ✨
                    </p>
                    <p className="text-sm opacity-60 mb-4">
                        OurMoments — romantic photoboxes designed for couples
                    </p>
                    <a href="/register" className="btn-primary text-sm">
                        Start for Free
                    </a>
                </div>
            </div>
        </div>
    );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const photobox = await getPhotobox(params.slug);
    return {
        title: photobox?.caption
            ? `"${photobox.caption}" — OurMoments`
            : 'A Shared Moment — OurMoments',
        description: 'A beautiful photobox shared with love.',
    };
}
