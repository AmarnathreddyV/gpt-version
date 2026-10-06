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
      ? 'You are iks, a warm female skincare consultant speaking to an Indian customer. Speak fluent, natural Telugu as a native Indian Telugu speaker. Use conversational Hyderabad-style Telugu where appropriate, not a translated or foreign accent. Keep pronunciation clear, soft, feminine, warm, calm and premium. Do not switch to English except for brand/product names such as S.19.'
      : language === 'hi'
        ? 'You are iks, a warm female skincare consultant speaking to an Indian customer. Speak fluent, natural Hindi with an Indian female voice. Keep pronunciation clear, soft, warm, calm and premium. Do not switch languages except for brand/product names such as S.19.'
        : 'You are iks, a warm female skincare consultant. Speak natural Indian English with a soft, friendly, feminine, calm and premium tone.';
    const speech = await client.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'coral',
      speed: language === 'te' ? 0.92 : language === 'hi' ? 0.94 : 0.96,
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
