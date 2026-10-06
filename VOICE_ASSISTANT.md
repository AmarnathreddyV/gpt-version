# S.19 Voice Consultant

This version adds a multilingual voice layer to the existing S.19 React/Vite application.

## What it does

- Voice input through the browser microphone.
- OpenAI transcription through `/api/transcribe`.
- The existing `/api/chat` endpoint remains the S.19 reasoning layer.
- OpenAI text-to-speech through `/api/tts`.
- English, Hindi and Telugu voice modes, plus Auto transcription.
- Browser speech synthesis is used as a fallback if TTS is unavailable.
- The assistant automatically speaks GPT replies by default, with a toggle to disable auto-speech.
- Voice recordings are limited to 30 seconds per turn.

## Environment

Set this server-side variable in Vercel:

`OPENAI_API_KEY=your_key_here`

Do **not** put the OpenAI key in `VITE_` variables for production.

## Local run

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite/server.

## Voice experience

The customer can say things like:

- "Tell me about S19"
- "What products do you have?"
- "Naaku oily skin undi, S19 lo em recommend chestaru?"
- "S19 mein uneven tone ke liye kya hai?"
- "Why did you recommend this product?"

The assistant uses the existing S.19 safety and product rules and responds in the customer's language where possible.
