# S19 Skinlabs — IXX Gemini Live Voice Assistant (V5)

This version fixes the ephemeral-token schema issue seen in the previous deployment.

## Important fix

The current Gemini Live API auth-token schema uses `bidiGenerateContentSetup` for the constrained setup object. Earlier versions sent `liveConnectConstraints`, which caused:

`Unknown name "liveConnectConstraints" at 'auth_token'`

V5 locks only the Live model and lets the browser send the voice, system instruction, audio, and VAD configuration in the initial WebSocket setup.

## Vercel

Set:

`GEMINI_API_KEY=your_gemini_api_key`

Then redeploy.
