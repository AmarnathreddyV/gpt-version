import React from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { PHASES_LIST } from '../data/phases';
import { SkinPhaseId } from '../types';

interface VisualPhasePickerProps {
  onSelectPhase: (phaseId: SkinPhaseId) => void;
  onBack: () => void;
}

export const VisualPhasePicker: React.FC<VisualPhasePickerProps> = ({
  onSelectPhase,
  onBack,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 lg:py-20">
      {/* Back button */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D6A63] hover:text-[#171715] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to selection</span>
        </button>
      </div>

      {/* Editorial Header */}
      <div className="max-w-3xl space-y-3 mb-12 sm:mb-16">
        <span className="text-[11px] uppercase tracking-[0.2em] text-[#6D6A63] font-medium block">
          PATH B &bull; VISUAL IDENTIFICATION
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#171715] tracking-[-0.035em] leading-tight">
          Select your current skin phase.
        </h1>
        <p className="text-base sm:text-lg text-[#6D6A63] leading-relaxed">
          Examine the four close-up skin states below. Choose the phase that visually and sensorially matches your skin at this moment.
        </p>
      </div>

      {/* Four Large Realistic Skin Images Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
        {PHASES_LIST.map((phase) => (
          <div
            key={phase.id}
            id={`phase-card-${phase.id.toLowerCase()}`}
            className="group border border-[#C9C3B8] bg-[#FAF8F4] flex flex-col justify-between hover:border-[#171715] transition-all duration-300 shadow-sm overflow-hidden"
          >
            {/* Image Container */}
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#EBE5DA] relative border-b border-[#C9C3B8]">
              <img
                src={phase.image}
                alt={phase.title}
                className="w-full h-full object-cover grayscale-[10%] group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 left-4 bg-[#171715]/85 text-[#F4F0E8] text-[10px] uppercase tracking-[0.2em] px-2.5 py-1 backdrop-blur-xs">
                PHASE 0{phase.phaseNumber}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-medium text-[#171715] tracking-[-0.03em]">
                  {phase.title}
                </h3>
                <p className="text-sm text-[#6D6A63] leading-relaxed">
                  {phase.description}
                </p>
              </div>

              <div className="pt-6 border-t border-[#C9C3B8]/60 flex items-center justify-between">
                <div className="text-xs text-[#171715] font-medium">
                  {phase.isRecovery ? (
                    <span className="text-[#C86D51]">Care-First Protocol</span>
                  ) : (
                    <span>Formulation: {phase.recommendedProduct}</span>
                  )}
                </div>

                <button
                  onClick={() => onSelectPhase(phase.id)}
                  className="group/btn inline-flex items-center gap-2 px-5 py-2.5 bg-[#171715] text-[#F4F0E8] text-xs uppercase tracking-widest font-medium rounded-full hover:bg-[#2A2926] transition-colors cursor-pointer"
                >
                  <span>Select</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
