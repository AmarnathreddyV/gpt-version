export default function handler(req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    brand: 'S.19 SKINLABS',
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY),
    runtime: 'vercel-serverless',
  });
}
