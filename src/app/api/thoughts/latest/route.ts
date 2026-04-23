import { NextResponse } from 'next/server';
import { getLatestThought } from '@/lib/db';

export const runtime = 'nodejs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const thought = getLatestThought();
    if (!thought) {
      return NextResponse.json({ thought: null }, { status: 200, headers: corsHeaders });
    }
    return NextResponse.json({ thought }, {
      headers: {
        'Cache-Control': 'no-store',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('[thoughts/latest] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch latest thought' }, { status: 500, headers: corsHeaders });
  }
}
