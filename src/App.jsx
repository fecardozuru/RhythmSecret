import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, Minus, Plus, ChevronDown, Volume2, VolumeX,
  Repeat, TrendingUp, TrendingDown, Palette, Lock,
  Shuffle, Crown, Ghost,
  Hourglass, Music, Save, CheckCircle2,
  Zap, ArrowRight, Keyboard, X
} from 'lucide-react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// --- CONSTANTES ---
import { THEMES, APP_MODES } from './constants/themes';
import {
  LATENCY_COMPENSATION, LOOKAHEAD_TIME, SCHEDULER_INTERVAL,
  BPM_PROGRESS_DIRECTIONS, KEYBOARD_GROUPS, SUBDIVISIONS_DESC,
  SUBDIVISIONS, TIME_SIGNATURES, BPM_STEPS, VOLUME_VALUES,
  LOOP_BAR_OPTIONS, getTempoMarking, createGroovePattern, getAccentWeight
} from './constants/musicalConfig';

// --- CONFIGURAÇÃO FIREBASE (Cloudflare: variáveis de ambiente Vite) ---
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db   = getFirestore(app);
// Identificador lógico do namespace Firestore (separado do Firebase App ID)
const appId = import.meta.env.VITE_APP_ID || 'rhythm-secret';

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user,    setUser]    = useState(null);
  const [presets, setPresets] = useState({});
  const [toast,   setToast]   = useState(null);

  // States Principais
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [bpm,            setBpm]            = useState(60);
  const [bpmStep,        setBpmStep]        = useState(5);
  const [currentTheme,   setCurrentTheme]   = useState(THEMES.TIKTOK);
  const [appMode,        setAppMode]        = useState('PRO');
  const [playMode,       setPlayMode]       = useState('MANUAL');
  const [barsPerLoop,    setBarsPerLoop]    = useState(4);
  const [timeSignature,  setTimeSignature]  = useState(TIME_SIGNATURES[0]);

  // PRO Features
  const [isPermutationEnabled, setIsPermutationEnabled] = useState(false);
  const [isGhostModeEnabled,   setIsGhostModeEnabled]   = useState(false);
  const [isGapEnabled,         setIsGapEnabled]         = useState(false);
  const [isAutoLoopActive,     setIsAutoLoopActive]     = useState(false);

  // Auto BPM
  const [isBpmProgressEnabled, setIsBpmProgressEnabled] = useState(false);
  const [targetBpm,             setTargetBpm]            = useState(120);
  const [bpmProgressDirection,  setBpmProgressDirection] = useState(BPM_PROGRESS_DIRECTIONS.UP);
  const [bpmProgressInterval,   setBpmProgressInterval]  = useState(5);

  // Grid e Subdivisões
  const [displayedSubdivision, setDisplayedSubdivision] = useState(1);
  const [targetSubdivision,    setTargetSubdivision]    = useState(1);
  const [noteVolumes,          setNoteVolumes]          = useState([3]);
  const [currentPairDisplay,   setCurrentPairDisplay]   = useState(null);
  const [activeNoteIndex,      setActiveNoteIndex]      = useState(-1);
  const [visualBarCount,       setVisualBarCount]       = useState(null);
  const [isGapActive,          setIsGapActive]          = useState(false);

  // UI (Menus)
  const [isDropdownOpen,        setIsDropdownOpen]        = useState(false);
  const [isThemeMenuOpen,       setIsThemeMenuOpen]       = useState(false);
  const [isModeSelectorOpen,    setIsModeSelectorOpen]    = useState(false);
  const [isTimeSigSelectorOpen, setIsTimeSigSelectorOpen] = useState(false);
  const [isBpmStepOpen,         setIsBpmStepOpen]         = useState(false);
  const [isSaveMenuOpen,        setIsSaveMenuOpen]        = useState(false);
  const [showShortcutsModal,    setShowShortcutsModal]    = useState(false);

  // --- REFS PARA OTIMIZAÇÃO (sem re-renders no áudio) ---
  const pendingUpdateRef     = useRef(false);
  const audioContextRef      = useRef(null);
  const audioBuffersRef      = useRef({});
  const activeSourcesRef     = useRef([]);
  const uiTimeoutsRef        = useRef([]);
  const timerIDRef           = useRef(null);
  const startTimeRef         = useRef(0);
  const sequenceRef          = useRef([]);
  const currentEventIndexRef = useRef(0);
  // Refs de estado vivo (lidos pelo scheduler sem causar re-render)
  const bpmRef         = useRef(bpm);
  const isPlayingRef   = useRef(isPlaying);
  const playModeRef    = useRef(playMode);
  const appModeRef     = useRef(appMode);
  const noteVolumesRef = useRef(noteVolumes);
  // Sincronização de refs com state
  useEffect(() => { bpmRef.current         = bpm;        }, [bpm]);
  useEffect(() => { isPlayingRef.current   = isPlaying;  }, [isPlaying]);
  useEffect(() => { playModeRef.current    = playMode;   }, [playMode]);
  useEffect(() => { appModeRef.current     = appMode;    }, [appMode]);
  useEffect(() => { noteVolumesRef.current = noteVolumes;}, [noteVolumes]);

  // Refs de UI
  const dropdownRef     = useRef(null);
  const themeMenuRef    = useRef(null);
  const modeSelectorRef = useRef(null);
  const timeSigRef      = useRef(null);
  const bpmStepRef      = useRef(null);
  const saveMenuRef     = useRef(null);

  const AppModeIcon   = APP_MODES[appMode].icon;
  const isUiLocked    = isPlaying && (appMode === 'ADVANCED' || appMode === 'PRO');
  const isAnyMenuOpen = isDropdownOpen || isTimeSigSelectorOpen || isModeSelectorOpen
                      || isThemeMenuOpen || isBpmStepOpen || isSaveMenuOpen;

  // --- PRÉ-CARREGAMENTO DE ÁUDIO ---
  const preloadAudio = useCallback(() => {
    if (!audioContextRef.current)
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    if (!audioBuffersRef.current.high) {
      const createTone = (freq) => {
        const duration = 0.05;
        const buffer   = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
        const data     = buffer.getChannelData(0);
        for (let i = 0; i < ctx.sampleRate * duration; i++) {
          const t = i / ctx.sampleRate;
          data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 50);
        }
        return buffer;
      };
      audioBuffersRef.current = {
        high: createTone(1760),
        med:  createTone(1320),
        low:  createTone(880),
        base: createTone(440),
      };
    }
  }, []);

  const getBufferType = (freq) => {
    if (freq === 1760) return 'high';
    if (freq === 1320) return 'med';
    if (freq === 880)  return 'low';
    return 'base';
  };

  // --- AUTO BPM ENGINE ---
  useEffect(() => {
    let intervalId = null;
    if (isPlaying && isBpmProgressEnabled && appMode === 'PRO') {
      intervalId = setInterval(() => {
        setBpm((prev) => {
          const direction = targetBpm > prev ? 1 : -1;
          if (prev === targetBpm) return prev;
          let next = prev + direction * bpmStep;
          if (direction ===  1 && next > targetBpm) next = targetBpm;
          if (direction === -1 && next < targetBpm) next = targetBpm;
          return Math.max(30, Math.min(300, next));
        });
      }, bpmProgressInterval * 1000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [isPlaying, isBpmProgressEnabled, targetBpm, bpmProgressInterval, bpmStep, appMode]);

  // --- FIREBASE: AUTENTICAÇÃO ANÔNIMA ---
  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); }
      catch (err) { console.error('Erro na autenticação anônima:', err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- FIREBASE: PRESETS EM TEMPO REAL ---
  useEffect(() => {
    if (!user) return;
    const presetsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'presets');
    const unsubscribe = onSnapshot(presetsRef, (snapshot) => {
      const newPresets = {};
      snapshot.forEach(d => { newPresets[d.id] = d.data(); });
      setPresets(newPresets);
    });
    return () => unsubscribe();
  }, [user]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const handleSavePreset = async (slotId) => {
    if (!user) { showToast('Erro: Não autenticado'); return; }
    const dataToSave = {
      bpm, playMode, barsPerLoop, timeSignature, targetSubdivision, noteVolumes,
      isPermutationEnabled, isGhostModeEnabled, isGapEnabled, isAutoLoopActive,
      isBpmProgressEnabled, targetBpm, bpmProgressDirection, bpmProgressInterval,
      timestamp: Date.now(),
      name: `${bpm}BPM ${timeSignature.name}`,
    };
    const slotKey = `slot${slotId}`;
    const docRef  = doc(db, 'artifacts', appId, 'users', user.uid, 'presets', slotKey);
    try {
      await setDoc(docRef, dataToSave);
      showToast(`💾 Salvo no slot ${slotId}`);
      setIsSaveMenuOpen(false);
    } catch (err) { console.error('Save error:', err); showToast('Erro ao salvar'); }
  };

  const handleLoadPreset = (slotId) => {
    const data = presets[`slot${slotId}`];
    if (!data) { showToast(`Slot ${slotId} vazio`); return; }
    setBpm(data.bpm); setPlayMode(data.playMode); setBarsPerLoop(data.barsPerLoop);
    setTimeSignature(data.timeSignature); setTargetSubdivision(data.targetSubdivision);
    setNoteVolumes(data.noteVolumes); setIsPermutationEnabled(data.isPermutationEnabled);
    setIsGhostModeEnabled(data.isGhostModeEnabled); setIsGapEnabled(data.isGapEnabled);
    if (data.isAutoLoopActive     !== undefined) setIsAutoLoopActive(data.isAutoLoopActive);
    if (data.isBpmProgressEnabled !== undefined) {
      setIsBpmProgressEnabled(data.isBpmProgressEnabled);
      setTargetBpm(data.targetBpm || 120);
      setBpmProgressInterval(data.bpmProgressInterval || 5);
    }
    showToast(`📂 Preset ${slotId} carregado`);
    closeAllMenus();
    if (isPlaying) { handleStop(); setTimeout(() => handleStart(), 50); }
  };

  const closeAllMenus = useCallback(() => {
    setIsDropdownOpen(false); setIsTimeSigSelectorOpen(false);
    setIsModeSelectorOpen(false); setIsThemeMenuOpen(false);
    setIsBpmStepOpen(false); setIsSaveMenuOpen(false);
  }, []);

  const handleAutoLoopToggle = () => {
    if (isUiLocked) return;
    if (!isAutoLoopActive) {
      if (playMode !== 'AUTO_UP' && playMode !== 'AUTO_DOWN') {
        showToast('Selecione Auto ↑ ou Auto ↓'); return;
      }
      setIsAutoLoopActive(true);
      showToast('⟲ Auto Loop ativado');
    } else {
      setIsAutoLoopActive(false);
      showToast('⨯ Auto Loop desativado');
    }
  };

  const resetVolumes = () => {
    setNoteVolumes(createGroovePattern(targetSubdivision));
    showToast('🔊 Volumes resetados');
  };

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isAnyMenuOpen) return;
      const isInside = [dropdownRef, themeMenuRef, modeSelectorRef, timeSigRef, bpmStepRef, saveMenuRef]
        .some(ref => ref.current?.contains(event.target));
      if (!isInside) closeAllMenus();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAnyMenuOpen, closeAllMenus]);

  // Reset features ao entrar no modo Iniciante
  useEffect(() => {
    if (appMode === 'BEGINNER') {
      setPlayMode('MANUAL'); setTimeSignature(TIME_SIGNATURES[0]);
      setIsPermutationEnabled(false); setIsGhostModeEnabled(false);
      setIsGapEnabled(false); setIsAutoLoopActive(false); setIsBpmProgressEnabled(false);
    }
  }, [appMode]);

  // Sincronizar displayedSubdivision quando parado
  useEffect(() => {
    if (!isPlaying) {
      setDisplayedSubdivision(targetSubdivision);
      if (noteVolumes.length !== targetSubdivision)
        setNoteVolumes(createGroovePattern(targetSubdivision));
    }
  }, [targetSubdivision, isPlaying]);

  // --- GERAÇÃO DE ROTEIRO ---
  const generateScript = useCallback((subOverride = null) => {
    const script = [];
    const BEATS_PER_BAR = timeSignature.num;
    const startSub = subOverride || targetSubdivision;
    let phases = [];

    if (appMode === 'PRO' && isPermutationEnabled) {
      for (let anchor = startSub; anchor <= 12; anchor++)
        for (let variation = 1; variation <= 12; variation++)
          phases.push({ type: 'PAIR', anchor, variation, totalBars: barsPerLoop * 2 });
    } else if (playMode !== 'MANUAL') {
      let current = startSub;
      const up = playMode === 'AUTO_UP';
      for (let i = 0; i < 100; i++) {
        phases.push({ type: 'SINGLE', sub: current, totalBars: barsPerLoop });
        if (up) current = current >= 12 ? 1 : current + 1;
        else    current = current <= 1  ? 12 : current - 1;
      }
    } else {
      phases.push({ type: 'SINGLE', sub: startSub, totalBars: 9999 });
    }

    let absBarIndex = 0, absTime = 0;
    for (const phase of phases) {
      if (phase.type === 'PAIR') {
        for (let b = 0; b < barsPerLoop; b++) {
          script.push(generateBarEvents(absBarIndex++, absTime, phase.anchor, [phase.anchor, phase.variation]));
          absTime += BEATS_PER_BAR;
        }
        for (let b = 0; b < barsPerLoop; b++) {
          script.push(generateBarEvents(absBarIndex++, absTime, phase.variation, [phase.anchor, phase.variation]));
          absTime += BEATS_PER_BAR;
        }
        if (isGapEnabled) {
          script.push(generateGapEvents(absBarIndex, absTime, phase.variation, [phase.anchor, phase.variation]));
          absTime += BEATS_PER_BAR;
        }
      } else {
        for (let b = 0; b < phase.totalBars; b++) {
          script.push(generateBarEvents(absBarIndex++, absTime, phase.sub, null));
          absTime += BEATS_PER_BAR;
        }
        if (isGapEnabled && playMode !== 'MANUAL') {
          script.push(generateGapEvents(absBarIndex, absTime, phase.sub, null));
          absTime += BEATS_PER_BAR;
        }
      }
    }
    return script.flat();
  }, [appMode, playMode, targetSubdivision, barsPerLoop, timeSignature, isPermutationEnabled, isGapEnabled]);

  const generateBarEvents = (barIndex, startTime, subdivision, pairInfo) => {
    const events  = [];
    const volumes = createGroovePattern(subdivision);
    for (let beat = 0; beat < timeSignature.num; beat++) {
      const pitch = getAccentWeight(beat, timeSignature);
      for (let sub = 0; sub < subdivision; sub++) {
        let vol = volumes[sub];
        if (appMode === 'PRO' && isGhostModeEnabled && vol > 0 && vol < 3 && Math.random() > 0.6) vol = 0;
        events.push({ type: 'NOTE', absTime: startTime + beat + sub / subdivision, freq: sub === 0 ? pitch : 440, volume: vol, subdivision, subIndex: sub, bar: barIndex, beat, pairInfo });
      }
    }
    return events;
  };

  const generateGapEvents = (barIndex, startTime, subdivision, pairInfo) => {
    const events = [];
    for (let beat = 0; beat < timeSignature.num; beat++)
      events.push({ type: 'GAP', absTime: startTime + beat, subdivision, bar: barIndex, beat, pairInfo });
    return events;
  };

  // --- SCHEDULER DE ALTA PERFORMANCE (0 deps via refs) ---
  const scheduler = useCallback(() => {
    if (!audioContextRef.current || !isPlayingRef.current) return;
    const ctx = audioContextRef.current;
    const secondsPerBeat = 60.0 / bpmRef.current;
    const compensatedCurrentTime = ctx.currentTime - LATENCY_COMPENSATION;

    activeSourcesRef.current = activeSourcesRef.current.filter(s => s.time >= ctx.currentTime - 1);

    if (pendingUpdateRef.current && appModeRef.current === 'BEGINNER') {
      handleStop(); setTimeout(() => handleStart(), 50);
      pendingUpdateRef.current = false;
      return;
    }

    while (currentEventIndexRef.current < sequenceRef.current.length) {
      const event = sequenceRef.current[currentEventIndexRef.current];
      const eventTimeCompensated = startTimeRef.current + event.absTime * secondsPerBeat - LATENCY_COMPENSATION;
      const eventTimeTheoretical = startTimeRef.current + event.absTime * secondsPerBeat;

      if (eventTimeCompensated > compensatedCurrentTime + LOOKAHEAD_TIME) break;

      if (eventTimeCompensated >= compensatedCurrentTime) {
        // 1. Agendamento de áudio
        if (event.type === 'NOTE') {
          let vol = event.volume;
          if (playModeRef.current === 'MANUAL' && noteVolumesRef.current.length === event.subdivision)
            vol = noteVolumesRef.current[event.subIndex];
          if (vol > 0) {
            const source = ctx.createBufferSource();
            source.buffer = audioBuffersRef.current[getBufferType(event.freq)];
            const gain = ctx.createGain();
            gain.gain.value = VOLUME_VALUES[vol];
            source.connect(gain); gain.connect(ctx.destination);
            const scheduleTime = ctx.currentTime + Math.max(0, eventTimeCompensated - compensatedCurrentTime);
            source.start(scheduleTime);
            activeSourcesRef.current.push({ source, time: scheduleTime });
          }
        }
        // 2. Fila visual
        const timeToVisual = (eventTimeTheoretical - ctx.currentTime) * 1000;
        const uiTimeout = setTimeout(() => {
          if (!isPlayingRef.current) return;
          setDisplayedSubdivision(event.subdivision);
          setCurrentPairDisplay(event.pairInfo ? `${event.pairInfo[0]} vs ${event.pairInfo[1]}` : null);
          if (event.type === 'GAP') {
            setIsGapActive(true); setActiveNoteIndex(-1); setVisualBarCount('GAP');
          } else {
            setIsGapActive(false); setActiveNoteIndex(event.subIndex);
            if (event.subIndex === 0 && event.beat === 0) setVisualBarCount(event.bar + 1);
          }
        }, Math.max(0, timeToVisual));
        uiTimeoutsRef.current.push(uiTimeout);
      }
      currentEventIndexRef.current++;
    }
    timerIDRef.current = setTimeout(scheduler, SCHEDULER_INTERVAL);
  }, []); // 0 deps — sem engasgos durante reprodução

  const handleStart = () => {
    preloadAudio();
    sequenceRef.current = generateScript();
    currentEventIndexRef.current = 0;
    setIsPlaying(true);
    startTimeRef.current = audioContextRef.current.currentTime + 0.05;
    timerIDRef.current = setTimeout(scheduler, SCHEDULER_INTERVAL);
  };

  const handleStop = useCallback(() => {
    if (timerIDRef.current) clearTimeout(timerIDRef.current);
    timerIDRef.current = null;
    setIsPlaying(false); setActiveNoteIndex(-1); setVisualBarCount(null);
    setIsGapActive(false); setCurrentPairDisplay(null);
    setDisplayedSubdivision(targetSubdivision);
    setNoteVolumes(createGroovePattern(targetSubdivision));
    pendingUpdateRef.current = false;
    uiTimeoutsRef.current.forEach(clearTimeout);
    uiTimeoutsRef.current = [];
    activeSourcesRef.current.forEach(item => { try { item.source.stop(); } catch (e) {} });
    activeSourcesRef.current = [];
  }, [targetSubdivision]);

  const handleSubdivisionChange = (sub) => {
    if (isUiLocked) return;
    setTargetSubdivision(sub); setDisplayedSubdivision(sub);
    setNoteVolumes(createGroovePattern(sub)); closeAllMenus();
    if (isPlaying && appMode === 'BEGINNER') pendingUpdateRef.current = true;
  };

  const handleTimeSigChange = (sig) => {
    if (isUiLocked) return; setTimeSignature(sig); closeAllMenus();
    if (isPlaying && appMode === 'BEGINNER') { handleStop(); setTimeout(() => handleStart(), 50); }
  };

  const toggleNoteVolume = (idx) => {
    if (isUiLocked) return;
    setNoteVolumes(prev => { const nv = [...prev]; nv[idx] = nv[idx] === 3 ? 0 : nv[idx] + 1; return nv; });
  };

  const adjustBpm = (direction) => {
    if (isUiLocked) return;
    setBpm(prev => Math.max(30, Math.min(300, prev + direction * bpmStep)));
  };

  // --- ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if ([' ', 'arrowup', 'arrowdown'].includes(key)) e.preventDefault();

      if      (key === ' ')      { isPlaying ? handleStop() : handleStart(); }
      else if (key === 'escape') { handleStop(); }
      else if (/^[1-9]$/.test(key) || key === '0' || key === '-' || key === '=') {
        if (!isUiLocked) {
          let sub;
          if      (key === '0') sub = 10;
          else if (key === '-') sub = 11;
          else if (key === '=') sub = 12;
          else sub = parseInt(key, 10);
          if (sub >= 1 && sub <= 12) {
            handleSubdivisionChange(sub);
            showToast(`Subdivisão: ${SUBDIVISIONS_DESC[sub - 1]}`);
          }
        }
      }
      else if (key === 'e') { if (!isUiLocked && appMode !== 'BEGINNER') { setPlayMode('AUTO_UP');   showToast('↑ Modo Auto ↑ ativado'); } }
      else if (key === 'd') { if (!isUiLocked && appMode !== 'BEGINNER') { setPlayMode('AUTO_DOWN'); showToast('↓ Modo Auto ↓ ativado'); } }
      else if (key === 's') { if (!isUiLocked && appMode !== 'BEGINNER') { setPlayMode('MANUAL');    showToast('◉ Modo Manual ativado'); } }
      else if (key === 'f') { if (!isUiLocked && appMode !== 'BEGINNER') handleAutoLoopToggle(); }
      else if (key === 'q') { if (!isUiLocked) { adjustBpm(-1); showToast(`BPM: ${bpmRef.current - bpmStep}`); } }
      else if (key === 'w') { if (!isUiLocked) { adjustBpm(1);  showToast(`BPM: ${bpmRef.current + bpmStep}`); } }
      else if (key === 'r') { if (!isUiLocked) { setBpm(120); showToast('↺ BPM resetado para 120'); } }
      else if (key === 't') { if (!isUiLocked && appMode === 'PRO') { setTargetBpm(bpm); showToast(`🎯 Target BPM fixado: ${bpm}`); } }
      else if (key === 'z') { if (!isUiLocked && appMode === 'PRO') { setIsPermutationEnabled(p => !p); showToast('🔄 Permutação alternada'); } }
      else if (key === 'x') { if (!isUiLocked && appMode === 'PRO') { setIsGapEnabled(p => !p);          showToast('⏳ Gap Ciclo alternado'); } }
      else if (key === 'c') { if (!isUiLocked && appMode === 'PRO') { setIsGhostModeEnabled(p => !p);    showToast('👻 Ghost Mode alternado'); } }
      else if (key === 'v') { if (!isUiLocked && appMode === 'PRO') { setIsBpmProgressEnabled(p => !p);  showToast('⚡ Auto BPM alternado'); } }
      else if (/^[a-l]$/.test(key)) {
        if (!isUiLocked) {
          const idx = key.charCodeAt(0) - 'a'.charCodeAt(0);
          if (idx < targetSubdivision) toggleNoteVolume(idx);
        }
      }
      else if (key === ';')         { if (!isUiLocked) resetVolumes(); }
      else if (key === 'p')         { setIsThemeMenuOpen(p => !p); }
      else if (key === 'm')         { setIsTimeSigSelectorOpen(p => !p); }
      else if (key === 'k')         { setIsModeSelectorOpen(p => !p); }
      else if (key === '.')         { setIsSaveMenuOpen(p => !p); }
      else if (key === ',')         { setIsBpmStepOpen(p => !p); }
      else if (key === '/')         { setShowShortcutsModal(p => !p); }
      else if (key === 'arrowup') {
        if (!isUiLocked) {
          const idx = TIME_SIGNATURES.findIndex(s => s.name === timeSignature.name);
          handleTimeSigChange(TIME_SIGNATURES[(idx + 1) % TIME_SIGNATURES.length]);
        }
      }
      else if (key === 'arrowdown') {
        if (!isUiLocked) {
          const idx = TIME_SIGNATURES.findIndex(s => s.name === timeSignature.name);
          handleTimeSigChange(TIME_SIGNATURES[(idx - 1 + TIME_SIGNATURES.length) % TIME_SIGNATURES.length]);
        }
      }
      else if (e.shiftKey && ['1','2','3'].includes(key)) { handleLoadPreset(parseInt(key)); }
      else if (e.ctrlKey  && ['1','2','3'].includes(key)) { e.preventDefault(); handleSavePreset(parseInt(key)); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isUiLocked, appMode, bpmStep, timeSignature, targetSubdivision, bpm,
      handleAutoLoopToggle, handleSubdivisionChange, handleTimeSigChange, handleLoadPreset, handleStart, handleStop]);

  // --- RENDERIZADORES ---
  const renderVolumeColumn = (volLevel, index) => {
    const isActive = activeNoteIndex === index;
    const isMuted  = volLevel === 0;
    const getBarColor = (level) => {
      if (isGapActive) return 'bg-yellow-500/10';
      if (isActive)    return `${currentTheme.colors.barActive}`;
      return level > 0 ? currentTheme.colors.barFilled : 'bg-gray-800/30';
    };
    return (
      <div
        key={index}
        onMouseDown={(e) => { e.stopPropagation(); toggleNoteVolume(index); }}
        className={`flex flex-col gap-1 items-center justify-end flex-none w-[calc(25%-0.5rem)] sm:w-[calc(25%-1rem)] max-w-[150px] h-[15vh] min-h-[90px] max-h-[300px] sm:h-[22vh] sm:min-h-[120px] rounded-xl transition-all duration-100 select-none ${isUiLocked ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-white/10'} ${isActive ? 'scale-105 -translate-y-2' : ''}`}
      >
        {[3, 2, 1].map(lvl => (
          <div key={lvl} className={`w-full h-[25%] rounded-md transition-all duration-75 ${volLevel >= lvl ? getBarColor(lvl) : 'bg-gray-800/20'}`} />
        ))}
        <div className={`mt-2 text-[10px] sm:text-xs font-black ${isActive ? currentTheme.colors.accent : 'text-gray-500'}`}>
          {isMuted ? <VolumeX size={12} /> : index + 1}
        </div>
      </div>
    );
  }

  const renderSubdivisionGrid = () => {
    let volsToShow;
    if (isUiLocked) volsToShow = createGroovePattern(displayedSubdivision);
    else volsToShow = noteVolumes.length !== targetSubdivision ? createGroovePattern(targetSubdivision) : noteVolumes;

    const MAX_COLS = 4;
    const rows = [];
    for (let i = 0; i < volsToShow.length; i += MAX_COLS)
      rows.push(volsToShow.slice(i, i + MAX_COLS));

    return (
      <div className={`transition-all duration-300 ${isGapActive ? 'opacity-30 blur-sm scale-95' : 'opacity-100'} w-full h-full flex flex-col justify-center items-center gap-2 sm:gap-4`}>
        {rows.map((row, rIndex) => (
          <div key={rIndex} className="flex justify-center gap-2 sm:gap-4 w-full max-w-5xl">
            {row.map((vol, cIndex) => renderVolumeColumn(vol, rIndex * MAX_COLS + cIndex))}
          </div>
        ))}
      </div>
    );
  };

  // --- RENDER PRINCIPAL ---
  return (
    <div className={`min-h-[100dvh] w-full overflow-y-auto overflow-x-hidden ${currentTheme.colors.bg} ${currentTheme.colors.text} font-sans flex flex-col items-center p-2 sm:p-4 lg:p-6 transition-colors duration-700 relative selection:bg-white/20`}>
      <style>{`
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="fixed top-20 z-[200] px-6 py-3 bg-yellow-500 text-black text-xs font-black rounded-full shadow-[0_0_20px_rgba(234,179,8,0.5)] flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* LOCKED INDICATOR */}
      {isUiLocked && (
        <div className="fixed top-4 right-4 z-[100] flex items-center gap-2 px-3 py-1 bg-red-900/40 border border-red-500/40 rounded-full animate-pulse backdrop-blur-sm shadow-[0_0_15px_rgba(239,68,68,0.3)]">
          <Lock size={12} className="text-red-400" />
          <span className="text-[10px] font-bold text-red-400 tracking-wider">LOCKED</span>
        </div>
      )}

      {/* NÚMERO DE COMPASSO EM BACKGROUND */}
      {isPlaying && visualBarCount && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0">
          <div className={`font-black tracking-tighter opacity-5 transition-all duration-500 ${visualBarCount === 'GAP' ? 'text-6xl text-yellow-500' : 'text-[clamp(10rem,50vw,30rem)]'}`}>
            {visualBarCount}
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="relative z-50 w-full max-w-full shrink-0 h-auto min-h-[60px] flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-3xl font-black tracking-tighter sm:tracking-normal flex items-center drop-shadow-xl">
            <span className={currentTheme.colors.accent}>My</span>
            <span className="text-white mx-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Rhythm</span>
            <span className={currentTheme.colors.accent}>Secret</span>
          </h1>

          {/* SELETOR DE MODO */}
          <div className="relative" ref={modeSelectorRef}>
            <button
              disabled={isUiLocked}
              onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && setIsModeSelectorOpen(!isModeSelectorOpen); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-full border border-white/10 transition-all ${isUiLocked ? 'opacity-40' : 'hover:bg-white/10'} relative z-[100] bg-black/20`}
            >
              <AppModeIcon size={18} className={currentTheme.colors.accent} />
              <span className="text-xs font-black uppercase hidden sm:inline">{APP_MODES[appMode].label}</span>
              <ChevronDown size={14} className="opacity-50" />
            </button>
            {isModeSelectorOpen && (
              <div className="absolute top-full left-0 mt-3 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] w-52 z-[100] animate-in zoom-in-95" onMouseDown={(e) => e.stopPropagation()}>
                {Object.values(APP_MODES).map(m => (
                  <button key={m.id} onMouseDown={(e) => { e.stopPropagation(); setAppMode(m.id); closeAllMenus(); }} className={`w-full text-left p-3 rounded-xl hover:bg-white/5 flex items-center gap-3 ${appMode === m.id ? 'bg-white/10' : ''}`}>
                    <m.icon size={20} className={appMode === m.id ? currentTheme.colors.accent : 'text-gray-500'} />
                    <div className="flex flex-col text-[11px] font-black uppercase tracking-wider">{m.label}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SELETOR DE TEMA */}
          <div className="relative" ref={themeMenuRef}>
            <button
              disabled={isUiLocked}
              onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && setIsThemeMenuOpen(!isThemeMenuOpen); }}
              className={`p-2.5 rounded-full transition-colors ${isUiLocked ? 'opacity-30' : 'hover:bg-white/10'} relative z-[100] bg-black/20 border border-white/5`}
            >
              <Palette size={20} className={currentTheme.colors.accent} />
            </button>
            {isThemeMenuOpen && (
              <div className="absolute top-full left-0 mt-3 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] grid grid-cols-2 gap-2 w-64 z-[100] max-h-[60vh] overflow-y-auto animate-in zoom-in-95" onMouseDown={(e) => e.stopPropagation()}>
                {Object.values(THEMES).map(t => (
                  <button key={t.id} onMouseDown={(e) => { e.stopPropagation(); setCurrentTheme(t); closeAllMenus(); }} className={`text-[10px] p-3 rounded-xl text-left hover:bg-white/5 flex items-center gap-2 ${currentTheme.id === t.id ? 'bg-white/10' : ''}`}>
                    <div className={`w-3 h-3 rounded-full ${t.colors.barFilled} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />{t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PLAY MODE TOGGLE */}
        {appMode !== 'BEGINNER' && (
          <div className={`flex bg-black/40 p-1.5 rounded-2xl border border-white/5 transition-opacity shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] ${isUiLocked ? 'opacity-30 pointer-events-none' : ''}`}>
            {['MANUAL', 'AUTO_UP', 'AUTO_DOWN'].map(m => (
              <button key={m} onMouseDown={(e) => { e.stopPropagation(); setPlayMode(m); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${playMode === m ? currentTheme.colors.button + ' text-white' : 'text-gray-500 hover:text-white'}`}>
                {m === 'MANUAL' ? <Repeat size={16} /> : m === 'AUTO_UP' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className="hidden md:inline">{m.replace('AUTO_', '')}</span>
              </button>
            ))}
            <button onMouseDown={(e) => { e.stopPropagation(); handleAutoLoopToggle(); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all ${isAutoLoopActive ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]' : 'text-gray-500 hover:text-white'}`}>
              <Repeat size={16} className={isAutoLoopActive ? 'animate-spin-slow' : ''} />
              <span className="hidden md:inline">Loop</span>
            </button>
          </div>
        )}
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 w-full flex flex-col lg:flex-row items-stretch gap-6 overflow-visible relative z-10">

        {/* PAINEL MIXER */}
        <div className={`flex-[3] flex flex-col items-center justify-between rounded-[3rem] p-4 sm:p-10 border transition-all relative w-full ${currentTheme.colors.container} shadow-2xl`}>
          {appMode === 'PRO' && (
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none z-0">
              <Crown className="absolute top-4 right-4 text-yellow-500/5 w-32 h-32 -rotate-12" />
            </div>
          )}

          <div className="w-full flex flex-wrap justify-between items-start mb-4 z-20 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 px-4 py-2 bg-black/20 rounded-full border border-white/5 w-fit shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                <Volume2 size={16} className="opacity-50" />
                <h2 className="opacity-80 text-[10px] sm:text-xs uppercase font-black tracking-widest leading-none">
                  {isGapActive ? 'SILÊNCIO...' : (currentPairDisplay || SUBDIVISIONS.find(s => s.value === displayedSubdivision)?.label)}
                </h2>
              </div>

              {/* SELETOR DE COMPASSO */}
              <div className="relative" ref={timeSigRef}>
                <button
                  onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && setIsTimeSigSelectorOpen(!isTimeSigSelectorOpen); }}
                  disabled={isUiLocked}
                  className={`flex items-center gap-3 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 text-sm font-black ${isUiLocked ? 'opacity-40' : 'hover:bg-white/10'} relative z-[100] shadow-lg`}
                >
                  <Music size={18} className={currentTheme.colors.accent} /> {timeSignature.name} <ChevronDown size={14} className="opacity-40" />
                </button>
                {isTimeSigSelectorOpen && (
                  <div className="absolute top-full left-0 mt-3 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] w-48 z-[100] max-h-[400px] overflow-y-auto animate-in slide-in-from-top-2" onMouseDown={(e) => e.stopPropagation()}>
                    {TIME_SIGNATURES.map(sig => (
                      <button key={sig.name} onMouseDown={(e) => { e.stopPropagation(); handleTimeSigChange(sig); }} className={`w-full text-left p-3 rounded-xl hover:bg-white/5 text-xs font-black flex items-center justify-between ${timeSignature.name === sig.name ? 'bg-white/10 text-white' : 'text-gray-400'}`}>
                        <span>{sig.name}</span><span className="opacity-30 text-[10px]">{sig.num}/{sig.den}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLE DE CICLO */}
            {appMode !== 'BEGINNER' && (
              <div className={`flex flex-col items-end gap-2 ${isUiLocked ? 'opacity-40' : ''}`}>
                <span className="text-[10px] font-black uppercase opacity-40 mr-1">Ciclo</span>
                <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                  {LOOP_BAR_OPTIONS.map(o => (
                    <button key={o} onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && setBarsPerLoop(o); }} disabled={isUiLocked} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all ${barsPerLoop === o ? 'bg-white/15 text-white shadow-[inset_0_0_8px_rgba(255,255,255,0.1)] border border-white/10' : 'opacity-30 hover:opacity-100'}`}>{o}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GRADE DE SUBDIVISÕES */}
          <div className="flex-1 w-full flex items-center justify-center py-6 sm:py-8 z-10">
            {renderSubdivisionGrid()}
          </div>

          {/* PRO FEATURES */}
          {appMode === 'PRO' ? (
            <div className="w-full mt-6 p-3 sm:p-5 bg-black/30 border border-yellow-500/10 rounded-[2.5rem] flex flex-col gap-6 z-10 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
              <div className="w-full flex flex-wrap justify-around items-center gap-6 border-b border-yellow-500/10 pb-4">
                {[
                  { id: 'perm',  label: 'PERMUTAÇÃO', active: isPermutationEnabled, fn: setIsPermutationEnabled, icon: Shuffle },
                  { id: 'gap',   label: 'GAP CICLO',  active: isGapEnabled,         fn: setIsGapEnabled,         icon: Hourglass },
                  { id: 'ghost', label: 'GHOST MODE', active: isGhostModeEnabled,   fn: setIsGhostModeEnabled,   icon: Ghost },
                ].map(f => (
                  <div key={f.id} className="flex flex-col items-center gap-2 group cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && f.fn(!f.active); }}>
                    <div className={`p-3 rounded-2xl transition-all ${f.active ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105' : 'bg-gray-800 text-gray-500 opacity-60'}`}><f.icon size={22} /></div>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.1em]">{f.label}</span>
                    <span className="text-[11px] font-bold text-white uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{f.active ? 'ON' : 'OFF'}</span>
                  </div>
                ))}

                <div className="w-px h-12 bg-yellow-500/20 hidden md:block" />

                {/* AUTO BPM */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && setIsBpmProgressEnabled(!isBpmProgressEnabled); }}>
                  <div className={`p-3 rounded-2xl transition-all ${isBpmProgressEnabled ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105' : 'bg-gray-800 text-gray-500 opacity-60'}`}><Zap size={22} className={isBpmProgressEnabled ? 'animate-pulse' : ''} /></div>
                  <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.1em]">AUTO BPM</span>
                  <span className="text-[11px] font-bold text-white uppercase drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{isBpmProgressEnabled ? 'ON' : 'OFF'}</span>
                </div>

                <div className="w-px h-12 bg-yellow-500/20 hidden md:block" />

                {/* SALVAR PRESETS */}
                <div className="relative" ref={saveMenuRef}>
                  <div className="flex flex-col items-center gap-2 cursor-pointer group" onMouseDown={(e) => { e.stopPropagation(); !isUiLocked && setIsSaveMenuOpen(!isSaveMenuOpen); }}>
                    <div className={`p-3 rounded-2xl transition-all ${isSaveMenuOpen ? 'bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.5)] scale-105' : 'bg-gray-800 text-gray-500 opacity-60'}`}><Save size={22} /></div>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.1em]">SALVAR</span>
                    <span className="text-[11px] font-bold text-white uppercase">PRESETS</span>
                  </div>
                  {isSaveMenuOpen && (
                    <div className="absolute bottom-full mb-4 right-0 w-72 bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/10 p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[200] animate-in zoom-in-95" onMouseDown={(e) => e.stopPropagation()}>
                      <h4 className="text-[10px] font-black text-gray-600 uppercase px-3 py-2 border-b border-white/5 mb-2 tracking-widest text-center">Slots de Memória</h4>
                      {[1, 2, 3].map(s => (
                        <div key={s} className="flex items-center gap-2 p-1 group">
                          <button onMouseDown={(e) => { e.stopPropagation(); handleLoadPreset(s); }} className="flex-1 text-left p-3.5 rounded-2xl hover:bg-white/5 transition-all text-[11px] font-black text-white flex justify-between items-center bg-white/5 border border-white/5">
                            Slot {s}
                            <span className="text-[9px] text-gray-500 font-normal truncate max-w-[100px] ml-2 italic">{presets[`slot${s}`] ? presets[`slot${s}`].name : 'Vazio'}</span>
                          </button>
                          <button onMouseDown={(e) => { e.stopPropagation(); handleSavePreset(s); }} className="p-3.5 rounded-2xl bg-black border border-white/10 text-gray-400 hover:text-green-500 hover:border-green-500/50 hover:bg-green-900/20 transition-all shadow-lg" title="Gravar estado atual"><Save size={18} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AUTO BPM CONFIG */}
              {isBpmProgressEnabled && (
                <div className="w-full flex flex-wrap justify-center items-center gap-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-4 bg-black/40 p-3 rounded-3xl border border-yellow-500/20 shadow-inner">
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-blue-400 uppercase mb-1 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">A (Início)</span>
                      <div className="text-2xl font-black text-white tabular-nums">{bpm}</div>
                    </div>
                    <ArrowRight size={20} className="text-yellow-500/50 mx-2 animate-pulse" />
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] font-black text-yellow-500 uppercase mb-1 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">B (Alvo)</span>
                      <input
                        type="number" value={targetBpm}
                        onChange={(e) => setTargetBpm(Math.max(30, Math.min(300, Number(e.target.value))))}
                        className="w-16 bg-white/5 text-2xl font-black text-yellow-500 text-center rounded-xl py-1 focus:outline-none focus:ring-1 ring-yellow-500/50 border border-white/5"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Intervalo (Segundos)</span>
                    <div className="flex gap-2 bg-black/40 p-1.5 rounded-2xl shadow-inner">
                      {[2, 5, 10, 30].map(sec => (
                        <button key={sec} onMouseDown={() => setBpmProgressInterval(sec)} className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all ${bpmProgressInterval === sec ? 'bg-yellow-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)] scale-105' : 'bg-transparent text-gray-500 hover:text-white hover:bg-white/10'}`}>{sec}s</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-4 py-3 bg-black/40 rounded-3xl border border-white/5 shadow-inner min-w-[120px]">
                    <span className="text-[9px] font-black text-gray-500 uppercase mb-1">Passo Ativo</span>
                    <div className="text-xl font-black text-yellow-500">+{bpmStep} BPM</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 opacity-20 text-[11px] uppercase font-black tracking-[0.5em] select-none text-center">Rhythmic Intelligence Engine</div>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="flex-1 w-full lg:max-w-[350px] flex flex-col sm:flex-row lg:flex-col gap-6 items-stretch relative z-50">

          {/* SELETOR DE SUBDIVISÃO */}
          <div className="w-full group shrink-0 relative z-50 flex-1 lg:flex-none" ref={dropdownRef}>
            <button
              disabled={isUiLocked}
              onMouseDown={(e) => { e.stopPropagation(); setIsDropdownOpen(!isDropdownOpen); }}
              className={`w-full bg-black/30 border rounded-[2.5rem] p-6 flex justify-between items-center shadow-2xl ${isUiLocked ? 'opacity-40' : 'border-white/10 hover:border-white/20 active:scale-95'} transition-all relative z-[100]`}
            >
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black border transition-all duration-500 ${currentTheme.colors.subDisplay}`}>{targetSubdivision}</div>
                <div className="flex flex-col items-start min-w-0 leading-tight">
                  <span className="text-[10px] opacity-40 uppercase font-black tracking-widest mb-1">Start Figura</span>
                  <span className="text-sm font-black truncate w-full text-white uppercase tracking-tight">{SUBDIVISIONS.find(s => s.value === targetSubdivision)?.label}</span>
                </div>
              </div>
              <ChevronDown className="opacity-30" size={24} />
            </button>
            {isDropdownOpen && !isUiLocked && (
              <div className="absolute top-full left-0 w-full mt-3 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden max-h-[60vh] overflow-y-auto z-[100] animate-in fade-in zoom-in-95" onMouseDown={(e) => e.stopPropagation()}>
                {SUBDIVISIONS.map(sub => (
                  <button key={sub.value} onMouseDown={(e) => { e.stopPropagation(); handleSubdivisionChange(sub.value); }} className={`w-full text-left p-5 hover:bg-white/5 flex items-center border-b border-white/5 last:border-0 transition-colors text-sm font-black uppercase ${targetSubdivision === sub.value ? 'bg-white/10 ' + currentTheme.colors.accent : 'text-gray-400'}`}>
                    <span className="font-black text-2xl w-10 text-center mr-4">{sub.value}</span>{sub.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DIAL DE BPM */}
          <div className={`relative flex-1 aspect-square lg:aspect-square flex items-center justify-center transition-all duration-700 bg-black/20 rounded-[3rem] border border-white/[0.03] ${isUiLocked ? 'opacity-80 scale-95' : 'opacity-100 scale-100'} shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]`}>
            <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 z-20">
              <button disabled={isUiLocked} onMouseDown={(e) => { e.stopPropagation(); adjustBpm(-1); }} className="w-16 h-16 flex items-center justify-center rounded-full bg-black/60 border border-white/10 shadow-2xl active:scale-90 transition-all hover:bg-white/20 text-white backdrop-blur-sm"><Minus size={32} /></button>
            </div>
            <div className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 z-20">
              <button disabled={isUiLocked} onMouseDown={(e) => { e.stopPropagation(); adjustBpm(1); }} className="w-16 h-16 flex items-center justify-center rounded-full bg-black/60 border border-white/10 shadow-2xl active:scale-90 transition-all hover:bg-white/20 text-white backdrop-blur-sm"><Plus size={32} /></button>
            </div>
            <div className="absolute inset-6 rounded-full border-[15px] border-white/[0.02] shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]" />
            <svg className="absolute inset-0 w-full h-full rotate-[-90deg] drop-shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="15" fill="transparent"
                strokeDasharray="264%" strokeDashoffset={`${264 - 264 * ((bpm - 30) / (300 - 30))}%`}
                className={`${currentTheme.colors.accent.replace('text-', 'text-')} transition-all duration-500 ease-out`}
                strokeLinecap="round" />
            </svg>
            <input type="range" min="30" max="300" step={1} value={bpm}
              onChange={(e) => !isUiLocked && setBpm(Number(e.target.value))}
              disabled={isUiLocked}
              className={`absolute w-full h-full opacity-0 z-10 rounded-full ${isUiLocked ? 'cursor-not-allowed' : 'cursor-ew-resize'}`}
            />
            <div className="z-10 flex flex-col items-center relative pointer-events-none leading-none">
              <span className="opacity-30 text-[12px] font-black tracking-[0.3em] uppercase mb-2">TEMPO</span>
              <span className="text-7xl sm:text-8xl font-black tabular-nums tracking-tighter text-white drop-shadow-[0_4px_20px_rgba(255,255,255,0.1)]">{bpm}</span>
              <div className={`mt-4 px-4 py-1.5 rounded-full text-[10px] font-black uppercase bg-white/5 border border-white/10 ${currentTheme.colors.accent} shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]`}>{getTempoMarking(bpm)}</div>
            </div>
          </div>

          {/* CONTROLES INFERIORES */}
          <div className="w-full flex-1 sm:flex-none flex justify-between items-center p-6 bg-black/30 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className={`flex flex-col gap-2 transition-opacity ${isUiLocked ? 'opacity-30 pointer-events-none' : ''}`}>
              <span className="text-[9px] opacity-40 uppercase font-black tracking-widest pl-1">Passo BPM</span>
              <div className="relative" ref={bpmStepRef}>
                <button onClick={(e) => { e.stopPropagation(); !isUiLocked && setIsBpmStepOpen(!isBpmStepOpen); }} disabled={isUiLocked} className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl text-sm font-black border border-white/10 hover:bg-white/10 relative z-[100] transition-all">
                  {bpmStep} BPM <ChevronDown size={14} className="opacity-40" />
                </button>
                {isBpmStepOpen && (
                  <div className="absolute bottom-full mb-3 left-0 bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 p-2 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] grid grid-cols-2 gap-2 w-40 z-[100] animate-in slide-in-from-bottom-2" onClick={(e) => e.stopPropagation()}>
                    {BPM_STEPS.map(step => (
                      <button key={step} onClick={(e) => { e.stopPropagation(); setBpmStep(step); setIsBpmStepOpen(false); }} className={`p-3 rounded-xl text-xs font-black transition-all ${bpmStep === step ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>{step}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={isPlaying ? handleStop : handleStart}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-[0_15px_40px_rgba(0,0,0,0.6)] active:scale-90 border-[10px] border-black/40 ring-4 ${isPlaying ? 'bg-rose-600 hover:bg-rose-500 ring-rose-500/30' : `${currentTheme.colors.button} ring-white/10 hover:scale-105`}`}
            >
              {isPlaying ? <Pause size={38} fill="white" /> : <Play size={38} fill="white" className="ml-1.5" />}
            </button>
          </div>
        </aside>
      </div>

      {/* FAB ATALHOS */}
      <div className="fixed bottom-6 left-6 z-[90]">
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="bg-black/50 hover:bg-black/90 text-white/50 hover:text-white px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-2 backdrop-blur-md border border-white/10 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:-translate-y-1"
        >
          <Keyboard size={16} /> Atalhos (/)
        </button>
      </div>

      {/* MODAL ATALHOS */}
      {showShortcutsModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setShowShortcutsModal(false)}>
          <div className="bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 sm:px-10 sm:py-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${currentTheme.colors.barFilled} shadow-[0_0_20px_rgba(255,255,255,0.2)]`}>
                  <Keyboard size={24} className="text-black" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">Guia de Atalhos</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest">Navegação Rápida no Teclado</p>
                </div>
              </div>
              <button onClick={() => setShowShortcutsModal(false)} className="p-3 rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white bg-black/40 border border-white/5">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto flex flex-col gap-6 sm:gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {KEYBOARD_GROUPS.map((group, idx) => (
                  <div key={idx} className="bg-black/40 border border-white/5 p-5 rounded-[1.5rem] flex flex-col gap-4 hover:border-white/20 transition-all hover:bg-black/60 shadow-inner">
                    <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">{group.name}</h3>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {group.keys.map((k, i) => (
                          <span key={i} className={`px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] font-black text-white shadow-[inset_0_0_8px_rgba(255,255,255,0.05)] ${currentTheme.colors.accent.replace('text-', 'border-').replace('text-', 'text-')}`}>{k}</span>
                        ))}
                      </div>
                      <span className="text-xs font-medium text-gray-500 leading-snug">{group.description}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-xs font-medium text-gray-400">Pressione</span>
                <kbd className={`px-2.5 py-1 bg-black rounded-lg border border-white/10 text-xs font-black shadow-inner ${currentTheme.colors.accent}`}>/</kbd>
                <span className="text-xs font-medium text-gray-400">a qualquer momento para exibir/ocultar este painel.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
