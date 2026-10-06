import OpenAI from 'openai';

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { text, language } = req.body || {};
    if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Text is required' });

    const openai = getOpenAI();
    if (!openai) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });

    const languageInstruction = language === 'te-IN'
      ? 'Speak naturally in Telugu. Preserve S.19 product names and ingredient names clearly.'
      : language === 'hi-IN'
        ? 'Speak naturally in Hindi. Preserve S.19 product names and ingredient names clearly.'
        : language === 'en-IN'
          ? 'Speak naturally in Indian English. Preserve S.19 product names and ingredient names clearly.'
          : 'Automatically match the language used in the text. If the text is Telugu, speak Telugu; if Hindi, speak Hindi; otherwise speak natural Indian English. Preserve S.19 product names and ingredient names clearly.';

    const speech = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'coral',
      input: text.slice(0, 5000),
      instructions: `You are the warm, friendly S.19 skincare voice consultant. ${languageInstruction} Use a calm, welcoming, premium tone. Do not sound like a sales robot.`,
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error: any) {
    console.error('S.19 TTS error:', error);
    return res.status(500).json({ error: 'Could not generate voice response.' });
  }
}
