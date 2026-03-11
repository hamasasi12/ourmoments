import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, password, displayName } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const res = await query(
            'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name',
            [email.toLowerCase(), passwordHash, displayName || null]
        );

        return NextResponse.json({ user: res.rows[0] }, { status: 201 });
    } catch (err) {
        console.error('Register error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
