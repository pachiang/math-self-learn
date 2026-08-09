import type {
  AlgebraV2Choice,
  AlgebraV2Lesson,
  AlgebraV2ModelKind,
  AlgebraV2Node,
  AlgebraV2Preset,
} from './algebra-v2-lessons';

export interface AlgebraV2LessonSeed {
  id: string;
  title: string;
  lede: string;
  predict: [question: string, yesCorrect: boolean, yesFeedback: string, noFeedback: string];
  kind: AlgebraV2ModelKind;
  modelTitle: string;
  prompt: string;
  presets: AlgebraV2Preset[];
  insight: string;
  transfer: [question: string, yesCorrect: boolean, yesFeedback: string, noFeedback: string];
  formal: [title: string, body: string, notation?: string];
  proof: [title: string, goal: string, ...steps: string[]];
  boundary: string;
}

const yesNo = (correct: boolean, yes: string, no: string): AlgebraV2Choice[] => [
  { label: '是', correct, feedback: yes },
  { label: '不是', correct: !correct, feedback: no },
];

export const makeLesson = (seed: AlgebraV2LessonSeed): AlgebraV2Lesson => ({
  id: seed.id,
  eyebrow: `Abstract Algebra v2 · ${seed.id}`,
  title: seed.title,
  lede: seed.lede,
  prediction: {
    question: seed.predict[0],
    choices: yesNo(seed.predict[1], seed.predict[2], seed.predict[3]),
  },
  model: {
    kind: seed.kind,
    eyebrow: 'Structure explorer',
    title: seed.modelTitle,
    prompt: seed.prompt,
    presets: seed.presets,
  },
  insight: seed.insight,
  transfer: {
    question: seed.transfer[0],
    choices: yesNo(seed.transfer[1], seed.transfer[2], seed.transfer[3]),
  },
  formal: { title: seed.formal[0], body: seed.formal[1], notation: seed.formal[2] },
  proof: { title: seed.proof[0], goal: seed.proof[1], steps: seed.proof.slice(2) },
  boundary: seed.boundary,
});

export const networkNodes = (labels: string[], active: string[], origin = 'e'): AlgebraV2Node[] =>
  labels.map((label) => ({
    label,
    state: label === origin ? 'origin' : active.includes(label) ? 'active' : 'dim',
  }));

export const check = (label: string, pass: boolean, reason: string) => ({ label, pass, reason });
