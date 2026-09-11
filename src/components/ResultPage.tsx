import React from 'react';
import { ArrowUpRight, Sparkles, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SKIN_PHASES } from '../data/phases';
import { SkinPhaseId } from '../types';

interface ResultPageProps {
  phaseId: SkinPhaseId;
  isSafetyOverride?: boolean;
  onAskAI: () => void;
  onRetake: () => void;
  onViewAllPhases: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  phaseId,
  isSafetyOverride,
  onAskAI,
  onRetake,
  onViewAllPhases,
}) => {
  const phase = SKIN_PHASES[phaseId] || SKIN_PHASES.DEHYDRATION;

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
      
      {/* Safety Override Notice if triggered */}
      {isSafetyOverride && (
        <div className="mb-10 p-5 sm:p-6 bg-[#FAF8F4] border-l-4 border-[#C86D51] border-y border-r border-[#C9C3B8] flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-[#C86D51] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-medium uppercase tracking-wider text-[#171715]">
              Care-First Barrier Rest Protocol Activated
            </h4>
            <p className="text-xs sm:text-sm text-[#6D6A63] leading-relaxed">
              Your responses indicate acute sensitivity, burning, or recent clinical skin stress. S.19 halts active formulations in favor of gentle barrier reset.
            </p>
          </div>
        </div>
      )}

      {/* Main Result Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Large Realistic Phase Image */}
        <div className="lg:col-span-6 space-y-6">
          <div className="border border-[#C9C3B8] p-3 sm:p-4 bg-[#FAF8F4] shadow-sm">
            <div className="aspect-[4/3] sm:aspect-[1/1] overflow-hidden bg-[#EBE5DA] relative">
              <img
                src={phase.image}
                alt={phase.title}
                className="w-full h-full object-cover grayscale-[8%] contrast-[105%]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-[#171715]/85 text-[#F4F0E8] text-[10px] uppercase tracking-[0.25em] px-3 py-1 backdrop-blur-xs">
                S.19 PHASE 0{phase.phaseNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6D6A63] px-1">
            <span>Macro Skin Study &bull; {phase.shortName}</span>
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-1.5 hover:text-[#171715] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake assessment</span>
            </button>
          </div>
        </div>

        {/* Right Column: Editorial Phase Details & Recommendation */}
        <div className="lg:col-span-6 space-y-10">
          
          {/* Phase Title & Summary */}
          <div className="space-y-3 pb-8 border-b border-[#C9C3B8]">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C86D51] font-medium block">
              YOUR S.19 PHASE
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171715] tracking-tight leading-tight">
              {phase.title}
            </h1>
            <p className="text-base sm:text-lg text-[#171715]/80 font-serif pt-2 leading-relaxed">
              {phase.summary}
            </p>
            <p className="text-sm text-[#6D6A63] leading-relaxed">
              {phase.description}
            </p>
          </div>

          {/* S.19 Recommendation */}
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-[0.25em] text-[#6D6A63] font-medium block">
              YOUR S.19 RECOMMENDATION
            </span>
            
            <div className="p-6 bg-[#FAF8F4] border border-[#C9C3B8] space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl text-[#171715] tracking-tight uppercase">
                    {phase.recommendedProduct}
                  </h2>
                  <span className="text-xs text-[#6D6A63] uppercase tracking-wider block mt-1">
                    {phase.isRecovery ? 'Care-First Barrier Protocol' : 'S.19 Capsule Care System'}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#171715] text-[#F4F0E8] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-[#F4F0E8]" />
                </div>
              </div>

              {/* WHY THIS MATCHES */}
              <div className="pt-4 border-t border-[#C9C3B8]/60 space-y-1.5">
                <h3 className="text-xs uppercase tracking-widest font-medium text-[#171715]">
                  WHY THIS MATCHES
                </h3>
                <p className="text-sm text-[#6D6A63] leading-relaxed">
                  {phase.whyItMatches}
                </p>
              </div>

              {/* Care Guidance if Recovery */}
              {phase.careGuidance && (
                <div className="pt-3 border-t border-[#C9C3B8]/60 space-y-1.5">
                  <h3 className="text-xs uppercase tracking-widest font-medium text-[#C86D51]">
                    RECOVERY GUIDANCE
                  </h3>
                  <p className="text-sm text-[#6D6A63] leading-relaxed">
                    {phase.careGuidance}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* HERO ACTIVES */}
          {!phase.isRecovery && (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs uppercase tracking-[0.25em] text-[#6D6A63] font-medium">
                  HERO ACTIVES
                </h3>
                <span className="text-[10px] text-[#6D6A63] tracking-wide">
                  Hero actives; not full INCI
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {phase.heroActives.map((active, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-[#C9C3B8] bg-[#FAF8F4] space-y-1"
                  >
                    <div className="font-serif text-xl sm:text-2xl text-[#171715]">
                      {active.percentage}
                    </div>
                    <div className="text-xs font-medium text-[#171715] leading-snug">
                      {active.name}
                    </div>
                    {active.purpose && (
                      <div className="text-[11px] text-[#6D6A63] leading-tight pt-1">
                        {active.purpose}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Action Button: "Ask S.19 AI ↗" */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <button
              id="ask-s19-ai-btn"
              onClick={onAskAI}
              className="group flex-1 inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#171715] text-[#F4F0E8] text-xs uppercase tracking-widest font-medium rounded-full hover:bg-[#2A2926] transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#C86D51]" />
              <span>Ask S.19 AI</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              onClick={onViewAllPhases}
              className="inline-flex items-center justify-center px-6 py-4 border border-[#C9C3B8] text-[#171715] text-xs uppercase tracking-wider font-medium rounded-full hover:border-[#171715] transition-colors cursor-pointer"
            >
              Explore all 4 phases
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
