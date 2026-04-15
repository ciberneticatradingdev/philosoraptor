export async function register() {
  // Only run cron on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startCron } = await import('@/lib/cron');
    startCron();
  }
}
