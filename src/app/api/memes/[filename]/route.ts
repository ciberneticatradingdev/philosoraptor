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

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Meme not found' }, { status: 404, headers: corsHeaders });
  }

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
