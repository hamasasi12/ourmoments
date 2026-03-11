import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { query } from '@/lib/db';
import { readFile } from 'fs/promises';
import path from 'path';
import mime from 'mime';

const DATA_ROOT = process.env.UPLOAD_DIR
    ? path.dirname(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), 'public');

export async function GET(
    request: Request,
    { params }: { params: { path: string[] } }
) {
    try {
        const filePath = params.path.join('/');

        // Public photoboxes don't need auth
        const isPhotobox = filePath.startsWith('photoboxes/');
        const isUploads = filePath.startsWith('uploads/');

        if (isPhotobox) {
            // Check if it belongs to a public photobox
            const pathParts = filePath.split('/');
            if (pathParts.length >= 3) {
                const res = await query(
                    'SELECT is_public FROM photoboxes WHERE image_path = $1',
                    [filePath]
                );
                if (res.rows.length > 0 && res.rows[0].is_public) {
                    // OK to serve without auth
                } else {
                    // Need auth
                    const session = await getServerSession(authOptions);
                    if (!session?.user?.id) {
                        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                    }
                    // Verify ownership
                    const ownRes = await query(
                        'SELECT id FROM photoboxes WHERE image_path = $1 AND user_id = $2',
                        [filePath, session.user.id]
                    );
                    if (ownRes.rows.length === 0) {
                        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
                    }
                }
            }
        } else if (isUploads) {
            const session = await getServerSession(authOptions);
            if (!session?.user?.id) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            // Ensure user only accesses their own uploads
            const userIdInPath = params.path[1];
            if (userIdInPath !== session.user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }
        }

        const fullPath = path.join(DATA_ROOT, filePath);
        // Security: prevent path traversal
        const resolvedPath = path.resolve(fullPath);
        const resolvedRoot = path.resolve(DATA_ROOT);
        if (!resolvedPath.startsWith(resolvedRoot)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const fileBuffer = await readFile(resolvedPath);
        const mimeType = mime.getType(resolvedPath) || 'application/octet-stream';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'private, max-age=3600',
            },
        });
    } catch (err) {
        console.error('File serve error:', err);
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}
