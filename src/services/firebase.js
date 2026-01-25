// Configuração e serviços do Firebase para o RhythmSecret

import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection 
} from 'firebase/firestore';

// Configuração do Firebase (as variáveis são injetadas pelo ambiente)
let app;
let auth;
let db;
let appId;

/**
 * Inicializa o Firebase com as configurações fornecidas
 * @param {Object} config - Configuração do Firebase
 * @param {string} id - ID do aplicativo
 */
export const initializeFirebase = (config, id) => {
  try {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = id || 'rhythm-secret-default';
    
    console.log('Firebase inicializado com sucesso');
    return { app, auth, db, appId };
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error);
    throw error;
  }
};

/**
 * Configuração padrão (para fallback)
 */
const FALLBACK_CONFIG = {
  apiKey: "fallback-api-key",
  authDomain: "rhythm-secret-fallback.firebaseapp.com",
  projectId: "rhythm-secret-fallback",
  storageBucket: "rhythm-secret-fallback.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:aaaaaaaaaaaaaaaaaaaa"
};

/**
 * Inicializa autenticação automática
 * @param {string} customToken - Token customizado (opcional)
 */
export const initializeAuth = async (customToken) => {
  try {
    if (customToken && customToken !== 'undefined') {
      await signInWithCustomToken(auth, customToken);
      console.log('Autenticado com token customizado');
    } else {
      await signInAnonymously(auth);
      console.log('Autenticado anonimamente');
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    // Em caso de erro, tenta autenticação anônima como fallback
    try {
      await signInAnonymously(auth);
      console.log('Fallback para autenticação anônima bem sucedido');
    } catch (fallbackError) {
      console.error('Erro no fallback de autenticação:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Observa mudanças no estado de autenticação
 * @param {Function} callback - Função chamada quando o estado muda
 */
export const watchAuthState = (callback) => {
  if (!auth) {
    console.warn('Firebase auth não inicializado');
    return () => {};
  }
  
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    console.log('Estado de autenticação alterado:', user ? 'Usuário logado' : 'Usuário deslogado');
    callback(user);
  });
  
  return unsubscribe;
};

/**
 * Obtém referência à coleção de presets do usuário
 * @param {string} userId - ID do usuário
 */
export const getUserPresetsRef = (userId) => {
  if (!db || !appId) {
    throw new Error('Firebase não inicializado');
  }
  
  return collection(db, 'artifacts', appId, 'users', userId, 'presets');
};

/**
 * Salva um preset na coleção do usuário
 * @param {string} userId - ID do usuário
 * @param {string} slotId - ID do slot (ex: "slot1")
 * @param {Object} data - Dados do preset a serem salvos
 */
export const savePreset = async (userId, slotId, data) => {
  if (!db || !appId) {
    throw new Error('Firebase não inicializado');
  }
  
  try {
    const docRef = doc(db, 'artifacts', appId, 'users', userId, 'presets', slotId);
    
    const presetData = {
      ...data,
      timestamp: Date.now(),
      version: '1.0.0'
    };
    
    await setDoc(docRef, presetData);
    console.log(`Preset salvo: ${slotId}`, presetData);
    
    return { success: true, slotId, timestamp: presetData.timestamp };
  } catch (error) {
    console.error('Erro ao salvar preset:', error);
    throw error;
  }
};

/**
 * Observa mudanças na coleção de presets
 * @param {string} userId - ID do usuário
 * @param {Function} callback - Função chamada quando há mudanças
 */
export const watchPresets = (userId, callback) => {
  if (!db || !appId) {
    console.warn('Firebase não inicializado para watchPresets');
    return () => {};
  }
  
  try {
    const presetsRef = getUserPresetsRef(userId);
    
    const unsubscribe = onSnapshot(presetsRef, (snapshot) => {
      const presets = {};
      
      snapshot.forEach((doc) => {
        presets[doc.id] = {
          id: doc.id,
          ...doc.data()
        };
      });
      
      console.log('Presets atualizados:', Object.keys(presets).length, 'itens');
      callback(presets);
    }, (error) => {
      console.error('Erro ao observar presets:', error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Erro ao configurar watchPresets:', error);
    return () => {};
  }
};

/**
 * Carrega um preset específico
 * @param {Object} presets - Objeto de presets
 * @param {string} slotId - ID do slot (ex: "slot1")
 */
export const loadPresetData = (presets, slotId) => {
  const preset = presets[slotId];
  
  if (!preset) {
    console.log(`Slot ${slotId} não encontrado`);
    return null;
  }
  
  console.log(`Carregando preset: ${slotId}`, preset);
  return preset;
};

/**
 * Formata dados de preset para salvar
 * @param {Object} state - Estado atual do aplicativo
 */
export const formatPresetData = (state) => ({
  // Configurações básicas
  bpm: state.bpm,
  playMode: state.playMode,
  barsPerLoop: state.barsPerLoop,
  
  // Configurações musicais
  timeSignature: state.timeSignature,
  targetSubdivision: state.targetSubdivision,
  noteVolumes: [...state.noteVolumes], // Cópia do array
  
  // Recursos PRO
  isPermutationEnabled: state.isPermutationEnabled,
  isGhostModeEnabled: state.isGhostModeEnabled,
  isGapEnabled: state.isGapEnabled,
  isAutoLoopActive: state.isAutoLoopActive,
  
  // Metadados
  name: `${state.bpm}BPM ${state.timeSignature.name}`,
  appMode: state.appMode,
  themeId: state.currentTheme?.id || 'INSTAGRAM'
});

/**
 * Verifica se o Firebase está inicializado
 */
export const isFirebaseInitialized = () => {
  return !!(app && auth && db);
};

/**
 * Obtém instâncias do Firebase (para uso em outros módulos)
 */
export const getFirebaseInstances = () => {
  if (!isFirebaseInitialized()) {
    throw new Error('Firebase não inicializado');
  }
  
  return { app, auth, db, appId };
};

/**
 * Limpa todos os dados locais (para desenvolvimento/testes)
 */
export const clearLocalData = async () => {
  if (auth && auth.currentUser) {
    console.log('Dados locais limpos');
    // Em uma implementação real, você pode querer limpar cache ou localStorage
  }
};

// Inicialização automática se as variáveis globais existirem
if (typeof window !== 'undefined') {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    try {
      const config = JSON.parse(__firebase_config);
      const id = typeof __app_id !== 'undefined' ? __app_id : 'rhythm-secret-web';
      initializeFirebase(config, id);
    } catch (error) {
      console.error('Erro na inicialização automática do Firebase:', error);
    }
  }
}

// Exporta as instâncias principais
export { app, auth, db, appId };
