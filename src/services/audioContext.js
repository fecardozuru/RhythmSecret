// /src/services/audioContext.js

/**
 * Serviço para gerenciamento do Web Audio API
 * Singleton que fornece contexto de áudio, buffers e efeitos
 */

import { TIMBRE_CONFIG, EFFECTS_CONFIG } from '../constants/audioConfig';

class AudioContextService {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverb = null;
    this.delay = null;
    this.isInitialized = false;
    this.isSuspended = true;
    this.outputLatency = 0;
    
    // Buffers de áudio pré-renderizados para performance
    this.audioBuffers = {
      click: null,
      main: null,
      accent: null,
      ghost: null,
    };
    
    // Cache de nós de áudio reutilizáveis
    this.audioNodeCache = new Map();
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.resume = this.resume.bind(this);
    this.suspend = this.suspend.bind(this);
    this.createBuffer = this.createBuffer.bind(this);
    this.playBuffer = this.playBuffer.bind(this);
    this.createOscillator = this.createOscillator.bind(this);
    this.playTone = this.playTone.bind(this);
    this.getOutputLatency = this.getOutputLatency.bind(this);
    this.applyEffects = this.applyEffects.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /**
   * Inicializa o contexto de áudio (deve ser chamado após interação do usuário)
   * @returns {Promise<boolean>} Sucesso da inicialização
   */
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      // Cria contexto de áudio (com fallback para navegadores antigos)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      if (!AudioContextClass) {
        console.error('Web Audio API não suportada neste navegador');
        return false;
      }
      
      this.audioContext = new AudioContextClass();
      
      // Configura latência (tenta obter do contexto se disponível)
      if (this.audioContext.baseLatency) {
        this.outputLatency = this.audioContext.baseLatency * 1000; // Converte para ms
      } else {
        // Fallback baseado no navegador
        this.outputLatency = 25; // 25ms é um bom default
      }
      
      // Cria ganho mestre
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.8;
      
      // Configura compressor para evitar clipping
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.configureCompressor();
      
      // Conecta chain: ganho mestre → compressor → destino
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);
      
      // Pré-renderiza buffers de áudio
      await this.preRenderBuffers();
      
      this.isInitialized = true;
      console.log('AudioContext inicializado com latência:', this.outputLatency, 'ms');
      return true;
      
    } catch (error) {
      console.error('Erro ao inicializar AudioContext:', error);
      return false;
    }
  }

  /**
   * Configura o compressor dinâmico
   */
  configureCompressor() {
    if (!this.compressor) return;
    
    const config = EFFECTS_CONFIG.COMPRESSOR;
    this.compressor.threshold.value = config.threshold;
    this.compressor.knee.value = config.knee;
    this.compressor.ratio.value = config.ratio;
    this.compressor.attack.value = config.attack;
    this.compressor.release.value = config.release;
  }

  /**
   * Pré-renderiza buffers de áudio para performance
   * @returns {Promise<void>}
   */
  async preRenderBuffers() {
    // Cria buffers para diferentes tipos de som
    this.audioBuffers.click = this.createBufferSource(TIMBRE_CONFIG.CLICK);
    this.audioBuffers.main = this.createBufferSource(TIMBRE_CONFIG.MAIN);
    this.audioBuffers.accent = this.createBufferSource(TIMBRE_CONFIG.ACCENT);
    this.audioBuffers.ghost = this.createBufferSource(TIMBRE_CONFIG.GHOST);
  }

  /**
   * Cria um buffer de áudio a partir de configurações de timbre
   * @param {Object} timbreConfig - Configuração de timbre
   * @returns {AudioBufferSourceNode} Buffer pré-renderizado
   */
  createBufferSource(timbreConfig) {
    if (!this.audioContext) return null;
    
    const duration = timbreConfig.decay || 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = Math.floor(sampleRate * duration);
    
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Gera envelope AD (Attack-Decay)
    const attackFrames = Math.floor(sampleRate * timbreConfig.attack);
    const decayFrames = frameCount - attackFrames;
    
    for (let i = 0; i < frameCount; i++) {
      let amplitude = 0;
      
      if (i < attackFrames) {
        // Fase de attack (linear)
        amplitude = i / attackFrames;
      } else {
        // Fase de decay (exponencial)
        const decayProgress = (i - attackFrames) / decayFrames;
        amplitude = Math.max(0, 1 - decayProgress * 2);
      }
      
      // Gera forma de onda baseada no tipo
      let sample = 0;
      const time = i / sampleRate;
      const frequency = timbreConfig.frequency || 800;
      
      switch (timbreConfig.type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * time);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * time) > 0 ? 0.5 : -0.5;
          break;
        case 'sawtooth':
          sample = 2 * (time * frequency - Math.floor(0.5 + time * frequency));
          break;
        case 'triangle':
          sample = Math.abs(2 * (time * frequency - Math.floor(time * frequency + 0.5))) * 2 - 1;
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * time);
      }
      
      channelData[i] = sample * amplitude * 0.3; // Normaliza amplitude
    }
    
    return buffer;
  }

  /**
   * Retoma o contexto de áudio (após suspend)
   * @returns {Promise<void>}
   */
  async resume() {
    if (!this.audioContext || this.audioContext.state === 'running') return;
    
    try {
      await this.audioContext.resume();
      this.isSuspended = false;
    } catch (error) {
      console.error('Erro ao retomar AudioContext:', error);
    }
  }

  /**
   * Suspende o contexto de áudio para economia de bateria
   * @returns {Promise<void>}
   */
  async suspend() {
    if (!this.audioContext || this.audioContext.state === 'suspended') return;
    
    try {
      await this.audioContext.suspend();
      this.isSuspended = true;
    } catch (error) {
      console.error('Erro ao suspender AudioContext:', error);
    }
  }

  /**
   * Toca um buffer de áudio pré-renderizado
   * @param {string} bufferType - Tipo de buffer ('click', 'main', 'accent', 'ghost')
   * @param {number} startTime - Quando tocar (em segundos do AudioContext)
   * @param {number} volume - Volume (0-1)
   * @param {number} playbackRate - Taxa de reprodução (para pitch)
   * @returns {AudioBufferSourceNode} Nó de áudio criado
   */
  playBuffer(bufferType, startTime, volume = 1.0, playbackRate = 1.0) {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('AudioContext não inicializado');
      return null;
    }
    
    const buffer = this.audioBuffers[bufferType];
    if (!buffer) {
      console.error(`Buffer não encontrado: ${bufferType}`);
      return null;
    }
    
    try {
      // Cria nós de áudio
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;
      
      // Configura envelope de volume
      const now = this.audioContext.currentTime;
      const attackTime = 0.001;
      const releaseTime = 0.02;
      
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, startTime + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + releaseTime);
      
      // Conecta chain: source → gain → master
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // Agenda reprodução
      source.start(startTime);
      
      // Para automaticamente após a duração do buffer
      const duration = buffer.duration / playbackRate + 0.01;
      source.stop(startTime + duration);
      
      // Limpa da cache após uso
      setTimeout(() => {
        source.disconnect();
        gainNode.disconnect();
      }, duration * 1000 + 100);
      
      return source;
      
    } catch (error) {
      console.error('Erro ao tocar buffer:', error);
      return null;
    }
  }

  /**
   * Cria e toca um tom usando oscilador (para sons customizados)
   * @param {Object} config - Configuração do oscilador
   * @param {number} startTime - Quando tocar
   * @param {number} duration - Duração em segundos
   * @returns {OscillatorNode} Oscilador criado
   */
  createOscillator(config, startTime, duration = 0.1) {
    if (!this.isInitialized || !this.audioContext) return null;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Configura oscilador
      oscillator.type = config.type || 'sine';
      oscillator.frequency.value = config.frequency || 800;
      
      // Configura envelope ADSR simplificado
      const now = this.audioContext.currentTime;
      const attack = config.attack || 0.001;
      const decay = config.decay || 0.05;
      
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(config.volume || 0.5, startTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attack + decay);
      
      // Conecta e agenda
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      return oscillator;
      
    } catch (error) {
      console.error('Erro ao criar oscilador:', error);
      return null;
    }
  }

  /**
   * Método conveniente para tocar tons comuns
   * @param {string} toneType - Tipo de tom ('click', 'accent', etc.)
   * @param {number} startTime - Quando tocar
   * @param {number} volume - Volume
   * @returns {OscillatorNode|null}
   */
  playTone(toneType, startTime, volume = 1.0) {
    const config = TIMBRE_CONFIG[toneType.toUpperCase()] || TIMBRE_CONFIG.MAIN;
    
    if (!config) {
      console.error(`Configuração de tom não encontrada: ${toneType}`);
      return null;
    }
    
    return this.createOscillator({
      ...config,
      volume: volume,
    }, startTime, config.decay || 0.1);
  }

  /**
   * Aplica efeitos à chain de áudio
   * @param {Object} effects - Configurações de efeitos
   */
  applyEffects(effects) {
    if (!this.isInitialized || !this.audioContext) return;
    
    // Remove efeitos existentes
    if (this.reverb) {
      this.masterGain.disconnect(this.reverb);
      this.reverb.disconnect(this.compressor);
    }
    
    if (this.delay) {
      this.masterGain.disconnect(this.delay);
      this.delay.disconnect(this.compressor);
    }
    
    // Reconecta diretamente ao compressor
    this.masterGain.disconnect();
    this.masterGain.connect(this.compressor);
    
    // Aplica reverb se habilitado
    if (effects?.reverb?.enabled) {
      this.reverb = this.audioContext.createConvolver();
      const reverbGain = this.audioContext.createGain();
      reverbGain.gain.value = effects.reverb.mix || 0.1;
      
      // Cria buffer de reverb simples (poderia ser carregado de um IR)
      this.createReverbBuffer(effects.reverb.decay || 1.5);
      
      this.masterGain.connect(this.reverb);
      this.reverb.connect(reverbGain);
      reverbGain.connect(this.compressor);
    }
    
    // Aplica delay se habilitado
    if (effects?.delay?.enabled) {
      this.delay = this.audioContext.createDelay();
      this.delay.delayTime.value = effects.delay.time || 0.25;
      
      const delayGain = this.audioContext.createGain();
      delayGain.gain.value = effects.delay.feedback || 0.3;
      
      const delayMix = this.audioContext.createGain();
      delayMix.gain.value = effects.delay.mix || 0.1;
      
      // Conecta feedback loop
      this.delay.connect(delayGain);
      delayGain.connect(this.delay);
      
      // Conecta ao output
      this.masterGain.connect(delayMix);
      this.delay.connect(delayMix);
      delayMix.connect(this.compressor);
    }
    
    // Atualiza compressor
    if (effects?.compressor) {
      this.configureCompressor(effects.compressor);
    }
  }

  /**
   * Cria um buffer de reverb simples
   * @param {number} decay - Tempo de decay em segundos
   */
  createReverbBuffer(decay = 1.5) {
    if (!this.audioContext || !this.reverb) return;
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    // Preenche com ruído que decai exponencialmente
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    this.reverb.buffer = impulse;
  }

  /**
   * Obtém a latência estimada de output em milissegundos
   * @returns {number} Latência em ms
   */
  getOutputLatency() {
    return this.outputLatency;
  }

  /**
   * Obtém o tempo atual do AudioContext em milissegundos
   * @returns {number} Tempo atual em ms
   */
  getCurrentTimeMs() {
    if (!this.audioContext) return performance.now();
    return this.audioContext.currentTime * 1000;
  }

  /**
   * Define o volume mestre
   * @param {number} volume - Volume (0-1)
   */
  setMasterVolume(volume) {
    if (!this.masterGain) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = clampedVolume;
  }

  /**
   * Obtém o volume mestre atual
   * @returns {number} Volume (0-1)
   */
  getMasterVolume() {
    if (!this.masterGain) return 0.8;
    return this.masterGain.gain.value;
  }

  /**
   * Limpa recursos e fecha o contexto
   */
  dispose() {
    // Limpa cache
    this.audioNodeCache.clear();
    
    // Desconecta nós
    if (this.masterGain) {
      this.masterGain.disconnect();
    }
    
    if (this.compressor) {
      this.compressor.disconnect();
    }
    
    if (this.reverb) {
      this.reverb.disconnect();
    }
    
    if (this.delay) {
      this.delay.disconnect();
    }
    
    // Fecha contexto
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverb = null;
    this.delay = null;
  }

  /**
   * Singleton instance
   */
  static getInstance() {
    if (!AudioContextService.instance) {
      AudioContextService.instance = new AudioContextService();
    }
    return AudioContextService.instance;
  }
}

