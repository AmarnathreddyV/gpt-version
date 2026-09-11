import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Sparkles, Send, ArrowLeft, RotateCcw } from 'lucide-react';
import { ChatMessage, SkinPhaseId } from '../types';
import { SKIN_PHASES } from '../data/phases';

interface ChatAssistantProps {
  currentPhaseId?: SkinPhaseId | null;
  onBack: () => void;
  onNavigateToFinder: () => void;
}

const QUICK_PROMPTS = [
  'Why was this product recommended?',
  'What are the key ingredients?',
  'How should I use it?',
  'Can I use it with my current routine?',
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  currentPhaseId,
  onBack,
  onNavigateToFinder,
}) => {
  // Session context from props or storage
  const [phaseContext, setPhaseContext] = useState<{
    id: SkinPhaseId;
    title: string;
    product: string;
  }>(() => {
    if (currentPhaseId && SKIN_PHASES[currentPhaseId]) {
      const p = SKIN_PHASES[currentPhaseId];
      return { id: p.id, title: p.title, product: p.recommendedProduct };
    }

    // Try reading from sessionStorage or localStorage
    try {
      const stored = sessionStorage.getItem('s19_phase_context') || localStorage.getItem('s19_phase_context');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.phase && SKIN_PHASES[parsed.phase as SkinPhaseId]) {
          const p = SKIN_PHASES[parsed.phase as SkinPhaseId];
          return { id: p.id, title: p.title, product: p.recommendedProduct };
        }
      }
    } catch {
      // ignore
    }

    // Default to Dehydration if user opened chat directly
    const def = SKIN_PHASES.DEHYDRATION;
    return { id: def.id, title: def.title, product: def.recommendedProduct };
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: "Hi. I'm your S.19 skin assistant. Based on your current phase, I can help you understand your recommendation and answer questions about S.19 products.",
      timestamp: Date.now(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isThinking) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsThinking(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          phase: phaseContext.title,
          product: phaseContext.product,
          history: messages.slice(-8), // Keep recent dialogue context
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || "I'm here to support your skin phase.";

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      console.warn('Network or server chat issue, using clinical knowledge base:', err);

      // Intelligent S.19 clinical fallback
      const query = text.toLowerCase();
      const phaseInfo = SKIN_PHASES[phaseContext.id] || SKIN_PHASES.DEHYDRATION;
      let fallbackReply = '';

      if (query.includes('burning') || query.includes('irritat') || query.includes('peel') || query.includes('bleeding')) {
        fallbackReply = 'If your skin is experiencing burning, acute irritation, or has recently undergone a clinical procedure, please pause all active formulations immediately. Prioritize gentle barrier rest and consult a medical professional.';
      } else if (query.includes('ingredient') || query.includes('actives') || query.includes('what is in')) {
        if (phaseInfo.isRecovery) {
          fallbackReply = 'In the Recovery Phase, we avoid active exfoliating ingredients to allow your barrier time to reset and calm.';
        } else {
          const activesList = phaseInfo.heroActives
            .map((a) => `• ${a.percentage} ${a.name} (${a.purpose})`)
            .join('\n');
          fallbackReply = `The hero actives in ${phaseInfo.recommendedProduct} are:\n\n${activesList}\n\n*Note: These represent primary hero actives, not a complete INCI list.*`;
        }
      } else if (query.includes('why') || query.includes('recommend') || query.includes('match')) {
        fallbackReply = `${phaseInfo.whyItMatches}\n\nThis formulation is designed specifically for ${phaseInfo.title.toLowerCase()} where ${phaseInfo.summary.toLowerCase()}`;
      } else if (query.includes('how to use') || query.includes('frequency') || query.includes('dosage') || query.includes('routine')) {
        fallbackReply = "I can't confirm specific dosage or application frequency from the available S.19 information. Please refer to your product packaging or consult a dermatologist for personalized routine integration.";
      } else {
        fallbackReply = `For ${phaseInfo.title}, S.19 recommends ${phaseInfo.recommendedProduct}. ${phaseInfo.whyItMatches}`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-14">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#C9C3B8]/60">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D6A63] hover:text-[#171715] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Return</span>
        </button>

        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-[#171715]">
          <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
          <span>S.19 AI Assistant</span>
        </div>
      </div>

      {/* Editorial Header (Mandated exact text: "A little more intention.") */}
      <div className="space-y-4 mb-8">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#6D6A63] font-medium block">
          CONVERSATION &bull; S.19 CLINICAL INTELLIGENCE
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171715] tracking-tight leading-tight">
          A little more <br className="hidden sm:inline" />
          <span className="italic">intention.</span>
        </h1>
      </div>

      {/* Context Banner: Mandatory Phase & Product Context Display */}
      <div className="mb-8 p-5 bg-[#FAF8F4] border border-[#C9C3B8] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#C86D51] block">
              YOUR S.19 PHASE
            </span>
            <div className="font-serif text-base sm:text-lg text-[#171715]">
              {phaseContext.title}
            </div>
          </div>

          <div className="space-y-0.5 sm:border-l sm:border-[#C9C3B8]/60 sm:pl-4">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#6D6A63] block">
              RECOMMENDED PRODUCT
            </span>
            <div className="font-serif text-base sm:text-lg text-[#171715] truncate">
              {phaseContext.product}
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#C9C3B8]/40 flex items-center justify-between text-xs text-[#6D6A63]">
          <span>Context automatically shared with S.19 AI assistant.</span>
          <button
            onClick={onNavigateToFinder}
            className="hover:text-[#171715] underline decoration-[#C9C3B8] underline-offset-2 transition-colors cursor-pointer"
          >
            Change phase
          </button>
        </div>
      </div>

      {/* Chat Thread Area */}
      <div className="border border-[#C9C3B8] bg-[#FAF8F4] flex flex-col h-[520px] shadow-sm">
        
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-[10px] uppercase tracking-widest font-medium text-[#6D6A63]">
                  {msg.sender === 'user' ? 'You' : 'S.19 Assistant'}
                </span>
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[78%] p-4 sm:p-5 text-sm sm:text-base leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#171715] text-[#F4F0E8] rounded-none shadow-xs'
                    : 'bg-[#F4F0E8] text-[#171715] border border-[#C9C3B8] rounded-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          ))}

          {/* Thinking Indicator */}
          {isThinking && (
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-[10px] uppercase tracking-widest font-medium text-[#6D6A63]">
                  S.19 Assistant
                </span>
              </div>
              <div className="p-4 bg-[#F4F0E8] border border-[#C9C3B8] text-sm text-[#6D6A63] flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C86D51] animate-pulse" />
                <span className="font-serif italic text-xs tracking-wide">Thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Pills */}
        <div className="p-3 sm:px-6 bg-[#F4F0E8] border-t border-[#C9C3B8] overflow-x-auto flex items-center gap-2 scrollbar-none">
          <span className="text-[10px] uppercase tracking-wider text-[#6D6A63] font-medium flex-shrink-0 mr-1">
            Inquire:
          </span>
          {QUICK_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isThinking}
              className="text-xs text-[#171715] bg-[#FAF8F4] border border-[#C9C3B8] hover:border-[#171715] px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#FAF8F4] border-t border-[#C9C3B8] flex items-center gap-3">
          <input
            id="chat-input-field"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about ingredients, routine fit, or S.19 care..."
            disabled={isThinking}
            className="flex-1 bg-[#F4F0E8] border border-[#C9C3B8] focus:border-[#171715] px-4 py-3 text-sm text-[#171715] placeholder:text-[#6D6A63]/70 focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isThinking}
            className="p-3 bg-[#171715] text-[#F4F0E8] hover:bg-[#2A2926] disabled:bg-[#C9C3B8]/60 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Safety Notice */}
      <div className="mt-4 text-center">
        <p className="text-[11px] text-[#6D6A63] leading-relaxed">
          S.19 Skinlabs AI operates under strict clinical safety rules. We do not diagnose skin diseases or promise permanent cures. For acute reactions or emergencies, consult medical care immediately.
        </p>
      </div>
    </div>
  );
};
