import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const runtime = 'nodejs';

const MEMES_DIR = path.join(process.cwd(), 'public', 'memes');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  // Sanitize filename — only allow cycle_XXXX.png pattern
  if (!/^cycle_\d{4}\.png$/.test(filename)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400, headers: corsHeaders });
  }

  const filePath = path.join(MEMES_DIR, filename);

  // If file exists on disk, serve it
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ...corsHeaders,
      },
    });
  }

  // File doesn't exist — try to regenerate from DB data
  try {
    const { getThoughtByCycle } = await import('@/lib/db');
    const { generateMemeImage } = await import('@/lib/meme');

    const cycleStr = filename.replace('cycle_', '').replace('.png', '');
    const cycleNumber = parseInt(cycleStr, 10);

    const thought = getThoughtByCycle(cycleNumber);
    if (!thought) {
      return NextResponse.json({ error: 'Meme not found' }, { status: 404, headers: corsHeaders });
    }

    // Regenerate the meme image
    await generateMemeImage(thought.meme_phrase, cycleNumber);

    // Now serve it
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
          ...corsHeaders,
        },
      });
    }
  } catch (err) {
    console.error('[memes] Regeneration failed:', err);
  }

  return NextResponse.json({ error: 'Meme not found' }, { status: 404, headers: corsHeaders });
}