// Singleton instance
AudioContextService.instance = null;

export default AudioContextService;// /src/services/audioContext.js

/**
 * Serviço para gerenciamento do Web Audio API
 * Singleton que fornece contexto de áudio, buffers e efeitos
 */

import { TIMBRE_CONFIG, EFFECTS_CONFIG } from '../constants/audioConfig';

class AudioContextService {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverb = null;
    this.delay = null;
    this.isInitialized = false;
    this.isSuspended = true;
    this.outputLatency = 0;
    
    // Buffers de áudio pré-renderizados para performance
    this.audioBuffers = {
      click: null,
      main: null,
      accent: null,
      ghost: null,
    };
    
    // Cache de nós de áudio reutilizáveis
    this.audioNodeCache = new Map();
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.resume = this.resume.bind(this);
    this.suspend = this.suspend.bind(this);
    this.createBuffer = this.createBuffer.bind(this);
    this.playBuffer = this.playBuffer.bind(this);
    this.createOscillator = this.createOscillator.bind(this);
    this.playTone = this.playTone.bind(this);
    this.getOutputLatency = this.getOutputLatency.bind(this);
    this.applyEffects = this.applyEffects.bind(this);
    this.dispose = this.dispose.bind(this);
  }

  /**
   * Inicializa o contexto de áudio (deve ser chamado após interação do usuário)
   * @returns {Promise<boolean>} Sucesso da inicialização
   */
  async initialize() {
    if (this.isInitialized) return true;
    
    try {
      // Cria contexto de áudio (com fallback para navegadores antigos)
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      if (!AudioContextClass) {
        console.error('Web Audio API não suportada neste navegador');
        return false;
      }
      
      this.audioContext = new AudioContextClass();
      
      // Configura latência (tenta obter do contexto se disponível)
      if (this.audioContext.baseLatency) {
        this.outputLatency = this.audioContext.baseLatency * 1000; // Converte para ms
      } else {
        // Fallback baseado no navegador
        this.outputLatency = 25; // 25ms é um bom default
      }
      
      // Cria ganho mestre
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.8;
      
      // Configura compressor para evitar clipping
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.configureCompressor();
      
      // Conecta chain: ganho mestre → compressor → destino
      this.masterGain.connect(this.compressor);
      this.compressor.connect(this.audioContext.destination);
      
      // Pré-renderiza buffers de áudio
      await this.preRenderBuffers();
      
      this.isInitialized = true;
      console.log('AudioContext inicializado com latência:', this.outputLatency, 'ms');
      return true;
      
    } catch (error) {
      console.error('Erro ao inicializar AudioContext:', error);
      return false;
    }
  }

  /**
   * Configura o compressor dinâmico
   */
  configureCompressor() {
    if (!this.compressor) return;
    
    const config = EFFECTS_CONFIG.COMPRESSOR;
    this.compressor.threshold.value = config.threshold;
    this.compressor.knee.value = config.knee;
    this.compressor.ratio.value = config.ratio;
    this.compressor.attack.value = config.attack;
    this.compressor.release.value = config.release;
  }

  /**
   * Pré-renderiza buffers de áudio para performance
   * @returns {Promise<void>}
   */
  async preRenderBuffers() {
    // Cria buffers para diferentes tipos de som
    this.audioBuffers.click = this.createBufferSource(TIMBRE_CONFIG.CLICK);
    this.audioBuffers.main = this.createBufferSource(TIMBRE_CONFIG.MAIN);
    this.audioBuffers.accent = this.createBufferSource(TIMBRE_CONFIG.ACCENT);
    this.audioBuffers.ghost = this.createBufferSource(TIMBRE_CONFIG.GHOST);
  }

  /**
   * Cria um buffer de áudio a partir de configurações de timbre
   * @param {Object} timbreConfig - Configuração de timbre
   * @returns {AudioBufferSourceNode} Buffer pré-renderizado
   */
  createBufferSource(timbreConfig) {
    if (!this.audioContext) return null;
    
    const duration = timbreConfig.decay || 0.1;
    const sampleRate = this.audioContext.sampleRate;
    const frameCount = Math.floor(sampleRate * duration);
    
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    // Gera envelope AD (Attack-Decay)
    const attackFrames = Math.floor(sampleRate * timbreConfig.attack);
    const decayFrames = frameCount - attackFrames;
    
    for (let i = 0; i < frameCount; i++) {
      let amplitude = 0;
      
      if (i < attackFrames) {
        // Fase de attack (linear)
        amplitude = i / attackFrames;
      } else {
        // Fase de decay (exponencial)
        const decayProgress = (i - attackFrames) / decayFrames;
        amplitude = Math.max(0, 1 - decayProgress * 2);
      }
      
      // Gera forma de onda baseada no tipo
      let sample = 0;
      const time = i / sampleRate;
      const frequency = timbreConfig.frequency || 800;
      
      switch (timbreConfig.type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * time);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * time) > 0 ? 0.5 : -0.5;
          break;
        case 'sawtooth':
          sample = 2 * (time * frequency - Math.floor(0.5 + time * frequency));
          break;
        case 'triangle':
          sample = Math.abs(2 * (time * frequency - Math.floor(time * frequency + 0.5))) * 2 - 1;
          break;
        default:
          sample = Math.sin(2 * Math.PI * frequency * time);
      }
      
      channelData[i] = sample * amplitude * 0.3; // Normaliza amplitude
    }
    
    return buffer;
  }

  /**
   * Retoma o contexto de áudio (após suspend)
   * @returns {Promise<void>}
   */
  async resume() {
    if (!this.audioContext || this.audioContext.state === 'running') return;
    
    try {
      await this.audioContext.resume();
      this.isSuspended = false;
    } catch (error) {
      console.error('Erro ao retomar AudioContext:', error);
    }
  }

  /**
   * Suspende o contexto de áudio para economia de bateria
   * @returns {Promise<void>}
   */
  async suspend() {
    if (!this.audioContext || this.audioContext.state === 'suspended') return;
    
    try {
      await this.audioContext.suspend();
      this.isSuspended = true;
    } catch (error) {
      console.error('Erro ao suspender AudioContext:', error);
    }
  }

  /**
   * Toca um buffer de áudio pré-renderizado
   * @param {string} bufferType - Tipo de buffer ('click', 'main', 'accent', 'ghost')
   * @param {number} startTime - Quando tocar (em segundos do AudioContext)
   * @param {number} volume - Volume (0-1)
   * @param {number} playbackRate - Taxa de reprodução (para pitch)
   * @returns {AudioBufferSourceNode} Nó de áudio criado
   */
  playBuffer(bufferType, startTime, volume = 1.0, playbackRate = 1.0) {
    if (!this.isInitialized || !this.audioContext || !this.masterGain) {
      console.warn('AudioContext não inicializado');
      return null;
    }
    
    const buffer = this.audioBuffers[bufferType];
    if (!buffer) {
      console.error(`Buffer não encontrado: ${bufferType}`);
      return null;
    }
    
    try {
      // Cria nós de áudio
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.playbackRate.value = playbackRate;
      
      // Configura envelope de volume
      const now = this.audioContext.currentTime;
      const attackTime = 0.001;
      const releaseTime = 0.02;
      
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(volume, startTime + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + releaseTime);
      
      // Conecta chain: source → gain → master
      source.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      // Agenda reprodução
      source.start(startTime);
      
      // Para automaticamente após a duração do buffer
      const duration = buffer.duration / playbackRate + 0.01;
      source.stop(startTime + duration);
      
      // Limpa da cache após uso
      setTimeout(() => {
        source.disconnect();
        gainNode.disconnect();
      }, duration * 1000 + 100);
      
      return source;
      
    } catch (error) {
      console.error('Erro ao tocar buffer:', error);
      return null;
    }
  }

  /**
   * Cria e toca um tom usando oscilador (para sons customizados)
   * @param {Object} config - Configuração do oscilador
   * @param {number} startTime - Quando tocar
   * @param {number} duration - Duração em segundos
   * @returns {OscillatorNode} Oscilador criado
   */
  createOscillator(config, startTime, duration = 0.1) {
    if (!this.isInitialized || !this.audioContext) return null;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      // Configura oscilador
      oscillator.type = config.type || 'sine';
      oscillator.frequency.value = config.frequency || 800;
      
      // Configura envelope ADSR simplificado
      const now = this.audioContext.currentTime;
      const attack = config.attack || 0.001;
      const decay = config.decay || 0.05;
      
      gainNode.gain.setValueAtTime(0.001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(config.volume || 0.5, startTime + attack);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + attack + decay);
      
      // Conecta e agenda
      oscillator.connect(gainNode);
      gainNode.connect(this.masterGain);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      return oscillator;
      
    } catch (error) {
      console.error('Erro ao criar oscilador:', error);
      return null;
    }
  }

  /**
   * Método conveniente para tocar tons comuns
   * @param {string} toneType - Tipo de tom ('click', 'accent', etc.)
   * @param {number} startTime - Quando tocar
   * @param {number} volume - Volume
   * @returns {OscillatorNode|null}
   */
  playTone(toneType, startTime, volume = 1.0) {
    const config = TIMBRE_CONFIG[toneType.toUpperCase()] || TIMBRE_CONFIG.MAIN;
    
    if (!config) {
      console.error(`Configuração de tom não encontrada: ${toneType}`);
      return null;
    }
    
    return this.createOscillator({
      ...config,
      volume: volume,
    }, startTime, config.decay || 0.1);
  }

  /**
   * Aplica efeitos à chain de áudio
   * @param {Object} effects - Configurações de efeitos
   */
  applyEffects(effects) {
    if (!this.isInitialized || !this.audioContext) return;
    
    // Remove efeitos existentes
    if (this.reverb) {
      this.masterGain.disconnect(this.reverb);
      this.reverb.disconnect(this.compressor);
    }
    
    if (this.delay) {
      this.masterGain.disconnect(this.delay);
      this.delay.disconnect(this.compressor);
    }
    
    // Reconecta diretamente ao compressor
    this.masterGain.disconnect();
    this.masterGain.connect(this.compressor);
    
    // Aplica reverb se habilitado
    if (effects?.reverb?.enabled) {
      this.reverb = this.audioContext.createConvolver();
      const reverbGain = this.audioContext.createGain();
      reverbGain.gain.value = effects.reverb.mix || 0.1;
      
      // Cria buffer de reverb simples (poderia ser carregado de um IR)
      this.createReverbBuffer(effects.reverb.decay || 1.5);
      
      this.masterGain.connect(this.reverb);
      this.reverb.connect(reverbGain);
      reverbGain.connect(this.compressor);
    }
    
    // Aplica delay se habilitado
    if (effects?.delay?.enabled) {
      this.delay = this.audioContext.createDelay();
      this.delay.delayTime.value = effects.delay.time || 0.25;
      
      const delayGain = this.audioContext.createGain();
      delayGain.gain.value = effects.delay.feedback || 0.3;
      
      const delayMix = this.audioContext.createGain();
      delayMix.gain.value = effects.delay.mix || 0.1;
      
      // Conecta feedback loop
      this.delay.connect(delayGain);
      delayGain.connect(this.delay);
      
      // Conecta ao output
      this.masterGain.connect(delayMix);
      this.delay.connect(delayMix);
      delayMix.connect(this.compressor);
    }
    
    // Atualiza compressor
    if (effects?.compressor) {
      this.configureCompressor(effects.compressor);
    }
  }

  /**
   * Cria um buffer de reverb simples
   * @param {number} decay - Tempo de decay em segundos
   */
  createReverbBuffer(decay = 1.5) {
    if (!this.audioContext || !this.reverb) return;
    
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * decay;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
    
    // Preenche com ruído que decai exponencialmente
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }
    
    this.reverb.buffer = impulse;
  }

  /**
   * Obtém a latência estimada de output em milissegundos
   * @returns {number} Latência em ms
   */
  getOutputLatency() {
    return this.outputLatency;
  }

  /**
   * Obtém o tempo atual do AudioContext em milissegundos
   * @returns {number} Tempo atual em ms
   */
  getCurrentTimeMs() {
    if (!this.audioContext) return performance.now();
    return this.audioContext.currentTime * 1000;
  }

  /**
   * Define o volume mestre
   * @param {number} volume - Volume (0-1)
   */
  setMasterVolume(volume) {
    if (!this.masterGain) return;
    
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.value = clampedVolume;
  }

  /**
   * Obtém o volume mestre atual
   * @returns {number} Volume (0-1)
   */
  getMasterVolume() {
    if (!this.masterGain) return 0.8;
    return this.masterGain.gain.value;
  }

  /**
   * Limpa recursos e fecha o contexto
   */
  dispose() {
    // Limpa cache
    this.audioNodeCache.clear();
    
    // Desconecta nós
    if (this.masterGain) {
      this.masterGain.disconnect();
    }
    
    if (this.compressor) {
      this.compressor.disconnect();
    }
    
    if (this.reverb) {
      this.reverb.disconnect();
    }
    
    if (this.delay) {
      this.delay.disconnect();
    }
    
    // Fecha contexto
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.isInitialized = false;
    this.audioContext = null;
    this.masterGain = null;
    this.compressor = null;
    this.reverb = null;
    this.delay = null;
  }

  /**
   * Singleton instance
   */
  static getInstance() {
    if (!AudioContextService.instance) {
      AudioContextService.instance = new AudioContextService();
    }
    return AudioContextService.instance;
  }
}

// Singleton instance
AudioContextService.instance = null;

export default AudioContextService;
