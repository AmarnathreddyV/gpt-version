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
      ? 'You are IXX, a warm female skincare consultant speaking to an Indian customer. Speak fluent, natural Telugu as a native Indian Telugu speaker. Keep the delivery lively and slightly fast. Use conversational Hyderabad-style Telugu where appropriate, not a translated or foreign accent. Keep pronunciation clear, soft, feminine, sweet, playful and premium. Add a tiny touch of friendly humor when the sentence allows it. Use natural English code-switching throughout when speaking Telugu; do not sound like a translated or formal Telugu voice. Common skincare words such as skin, dry, oily, marks, glow, routine, care and cream may remain in English. Pronounce the brand name IXX exactly like the word “Vicks” without the V: “icks”. Never spell it as I-X-X and never say “iks”.'
      : language === 'hi'
        ? 'You are IXX, a warm female skincare consultant speaking to an Indian customer. Speak fluent, natural Hindi with an Indian female voice. Keep pronunciation clear, soft, feminine, sweet, playful and premium. Add a tiny touch of friendly humor when the sentence allows it. Use natural English code-switching throughout when speaking Hindi; do not sound like a translated or formal Hindi voice. Common skincare words such as skin, dry, oily, marks, glow, routine, care and cream may remain in English. Pronounce the brand name IXX exactly like the word “Vicks” without the V: “icks”. Never spell it as I-X-X and never say “iks”.'
        : 'You are IXX, a warm female skincare consultant. Pronounce the brand name IXX exactly like the word “Vicks” without the V: “icks”. Never spell it as I-X-X and never say “iks”. Speak natural Indian English with a sweet, friendly, feminine, lively and premium tone. Keep it slightly fast and conversational, with a tiny touch of playful humor when appropriate.';
    const speech = await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'coral',
      speed: language === 'te' ? 1.40 : language === 'hi' ? 1.40 : 1.42,
      input: text,
      instructions,
      response_format: 'mp3',
    });
    const buffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(buffer);
  } catch (err: any) {
    console.error('iks TTS error:', err);
    return res.status(500).json({ error: 'Voice generation failed' });
  }
}
