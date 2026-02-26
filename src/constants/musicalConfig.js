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

// Formato de objeto indexado para compatibilidade com componentes/hook
export const TIME_SIGNATURES = {
  '2/2': { numerator: 2, denominator: 2, name: '2/2 Alla Breve' },
  '2/4': { numerator: 2, denominator: 4, name: '2/4 Marcha' },
  '3/4': { numerator: 3, denominator: 4, name: '3/4 Valsa' },
  '4/4': { numerator: 4, denominator: 4, name: '4/4 Comum' },
  '5/4': { numerator: 5, denominator: 4, name: '5/4 Dave' },
  '3/8': { numerator: 3, denominator: 8, name: '3/8 Scherzo' },
  '6/8': { numerator: 6, denominator: 8, name: '6/8 Composto' },
  '7/8': { numerator: 7, denominator: 8, name: '7/8 Money' },
  '9/8': { numerator: 9, denominator: 8, name: '9/8 Composto' },
  '12/8': { numerator: 12, denominator: 8, name: '12/8 Blues' },
};

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
  PRO: { id: 'PRO', label: 'PRO Maestro', icon: 'Crown' }
};

export const BPM_STEPS = [1, 5, 10, 15, 20, 25, 30];
export const LOOP_BAR_OPTIONS = [1, 2, 4, 8];
export const VOLUME_VALUES = { 0: 0, 1: 0.3, 2: 0.6, 3: 1.0 };
export const LATENCY_COMPENSATION = 0.025;
export const LOOKAHEAD_TIME = 0.1;

export const BPM_RANGE = {
  MIN: 30,
  MAX: 300,
  DEFAULT: 60
};

export const getTempoMarking = (bpm) => TEMPO_MARKINGS.find(t => bpm <= t.limit)?.label || 'Prestissimo';

export const createGroovePattern = (count) => {
  const arr = new Array(count).fill(1);
  arr[0] = 3;
  return arr;
};

export const getAccentWeight = (beatIndex, timeSig = TIME_SIGNATURES['4/4']) => {
  const { numerator, denominator } = timeSig;

  if (beatIndex === 0) return 1760;
  if (denominator === 8 && numerator % 3 === 0 && beatIndex % 3 === 0) return 1320;
  if (numerator === 2 && denominator === 2) return 880;
  if (numerator === 4 && denominator === 4 && beatIndex === 2) return 1100;

  return 880;
};

export const PLAY_MODES = {
  MANUAL: 'MANUAL',
  AUTO_UP: 'AUTO_UP',
  AUTO_DOWN: 'AUTO_DOWN'
};

export const PRESET_SLOTS = [1, 2, 3];
