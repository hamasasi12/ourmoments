'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { FrameStyle } from '@/types';

export interface FrameCanvasHandle {
    getDataURL: () => string;
}

interface FrameCanvasProps {
    photos: string[];      // Object URLs or data URLs
    frameStyle: FrameStyle;
    caption: string;
    dateLabel: string;
}

const CANVAS_WIDTH = 420;

const FrameCanvas = forwardRef<FrameCanvasHandle, FrameCanvasProps>(
    ({ photos, frameStyle, caption, dateLabel }, ref) => {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useImperativeHandle(ref, () => ({
            getDataURL: () => canvasRef.current?.toDataURL('image/png') ?? '',
        }));

        const draw = useCallback(async () => {
            const canvas = canvasRef.current;
            if (!canvas || photos.length === 0) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const imgEls: HTMLImageElement[] = await Promise.all(
                photos.map((src) => {
                    return new Promise<HTMLImageElement>((resolve, reject) => {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => resolve(img);
                        img.onerror = reject;
                        img.src = src;
                    });
                })
            );

            switch (frameStyle) {
                case 'film-strip': drawFilmStrip(ctx, canvas, imgEls, caption, dateLabel); break;
                case 'polaroid': drawPolaroid(ctx, canvas, imgEls, caption, dateLabel); break;
                case 'soft-pink': drawSoftPink(ctx, canvas, imgEls, caption, dateLabel); break;
                case 'dark-romance': drawDarkRomance(ctx, canvas, imgEls, caption, dateLabel); break;
            }
        }, [photos, frameStyle, caption, dateLabel]);

        useEffect(() => { draw(); }, [draw]);

        return (
            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={getCanvasHeight(frameStyle)}
                className="rounded-xl shadow-xl max-w-full mx-auto block"
                style={{ maxWidth: '100%', height: 'auto' }}
            />
        );
    }
);

FrameCanvas.displayName = 'FrameCanvas';
export default FrameCanvas;

function getCanvasHeight(style: FrameStyle) {
    switch (style) {
        case 'film-strip': return 620;
        case 'polaroid': return 700;
        case 'soft-pink': return 660;
        case 'dark-romance': return 640;
        default: return 640;
    }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function drawImageCover(
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number
) {
    const ratio = Math.max(w / img.width, h / img.height);
    const sw = w / ratio;
    const sh = h / ratio;
    const sx = (img.width - sw) / 2;
    const sy = (img.height - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        if (ctx.measureText(testLine).width > maxWidth && line) {
            lines.push(line);
            line = word;
        } else {
            line = testLine;
        }
    }
    if (line) lines.push(line);
    return lines;
}

// ─── Film Strip ──────────────────────────────────────────────────────────────

function drawFilmStrip(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    imgs: HTMLImageElement[],
    caption: string,
    dateLabel: string
) {
    const W = canvas.width;
    const H = canvas.height;
    const pad = 28;
    const sprocketW = 16;
    const photoW = W - pad * 2 - sprocketW * 2;
    const photoH = 155;
    const gap = 10;

    // Background
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, W, H);

    // Sprocket holes - left
    drawSprockets(ctx, 6, H, sprocketW);
    // Sprocket holes - right
    drawSprockets(ctx, W - sprocketW - 6, H, sprocketW);

    // Film grain overlay
    ctx.fillStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    // Photos
    const photoX = pad + sprocketW;
    const startY = 30;
    imgs.forEach((img, i) => {
        const y = startY + i * (photoH + gap);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(photoX, y, photoW, photoH, 4);
        ctx.clip();
        drawImageCover(ctx, img, photoX, y, photoW, photoH);
        ctx.restore();
    });

    // Caption strip
    const captionY = startY + imgs.length * (photoH + gap) + 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'italic 16px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(caption || 'Our Moments', W / 2, captionY + 24);

    ctx.font = '11px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(dateLabel, W / 2, captionY + 42);
}

function drawSprockets(ctx: CanvasRenderingContext2D, x: number, height: number, w: number) {
    const holeH = 10;
    const gap = 14;
    let y = 20;
    while (y < height - 20) {
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.roundRect(x, y, w, holeH, 2);
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        y += holeH + gap;
    }
}

// ─── Polaroid ────────────────────────────────────────────────────────────────

function drawPolaroid(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    imgs: HTMLImageElement[],
    caption: string,
    dateLabel: string
) {
    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#F0EDE0';
    ctx.fillRect(0, 0, W, H);

    // Subtle texture
    ctx.fillStyle = 'rgba(0,0,0,0.02)';
    for (let i = 0; i < 300; i++) {
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    const pW = 160;
    const pH = 170;
    const pLabelH = 36;
    const positions = [
        { x: W / 2 - pW - 10, y: 30, rot: -4 },
        { x: W / 2 - pW / 2, y: 50, rot: 2 },
        { x: W / 2 + 10, y: 25, rot: -2 },
    ];

    imgs.forEach((img, i) => {
        const pos = positions[i] || positions[0];
        ctx.save();
        ctx.translate(pos.x + pW / 2, pos.y + (pH + pLabelH) / 2);
        ctx.rotate((pos.rot * Math.PI) / 180);
        ctx.translate(-(pos.x + pW / 2), -(pos.y + (pH + pLabelH) / 2));

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 4;

        // White border
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, pW, pH + pLabelH, 2);
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Photo
        ctx.save();
        ctx.beginPath();
        ctx.rect(pos.x + 8, pos.y + 8, pW - 16, pH - 8);
        ctx.clip();
        drawImageCover(ctx, img, pos.x + 8, pos.y + 8, pW - 16, pH - 8);
        ctx.restore();

        ctx.restore();
    });

    // Caption
    ctx.font = 'italic 20px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#6B2737';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'transparent';
    ctx.fillText(caption || 'Our Moments', W / 2, H - 70);

    ctx.font = '12px "DM Sans", sans-serif';
    ctx.fillStyle = '#999';
    ctx.fillText(dateLabel, W / 2, H - 50);
}

