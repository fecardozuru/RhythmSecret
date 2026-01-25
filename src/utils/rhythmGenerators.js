// /src/utils/rhythmGenerators.js

/**
 * Geradores de padrões rítmicos, grooves e sequências
 */

import { ACCENT_WEIGHTS, GROOVE_PATTERNS } from '../constants/audioConfig';

/**
 * Gera uma sequência básica de subdivisões
 * @param {number} count - Número de subdivisões (1-9)
 * @param {Array} volumes - Array de volumes (opcional, se não fornecido usa padrão)
 * @returns {Array} Array de objetos {active, volume}
 */
export function generateBasicSequence(count = 4, volumes = null) {
  const sequence = [];
  
  // Volumes padrão se não fornecidos
  const defaultVolumes = [
    1.0,  // Primeiro sempre forte
    0.3, 0.6, 0.3,
    0.7, 0.4, 0.5,
    0.3, 0.8
  ].slice(0, count);
  
  const useVolumes = volumes || defaultVolumes;
  
  for (let i = 0; i < count; i++) {
    sequence.push({
      id: i,
      active: true,
      volume: useVolumes[i] || 0.5,
      isRest: false,
      isTie: false,
      accent: i === 0, // Primeiro é acento
      timingOffset: 0, // Sem offset por padrão
    });
  }
  
  return sequence;
}

/**
 * Gera uma sequência com padrão de permutação (para modo PRO)
 * @param {number} start - Subdivisão inicial (1-9)
 * @param {number} end - Subdivisão final (1-9)
 * @returns {Array} Array de sequências para permutação
 */
export function generatePermutationSequences(start = 1, end = 9) {
  const sequences = [];
  
  // Garante que start <= end
  const actualStart = Math.min(start, end);
  const actualEnd = Math.max(start, end);
  
  for (let count = actualStart; count <= actualEnd; count++) {
    sequences.push(generateBasicSequence(count));
  }
  
  return sequences;
}

/**
 * Aplica um padrão de groove (swing, shuffle) a uma sequência
 * @param {Array} sequence - Sequência original
 * @param {string} grooveType - Tipo de groove ('STRAIGHT', 'SWING_58', etc.)
 * @returns {Array} Sequência com groove aplicado
 */
export function applyGroovePattern(sequence, grooveType = 'STRAIGHT') {
  const groove = GROOVE_PATTERNS[grooveType] || GROOVE_PATTERNS.STRAIGHT;
  
  return sequence.map((step, index) => ({
    ...step,
    timingOffset: groove.timing[index % groove.timing.length] || 0,
  }));
}

/**
 * Gera padrões de acento baseados em pesos probabilísticos
 * @param {number} count - Número de subdivisões
 * @param {Object} timeSignature - Compasso
 * @param {Object} weights - Pesos personalizados (opcional)
 * @returns {Array} Array de booleanos indicando acentos
 */
export function generateAccentPattern(count, timeSignature, weights = null) {
  const useWeights = weights || ACCENT_WEIGHTS;
  const accents = new Array(count).fill(false);
  
  // Sempre acentua o primeiro tempo
  accents[0] = true;
  
  // Aplica pesos baseados na posição no compasso
  for (let i = 1; i < count; i++) {
    const positionInMeasure = i % timeSignature.numerator;
    
    let weight;
    if (positionInMeasure === 0) {
      weight = useWeights.DOWNBEAT; // Primeiro tempo do compasso
    } else if (positionInMeasure === 2 || positionInMeasure === 4) {
      weight = useWeights.BACKBEAT; // Backbeat (tempos 2 e 4)
    } else if (i % 2 === 1) {
      weight = useWeights.UPBEAT; // Upbeats ("e", "a")
    } else {
      weight = useWeights.OFFBEAT;
    }
    
    // Decisão probabilística baseada no peso
    accents[i] = Math.random() < weight;
  }
  
  return accents;
}

/**
 * Adiciona notas fantasmas aleatórias a uma sequência
 * @param {Array} sequence - Sequência original
 * @param {number} probability - Probabilidade de cada nota virar fantasma (0-1)
 * @returns {Array} Sequência com notas fantasmas
 */
export function addGhostNotes(sequence, probability = 0.3) {
  return sequence.map(step => {
    // Não transforma acentos em fantasmas
    if (step.accent) return step;
    
    const isGhost = Math.random() < probability;
    
    return {
      ...step,
      volume: isGhost ? Math.max(0.1, step.volume * 0.3) : step.volume,
      isGhost: isGhost,
    };
  });
}

/**
 * Gera um padrão polirrítmico
 * @param {number} baseCount - Subdivisão base (ex: 3)
 * @param {number} overlayCount - Subdivisão sobreposta (ex: 4)
 * @param {number} length - Comprimento do padrão em ciclos
 * @returns {Array} Sequência polirrítmica
 */
