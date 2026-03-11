import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { unlink } from 'fs/promises';
import path from 'path';

const PHOTOBOX_DIR = process.env.PHOTOBOX_DIR ?? path.join(process.cwd(), 'public', 'photoboxes');


export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const res = await query<{ id: string; image_path: string }>(
            'SELECT id, image_path FROM photoboxes WHERE id = $1 AND user_id = $2',
            [params.id as string, session.user.id]
        );

        if (res.rows.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const photobox = res.rows[0];

        // Delete the PNG file
        try {
            const fullPath = path.join(PHOTOBOX_DIR, '..', photobox.image_path);
            await unlink(fullPath);
        } catch {
            console.warn('Could not delete file:', photobox.image_path);
        }

        await query('DELETE FROM photoboxes WHERE id = $1', [params.id]);

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('Delete error:', err);
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