// ─── Soft Pink ───────────────────────────────────────────────────────────────

function drawSoftPink(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    imgs: HTMLImageElement[],
    caption: string,
    dateLabel: string
) {
    const W = canvas.width;
    const H = canvas.height;

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#FAF3E0');
    grad.addColorStop(0.5, '#F5D8D0');
    grad.addColorStop(1, '#E8A598');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Decorative border
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(12, 12, W - 24, H - 24, 16);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(201,168,76,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(18, 18, W - 36, H - 36, 12);
    ctx.stroke();

    // Corner florals (drawn as simple circles/petals)
    drawFloral(ctx, 40, 40);
    drawFloral(ctx, W - 40, 40);
    drawFloral(ctx, 40, H - 40);
    drawFloral(ctx, W - 40, H - 40);

    // Photos in a column
    const photoW = W - 80;
    const photoH = 160;
    const gap = 12;
    const startX = 40;
    const startY = 55;

    imgs.forEach((img, i) => {
        const y = startY + i * (photoH + gap);
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(startX, y, photoW, photoH, 10);
        ctx.clip();
        drawImageCover(ctx, img, startX, y, photoW, photoH);
        ctx.restore();

        // Thin gold border on each photo
        ctx.strokeStyle = 'rgba(201,168,76,0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(startX, y, photoW, photoH, 10);
        ctx.stroke();
    });

    // Caption
    const textY = startY + imgs.length * (photoH + gap) + 18;
    ctx.font = 'italic 18px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#6B2737';
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, caption || '♡ Our Moments ♡', photoW);
    lines.forEach((line, i) => {
        ctx.fillText(line, W / 2, textY + i * 24);
    });

    ctx.font = '11px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(107,39,55,0.6)';
    ctx.fillText(dateLabel, W / 2, textY + lines.length * 24 + 10);
}

function drawFloral(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const r = 10;
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, r * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201,168,76,${0.2 + i * 0.05})`;
        ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(232,165,152,0.8)';
    ctx.fill();
}

// ─── Dark Romance ─────────────────────────────────────────────────────────────

function drawDarkRomance(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    imgs: HTMLImageElement[],
    caption: string,
    dateLabel: string
) {
    const W = canvas.width;
    const H = canvas.height;

    // Deep background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0e0508');
    grad.addColorStop(0.5, '#1e0a14');
    grad.addColorStop(1, '#2a0f1e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Gold border
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(14, 14, W - 28, H - 28, 14);
    ctx.stroke();

    // Subtle inner border
    ctx.strokeStyle = 'rgba(201,168,76,0.25)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(22, 22, W - 44, H - 44, 10);
    ctx.stroke();

    // Gold corner ornaments
    drawGoldOrnament(ctx, 14, 14);
    drawGoldOrnament(ctx, W - 14, 14, true);
    drawGoldOrnament(ctx, 14, H - 14, false, true);
    drawGoldOrnament(ctx, W - 14, H - 14, true, true);

    // Photos
    const photoW = W - 80;
    const photoH = 155;
    const gap = 14;
    const startX = 40;
    const startY = 48;

    imgs.forEach((img, i) => {
        const y = startY + i * (photoH + gap);

        // Glow
        ctx.shadowColor = 'rgba(201,168,76,0.25)';
        ctx.shadowBlur = 16;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(startX, y, photoW, photoH, 8);
        ctx.clip();
        drawImageCover(ctx, img, startX, y, photoW, photoH);
        ctx.restore();

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Gold frame on photo
        ctx.strokeStyle = 'rgba(201,168,76,0.7)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(startX, y, photoW, photoH, 8);
        ctx.stroke();
    });

    // Caption
    const textY = startY + imgs.length * (photoH + gap) + 20;
    ctx.font = 'italic 19px "Playfair Display", Georgia, serif';
    ctx.fillStyle = '#DFC07A';
    ctx.textAlign = 'center';
    const lines = wrapText(ctx, caption || '❦ Our Moments ❦', photoW);
    lines.forEach((line, i) => {
        ctx.fillText(line, W / 2, textY + i * 26);
    });

    ctx.font = '11px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(201,168,76,0.5)';
    ctx.fillText(dateLabel, W / 2, textY + lines.length * 26 + 12);
}

function drawGoldOrnament(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    flipX = false, flipY = false
) {
    ctx.save();
    ctx.translate(x, y);
    if (flipX) ctx.scale(-1, 1);
    if (flipY) ctx.scale(1, -1);
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 18); ctx.lineTo(0, 0); ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(6, 6, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#C9A84C';
    ctx.fill();
    ctx.restore();
}
