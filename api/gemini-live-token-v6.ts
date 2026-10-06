export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
      method: 'POST',
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uses: 1,
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Gemini auth token error:', JSON.stringify(data));
      return res.status(response.status).json({
        error: data?.error?.message || 'Could not create Gemini Live session token',
      });
    }

    if (!data?.name) {
      console.error('Gemini auth token missing name:', JSON.stringify(data));
      return res.status(502).json({ error: 'Gemini returned no ephemeral token' });
    }

    return res.status(200).json({ token: data.name });
  } catch (err: any) {
    console.error('Gemini Live token error:', err);
    return res.status(500).json({ error: err?.message || 'Could not create Gemini Live session token' });
  }
}
