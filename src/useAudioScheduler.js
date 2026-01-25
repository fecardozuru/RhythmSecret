// /src/hooks/useAudioScheduler.js

/**
 * Hook para scheduler de áudio com compensação de latência
 * Agendamento preciso de eventos de áudio com lookahead
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import AudioContextService from '../services/audioContext';
import { calculateBeatDuration, calculateNextSchedulerTime, applyLatencyCompensation } from '../utils/timingUtils';
import { AUDIO_CONFIG } from '../constants/audioConfig';

/**
 * Hook principal para scheduler de áudio
 * @param {Object} options - Opções de configuração
 */
export function useAudioScheduler(options = {}) {
  const {
    lookahead = AUDIO_CONFIG.LOOKAHEAD, // ms para olhar à frente
    scheduleInterval = AUDIO_CONFIG.SCHEDULE_INTERVAL, // ms entre verificações
    latencyCompensation = AUDIO_CONFIG.LATENCY_COMPENSATION, // ms de compensação
    onTick = null, // Callback para cada tick do scheduler
    onSchedule = null, // Callback para eventos agendados
  } = options;

  // Referências para estado do scheduler
  const schedulerRef = useRef({
    nextTickTime: 0,
    timerId: null,
    isRunning: false,
    scheduledEvents: new Map(), // Map<id, event>
    audioContext: null,
    startTime: 0,
    currentBeat: 0,
    currentSubdivision: 0,
  });

  // Estado do hook
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [bpm, setBpm] = useState(AUDIO_CONFIG.DEFAULT_BPM);
  const [subdivision, setSubdivision] = useState(4);
  const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
  const [sequence, setSequence] = useState([]);
  const [volume, setVolume] = useState(AUDIO_CONFIG.DEFAULT_VOLUME);

  // Referências para callbacks atualizados
  const onTickRef = useRef(onTick);
  const onScheduleRef = useRef(onSchedule);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onScheduleRef.current = onSchedule;
  }, [onSchedule]);

  /**
   * Inicializa o contexto de áudio
   */
  const initializeAudio = useCallback(async () => {
    try {
      const audioService = AudioContextService.getInstance();
      const initialized = await audioService.initialize();
      
      if (initialized) {
        schedulerRef.current.audioContext = audioService;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao inicializar áudio:', error);
      return false;
    }
  }, []);

  /**
   * Calcula o tempo do próximo evento baseado em BPM e subdivisão
   */
  const calculateNextEventTime = useCallback((baseTime, eventIndex) => {
    const beatDuration = calculateBeatDuration(bpm);
    const subdivisionDuration = beatDuration / subdivision;
    return baseTime + (eventIndex * subdivisionDuration);
  }, [bpm, subdivision]);

  /**
   * Agenda um evento de áudio
   */
  const scheduleEvent = useCallback((event) => {
    const { audioContext } = schedulerRef.current;
    
    if (!audioContext || !isPlaying) return null;
    
    try {
      const compensatedTime = applyLatencyCompensation(
        event.scheduleTime,
        latencyCompensation
      );
      
      // Converte para segundos (AudioContext usa segundos)
      const scheduleTimeSeconds = compensatedTime / 1000;
      const audioTime = audioContext.getCurrentTimeMs() / 1000;
      
      // Verifica se ainda está no futuro
      if (scheduleTimeSeconds < audioTime) {
        return null;
      }
      
      // Toca o som
      const audioNode = audioContext.playBuffer(
        event.bufferType || 'main',
        scheduleTimeSeconds,
        event.volume * volume,
        event.playbackRate || 1.0
      );
      
      // Chama callback se fornecido
      if (onScheduleRef.current) {
        onScheduleRef.current(event, scheduleTimeSeconds);
      }
      
      // Armazena no mapa de eventos agendados
      const eventId = `${event.type}-${event.index}-${scheduleTimeSeconds}`;
      schedulerRef.current.scheduledEvents.set(eventId, {
        ...event,
        audioNode,
        scheduleTime: scheduleTimeSeconds,
        played: false,
      });
      
      return eventId;
    } catch (error) {
      console.error('Erro ao agendar evento:', error);
      return null;
    }
  }, [isPlaying, volume, latencyCompensation]);

  /**
   * Agenda uma sequência completa de eventos
   */
  const scheduleSequence = useCallback((baseTime, sequenceData) => {
    if (!sequenceData || sequenceData.length === 0) return;
    
    const eventIds = [];
    
    sequenceData.forEach((step, index) => {
      if (!step.active) return;
      
      const eventTime = calculateNextEventTime(baseTime, index);
      
      const event = {
        type: 'sequence',
        index,
        scheduleTime: eventTime,
        volume: step.volume,
        bufferType: step.accent ? 'accent' : 
                   step.volume < 0.3 ? 'ghost' : 'main',
        data: step,
      };
      
      const eventId = scheduleEvent(event);
      if (eventId) {
        eventIds.push(eventId);
      }
    });
    
    return eventIds;
  }, [calculateNextEventTime, scheduleEvent]);

  /**
   * Agenda um clique de metrônomo
   */
  const scheduleMetronomeClick = useCallback((time, isAccent = false) => {
    const event = {
      type: 'metronome',
      scheduleTime: time,
      volume: isAccent ? 1.0 : 0.7,
      bufferType: 'click',
      isAccent,
    };
    
    return scheduleEvent(event);
  }, [scheduleEvent]);

  /**
   * Loop principal do scheduler
   */
  const schedulerTick = useCallback(() => {
    const scheduler = schedulerRef.current;
    if (!scheduler.isRunning || !scheduler.audioContext) return;
    
    const now = performance.now();
    const audioNow = scheduler.audioContext.getCurrentTimeMs();
    
    // Calcula o próximo tempo de tick
    if (scheduler.nextTickTime === 0) {
      scheduler.nextTickTime = calculateNextSchedulerTime(now, scheduleInterval);
    }
    
    // Executa apenas se for hora
    if (now < scheduler.nextTickTime) return;
    
    // Atualiza tempo atual
    setCurrentTime(audioNow);
    
    // Executa callback de tick
    if (onTickRef.current) {
      onTickRef.current({
        currentTime: audioNow,
        bpm,
        subdivision,
        timeSignature,
        beat: scheduler.currentBeat,
        subdivisionIndex: scheduler.currentSubdivision,
      });
    }
    
    // Calcula lookahead window
    const lookaheadStart = audioNow;
    const lookaheadEnd = audioNow + lookahead;
    
    // Agenda eventos dentro da janela de lookahead
    if (isPlaying && sequence.length > 0) {
      const beatDuration = calculateBeatDuration(bpm);
      const measureDuration = beatDuration * timeSignature.numerator;
      const subdivisionDuration = beatDuration / subdivision;
      
      // Calcula próximo evento na sequência
      const timeSinceStart = audioNow - scheduler.startTime;
      const currentPosition = timeSinceStart % (sequence.length * subdivisionDuration);
      const nextSequenceIndex = Math.floor(currentPosition / subdivisionDuration);
      
      // Atualiza contadores
      const totalSubdivisions = timeSignature.numerator * subdivision;
      const absoluteSubdivision = Math.floor(timeSinceStart / subdivisionDuration);
      
      scheduler.currentBeat = Math.floor(absoluteSubdivision / subdivision) % timeSignature.numerator;
      scheduler.currentSubdivision = absoluteSubdivision % subdivision;
      
      // Agenda próximo evento da sequência
      if (nextSequenceIndex < sequence.length && sequence[nextSequenceIndex].active) {
        const eventTime = scheduler.startTime + (absoluteSubdivision + 1) * subdivisionDuration;
        
        if (eventTime >= lookaheadStart && eventTime <= lookaheadEnd) {
          const step = sequence[nextSequenceIndex];
          
          scheduleEvent({
            type: 'sequence',
            index: nextSequenceIndex,
            scheduleTime: eventTime,
            volume: step.volume,
            bufferType: step.accent ? 'accent' : 
                       step.volume < 0.3 ? 'ghost' : 'main',
            data: step,
          });
        }
      }
      
      // Agenda clique de metrônomo (primeira subdivisão de cada batida)
      if (scheduler.currentSubdivision === 0) {
        const nextBeatTime = scheduler.startTime + (absoluteSubdivision + subdivision) * subdivisionDuration;
        
        if (nextBeatTime >= lookaheadStart && nextBeatTime <= lookaheadEnd) {
          const isAccent = scheduler.currentBeat === 0; // Acento no primeiro tempo
          scheduleMetronomeClick(nextBeatTime, isAccent);
        }
      }
    }
    
    // Limpa eventos já tocados
    cleanupPlayedEvents(audioNow);
    
    // Agenda próximo tick
    scheduler.nextTickTime += scheduleInterval;
    
    // Se estamos atrasados, pula para o próximo intervalo
    if (now > scheduler.nextTickTime + scheduleInterval) {
      scheduler.nextTickTime = calculateNextSchedulerTime(now, scheduleInterval);
    }
  }, [
    isPlaying,
    bpm,
    subdivision,
    timeSignature,
    sequence,
    scheduleInterval,
    lookahead,
    scheduleEvent,
    scheduleMetronomeClick,
  ]);

  /**
   * Limpa eventos que já foram tocados
   */
  const cleanupPlayedEvents = useCallback((currentTime) => {
    const { scheduledEvents } = schedulerRef.current;
    
    for (const [id, event] of scheduledEvents.entries()) {
      if (event.scheduleTime < currentTime - 1000) { // 1 segundo após tocar
        scheduledEvents.delete(id);
      }
    }
  }, []);

  /**
   * Inicia o scheduler
   */
  const start = useCallback(async () => {
    if (schedulerRef.current.isRunning) return;
    
    // Inicializa áudio se necessário
    if (!schedulerRef.current.audioContext) {
      const initialized = await initializeAudio();
      if (!initialized) return false;
    }
    
    // Retoma contexto de áudio se suspenso
    await schedulerRef.current.audioContext.resume();
    
    // Configura estado inicial
    schedulerRef.current.isRunning = true;
    schedulerRef.current.startTime = schedulerRef.current.audioContext.getCurrentTimeMs();
    schedulerRef.current.nextTickTime = 0;
    schedulerRef.current.currentBeat = 0;
    schedulerRef.current.currentSubdivision = 0;
    
    setIsPlaying(true);
    
    // Inicia loop do scheduler
    const schedulerLoop = () => {
      if (!schedulerRef.current.isRunning) return;
      
      schedulerTick();
      schedulerRef.current.timerId = requestAnimationFrame(schedulerLoop);
    };
    
    schedulerRef.current.timerId = requestAnimationFrame(schedulerLoop);
    
    return true;
  }, [initializeAudio, schedulerTick]);

  /**
   * Para o scheduler
   */
  const stop = useCallback(() => {
    schedulerRef.current.isRunning = false;
    
    if (schedulerRef.current.timerId) {
      cancelAnimationFrame(schedulerRef.current.timerId);
      schedulerRef.current.timerId = null;
    }
    
    setIsPlaying(false);
    
    // Limpa eventos agendados
    schedulerRef.current.scheduledEvents.clear();
  }, []);

  /**
   * Pausa o scheduler (mantém estado)
   */
  const pause = useCallback(() => {
    schedulerRef.current.isRunning = false;
    
    if (schedulerRef.current.timerId) {
      cancelAnimationFrame(schedulerRef.current.timerId);
      schedulerRef.current.timerId = null;
    }
    
    setIsPlaying(false);
  }, []);

  /**
   * Reinicia o scheduler do início
   */
  const restart = useCallback(() => {
    stop();
    
    setTimeout(() => {
      schedulerRef.current.startTime = schedulerRef.current.audioContext 
        ? schedulerRef.current.audioContext.getCurrentTimeMs() + 100 // 100ms delay
        : performance.now() + 100;
      
      start();
    }, 50);
  }, [start, stop]);

  /**
   * Altera BPM em tempo real
   */
  const changeBpm = useCallback((newBpm) => {
    setBpm(newBpm);
    
    // Recalcula tempo inicial para manter sincronia
    if (isPlaying && schedulerRef.current.audioContext) {
      const now = schedulerRef.current.audioContext.getCurrentTimeMs();
      const elapsed = now - schedulerRef.current.startTime;
      
      // Ajusta startTime para compensar mudança de BPM
      const oldBeatDuration = calculateBeatDuration(bpm);
      const newBeatDuration = calculateBeatDuration(newBpm);
      const adjustment = elapsed * (newBeatDuration / oldBeatDuration - 1);
      
      schedulerRef.current.startTime -= adjustment;
    }
  }, [isPlaying, bpm]);

  /**
   * Avança manualmente para o próximo evento (para modo manual)
   */
  const advanceManual = useCallback(() => {
    if (!isPlaying || !schedulerRef.current.audioContext) return;
    
    const now = schedulerRef.current.audioContext.getCurrentTimeMs();
    const subdivisionDuration = calculateBeatDuration(bpm) / subdivision;
    
    // Agenda próximo evento imediatamente
    const eventTime = now + 50; // 50ms no futuro
    
    // Encontra próximo step ativo
    const timeSinceStart = now - schedulerRef.current.startTime;
    const currentIndex = Math.floor(timeSinceStart / subdivisionDuration) % sequence.length;
    
    let nextIndex = (currentIndex + 1) % sequence.length;
    let stepsSkipped = 0;
    
    // Pula steps inativos
    while (!sequence[nextIndex]?.active && stepsSkipped < sequence.length) {
      nextIndex = (nextIndex + 1) % sequence.length;
      stepsSkipped++;
    }
    
    if (stepsSkipped < sequence.length && sequence[nextIndex]?.active) {
      const step = sequence[nextIndex];
      const scheduleTime = schedulerRef.current.startTime + 
                         (currentIndex + 1 + stepsSkipped) * subdivisionDuration;
      
      scheduleEvent({
        type: 'manual',
        index: nextIndex,
        scheduleTime: scheduleTime,
        volume: step.volume,
        bufferType: step.accent ? 'accent' : 
                   step.volume < 0.3 ? 'ghost' : 'main',
        data: step,
      });
      
      // Atualiza contadores
      schedulerRef.current.currentSubdivision = nextIndex % subdivision;
      schedulerRef.current.currentBeat = Math.floor(nextIndex / subdivision) % timeSignature.numerator;
    }
  }, [isPlaying, bpm, subdivision, sequence, timeSignature, scheduleEvent]);

  /**
   * Obtém informações atuais de timing
   */
  const getTimingInfo = useCallback(() => {
    const scheduler = schedulerRef.current;
    
    if (!scheduler.audioContext) {
      return {
        currentTime: 0,
        currentBeat: 0,
        currentSubdivision: 0,
        measure: 0,
        positionInMeasure: 0,
        positionInSequence: 0,
      };
    }
    
    const now = scheduler.audioContext.getCurrentTimeMs();
    const elapsed = now - scheduler.startTime;
    
    const beatDuration = calculateBeatDuration(bpm);
    const subdivisionDuration = beatDuration / subdivision;
    const measureDuration = beatDuration * timeSignature.numerator;
    
    const absoluteSubdivision = Math.floor(elapsed / subdivisionDuration);
    const currentBeat = Math.floor(absoluteSubdivision / subdivision) % timeSignature.numerator;
    const currentSubdivision = absoluteSubdivision % subdivision;
    const measure = Math.floor(elapsed / measureDuration);
    const positionInMeasure = (elapsed % measureDuration) / measureDuration;
    const positionInSequence = sequence.length > 0 
      ? (absoluteSubdivision % sequence.length) / sequence.length 
      : 0;
    
    return {
      currentTime: now,
      currentBeat,
      currentSubdivision,
      measure: measure + 1,
      positionInMeasure,
      positionInSequence,
      absoluteSubdivision,
      nextBeatTime: scheduler.startTime + (absoluteSubdivision + 1) * subdivisionDuration,
    };
  }, [bpm, subdivision, timeSignature, sequence]);

  // Efeito de cleanup
  useEffect(() => {
    return () => {
      stop();
      
      // Suspende contexto de áudio para economia de bateria
      if (schedulerRef.current.audioContext) {
        schedulerRef.current.audioContext.suspend();
      }
    };
  }, [stop]);

  return {
    // Estado
    isPlaying,
    currentTime,
    bpm,
    subdivision,
    timeSignature,
    sequence,
    volume,
    
    // Setters
    setBpm: changeBpm,
    setSubdivision,
    setTimeSignature,
    setSequence,
    setVolume,
    
    // Controles
    start,
    stop,
    pause,
    restart,
    advanceManual,
    
    // Informações
    getTimingInfo,
    
    // Configurações
    lookahead,
    scheduleInterval,
    latencyCompensation,
    
    // Status
    isInitialized: !!schedulerRef.current.audioContext,
  };
}

