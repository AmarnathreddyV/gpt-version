import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { PhaseSelector } from './components/PhaseSelector';
import { Assessment } from './components/Assessment';
import { VisualPhasePicker } from './components/VisualPhasePicker';
import { ResultPage } from './components/ResultPage';
import { ChatAssistant } from './components/ChatAssistant';
import { SkinPhaseId, StoredSessionContext } from './types';
import { SKIN_PHASES } from './data/phases';

export default function App() {
  // Navigation state: '/', '/find-phase', '/assessment', '/visual-picker', '/result', '/chat'
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (['/', '/find-phase', '/assessment', '/visual-picker', '/result', '/chat'].includes(hash)) {
        return hash;
      }
    }
    return '/';
  });

  const [activePhaseId, setActivePhaseId] = useState<SkinPhaseId | null>(() => {
    try {
      const stored = sessionStorage.getItem('s19_phase_context') || localStorage.getItem('s19_phase_context');
      if (stored) {
        const parsed: StoredSessionContext = JSON.parse(stored);
        if (parsed.phase && SKIN_PHASES[parsed.phase]) {
          return parsed.phase;
        }
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isSafetyOverride, setIsSafetyOverride] = useState<boolean>(false);

  // Sync route with window hash for intuitive browser navigation
  const navigate = (route: string) => {
    setCurrentRoute(route);
    if (typeof window !== 'undefined') {
      window.location.hash = route;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && ['/', '/find-phase', '/assessment', '/visual-picker', '/result', '/chat'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Save session context whenever phase changes
  const savePhaseSession = (phaseId: SkinPhaseId, triggeredSafety: boolean = false) => {
    const phase = SKIN_PHASES[phaseId];
    if (!phase) return;

    setActivePhaseId(phaseId);
    setIsSafetyOverride(triggeredSafety);

    const contextData: StoredSessionContext = {
      phase: phase.id,
      phaseName: phase.title,
      product: phase.recommendedProduct,
      timestamp: Date.now(),
    };

    try {
      sessionStorage.setItem('s19_phase_context', JSON.stringify(contextData));
      localStorage.setItem('s19_phase_context', JSON.stringify(contextData));
    } catch (e) {
      console.warn('Could not persist session context', e);
    }
  };

  // Path A completion (from 8 questions)
  const handleAssessmentComplete = (phaseId: SkinPhaseId, triggeredSafety: boolean) => {
    savePhaseSession(phaseId, triggeredSafety);
    navigate('/result');
  };

  // Path B completion (from visual selection)
  const handleVisualSelectPhase = (phaseId: SkinPhaseId) => {
    savePhaseSession(phaseId, false);
    navigate('/result');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E8] text-[#171715]">
      {/* Editorial Header */}
      <Header
        currentRoute={currentRoute}
        navigate={navigate}
        hasActiveSession={Boolean(activePhaseId)}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {currentRoute === '/' && (
          <Hero
            onStart={() => navigate('/find-phase')}
            onOpenChat={() => navigate('/chat')}
          />
        )}

        {currentRoute === '/find-phase' && (
          <PhaseSelector
            onSelectPathA={() => navigate('/assessment')}
            onSelectPathB={() => navigate('/visual-picker')}
            onBack={() => navigate('/')}
          />
        )}

        {currentRoute === '/assessment' && (
          <Assessment
            onComplete={handleAssessmentComplete}
            onCancel={() => navigate('/find-phase')}
          />
        )}

        {currentRoute === '/visual-picker' && (
          <VisualPhasePicker
            onSelectPhase={handleVisualSelectPhase}
            onBack={() => navigate('/find-phase')}
          />
        )}

        {currentRoute === '/result' && (
          <ResultPage
            phaseId={activePhaseId || 'DEHYDRATION'}
            isSafetyOverride={isSafetyOverride}
            onAskAI={() => navigate('/chat')}
            onRetake={() => navigate('/assessment')}
            onViewAllPhases={() => navigate('/visual-picker')}
          />
        )}

        {currentRoute === '/chat' && (
          <ChatAssistant
            currentPhaseId={activePhaseId}
            onBack={() => {
              if (activePhaseId) {
                navigate('/result');
              } else {
                navigate('/');
              }
            }}
            onNavigateToFinder={() => navigate('/find-phase')}
          />
        )}
      </main>

      {/* Minimal Editorial Footer */}
      <Footer navigate={navigate} />
    </div>
  );
}
