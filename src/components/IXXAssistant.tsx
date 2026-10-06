import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, ArrowUpRight, Loader2 } from 'lucide-react';

interface IXXAssistantProps {
  onOpenFullChat: () => void;
}

type Language = 'en' | 'hi' | 'te';

const GREETING = "Hi, I'm IXX, your S.19 skin consultant. Tell me what's bothering you about your skin, and let's figure it out together.";

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const detectLanguageFromText = (value: string): Language => {
  if (/[\u0C00-\u0C7F]/.test(value)) return 'te';
  if (/[\u0900-\u097F]/.test(value)) return 'hi';

  const t = value.toLowerCase();
  const teWords = /\b(nenu|naaku|naku|mee|mi|mana|na|undi|unnadi|undhi|ela|em|enti|enduku|kani|kuda|chala|konchem|skin lo|skin ki|cheppandi|cheppu|kavali|kaavali|avuthundi|avutundi|pimples|mukham|mukhamlo|dry ga|oily ga|baaga|bagundi)\b/;
  const hiWords = /\b(main|mujhe|mera|meri|aap|aapki|aapko|hai|hain|kya|kaise|kyun|thoda|bahut|lekin|bhi|skin mein|skin me|chehra|chahiye|chahte|chahti|batao|bataiye|ho raha|rahi)\b/;
  const teScore = (t.match(new RegExp(teWords.source, 'g')) || []).length;
  const hiScore = (t.match(new RegExp(hiWords.source, 'g')) || []).length;
  if (teScore > hiScore && teScore > 0) return 'te';
  if (hiScore > teScore && hiScore > 0) return 'hi';
  return 'en';
};