/**
 * Hook simplificado para metrônomo básico
 */
export function useMetronomeScheduler(options = {}) {
  const {
    bpm = 120,
    timeSignature = { numerator: 4, denominator: 4 },
    onBeat = null,
    onAccent = null,
  } = options;
  
  const scheduler = useAudioScheduler({
    ...options,
    onTick: (timing) => {
      if (timing.subdivisionIndex === 0) {
        const isAccent = timing.beat === 0;
        
        if (isAccent && onAccent) {
          onAccent(timing.beat + 1);
        } else if (onBeat) {
          onBeat(timing.beat + 1);
        }
      }
    },
  });
  
  return scheduler;
}

/**
 * Hook para scheduler com suporte a loops
 */
export function useLoopScheduler(options = {}) {
  const {
    loopLength = 1, // Em medidas
    onLoopStart = null,
    onLoopEnd = null,
  } = options;
  
  const [loopCount, setLoopCount] = useState(0);
  const [isInLoop, setIsInLoop] = useState(true);
  
  const scheduler = useAudioScheduler({
    ...options,
    onTick: (timing) => {
      // Detecta início de loop (primeira batida da primeira medida)
      if (timing.beat === 0 && timing.subdivisionIndex === 0) {
        const beatDuration = calculateBeatDuration(timing.bpm);
        const measureDuration = beatDuration * timing.timeSignature.numerator;
        const elapsed = timing.currentTime - scheduler.getTimingInfo().startTime;
        const currentLoop = Math.floor(elapsed / (measureDuration * loopLength));
        
        if (currentLoop > loopCount) {
          setLoopCount(currentLoop);
          onLoopStart?.(currentLoop);
        }
      }
      
      // Detecta se está dentro do loop
      const loopDuration = calculateBeatDuration(timing.bpm) * 
                          timing.timeSignature.numerator * 
                          loopLength;
      const elapsed = timing.currentTime - scheduler.getTimingInfo().startTime;
      const positionInLoop = elapsed % loopDuration;
      
      setIsInLoop(positionInLoop < loopDuration * 0.95); // 95% para anticipação
    },
  });
  
  return {
    ...scheduler,
    loopCount,
    isInLoop,
    loopLength,
  };
}

export default {
  useAudioScheduler,
  useMetronomeScheduler,
  useLoopScheduler,
};
