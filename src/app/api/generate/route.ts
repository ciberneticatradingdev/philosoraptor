import { NextRequest, NextResponse } from 'next/server';
import { getLatestCycleNumber, insertThought } from '@/lib/db';
import { generateThought, generateMemePhrase } from '@/lib/openai';
import { generateMemeImage } from '@/lib/meme';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = req.headers.get('x-cron-secret');
    if (provided !== cronSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[generate] Starting thought generation cycle...');

    // Get next cycle number
    const lastCycle = getLatestCycleNumber();
    const cycleNumber = lastCycle + 1;

    console.log(`[generate] Cycle ${cycleNumber} — generating thought...`);

    // Generate philosophical thought
    const content = await generateThought();
    console.log(`[generate] Thought generated (${content.length} chars)`);

    // Generate meme phrase
    console.log('[generate] Generating meme phrase...');
    const memePhrase = await generateMemePhrase(content);
    console.log(`[generate] Meme phrase: "${memePhrase}"`);

    // Generate meme image
    console.log('[generate] Generating meme image...');
    const memeImagePath = await generateMemeImage(memePhrase, cycleNumber);
    console.log(`[generate] Meme image saved: ${memeImagePath}`);

    // Save to DB
    const thought = insertThought({
      cycle_number: cycleNumber,
      content,
      meme_phrase: memePhrase,
      meme_image_path: memeImagePath,
    });

    console.log(`[generate] Cycle ${cycleNumber} complete — thought ID ${thought.id}`);

    return NextResponse.json({ success: true, thought });
  } catch (error) {
    console.error('[generate] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Allow GET for easy manual testing
export async function GET(req: NextRequest) {
  return POST(req);
}
