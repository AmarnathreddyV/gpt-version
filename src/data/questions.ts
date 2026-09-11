import { AssessmentQuestion } from '../types';

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 1,
    numberStr: '01 / 08',
    question: 'How does your skin usually feel immediately after cleansing?',
    subtitle: 'Observe your sensation before applying any toner, essence, or moisturizer.',
    options: [
      {
        id: '1a',
        label: 'Tight, parched, or noticeably uncomfortable',
        scores: { DEHYDRATION: 3 },
      },
      {
        id: '1b',
        label: 'Comfortable, supple, and generally balanced',
        scores: { UNEVEN_TONE: 1, OIL_IMBALANCE: 1 },
      },
      {
        id: '1c',
        label: 'Oily, slick, or shiny within an hour of washing',
        scores: { OIL_IMBALANCE: 3 },
      },
      {
        id: '1d',
        label: 'Sensitive, stinging, or flushed and irritated',
        scores: { RECOVERY: 4 },
      },
    ],
  },
  {
    id: 2,
    numberStr: '02 / 08',
    question: 'By midday, how does your complexion look across your forehead, nose, and chin?',
    subtitle: 'Notice the visual finish under standard indoor or outdoor lighting.',
    options: [
      {
        id: '2a',
        label: 'Dry, dull, or showing fine dehydration lines',
        scores: { DEHYDRATION: 3 },
      },
      {
        id: '2b',
        label: 'Noticeable excess oiliness and visible shine',
        scores: { OIL_IMBALANCE: 3 },
      },
      {
        id: '2c',
        label: 'Balanced in oil, but with noticeable tonal dullness or marks',
        scores: { UNEVEN_TONE: 3 },
      },
      {
        id: '2d',
        label: 'Prone to sudden redness, burning, or uncomfortable warmth',
        scores: { RECOVERY: 3 },
      },
    ],
  },
  {
    id: 3,
    numberStr: '03 / 08',
    question: 'When examining your skin in clear daylight, what is your most visible observation?',
    subtitle: 'Look closely at surface texture and color uniformity.',
    options: [
      {
        id: '3a',
        label: 'Rough, thirsty texture lacking natural bounce and fullness',
        scores: { DEHYDRATION: 3 },
      },
      {
        id: '3b',
        label: 'Enlarged-looking pores and persistent sebum buildup',
        scores: { OIL_IMBALANCE: 3 },
      },
      {
        id: '3c',
        label: 'Uneven tone, sun freckling, or lingering post-blemish spots',
        scores: { UNEVEN_TONE: 4 },
      },
      {
        id: '3d',
        label: 'Fragile surface with reactive pink patches or tenderness',
        scores: { RECOVERY: 3 },
      },
    ],
  },
  {
    id: 4,
    numberStr: '04 / 08',
    question: 'How does your skin respond when you introduce active serums or new treatments?',
    subtitle: 'Think about past experiences with potent formulations.',
    options: [
      {
        id: '4a',
        label: 'Drinks in hydration eagerly without reacting',
        scores: { DEHYDRATION: 3 },
      },
      {
        id: '4b',
        label: 'Becomes greasy or easily congested if the texture is rich',
        scores: { OIL_IMBALANCE: 3 },
      },
      {
        id: '4c',
        label: 'Tolerates actives well, but stubborn marks take months to fade',
        scores: { UNEVEN_TONE: 3 },
      },
      {
        id: '4d',
        label: 'Stings easily, turns blotchy, or reacts uncomfortably',
        scores: { RECOVERY: 4 },
      },
    ],
  },
  {
    id: 5,
    numberStr: '05 / 08',
    question: 'How would you describe the behavior of your pores throughout the week?',
    subtitle: 'Consider their visibility and congestion patterns.',
    options: [
      {
        id: '5a',
        label: 'Very small or tight, but surface skin feels papery or dry',
        scores: { DEHYDRATION: 3 },
      },
      {
        id: '5b',
        label: 'Prominent, prone to clogging, and actively producing oil',
        scores: { OIL_IMBALANCE: 4 },
      },
      {
        id: '5c',
        label: 'Normal pore size, with visible pigmentation around the cheeks or brow',
        scores: { UNEVEN_TONE: 3 },
      },
      {
        id: '5d',
        label: 'Irritated, tender to the touch, or inflamed',
        scores: { RECOVERY: 3 },
      },
    ],
  },
  {
    id: 6,
    numberStr: '06 / 08',
    question: 'How does your skin react to changing environments, such as air conditioning or seasonal shifts?',
    subtitle: 'Notice the immediate change in skin comfort.',
    options: [
      {
        id: '6a',
        label: 'Immediate, acute tightness and parched sensation',
        scores: { DEHYDRATION: 4 },
      },
      {
        id: '6b',
        label: 'Skin quickly overcompensates with excessive midday shine',
        scores: { OIL_IMBALANCE: 3, DEHYDRATION: 1 },
      },
      {
        id: '6c',
        label: 'Exposure to sunlight quickly intensifies dark spots and marks',
        scores: { UNEVEN_TONE: 4 },
      },
      {
        id: '6d',
        label: 'Becomes itchy, inflamed, or noticeably compromised',
        scores: { RECOVERY: 3 },
      },
    ],
  },
  {
    id: 7,
    numberStr: '07 / 08',
    question: 'What is your primary skincare objective at this moment?',
    subtitle: 'Choose the focus that matters most to your skin right now.',
    options: [
      {
        id: '7a',
        label: 'Infusing deep, lasting hydration and restoring suppleness',
        scores: { DEHYDRATION: 4 },
      },
      {
        id: '7b',
        label: 'Controlling excess sebum, shine, and refining pore clarity',
        scores: { OIL_IMBALANCE: 4 },
      },
      {
        id: '7c',
        label: 'Fading dark spots, clarifying tone, and brightening marks',
        scores: { UNEVEN_TONE: 4 },
      },
      {
        id: '7d',
        label: 'Calming skin discomfort and letting my barrier rest and reset',
        scores: { RECOVERY: 4 },
      },
    ],
  },
  {
    id: 8,
    numberStr: '08 / 08',
    question: 'Is your skin currently experiencing any acute distress or recent procedures?',
    subtitle: 'Our safety protocol ensures gentle, non-reactive care above all.',
    options: [
      {
        id: '8a',
        label: 'No current acute distress; my skin feels stable',
        scores: { DEHYDRATION: 1, OIL_IMBALANCE: 1, UNEVEN_TONE: 1 },
      },
      {
        id: '8b',
        label: 'Surface dehydration or tightness, but no burning or broken skin',
        scores: { DEHYDRATION: 2 },
      },
      {
        id: '8c',
        label: 'Noticeable congestion or persistent shine, but not painful',
        scores: { OIL_IMBALANCE: 2 },
      },
      {
        id: '8d',
        label: 'Burning, stinging, broken skin, severe irritation, or recent chemical peel/laser procedure',
        scores: { RECOVERY: 10 },
        isSafetyOverride: true,
      },
    ],
  },
];
