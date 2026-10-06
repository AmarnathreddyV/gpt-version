export type SkinPhaseId = 'DEHYDRATION' | 'OIL_IMBALANCE' | 'UNEVEN_TONE' | 'RECOVERY';

export interface HeroActive {
  name: string;
  percentage?: string;
  purpose?: string;
}

export interface SkinPhase {
  id: SkinPhaseId;
  phaseNumber: number;
  title: string;
  shortName: string;
  description: string;
  summary: string;
  recommendedProduct: string;
  whyItMatches: string;
  heroActives: HeroActive[];
  image: string;
  careGuidance?: string;
  isRecovery?: boolean;
}

export interface AssessmentOption {
  id: string;
  label: string;
  scores: Partial<Record<SkinPhaseId, number>>;
  isSafetyOverride?: boolean;
}

export interface AssessmentQuestion {
  id: number;
  numberStr: string;
  question: string;
  subtitle?: string;
  options: AssessmentOption[];
}

export interface StoredSessionContext {
  phase: SkinPhaseId;
  phaseName: string;
  product: string;
  timestamp?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}
