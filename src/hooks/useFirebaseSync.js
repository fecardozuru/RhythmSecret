// /src/hooks/useFirebaseSync.js

/**
 * Hook para sincronização com Firebase (Auth + Firestore)
 * Gerencia autenticação anônima e presets salvos
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  auth, 
  db, 
  signInAnonymously, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  onSnapshot
} from '../services/firebase';

// Nomes das coleções no Firestore
const COLLECTIONS = {
  USERS: 'users',
  PRESETS: 'presets',
};

/**
 * Hook principal para sincronização com Firebase
 */
export function useFirebaseSync() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [presets, setPresets] = useState({});
  const [isSyncing, setIsSyncing] = useState(false);

  /**
   * Inicializa autenticação anônima
   */
  const initializeAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Tenta autenticação anônima
      const userCredential = await signInAnonymously(auth);
      const firebaseUser = userCredential.user;
      
      setUser({
        uid: firebaseUser.uid,
        isAnonymous: firebaseUser.isAnonymous,
        createdAt: new Date(firebaseUser.metadata.creationTime),
      });

      console.log('Autenticação anônima bem-sucedida:', firebaseUser.uid);
      return firebaseUser.uid;
    } catch (error) {
      console.error('Erro na autenticação anônima:', error);
      setError(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Carrega presets do usuário atual
   */
  const loadPresets = useCallback(async (userId) => {
    if (!userId) return;

    try {
      setIsSyncing(true);
      
      const userDocRef = doc(db, COLLECTIONS.USERS, userId);
      const presetsCollectionRef = collection(userDocRef, COLLECTIONS.PRESETS);
      
      // Usa onSnapshot para sincronização em tempo real
      const unsubscribe = onSnapshot(presetsCollectionRef, (snapshot) => {
        const loadedPresets = {};
        
        snapshot.forEach((docSnapshot) => {
          const presetData = docSnapshot.data();
          loadedPresets[docSnapshot.id] = {
            id: docSnapshot.id,
            ...presetData,
            loadedAt: new Date(),
          };
        });
        
        setPresets(loadedPresets);
        console.log('Presets carregados:', Object.keys(loadedPresets).length);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Erro ao carregar presets:', error);
      setError(error.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  /**
   * Salva um preset em um slot específico
   */
  const savePreset = useCallback(async (slot, presetData) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setError(null);

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const presetDocRef = doc(userDocRef, COLLECTIONS.PRESETS, `slot_${slot}`);

      const presetToSave = {
        ...presetData,
        slot: slot,
        name: presetData.name || `Preset ${slot}`,
        bpm: presetData.bpm,
        timeSignature: presetData.timeSignature,
        subdivision: presetData.subdivision,
        volumes: presetData.volumes,
        sequence: presetData.sequence,
        proFeatures: presetData.proFeatures || {},
        updatedAt: new Date().toISOString(),
        version: '1.0',
      };

      await setDoc(presetDocRef, presetToSave, { merge: true });
      
      console.log(`Preset salvo no slot ${slot}:`, presetToSave.name);
      return true;
    } catch (error) {
      console.error('Erro ao salvar preset:', error);
      setError(error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  /**
   * Carrega um preset de um slot específico
   */
  const loadPreset = useCallback(async (slot) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setError(null);

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const presetDocRef = doc(userDocRef, COLLECTIONS.PRESETS, `slot_${slot}`);
      
      const docSnapshot = await getDoc(presetDocRef);
      
      if (docSnapshot.exists()) {
        const presetData = docSnapshot.data();
        console.log(`Preset carregado do slot ${slot}:`, presetData.name);
        return presetData;
      } else {
        console.log(`Slot ${slot} vazio`);
        return null;
      }
    } catch (error) {
      console.error('Erro ao carregar preset:', error);
      setError(error.message);
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  /**
   * Deleta um preset de um slot específico
   */
  const deletePreset = useCallback(async (slot) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setError(null);

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const presetDocRef = doc(userDocRef, COLLECTIONS.PRESETS, `slot_${slot}`);
      
      await deleteDoc(presetDocRef);
      
      console.log(`Preset deletado do slot ${slot}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar preset:', error);
      setError(error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  /**
   * Renomeia um preset
   */
  const renamePreset = useCallback(async (slot, newName) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setError(null);

      const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
      const presetDocRef = doc(userDocRef, COLLECTIONS.PRESETS, `slot_${slot}`);
      
      await updateDoc(presetDocRef, {
        name: newName,
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Preset ${slot} renomeado para: ${newName}`);
      return true;
    } catch (error) {
      console.error('Erro ao renomear preset:', error);
      setError(error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  /**
   * Exporta todos os presets para formato JSON
   */
  const exportPresets = useCallback(async () => {
    if (!user?.uid) return null;

    try {
      const exportData = {
        userId: user.uid,
        exportedAt: new Date().toISOString(),
        version: '1.0',
        presets: {},
      };

      // Carrega todos os slots
      for (let slot = 1; slot <= 3; slot++) {
        const preset = presets[`slot_${slot}`];
        if (preset) {
          exportData.presets[slot] = preset;
        }
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Erro ao exportar presets:', error);
      setError(error.message);
      return null;
    }
  }, [user, presets]);

  /**
   * Importa presets de formato JSON
   */
  const importPresets = useCallback(async (jsonData) => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    try {
      setIsSyncing(true);
      setError(null);

      const importData = JSON.parse(jsonData);
      
      if (!importData.presets || typeof importData.presets !== 'object') {
        throw new Error('Formato de importação inválido');
      }

      let importedCount = 0;
      
      // Salva cada preset importado
      for (const [slotStr, presetData] of Object.entries(importData.presets)) {
        const slot = parseInt(slotStr);
        
        if (slot >= 1 && slot <= 3) {
          await savePreset(slot, presetData);
          importedCount++;
        }
      }

      console.log(`${importedCount} presets importados com sucesso`);
      return importedCount;
    } catch (error) {
      console.error('Erro ao importar presets:', error);
      setError(error.message);
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, [user, savePreset]);

  /**
   * Reseta todos os presets do usuário
   */
  const resetAllPresets = useCallback(async () => {
    if (!user?.uid) {
      throw new Error('Usuário não autenticado');
    }

    if (!window.confirm('Tem certeza que deseja resetar todos os presets? Esta ação não pode ser desfeita.')) {
      return false;
    }

    try {
      setIsSyncing(true);
      setError(null);

      // Deleta todos os slots
      for (let slot = 1; slot <= 3; slot++) {
        await deletePreset(slot);
      }

      console.log('Todos os presets foram resetados');
      return true;
    } catch (error) {
      console.error('Erro ao resetar presets:', error);
      setError(error.message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, deletePreset]);

  // Efeito de inicialização
  useEffect(() => {
    let unsubscribePresets = null;
    let mounted = true;

    const init = async () => {
      const userId = await initializeAuth();
      
      if (mounted && userId) {
        unsubscribePresets = await loadPresets(userId);
      }
    };

    init();

    return () => {
      mounted = false;
      if (unsubscribePresets) {
        unsubscribePresets();
      }
    };
  }, [initializeAuth, loadPresets]);

  // Verifica se há presets salvos
  const hasSavedPresets = Object.keys(presets).length > 0;

  // Presets organizados por slot
  const presetsBySlot = {
    1: presets.slot_1 || null,
    2: presets.slot_2 || null,
    3: presets.slot_3 || null,
  };

  // Slot disponível mais baixo
  const getAvailableSlot = useCallback(() => {
    for (let slot = 1; slot <= 3; slot++) {
      if (!presetsBySlot[slot]) {
        return slot;
      }
    }
    return 1; // Se todos estiverem ocupados, sobrescreve o primeiro
  }, [presetsBySlot]);

  return {
    // Estado
    user,
    isLoading,
    error,
    presets: presetsBySlot,
    isSyncing,
    hasSavedPresets,
    
    // Métodos de autenticação
    initializeAuth,
    
    // Métodos de presets
    savePreset,
    loadPreset,
    deletePreset,
    renamePreset,
    exportPresets,
    importPresets,
    resetAllPresets,
    
    // Utilitários
    getAvailableSlot,
    
    // Status
    isAuthenticated: !!user?.uid,
    isAnonymous: user?.isAnonymous || true,
  };
}

/**
 * Hook para gerenciar um slot de preset específico
 */
export function usePresetSlot(slotNumber) {
  const firebase = useFirebaseSync();
  const [localPreset, setLocalPreset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const slotPreset = firebase.presets[slotNumber];
  const hasPreset = !!slotPreset;

  // Sincroniza com Firebase quando preset muda
  useEffect(() => {
    if (slotPreset && !localPreset) {
      setLocalPreset(slotPreset);
    }
  }, [slotPreset, localPreset]);

  /**
   * Salva o estado atual no slot
   */
  const saveToSlot = useCallback(async (presetData) => {
    setIsLoading(true);
    try {
      const success = await firebase.savePreset(slotNumber, presetData);
      if (success) {
        setLocalPreset(presetData);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [firebase, slotNumber]);

  /**
   * Carrega o preset do slot
   */
  const loadFromSlot = useCallback(async () => {
    setIsLoading(true);
    try {
      const preset = await firebase.loadPreset(slotNumber);
      if (preset) {
        setLocalPreset(preset);
      }
      return preset;
    } finally {
      setIsLoading(false);
    }
  }, [firebase, slotNumber]);

  /**
   * Deleta o preset do slot
   */
  const deleteSlot = useCallback(async () => {
    setIsLoading(true);
    try {
      const success = await firebase.deletePreset(slotNumber);
      if (success) {
        setLocalPreset(null);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [firebase, slotNumber]);

  /**
   * Renomeia o preset no slot
   */
  const renameSlot = useCallback(async (newName) => {
    setIsLoading(true);
    try {
      const success = await firebase.renamePreset(slotNumber, newName);
      if (success && localPreset) {
        setLocalPreset({ ...localPreset, name: newName });
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [firebase, slotNumber, localPreset]);

  return {
    // Estado
    preset: localPreset,
    hasPreset,
    isLoading: isLoading || firebase.isSyncing,
    
    // Métodos
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    renameSlot,
    
    // Metadados
    slotNumber,
    lastUpdated: slotPreset?.updatedAt ? new Date(slotPreset.updatedAt) : null,
  };
}

/**
 * Hook para backup automático
 * Faz backup periódico do estado atual
 */
export function useAutoBackup(backupInterval = 300000) { // 5 minutos
  const firebase = useFirebaseSync();
  const [lastBackup, setLastBackup] = useState(null);
  const [backupCount, setBackupCount] = useState(0);

  const createBackup = useCallback(async (stateData) => {
    if (!firebase.isAuthenticated || !stateData) return false;

    try {
      // Usa slot especial para backup (slot 0)
      const backupData = {
        ...stateData,
        name: `Backup_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}`,
        isBackup: true,
        backupAt: new Date().toISOString(),
      };

      const success = await firebase.savePreset(0, backupData);
      if (success) {
        setLastBackup(new Date());
        setBackupCount(prev => prev + 1);
      }
      return success;
    } catch (error) {
      console.error('Erro no backup automático:', error);
      return false;
    }
  }, [firebase]);

  // Configura backup periódico
  useEffect(() => {
    if (!firebase.isAuthenticated) return;

    const interval = setInterval(() => {
      // Em uma implementação real, isso capturaria o estado atual do app
      // Por enquanto é apenas um esqueleto
      console.log('Backup automático agendado');
    }, backupInterval);

    return () => clearInterval(interval);
  }, [firebase.isAuthenticated, backupInterval]);

  return {
    createBackup,
    lastBackup,
    backupCount,
  };
}

export default {
  useFirebaseSync,
  usePresetSlot,
  useAutoBackup,
  COLLECTIONS,
};
