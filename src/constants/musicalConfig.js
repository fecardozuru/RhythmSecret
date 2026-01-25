// Configurações musicais fundamentais - Rítmo, Subdivisões, Compassos

// Subdivisões rítmicas disponíveis (1-9)
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

// Compassos disponíveis
export const TIME_SIGNATURES = [
  { num: 4, den: 4, name: '4/4 Comum' },
  { num: 3, den: 4, name: '3/4 Valsa' },
  { num: 2, den: 4, name: '2/4 Marcha' },
  { num: 6, den: 8, name: '6/8 Composto' },
  { num: 2, den: 2, name: '2/2 Alla Breve' },
  { num: 3, den: 8, name: '3/8 Scherzo' },
  { num: 9, den: 8, name: '9/8 Composto' },
  { num: 12, den: 8, name: '12/8 Blues' },
  { num: 5, den: 4, name: '5/4 Dave' },
  { num: 7, den: 8, name: '7/8 Money' },
];

// Marcas de tempo tradicionais
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

// Modos de operação do aplicativo
export const APP_MODES = {
  BEGINNER: { id: 'BEGINNER', label: 'Iniciante', icon: 'GraduationCap' },
  ADVANCED: { id: 'ADVANCED', label: 'Avançado', icon: 'Settings' },
  PRO: { id: 'PRO', label: 'PRO Maestro', icon: 'Crown' }
};

// Passos de ajuste de BPM disponíveis
export const BPM_STEPS = [1, 5, 10, 15, 20, 25, 30];

// Opções de loop (compassos por ciclo)
export const LOOP_BAR_OPTIONS = [1, 2, 4, 8];

// Valores de volume para notas (0=mudo, 3=máximo)
export const VOLUME_VALUES = { 0: 0, 1: 0.3, 2: 0.6, 3: 1.0 };

// Configurações de latência e timing
export const LATENCY_COMPENSATION = 0.025; // 25ms compensação
export const LOOKAHEAD_TIME = 0.1; // 100ms lookahead

// Range de BPM permitido
export const BPM_RANGE = {
  MIN: 30,
  MAX: 300,
  DEFAULT: 60
};

// Função auxiliar: obtém marca de tempo baseada no BPM
export const getTempoMarking = (bpm) => {
  return TEMPO_MARKINGS.find(t => bpm <= t.limit)?.label || 'Prestissimo';
};

// Função auxiliar: cria padrão de groove inicial
export const createGroovePattern = (count) => {
  const arr = new Array(count).fill(1);
  arr[0] = 3; // Primeira nota mais forte
  return arr;
};

// Função auxiliar: determina peso/altura do acento baseado no compasso
export const getAccentWeight = (beatIndex, timeSig) => {
  const { num, den } = timeSig;
  
  // Primeiro tempo sempre mais forte
  if (beatIndex === 0) return 1760; 
  
  // Compassos compostos (6/8, 9/8, 12/8) - acento a cada 3
  if (den === 8 && num % 3 === 0) {
    if (beatIndex % 3 === 0) return 1320; 
  }
  
  // Alla breve (2/2) - acento mais suave
  if (num === 2 && den === 2) return 880; 
  
  // 4/4 - terceiro tempo (backbeat) ligeiramente mais forte
  if (num === 4 && den === 4 && beatIndex === 2) return 1100;
  
  // Demais tempos - volume padrão
  return 880; 
};

// Configurações de reprodução
export const PLAY_MODES = {
  MANUAL: 'MANUAL',
  AUTO_UP: 'AUTO_UP', 
  AUTO_DOWN: 'AUTO_DOWN'
};

// Número de slots de presets
export const PRESET_SLOTS = [1, 2, 3];
