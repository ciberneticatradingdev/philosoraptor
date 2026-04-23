import path from 'path';
import fs from 'fs';

const TEMPLATE_PATH = path.join(process.cwd(), 'public', 'philosoraptor-template.png');
const MEMES_DIR = path.join(process.cwd(), 'public', 'memes');

function ensureMemesDir() {
  if (!fs.existsSync(MEMES_DIR)) {
    fs.mkdirSync(MEMES_DIR, { recursive: true });
  }
}

function findImpactFont(): string | null {
  const locations = [
    path.join(process.cwd(), 'fonts', 'Impact.ttf'),
    '/Library/Fonts/Impact.ttf',
    '/System/Library/Fonts/Supplemental/Impact.ttf',
    '/usr/share/fonts/truetype/msttcorefonts/Impact.ttf',
    '/usr/share/fonts/truetype/impact.ttf',
  ];
  for (const loc of locations) {
    if (fs.existsSync(loc)) return loc;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findFontSize(ctx: any, text: string, maxWidth: number, maxLines: number, fontFamily: string): number {
  // Start big, shrink until text fits in maxLines
  for (let size = 48; size >= 16; size -= 2) {
    ctx.font = `bold ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, text, maxWidth);
    if (lines.length <= maxLines) return size;
  }
  return 16;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawOutlinedText(ctx: any, lines: string[], x: number, startY: number, fontSize: number, lineHeight: number) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    const y = startY + i * lineHeight;

    // Black outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = Math.max(3, Math.ceil(fontSize / 8));
    ctx.lineJoin = 'round';
    ctx.strokeText(lines[i], x, y);

    // White fill
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(lines[i], x, y);
  }
}

export async function generateMemeImage(phrase: string, cycleNumber: number): Promise<string> {
  ensureMemesDir();

  const outputFilename = `cycle_${String(cycleNumber).padStart(4, '0')}.png`;
  const outputPath = path.join(MEMES_DIR, outputFilename);
  const publicPath = `/api/memes/${outputFilename}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const napiCanvas = require('@napi-rs/canvas') as any;
    const { createCanvas, loadImage, GlobalFonts } = napiCanvas;

    GlobalFonts.loadSystemFonts();
    const impactPath = findImpactFont();
    if (impactPath) {
      try { GlobalFonts.registerFromPath(impactPath, 'Impact'); } catch { /* already registered */ }
    }

    const img = await loadImage(TEMPLATE_PATH);
    const W: number = img.width;
    const H: number = img.height;
    const canvas = createCanvas(W, H);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx: any = canvas.getContext('2d');

    // Draw template
    ctx.drawImage(img, 0, 0);

    const fontFamily = impactPath ? 'Impact' : 'Arial';
    const padding = Math.floor(W * 0.05); // 5% padding on each side
    const maxTextWidth = W - padding * 2;
    const maxLinesPerBlock = 3;

    // Split phrase into top/bottom text
    const upperPhrase = phrase.toUpperCase();
    const words = upperPhrase.split(' ');
    let topText = '';
    let bottomText = upperPhrase;

    if (words.length > 3) {
      // Split roughly in half, try to find a natural break
      const mid = Math.ceil(words.length / 2);
      topText = words.slice(0, mid).join(' ');
      bottomText = words.slice(mid).join(' ');
    }

    // Find optimal font size for each block
    const topSize = topText ? findFontSize(ctx, topText, maxTextWidth, maxLinesPerBlock, fontFamily) : 0;
    const bottomSize = findFontSize(ctx, bottomText, maxTextWidth, maxLinesPerBlock, fontFamily);

    // Use the smaller of the two so they match
    const fontSize = topText ? Math.min(topSize, bottomSize) : bottomSize;
    const lineHeight = Math.ceil(fontSize * 1.15);

    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    // Draw top text
    if (topText) {
      const topLines = wrapText(ctx, topText, maxTextWidth);
      const topY = padding;
      drawOutlinedText(ctx, topLines, W / 2, topY, fontSize, lineHeight);
    }

    // Draw bottom text (anchored to bottom)
    const bottomLines = wrapText(ctx, bottomText, maxTextWidth);
    const bottomBlockHeight = bottomLines.length * lineHeight;
    const bottomY = H - padding - bottomBlockHeight;
    drawOutlinedText(ctx, bottomLines, W / 2, bottomY, fontSize, lineHeight);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    return publicPath;
  } catch (err) {
    console.error('[meme] @napi-rs/canvas failed:', (err as Error).message);
    // Fallback: copy the template without text
    fs.copyFileSync(TEMPLATE_PATH, outputPath);
    return publicPath;
  }
}
