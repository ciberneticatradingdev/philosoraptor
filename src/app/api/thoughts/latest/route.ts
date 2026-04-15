import { NextResponse } from 'next/server';
import { getLatestThought } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const thought = getLatestThought();
    if (!thought) {
      return NextResponse.json({ thought: null }, { status: 200 });
    }
    return NextResponse.json({ thought }, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[thoughts/latest] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch latest thought' }, { status: 500 });
  }
}
