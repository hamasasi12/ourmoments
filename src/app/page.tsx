import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AnniversaryCountdown from '@/components/AnniversaryCountdown';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 py-20">
        {/* Ambient gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #E8A598, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A84C, transparent)' }} />

        <div className="relative z-10 max-w-2xl w-full mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 animate-fade-up"
            style={{ background: 'rgba(201,168,76,0.15)', color: 'var(--gold)', border: '1px solid rgba(201,168,76,0.3)' }}>
            💕 Designed for couples
          </div>

          {/* Heading */}
          <h1 className="font-playfair text-5xl sm:text-6xl md:text-7xl font-semibold leading-tight mb-6 animate-fade-up delay-100"
            style={{ color: 'var(--wine)' }}>
            Every moment together,{' '}
            <em className="italic" style={{ color: 'var(--gold)' }}>beautifully framed.</em>
          </h1>

          <p className="text-lg sm:text-xl opacity-70 mb-10 leading-relaxed animate-fade-up delay-200 font-sans">
            Create gorgeous photoboxes from your favorite moments. Choose a frame, add a caption,
            and keep your love story beautiful — forever.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-300">
            {session ? (
              <>
                <Link href="/create" className="btn-primary text-base">
                  ✨ Create Photobox
                </Link>
                <Link href="/gallery" className="btn-outline text-base">
                  💌 View Gallery
                </Link>
              </>
            ) : (
              <>
                <Link href="/register" className="btn-primary text-base">
                  Start Your Story
                </Link>
                <Link href="/login" className="btn-outline text-base">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Anniversary Countdown */}
      {session && (
        <section className="px-4 pb-20 max-w-xl mx-auto">
          <h2 className="font-playfair text-2xl text-center mb-6" style={{ color: 'var(--wine)' }}>
            Our Anniversary 🌹
          </h2>
          <AnniversaryCountdown
            anniversaryDate={session.user.anniversaryDate}
            partnerName={session.user.partnerName}
          />
        </section>
      )}

      {/* Features */}
      <section className="px-4 pb-24 max-w-5xl mx-auto">
        <h2 className="font-playfair text-3xl text-center mb-12 animate-fade-up" style={{ color: 'var(--wine)' }}>
          Everything you need to preserve your love
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { emoji: '📸', title: 'Photobox Creator', desc: 'Upload 3 photos, pick a frame, add a caption — generate a beautiful keepsake in seconds.' },
            { emoji: '🎨', title: '4 Unique Frames', desc: 'Film Strip, Polaroid, Soft Pink, Dark Romance — each frame tells your story differently.' },
            { emoji: '💌', title: 'Personal Gallery', desc: 'All your photoboxes in one place. Expand, re-download, or delete anytime.' },
            { emoji: '🔗', title: 'Share Publicly', desc: 'Generate a unique link to share your photobox with anyone — no login needed for them.' },
            { emoji: '💕', title: 'Love Notes', desc: 'Attach a secret note to any photobox, visible on hover — just for the two of you.' },
            { emoji: '🎉', title: 'Anniversary Countdown', desc: 'Never forget the date — a live countdown to your next anniversary on every visit.' },
          ].map((f) => (
            <div key={f.title} className="glass-card p-6 animate-fade-up hover:scale-[1.02] transition-transform duration-300">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-playfair text-lg font-semibold mb-2" style={{ color: 'var(--wine)' }}>
                {f.title}
              </h3>
              <p className="text-sm opacity-70 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      {!session && (
        <section className="text-center px-4 pb-24">
          <div className="max-w-md mx-auto glass-card p-8">
            <h2 className="font-playfair text-2xl mb-3" style={{ color: 'var(--wine)' }}>
              Ready to start? 💍
            </h2>
            <p className="opacity-70 text-sm mb-6">
              Free to use. Create your first photobox in under 2 minutes.
            </p>
            <Link href="/register" className="btn-gold text-sm">
              Create Free Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
