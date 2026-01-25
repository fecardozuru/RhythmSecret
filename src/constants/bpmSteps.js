// /src/constants/bpmSteps.js

/**
 * Configurações de passos (incrementos) de BPM
 * Para controle circular, menus dropdown e diferentes modos de precisão
 */

// Opções de incremento de BPM para o seletor dropdown
export const BPM_STEP_OPTIONS = [
  {
    value: 1,
    label: "1 BPM",
    description: "Precisão máxima",
    icon: "microscope", // Ícone de precisão (será mapeado para Lucide React)
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    value: 5,
    label: "5 BPM",
    description: "Ajuste fino",
    icon: "settings",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    value: 10,
    label: "10 BPM",
    description: "Padrão musical",
    icon: "music",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    value: 15,
    label: "15 BPM",
    description: "Ajuste rápido",
    icon: "zap",
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
  },
  {
    value: 20,
    label: "20 BPM",
    description: "Mudanças grandes",
    icon: "chevrons-up",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    value: 25,
    label: "25 BPM",
    description: "Transições bruscas",
    icon: "arrow-up",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    value: 30,
    label: "30 BPM",
    description: "Variação extrema",
    icon: "activity",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
];

// Mapeamento de valor para objeto (para acesso rápido)
export const BPM_STEP_MAP = BPM_STEP_OPTIONS.reduce((map, option) => {
  map[option.value] = option;
  return map;
}, {});

// Incremento padrão baseado no modo do aplicativo
export const DEFAULT_BPM_STEPS_BY_MODE = {
  BEGINNER: 5,    // Iniciante: ajuste moderado
  ADVANCED: 1,    // Avançado: precisão máxima
  PRO: 1,         // PRO: precisão máxima
};

// Limites de BPM para diferentes contextos
export const BPM_LIMITS = {
  ABSOLUTE_MIN: 20,
  ABSOLUTE_MAX: 400,
  PRACTICE_MIN: 40,
  PRACTICE_MAX: 300,
  BEGINNER_MIN: 60,
  BEGINNER_MAX: 140,
  METRONOME_MIN: 30,
  METRONOME_MAX: 250,
};

// Zonas de BPM com descrições (para feedback visual)
export const BPM_ZONES = [
  {
    range: [20, 50],
    label: "Largo",
    description: "Muito lento - Adagissimo",
    color: "text-blue-300",
    bgColor: "bg-blue-900/20",
    emoji: "🐌",
  },
  {
    range: [51, 70],
    label: "Lento",
    description: "Adagio - Lento e expressivo",
    color: "text-blue-400",
    bgColor: "bg-blue-800/20",
    emoji: "🚶",
  },
  {
    range: [71, 90],
    label: "Andante",
    description: "Passo de caminhada - Moderado",
    color: "text-green-400",
    bgColor: "bg-green-800/20",
    emoji: "🚶‍♂️",
  },
  {
    range: [91, 110],
    label: "Moderato",
    description: "Moderado - Ritmo confortável",
    color: "text-green-500",
    bgColor: "bg-green-700/20",
    emoji: "🎵",
  },
  {
    range: [111, 130],
    label: "Allegretto",
    description: "Um pouco animado",
    color: "text-yellow-500",
    bgColor: "bg-yellow-700/20",
    emoji: "🎶",
  },
  {
    range: [131, 160],
    label: "Allegro",
    description: "Rápido e brilhante",
    color: "text-orange-500",
    bgColor: "bg-orange-700/20",
    emoji: "⚡",
  },
  {
    range: [161, 200],
    label: "Vivace",
    description: "Vivo e rápido",
    color: "text-red-500",
    bgColor: "bg-red-700/20",
    emoji: "🔥",
  },
  {
    range: [201, 300],
    label: "Presto",
    description: "Muito rápido",
    color: "text-red-600",
    bgColor: "bg-red-800/20",
    emoji: "🚀",
  },
  {
    range: [301, 400],
    label: "Prestissimo",
    description: "O mais rápido possível",
    color: "text-purple-500",
    bgColor: "bg-purple-800/20",
    emoji: "💨",
  },
];

// BPMs comuns para quick-select (presets rápidos)
export const COMMON_BPMS = [
  { bpm: 60, label: "60 BPM", description: "1 batida por segundo" },
  { bpm: 72, label: "72 BPM", description: "Andante comum" },
  { bpm: 80, label: "80 BPM", description: "Pop/Rock lento" },
  { bpm: 90, label: "90 BPM", description: "Hip-Hop clássico" },
  { bpm: 100, label: "100 BPM", description: "Marcha média" },
  { bpm: 120, label: "120 BPM", description: "Padrão metrônomo" },
  { bpm: 140, label: "140 BPM", description: "Dance/EDM" },
  { bpm: 160, label: "160 BPM", description: "Punk Rock" },
  { bpm: 180, label: "180 BPM", description: "Drum and Bass" },
  { bpm: 200, label: "200 BPM", description: "Speed Metal" },
];

// Função para obter a zona de BPM atual
export function getBpmZone(bpm) {
  return BPM_ZONES.find(zone => bpm >= zone.range[0] && bpm <= zone.range[1]) || 
         BPM_ZONES[BPM_ZONES.length - 1];
}

// Função para validar BPM dentro dos limites
export function validateBPM(bpm, mode = 'PRACTICE') {
  const limits = BPM_LIMITS;
  let min = limits.PRACTICE_MIN;
  let max = limits.PRACTICE_MAX;
  
  if (mode === 'BEGINNER') {
    min = limits.BEGINNER_MIN;
    max = limits.BEGINNER_MAX;
  } else if (mode === 'METRONOME') {
    min = limits.METRONOME_MIN;
    max = limits.METRONOME_MAX;
  }
  
  return Math.max(min, Math.min(max, bpm));
}

// Função para obter o incremento padrão baseado no modo
export function getDefaultStepForMode(mode) {
  return DEFAULT_BPM_STEPS_BY_MODE[mode] || 1;
}

// Calcula o ângulo do ponteiro baseado no BPM (para o controle circular)
export function calculateBpmAngle(bpm, min = 40, max = 300) {
  // Normaliza o BPM entre 0 e 1
  const normalized = (bpm - min) / (max - min);
  // Converte para ângulo (135° a 405° para cobrir 270° do círculo)
  return 135 + (normalized * 270);
}

// Converte ângulo para BPM (para o controle circular)
export function angleToBpm(angle, min = 40, max = 300) {
  // Normaliza o ângulo (135° a 405° para 0-1)
  const normalized = (angle - 135) / 270;
  // Converte para BPM
  return Math.round(min + (normalized * (max - min)));
}

export default {
  BPM_STEP_OPTIONS,
  BPM_STEP_MAP,
  DEFAULT_BPM_STEPS_BY_MODE,
  BPM_LIMITS,
  BPM_ZONES,
  COMMON_BPMS,
  getBpmZone,
  validateBPM,
  getDefaultStepForMode,
  calculateBpmAngle,
  angleToBpm,
};
