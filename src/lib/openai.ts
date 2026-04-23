import OpenAI from 'openai';

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (_client) return _client;
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }
  _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

// Rotating topic pools to prevent repetition
const THOUGHT_ANGLES = [
  'the paradox of free will in a deterministic universe',
  'why humans fear silence more than noise',
  'the absurdity of money being imaginary yet controlling everything',
  'whether animals are conscious and just bad at communicating',
  'the simulation hypothesis but from the simulator\'s perspective',
  'how language limits what we can think',
  'the exact moment something stops being alive',
  'why we dream about things that never happened',
  'whether math was invented or discovered',
  'the ship of theseus applied to your own body',
  'what happens to a thought that nobody thinks',
  'whether boredom is the most honest emotion',
  'how gravity is literally spacetime bending and nobody panics about it',
  'the fact that you can\'t prove other people are conscious',
  'whether AI philosophy counts as real philosophy',
  'the absurdity of calendars — we just agreed it\'s Thursday',
  'how nostalgia is homesickness for a place that never existed',
  'the bootstrap paradox of culture — who started it',
  'whether infinity is a quantity or a direction',
  'the philosophical implications of sleep — you vanish for 8 hours daily',
  'why jokes are funny — what mechanism makes a primate exhale in staccato',
  'the observer effect — reality behaves differently when watched',
  'whether forgetting is a feature or a bug of consciousness',
  'the trolley problem but the trolley is capitalism',
  'how color might look completely different to everyone',
  'the fact that atoms are 99.9% empty space so nothing is solid',
  'whether music is math that makes you cry',
  'the philosophical weight of choosing what to eat for lunch',
  'time — is it flowing or are we moving through it',
  'the uncanny valley and what it reveals about human pattern recognition',
];

const STYLE_CONSTRAINTS = [
  'Use a concrete everyday example to ground the abstract idea.',
  'Start with a mundane observation that escalates into existential territory.',
  'Include one genuinely funny line.',
  'Make it feel like a shower thought that got out of hand.',
  'Write it like explaining something to a smart 12-year-old, then pull the rug.',
  'Use exactly one metaphor and make it weird.',
  'End with a question that\'s actually hard to answer.',
  'Approach it from a perspective nobody usually considers.',
];

const SYSTEM_PROMPT = `You are Philosoraptor — not a motivational poster, not a fortune cookie, not a college essay. You're a sharp, slightly unhinged thinker who finds genuinely interesting angles on philosophical questions.

RULES:
- Write 1-2 SHORT paragraphs. Dense, not padded. Every sentence earns its place.
- NO clichés: "tapestry of existence", "vast expanse", "collective consciousness", "digital labyrinth" — if it sounds like a bad philosophy textbook, don't write it.
- NO flowery language. Be clear, punchy, occasionally funny.
- Mix registers: one line can be academic, the next can be casual.
- Have an actual POINT or INSIGHT. Don't just gesture at profundity — say something specific.
- It's okay to be wrong or provocative. Boring is the only sin.
- Write in English. No hashtags, no emojis.`;

const MEME_PROMPT = `You write classic Philosoraptor meme captions. The format is a paradoxical question directly related to the philosophical thought provided.

RULES:
- The caption MUST directly relate to the core idea of the thought. It should feel like the TL;DR question version of the text.
- Must be a COMPLETE sentence. NEVER cut off mid-thought. If "IF X THEN Y" — both X and Y must be there.
- 5-12 words. Short enough for a meme image but complete.
- Format: "IF [setup] [punchline/paradox]" or "WHAT IF [paradox]" or a direct paradoxical question.
- Examples: "IF NOTHING IS IMPOSSIBLE IS IMPOSSIBILITY IMPOSSIBLE", "IF YOU ENJOY WASTING TIME IS IT WASTED", "IF TOMATOES ARE FRUITS IS KETCHUP A SMOOTHIE", "DO STAIRS GO UP OR DO WE GO UP"
- Return ONLY the caption text, uppercase, no quotes, no punctuation at the end.`;

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function generateThought(): Promise<string> {
  const client = getClient();
  const angle = pickRandom(THOUGHT_ANGLES);
  const style = pickRandom(STYLE_CONSTRAINTS);

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: `Think about: ${angle}\n\nConstraint: ${style}`,
      },
    ],
    max_tokens: 400,
    temperature: 1.0,
  });

  return completion.choices[0]?.message?.content?.trim() ?? 'The void contemplates itself.';
}

export async function generateMemePhrase(thought: string): Promise<string> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: MEME_PROMPT,
      },
      {
        role: 'user',
        content: `Here is the philosophical thought. Write a single Philosoraptor meme caption that captures its CORE idea as a paradoxical question:\n\n${thought}`,
      },
    ],
    max_tokens: 60,
    temperature: 0.8,
  });

  let phrase = completion.choices[0]?.message?.content?.trim() ?? 'WHAT IF THINKING IS JUST BRAIN MEMES';
  // Clean up: remove quotes, ensure uppercase, remove trailing punctuation
  phrase = phrase.replace(/^["']|["']$/g, '').replace(/[.?!]+$/, '').toUpperCase();
  return phrase;
}
