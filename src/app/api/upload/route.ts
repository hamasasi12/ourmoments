import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'public', 'uploads');

export const runtime = 'nodejs';
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll('photos') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
        }
        if (files.length > 3) {
            return NextResponse.json({ error: 'Maximum 3 photos allowed' }, { status: 400 });
        }

        const userDir = path.join(UPLOAD_DIR, session.user.id);
        await mkdir(userDir, { recursive: true });

        const savedPaths: string[] = [];

        for (const file of files) {
            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
            if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
                return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
            }
            const filename = `${uuidv4()}.${ext}`;
            const filepath = path.join(userDir, filename);
            const buffer = Buffer.from(await file.arrayBuffer());
            await writeFile(filepath, buffer);
            savedPaths.push(`uploads/${session.user.id}/${filename}`);
        }

        return NextResponse.json({ paths: savedPaths });
    } catch (err) {
        console.error('Upload error:', err);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
