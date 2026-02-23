import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, Minus, Plus, ChevronDown, Volume2, VolumeX, 
  Repeat, TrendingUp, TrendingDown, Palette, Lock, 
  Shuffle, GraduationCap, Crown, Ghost, Settings, 
  Hourglass, Music, Save, Download, CheckCircle2,
  Zap, ArrowRight, Keyboard, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// --- CONFIGURAÇÃO FIREBASE (usando variáveis de ambiente) ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase apenas se as configurações existirem
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

const appId = import.meta.env.VITE_FIREBASE_APP_ID || 'default-app-id';

// --- CONSTANTES DE ENGINE ---
const LATENCY_COMPENSATION = 0.025; 
const LOOKAHEAD_TIME = 0.1;

const BPM_PROGRESS_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  PING_PONG: 'pingpong'
};

// --- CONSTANTES DE ATALHOS DE TECLADO ---
const KEYBOARD_GROUPS = [
  {
    name: 'Transporte & Geral',
    keys: ['Espaço', 'Esc', '/'],
    description: 'Espaço: Play/Pause, Esc: Stop/Reset, /: Atalhos'
  },
  {
    name: 'Modos de Reprodução',
    keys: ['E', 'D', 'S', 'F'],
    description: 'E: Auto ↑, D: Auto ↓, S: Manual, F: Auto Loop'
  },
  {
    name: 'Subdivisões',
    keys: ['1-9'],
    description: 'Teclas numéricas para seleção direta'
  },
  {
    name: 'Controle de BPM',
    keys: ['Q', 'W', 'R', 'T'],
    description: 'Q: -BPM, W: +BPM, R: Reset (120), T: Fixar Target BPM'
  },
  {
    name: 'PRO Features',
    keys: ['Z', 'X', 'C', 'V'],
    description: 'Z: Permutação, X: Gap, C: Ghost, V: Auto BPM'
  },
  {
    name: 'Mixer de Volume',
    keys: ['A-L', ';'],
    description: 'A a L para as notas 1 a 9, ; para resetar volumes'
  },
  {
    name: 'Menus & Compasso',
    keys: ['P', 'M', 'K', '.', ',', 'Setas ↑/↓'],
    description: 'P: Tema, M: Compasso, K: Modo App, .: Salvar, ,: Passo BPM'
  },
  {
    name: 'Presets Rápidos',
    keys: ['Shift+1-3', 'Ctrl+1-3'],
    description: 'Shift+Num: Carregar, Ctrl+Num: Salvar'
  }
];

const SUBDIVISIONS_DESC = [
  'Semínima', 'Colcheias', 'Tercina', 'Semicolcheias', 
  'Quintina', 'Sextina', 'Septina', 'Fusas', 'Nonina'
];