const mixedStyleInstruction = (lang: Language) => {
  if (lang === 'te') {
    return 'Reply in natural conversational Telugu mixed with English the way a young Hyderabad/Indian customer naturally speaks. Do NOT use pure Telugu or formal/literary Telugu. Keep common skincare/product words in English (skin, dry, oily, marks, glow, routine, care, phase, cream, etc.) and mix English naturally throughout. Telugu should be the main language, but code-switch casually and sweetly.';
  }
  if (lang === 'hi') {
    return 'Reply in natural conversational Indian Hindi mixed with English the way a young Indian customer naturally speaks. Do NOT use pure Hindi or formal/literary Hindi. Keep common skincare/product words in English (skin, dry, oily, marks, glow, routine, care, phase, cream, etc.) and mix English naturally throughout. Hindi should be the main language, but code-switch casually and sweetly.';
  }
  return 'Reply in natural Indian English. Keep it casual, warm and conversational.';
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsAbortRef = useRef<AbortController | null>(null);
  const ttsRequestRef = useRef(0);
  const consultationVersionRef = useRef(0);
  const speakingRef = useRef(false);
  const listeningRef = useRef(false);
  const thinkingRef = useRef(false);
  const hasWelcomed = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const maxListenTimerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechDetectedRef = useRef(false);

  const stopMediaListening = () => {
    if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
    if (maxListenTimerRef.current) window.clearTimeout(maxListenTimerRef.current);
    silenceTimerRef.current = null;
    maxListenTimerRef.current = null;
    mediaRecorderRef.current?.stop?.();
    mediaRecorderRef.current = null;
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close?.();
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  const stopSpeaking = () => {
    ++ttsRequestRef.current;
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = null;
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setSpeaking(false);
    speakingRef.current = false;
  };

  const startListening = async (auto = false) => {
    if (speakingRef.current || thinkingRef.current || listeningRef.current) return;

    // Prefer server transcription so the customer can speak Telugu, Hindi,
    // English or mixed speech without selecting a language first.
    if (navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm';
        const recorder = new MediaRecorder(stream, { mimeType });
        const chunks: Blob[] = [];
        mediaRecorderRef.current = recorder;
        speechDetectedRef.current = false;
        setListening(true);
        listeningRef.current = true;

        recorder.ondataavailable = (e: BlobEvent) => { if (e.data.size) chunks.push(e.data); };
        recorder.onstop = async () => {
          stopMediaListening();
          setListening(false);
          listeningRef.current = false;
          if (!chunks.length) return;
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = String(reader.result).split(',')[1];
            if (!base64) return;
            try {
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64, mimeType: recorder.mimeType || 'audio/webm' }),
              });
              if (!response.ok) throw new Error('Transcription failed');
              const data = await response.json();
              const transcript = String(data.text || '').trim();
              if (transcript) {
                const detected = (data.language === 'te' || data.language === 'hi' || data.language === 'en')
                  ? data.language as Language
                  : detectLanguageFromText(transcript);
                setLanguage(detected);
                setText(transcript);
                await sendToIXX(transcript, detected);
              }
            } catch {
              // If server transcription is unavailable, fall back to Chrome recognition.
              startBrowserRecognition();
            }
          };
          reader.readAsDataURL(blob);
        };

        // Simple voice activity detection: start with 1.5s grace, then stop
        // after ~1.1s of silence. Hard cap prevents an open microphone.
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          audioContextRef.current = ctx;
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 1024;
          source.connect(analyser);
          analyserRef.current = analyser;
          const data = new Uint8Array(analyser.fftSize);
          const check = () => {
            if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') return;
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            const rms = Math.sqrt(sum / data.length);
            if (rms > 0.025) {
              speechDetectedRef.current = true;
              if (silenceTimerRef.current) window.clearTimeout(silenceTimerRef.current);
              silenceTimerRef.current = null;
            } else if (speechDetectedRef.current && !silenceTimerRef.current) {
              silenceTimerRef.current = window.setTimeout(() => mediaRecorderRef.current?.stop(), 1000);
            }
            requestAnimationFrame(check);
          };
          requestAnimationFrame(check);
        }

        recorder.start();
        maxListenTimerRef.current = window.setTimeout(() => recorder.stop(), 12000);
        return;
      } catch {
        stopMediaListening();
      }
    }

    startBrowserRecognition();
  };

  const startBrowserRecognition = () => {
    const Recognition = getSpeechRecognition();
    if (!Recognition) return;
    recognitionRef.current?.stop?.();
    const recognition = new Recognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => { setListening(true); listeningRef.current = true; };
    recognition.onend = () => { setListening(false); listeningRef.current = false; };
    recognition.onerror = () => { setListening(false); listeningRef.current = false; };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      if (transcript) {
        const detected = detectLanguageFromText(transcript);
        setLanguage(detected);
        setText(transcript);
        sendToIXX(transcript, detected);
      }
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const speak = async (value: string, lang: Language = language) => {
    if (!value || typeof window === 'undefined') return;
    const requestId = ++ttsRequestRef.current;
    ttsAbortRef.current?.abort();
    ttsAbortRef.current = new AbortController();
    stopMediaListening();
    recognitionRef.current?.stop?.();
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();

    try {
      setSpeaking(true);
      speakingRef.current = true;
      const speechText = value
        .replace(/\bIXX\b/gi, 'icks')
        .replace(/S\.19/gi, lang === 'te' ? 'ఎస్ నైన్టీన్' : lang === 'hi' ? 'एस नाइन्टीन' : 'S nineteen');
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText, language: lang }),
        signal: ttsAbortRef.current.signal,
      });
      if (!response.ok) throw new Error('TTS request failed');
      const blob = await response.blob();
      if (requestId !== ttsRequestRef.current) return;
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        URL.revokeObjectURL(url);
        if (requestId !== ttsRequestRef.current) return;
        setSpeaking(false);
        speakingRef.current = false;
        window.setTimeout(() => {
          if (!thinkingRef.current && !listeningRef.current) startListening(true);
        }, 150);
      };
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        if (requestId === ttsRequestRef.current) {
          setSpeaking(false);
          speakingRef.current = false;
        }
      };
      await audio.play();
    } catch (error: any) {
      if (error?.name === 'AbortError' || requestId !== ttsRequestRef.current) return;
      setSpeaking(false);
      speakingRef.current = false;
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(value.replace(/\bIXX\b/gi, 'icks'));
        utterance.lang = lang === 'te' ? 'te-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.rate = 1.4;
        utterance.pitch = 1.08;
        utterance.onstart = () => { setSpeaking(true); speakingRef.current = true; };
        utterance.onend = () => {
          setSpeaking(false); speakingRef.current = false;
          window.setTimeout(() => { if (!thinkingRef.current && !listeningRef.current) startListening(true); }, 150);
        };
        utterance.onerror = () => { setSpeaking(false); speakingRef.current = false; };
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const sendToIXX = async (userText: string, detectedLanguage?: Language) => {
    const clean = userText.trim();
    if (!clean || thinkingRef.current) return;
    const requestVersion = consultationVersionRef.current;
    const requestLanguage = detectedLanguage || detectLanguageFromText(clean);
    setLanguage(requestLanguage);
    setText('');
    stopSpeaking();
    setConversation(prev => [...prev, clean]);
    setThinking(true);
    thinkingRef.current = true;
    try {
      const history = conversation.map((item, i) => ({ sender: i % 2 === 0 ? 'user' : 'assistant', text: item }));
      const prompt = `You are IXX, the friendly S.19 Skinlabs voice consultant. The customer said: "${clean}". Previous notes: ${conversation.join(' | ')}. Detect and follow the customer's natural language style. ${mixedStyleInstruction(requestLanguage)} Ask at most one useful follow-up question when needed. When you have enough information, recommend the appropriate S.19 phase/product and briefly explain why. Never diagnose, invent product facts, dosage, price or claims. Be sweet, warm, lightly humorous and a little playful, never cringe. Keep it short and easy to speak, under 55 words. IMPORTANT: do not switch to a different language from the customer's detected language. Mixed English is welcome and should sound natural, not translated.`;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, history, phase: '', product: '', language: requestLanguage }),
      });
      const data = await response.json();
      if (requestVersion !== consultationVersionRef.current) return;
      const reply = data.reply || 'Tell me a little more about your skin and we will figure it out together.';
      const finalLanguage = (data.detectedLanguage === 'te' || data.detectedLanguage === 'hi' || data.detectedLanguage === 'en') ? data.detectedLanguage as Language : requestLanguage;
      setLanguage(finalLanguage);
      setConversation(prev => [...prev, reply]);
      await speak(reply, finalLanguage);
    } catch {
      const fallback = requestLanguage === 'te'
        ? 'Okay, cheppandi… mee skin lo exact ga em bother chesthondi? Let’s figure it out together 😊'
        : requestLanguage === 'hi'
          ? 'Okay, bataiye… skin mein exactly kya bother kar raha hai? Let’s figure it out together 😊'
          : 'Okay, tell me what is bothering your skin. We’ll figure it out together 😊';
      setConversation(prev => [...prev, fallback]);
      await speak(fallback, requestLanguage);
    } finally {
      setThinking(false);
      thinkingRef.current = false;
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!hasWelcomed.current) {
        hasWelcomed.current = true;
        speak(GREETING, 'en');
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => () => {
    stopSpeaking();
    stopMediaListening();
    recognitionRef.current?.stop?.();
  }, []);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#171715] text-[#F4F0E8] px-5 py-3 shadow-xl hover:bg-[#2A2926] transition-all">
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
          <div><div className="text-sm font-semibold tracking-wide">IXX</div><div className="text-[10px] uppercase tracking-[0.18em] text-[#C9C3B8]">S.19 Skin Consultant</div></div>
        </div>
        <button onClick={() => { stopSpeaking(); stopMediaListening(); setOpen(false); }} className="p-2 hover:bg-white/10 rounded-full" aria-label="Close IXX"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-[#C9C3B8] bg-[#F4F0E8] p-4 min-h-[100px]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6D6A63] mb-2"><Sparkles className="w-3.5 h-3.5 text-[#C86D51]" /> {listening ? 'IXX is listening to you' : speaking ? 'IXX is speaking' : thinking ? 'IXX is thinking' : 'IXX is ready'}</div>
          <p className="text-sm leading-relaxed text-[#171715]">{conversation.length ? conversation[conversation.length - 1] : GREETING}</p>
          {thinking && <div className="mt-3 flex items-center gap-2 text-xs text-[#6D6A63]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking about your skin…</div>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={listening ? () => stopMediaListening() : startListening} disabled={thinking || speaking} className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs uppercase tracking-[0.14em] font-medium ${listening ? 'bg-[#C86D51] text-white' : 'bg-[#171715] text-white'} disabled:opacity-50`}>
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}{listening ? 'Listening…' : 'Talk to IXX'}
          </button>
          <button onClick={speaking ? stopSpeaking : () => speak(conversation[conversation.length - 1] || GREETING, language)} className="rounded-full border border-[#C9C3B8] p-3" aria-label="Voice reply">{speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendToIXX(text); }} placeholder="Tell IXX what you want to improve…" className="min-w-0 flex-1 rounded-full border border-[#C9C3B8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#171715]" />
          <button onClick={() => sendToIXX(text)} disabled={!text.trim() || thinking} className="rounded-full bg-[#171715] p-3 text-white disabled:opacity-40"><ArrowUpRight className="w-4 h-4" /></button>
        </div>

        <button onClick={onOpenFullChat} className="w-full text-center text-[11px] uppercase tracking-[0.14em] text-[#6D6A63] hover:text-[#171715]">Open full S.19 AI assistant ↗</button>
      </div>
    </aside>
  );
};
