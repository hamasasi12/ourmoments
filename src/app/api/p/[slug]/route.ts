import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const res = await query(
            `SELECT id, image_path, caption, frame_style, created_at, public_slug
       FROM photoboxes
       WHERE public_slug = $1 AND is_public = TRUE`,
            [params.slug]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json({ photobox: res.rows[0] });
    } catch (err) {
        console.error('Public slug error:', err);
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
}
