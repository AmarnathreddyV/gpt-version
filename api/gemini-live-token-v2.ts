export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });

  try {
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 60 * 1000).toISOString();

    // Use the REST provisioning endpoint directly. This avoids SDK-version
    // serialization differences around the auth_tokens RPC schema.
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/auth_tokens', {
      method: 'POST',
      headers: {
        'x-goog-api-key': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: 'models/gemini-3.8-live',
          config: {
            responseModalities: ['AUDIO'],
            sessionResumption: {},
          },
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Gemini ephemeral token REST error:', data);
      return res.status(500).json({
        error: data?.error?.message || 'Could not create Gemini Live session token',
        debug: 'gemini-live-token-v2',
      });
    }

    const token = data?.name;
    if (!token) {
      console.error('Gemini token response missing name:', data);
      return res.status(500).json({ error: 'Gemini returned no ephemeral token', debug: 'gemini-live-token-v2' });
    }

    return res.status(200).json({ token, model: 'gemini-3.8-live', endpoint: 'constrained', debug: 'gemini-live-token-v2' });
  } catch (err: any) {
    console.error('Gemini Live token error:', err);
    return res.status(500).json({ error: err?.message || 'Could not create Gemini Live session token', debug: 'gemini-live-token-v2' });
  }
}
