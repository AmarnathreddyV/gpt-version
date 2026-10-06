import OpenAI, { toFile } from 'openai';

function detectLanguage(text: string): 'te' | 'hi' | 'en' {
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  const t = text.toLowerCase();
  const te = /\b(nenu|naaku|naku|mee|mi|mana|undi|unnadi|undhi|ela|em|enti|enduku|kani|kuda|chala|konchem|skin lo|skin ki|cheppandi|cheppu|kavali|kaavali|avuthundi|avutundi|mukham|baaga|bagundi)\b/g;
  const hi = /\b(main|mujhe|mera|meri|aap|aapki|aapko|hai|hain|kya|kaise|kyun|thoda|bahut|lekin|bhi|skin mein|skin me|chehra|chahiye|chahte|chahti|batao|bataiye|ho raha|rahi)\b/g;
  const ts = (t.match(te) || []).length;
  const hs = (t.match(hi) || []).length;
  return ts > hs && ts > 0 ? 'te' : hs > ts && hs > 0 ? 'hi' : 'en';
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });

  try {
    const { audio, mimeType = 'audio/webm' } = req.body || {};
    if (!audio) return res.status(400).json({ error: 'audio is required' });
    const buffer = Buffer.from(audio, 'base64');
    const client = new OpenAI({ apiKey: key });
    const file = await toFile(buffer, 'ixx-voice.webm', { type: mimeType });
    const result = await client.audio.transcriptions.create({
      model: 'gpt-4o-mini-transcribe',
      file,
      prompt: 'Transcribe exactly what the customer says. Preserve Telugu, Hindi, English, and natural code-switching. Do not translate. Do not romanize Telugu or Hindi.',
    });
    const text = result.text?.trim() || '';
    return res.status(200).json({ text, language: detectLanguage(text) });
  } catch (err: any) {
    console.error('IXX transcription error:', err);
    return res.status(500).json({ error: 'Transcription failed' });
  }
}
