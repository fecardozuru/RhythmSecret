// /src/utils/timingUtils.js

/**
 * Utilitários para cálculos de tempo musical, compassos e compensação de latência
 */

import { TIME_SIGNATURES } from '../constants/musicalConfig';

// Constantes de tempo
const MILLISECONDS_PER_MINUTE = 60000;
const MICROSECONDS_PER_MILLISECOND = 1000;

/**
 * Calcula a duração de uma batida em milissegundos baseado no BPM
 * @param {number} bpm - Batidas por minuto
 * @returns {number} Duração de uma batida em ms
 */
export function calculateBeatDuration(bpm) {
  if (!bpm || bpm <= 0) return 1000; // Fallback para 60 BPM
  return MILLISECONDS_PER_MINUTE / bpm;
}

/**
 * Calcula a duração de uma subdivisão em milissegundos
 * @param {number} bpm - Batidas por minuto
 * @param {number} subdivision - Nível de subdivisão (1=nota inteira, 2=meias, 4=quartas, etc.)
 * @returns {number} Duração da subdivisão em ms
 */
export function calculateSubdivisionDuration(bpm, subdivision) {
  const beatDuration = calculateBeatDuration(bpm);
  return beatDuration / subdivision;
}

/**
 * Converte tempo musical (tempo.subdivisão) para timestamp em ms
 * @param {number} measure - Número do compasso (1-indexed)
 * @param {number} beat - Número da batida dentro do compasso (1-indexed)
 * @param {number} subdivision - Posição da subdivisão (0-indexed)
 * @param {number} totalSubdivisions - Total de subdivisões por batida
 * @param {number} bpm - Batidas por minuto
 * @param {Object} timeSignature - Compasso (ex: {numerator: 4, denominator: 4})
 * @returns {number} Timestamp em milissegundos
 */
export function musicalTimeToMs(measure, beat, subdivision, totalSubdivisions, bpm, timeSignature) {
  const beatDuration = calculateBeatDuration(bpm);
  const subdivisionDuration = beatDuration / totalSubdivisions;
  
  // Compensação para medidas e batidas (1-indexed)
  const measureOffset = (measure - 1) * timeSignature.numerator * beatDuration;
  const beatOffset = (beat - 1) * beatDuration;
  const subdivisionOffset = subdivision * subdivisionDuration;
  
  return measureOffset + beatOffset + subdivisionOffset;
}

/**
 * Converte timestamp em ms para tempo musical
 * @param {number} timestamp - Timestamp em milissegundos
 * @param {number} bpm - Batidas por minuto
 * @param {Object} timeSignature - Compasso
 * @param {number} totalSubdivisions - Total de subdivisões por batida
 * @returns {Object} Objeto com {measure, beat, subdivision}
 */
export function msToMusicalTime(timestamp, bpm, timeSignature, totalSubdivisions) {
  const beatDuration = calculateBeatDuration(bpm);
  const measureDuration = timeSignature.numerator * beatDuration;
  const subdivisionDuration = beatDuration / totalSubdivisions;
  
  const totalBeats = timestamp / beatDuration;
  
  const measure = Math.floor(totalBeats / timeSignature.numerator) + 1;
  const beat = Math.floor(totalBeats % timeSignature.numerator) + 1;
  const subdivision = Math.floor((timestamp % beatDuration) / subdivisionDuration);
  
  return { measure, beat, subdivision };
}

/**
 * Aplica compensação de latência a um timestamp de áudio
 * @param {number} audioTime - Tempo do contexto de áudio
 * @param {number} latencyCompensation - Compensação em ms (padrão: 25)
 * @returns {number} Tempo compensado
 */
export function applyLatencyCompensation(audioTime, latencyCompensation = 25) {
  const now = performance.now();
  const audioNow = audioTime * 1000; // Converte para ms se necessário
  
  // Se for tempo do AudioContext, converte para DOMHighResTimeStamp
  if (audioTime < 1000000) { // AudioContext time está em segundos
    return (audioTime * 1000) + latencyCompensation;
  }
  
  // Já está em ms
  return audioTime + latencyCompensation;
}

/**
 * Calcula o tempo do próximo intervalo para o scheduler
 * @param {number} currentTime - Tempo atual em ms
 * @param {number} interval - Intervalo do scheduler em ms
 * @returns {number} Próximo tempo alinhado
 */
export function calculateNextSchedulerTime(currentTime, interval) {
  return Math.ceil(currentTime / interval) * interval;
}

/**
 * Formata milissegundos para display MM:SS.mmm
 * @param {number} ms - Milissegundos
 * @returns {string} Tempo formatado
 */
