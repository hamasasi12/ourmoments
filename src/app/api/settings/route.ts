import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { displayName, partnerName, anniversaryDate } = await request.json();

        await query(
            `UPDATE users SET display_name = $1, partner_name = $2, anniversary_date = $3 WHERE id = $4`,
            [displayName || null, partnerName || null, anniversaryDate || null, session.user.id]
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Settings update error:', err);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await query(
            'SELECT display_name, partner_name, anniversary_date, email FROM users WHERE id = $1',
            [session.user.id]
        );

        return NextResponse.json({ user: res.rows[0] });
    } catch (err) {
        console.error('Settings fetch error:', err);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}
