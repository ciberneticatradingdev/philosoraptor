import cron from 'node-cron';

let cronStarted = false;

export function startCron() {
  if (cronStarted) return;
  cronStarted = true;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('[cron] CRON_SECRET not set — /api/generate will be unprotected. Set CRON_SECRET in .env.local');
  }

  console.log('[cron] Starting Philosoraptor thought generation cron (every 5 minutes)');

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log(`[cron] ${new Date().toISOString()} — triggering thought generation`);
    try {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cronSecret ? { 'x-cron-secret': cronSecret } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(`[cron] Generation failed (${res.status}):`, text);
      } else {
        const data = await res.json();
        console.log(`[cron] Generated thought cycle_${String(data.thought?.cycle_number ?? '???').padStart(4, '0')}`);
      }
    } catch (err) {
      console.error('[cron] Error calling /api/generate:', err);
    }
  });

  // Also trigger once on startup after a short delay (so DB and server are ready)
  setTimeout(async () => {
    console.log('[cron] Initial thought generation on startup...');
    try {
      const res = await fetch(`${baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cronSecret ? { 'x-cron-secret': cronSecret } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        console.log(`[cron] Startup thought generated: cycle_${String(data.thought?.cycle_number ?? '???').padStart(4, '0')}`);
      }
    } catch (err) {
      console.error('[cron] Startup generation error:', err);
    }
  }, 5000);
}
