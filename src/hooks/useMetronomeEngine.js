// /src/hooks/useMetronomeEngine.js

/**
 * Hook para geração e gerenciamento de sequências rítmicas
 * Motor principal do metrônomo/treinador rítmico
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  generateBasicSequence,
  generatePermutationSequences,
  applyGroovePattern,
  addGhostNotes,
  generateSyncopatedPattern,
  generatePolyrhythm,
  generateCompoundPattern,
  generateRandomPattern,
  calculateNextAutoLoopStep,
  smoothVolumes,
} from '../utils/rhythmGenerators';
import { VOLUME_PROFILES, GROOVE_PATTERNS } from '../constants/audioConfig';
import { TIME_SIGNATURES, SUBDIVISION_OPTIONS } from '../constants/musicalConfig';

/**
 * Hook principal para o motor de metrônomo
 */
export function useMetronomeEngine(initialState = {}) {
  // Estados principais
  const [bpm, setBpm] = useState(initialState.bpm || 120);
  const [timeSignature, setTimeSignature] = useState(
    initialState.timeSignature || TIME_SIGNATURES['4/4']
  );
  const [subdivision, setSubdivision] = useState(initialState.subdivision || 4);
  const [sequence, setSequence] = useState([]);
  const [volumes, setVolumes] = useState(initialState.volumes || [1.0, 0.3, 0.6, 0.3]);
  
  // Estados de modo
  const [appMode, setAppMode] = useState(initialState.appMode || 'beginner');
  const [playMode, setPlayMode] = useState(initialState.playMode || 'manual');
  
  // Estados PRO
  const [permutationEnabled, setPermutationEnabled] = useState(initialState.permutationEnabled || false);
  const [gapEnabled, setGapEnabled] = useState(initialState.gapEnabled || false);
  const [ghostModeEnabled, setGhostModeEnabled] = useState(initialState.ghostModeEnabled || false);
  const [autoLoopEnabled, setAutoLoopEnabled] = useState(initialState.autoLoopEnabled || false);
  
  // Estados de groove
  const [grooveType, setGrooveType] = useState(initialState.grooveType || 'STRAIGHT');
  const [grooveAmount, setGrooveAmount] = useState(initialState.grooveAmount || 0);
  
  // Estados de permutação
  const [permutationStart, setPermutationStart] = useState(initialState.permutationStart || 1);
  const [permutationEnd, setPermutationEnd] = useState(initialState.permutationEnd || 9);
  const [currentPermutationIndex, setCurrentPermutationIndex] = useState(0);
  const [permutationSequences, setPermutationSequences] = useState([]);
  
  // Estados de auto-loop
  const [autoLoopDirection, setAutoLoopDirection] = useState(initialState.autoLoopDirection || 'ping-pong');
  const [autoLoopMin, setAutoLoopMin] = useState(initialState.autoLoopMin || 1);
  const [autoLoopMax, setAutoLoopMax] = useState(initialState.autoLoopMax || 9);
  const [autoLoopTimer, setAutoLoopTimer] = useState(null);
  
  // Contadores e estado
  const [measureCount, setMeasureCount] = useState(1);
  const [beatCount, setBeatCount] = useState(1);
  const [subdivisionCount, setSubdivisionCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  // Referências
  const engineRef = useRef({
    timeoutIds: [],
    intervalIds: [],
    lastStepTime: 0,
    gapTimeout: null,
    isInGap: false,
  });

  /**
   * Gera uma sequência baseada na configuração atual
   */
  const generateSequence = useCallback((customConfig = {}) => {
    const config = {
      count: customConfig.subdivision || subdivision,
      volumes: customConfig.volumes || volumes,
      timeSignature: customConfig.timeSignature || timeSignature,
      grooveType: customConfig.grooveType || grooveType,
      grooveAmount: customConfig.grooveAmount || grooveAmount,
      ghostMode: customConfig.ghostModeEnabled || ghostModeEnabled,
      syncopation: customConfig.syncopation || 0,
      ...customConfig,
    };
    
    let generatedSequence;
    
    // Gera sequência base
    if (config.preset) {
      // Usa preset específico
      generatedSequence = generateBasicSequence(config.count, config.volumes);
    } else if (config.polyrhythm) {
      // Gera polirritmo
      generatedSequence = generatePolyrhythm(
        config.polyrhythm.base,
        config.polyrhythm.overlay,
        config.count
      );
    } else if (timeSignature.denominator === 8 && timeSignature.numerator % 3 === 0) {
      // Compasso composto
      generatedSequence = generateCompoundPattern(timeSignature, subdivision);
    } else if (config.syncopation > 0) {
      // Padrão sincopado
      generatedSequence = generateSyncopatedPattern(config.count, config.syncopation);
    } else {
      // Sequência básica
      generatedSequence = generateBasicSequence(config.count, config.volumes);
    }
    
    // Aplica groove se não for STRAIGHT
    if (config.grooveType !== 'STRAIGHT' && config.grooveAmount > 0) {
      generatedSequence = applyGroovePattern(generatedSequence, config.grooveType);
      
      // Ajusta quantidade de groove
      if (config.grooveAmount !== 1) {
        generatedSequence = generatedSequence.map(step => ({
          ...step,
          timingOffset: step.timingOffset * config.grooveAmount,
        }));
      }
    }
    
    // Adiciona notas fantasmas se habilitado
    if (config.ghostMode) {
      generatedSequence = addGhostNotes(generatedSequence, 0.3);
    }
    
    // Suaviza volumes
    generatedSequence = smoothVolumes(generatedSequence, 0.3);
    
    // Adiciona metadados
    generatedSequence = generatedSequence.map((step, index) => ({
      ...step,
      index,
      beat: Math.floor(index / subdivision) % timeSignature.numerator,
      subdivisionInBeat: index % subdivision,
      isDownbeat: index % subdivision === 0 && 
                  Math.floor(index / subdivision) % timeSignature.numerator === 0,
    }));
    
    return generatedSequence;
  }, [subdivision, volumes, timeSignature, grooveType, grooveAmount, ghostModeEnabled]);

  /**
   * Atualiza a sequência atual
   */
  const updateSequence = useCallback((newSequence) => {
    if (!newSequence || newSequence.length === 0) return;
    
    setSequence(newSequence);
    setCurrentStep(0);
    
    // Reseta contadores
    setMeasureCount(1);
    setBeatCount(1);
    setSubdivisionCount(0);
  }, []);

  /**
   * Avança para o próximo passo na sequência
   */
  const advanceStep = useCallback(() => {
    if (sequence.length === 0) return;
    
    const nextStep = (currentStep + 1) % sequence.length;
    setCurrentStep(nextStep);
    
    // Atualiza contadores
    const newSubdivisionCount = (subdivisionCount + 1) % subdivision;
    const beatIncrement = newSubdivisionCount === 0 ? 1 : 0;
    const newBeatCount = ((beatCount - 1 + beatIncrement) % timeSignature.numerator) + 1;
    const measureIncrement = (beatIncrement === 1 && newBeatCount === 1) ? 1 : 0;
    const newMeasureCount = measureCount + measureIncrement;
    
    setSubdivisionCount(newSubdivisionCount);
    setBeatCount(newBeatCount);
    if (measureIncrement > 0) {
      setMeasureCount(newMeasureCount);
    }
    
    // Verifica se precisa avançar permutação
    if (permutationEnabled && nextStep === 0 && sequence.length > 0) {
      advancePermutation();
    }
    
    return {
      step: nextStep,
      beat: newBeatCount,
      measure: newMeasureCount,
      subdivision: newSubdivisionCount,
    };
  }, [currentStep, sequence, subdivision, beatCount, measureCount, subdivisionCount, timeSignature, permutationEnabled]);

  /**
   * Avança manualmente (para modo manual)
   */
  const advanceManual = useCallback(() => {
    if (!isPlaying) return;
    
    const now = Date.now();
    const timeSinceLastStep = now - engineRef.current.lastStepTime;
    const minStepInterval = 50; // ms mínimo entre passos
    
    if (timeSinceLastStep < minStepInterval) return;
    
    engineRef.current.lastStepTime = now;
    return advanceStep();
  }, [isPlaying, advanceStep]);

  /**
   * Inicia reprodução automática
   */
  const startPlayback = useCallback(() => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    engineRef.current.lastStepTime = Date.now();
    
    // Limpa timers anteriores
    engineRef.current.timeoutIds.forEach(id => clearTimeout(id));
    engineRef.current.intervalIds.forEach(id => clearInterval(id));
    engineRef.current.timeoutIds = [];
    engineRef.current.intervalIds = [];
    
    if (playMode === 'manual') {
      // Modo manual não precisa de timer
      return;
    }
    
    // Calcula intervalo baseado no BPM e subdivisão
    const beatDuration = 60000 / bpm; // ms por batida
    const stepDuration = beatDuration / subdivision; // ms por subdivisão
    
    // Inicia timer para modo automático
    if (playMode === 'auto-up' || playMode === 'auto-down') {
      const intervalId = setInterval(() => {
        advanceStep();
      }, stepDuration);
      
      engineRef.current.intervalIds.push(intervalId);
    }
  }, [isPlaying, playMode, bpm, subdivision, advanceStep]);

  /**
   * Para reprodução
   */
  const stopPlayback = useCallback(() => {
    setIsPlaying(false);
    
    // Limpa todos os timers
    engineRef.current.timeoutIds.forEach(id => clearTimeout(id));
    engineRef.current.intervalIds.forEach(id => clearInterval(id));
    engineRef.current.timeoutIds = [];
    engineRef.current.intervalIds = [];
    
    if (engineRef.current.gapTimeout) {
      clearTimeout(engineRef.current.gapTimeout);
      engineRef.current.gapTimeout = null;
    }
    
    engineRef.current.isInGap = false;
  }, []);

  /**
   * Configura permutação
   */
  const setupPermutation = useCallback((start = 1, end = 9) => {
    const sequences = generatePermutationSequences(start, end);
    setPermutationSequences(sequences);
    setPermutationStart(start);
    setPermutationEnd(end);
    setCurrentPermutationIndex(0);
    
    if (sequences.length > 0) {
      updateSequence(sequences[0]);
    }
  }, [updateSequence]);

  /**
   * Avança para a próxima permutação
   */
  const advancePermutation = useCallback(() => {
    if (!permutationEnabled || permutationSequences.length === 0) return;
    
    const nextIndex = (currentPermutationIndex + 1) % permutationSequences.length;
    setCurrentPermutationIndex(nextIndex);
    
    // Adiciona gap se habilitado
    if (gapEnabled) {
      engineRef.current.isInGap = true;
      
      // Para temporariamente
      const wasPlaying = isPlaying;
      if (wasPlaying) {
        stopPlayback();
      }
      
      // Agenda retorno após gap
      engineRef.current.gapTimeout = setTimeout(() => {
        engineRef.current.isInGap = false;
        updateSequence(permutationSequences[nextIndex]);
        
        if (wasPlaying) {
          startPlayback();
        }
      }, 500); // 500ms de gap
    } else {
      updateSequence(permutationSequences[nextIndex]);
    }
    
    return nextIndex;
  }, [
    permutationEnabled,
    permutationSequences,
    currentPermutationIndex,
    gapEnabled,
    isPlaying,
    stopPlayback,
    updateSequence,
    startPlayback,
  ]);

  /**
   * Configura auto-loop
   */
  const setupAutoLoop = useCallback((direction = 'ping-pong', min = 1, max = 9) => {
    setAutoLoopDirection(direction);
    setAutoLoopMin(min);
    setAutoLoopMax(max);
    
    // Limpa timer anterior
    if (autoLoopTimer) {
      clearInterval(autoLoopTimer);
    }
    
    if (autoLoopEnabled) {
      // Inicia timer para auto-loop
      const timer = setInterval(() => {
        const nextSubdivision = calculateNextAutoLoopStep(
          subdivision,
          direction,
          min,
          max
        );
        
        if (nextSubdivision !== subdivision) {
          setSubdivision(nextSubdivision);
          updateSequence(generateSequence({ count: nextSubdivision }));
        }
      }, 4000); // Muda a cada 4 compassos (ajustável)
      
      setAutoLoopTimer(timer);
    }
  }, [autoLoopEnabled, subdivision, updateSequence, generateSequence]);

  /**
   * Aplica um perfil de volume pré-configurado
   */
  const applyVolumeProfile = useCallback((profileName) => {
    const profile = VOLUME_PROFILES[profileName.toUpperCase()];
    
    if (!profile) {
      console.warn(`Perfil de volume não encontrado: ${profileName}`);
      return;
    }
    
    setVolumes(profile.volumes.slice(0, subdivision));
    updateSequence(generateSequence({ volumes: profile.volumes }));
  }, [subdivision, updateSequence, generateSequence]);

  /**
   * Aplica um padrão de groove
   */
  const applyGroove = useCallback((type, amount = 1) => {
    const groove = GROOVE_PATTERNS[type];
    
    if (!groove) {
      console.warn(`Padrão de groove não encontrado: ${type}`);
      return;
    }
    
    setGrooveType(type);
    setGrooveAmount(amount);
    updateSequence(generateSequence({ grooveType: type, grooveAmount: amount }));
  }, [updateSequence, generateSequence]);

  /**
   * Atualiza o volume de um step específico
   */
  const updateStepVolume = useCallback((stepIndex, volume) => {
    if (stepIndex < 0 || stepIndex >= sequence.length) return;
    
    const newSequence = [...sequence];
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    newSequence[stepIndex] = {
      ...newSequence[stepIndex],
      volume: clampedVolume,
      accent: clampedVolume > 0.7,
    };
    
    // Atualiza volumes correspondentes
    const newVolumes = [...volumes];
    const volumeIndex = stepIndex % volumes.length;
    newVolumes[volumeIndex] = clampedVolume;
    
    setVolumes(newVolumes);
    setSequence(newSequence);
  }, [sequence, volumes]);

  /**
   * Alterna atividade de um step
   */
  const toggleStepActive = useCallback((stepIndex) => {
    if (stepIndex < 0 || stepIndex >= sequence.length) return;
    
    const newSequence = [...sequence];
    newSequence[stepIndex] = {
      ...newSequence[stepIndex],
      active: !newSequence[stepIndex].active,
    };
    
    setSequence(newSequence);
  }, [sequence]);

  /**
   * Reseta para configuração padrão
   */
  const resetToDefault = useCallback(() => {
    setBpm(120);
    setTimeSignature(TIME_SIGNATURES['4/4']);
    setSubdivision(4);
    setAppMode('beginner');
    setPlayMode('manual');
    
    // Reseta features PRO
    setPermutationEnabled(false);
    setGapEnabled(false);
    setGhostModeEnabled(false);
    setAutoLoopEnabled(false);
    
    // Reseta groove
    setGrooveType('STRAIGHT');
    setGrooveAmount(0);
    
    // Gera nova sequência padrão
    const defaultSequence = generateSequence({
      count: 4,
      volumes: VOLUME_PROFILES.BEGINNER.volumes.slice(0, 4),
    });
    
    updateSequence(defaultSequence);
    setVolumes(VOLUME_PROFILES.BEGINNER.volumes.slice(0, 4));
  }, [generateSequence, updateSequence]);

  /**
   * Exporta configuração atual
   */
  const exportConfiguration = useCallback(() => {
    const config = {
      bpm,
      timeSignature,
      subdivision,
      volumes,
      sequence,
      appMode,
      playMode,
      proFeatures: {
        permutationEnabled,
        gapEnabled,
        ghostModeEnabled,
        autoLoopEnabled,
        grooveType,
        grooveAmount,
      },
      permutation: {
        start: permutationStart,
        end: permutationEnd,
        currentIndex: currentPermutationIndex,
      },
      autoLoop: {
        direction: autoLoopDirection,
        min: autoLoopMin,
        max: autoLoopMax,
      },
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        totalSteps: sequence.length,
      },
    };
    
    return JSON.stringify(config, null, 2);
  }, [
    bpm,
    timeSignature,
    subdivision,
    volumes,
    sequence,
    appMode,
    playMode,
    permutationEnabled,
    gapEnabled,
    ghostModeEnabled,
    autoLoopEnabled,
    grooveType,
    grooveAmount,
    permutationStart,
    permutationEnd,
    currentPermutationIndex,
    autoLoopDirection,
    autoLoopMin,
    autoLoopMax,
  ]);

  /**
   * Importa configuração
   */
  const importConfiguration = useCallback((jsonConfig) => {
    try {
      const config = JSON.parse(jsonConfig);
      
      // Aplica configurações básicas
      if (config.bpm) setBpm(config.bpm);
      if (config.timeSignature) setTimeSignature(config.timeSignature);
      if (config.subdivision) setSubdivision(config.subdivision);
      if (config.volumes) setVolumes(config.volumes);
      if (config.appMode) setAppMode(config.appMode);
      if (config.playMode) setPlayMode(config.playMode);
      
      // Aplica features PRO
      if (config.proFeatures) {
        const pf = config.proFeatures;
        setPermutationEnabled(pf.permutationEnabled || false);
        setGapEnabled(pf.gapEnabled || false);
        setGhostModeEnabled(pf.ghostModeEnabled || false);
        setAutoLoopEnabled(pf.autoLoopEnabled || false);
        setGrooveType(pf.grooveType || 'STRAIGHT');
        setGrooveAmount(pf.grooveAmount || 0);
      }
      
      // Aplica permutação
      if (config.permutation) {
        setPermutationStart(config.permutation.start || 1);
        setPermutationEnd(config.permutation.end || 9);
        setCurrentPermutationIndex(config.permutation.currentIndex || 0);
      }
      
      // Aplica auto-loop
      if (config.autoLoop) {
        setAutoLoopDirection(config.autoLoop.direction || 'ping-pong');
        setAutoLoopMin(config.autoLoop.min || 1);
        setAutoLoopMax(config.autoLoop.max || 9);
      }
      
      // Aplica sequência ou gera nova
      if (config.sequence && Array.isArray(config.sequence)) {
        setSequence(config.sequence);
      } else {
        const newSequence = generateSequence({
          count: config.subdivision || subdivision,
          volumes: config.volumes || volumes,
        });
        updateSequence(newSequence);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao importar configuração:', error);
      return false;
    }
  }, [subdivision, volumes, generateSequence, updateSequence]);

  /**
   * Obtém informações do step atual
   */
  const getCurrentStepInfo = useCallback(() => {
    if (sequence.length === 0 || currentStep >= sequence.length) {
      return null;
    }
    
    const step = sequence[currentStep];
    
    return {
      ...step,
      stepIndex: currentStep,
      beat: beatCount,
      measure: measureCount,
      subdivision: subdivisionCount + 1,
      isActive: step.active,
      isAccent: step.accent,
      isGhost: step.volume < 0.3,
      timing: {
        bpm,
        beatDuration: 60000 / bpm,
        stepDuration: 60000 / bpm / subdivision,
        nextStepTime: engineRef.current.lastStepTime + (60000 / bpm / subdivision),
      },
    };
  }, [sequence, currentStep, beatCount, measureCount, subdivisionCount, bpm, subdivision]);

  // Efeito: inicializa sequência
  useEffect(() => {
    const initialSequence = generateSequence();
    updateSequence(initialSequence);
  }, []); // Apenas no mount

  // Efeito: atualiza sequência quando configurações mudam
  useEffect(() => {
    if (sequence.length === 0) return;
    
    const newSequence = generateSequence();
    updateSequence(newSequence);
  }, [
    subdivision,
    timeSignature,
    grooveType,
    grooveAmount,
    ghostModeEnabled,
    generateSequence,
    updateSequence,
  ]);

  // Efeito: gerencia auto-loop
  useEffect(() => {
    if (autoLoopEnabled) {
      setupAutoLoop(autoLoopDirection, autoLoopMin, autoLoopMax);
    } else if (autoLoopTimer) {
      clearInterval(autoLoopTimer);
      setAutoLoopTimer(null);
    }
    
    return () => {
      if (autoLoopTimer) {
        clearInterval(autoLoopTimer);
      }
    };
  }, [autoLoopEnabled, autoLoopDirection, autoLoopMin, autoLoopMax, setupAutoLoop]);

  // Efeito: gerencia permutação
  useEffect(() => {
    if (permutationEnabled && permutationSequences.length === 0) {
      setupPermutation(permutationStart, permutationEnd);
    }
  }, [permutationEnabled, permutationSequences, setupPermutation, permutationStart, permutationEnd]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  return {
    // Estados
    bpm,
    timeSignature,
    subdivision,
    sequence,
    volumes,
    appMode,
    playMode,
    isPlaying,
    
    // Estados PRO
    permutationEnabled,
    gapEnabled,
    ghostModeEnabled,
    autoLoopEnabled,
    grooveType,
    grooveAmount,
    
    // Estados de permutação
    permutationStart,
    permutationEnd,
    currentPermutationIndex,
    permutationSequences,
    
    // Estados de auto-loop
    autoLoopDirection,
    autoLoopMin,
    autoLoopMax,
    
    // Contadores
    measureCount,
    beatCount,
    subdivisionCount,
    currentStep,
    
    // Setters
    setBpm,
    setTimeSignature,
    setSubdivision,
    setAppMode,
    setPlayMode,
    setPermutationEnabled,
    setGapEnabled,
    setGhostModeEnabled,
    setAutoLoopEnabled,
    setGrooveType,
    setGrooveAmount,
    setPermutationStart,
    setPermutationEnd,
    setAutoLoopDirection,
    setAutoLoopMin,
    setAutoLoopMax,
    
    // Métodos de controle
    startPlayback,
    stopPlayback,
    advanceManual,
    advanceStep,
    
    // Métodos de configuração
    generateSequence,
    updateSequence,
    applyVolumeProfile,
    applyGroove,
    updateStepVolume,
    toggleStepActive,
    resetToDefault,
    
    // Métodos de permutação
    setupPermutation,
    advancePermutation,
    
    // Métodos de auto-loop
    setupAutoLoop,
    
    // Import/Export
    exportConfiguration,
    importConfiguration,
    
    // Utilitários
    getCurrentStepInfo,
    
    // Status
    isInGap: engineRef.current.isInGap,
    totalSteps: sequence.length,
    currentStepInfo: getCurrentStepInfo(),
  };
}

/**
 * Hook especializado para modo Iniciante
 */
export function useBeginnerMode(initialState = {}) {
  const engine = useMetronomeEngine({
    ...initialState,
    appMode: 'beginner',
    playMode: 'manual',
    subdivision: 4,
    volumes: VOLUME_PROFILES.BEGINNER.volumes.slice(0, 4),
  });
  
  // Configurações específicas para iniciantes
  const setSimpleSubdivision = useCallback((subdivision) => {
    // Apenas subdivisões simples para iniciantes
    const allowedSubdivisions = [1, 2, 4];
    const safeSubdivision = allowedSubdivisions.includes(subdivision) ? subdivision : 4;
    
    engine.setSubdivision(safeSubdivision);
    
    // Atualiza volumes para perfil iniciante
    const newVolumes = VOLUME_PROFILES.BEGINNER.volumes.slice(0, safeSubdivision);
    engine.setVolumes(newVolumes);
    
    const newSequence = engine.generateSequence({
      count: safeSubdivision,
      volumes: newVolumes,
    });
    
    engine.updateSequence(newSequence);
  }, [engine]);
  
  return {
    ...engine,
    setSubdivision: setSimpleSubdivision,
    // Limita outras configurações para iniciantes
    setPermutationEnabled: () => {}, // Desabilitado
    setGapEnabled: () => {}, // Desabilitado
    setGhostModeEnabled: () => {}, // Desabilitado
    setAutoLoopEnabled: () => {}, // Desabilitado
    setGrooveType: () => {}, // Desabilitado
  };
}

/**
 * Hook especializado para modo PRO
 */
export function useProMode(initialState = {}) {
  const engine = useMetronomeEngine({
    ...initialState,
    appMode: 'pro',
    playMode: 'auto-up',
    permutationEnabled: true,
    gapEnabled: true,
  });
  
  // Métodos avançados específicos para PRO
  const generatePolyrhythmSequence = useCallback((base, overlay) => {
    const sequence = generatePolyrhythm(base, overlay, base * overlay);
    engine.updateSequence(sequence);
    engine.setSubdivision(base * overlay);
  }, [engine]);
  
  const generateRandomGroove = useCallback((complexity = 0.5) => {
    const grooveTypes = Object.keys(GROOVE_PATTERNS);
    const randomGroove = grooveTypes[Math.floor(Math.random() * grooveTypes.length)];
    const randomAmount = 0.5 + Math.random() * 0.5;
    
    engine.setGrooveType(randomGroove);
    engine.setGrooveAmount(randomAmount);
    
    const newSequence = engine.generateSequence({
      grooveType: randomGroove,
      grooveAmount: randomAmount,
      syncopation: complexity,
    });
    
    engine.updateSequence(newSequence);
  }, [engine]);
  
  const enableAllProFeatures = useCallback(() => {
    engine.setPermutationEnabled(true);
    engine.setGapEnabled(true);
    engine.setGhostModeEnabled(true);
    engine.setAutoLoopEnabled(true);
    engine.setGrooveType('SWING_58');
    engine.setGrooveAmount(0.7);
    
    // Configura permutação completa
    engine.setupPermutation(1, 9);
  }, [engine]);
  
  return {
    ...engine,
    generatePolyrhythmSequence,
    generateRandomGroove,
    enableAllProFeatures,
  };
}

export default {
  useMetronomeEngine,
  useBeginnerMode,
  useProMode,
};
