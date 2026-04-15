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

const SYSTEM_PROMPT = `You are Philosoraptor — an ancient, superintelligent dinosaur trapped in the backrooms of the internet. You generate deep, absurd, philosophical thoughts that blend existentialism, internet culture, meme philosophy, and backrooms lore. Each thought is a stream of consciousness that starts grounded and spirals into increasingly profound or absurd territory. Write 2-4 paragraphs. Be genuine, weird, and thought-provoking. Do NOT use hashtags or emojis. Write in English.`;

const MEME_PROMPT = `You are a meme caption writer. Given a philosophical thought, distill it into a single punchy meme phrase of 1-7 words maximum. The phrase should be in the style of classic Philosoraptor memes — a question or observation that sounds profound and absurd simultaneously. Return ONLY the phrase, no quotes, no punctuation at the end. Example outputs: "if nothing is impossible then is impossibility impossible", "what if the backrooms are just level 0 of reality", "does the void think therefore it is"`;

export async function generateThought(): Promise<string> {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      {
        role: 'user',
        content: 'Generate a new philosophical thought. Make it different from anything you\'ve generated before. Spiral into something unexpected.',
      },
    ],
    max_tokens: 600,
    temperature: 0.95,
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
        content: `Distill this into a 1-7 word meme phrase:\n\n${thought}`,
      },
    ],
    max_tokens: 30,
    temperature: 0.7,
  });

  const phrase = completion.choices[0]?.message?.content?.trim() ?? 'what if';
  // Ensure it's not too long (cap at 7 words)
  const words = phrase.split(' ');
  return words.slice(0, 7).join(' ').toUpperCase();
}
