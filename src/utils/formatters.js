// /src/utils/formatters.js

/**
 * Utilitários de formatação para texto, números e visualizações
 */

import { NOTE_DISPLAY } from '../constants/audioConfig';

/**
 * Formata um número com separadores de milhar
 * @param {number|string} number - Número a formatar
 * @param {number} decimals - Casas decimais
 * @returns {string} Número formatado
 */
export function formatNumber(number, decimals = 0) {
  if (number === null || number === undefined) return '0';
  
  const num = typeof number === 'string' ? parseFloat(number) : number;
  
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Formata BPM para display com unidade
 * @param {number} bpm - Batidas por minuto
 * @returns {string} BPM formatado
 */
export function formatBpm(bpm) {
  if (!bpm && bpm !== 0) return '-- BPM';
  
  const rounded = Math.round(bpm * 10) / 10; // Uma casa decimal
  return `${formatNumber(rounded, bpm % 1 === 0 ? 0 : 1)} BPM`;
}

/**
 * Formata tempo musical (ex: "4/4", "3/4", "6/8")
 * @param {Object} timeSignature - Objeto {numerator, denominator}
 * @returns {string} Compasso formatado
 */
export function formatTimeSignature(timeSignature) {
  if (!timeSignature) return '4/4';
  return `${timeSignature.numerator}/${timeSignature.denominator}`;
}

/**
 * Formata subdivisão para display (ex: "1/4", "1/8", "1/16")
 * @param {number} subdivision - Nível de subdivisão
 * @returns {string} Subdivisão formatada
 */
export function formatSubdivision(subdivision) {
  if (!subdivision) return '1/4';
  return `1/${subdivision}`;
}

/**
 * Formata volume para display em dB ou percentual
 * @param {number} volume - Volume (0 a 1)
 * @param {string} format - Formato ('percent', 'db', ou 'decimal')
 * @returns {string} Volume formatado
 */
export function formatVolume(volume, format = 'percent') {
  if (volume === null || volume === undefined) return '0%';
  
  const clamped = Math.max(0, Math.min(1, volume));
  
  switch (format) {
    case 'db':
      // Converte para dB (20 * log10(volume))
      const db = 20 * Math.log10(clamped);
      return db === -Infinity ? '-∞ dB' : `${db.toFixed(1)} dB`;
    
    case 'decimal':
      return clamped.toFixed(2);
    
    case 'percent':
    default:
      return `${Math.round(clamped * 100)}%`;
  }
}

/**
 * Formata duração em ms para display legível
 * @param {number} ms - Milissegundos
 * @param {boolean} showMs - Se deve mostrar milissegundos
 * @returns {string} Duração formatada
 */
export function formatDuration(ms, showMs = false) {
  if (!ms && ms !== 0) return '0s';
  
  if (ms < 1000) {
    return showMs ? `${Math.round(ms)}ms` : '<1s';
  }
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return showMs ? `${seconds}.${Math.floor((ms % 1000) / 100)}s` : `${seconds}s`;
  }
}

/**
 * Formata uma sequência rítmica para display visual
 * @param {Array} sequence - Array de objetos {active, volume, etc.}
 * @param {Object} options - Opções de formatação
 * @returns {string} Sequência formatada
 */
export function formatRhythmSequence(sequence, options = {}) {
  if (!sequence || !Array.isArray(sequence)) return '';
  
  const {
    showVolumes = false,
    showActiveOnly = false,
    maxLength = 16,
  } = options;
  
  let result = '';
  
  sequence.slice(0, maxLength).forEach((step, index) => {
    if (showActiveOnly && !step.active) {
      result += '·';
      return;
    }
    
    let char = '·'; // Ponto para inativo
    
    if (step.active) {
      if (step.volume > 0.7) {
        char = NOTE_DISPLAY.ACCENT;
      } else if (step.volume > 0.3) {
        char = NOTE_DISPLAY.FULL;
      } else if (step.volume > 0) {
        char = NOTE_DISPLAY.GHOST;
      } else if (step.isRest) {
        char = NOTE_DISPLAY.REST;
      }
    } else if (step.isTie) {
      char = NOTE_DISPLAY.TIE;
    }
    
    if (showVolumes && step.active) {
      // Adiciona número pequeno de volume (1-9)
      const volLevel = Math.min(9, Math.max(1, Math.round(step.volume * 9)));
      result += volLevel;
    } else {
      result += char;
    }
    
    // Adiciona separador a cada 4 passos
    if ((index + 1) % 4 === 0 && index < sequence.length - 1 && index < maxLength - 1) {
      result += ' ';
    }
  });
  
  if (sequence.length > maxLength) {
    result += '…';
  }
  
  return result;
}

/**
 * Formata modo de reprodução para display
 * @param {string} playMode - Modo ('manual', 'auto-up', 'auto-down')
 * @returns {Object} {label, icon, description}
 */
export function formatPlayMode(playMode) {
  const modes = {
    'manual': {
      label: 'Manual',
      icon: 'hand', // Lucide icon
      description: 'Controle manual das subdivisões',
      color: 'text-gray-600',
    },
    'auto-up': {
      label: 'Auto ↑',
      icon: 'chevron-up',
      description: 'Aumenta automaticamente as subdivisões',
      color: 'text-green-600',
    },
    'auto-down': {
      label: 'Auto ↓',
      icon: 'chevron-down',
      description: 'Diminui automaticamente as subdivisões',
      color: 'text-blue-600',
    },
  };
  
  return modes[playMode] || modes.manual;
}

/**
 * Formata modo de aplicativo para display
 * @param {string} appMode - Modo ('beginner', 'advanced', 'pro')
 * @returns {Object} {label, icon, description, color}
 */
