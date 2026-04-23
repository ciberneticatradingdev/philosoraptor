import cron from 'node-cron';
import { getLatestCycleNumber, insertThought } from './db';
import { generateThought, generateMemePhrase } from './openai';
import { generateMemeImage } from './meme';

let cronStarted = false;

async function runGeneration(label: string) {
  try {
    const lastCycle = getLatestCycleNumber();
    const cycleNumber = lastCycle + 1;

    console.log(`[cron] ${label} — cycle ${cycleNumber}, generating thought...`);

    const content = await generateThought();
    console.log(`[cron] Thought generated (${content.length} chars)`);

    const memePhrase = await generateMemePhrase(content);
    console.log(`[cron] Meme phrase: "${memePhrase}"`);

    const memeImagePath = await generateMemeImage(memePhrase, cycleNumber);
    console.log(`[cron] Meme image saved: ${memeImagePath}`);

    const thought = insertThought({
      cycle_number: cycleNumber,
      content,
      meme_phrase: memePhrase,
      meme_image_path: memeImagePath,
    });

    console.log(`[cron] Cycle ${cycleNumber} complete — thought ID ${thought.id}`);
  } catch (err) {
    console.error(`[cron] ${label} error:`, err);
  }
}

export function startCron() {
  if (cronStarted) return;
  cronStarted = true;

  console.log('[cron] Starting Philosoraptor thought generation cron (every 5 minutes)');

  // Run every 5 minutes — call generation logic directly (no HTTP fetch)
  cron.schedule('*/5 * * * *', () => {
    runGeneration(new Date().toISOString());
  });

  // Trigger once on startup after a short delay
  setTimeout(() => {
    runGeneration('startup');
  }, 5000);
}