export function generatePolyrhythm(baseCount, overlayCount, length = 16) {
  const sequence = [];
  const lcm = findLCM(baseCount, overlayCount);
  
  for (let i = 0; i < length; i++) {
    const isBase = i % baseCount === 0;
    const isOverlay = i % overlayCount === 0;
    
    let volume = 0.3;
    let accent = false;
    
    if (isBase && isOverlay) {
      volume = 1.0; // Coincidência forte
      accent = true;
    } else if (isBase) {
      volume = 0.7; // Base moderada
    } else if (isOverlay) {
      volume = 0.5; // Overlay suave
    }
    
    sequence.push({
      id: i,
      active: isBase || isOverlay,
      volume: volume,
      accent: accent,
      isBase: isBase,
      isOverlay: isOverlay,
      polyrhythmIndex: i % lcm,
    });
  }
  
  return sequence;
}

/**
 * Encontra o mínimo múltiplo comum (LCM)
 * @param {number} a - Primeiro número
 * @param {number} b - Segundo número
 * @returns {number} LCM
 */
function findLCM(a, b) {
  return Math.abs(a * b) / findGCD(a, b);
}

/**
 * Encontra o máximo divisor comum (GCD)
 * @param {number} a - Primeiro número
 * @param {number} b - Segundo número
 * @returns {number} GCD
 */
function findGCD(a, b) {
  if (b === 0) return a;
  return findGCD(b, a % b);
}

/**
 * Gera um padrão de compasso composto (6/8, 9/8, 12/8)
 * @param {Object} timeSignature - Compasso composto
 * @param {number} subdivisions - Subdivisões por batida
 * @returns {Array} Sequência com agrupamento composto
 */
export function generateCompoundPattern(timeSignature, subdivisions = 3) {
  const totalBeats = timeSignature.numerator;
  const grouping = timeSignature.denominator === 8 ? 3 : 2; // 6/8 = 2 grupos de 3
  
  const sequence = [];
  let index = 0;
  
  for (let beat = 0; beat < totalBeats; beat++) {
    const isStrongBeat = beat % grouping === 0;
    
    for (let sub = 0; sub < subdivisions; sub++) {
      const isFirstInGroup = sub === 0;
      
      sequence.push({
        id: index++,
        active: true,
        volume: isStrongBeat && isFirstInGroup ? 1.0 : 
                isFirstInGroup ? 0.6 : 0.3,
        accent: isStrongBeat && isFirstInGroup,
        beatGroup: Math.floor(beat / grouping),
        positionInGroup: beat % grouping,
        isGroupStart: isFirstInGroup,
      });
    }
  }
  
  return sequence;
}

/**
 * Cria um padrão de síncope (acentos em tempos fracos)
 * @param {number} count - Número de subdivisões
 * @param {number} syncopationLevel - Nível de síncope (0-1)
 * @returns {Array} Sequência sincopada
 */
export function generateSyncopatedPattern(count, syncopationLevel = 0.5) {
  const sequence = generateBasicSequence(count);
  
  return sequence.map((step, index) => {
    // Aumenta chance de acento em posições fracas baseado no nível de síncope
    const isWeakPosition = index % 2 === 1 || index % 4 === 2;
    
    if (isWeakPosition && Math.random() < syncopationLevel) {
      return {
        ...step,
        volume: Math.min(1.0, step.volume + 0.3),
        accent: true,
        syncopated: true,
      };
    }
    
    return step;
  });
}

/**
 * Gera um padrão aleatório com restrições musicais
 * @param {number} count - Número de subdivisões
 * @param {Object} options - Opções de geração
 * @returns {Array} Sequência aleatória
 */
export function generateRandomPattern(count, options = {}) {
  const {
    minNotes = 3,
    maxClusters = 2,
    clusterSize = 2,
    allowRests = true,
  } = options;
  
  const sequence = [];
  let notesAdded = 0;
  
  for (let i = 0; i < count; i++) {
    // Garante número mínimo de notas
    const forcedNote = notesAdded < minNotes && i > count - (minNotes - notesAdded);
    
    // Decide se esta posição terá nota
    let hasNote;
    if (forcedNote) {
      hasNote = true;
    } else if (allowRests) {
      // Chance baseada na posição (maior em fortes, menor em fracas)
      const positionWeight = i % 4 === 0 ? 0.8 : 
                            i % 2 === 0 ? 0.6 : 0.4;
      hasNote = Math.random() < positionWeight;
    } else {
      hasNote = true;
    }
    
    // Volume baseado na posição
    const volume = i % 4 === 0 ? 0.8 + Math.random() * 0.2 :
                   i % 2 === 0 ? 0.5 + Math.random() * 0.3 :
                   0.2 + Math.random() * 0.3;
    
    sequence.push({
      id: i,
      active: hasNote,
      volume: hasNote ? volume : 0,
      accent: hasNote && i % 4 === 0 && Math.random() > 0.5,
      isRest: !hasNote,
    });
    
    if (hasNote) notesAdded++;
  }
  
  // Garante que pelo menos uma nota foi adicionada
  if (notesAdded === 0 && count > 0) {
    const randomIndex = Math.floor(Math.random() * count);
    sequence[randomIndex] = {
      ...sequence[randomIndex],
      active: true,
      volume: 0.7,
      isRest: false,
    };
  }
  
  return sequence;
}

