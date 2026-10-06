import OpenAI from 'openai';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });

  try {
    const { text, language } = req.body || {};
    if (!text) return res.status(400).json({ error: 'text is required' });
    const client = new OpenAI({ apiKey: key });
    const instructions = language === 'te'
      ? 'Speak naturally in Telugu. Warm, friendly, calm, premium skincare consultant tone.'
      : language === 'hi'
        ? 'Speak naturally in Hindi. Warm, friendly, calm, premium skincare consultant tone.'
        : 'Speak naturally in Indian English. Warm, friendly, calm, premium skincare consultant tone.';
    const speech = await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'coral',
      input: text,
      instructions,
      response_format: 'mp3',
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (err: any) {
    console.error('IXX TTS error:', err);
    return res.status(500).json({ error: 'Voice generation failed' });
  }
}
