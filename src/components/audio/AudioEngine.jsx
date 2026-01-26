// /src/components/audio/AudioEngine.jsx

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Zap, 
  Settings,
  Headphones,
  Mic,
  Waves,
  Activity,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCw
} from 'lucide-react';
import { formatDuration, formatVolume } from '../../utils/formatters';
import { calculateBeatDuration } from '../../utils/timingUtils';
import { AUDIO_CONFIG, TIMBRE_CONFIG } from '../../constants/audioConfig';
import AudioContextService from '../../services/audioContext';

/**
 * AudioEngine - Motor de áudio principal com compensação de latência
 * Gerencia Web Audio API, buffers, efeitos e sincronização precisa
 */
const AudioEngine = ({
  bpm = 120,
  sequence = [],
  currentStep = 0,
  isPlaying = false,
  masterVolume = 0.8,
  latencyCompensation = 25,
  onLatencyChange,
  onVolumeChange,
  onError,
  showAdvanced = true,
  compact = false,
  theme = 'default',
  className = '',
}) => {
  // Estado do motor de áudio
  const [audioState, setAudioState] = useState({
    isInitialized: false,
    isSuspended: true,
    currentLatency: 0,
    measuredLatency: 0,
    audioError: null,
    bufferStatus: 'idle',
    activeVoices: 0,
    cpuUsage: 0,
    memoryUsage: 0,
  });
  
  const [localMasterVolume, setLocalMasterVolume] = useState(masterVolume);
  const [localLatencyComp, setLocalLatencyComp] = useState(latencyCompensation);
  const [showSettings, setShowSettings] = useState(false);
  const [performanceStats, setPerformanceStats] = useState({
    audioNodes: 0,
    bufferCount: 0,
    lastRenderTime: 0,
    frameRate: 60,
  });
  
  // Referências
  const audioServiceRef = useRef(null);
  const schedulerRef = useRef(null);
  const lastStepTimeRef = useRef(0);
  const statsIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Inicializa o motor de áudio
  const initializeAudio = useCallback(async () => {
    try {
      setAudioState(prev => ({ ...prev, bufferStatus: 'loading' }));
      
      // Obtém instância do serviço de áudio
      const audioService = AudioContextService.getInstance();
      const initialized = await audioService.initialize();
      
      if (!initialized) {
        throw new Error('Falha ao inicializar contexto de áudio');
      }
      
      audioServiceRef.current = audioService;
      
      // Mede latência real
      const measuredLatency = audioService.getOutputLatency();
      
      setAudioState({
        isInitialized: true,
        isSuspended: false,
        currentLatency: measuredLatency,
        measuredLatency,
        audioError: null,
        bufferStatus: 'loaded',
        activeVoices: 0,
        cpuUsage: 0,
        memoryUsage: 0,
      });
      
      // Configura volume inicial
      audioService.setMasterVolume(localMasterVolume);
      
      console.log('AudioEngine inicializado com latência:', measuredLatency, 'ms');
      return true;
    } catch (error) {
      console.error('Erro ao inicializar AudioEngine:', error);
      
      setAudioState(prev => ({
        ...prev,
        isInitialized: false,
        audioError: error.message,
        bufferStatus: 'error',
      }));
      
      if (onError) {
        onError(error);
      }
      
      return false;
    }
  }, [localMasterVolume, onError]);
  
  // Inicia/para reprodução
  const handlePlayPause = useCallback(async () => {
    if (!audioServiceRef.current) return;
    
    try {
      if (isPlaying) {
        // Para reprodução
        if (schedulerRef.current) {
          clearInterval(schedulerRef.current);
          schedulerRef.current = null;
        }
        
        await audioServiceRef.current.suspend();
        setAudioState(prev => ({ ...prev, isSuspended: true }));
      } else {
        // Inicia reprodução
        await audioServiceRef.current.resume();
        setAudioState(prev => ({ ...prev, isSuspended: false }));
        
        // Inicia scheduler
        startScheduler();
      }
    } catch (error) {
      console.error('Erro ao controlar reprodução:', error);
      setAudioState(prev => ({ ...prev, audioError: error.message }));
    }
  }, [isPlaying]);
  
  // Inicia o scheduler de áudio
  const startScheduler = useCallback(() => {
    if (!audioServiceRef.current || !isPlaying) return;
    
    const lookahead = AUDIO_CONFIG.LOOKAHEAD;
    const scheduleInterval = AUDIO_CONFIG.SCHEDULE_INTERVAL;
    
    let nextScheduledTime = 0;
    let scheduledSteps = new Set();
    
    const schedulerTick = () => {
      if (!audioServiceRef.current || !isPlaying) return;
      
      const audioTime = audioServiceRef.current.getCurrentTimeMs();
      const scheduleAheadTime = audioTime + lookahead;
      
      // Agenda eventos dentro da janela de lookahead
      if (nextScheduledTime < scheduleAheadTime) {
        const beatDuration = calculateBeatDuration(bpm);
        const stepDuration = beatDuration / 4; // Assumindo 4 subdivisões por batida
        
        // Encontra próximo step para agendar
        const timeSinceStart = audioTime;
        const stepsElapsed = Math.floor(timeSinceStart / stepDuration);
        const nextStep = stepsElapsed;
        
        // Agenda os próximos N steps
        const stepsToSchedule = 4; // Agenda 4 steps à frente
        for (let i = 0; i < stepsToSchedule; i++) {
          const stepIndex = (nextStep + i) % sequence.length;
          const stepTime = (stepsElapsed + i) * stepDuration;
          
          if (stepTime >= nextScheduledTime && stepTime <= scheduleAheadTime && !scheduledSteps.has(stepIndex)) {
            scheduleStep(stepIndex, stepTime);
            scheduledSteps.add(stepIndex);
          }
        }
        
        nextScheduledTime = scheduleAheadTime;
      }
      
      // Limpa steps antigos do conjunto
      const maxScheduledSteps = sequence.length * 2;
      if (scheduledSteps.size > maxScheduledSteps) {
        scheduledSteps = new Set(
          Array.from(scheduledSteps).slice(-maxScheduledSteps)
        );
      }
      
      // Agenda próximo tick
      animationFrameRef.current = requestAnimationFrame(schedulerTick);
    };
    
    // Inicia o loop do scheduler
    schedulerRef.current = setInterval(schedulerTick, scheduleInterval);
    schedulerTick();
  }, [bpm, isPlaying, sequence.length]);
  
  // Agenda um step para tocar
  const scheduleStep = useCallback((stepIndex, scheduleTime) => {
    if (!audioServiceRef.current || stepIndex >= sequence.length) return;
    
    const step = sequence[stepIndex];
    if (!step.active || step.volume <= 0) return;
    
    try {
      // Aplica compensação de latência
      const compensatedTime = scheduleTime + localLatencyComp;
      
      // Determina tipo de som baseado no volume e acento
      let bufferType = 'main';
      if (step.accent || step.volume > 0.7) {
        bufferType = 'accent';
      } else if (step.volume < 0.3) {
        bufferType = 'ghost';
      }
      
      // Toca o som
      const audioNode = audioServiceRef.current.playBuffer(
        bufferType,
        compensatedTime / 1000, // Converte para segundos
        step.volume * localMasterVolume
      );
      
      if (audioNode) {
        setAudioState(prev => ({
          ...prev,
          activeVoices: prev.activeVoices + 1,
        }));
        
        // Limpa após tocar
        setTimeout(() => {
          setAudioState(prev => ({
            ...prev,
            activeVoices: Math.max(0, prev.activeVoices - 1),
          }));
        }, 100);
      }
      
      lastStepTimeRef.current = Date.now();
    } catch (error) {
      console.error('Erro ao agendar step:', error);
    }
  }, [sequence, localMasterVolume, localLatencyComp]);
  
  // Atualiza volume mestre
  const handleVolumeChange = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setLocalMasterVolume(clampedVolume);
    
    if (audioServiceRef.current) {
      audioServiceRef.current.setMasterVolume(clampedVolume);
    }
    
    if (onVolumeChange) {
      onVolumeChange(clampedVolume);
    }
  }, [onVolumeChange]);
  
  // Atualiza compensação de latência
  const handleLatencyChange = useCallback((newLatency) => {
    const clampedLatency = Math.max(0, Math.min(100, newLatency));
    setLocalLatencyComp(clampedLatency);
    
    if (onLatencyChange) {
      onLatencyChange(clampedLatency);
    }
  }, [onLatencyChange]);
  
  // Mede latência (teste de performance)
  const measureLatency = useCallback(async () => {
    if (!audioServiceRef.current) return;
    
    try {
      setAudioState(prev => ({ ...prev, bufferStatus: 'measuring' }));
      
      // Teste simples de latência
      const startTime = Date.now();
      await audioServiceRef.current.playBuffer('click', 0, 0.5);
      const endTime = Date.now();
      
      const measuredLatency = endTime - startTime;
      
      setAudioState(prev => ({
        ...prev,
        measuredLatency,
        currentLatency: measuredLatency,
        bufferStatus: 'loaded',
      }));
      
      console.log('Latência medida:', measuredLatency, 'ms');
    } catch (error) {
      console.error('Erro ao medir latência:', error);
      setAudioState(prev => ({ ...prev, bufferStatus: 'error' }));
    }
  }, []);
  
  // Coleta estatísticas de performance
  const collectPerformanceStats = useCallback(() => {
    if (!audioServiceRef.current) return;
    
    // Simula coleta de estatísticas
    const now = Date.now();
    const renderTime = now - (performanceStats.lastRenderTime || now);
    const frameRate = renderTime > 0 ? Math.round(1000 / renderTime) : 60;
    
    setPerformanceStats({
      audioNodes: audioState.activeVoices,
      bufferCount: 4, // Buffers pré-renderizados
      lastRenderTime: now,
      frameRate,
    });
    
    // Simula uso de CPU/Memory
    if (Math.random() > 0.7) {
      setAudioState(prev => ({
        ...prev,
        cpuUsage: Math.min(100, prev.cpuUsage + Math.random() * 5),
        memoryUsage: Math.min(100, prev.memoryUsage + Math.random() * 2),
      }));
    } else {
      setAudioState(prev => ({
        ...prev,
        cpuUsage: Math.max(0, prev.cpuUsage - Math.random() * 3),
        memoryUsage: Math.max(0, prev.memoryUsage - Math.random() * 1),
      }));
    }
  }, [audioState.activeVoices, performanceStats.lastRenderTime]);
  
  // Efeitos
  useEffect(() => {
    // Inicializa áudio na montagem
    initializeAudio();
    
    // Configura coleta de estatísticas
    statsIntervalRef.current = setInterval(collectPerformanceStats, 2000);
    
    return () => {
      // Cleanup
      if (schedulerRef.current) {
        clearInterval(schedulerRef.current);
        schedulerRef.current = null;
      }
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      
      if (audioServiceRef.current) {
        audioServiceRef.current.dispose();
      }
    };
  }, [initializeAudio]);
  
  useEffect(() => {
    // Atualiza reprodução quando isPlaying muda
    handlePlayPause();
  }, [isPlaying, handlePlayPause]);
  
  useEffect(() => {
    // Reinicia scheduler quando BPM ou sequência mudam
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
      startScheduler();
    }
  }, [bpm, sequence, startScheduler]);
  
  // Temas de cores
  const themeColors = {
    default: {
      bg: 'bg-gray-900',
      text: 'text-white',
      border: 'border-gray-700',
      active: 'bg-blue-500/20',
      accent: 'text-blue-400',
      highlight: 'bg-blue-500/10',
    },
    'pro-gold': {
      bg: 'bg-gradient-to-br from-gray-950 to-amber-950/30',
      text: 'text-amber-50',
      border: 'border-amber-500/30',
      active: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
      accent: 'text-amber-400',
      highlight: 'bg-amber-500/10',
    },
  };
  
  const colors = themeColors[theme] || themeColors.default;
  
  // Renderiza indicadores de status
  const renderStatusIndicators = () => {
    return (
      <div className="flex flex-wrap gap-3 mb-4">
        {/* Status de inicialização */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${audioState.isInitialized ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <div className={`w-2 h-2 rounded-full ${audioState.isInitialized ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-xs">
            {audioState.isInitialized ? 'Áudio OK' : 'Áudio OFF'}
          </span>
        </div>
        
        {/* Status de buffers */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${audioState.bufferStatus === 'loaded' ? 'bg-green-500/20' : audioState.bufferStatus === 'loading' ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
          <Waves size={12} className={audioState.bufferStatus === 'loaded' ? 'text-green-500' : audioState.bufferStatus === 'loading' ? 'text-amber-500' : 'text-red-500'} />
          <span className="text-xs capitalize">{audioState.bufferStatus}</span>
        </div>
        
        {/* Vozes ativas */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20">
          <Activity size={12} className="text-blue-500" />
          <span className="text-xs">{audioState.activeVoices} vozes</span>
        </div>
        
        {/* Latência */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20">
          <Clock size={12} className="text-purple-500" />
          <span className="text-xs">{audioState.currentLatency}ms</span>
        </div>
      </div>
    );
  };
  
  // Renderiza controles de volume
  const renderVolumeControls = () => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Headphones size={16} className="text-gray-400" />
            <label className="text-sm text-gray-300">Volume Mestre</label>
          </div>
          <div className="text-sm font-semibold text-white">
            {formatVolume(localMasterVolume, 'percent')}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <VolumeX size={16} className="text-gray-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={localMasterVolume * 100}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            aria-label="Volume mestre"
          />
          <Volume2 size={16} className="text-gray-400" />
        </div>
      </div>
    );
  };
  
  // Renderiza controles de latência
  const renderLatencyControls = () => {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-gray-400" />
            <label className="text-sm text-gray-300">Compensação de Latência</label>
          </div>
          <div className="text-sm font-semibold text-white">
            {localLatencyComp}ms
          </div>
        </div>
        
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={localLatencyComp}
            onChange={(e) => handleLatencyChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500"
            aria-label="Compensação de latência"
          />
          
          <div className="flex justify-between text-xs text-gray-500">
            <span>0ms (Preciso)</span>
            <span>25ms (Padrão)</span>
            <span>50ms (Estável)</span>
            <span>100ms (Conservador)</span>
          </div>
          
          <button
            onClick={measureLatency}
            disabled={audioState.bufferStatus === 'measuring'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors disabled:opacity-50"
            aria-label="Medir latência atual"
          >
            {audioState.bufferStatus === 'measuring' ? (
              <RotateCw size={14} className="animate-spin" />
            ) : (
              <Clock size={14} />
            )}
            <span>
              {audioState.bufferStatus === 'measuring' ? 'Medindo...' : 'Medir Latência'}
            </span>
          </button>
        </div>
      </div>
    );
  };
  
  // Renderiza visualização de performance
  const renderPerformanceVisualization = () => {
    if (!showAdvanced) return null;
    
    return (
      <div className="mb-6 p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Performance</h4>
          </div>
          <div className="text-xs text-gray-400">
            {performanceStats.frameRate} FPS
          </div>
        </div>
        
        <div className="space-y-3">
          {/* Uso de CPU */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>CPU</span>
              <span>{Math.round(audioState.cpuUsage)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-500"
                style={{ width: `${audioState.cpuUsage}%` }}
              />
            </div>
          </div>
          
          {/* Uso de Memória */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Memória</span>
              <span>{Math.round(audioState.memoryUsage)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${audioState.memoryUsage}%` }}
              />
            </div>
          </div>
          
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-gray-800/50 p-2 rounded text-center">
              <div className="text-gray-400">Buffers</div>
              <div className="font-bold text-white">{performanceStats.bufferCount}</div>
            </div>
            <div className="bg-gray-800/50 p-2 rounded text-center">
              <div className="text-gray-400">Nodes</div>
              <div className="font-bold text-white">{performanceStats.audioNodes}</div>
            </div>
            <div className="bg-gray-800/50 p-2 rounded text-center">
              <div className="text-gray-400">Latência</div>
              <div className="font-bold text-white">{audioState.measuredLatency}ms</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Renderiza informações de buffer
  const renderBufferInfo = () => {
    if (!showAdvanced) return null;
    
    return (
      <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Waves size={16} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Buffers de Áudio</h4>
          </div>
          <div className={`text-xs ${audioState.bufferStatus === 'loaded' ? 'text-green-400' : 'text-amber-400'}`}>
            {audioState.bufferStatus === 'loaded' ? 'PRÉ-RENDERIZADO' : 'CARREGANDO...'}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(TIMBRE_CONFIG).map(([key, config]) => (
            <div
              key={key}
              className="p-2 rounded-lg bg-gray-800/50 border border-gray-700"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${key === 'CLICK' ? 'bg-blue-500' : key === 'ACCENT' ? 'bg-amber-500' : key === 'GHOST' ? 'bg-purple-500' : 'bg-green-500'}`} />
                <div className="text-xs font-semibold text-white capitalize">{key.toLowerCase()}</div>
              </div>
              <div className="text-xs text-gray-400">
                {config.type} • {config.frequency}Hz • {config.decay}s
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Renderiza mensagens de erro
  const renderErrorDisplay = () => {
    if (!audioState.audioError) return null;
    
    return (
      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle size={16} className="text-red-400" />
          <div className="text-sm font-semibold text-white">Erro de Áudio</div>
        </div>
        <div className="text-xs text-gray-300">{audioState.audioError}</div>
        <button
          onClick={initializeAudio}
          className="mt-2 text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
          aria-label="Tentar novamente"
        >
          Tentar Novamente
        </button>
      </div>
    );
  };
  
  // Renderiza versão compacta
  const renderCompactView = () => {
    if (!compact) return null;
    
    return (
      <div className="space-y-3">
        {/* Status compacto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${audioState.isInitialized ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-white">Audio Engine</span>
          </div>
          <div className="text-xs text-gray-400">
            {audioState.activeVoices} vozes
          </div>
        </div>
        
        {/* Controles básicos */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-gray-800/50">
            <div className="text-xs text-gray-400 mb-1">Volume</div>
            <div className="text-sm font-bold text-white">
              {formatVolume(localMasterVolume, 'percent')}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-gray-800/50">
            <div className="text-xs text-gray-400 mb-1">Latência</div>
            <div className="text-sm font-bold text-white">
              {audioState.currentLatency}ms
            </div>
          </div>
        </div>
        
        {/* Botão de configurações */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
          aria-label="Mostrar configurações de áudio"
        >
          <Settings size={14} />
          <span className="text-sm">Configurações</span>
        </button>
        
        {/* Configurações expandidas */}
        {showSettings && (
          <div className="mt-3 space-y-3">
            {renderVolumeControls()}
            {renderLatencyControls()}
            {renderErrorDisplay()}
          </div>
        )}
      </div>
    );
  };
  
  // Renderiza versão expandida
  const renderExpandedView = () => {
    if (compact) return null;
    
    return (
      <>
        {renderErrorDisplay()}
        {renderStatusIndicators()}
        {renderVolumeControls()}
        {renderLatencyControls()}
        {renderPerformanceVisualization()}
        {renderBufferInfo()}
      </>
    );
  };
  
  return (
    <div className={`${className}`}>
      <div className={`rounded-2xl p-6 ${colors.bg} ${colors.border} border shadow-xl`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
              <Headphones size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Motor de Áudio</h3>
              <p className="text-xs text-gray-400">
                {audioState.isInitialized ? 'Sincronização ativa' : 'Inicializando...'}
              </p>
            </div>
          </div>
          
          {/* Badge de status */}
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${audioState.isInitialized ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {audioState.isInitialized ? 'ATIVO' : 'INATIVO'}
          </div>
        </div>
        
        {compact ? renderCompactView() : renderExpandedView()}
        
        {/* Informações técnicas */}
        {!compact && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="text-xs text-gray-500">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={12} />
                <span>Web Audio API • Compensação de latência: {localLatencyComp}ms</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={12} />
                <span>Scheduler lookahead: {AUDIO_CONFIG.LOOKAHEAD}ms • Intervalo: {AUDIO_CONFIG.SCHEDULE_INTERVAL}ms</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Propriedades padrão
AudioEngine.defaultProps = {
  bpm: 120,
  sequence: [],
  currentStep: 0,
  isPlaying: false,
  masterVolume: 0.8,
  latencyCompensation: 25,
  showAdvanced: true,
  compact: false,
  theme: 'default',
  className: '',
};

export default React.memo(AudioEngine);
