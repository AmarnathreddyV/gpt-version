# IXX Voice Consultant

The S.19 homepage now opens with **IXX**, a friendly voice skincare consultant.

## Experience

1. IXX appears automatically on the homepage.
2. The browser immediately attempts to speak the welcome message.
3. IXX asks what the customer wants to improve.
4. The customer can answer by microphone or text.
5. The answer is sent to the existing `/api/chat` S.19 AI endpoint.
6. IXX asks one useful follow-up when needed.
7. Once enough information is available, IXX recommends the relevant S.19 phase/product and explains why.
8. English, Hindi and Telugu modes are available.

## Important browser behavior

Modern browsers can block unsolicited audio autoplay. The implementation attempts to speak immediately, but if the browser blocks it, the customer can press **Talk to IXX** or the speaker button once to unlock audio. This is a browser security restriction, not an application failure.

## Deployment

Keep the existing `OPENAI_API_KEY` server-side environment variable configured in Vercel. The IXX consultant uses the existing `/api/chat` endpoint, so it does not expose the API key in the browser.