/**
 * Cria um ciclo de permutação automática (para auto-loop PRO)
 * @param {number} current - Subdivisão atual
 * @param {string} direction - Direção ('up', 'down', 'ping-pong')
 * @param {number} min - Mínimo (padrão: 1)
 * @param {number} max - Máximo (padrão: 9)
 * @returns {number} Próxima subdivisão
 */
export function calculateNextAutoLoopStep(current, direction = 'ping-pong', min = 1, max = 9) {
  let next = current;
  
  switch (direction) {
    case 'up':
      next = current >= max ? min : current + 1;
      break;
    
    case 'down':
      next = current <= min ? max : current - 1;
      break;
    
    case 'ping-pong':
    default:
      // Ping-pong entre min e max
      if (current >= max) {
        next = current - 1;
      } else if (current <= min) {
        next = current + 1;
      } else {
        // Mantém direção (precisa de estado adicional)
        // Por simplicidade, alterna
        next = Math.random() > 0.5 ? current + 1 : current - 1;
        next = Math.max(min, Math.min(max, next));
      }
      break;
  }
  
  return Math.max(min, Math.min(max, next));
}

/**
 * Aplica um filtro de suavização a volumes (para transições suaves)
 * @param {Array} sequence - Sequência original
 * @param {number} smoothing - Fator de suavização (0-1)
 * @returns {Array} Sequência suavizada
 */
export function smoothVolumes(sequence, smoothing = 0.3) {
  if (sequence.length === 0) return sequence;
  
  const smoothed = [...sequence];
  
  for (let i = 1; i < smoothed.length; i++) {
    if (smoothed[i].active && smoothed[i-1].active) {
      const blended = smoothed[i-1].volume * (1 - smoothing) + smoothed[i].volume * smoothing;
      smoothed[i].volume = Math.max(0.1, Math.min(1.0, blended));
    }
  }
  
  return smoothed;
}

/**
 * Gera uma sequência baseada em um preset nomeado
 * @param {string} presetName - Nome do preset
 * @param {number} count - Número de subdivisões
 * @returns {Array} Sequência do preset
 */
export function generatePresetPattern(presetName, count = 4) {
  const presets = {
    'four-on-floor': Array.from({ length: count }, (_, i) => ({
      active: true,
      volume: i % 4 === 0 ? 1.0 : 0.3,
      accent: i % 4 === 0,
    })),
    
    'shuffle': Array.from({ length: count }, (_, i) => ({
      active: i % 3 !== 2, // Padrão shuffle (skip every 3rd)
      volume: i % 4 === 0 ? 0.9 : 0.4,
      accent: i % 4 === 0,
    })),
    
    'jazz': Array.from({ length: count }, (_, i) => ({
      active: Math.random() > 0.3,
      volume: i % 4 === 0 ? 0.8 : 
              i % 2 === 1 ? 0.2 : 0.5,
      accent: i % 4 === 0 && Math.random() > 0.5,
    })),
    
    'latin': Array.from({ length: count }, (_, i) => ({
      active: true,
      volume: [0.9, 0.2, 0.7, 0.3, 0.8, 0.2, 0.6, 0.4][i % 8] || 0.5,
      accent: [true, false, false, false, true, false, false, false][i % 8] || false,
    })),
  };
  
  const preset = presets[presetName] || presets['four-on-floor'];
  
  // Ajusta para o count especificado
  return preset.slice(0, count).map((step, i) => ({
    id: i,
    active: step.active,
    volume: step.volume,
    accent: step.accent,
    isRest: !step.active,
  }));
}

export default {
  generateBasicSequence,
  generatePermutationSequences,
  applyGroovePattern,
  generateAccentPattern,
  addGhostNotes,
  generatePolyrhythm,
  generateCompoundPattern,
  generateSyncopatedPattern,
  generateRandomPattern,
  calculateNextAutoLoopStep,
  smoothVolumes,
  generatePresetPattern,
  findLCM,
  findGCD,
};
