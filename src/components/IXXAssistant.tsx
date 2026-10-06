import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, ArrowUpRight, Loader2 } from 'lucide-react';

interface IXXAssistantProps {
  onOpenFullChat: () => void;
}

type Language = 'en' | 'hi' | 'te';

const GREETINGS: Record<Language, string> = {
  en: "Hi, I'm IXX, your S.19 skin consultant. I'm here to understand what your skin needs right now and guide you to the S.19 care that fits. Tell me, what would you like to improve about your skin?",
  hi: "नमस्ते, मैं IXX हूँ, आपकी S.19 स्किन कंसल्टेंट। पहले मैं समझना चाहती हूँ कि अभी आपकी स्किन को क्या चाहिए, फिर मैं आपके लिए सही S.19 केयर सुझाऊँगी। आप अपनी स्किन में क्या सुधार करना चाहते हैं?",
  te: "హాయ్, నేను IXX, మీ S.19 స్కిన్ కన్సల్టెంట్‌ని. ముందుగా మీ స్కిన్‌కి ఇప్పుడు ఏం అవసరమో అర్థం చేసుకుని, మీకు సరిపోయే S.19 కేర్‌ని సూచిస్తాను. మీ స్కిన్‌లో మీరు ఏం మెరుగుపరుచుకోవాలనుకుంటున్నారు?",
};

const PLACEHOLDER: Record<Language, string> = {
  en: 'Tell IXX what you want to improve…',
  hi: 'IXX ki aap kya improve karna chahte hain cheppandi…',
  te: 'Mee skin lo em improve cheyyalanukuntunnaro IXX ki cheppandi…',
};

