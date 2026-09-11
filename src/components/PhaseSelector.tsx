import React from 'react';
import { ArrowUpRight, HelpCircle, Eye, ArrowLeft } from 'lucide-react';

interface PhaseSelectorProps {
  onSelectPathA: () => void;
  onSelectPathB: () => void;
  onBack: () => void;
}

export const PhaseSelector: React.FC<PhaseSelectorProps> = ({
  onSelectPathA,
  onSelectPathB,
  onBack,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-24">
      {/* Top Breadcrumb / Back button */}
      <div className="mb-8 sm:mb-12">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D6A63] hover:text-[#171715] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to overview</span>
        </button>
      </div>

      {/* Editorial Header */}
      <div className="max-w-3xl space-y-4 mb-14 sm:mb-20">
        <span className="text-[11px] uppercase tracking-[0.25em] text-[#6D6A63] font-medium block">
          STEP 01 &bull; PHASE SELECTION
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171715] tracking-tight leading-tight">
          Find your skin phase.
        </h1>
        <p className="text-base sm:text-lg text-[#6D6A63] leading-relaxed">
          Your skin barrier continuously adapts to your environment, habits, and active care. Select how you would like to pinpoint your present state.
        </p>
      </div>

      {/* The Two Choices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Choice 1: I DON'T KNOW MY SKIN PHASE */}
        <div
          id="choice-assessment-card"
          className="group relative border border-[#C9C3B8] bg-[#FAF8F4] p-8 sm:p-10 lg:p-12 flex flex-col justify-between hover:border-[#171715] transition-all duration-300 shadow-sm"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#C86D51]">
                PATH A &bull; GUIDED DIAGNOSTIC
              </span>
              <div className="w-8 h-8 rounded-full border border-[#C9C3B8] flex items-center justify-center group-hover:border-[#171715] transition-colors">
                <HelpCircle className="w-4 h-4 text-[#171715]" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#171715] leading-snug">
                I DON'T KNOW MY SKIN PHASE
              </h2>
              <p className="text-sm sm:text-base text-[#6D6A63] leading-relaxed">
                Answer a few simple questions and we'll help you identify your current phase.
              </p>
            </div>

            <div className="pt-4 border-t border-[#C9C3B8]/50 space-y-2 text-xs text-[#6D6A63]">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#171715]" />
                <span>8 clinically structured questions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#171715]" />
                <span>Deterministic barrier scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#171715]" />
                <span>Built-in barrier safety override</span>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <button
              onClick={onSelectPathA}
              className="w-full group/btn inline-flex items-center justify-between px-6 py-4 bg-[#171715] text-[#F4F0E8] text-xs uppercase tracking-widest font-medium rounded-full hover:bg-[#2A2926] transition-colors cursor-pointer"
            >
              <span>Start assessment</span>
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* Choice 2: I KNOW MY SKIN PHASE */}
        <div
          id="choice-visual-card"
          className="group relative border border-[#C9C3B8] bg-[#FAF8F4] p-8 sm:p-10 lg:p-12 flex flex-col justify-between hover:border-[#171715] transition-all duration-300 shadow-sm"
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#C86D51]">
                PATH B &bull; VISUAL SELECTION
              </span>
              <div className="w-8 h-8 rounded-full border border-[#C9C3B8] flex items-center justify-center group-hover:border-[#171715] transition-colors">
                <Eye className="w-4 h-4 text-[#171715]" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#171715] leading-snug">
                I KNOW MY SKIN PHASE
              </h2>
              <p className="text-sm sm:text-base text-[#6D6A63] leading-relaxed">
                Select the phase that best describes your skin right now.
              </p>
            </div>

            <div className="pt-4 border-t border-[#C9C3B8]/50 space-y-2 text-xs text-[#6D6A63]">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#171715]" />
                <span>4 macro skin phase photographs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#171715]" />
                <span>Direct visual identification</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#171715]" />
                <span>Immediate phase formulation match</span>
              </div>
            </div>
          </div>

          <div className="pt-10">
            <button
              onClick={onSelectPathB}
              className="w-full group/btn inline-flex items-center justify-between px-6 py-4 border border-[#171715] text-[#171715] text-xs uppercase tracking-widest font-medium rounded-full hover:bg-[#171715] hover:text-[#F4F0E8] transition-colors cursor-pointer"
            >
              <span>Choose my phase</span>
              <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
