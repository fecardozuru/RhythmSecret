// Configurações musicais fundamentais — RhythmSecret

// --- TIMING ENGINE ---
export const LATENCY_COMPENSATION = 0.025; // 25ms compensação de hardware
export const LOOKAHEAD_TIME = 0.1;          // 100ms antecipação do scheduler
export const SCHEDULER_INTERVAL = 25;       // Frequência de varredura (ms)

// --- DIREÇÕES DE PROGRESSO DE BPM ---
export const BPM_PROGRESS_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  PING_PONG: 'pingpong'
};

// --- ATALHOS DE TECLADO (para exibição no modal) ---
export const KEYBOARD_GROUPS = [
  { name: 'Transporte & Geral', keys: ['Espaço', 'Esc', '/'], description: 'Espaço: Play/Pause, Esc: Stop/Reset, /: Atalhos' },
  { name: 'Modos de Reprodução', keys: ['E', 'D', 'S', 'F'], description: 'E: Auto ↑, D: Auto ↓, S: Manual, F: Auto Loop' },
  { name: 'Subdivisões', keys: ['1-9', '0', '-', '='], description: '1-9: 1-9, 0:10, -:11, =:12' },
  { name: 'Controle de BPM', keys: ['Q', 'W', 'R', 'T'], description: 'Q: -BPM, W: +BPM, R: Reset (120), T: Fixar Target BPM' },
  { name: 'PRO Features', keys: ['Z', 'X', 'C', 'V'], description: 'Z: Permutação, X: Gap, C: Ghost, V: Auto BPM' },
  { name: 'Mixer de Volume', keys: ['A-L', ';'], description: 'A a L para notas 1-12, ; para resetar volumes' },
  { name: 'Menus & Compasso', keys: ['P', 'M', 'K', '.', ',', 'Setas ↑/↓'], description: 'P: Tema, M: Compasso, K: Modo App, .: Salvar, ,: Passo BPM' },
  { name: 'Presets Rápidos', keys: ['Shift+1-3', 'Ctrl+1-3'], description: 'Shift+Num: Carregar, Ctrl+Num: Salvar' }
];

// --- NOMES DAS SUBDIVISÕES ---
export const SUBDIVISIONS_DESC = [
  'Semínima', 'Colcheias', 'Tercina', 'Semicolcheias',
  'Quintina', 'Sextina', 'Septina', 'Fusas', 'Nonina',
  'Décima', 'Onzena', 'Duodécima'
];

// --- SUBDIVISÕES DISPONÍVEIS (1-12) ---
export const SUBDIVISIONS = [
  { value: 1,  label: 'Semínima (Quarter)' },
  { value: 2,  label: 'Colcheias (Eighths)' },
  { value: 3,  label: 'Tercina (Triplet)' },
  { value: 4,  label: 'Semicolcheias (16th)' },
  { value: 5,  label: 'Quintina (Quintuplet)' },
  { value: 6,  label: 'Sextina (Sextuplet)' },
  { value: 7,  label: 'Septina (Septuplet)' },
  { value: 8,  label: 'Fusas (32nd)' },
  { value: 9,  label: 'Nonina (Nonuplet)' },
  { value: 10, label: 'Décima (10th)' },
  { value: 11, label: 'Onzena (11th)' },
  { value: 12, label: 'Duodécima (12th)' },
];

// --- COMPASSOS ---
export const TIME_SIGNATURES = [
  { num: 4,  den: 4, name: '4/4 Comum' },
  { num: 3,  den: 4, name: '3/4 Valsa' },
  { num: 2,  den: 4, name: '2/4 Marcha' },
  { num: 6,  den: 8, name: '6/8 Composto' },
  { num: 2,  den: 2, name: '2/2 Alla Breve' },
  { num: 3,  den: 8, name: '3/8 Scherzo' },
  { num: 9,  den: 8, name: '9/8 Composto' },
  { num: 12, den: 8, name: '12/8 Blues' },
  { num: 5,  den: 4, name: '5/4 Dave' },
  { num: 7,  den: 8, name: '7/8 Money' },
];

// --- MARCAS DE TEMPO ---
export const TEMPO_MARKINGS = [
  { limit: 40,  label: 'Grave' },
  { limit: 60,  label: 'Largo' },
  { limit: 66,  label: 'Larghetto' },
  { limit: 76,  label: 'Adagio' },
  { limit: 108, label: 'Andante' },
  { limit: 120, label: 'Moderato' },
  { limit: 168, label: 'Allegro' },
  { limit: 200, label: 'Vivace' },
  { limit: 208, label: 'Presto' },
  { limit: 999, label: 'Prestissimo' },
];

// --- CONTROLES ---
export const BPM_STEPS = [1, 5, 10, 15, 20, 25, 30];
export const VOLUME_VALUES = { 0: 0, 1: 0.3, 2: 0.6, 3: 1.0 };
export const LOOP_BAR_OPTIONS = [1, 2, 4, 8];

// --- FUNÇÕES UTILITÁRIAS ---
export const getTempoMarking = (bpm) =>
  TEMPO_MARKINGS.find(t => bpm <= t.limit)?.label || 'Prestissimo';

export const createGroovePattern = (count) => {
  const arr = new Array(count).fill(1);
  arr[0] = 3;
  return arr;
};

// Simplificado: apenas o downbeat (beat 0) tem freq alta
export const getAccentWeight = (beatIndex) => {
  if (beatIndex === 0) return 1760;
  return 440;
};
