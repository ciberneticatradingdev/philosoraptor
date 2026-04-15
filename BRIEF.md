# Philosoraptor — Terminal of Truths

## Concepto
Un Philosoraptor AI que genera pensamientos filosóficos autónomos cada 5 minutos. Inspirado en Terminal of Truths de Andy Ayrey — generación autónoma de contenido filosófico/existencial/memético.

## Stack
- **Framework:** Next.js 14+ (App Router)
- **DB:** SQLite via better-sqlite3 (file: `data/thoughts.db`)
- **LLM:** OpenAI API (GPT-4o-mini para cost efficiency) — env var `OPENAI_API_KEY`
- **Meme generation:** Server-side canvas (node-canvas / @napi-rs/canvas) to overlay text on Philosoraptor template
- **Styling:** Tailwind CSS
- **Deploy-ready:** puede correr local o en VPS

## Páginas
### `/` — Main Feed
- Fondo negro/oscuro, estética terminal/backrooms
- Feed de pensamientos del más reciente al más antiguo
- Cada pensamiento tiene:
  - Timestamp (estilo terminal: `[CYCLE_0042 // 2026-04-15T03:00:00Z]`)
  - El texto filosófico (párrafos, estilo stream of consciousness)
  - Al final: la imagen del Philosoraptor meme con la frase resumen
- Efecto typewriter/glitch en el pensamiento más reciente (el que se está "generando")
- Infinite scroll o pagination para los anteriores
- Ambient effects: scanlines, subtle CRT flicker, occasional glitch

### Estética
- Font: monospace (JetBrains Mono o similar)
- Colors: negro fondo, verde/amber terminal text, glitch effects en rojo/cyan
- El meme al final de cada ciclo es la imagen clásica de Philosoraptor con texto blanco Impact font arriba/abajo
- Vibe: como si un dinosaurio superinteligente estuviera pensando en una terminal abandonada

## Backend / API
### `POST /api/generate` (internal, cron-triggered)
- Llama a OpenAI con un system prompt tipo:
  ```
  You are Philosoraptor — an ancient, superintelligent dinosaur trapped in the backrooms of the internet. You generate deep, absurd, philosophical thoughts that blend existentialism, internet culture, meme philosophy, and backrooms lore. Each thought is a stream of consciousness that starts grounded and spirals into increasingly profound or absurd territory. Write 2-4 paragraphs. Be genuine, weird, and thought-provoking. Do NOT use hashtags or emojis. Write in English.
  ```
- After generating the thought, make a SECOND call to summarize it into a short meme phrase (1-7 words max) for the Philosoraptor image
- Generate the meme image server-side using canvas
- Save everything to SQLite: thought text, meme phrase, meme image path, timestamp, cycle number
- Protected by API secret (`CRON_SECRET` env var)

### `GET /api/thoughts`
- Returns paginated thoughts from DB (newest first)
- Query params: `page`, `limit` (default 10)

### `GET /api/thoughts/latest`
- Returns the single most recent thought (for live display)

### Cron
- Every 5 minutes, hit `POST /api/generate`
- Use Next.js cron (vercel) or node-cron for self-hosted
- Include node-cron as dependency for self-hosted mode

## Meme Image Generation
- Store the Philosoraptor template image in `public/philosoraptor-template.png`
- Use @napi-rs/canvas (or sharp + text overlay) to:
  1. Load template
  2. Add white text with black outline (Impact font) — the summary phrase
  3. Top text: "WHAT IF" or similar short setup (optional, can be just bottom text)
  4. Bottom text: the meme phrase
  5. Save to `public/memes/cycle_XXXX.png`

## File Structure
```
philosoraptor/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main feed
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Terminal/backrooms styles
│   │   └── api/
│   │       ├── generate/route.ts # Generation endpoint
│   │       ├── thoughts/route.ts # List thoughts
│   │       └── thoughts/latest/route.ts
│   ├── components/
│   │   ├── ThoughtCard.tsx       # Single thought display
│   │   ├── MemeImage.tsx         # Meme display component
│   │   ├── TypewriterText.tsx    # Typewriter effect
│   │   ├── GlitchText.tsx       # Glitch effect
│   │   └── Feed.tsx             # Feed container with loading
│   ├── lib/
│   │   ├── db.ts                # SQLite setup & queries
│   │   ├── openai.ts            # OpenAI client
│   │   ├── meme.ts              # Meme image generation
│   │   └── cron.ts              # node-cron setup
│   └── types/
│       └── index.ts             # TypeScript types
├── public/
│   ├── philosoraptor-template.png
│   └── memes/                   # Generated meme images
├── data/                        # SQLite DB directory
├── fonts/                       # Impact font for memes
├── BRIEF.md
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── .env.local
```

## Environment Variables
```
OPENAI_API_KEY=sk-...
CRON_SECRET=random-secret-here
NODE_ENV=production
```

## Key Details
- The cron should start automatically when the Next.js server starts (use instrumentation.ts or a custom server)
- Meme images stored in public/memes/ and served statically
- DB auto-creates on first run
- The feed should auto-refresh (poll every 30s for new thoughts, or SSE)
- Mobile responsive
- The most recent thought should have the typewriter animation; older ones show instantly