// --- TEMAS VISUAIS ---
const THEMES = {
  INSTAGRAM: { 
    id: 'INSTAGRAM', name: 'Insta Vibe', 
    colors: {
      bg: 'bg-gradient-to-br from-[#2E0B18] via-[#1a050d] to-[#000000]',
      text: 'text-white', accent: 'text-[#E1306C]', barFilled: 'bg-[#E1306C]',
      barActive: 'bg-[#E1306C] shadow-[0_0_20px_rgba(225,48,108,0.8)]',
      button: 'bg-[#E1306C] hover:bg-[#C13584] border border-[#E1306C]/50 shadow-[0_0_15px_rgba(225,48,108,0.4)]',
      subDisplay: 'border-[#E1306C]/50 bg-[#E1306C]/20 text-[#E1306C] shadow-[inset_0_0_10px_rgba(225,48,108,0.3)]',
      container: 'bg-[#E1306C]/5 border-[#E1306C]/20 backdrop-blur-md'
    }
  },
  FACEBOOK: { 
    id: 'FACEBOOK', name: 'Face Blue', 
    colors: { 
      bg: 'bg-gradient-to-br from-[#001a35] via-[#18191a] to-[#0a0a0b]', 
      text: 'text-[#e4e6eb]', accent: 'text-[#1877F2]', barFilled: 'bg-[#1877F2]',
      barActive: 'bg-[#1877F2] shadow-[0_0_20px_rgba(24,119,242,0.8)]', 
      button: 'bg-[#1877F2] hover:bg-[#166fe5] border border-[#1877F2]/50 shadow-[0_0_15px_rgba(24,119,242,0.4)]', 
      subDisplay: 'border-[#1877F2]/50 bg-[#1877F2]/20 text-[#1877F2] shadow-[inset_0_0_10px_rgba(24,119,242,0.3)]',
      container: 'bg-[#1877F2]/10 border-[#1877F2]/30 backdrop-blur-md'
    }
  },
  TIKTOK: {
    id: 'TIKTOK', name: 'Tik Glitch',
    colors: { 
      bg: 'bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#000000]', 
      text: 'text-white', accent: 'text-[#00f2ea]', barFilled: 'bg-[#00f2ea]',
      barActive: 'bg-[#00f2ea] shadow-[0_0_20px_rgba(0,242,234,0.8)]', 
      button: 'bg-[#fe2c55] hover:bg-[#d60043] border border-[#00f2ea]/50 shadow-[0_0_15px_rgba(254,44,85,0.4)]', 
      subDisplay: 'border-[#00f2ea]/50 bg-[#00f2ea]/20 text-[#00f2ea] shadow-[inset_0_0_10px_rgba(0,242,234,0.3)]',
      container: 'bg-[#00f2ea]/15 border-[#00f2ea]/40 backdrop-blur-md'
    }
  },
  PRO_GOLD: {
    id: 'PRO_GOLD', name: 'Maestro Gold',
    colors: {
      bg: 'bg-gradient-to-br from-[#1a1500] via-[#000000] to-[#1a1500]',
      text: 'text-[#fff8d6]', accent: 'text-[#ffd700]', barFilled: 'bg-[#ffd700]',
      barActive: 'bg-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.8)]',
      button: 'bg-[#b8860b] hover:bg-[#daa520] border border-[#ffd700]/60 shadow-[0_0_20px_rgba(255,215,0,0.4)]',
      subDisplay: 'border-[#ffd700]/80 bg-[#ffd700]/20 text-[#ffd700] shadow-[inset_0_0_15px_rgba(255,215,0,0.2)]',
      container: 'bg-[#ffd700]/5 border-[#ffd700]/30 backdrop-blur-md'
    }
  }
};

const APP_MODES = {
  BEGINNER: { id: 'BEGINNER', label: 'Iniciante', icon: GraduationCap },
  ADVANCED: { id: 'ADVANCED', label: 'Avançado', icon: Settings },
  PRO: { id: 'PRO', label: 'PRO Maestro', icon: Crown }
};

const SUBDIVISIONS = [
  { value: 1, label: 'Semínima (Quarter)' },
  { value: 2, label: 'Colcheias (Eighths)' },
  { value: 3, label: 'Tercina (Triplet)' },
  { value: 4, label: 'Semicolcheias (16th)' },
  { value: 5, label: 'Quintina (Quintuplet)' },
  { value: 6, label: 'Sextina (Sextuplet)' },
  { value: 7, label: 'Septina (Septuplet)' },
  { value: 8, label: 'Fusas (32nd)' },
  { value: 9, label: 'Nonina (Nonuplet)' },
];

const TIME_SIGNATURES = [
  { num: 4, den: 4, name: '4/4 Comum' },
  { num: 3, den: 4, name: '3/4 Valsa' },
  { num: 2, den: 4, name: '2/4 Marcha' },
  { num: 6, den: 8, name: '6/8 Composto' },
  { num: 2, den: 2, name: '2/2 Alla Breve' },
  { num: 3, den: 8, name: '3/8 Scherzo' },
  { num: 9, den: 8, name: '9/8 Composto' },
  { num: 12, den: 8, name: '12/8 Blues' },
  { num: 5, den: 4, name: '5/4 Dave' },
  { num: 7, den: 8, name: '7/8 Money' },
];

