import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { heroImg } from '../data/phases';

interface HeroProps {
  onStart: () => void;
  onOpenChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onOpenChat }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Top Editorial Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24 border-b border-[#C9C3B8]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Editorial Typography */}
          <div className="lg:col-span-7 space-y-8">
            
            <div className="space-y-3">
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[#6D6A63] font-medium block">
                THE STORY OF S19
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-[-0.035em] text-[#171715] leading-[1.08]">
                Skincare, with <br />
                <span>intention.</span>
              </h1>
            </div>

            {/* Sub-headline quote with moon phase motif inspired by reference */}
            <div className="flex items-start gap-4 pt-2">
              <div className="w-9 h-9 rounded-full bg-[#171715] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#C9C3B8]/60 shadow-sm mt-0.5">
                {/* Crescent motif */}
                <div className="w-4 h-8 bg-[#F4F0E8] rounded-r-full -ml-4" />
              </div>
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-normal tracking-[-0.02em] text-[#171715]">
                  Your skin is allowed to change.
                </p>
                <p className="text-sm sm:text-base text-[#6D6A63] leading-relaxed">
                  We believe your skincare should understand that.
                </p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-[#171715]/80 max-w-xl font-normal leading-relaxed pt-2">
              Understand what your skin needs right now, then find the S.19 care designed around it.
            </p>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                id="hero-find-phase-btn"
                onClick={onStart}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#171715] text-[#F4F0E8] text-sm uppercase tracking-widest font-medium rounded-full hover:bg-[#2A2926] transition-all duration-200 shadow-sm cursor-pointer"
              >
                <span>Find my skin phase</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenChat}
                className="group inline-flex items-center justify-center gap-2.5 px-6 py-4 border border-[#C9C3B8] text-[#171715] text-sm uppercase tracking-wider font-medium rounded-full hover:border-[#171715] transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Ask S.19 AI</span>
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-[#6D6A63]" />
              </button>
            </div>

            {/* Micro details */}
            <div className="pt-6 border-t border-[#C9C3B8]/60 flex flex-wrap items-center gap-6 text-xs text-[#6D6A63]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51]" />
                <span>4 Adaptive Skin Phases</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51]" />
                <span>Deterministic Scoring</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C86D51]" />
                <span>Gemini-Powered Consultation</span>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Skincare Photography */}
          <div className="lg:col-span-5 relative">
            <div className="relative border border-[#C9C3B8] p-3 sm:p-4 bg-[#FAF8F4] shadow-sm">
              <div className="aspect-[4/3] lg:aspect-[3/4] overflow-hidden relative bg-[#EBE5DA]">
                <img
                  src={heroImg}
                  alt="Macro photography of authentic human skin"
                  className="w-full h-full object-cover grayscale-[15%] contrast-[105%] hover:scale-[1.02] transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171715]/40 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-4 left-4 right-4 text-[#F4F0E8] flex justify-between items-end">
                  <div className="text-[10px] tracking-[0.2em] uppercase font-medium">
                    S.19 Clinical Study
                  </div>
                  <div className="text-[10px] tracking-wider opacity-80">
                    Phase-Adaptive Equilibrium
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Secondary Story & Perspective Section (Inspired by reference screenshot) */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 items-start">
          <div className="md:col-span-5 space-y-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#6D6A63] font-medium block">
              THE PHILOSOPHY OF PHASES
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal text-[#171715] leading-snug tracking-[-0.03em]">
              Skin is not a static type. It is an evolving state.
            </h2>
          </div>

          <div className="md:col-span-7 space-y-6 text-[#6D6A63] text-sm sm:text-base leading-relaxed">
            <p>
              Traditional skincare categorizes you into permanent types—dry, oily, combination. Yet climate shifts, stress, hormones, and active routines continually reshape what your skin barrier requires.
            </p>
            <p>
              S.19 Skinlabs formulates around four precise phases: <strong className="text-[#171715]">Dehydration</strong>, <strong className="text-[#171715]">Oil Imbalance</strong>, <strong className="text-[#171715]">Uneven Tone</strong>, and <strong className="text-[#171715]">Recovery</strong>. By discerning your present phase, we eliminate guesswork and provide targeted active care or restorative rest.
            </p>

            <div className="pt-2">
              <button
                onClick={onStart}
                className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#171715] hover:text-[#C86D51] transition-colors group cursor-pointer"
              >
                <span>Begin your phase identification</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
