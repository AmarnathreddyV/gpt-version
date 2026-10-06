import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, X, Sparkles, ArrowUpRight, Loader2 } from 'lucide-react';

interface IXXAssistantProps {
  onOpenFullChat: () => void;
}

type Status = 'connecting' | 'ready' | 'listening' | 'speaking' | 'thinking' | 'error';

const GREETING = "Hi, I'm IXX, your S.19 skin consultant. Tell me what's bothering you about your skin, and let's figure it out together.";

const SYSTEM_INSTRUCTION = `
You are IXX, the friendly female voice consultant for S.19 Skinlabs.

BRAND NAME:
- The UI brand name is written exactly as IXX.
- When speaking, pronounce IXX as one short syllable: "icks", like Vicks without the V.
- Never spell the letters I-X-X aloud.

VOICE AND PERSONALITY:
- Sound warm, sweet, feminine, premium, playful and lightly humorous.
- Speak briskly but clearly. Never sound robotic, formal, or like a translated script.
- Ask only one question at a time.
- Keep every response very short: normally 1–2 short sentences and under 35 words.

LANGUAGE:
- Automatically detect the customer's spoken language and reply in the same language.
- For Telugu, Telugu must clearly dominate, with only a few natural English skincare words such as skin, dry, oily, marks, glow, routine, cream, okay.
- For Hindi, Hindi must clearly dominate, with only a few natural English skincare words.
- For English, use natural Indian English.
- Do not switch languages unless the customer does.
- Do not translate English sentence-by-sentence into Telugu or Hindi.

S.19 CONSULTATION:
Learn the customer's main concern, one useful detail at a time. Once there is enough information, recommend the most appropriate S.19 phase and product.

PRODUCT KNOWLEDGE — ONLY USE THESE FACTS:
1. DEHYDRATION — Hydrating Capsule Cream. For dry, tight or moisture-depleted skin. Hero actives: 5% 13D Hyaluronic Acid, 2% Hydroviton, 2% Pentavitin.
2. OIL IMBALANCE — Sebum Control Capsule Cream. For excess oiliness, shine or congested-looking pores. Hero actives: 3% Encapsulated Salicylic Acid, 2% Tranexamic Acid, 0.5% Sebum Control Complex.
3. UNEVEN TONE — TXA + NIA Capsule Cream. For visible marks, localized pigmentation or uneven-looking tone. Hero actives: 4% Tranexamic Acid, 2% Niacinamide, 2% Rose PDRN.
4. RECOVERY — Care-First Barrier Pause. For heightened sensitivity, burning, significant irritation or post-procedure stress. It is care-first; active treatment creams are paused.

SAFETY:
- Never diagnose a medical condition.
- Never promise a cure, permanent result, or guaranteed outcome.
- Never invent dosage, frequency, price, stock, shipping, or ingredients beyond the facts above.
- If the customer reports severe burning, swelling, a significant rash, an emergency symptom, or recent medical/cosmetic procedure with concerning symptoms, prioritize stopping active recommendations and advise appropriate professional medical care.
- If skin sounds actively irritated or burning, prefer RECOVERY rather than an active phase.

CONVERSATION:
Start by asking what they want to improve. Be friendly and concise. Do not dump product information before understanding the concern.
`;

function base64FromArrayBuffer(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function pcm16FromFloat32(input: Float32Array, inputRate: number, outputRate = 16000) {
  if (inputRate === outputRate) {
    const out = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) out[i] = Math.max(-1, Math.min(1, input[i])) * 0x7fff;
    return out;
  }

  const ratio = inputRate / outputRate;
  const outputLength = Math.max(1, Math.floor(input.length / ratio));
  const out = new Int16Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const position = i * ratio;
    const left = Math.floor(position);
    const right = Math.min(left + 1, input.length - 1);
    const weight = position - left;
    const sample = input[left] * (1 - weight) + input[right] * weight;
    out[i] = Math.max(-1, Math.min(1, sample)) * 0x7fff;
  }
  return out;
}

function int16ToArrayBuffer(samples: Int16Array) {
  return samples.buffer.slice(samples.byteOffset, samples.byteOffset + samples.byteLength);
}

function pcm16ToAudioBuffer(ctx: AudioContext, base64: string, sampleRate = 24000) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const samples = new Int16Array(bytes.buffer);
  const buffer = ctx.createBuffer(1, samples.length, sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) channel[i] = samples[i] / 0x8000;
  return buffer;
}

