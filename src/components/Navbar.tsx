'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    const navLinks = session
        ? [
            { href: '/', label: 'Home' },
            { href: '/create', label: '✨ Create' },
            { href: '/gallery', label: '💌 Gallery' },
            { href: '/settings', label: 'Settings' },
        ]
        : [
            { href: '/', label: 'Home' },
            { href: '/login', label: 'Sign In' },
            { href: '/register', label: 'Get Started' },
        ];

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b"
            style={{ borderColor: 'var(--card-border)', background: 'rgba(250,243,224,0.85)' }}
        >
            <div className="dark:bg-transparent" style={{ background: 'rgba(17,8,16,0)' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <span className="text-2xl">💕</span>
                        <span
                            className="font-playfair text-lg font-semibold"
                            style={{ color: 'var(--wine)' }}
                        >
                            OurMoments
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium transition-all duration-200 hover:opacity-70"
                                style={{
                                    color: pathname === link.href ? 'var(--gold)' : 'var(--foreground)',
                                    fontWeight: pathname === link.href ? '600' : '400',
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {session && (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity"
                            >
                                Sign out
                            </button>
                        )}

                        <ThemeToggle />
                    </div>

                    {/* Mobile hamburger */}
                    <div className="md:hidden flex items-center gap-3">
                        <ThemeToggle />
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="p-2 rounded-lg"
                            style={{ color: 'var(--wine)' }}
                            aria-label="Toggle menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                {menuOpen ? (
                                    <path d="M18 6L6 18M6 6l12 12" />
                                ) : (
                                    <path d="M3 12h18M3 6h18M3 18h18" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {menuOpen && (
                    <div className="md:hidden px-4 pb-4 flex flex-col gap-3 animate-fade-in">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium py-2 border-b"
                                style={{ borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                                onClick={() => setMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {session && (
                            <button
                                onClick={() => signOut({ callbackUrl: '/' })}
                                className="text-sm font-medium py-2 text-left opacity-60"
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
