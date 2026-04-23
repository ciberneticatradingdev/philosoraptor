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

function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function drawMemeText(ctx: any, phrase: string, W: number, H: number, fontSize: number) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const charsPerLine = Math.floor((W * 0.9) / (fontSize * 0.55));
  const words = phrase.split(' ');

  let topText = '';
  let bottomText = phrase;
  if (words.length > 4) {
    const mid = Math.ceil(words.length / 2);
    topText = words.slice(0, mid).join(' ');
    bottomText = words.slice(mid).join(' ');
  }

  const drawLines = (text: string, startX: number, startY: number) => {
    const lines = wrapText(text.toUpperCase(), charsPerLine);
    lines.forEach((line: string, i: number) => {
      const y = startY + i * fontSize * 1.2;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(4, Math.floor(fontSize / 7));
      ctx.lineJoin = 'round';
      ctx.strokeText(line, startX, y);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(line, startX, y);
    });
  };

  const padding = Math.floor(fontSize * 0.5);

  if (topText) {
    drawLines(topText, W / 2, padding + fontSize);
  }

  if (bottomText) {
    const btLines = wrapText(bottomText.toUpperCase(), charsPerLine);
    const btTotalH = btLines.length * fontSize * 1.2;
    drawLines(bottomText, W / 2, H - padding - btTotalH + fontSize);
  }
}

export async function generateMemeImage(phrase: string, cycleNumber: number): Promise<string> {
  ensureMemesDir();

  const outputFilename = `cycle_${String(cycleNumber).padStart(4, '0')}.png`;
  const outputPath = path.join(MEMES_DIR, outputFilename);
  const publicPath = `/memes/${outputFilename}`;

  try {
    // @napi-rs/canvas is externalized in webpack — use require() with string literal
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

    ctx.drawImage(img, 0, 0);

    const fontSize = Math.max(28, Math.floor(W / 12));
    const fontFamily = impactPath ? 'Impact' : 'Arial';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;

    drawMemeText(ctx, phrase, W, H, fontSize);

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
    return publicPath;
  } catch (err) {
    console.error('[meme] @napi-rs/canvas failed:', (err as Error).message);
    // Fallback: copy the template without text
    const fallbackPath = outputPath.replace('.png', '.jpg');
    const fallbackPublic = publicPath.replace('.png', '.jpg');
    fs.copyFileSync(TEMPLATE_PATH, fallbackPath);
    return fallbackPublic;
  }
}