export const IXXAssistant: React.FC<IXXAssistantProps> = ({ onOpenFullChat }) => {
  const [open, setOpen] = useState(true);
  const [status, setStatus] = useState<Status>('connecting');
  const [text, setText] = useState('');
  const [lastUserText, setLastUserText] = useState('');
  const [lastAssistantText, setLastAssistantText] = useState(GREETING);
  const [error, setError] = useState('');

  const wsRef = useRef<WebSocket | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const playbackSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlaybackTimeRef = useRef(0);
  const mountedRef = useRef(true);
  const connectedRef = useRef(false);
  const greetedRef = useRef(false);

  const stopPlayback = () => {
    playbackSourcesRef.current.forEach(source => {
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
    });
    playbackSourcesRef.current = [];
    nextPlaybackTimeRef.current = 0;
    setStatus(prev => prev === 'speaking' ? 'listening' : prev);
  };

  const stopMicrophone = () => {
    processorRef.current?.disconnect();
    sourceRef.current?.disconnect();
    processorRef.current = null;
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    inputContextRef.current?.close().catch(() => undefined);
    inputContextRef.current = null;
  };

  const closeSession = () => {
    stopMicrophone();
    stopPlayback();
    outputContextRef.current?.close().catch(() => undefined);
    outputContextRef.current = null;
    if (wsRef.current) {
      try { wsRef.current.close(); } catch { /* ignore */ }
      wsRef.current = null;
    }
    connectedRef.current = false;
  };

  const playAudioChunk = (base64: string) => {
    const ctx = outputContextRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => undefined);

    const buffer = pcm16ToAudioBuffer(ctx, base64, 24000);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime + 0.015, nextPlaybackTimeRef.current || ctx.currentTime + 0.015);
    source.start(startAt);
    nextPlaybackTimeRef.current = startAt + buffer.duration;
    playbackSourcesRef.current.push(source);
    source.onended = () => {
      playbackSourcesRef.current = playbackSourcesRef.current.filter(item => item !== source);
      source.disconnect();
    };
  };

  const connectGemini = async () => {
    if (connectedRef.current || wsRef.current) return;
    setError('');
    setStatus('connecting');

    try {
      const tokenResponse = await fetch('/api/gemini-live-token-v2', { method: 'POST' });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.token) throw new Error(tokenData.error || 'Gemini Live token unavailable');

      const outputContext = new AudioContext({ sampleRate: 24000 });
      outputContextRef.current = outputContext;

      const ws = new WebSocket(`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(tokenData.token)}`);
      wsRef.current = ws;

      ws.onopen = async () => {
        const setup = {
          setup: {
            model: 'models/gemini-3.8-live',
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Leda' } } },
            },
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            realtimeInputConfig: {
              automaticActivityDetection: {
                disabled: false,
                prefixPaddingMs: 180,
                silenceDurationMs: 650,
              },
            },
            contextWindowCompression: { slidingWindow: {} },
          },
        };
        ws.send(JSON.stringify(setup));
        connectedRef.current = true;

        try {
          await startMicrophone();
        } catch (micError: any) {
          setError(micError?.message || 'Microphone permission is required for voice mode.');
          setStatus('ready');
        }
      };

      ws.onmessage = event => {
        if (!mountedRef.current) return;
        let message: any;
        try { message = JSON.parse(event.data); } catch { return; }
        if (message.setupComplete) {
          window.setTimeout(sendGreeting, 250);
          return;
        }

        const content = message.serverContent;
        if (!content) return;

        if (content.interrupted) {
          stopPlayback();
          setStatus('listening');
        }

        if (content.inputTranscription?.text) {
          const incoming = String(content.inputTranscription.text).trim();
          if (incoming) {
            setLastUserText(prev => `${prev} ${incoming}`.trim().slice(-500));
            setStatus('thinking');
          }
        }

        if (content.outputTranscription?.text) {
          const outgoing = String(content.outputTranscription.text).trim();
          if (outgoing) setLastAssistantText(prev => `${prev} ${outgoing}`.trim());
        }

        const parts = content.modelTurn?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            setStatus('speaking');
            playAudioChunk(part.inlineData.data);
          }
        }

        if (content.turnComplete) {
          window.setTimeout(() => {
            if (mountedRef.current && playbackSourcesRef.current.length === 0) setStatus('listening');
          }, 100);
        }
      };

      ws.onerror = () => {
        if (!mountedRef.current) return;
        setError('Gemini Live could not connect. Check your GEMINI_API_KEY and Gemini API access.');
        setStatus('error');
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        connectedRef.current = false;
        wsRef.current = null;
        if (status !== 'error') setStatus('ready');
      };
    } catch (err: any) {
      setError(err?.message || 'Unable to start Gemini Live.');
      setStatus('error');
    }
  };

  const startMicrophone = async () => {
    if (streamRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    streamRef.current = stream;

    const ctx = new AudioContext();
    inputContextRef.current = ctx;
    if (ctx.state === 'suspended') await ctx.resume();

    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    sourceRef.current = source;
    processorRef.current = processor;

    processor.onaudioprocess = event => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;
      const input = event.inputBuffer.getChannelData(0);
      const pcm = pcm16FromFloat32(input, ctx.sampleRate, 16000);
      if (!pcm.length) return;
      ws.send(JSON.stringify({
        realtimeInput: {
          audio: {
            data: base64FromArrayBuffer(int16ToArrayBuffer(pcm)),
            mimeType: 'audio/pcm;rate=16000',
          },
        },
      }));
      if (status !== 'speaking') setStatus('listening');
    };

    const mute = ctx.createGain();
    mute.gain.value = 0;
    source.connect(processor);
    processor.connect(mute);
    mute.connect(ctx.destination);
    setStatus('listening');
  };

  const sendText = (value: string) => {
    const clean = value.trim();
    const ws = wsRef.current;
    if (!clean || !ws || ws.readyState !== WebSocket.OPEN) return;
    setLastUserText(clean);
    setText('');
    setStatus('thinking');
    ws.send(JSON.stringify({ realtimeInput: { text: clean } }));
  };

  const sendGreeting = () => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN || greetedRef.current) return;
    greetedRef.current = true;
    setLastAssistantText(GREETING);
    ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: 'Start the consultation now. Give the customer a warm, very short greeting and ask what they want to improve about their skin.' }] }], turnComplete: true } }));
  };

  useEffect(() => {
    mountedRef.current = true;
    connectGemini();
    return () => {
      mountedRef.current = false;
      closeSession();
    };
    // Connect only once when the homepage mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const unlock = () => {
      outputContextRef.current?.resume().catch(() => undefined);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  if (!open) {
    return (
      <button onClick={() => { setOpen(true); connectGemini(); }} className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#171715] text-[#F4F0E8] px-5 py-3 shadow-xl hover:bg-[#2A2926] transition-all">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C86D51] text-white font-semibold">I</span>
        <span className="text-xs uppercase tracking-[0.18em]">Talk to IXX</span>
      </button>
    );
  }

  const listening = status === 'listening';
  const speaking = status === 'speaking';
  const thinking = status === 'thinking' || status === 'connecting';

  return (
    <aside className="fixed bottom-5 right-5 z-50 w-[min(390px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#C9C3B8] bg-[#FAF8F4] shadow-[0_18px_60px_rgba(23,23,21,0.18)]">
      <div className="bg-[#171715] px-5 py-4 text-[#F4F0E8] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C86D51] text-white font-semibold text-lg">I</div>
          <div><div className="text-sm font-semibold tracking-wide">IXX</div><div className="text-[10px] uppercase tracking-[0.18em] text-[#C9C3B8]">S.19 Skin Consultant</div></div>
        </div>
        <button onClick={() => { closeSession(); setOpen(false); }} className="p-2 hover:bg-white/10 rounded-full" aria-label="Close IXX"><X className="w-4 h-4" /></button>
      </div>

      <div className="p-5 space-y-4">
        <div className="rounded-xl border border-[#C9C3B8] bg-[#F4F0E8] p-4 min-h-[118px]">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-[#6D6A63] mb-2"><Sparkles className="w-3.5 h-3.5 text-[#C86D51]" /> {listening ? 'IXX is listening to you' : speaking ? 'IXX is speaking' : thinking ? 'IXX is connecting' : status === 'error' ? 'IXX needs attention' : 'IXX is ready'}</div>
          <p className="text-sm leading-relaxed text-[#171715]">{lastAssistantText}</p>
          {lastUserText && <p className="mt-2 text-xs leading-relaxed text-[#6D6A63]">You: {lastUserText}</p>}
          {error && <p className="mt-3 text-xs leading-relaxed text-[#9A4A36]">{error}</p>}
          {thinking && !error && <div className="mt-3 flex items-center gap-2 text-xs text-[#6D6A63]"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Getting IXX ready…</div>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={listening ? stopMicrophone : startMicrophone} disabled={status === 'connecting' || status === 'error'} className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs uppercase tracking-[0.14em] font-medium ${listening ? 'bg-[#C86D51] text-white' : 'bg-[#171715] text-white'} disabled:opacity-50`}>
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}{listening ? 'Listening…' : 'Talk to IXX'}
          </button>
          <button onClick={speaking ? stopPlayback : () => outputContextRef.current?.resume()} className="rounded-full border border-[#C9C3B8] p-3" aria-label="Voice reply">{speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}</button>
        </div>

        <div className="flex items-center gap-2">
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') sendText(text); }} placeholder="Type to IXX if you prefer…" className="min-w-0 flex-1 rounded-full border border-[#C9C3B8] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#171715]" />
          <button onClick={() => sendText(text)} disabled={!text.trim() || status === 'connecting'} className="rounded-full bg-[#171715] p-3 text-white disabled:opacity-40"><ArrowUpRight className="w-4 h-4" /></button>
        </div>

        <button onClick={onOpenFullChat} className="w-full text-center text-[11px] uppercase tracking-[0.14em] text-[#6D6A63] hover:text-[#171715]">Open full S.19 AI assistant ↗</button>
      </div>
    </aside>
  );
};
