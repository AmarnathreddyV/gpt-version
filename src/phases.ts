import { SkinPhase, SkinPhaseId } from '../types';

import dehydrationImg from '../assets/images/dehydration_skin_1789106853294.jpg';
import oilImg from '../assets/images/oil_imbalance_skin_1789106865363.jpg';
import toneImg from '../assets/images/uneven_tone_skin_1789106877838.jpg';
import recoveryImg from '../assets/images/recovery_skin_1789106891572.jpg';
import heroImg from '../assets/images/hero_skin_1789106833772.jpg';

export { heroImg };

export const SKIN_PHASES: Record<SkinPhaseId, SkinPhase> = {
  DEHYDRATION: {
    id: 'DEHYDRATION',
    phaseNumber: 1,
    title: 'THE DEHYDRATION PHASE',
    shortName: 'Dehydration',
    description: 'Skin may feel dry, tight or uncomfortable and may need more comfortable hydration.',
    summary: 'Your skin is currently showing signs of moisture depletion, tightness, and diminished suppleness.',
    recommendedProduct: 'Hydrating Capsule Cream',
    whyItMatches: 'Engineered specifically for moisture-depleted barriers. Delivers multi-depth humectants that bind vital moisture deep within skin layers without heaviness or irritation.',
    heroActives: [
      { name: '13D Hyaluronic Acid', percentage: '5%', purpose: 'Multi-depth cellular hydration' },
      { name: 'Hydroviton', percentage: '2%', purpose: 'Advanced natural moisturizing factor' },
      { name: 'Pentavitin', percentage: '2%', purpose: 'Deep 72-hour moisture reservoir' },
    ],
    image: dehydrationImg,
    isRecovery: false,
  },
  OIL_IMBALANCE: {
    id: 'OIL_IMBALANCE',
    phaseNumber: 2,
    title: 'THE OIL IMBALANCE PHASE',
    shortName: 'Oil Imbalance',
    description: 'Skin may experience excess oiliness or visible shine.',
    summary: 'Your skin is currently showing signs of excess oiliness, midday shine, or congested pores.',
    recommendedProduct: 'Sebum Control Capsule Cream',
    whyItMatches: 'Formulated to restore lipid equilibrium. Features timed-release encapsulated actives that moderate sebum production and refine pore clarity while preserving moisture.',
    heroActives: [
      { name: 'Encapsulated Salicylic Acid', percentage: '3%', purpose: 'Gentle, timed pore clarification' },
      { name: 'Tranexamic Acid', percentage: '2%', purpose: 'Post-blemish tone clarity' },
      { name: 'Sebum Control Complex', percentage: '0.5%', purpose: 'Balanced surface sebum regulation' },
    ],
    image: oilImg,
    isRecovery: false,
  },
  UNEVEN_TONE: {
    id: 'UNEVEN_TONE',
    phaseNumber: 3,
    title: 'THE UNEVEN TONE PHASE',
    shortName: 'Uneven Tone',
    description: 'Skin may show an uneven-looking tone or visible marks.',
    summary: 'Your skin is currently showing signs of localized pigmentation, lingering marks, or surface tone variance.',
    recommendedProduct: 'TXA + NIA Capsule Cream',
    whyItMatches: 'Targeted care for visible marks and irregular pigmentation. Combines synergistic brightening actives and rejuvenating cellular factors to restore radiant, even-toned clarity.',
    heroActives: [
      { name: 'Tranexamic Acid', percentage: '4%', purpose: 'Discoloration and dark spot reduction' },
      { name: 'Niacinamide', percentage: '2%', purpose: 'Tone uniformity and barrier support' },
      { name: 'Rose PDRN', percentage: '2%', purpose: 'Botanical cellular revitalization' },
    ],
    image: toneImg,
    isRecovery: false,
  },
  RECOVERY: {
    id: 'RECOVERY',
    phaseNumber: 4,
    title: 'THE RECOVERY PHASE',
    shortName: 'Recovery',
    description: 'A care-first phase for skin experiencing irritation, sensitivity or needing a pause from active recommendations.',
    summary: 'Your skin barrier requires a restful, calming pause. Active treatment creams are paused in favor of barrier equilibrium.',
    recommendedProduct: 'Care-First Barrier Pause',
    whyItMatches: 'When skin exhibits heightened reactivity, burning, or post-procedure stress, active botanical and exfoliating treatments must yield to rest. S.19 prioritizes barrier restoration above all.',
    heroActives: [
      { name: 'Barrier Rest Protocol', percentage: '100%', purpose: 'Zero harsh actives or irritants' },
      { name: 'Gentle Calming Care', percentage: 'Care-First', purpose: 'Restorative barrier stabilization' },
    ],
    careGuidance: 'Pause all active exfoliating acids, retinoids, and intensive treatments. Focus on lukewarm water, a gentle non-stripping cleanser, and barrier-soothing rest until equilibrium is restored.',
    image: recoveryImg,
    isRecovery: true,
  },
};

export const PHASES_LIST = [
  SKIN_PHASES.DEHYDRATION,
  SKIN_PHASES.OIL_IMBALANCE,
  SKIN_PHASES.UNEVEN_TONE,
  SKIN_PHASES.RECOVERY,
];