const LANG_LABELS = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు' };

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export const IXXAssistant: React.FC<IXXAssistantProps> = ({ onOpenFullChat }) => {
  const [open, setOpen] = useState(true);
  const [language, setLanguage] = useState<Language>('en');
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [text, setText] = useState('');
  const [conversation, setConversation] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);
  const hasWelcomed = useRef(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = async (value: string, lang: Language = language) => {
    if (!value || typeof window === 'undefined') return;

    // Use OpenAI neural TTS instead of Chrome speechSynthesis. This gives IXX
    // a consistent female voice and much better multilingual pronunciation.
    try {
      audioRef.current?.pause();
      if (audioRef.current) audioRef.current.currentTime = 0;

      setSpeaking(true);
      const speechText = lang === 'te'
        ? value.replace(/S\.19/gi, 'ఎస్ నైన్టీన్')
        : lang === 'hi'
          ? value.replace(/S\.19/gi, 'एस नाइन्टीन')
          : value.replace(/S\.19/gi, 'S nineteen');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText, language: lang }),
      });

      if (!response.ok) throw new Error('TTS request failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      // Fallback only if the neural TTS endpoint is unavailable.
      setSpeaking(false);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(value);
        utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 0.94;
        utterance.pitch = 1.08;
        utterance.onstart = () => setSpeaking(true);
        utterance.onend = () => setSpeaking(false);
        utterance.onerror = () => setSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const unlockAndWelcome = () => {
    if (hasWelcomed.current) return;
    hasWelcomed.current = true;
    speak(GREETINGS[language]);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      // Browsers may block autoplay audio. We still attempt it immediately;
      // the visible IXX card remains available for a one-click audio unlock.
      unlockAndWelcome();
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      recognitionRef.current?.stop?.();
    };
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setSpeaking(false);
  };

  const sendToIXX = async (userText: string) => {
    const clean = userText.trim();
    if (!clean || thinking) return;
    setText('');
    setConversation(prev => [...prev, clean]);
    setThinking(true);

    try {
      const history = conversation.map((item, i) => ({ sender: i % 2 === 0 ? 'user' : 'assistant', text: item }));
      const prompt = `You are IXX, the friendly S.19 Skinlabs voice consultant. Conduct a short, warm skincare consultation. The customer said: "${clean}". Previous consultation notes: ${conversation.join(' | ')}. Ask at most one useful follow-up question if more information is needed. Once you have enough information, recommend the most appropriate S.19 phase and product and briefly explain why. Never diagnose, never invent product facts, and follow all S.19 safety rules. Reply naturally in ${LANG_LABELS[language]}. For Telugu, use Telugu script (తెలుగు) rather than Roman Telugu. For Hindi, use Devanagari rather than Roman Hindi. Keep the response suitable for spoken audio, under 70 words.`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history, phase: '', product: '' }),
      });
      const data = await response.json();
      const reply = data.reply || 'IXX is ready. Tell me a little more about what you want to improve.';
      setConversation(prev => [...prev, reply]);
      speak(reply, language);
    } catch (error) {
      const fallback = language === 'te'
        ? 'పర్లేదు. మీ స్కిన్ గురించి కొంచెం ఇంకా చెప్పండి, నేను S.19 కేర్‌లో మీకు గైడ్ చేస్తాను.'
        : language === 'hi'
          ? 'कोई बात नहीं। अपनी स्किन के बारे में थोड़ा और बताइए, मैं आपको S.19 केयर में गाइड करूँगी.'
          : 'No worries. Tell me a little more about your skin and I’ll guide you through the S.19 options.';
      setConversation(prev => [...prev, fallback]);
      speak(fallback, language);
    } finally {
      setThinking(false);
    }
  };

  const startListening = () => {
    unlockAndWelcome();
    const Recognition = getSpeechRecognition();
    if (!Recognition) {
      const msg = 'Voice input is not available in this browser. You can type your answer below.';
      speak(msg, 'en');
      return;
    }
    recognitionRef.current?.stop?.();
    const recognition = new Recognition();
    recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setText(transcript);
      if (transcript) sendToIXX(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const switchLanguage = (next: Language) => {
    stopSpeaking();
    setLanguage(next);
    setTimeout(() => speak(GREETINGS[next], next), 100);
  };

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); unlockAndWelcome(); }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#171715] text-[#F4F0E8] px-5 py-3 shadow-xl hover:bg-[#2A2926] transition-all"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C86D51] text-white font-semibold">I</span>
        <span className="text-xs uppercase tracking-[0.18em]">Talk to IXX</span>
      </button>
    );
  }

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#C9C3B8] bg-[#FAF8F4] shadow-[0_18px_60px_rgba(23,23,21,0.18)]">
      <div className="bg-[#171715] px-5 py-4 text-[#F4F0E8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C86D51] text-white font-semibold text-lg">I</div>
          <div>
            <div className="text-sm font-semibold tracking-wide">IXX</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-[#C9C3B8]">S.19 Skin Consultant</div>
          </div>
        </div>
        <button onClick={() => { stopSpeaking(); setOpen(false); }} className="p-2 hover:bg-white/10 rounded-full" aria-label="Close IXX"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          {(Object.keys(LANG_LABELS) as Language[]).map(l => (
            <button key={l} onClick={() => switchLanguage(l)} className={`rounded-full border px-3 py-1.5 text-[11px] ${language === l ? 'bg-[#171715] text-white border-[#171715]' : 'border-[#C9C3B8] text-[#171715]'}`}>{LANG_LABELS[l]}</button>
          ))}
        </div>

        <div className="rounded-xl border border-[#C9C3B8] bg-[#F4F0E8] p-4 min-h-[100px]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6D6A63] mb-2"><Sparkles className="w-3.5 h-3.5 text-[#C86D51]" /> IXX is listening to you</div>
          <p className="text-sm leading-relaxed text-[#171715]">
            {conversation.length ? conversation[conversation.length - 1] : GREETINGS[language]}
          </p>
          {thinking && <div className="mt-3 flex items-center gap-2 text-xs text-[#6D6A63]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking about your skin…</div>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={listening ? () => recognitionRef.current?.stop?.() : startListening} disabled={thinking} className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs uppercase tracking-[0.14em] font-medium ${listening ? 'bg-[#C86D51] text-white' : 'bg-[#171715] text-white'} disabled:opacity-50`}>
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {listening ? 'Listening…' : 'Talk to IXX'}
          </button>
          <button onClick={speaking ? stopSpeaking : () => speak(conversation[conversation.length - 1] || GREETINGS[language])} className="rounded-full border border-[#C9C3B8] p-3" aria-label="Voice reply">
            {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendToIXX(text); }} placeholder={PLACEHOLDER[language]} className="min-w-0 flex-1 rounded-full border border-[#C9C3B8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#171715]" />
          <button onClick={() => sendToIXX(text)} disabled={!text.trim() || thinking} className="rounded-full bg-[#171715] p-3 text-white disabled:opacity-40"><ArrowUpRight className="w-4 h-4" /></button>
        </div>

        <button onClick={onOpenFullChat} className="w-full text-center text-[11px] uppercase tracking-[0.14em] text-[#6D6A63] hover:text-[#171715]">Open full S.19 AI assistant ↗</button>
      </div>
    </aside>
  );
};