const TEMPO_MARKINGS = [
  { limit: 40, label: 'Grave' },
  { limit: 60, label: 'Largo' },
  { limit: 66, label: 'Larghetto' },
  { limit: 76, label: 'Adagio' },
  { limit: 108, label: 'Andante' },
  { limit: 120, label: 'Moderato' },
  { limit: 168, label: 'Allegro' },
  { limit: 200, label: 'Vivace' },
  { limit: 208, label: 'Presto' },
  { limit: 999, label: 'Prestissimo' },
];

const BPM_STEPS = [1, 5, 10, 15, 20, 25, 30];
const VOLUME_VALUES = { 0: 0, 1: 0.3, 2: 0.6, 3: 1.0 };
const LOOP_BAR_OPTIONS = [1, 2, 4, 8]; 

const getTempoMarking = (bpm) => TEMPO_MARKINGS.find(t => bpm <= t.limit)?.label || 'Prestissimo';

const createGroovePattern = (count) => {
    const arr = new Array(count).fill(1);
    arr[0] = 3;
    return arr;
};

const getAccentWeight = (beatIndex, timeSig) => {
    const { num, den } = timeSig;
    if (beatIndex === 0) return 1760; 
    if (den === 8 && num % 3 === 0) {
        if (beatIndex % 3 === 0) return 1320; 
    }
    if (num === 2 && den === 2) return 880; 
    if (num === 4 && den === 4 && beatIndex === 2) return 1100;
    return 880; 
};

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [presets, setPresets] = useState({});
  const [toast, setToast] = useState(null);

  // States Principais
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(60); 
  const [bpmStep, setBpmStep] = useState(5);
  const [currentTheme, setCurrentTheme] = useState(THEMES.TIKTOK);
  const [appMode, setAppMode] = useState('PRO');
  const [playMode, setPlayMode] = useState('MANUAL'); 
  const [barsPerLoop, setBarsPerLoop] = useState(4); 
  const [timeSignature, setTimeSignature] = useState(TIME_SIGNATURES[0]); 
  
  // PRO Features
  const [isPermutationEnabled, setIsPermutationEnabled] = useState(false);
  const [isGhostModeEnabled, setIsGhostModeEnabled] = useState(false);
  const [isGapEnabled, setIsGapEnabled] = useState(false); 
  const [isAutoLoopActive, setIsAutoLoopActive] = useState(false);

  // Auto BPM 
  const [isBpmProgressEnabled, setIsBpmProgressEnabled] = useState(false);
  const [targetBpm, setTargetBpm] = useState(120);
  const [bpmProgressDirection, setBpmProgressDirection] = useState(BPM_PROGRESS_DIRECTIONS.UP);
  const [bpmProgressInterval, setBpmProgressInterval] = useState(5); 

  // Grid e Subdivisões
  const [displayedSubdivision, setDisplayedSubdivision] = useState(1); 
  const [targetSubdivision, setTargetSubdivision] = useState(1);
  const [noteVolumes, setNoteVolumes] = useState([3]); 
  const [currentPairDisplay, setCurrentPairDisplay] = useState(null); 
  const [activeNoteIndex, setActiveNoteIndex] = useState(-1);
  const [visualBarCount, setVisualBarCount] = useState(null); 
  const [isGapActive, setIsGapActive] = useState(false);
  
  // Estados de UI (Menus)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(false);
  const [isTimeSigSelectorOpen, setIsTimeSigSelectorOpen] = useState(false);
  const [isBpmStepOpen, setIsBpmStepOpen] = useState(false);
  const [isSaveMenuOpen, setIsSaveMenuOpen] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  // Refs
  const pendingUpdateRef = useRef(false);
  const audioContextRef = useRef(null);
  const timerIDRef = useRef(null);
  const startTimeRef = useRef(0);
  const sequenceRef = useRef([]);
  const currentEventIndexRef = useRef(0);
  const bpmProgressIntervalRef = useRef(null);

  const dropdownRef = useRef(null);
  const themeMenuRef = useRef(null);
  const modeSelectorRef = useRef(null);
  const timeSigRef = useRef(null);
  const bpmStepRef = useRef(null);
  const saveMenuRef = useRef(null);

  const AppModeIcon = APP_MODES[appMode].icon;
  const isUiLocked = isPlaying && (appMode === 'ADVANCED' || appMode === 'PRO');
  const isAnyMenuOpen = isDropdownOpen || isTimeSigSelectorOpen || isModeSelectorOpen || isThemeMenuOpen || isBpmStepOpen || isSaveMenuOpen;

  const bpmRef = useRef(bpm);
  useEffect(() => { bpmRef.current = bpm; }, [bpm]);

  // --- AUTO BPM ENGINE ---
  useEffect(() => {
    if (isPlaying && isBpmProgressEnabled && appMode === 'PRO') {
      bpmProgressIntervalRef.current = setInterval(() => {
        setBpm((prev) => {
          const direction = targetBpm > prev ? 1 : -1;
          if (prev === targetBpm) return prev;
          let next = prev + (direction * bpmStep);
          if (direction === 1 && next > targetBpm) next = targetBpm;
          if (direction === -1 && next < targetBpm) next = targetBpm;
          return Math.max(30, Math.min(300, next));
        });
      }, bpmProgressInterval * 1000);
    }
    return () => { if(bpmProgressIntervalRef.current) clearInterval(bpmProgressIntervalRef.current); };
  }, [isPlaying, isBpmProgressEnabled, targetBpm, bpmProgressInterval, bpmStep, appMode]);

  // --- FIREBASE SYNC (com segurança) ---
  useEffect(() => {
    if (!auth || !db) return;
    
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Erro na autenticação anônima:', error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    try {
      const presetsRef = collection(db, 'artifacts', appId, 'users', user.uid, 'presets');
      const unsubscribe = onSnapshot(presetsRef, (snapshot) => {
        const newPresets = {};
        snapshot.forEach(doc => { newPresets[doc.id] = doc.data(); });
        setPresets(newPresets);
      }, (error) => {
        console.error('Erro ao carregar presets:', error);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error('Erro ao configurar listener de presets:', error);
    }
  }, [user]);

  const showToast = (msg) => {
      setToast(msg);
      setTimeout(() => setToast(null), 2000);
  };

  const handleSavePreset = async (slotId) => {
      if (!user || !db) { showToast("Erro: Firebase não inicializado"); return; }
      
      const dataToSave = {
          bpm, playMode, barsPerLoop, timeSignature, targetSubdivision, noteVolumes,
          isPermutationEnabled, isGhostModeEnabled, isGapEnabled, isAutoLoopActive,
          isBpmProgressEnabled, targetBpm, bpmProgressDirection, bpmProgressInterval,
          timestamp: Date.now(),
          name: `${bpm}BPM ${timeSignature.name}`
      };
      
      const slotKey = `slot${slotId}`;
      try {
          const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'presets', slotKey);
          await setDoc(docRef, dataToSave);
          showToast(`💾 Salvo no slot ${slotId}`);
          setIsSaveMenuOpen(false);
      } catch (err) { 
          console.error("Save error:", err); 
          showToast("Erro ao salvar"); 
      }
  };

  const handleLoadPreset = (slotId) => {
      const data = presets[`slot${slotId}`];
      if (!data) { showToast(`Slot ${slotId} vazio`); return; }
      
      setBpm(data.bpm); 
      setPlayMode(data.playMode); 
      setBarsPerLoop(data.barsPerLoop);
      setTimeSignature(data.timeSignature); 
      setTargetSubdivision(data.targetSubdivision);
      setNoteVolumes(data.noteVolumes); 
      setIsPermutationEnabled(data.isPermutationEnabled);
      setIsGhostModeEnabled(data.isGhostModeEnabled); 
      setIsGapEnabled(data.isGapEnabled);
      
      if (data.isAutoLoopActive !== undefined) setIsAutoLoopActive(data.isAutoLoopActive);
      if (data.isBpmProgressEnabled !== undefined) {
          setIsBpmProgressEnabled(data.isBpmProgressEnabled);
          setTargetBpm(data.targetBpm || 120);
          setBpmProgressInterval(data.bpmProgressInterval || 5);
      }
      
      showToast(`📂 Preset ${slotId} carregado`);
      closeAllMenus();
      if(isPlaying) { handleStop(); setTimeout(() => handleStart(), 50); }
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
            showToast("Selecione Auto ↑ ou Auto ↓"); return;
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

  useEffect(() => {
    if (appMode === 'BEGINNER') {
        setPlayMode('MANUAL');
        setTimeSignature(TIME_SIGNATURES[0]); 
        setIsPermutationEnabled(false);
        setIsGhostModeEnabled(false);
        setIsGapEnabled(false);
        setIsAutoLoopActive(false);
        setIsBpmProgressEnabled(false);
    }
  }, [appMode]);

  useEffect(() => {
      if (!isPlaying) {
          setDisplayedSubdivision(targetSubdivision);
          if (noteVolumes.length !== targetSubdivision) {
             setNoteVolumes(createGroovePattern(targetSubdivision));
          }
      }
  }, [targetSubdivision, isPlaying]);

  // --- AUDIO ENGINE LOGIC ---
  const generateScript = useCallback((subOverride = null) => {
      const script = [];
      const BEATS_PER_BAR = timeSignature.num;
      const startSub = subOverride || targetSubdivision;
      let phases = [];
      
      if (appMode === 'PRO' && isPermutationEnabled) {
          for (let anchor = startSub; anchor <= 9; anchor++) {
              for (let variation = 1; variation <= 9; variation++) {
                  phases.push({ type: 'PAIR', anchor, variation, totalBars: barsPerLoop * 2 });
              }
          }
      } else if (playMode !== 'MANUAL') {
          let current = startSub;
          const up = playMode === 'AUTO_UP';
          for(let i=0; i<100; i++) { 
              phases.push({ type: 'SINGLE', sub: current, totalBars: barsPerLoop });
              if (isAutoLoopActive) {
                  if (up) current = current >= 9 ? 1 : current + 1;
                  else current = current <= 1 ? 9 : current - 1;
              } else {
                  if (up) current = current >= 9 ? 1 : current + 1;
                  else current = current <= 1 ? 9 : current - 1;
              }
          }
      } else { phases.push({ type: 'SINGLE', sub: startSub, totalBars: 9999 }); }

      let absBarIndex = 0; let absTime = 0; 
      for (const phase of phases) {
          if (phase.type === 'PAIR') {
              for (let b = 0; b < barsPerLoop; b++) { script.push(generateBarEvents(absBarIndex++, absTime, phase.anchor, [phase.anchor, phase.variation])); absTime += BEATS_PER_BAR; }
              for (let b = 0; b < barsPerLoop; b++) { script.push(generateBarEvents(absBarIndex++, absTime, phase.variation, [phase.anchor, phase.variation])); absTime += BEATS_PER_BAR; }
              if (isGapEnabled) { script.push(generateGapEvents(absBarIndex, absTime, phase.variation, [phase.anchor, phase.variation])); absTime += BEATS_PER_BAR; }
          } else {
              for (let b = 0; b < phase.totalBars; b++) { script.push(generateBarEvents(absBarIndex++, absTime, phase.sub, null)); absTime += BEATS_PER_BAR; }
              if (isGapEnabled && playMode !== 'MANUAL') { script.push(generateGapEvents(absBarIndex, absTime, phase.sub, null)); absTime += BEATS_PER_BAR; }
          }
      }
      return script.flat();
  }, [appMode, playMode, targetSubdivision, barsPerLoop, timeSignature, isPermutationEnabled, isGapEnabled, isAutoLoopActive]);

  const generateBarEvents = (barIndex, startTime, subdivision, pairInfo) => {
      const events = [];
      const volumes = createGroovePattern(subdivision); 
      for (let beat = 0; beat < timeSignature.num; beat++) {
          const pitch = getAccentWeight(beat, timeSignature);
          for (let sub = 0; sub < subdivision; sub++) {
              let vol = volumes[sub];
              if (appMode === 'PRO' && isGhostModeEnabled && vol > 0 && vol < 3 && Math.random() > 0.6) vol = 0;
              events.push({ type: 'NOTE', absTime: startTime + beat + (sub/subdivision), freq: sub === 0 ? pitch : 440, volume: vol, subdivision, subIndex: sub, bar: barIndex, beat, pairInfo });
          }
      }
      return events;
  };

  const generateGapEvents = (barIndex, startTime, subdivision, pairInfo) => {
      const events = [];
      for (let beat = 0; beat < timeSignature.num; beat++) { events.push({ type: 'GAP', absTime: startTime + beat, subdivision, bar: barIndex, beat, pairInfo }); }
      return events;
  };

  const scheduler = useCallback(() => {
    if (!audioContextRef.current) return;
    const currentTime = audioContextRef.current.currentTime;
    const secondsPerBeat = 60.0 / bpmRef.current;
    const compensatedCurrentTime = currentTime - LATENCY_COMPENSATION;

    if (pendingUpdateRef.current && appMode === 'BEGINNER') { handleStop(); setTimeout(() => handleStart(), 50); pendingUpdateRef.current = false; return; }
    
    while (currentEventIndexRef.current < sequenceRef.current.length) {
      const event = sequenceRef.current[currentEventIndexRef.current];
      const eventTimeCompensated = startTimeRef.current + (event.absTime * secondsPerBeat) - LATENCY_COMPENSATION;
      const eventTimeTheoretical = startTimeRef.current + (event.absTime * secondsPerBeat);

      if (eventTimeCompensated > compensatedCurrentTime + LOOKAHEAD_TIME) break;

      if (eventTimeCompensated >= compensatedCurrentTime - 0.05) {
        if (event.type === 'NOTE') {
          let vol = event.volume;
          if (playMode === 'MANUAL' && noteVolumes.length === event.subdivision) vol = noteVolumes[event.subIndex];
          if (vol > 0) {
              const osc = audioContextRef.current.createOscillator();
              const gain = audioContextRef.current.createGain();
              osc.connect(gain); gain.connect(audioContextRef.current.destination);
              osc.frequency.value = event.freq; gain.gain.value = VOLUME_VALUES[vol];
              const scheduleTime = currentTime + (eventTimeCompensated - compensatedCurrentTime);
              osc.start(scheduleTime); osc.stop(scheduleTime + 0.05);
          }
        }
        const timeToVisual = (eventTimeTheoretical - currentTime) * 1000;
        setTimeout(() => {
            if (!timerIDRef.current) return;
            setDisplayedSubdivision(event.subdivision);
            setCurrentPairDisplay(event.pairInfo ? `${event.pairInfo[0]} vs ${event.pairInfo[1]}` : null);
            if (event.type === 'GAP') { setIsGapActive(true); setActiveNoteIndex(-1); setVisualBarCount('GAP'); }
            else { setIsGapActive(false); setActiveNoteIndex(event.subIndex); if (event.subIndex === 0 && event.beat === 0) setVisualBarCount(event.bar + 1); }
        }, Math.max(0, timeToVisual));
      }
      currentEventIndexRef.current++;
    }
    timerIDRef.current = requestAnimationFrame(scheduler);
  }, [noteVolumes, playMode, appMode, targetSubdivision, timeSignature]);

  const handleStart = () => {
    if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();
    sequenceRef.current = generateScript(); currentEventIndexRef.current = 0;
    setIsPlaying(true); startTimeRef.current = audioContextRef.current.currentTime + 0.05;
    timerIDRef.current = requestAnimationFrame(scheduler);
  };

  const handleStop = useCallback(() => {
    if (timerIDRef.current) cancelAnimationFrame(timerIDRef.current);
    timerIDRef.current = null; setIsPlaying(false); setActiveNoteIndex(-1); setVisualBarCount(null);
    setIsGapActive(false); setCurrentPairDisplay(null); setDisplayedSubdivision(targetSubdivision);
    setNoteVolumes(createGroovePattern(targetSubdivision));
    pendingUpdateRef.current = false;
  }, [targetSubdivision]);

  const handleSubdivisionChange = (sub) => {
    if (isUiLocked) return; setTargetSubdivision(sub); setDisplayedSubdivision(sub); setNoteVolumes(createGroovePattern(sub)); closeAllMenus();
    if (isPlaying && appMode === 'BEGINNER') pendingUpdateRef.current = true;
  };

  const handleTimeSigChange = (sig) => {
      if (isUiLocked) return; setTimeSignature(sig); closeAllMenus();
      if (isPlaying && appMode === 'BEGINNER') { handleStop(); setTimeout(() => handleStart(), 50); }
  };

  const toggleNoteVolume = (idx) => {
      if (isUiLocked) return;
      setNoteVolumes(prev => {
          const nv = [...prev]; nv[idx] = nv[idx] === 3 ? 0 : nv[idx] + 1; return nv;
      });
  };

  const adjustBpm = (direction) => {
    if (isUiLocked) return;
    setBpm(prev => Math.max(30, Math.min(300, prev + (direction * bpmStep))));
  };

  // --- GESTÃO COMPLETA DE ATALHOS DE TECLADO ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      const key = e.key.toLowerCase();

      if ([' ', 'arrowup', 'arrowdown'].includes(key)) {
        e.preventDefault();
      }

      if (key === ' ') {
        isPlaying ? handleStop() : handleStart();
      } else if (key === 'escape') {
        handleStop();
      } else if (/^[1-9]$/.test(key)) {
        if (!isUiLocked) {
          const sub = parseInt(key, 10);
          handleSubdivisionChange(sub);
          showToast(`${key} - ${SUBDIVISIONS_DESC[sub-1]}`);
        }
      } else if (key === 'e') { 
        if (!isUiLocked && appMode !== 'BEGINNER') { setPlayMode('AUTO_UP'); showToast('↑ Modo Auto ↑ ativado'); }
      } else if (key === 'd') { 
        if (!isUiLocked && appMode !== 'BEGINNER') { setPlayMode('AUTO_DOWN'); showToast('↓ Modo Auto ↓ ativado'); }
      } else if (key === 's') { 
        if (!isUiLocked && appMode !== 'BEGINNER') { setPlayMode('MANUAL'); showToast('◉ Modo Manual ativado'); }
      } else if (key === 'f') { 
        if (!isUiLocked && appMode !== 'BEGINNER') handleAutoLoopToggle(); 
      } else if (key === 'q') {
        if (!isUiLocked) { adjustBpm(-1); showToast(`BPM: ${bpmRef.current - bpmStep}`); }
      } else if (key === 'w') {
        if (!isUiLocked) { adjustBpm(1); showToast(`BPM: ${bpmRef.current + bpmStep}`); }
      } else if (key === 'r') {
        if (!isUiLocked) { setBpm(120); showToast('↺ BPM resetado para 120'); }
      } else if (key === 't') {
        if (!isUiLocked && appMode === 'PRO') { setTargetBpm(bpm); showToast(`🎯 Target BPM fixado: ${bpm}`); }
      } else if (key === 'z') {
        if (!isUiLocked && appMode === 'PRO') { setIsPermutationEnabled(prev => !prev); showToast(`🔄 Permutação alternada`); }
      } else if (key === 'x') {
        if (!isUiLocked && appMode
