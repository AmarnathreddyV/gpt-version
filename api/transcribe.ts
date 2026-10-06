import OpenAI, { toFile } from 'openai';

function getOpenAI() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { audioBase64, mimeType, language } = req.body || {};
    if (!audioBase64) return res.status(400).json({ error: 'audioBase64 is required' });

    const openai = getOpenAI();
    if (!openai) return res.status(503).json({ error: 'OPENAI_API_KEY is not configured' });

    const cleanMime = typeof mimeType === 'string' ? mimeType.split(';')[0] : 'audio/webm';
    const extension = cleanMime.includes('mp4') ? 'mp4' : cleanMime.includes('ogg') ? 'ogg' : cleanMime.includes('wav') ? 'wav' : 'webm';
    const buffer = Buffer.from(audioBase64, 'base64');

    // Keep uploads intentionally small for a fast voice experience.
    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(413).json({ error: 'Voice recording is too large. Please speak for less than 30 seconds.' });
    }

    const file = await toFile(buffer, `s19-voice.${extension}`, { type: cleanMime });
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'gpt-4o-mini-transcribe',
      ...(language ? { language } : {}),
    });

    return res.status(200).json({ text: transcription.text || '' });
  } catch (error: any) {
    console.error('S.19 transcription error:', error);
    return res.status(500).json({ error: 'Could not transcribe the voice recording.' });
  }
}
