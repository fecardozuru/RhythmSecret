// /src/constants/audioConfig.js

/**
 * Configurações de áudio do Rhythm Trainer
 * Valores de volume, padrões de groove, pesos de acento e buffers de áudio
 */

// Volumes padrão para diferentes tipos de batidas
export const VOLUME_LEVELS = {
  SILENT: 0.0,      // Notas fantasmas/silenciosas
  GHOST: 0.15,      // Notas fantasmas (subtle)
  WEAK: 0.3,        // Batidas fracas
  MEDIUM: 0.6,      // Batidas médias
  STRONG: 0.85,     // Batidas fortes
  ACCENT: 1.0,      // Acentos (máximo)
  CLICK: 0.7,       // Clique do metrônomo principal
};

// Perfis de volume pré-configurados para diferentes modos
export const VOLUME_PROFILES = {
  BEGINNER: {
    name: "Iniciante",
    description: "Perfil claro com acentos fortes para aprendizado",
    volumes: [1.0, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4], // Apenas o primeiro acentuado
  },
  ADVANCED: {
    name: "Avançado",
    description: "Perfil dinâmico com múltiplos níveis de intensidade",
    volumes: [1.0, 0.3, 0.6, 0.3, 0.7, 0.4, 0.5, 0.3, 0.8],
  },
  PRO: {
    name: "PRO",
    description: "Perfil complexo com nuances sutis para prática avançada",
    volumes: [1.0, 0.25, 0.45, 0.2, 0.65, 0.3, 0.5, 0.2, 0.7],
  },
  POLYRHYTHM: {
    name: "Polirritmo",
    description: "Perfil otimizado para prática de polirritmos",
    volumes: [1.0, 0.2, 0.9, 0.2, 0.8, 0.2, 0.7, 0.2, 0.6],
  },
};

// Padrões de groove pré-definidos (shuffle, swing, etc.)
export const GROOVE_PATTERNS = {
  STRAIGHT: {
    name: "Reto",
    description: "Subdivisões perfeitamente igualmente espaçadas",
    timing: [0, 0, 0, 0, 0, 0, 0, 0, 0], // Sem deslocamento
  },
  SWING_58: {
    name: "Swing 5/8",
    description: "Swing moderado (5:8 ratio)",
    timing: [0, 30, 0, 30, 0, 30, 0, 30, 0], // Atraso nas notas fracas (em ms)
  },
  SWING_23: {
    name: "Swing 2/3",
    description: "Swing forte (2:3 ratio)",
    timing: [0, 50, 0, 50, 0, 50, 0, 50, 0],
  },
  SHUFFLE: {
    name: "Shuffle",
    description: "Groove característico de blues e rock",
    timing: [0, 40, 0, 40, 0, 40, 0, 40, 0],
  },
};

// Pesos de acento para geração aleatória de padrões
export const ACCENT_WEIGHTS = {
  DOWNBEAT: 0.9,       // Primeiro tempo do compasso
  BACKBEAT: 0.7,       // Tempos 2 e 4 (em 4/4)
  UPBEAT: 0.4,         // Subdivisões "e", "a"
  OFFBEAT: 0.25,       // Subdivisões fora do pulso principal
  CUSTOM: 0.5,         // Posições personalizadas pelo usuário
};

// Configurações de timbre (frequências para osciladores)
export const TIMBRE_CONFIG = {
  CLICK: {
    type: 'sine',
    frequency: 1000,
    decay: 0.05,
    attack: 0.001,
  },
  MAIN: {
    type: 'square',
    frequency: 800,
    decay: 0.1,
    attack: 0.002,
  },
  GHOST: {
    type: 'sine',
    frequency: 600,
    decay: 0.03,
    attack: 0.001,
  },
  ACCENT: {
    type: 'sawtooth',
    frequency: 1200,
    decay: 0.15,
    attack: 0.005,
  },
};

// Configurações de áudio do sistema
export const AUDIO_CONFIG = {
  LOOKAHEAD: 100,        // ms que o scheduler olha à frente
  SCHEDULE_INTERVAL: 25, // ms entre cada verificação do scheduler
  LATENCY_COMPENSATION: 25, // ms de compensação de latência
  DEFAULT_BPM: 120,
  MIN_BPM: 40,
  MAX_BPM: 300,
  DEFAULT_VOLUME: 0.8,
};

// Opções de incremento de BPM para diferentes modos de precisão
export const BPM_INCREMENT_OPTIONS = [
  { value: 1, label: "1 BPM", precision: "Máxima" },
  { value: 5, label: "5 BPM", precision: "Alta" },
  { value: 10, label: "10 BPM", precision: "Média" },
  { value: 15, label: "15 BPM", precision: "Rápida" },
  { value: 20, label: "20 BPM", precision: "Grossa" },
  { value: 25, label: "25 BPM", precision: "Larga" },
  { value: 30, label: "30 BPM", precision: "Muito larga" },
];

// Configurações de efeitos de áudio (reverb, delay, etc.)
export const EFFECTS_CONFIG = {
  REVERB: {
    enabled: false,
    mix: 0.1,
    decay: 1.5,
    preDelay: 0.01,
  },
  DELAY: {
    enabled: false,
    time: 0.25,
    feedback: 0.3,
    mix: 0.1,
  },
  COMPRESSOR: {
    enabled: true,
    threshold: -24,
    knee: 30,
    ratio: 12,
    attack: 0.003,
    release: 0.25,
  },
};

// Mapeamento de notas para representação visual
export const NOTE_DISPLAY = {
  FULL: '●',      // Nota completa
  GHOST: '○',     // Nota fantasma
  ACCENT: '▲',    // Acento
  REST: '×',      // Pausa
  TIE: '⌒',       // Ligadura
};

export default {
  VOLUME_LEVELS,
  VOLUME_PROFILES,
  GROOVE_PATTERNS,
  ACCENT_WEIGHTS,
  TIMBRE_CONFIG,
  AUDIO_CONFIG,
  BPM_INCREMENT_OPTIONS,
  EFFECTS_CONFIG,
  NOTE_DISPLAY,
};
