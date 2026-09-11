import React, { useState } from 'react';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';
import { ASSESSMENT_QUESTIONS } from '../data/questions';
import { SkinPhaseId } from '../types';

interface AssessmentProps {
  onComplete: (phaseId: SkinPhaseId, triggeredSafetyOverride: boolean) => void;
  onCancel: () => void;
}

export const Assessment: React.FC<AssessmentProps> = ({ onComplete, onCancel }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  const currentQuestion = ASSESSMENT_QUESTIONS[currentIndex];
  const selectedOptionId = selectedAnswers[currentQuestion.id];
  const isLastQuestion = currentIndex === ASSESSMENT_QUESTIONS.length - 1;

  const handleSelectOption = (optionId: string) => {
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestion.id]: optionId,
    };
    setSelectedAnswers(updatedAnswers);

    // Auto-advance immediately with a subtle tactile delay so selection is visible
    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        calculateAndFinish(updatedAnswers);
      }
    }, 220);
  };

  const handleNext = () => {
    if (!selectedOptionId) return;

    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      calculateAndFinish(selectedAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  const calculateAndFinish = (answersToScore: Record<number, string> = selectedAnswers) => {
    const scores: Record<SkinPhaseId, number> = {
      DEHYDRATION: 0,
      OIL_IMBALANCE: 0,
      UNEVEN_TONE: 0,
      RECOVERY: 0,
    };

    let safetyOverrideTriggered = false;

    // Iterate through all 8 answers
    ASSESSMENT_QUESTIONS.forEach((q) => {
      const chosenOptionId = answersToScore[q.id];
      const option = q.options.find((opt) => opt.id === chosenOptionId);

      if (option) {
        if (option.isSafetyOverride) {
          safetyOverrideTriggered = true;
        }

        if (option.scores) {
          (Object.keys(option.scores) as SkinPhaseId[]).forEach((phaseKey) => {
            const val = option.scores[phaseKey] || 0;
            scores[phaseKey] += val;
          });
        }
      }
    });

    // Section 8 Safety Override:
    // If acute irritation, burning, broken skin, bleeding, severe reaction, or recent procedure
    if (safetyOverrideTriggered) {
      onComplete('RECOVERY', true);
      return;
    }

    // Deterministic Highest Score Selection
    // Tie-break priority order: RECOVERY > DEHYDRATION > OIL_IMBALANCE > UNEVEN_TONE
    const phaseOrder: SkinPhaseId[] = ['RECOVERY', 'DEHYDRATION', 'OIL_IMBALANCE', 'UNEVEN_TONE'];
    let bestPhase: SkinPhaseId = 'DEHYDRATION';
    let highestScore = -1;

    phaseOrder.forEach((phase) => {
      const score = scores[phase];
      if (score > highestScore) {
        highestScore = score;
        bestPhase = phase;
      }
    });

    onComplete(bestPhase, false);
  };

  const progressPercentage = ((currentIndex + 1) / ASSESSMENT_QUESTIONS.length) * 100;

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16 min-h-[75vh] flex flex-col justify-between">
      
      {/* Top Bar: Back & Progress */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#6D6A63] hover:text-[#171715] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span>{currentIndex === 0 ? 'Exit assessment' : 'Previous question'}</span>
          </button>

          <span className="text-xs uppercase tracking-[0.2em] font-medium text-[#6D6A63]">
            S.19 CLINICAL ASSESSMENT
          </span>
        </div>

        {/* Minimal Hairline Progress Bar */}
        <div className="w-full bg-[#C9C3B8]/40 h-[2px] overflow-hidden rounded-full">
          <div
            className="bg-[#171715] h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Question Container (Distraction-free, NO IMAGES as requested) */}
      <div className="my-10 sm:my-14 space-y-8">
        
        {/* Step indicator: e.g. 01 / 08 */}
        <div>
          <span className="text-sm sm:text-base font-serif tracking-widest text-[#C86D51] font-medium block">
            {currentQuestion.numberStr}
          </span>
        </div>

        {/* Question Text */}
        <div className="space-y-3 max-w-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-[#171715] leading-[1.25] tracking-tight">
            {currentQuestion.question}
          </h2>
          {currentQuestion.subtitle && (
            <p className="text-sm sm:text-base text-[#6D6A63] leading-relaxed">
              {currentQuestion.subtitle}
            </p>
          )}
        </div>

        {/* Answer Choices List */}
        <div className="space-y-3 pt-2 max-w-2xl">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                className={`w-full text-left p-5 sm:p-6 border transition-all duration-200 cursor-pointer rounded-none flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-[#171715] bg-[#FAF8F4] text-[#171715] shadow-sm'
                    : 'border-[#C9C3B8] bg-transparent text-[#171715]/80 hover:border-[#171715]/60 hover:bg-[#FAF8F4]/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? 'border-[#171715] bg-[#171715]'
                        : 'border-[#C9C3B8]'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#F4F0E8]" />}
                  </div>
                  <span className="text-sm sm:text-base leading-snug font-normal">
                    {opt.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="pt-8 border-t border-[#C9C3B8]/60 flex items-center justify-between">
        <span className="text-xs text-[#6D6A63]">
          Select an option to advance automatically.
        </span>

        {selectedOptionId && (
          <button
            onClick={handleNext}
            className="group ml-auto inline-flex items-center gap-2 px-6 py-3 text-xs uppercase tracking-widest font-medium rounded-full bg-[#171715] text-[#F4F0E8] hover:bg-[#2A2926] shadow-sm transition-all cursor-pointer"
          >
            <span>{isLastQuestion ? 'Complete' : 'Next'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        )}
      </div>

    </div>
  );
};
