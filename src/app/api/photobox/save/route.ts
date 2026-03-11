import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { nanoid } from 'nanoid';
import { query } from '@/lib/db';

const PHOTOBOX_DIR = process.env.PHOTOBOX_DIR ?? path.join(process.cwd(), 'public', 'photoboxes');

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { imageBase64, caption, frameStyle, loveNote, isPublic } = body;

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image data' }, { status: 400 });
        }

        // Strip data URL prefix
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        const userDir = path.join(PHOTOBOX_DIR, session.user.id);
        await mkdir(userDir, { recursive: true });

        const filename = `${uuidv4()}.png`;
        const filepath = path.join(userDir, filename);
        await writeFile(filepath, buffer);

        const imagePath = `photoboxes/${session.user.id}/${filename}`;
        const publicSlug = isPublic ? nanoid(10) : null;

        const res = await query(
            `INSERT INTO photoboxes (user_id, image_path, caption, frame_style, love_note, is_public, public_slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, public_slug, created_at`,
            [session.user.id, imagePath, caption || null, frameStyle || null, loveNote || null, !!isPublic, publicSlug]
        );

        return NextResponse.json({ photobox: res.rows[0] });
    } catch (err) {
        console.error('Photobox save error:', err);
        return NextResponse.json({ error: 'Failed to save photobox' }, { status: 500 });
    }
}
