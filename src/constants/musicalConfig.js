// Configurações musicais fundamentais - Ritmo, Subdivisões, Compassos

export const SUBDIVISIONS = [
  { value: 1, label: 'Semínima (Quarter)' },
  { value: 2, label: 'Colcheias (Eighths)' },
  { value: 3, label: 'Tercina (Triplet)' },
  { value: 4, label: 'Semicolcheias (16th)' },
  { value: 5, label: 'Quintina (Quintuplet)' },
  { value: 6, label: 'Sextina (Sextuplet)' },
  { value: 7, label: 'Septina (Septuplet)' },
  { value: 8, label: 'Fusas (32nd)' },
  { value: 9, label: 'Nonina (Nonuplet)' },
];

export const SUBDIVISION_OPTIONS = SUBDIVISIONS;

const signatures = [
  { num: 4, den: 4, numerator: 4, denominator: 4, name: '4/4 Comum' },
  { num: 3, den: 4, numerator: 3, denominator: 4, name: '3/4 Valsa' },
  { num: 2, den: 4, numerator: 2, denominator: 4, name: '2/4 Marcha' },
  { num: 6, den: 8, numerator: 6, denominator: 8, name: '6/8 Composto' },
  { num: 2, den: 2, numerator: 2, denominator: 2, name: '2/2 Alla Breve' },
  { num: 3, den: 8, numerator: 3, denominator: 8, name: '3/8 Scherzo' },
  { num: 9, den: 8, numerator: 9, denominator: 8, name: '9/8 Composto' },
  { num: 12, den: 8, numerator: 12, denominator: 8, name: '12/8 Blues' },
  { num: 5, den: 4, numerator: 5, denominator: 4, name: '5/4 Dave' },
  { num: 7, den: 8, numerator: 7, denominator: 8, name: '7/8 Money' },
];

export const TIME_SIGNATURES = signatures;
for (const sig of signatures) {
  TIME_SIGNATURES[`${sig.num}/${sig.den}`] = sig;
}

export const COMMON_TIME_SIGNATURES = ['4/4', '3/4', '2/4', '6/8'];

export const TEMPO_MARKINGS = [
  { limit: 40, label: 'Grave' },
  { limit: 60, label: 'Largo' },
  { limit: 66, label: 'Larghetto' },
  { limit: 76, label: 'Adagio' },
  { limit: 108, label: 'Andante' },
  { limit: 120, label: 'Moderato' },
  { limit: 168, label: 'Allegro' },
  { limit: 200, label: 'Vivace' },
  { limit: 208, label: 'Presto' },
  { limit: 999, label: 'Prestissimo' },
];

export const APP_MODES = {
  BEGINNER: { id: 'BEGINNER', label: 'Iniciante', icon: 'GraduationCap' },
  ADVANCED: { id: 'ADVANCED', label: 'Avançado', icon: 'Settings' },
  PRO: { id: 'PRO', label: 'PRO Maestro', icon: 'Crown' },
};

export const BPM_STEPS = [1, 5, 10, 15, 20, 25, 30];
export const LOOP_BAR_OPTIONS = [1, 2, 4, 8];
export const VOLUME_VALUES = { 0: 0, 1: 0.3, 2: 0.6, 3: 1.0 };

export const LATENCY_COMPENSATION = 0.025;
export const LOOKAHEAD_TIME = 0.1;

export const BPM_RANGE = {
  MIN: 30,
  MAX: 300,
  DEFAULT: 60,
};

export const getTempoMarking = (bpm) => TEMPO_MARKINGS.find((t) => bpm <= t.limit)?.label || 'Prestissimo';

export const createGroovePattern = (count) => {
  const arr = new Array(count).fill(1);
  arr[0] = 3;
  return arr;
};

export const getAccentWeight = (beatIndex, timeSig) => {
  const num = timeSig?.num ?? timeSig?.numerator ?? 4;
  const den = timeSig?.den ?? timeSig?.denominator ?? 4;

  if (beatIndex === 0) return 1760;

  if (den === 8 && num % 3 === 0 && beatIndex % 3 === 0) {
    return 1320;
  }

  if (num === 2 && den === 2) return 880;
  if (num === 4 && den === 4 && beatIndex === 2) return 1100;

  return 880;
};

export const PLAY_MODES = {
  MANUAL: 'MANUAL',
  AUTO_UP: 'AUTO_UP',
  AUTO_DOWN: 'AUTO_DOWN',
};

export const PRESET_SLOTS = [1, 2, 3];