export function formatAppMode(appMode) {
  const modes = {
    'beginner': {
      label: 'Iniciante',
      icon: 'user',
      description: 'Modo simplificado para iniciantes',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    'advanced': {
      label: 'Avançado',
      icon: 'users',
      description: 'Recursos avançados para prática',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    'pro': {
      label: 'PRO',
      icon: 'crown',
      description: 'Recursos profissionais completos',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  };
  
  return modes[appMode] || modes.beginner;
}

/**
 * Formata estado de feature PRO para display
 * @param {boolean} enabled - Se a feature está ativa
 * @param {string} feature - Nome da feature
 * @returns {Object} {label, icon, color}
 */
export function formatProFeature(enabled, feature) {
  const base = {
    label: enabled ? 'Ativo' : 'Inativo',
    icon: enabled ? 'check-circle' : 'circle',
    color: enabled ? 'text-green-500' : 'text-gray-400',
  };
  
  const features = {
    'permutation': {
      label: enabled ? 'Permutação ON' : 'Permutação OFF',
      icon: enabled ? 'shuffle' : 'shuffle',
      description: 'Cicla por todas combinações de subdivisões',
    },
    'gap': {
      label: enabled ? 'Gap ON' : 'Gap OFF',
      icon: enabled ? 'pause' : 'play',
      description: 'Adiciona silêncio entre ciclos',
    },
    'ghost': {
      label: enabled ? 'Ghost ON' : 'Ghost OFF',
      icon: enabled ? 'ghost' : 'ghost',
      description: 'Adiciona notas fantasmas aleatórias',
    },
    'autoLoop': {
      label: enabled ? 'Auto-Loop ON' : 'Auto-Loop OFF',
      icon: enabled ? 'repeat' : 'repeat',
      description: 'Ping-pong entre subdivisões 1-9',
    },
  };
  
  const featureInfo = features[feature] || {};
  
  return {
    ...base,
    ...featureInfo,
    color: enabled ? 'text-amber-500' : 'text-gray-400',
  };
}

/**
 * Formata valor de slot de preset para display
 * @param {number} slot - Número do slot (1-3)
 * @param {boolean} hasData - Se o slot tem dados salvos
 * @returns {Object} {label, icon, color}
 */
export function formatPresetSlot(slot, hasData = false) {
  const slots = {
    1: {
      label: hasData ? 'Slot 1 (Salvo)' : 'Slot 1 (Vazio)',
      icon: hasData ? 'save' : 'save',
      color: hasData ? 'text-green-500' : 'text-gray-400',
      bgColor: hasData ? 'bg-green-500/10' : 'bg-gray-500/10',
    },
    2: {
      label: hasData ? 'Slot 2 (Salvo)' : 'Slot 2 (Vazio)',
      icon: hasData ? 'save' : 'save',
      color: hasData ? 'text-blue-500' : 'text-gray-400',
      bgColor: hasData ? 'bg-blue-500/10' : 'bg-gray-500/10',
    },
    3: {
      label: hasData ? 'Slot 3 (Salvo)' : 'Slot 3 (Vazio)',
      icon: hasData ? 'save' : 'save',
      color: hasData ? 'text-purple-500' : 'text-gray-400',
      bgColor: hasData ? 'bg-purple-500/10' : 'bg-gray-500/10',
    },
  };
  
  return slots[slot] || slots[1];
}

/**
 * Trunca texto com elipses se muito longo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Comprimento máximo
 * @returns {string} Texto truncado
 */
export function truncateText(text, maxLength = 20) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formata bytes para display legível (KB, MB, etc.)
 * @param {number} bytes - Número de bytes
 * @returns {string} Bytes formatados
 */
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Formata timestamp para display relativo (ex: "há 2 minutos")
 * @param {number} timestamp - Timestamp em ms
 * @returns {string} Tempo relativo formatado
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return 'Nunca';
  
  const now = Date.now();
  const diff = now - timestamp;
  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'agora mesmo';
  } else if (diffMinutes < 60) {
    return `há ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
  } else {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  }
}

/**
 * Formata um gradiente CSS baseado no tema
 * @param {string} themeName - Nome do tema
 * @param {string} direction - Direção do gradiente
 * @returns {string} Gradiente CSS
 */
export function formatThemeGradient(themeName, direction = 'to right') {
  const gradients = {
    'instagram': `linear-gradient(${direction}, #833AB4, #E1306C, #F77737, #FCAF45)`,
    'tiktok': `linear-gradient(${direction}, #25F4EE, #FE2C55, #25F4EE)`,
    'pro-gold': `linear-gradient(${direction}, #D4AF37, #FFD700, #FFF8DC)`,
    'spotify': `linear-gradient(${direction}, #1DB954, #1ED760, #1DB954)`,
    'default': `linear-gradient(${direction}, #3B82F6, #8B5CF6, #EC4899)`,
  };
  
  return gradients[themeName] || gradients.default;
}


export function formatTime(date = new Date()) {
  if (!(date instanceof Date)) return '--:--';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatBatteryLevel(level) {
  if (level === null || level === undefined || Number.isNaN(level)) return '--%';
  const safe = Math.max(0, Math.min(100, Math.round(level)));
  return `${safe}%`;
}

export default {
  formatNumber,
  formatBpm,
  formatTimeSignature,
  formatSubdivision,
  formatVolume,
  formatDuration,
  formatRhythmSequence,
  formatPlayMode,
  formatAppMode,
  formatProFeature,
  formatPresetSlot,
  truncateText,
  formatBytes,
  formatRelativeTime,
  formatThemeGradient,
  formatTime,
  formatBatteryLevel,
};