export function formatTime(ms) {
  if (!ms && ms !== 0) return '00:00.000';
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = Math.floor(ms % 1000);
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Formata tempo musical para display (ex: "1.2.3" para compasso 1, batida 2, subdivisão 3)
 * @param {number} measure - Compasso
 * @param {number} beat - Batida
 * @param {number} subdivision - Subdivisão
 * @param {string} separator - Separador (padrão: ".")
 * @returns {string} Tempo musical formatado
 */
export function formatMusicalTime(measure, beat, subdivision, separator = '.') {
  return `${measure}${separator}${beat}${separator}${subdivision + 1}`;
}

/**
 * Calcula o comprimento de um loop em milissegundos
 * @param {number} bpm - Batidas por minuto
 * @param {Object} timeSignature - Compasso
 * @param {number} measures - Número de compassos no loop
 * @returns {number} Duração do loop em ms
 */
export function calculateLoopDuration(bpm, timeSignature, measures = 1) {
  const beatDuration = calculateBeatDuration(bpm);
  return measures * timeSignature.numerator * beatDuration;
}

/**
 * Verifica se um timestamp está dentro de um intervalo de loop
 * @param {number} timestamp - Timestamp a verificar
 * @param {number} loopStart - Início do loop em ms
 * @param {number} loopDuration - Duração do loop em ms
 * @returns {boolean} True se estiver dentro do loop
 */
export function isInLoop(timestamp, loopStart, loopDuration) {
  const loopEnd = loopStart + loopDuration;
  return timestamp >= loopStart && timestamp < loopEnd;
}

/**
 * Normaliza um timestamp para dentro de um loop (wrap-around)
 * @param {number} timestamp - Timestamp a normalizar
 * @param {number} loopStart - Início do loop em ms
 * @param {number} loopDuration - Duração do loop em ms
 * @returns {number} Timestamp normalizado
 */
export function normalizeToLoop(timestamp, loopStart, loopDuration) {
  if (loopDuration <= 0) return timestamp;
  
  const offset = timestamp - loopStart;
  const normalizedOffset = offset % loopDuration;
  
  // Garante que seja positivo
  const positiveOffset = normalizedOffset < 0 ? normalizedOffset + loopDuration : normalizedOffset;
  
  return loopStart + positiveOffset;
}

/**
 * Calcula a posição relativa dentro de um loop (0 a 1)
 * @param {number} timestamp - Timestamp atual
 * @param {number} loopStart - Início do loop
 * @param {number} loopDuration - Duração do loop
 * @returns {number} Posição relativa (0 a 1)
 */
export function calculateLoopPosition(timestamp, loopStart, loopDuration) {
  if (!isInLoop(timestamp, loopStart, loopDuration)) return 0;
  
  const position = (timestamp - loopStart) / loopDuration;
  return Math.max(0, Math.min(1, position)); // Clamp entre 0 e 1
}

/**
 * Converte BPM para intervalo de scheduler em ms
 * @param {number} bpm - Batidas por minuto
 * @param {number} subdivisions - Número de subdivisões
 * @returns {number} Intervalo em ms
 */
export function bpmToSchedulerInterval(bpm, subdivisions = 4) {
  const beatDuration = calculateBeatDuration(bpm);
  const subdivisionDuration = beatDuration / subdivisions;
  
  // Retorna 1/4 da duração da subdivisão para precisão
  return Math.max(1, subdivisionDuration / 4);
}

/**
 * Arredonda BPM para o incremento mais próximo
 * @param {number} bpm - BPM para arredondar
 * @param {number} increment - Incremento (1, 5, 10, etc.)
 * @returns {number} BPM arredondado
 */
export function roundBpmToIncrement(bpm, increment) {
  if (!increment || increment <= 0) return Math.round(bpm);
  return Math.round(bpm / increment) * increment;
}

/**
 * Calcula o tempo para a próxima batida
 * @param {number} currentTime - Tempo atual em ms
 * @param {number} bpm - Batidas por minuto
 * @returns {number} Tempo da próxima batida em ms
 */
export function calculateNextBeatTime(currentTime, bpm) {
  const beatDuration = calculateBeatDuration(bpm);
  const beatsElapsed = currentTime / beatDuration;
  const nextBeat = Math.ceil(beatsElapsed);
  return nextBeat * beatDuration;
}

/**
 * Suaviza transições de BPM (para evitar saltos bruscos)
 * @param {number} currentBpm - BPM atual
 * @param {number} targetBpm - BPM alvo
 * @param {number} smoothing - Fator de suavização (0-1)
 * @returns {number} BPM suavizado
 */
export function smoothBpmTransition(currentBpm, targetBpm, smoothing = 0.1) {
  return currentBpm + (targetBpm - currentBpm) * smoothing;
}

export default {
  calculateBeatDuration,
  calculateSubdivisionDuration,
  musicalTimeToMs,
  msToMusicalTime,
  applyLatencyCompensation,
  calculateNextSchedulerTime,
  formatTime,
  formatMusicalTime,
  calculateLoopDuration,
  isInLoop,
  normalizeToLoop,
  calculateLoopPosition,
  bpmToSchedulerInterval,
  roundBpmToIncrement,
  calculateNextBeatTime,
  smoothBpmTransition,
};
