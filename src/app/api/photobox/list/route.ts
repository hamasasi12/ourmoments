import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const cursor = searchParams.get('cursor');
        const limit = 12;

        let sql = `SELECT id, image_path, caption, frame_style, love_note, is_public, public_slug, created_at
               FROM photoboxes
               WHERE user_id = $1`;
        const params: unknown[] = [session.user.id];

        if (cursor) {
            sql += ` AND created_at < $2`;
            params.push(cursor);
        }

        sql += ` ORDER BY created_at DESC LIMIT ${limit + 1}`;

        const res = await query(sql, params);
        const rows = res.rows;
        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;
        const nextCursor = hasMore ? items[items.length - 1].created_at : null;

        return NextResponse.json({ items, nextCursor });
    } catch (err) {
        console.error('List error:', err);
        return NextResponse.json({ error: 'Failed to list photoboxes' }, { status: 500 });
    }
}
