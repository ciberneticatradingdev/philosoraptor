import { NextRequest, NextResponse } from 'next/server';
import { getThoughtsPaginated } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '10', 10)));

  try {
    const result = getThoughtsPaginated(page, limit);
    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[thoughts] Error fetching thoughts:', error);
    return NextResponse.json({ error: 'Failed to fetch thoughts' }, { status: 500 });
  }
}
