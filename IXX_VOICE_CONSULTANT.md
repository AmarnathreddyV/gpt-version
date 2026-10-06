# IXX Voice Consultant — Gemini Live

IXX is the S.19 homepage voice skincare consultant powered by Gemini Live.

## Voice experience

- IXX opens automatically on the homepage.
- Gemini Live provides real-time bidirectional audio instead of browser speech recognition + OpenAI TTS.
- The microphone streams 16 kHz PCM audio directly to Gemini Live.
- Gemini Live returns native 24 kHz PCM audio for immediate playback.
- Server-side VAD allows natural turn-taking and interruption.
- If the customer talks while IXX is speaking, Gemini Live can interrupt the current response.
- Input/output transcriptions are used only for the visible conversation text.
- The assistant automatically follows English, Hindi, Telugu, or natural mixed speech.
- Telugu/Hindi responses are instructed to keep the local language dominant with only natural English skincare terms.
- IXX is always displayed as **IXX**. In speech it is instructed to sound like one syllable, “icks” — Vicks without the V.

## Gemini API setup

Add this Vercel environment variable:

`GEMINI_API_KEY=your_gemini_api_key`

The browser does **not** receive the long-lived Gemini API key. `/api/gemini-live-token` creates a short-lived Gemini Live ephemeral token and the browser uses that token for its WebSocket connection.

The current implementation uses `gemini-3.8-live` and the prebuilt `Leda` voice.

## Free tier

Gemini 3.8 Live currently has a Free Tier according to Google's Gemini API pricing page. The actual usable rate limits are project/model specific and can be checked in Google AI Studio. Keep the assistant's replies short and avoid unnecessary parallel sessions to reduce usage.

## Removed from the voice path

The homepage IXX voice path no longer depends on:

- `/api/transcribe` for speech recognition
- `/api/tts` for speech generation
- `OPENAI_API_KEY` for IXX voice

Those files can remain in the project for other functionality, but they are not used by the Gemini Live IXX component.
