import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

/**
 * AppContext — Contexto global do estado da aplicação RhythmSecret.
  *
   * Centraliza o estado do metrônomo (BPM, compasso, subdivisão, volumes,
    * modos, presets, toast, etc.) e expõe helpers para os componentes filhos.
     *
      * Os detalhes de áudio (scheduler, AudioContext) ficam em useMetronomeEngine;
       * aqui ficam apenas os dados de UI e preferências do usuário.
        */

        const AppContext = createContext(null);

        export function AppProvider({ children }) {
          // --- BPM ---
            const [bpm, setBpm] = useState(120);

              // --- Compasso e subdivisão ---
                const [beatsPerMeasure, setBeatsPerMeasure] = useState(4);
                  const [subdivision, setSubdivision] = useState(1);

                    // --- Volumes por nota (array de 0-1 por beat * subdivision) ---
                      const [volumes, setVolumes] = useState(Array(4).fill(1));

                        // --- Modo de play ---
                          const [isPlaying, setIsPlaying] = useState(false);
                            const [playMode, setPlayMode] = useState('normal'); // 'normal' | 'loop' | 'gap'

                              // --- Features pro ---
                                const [gapEnabled, setGapEnabled] = useState(false);
                                  const [ghostMode, setGhostMode] = useState(false);
                                    const [permutationEnabled, setPermutationEnabled] = useState(false);
                                      const [autoLoopEnabled, setAutoLoopEnabled] = useState(false);

                                        // --- Tema ---
                                          const [theme, setTheme] = useState('dark');

                                            // --- Toast notifications ---
                                              const [toast, setToast] = useState(null);

                                                // --- Preset slots ---
                                                  const [presets, setPresets] = useState(Array(8).fill(null));

                                                    const showToast = useCallback((msg) => {
                                                        setToast(msg);
                                                            setTimeout(() => setToast(null), 2000);
                                                              }, []);

                                                                const toggleNoteVolume = useCallback((index) => {
                                                                    setVolumes((prev) => {
                                                                          const next = [...prev];
                                                                                next[index] = next[index] > 0 ? 0 : 1;
                                                                                      return next;
                                                                                          });
                                                                                            }, []);

                                                                                              const resetVolumes = useCallback(() => {
                                                                                                  setVolumes(Array(beatsPerMeasure * subdivision).fill(1));
                                                                                                    }, [beatsPerMeasure, subdivision]);

                                                                                                      // Sincroniza o tamanho do array de volumes quando muda compasso/subdivisão
                                                                                                        useEffect(() => {
                                                                                                            setVolumes(Array(beatsPerMeasure * subdivision).fill(1));
                                                                                                              }, [beatsPerMeasure, subdivision]);

                                                                                                                const value = {
                                                                                                                    bpm, setBpm,
                                                                                                                        beatsPerMeasure, setBeatsPerMeasure,
                                                                                                                            subdivision, setSubdivision,
                                                                                                                                volumes, setVolumes, toggleNoteVolume, resetVolumes,
                                                                                                                                    isPlaying, setIsPlaying,
                                                                                                                                        playMode, setPlayMode,
                                                                                                                                            gapEnabled, setGapEnabled,
                                                                                                                                                ghostMode, setGhostMode,
                                                                                                                                                    permutationEnabled, setPermutationEnabled,
                                                                                                                                                        autoLoopEnabled, setAutoLoopEnabled,
                                                                                                                                                            theme, setTheme,
                                                                                                                                                                toast, showToast,
                                                                                                                                                                    presets, setPresets,
                                                                                                                                                                      };

                                                                                                                                                                        return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
                                                                                                                                                                        }

                                                                                                                                                                        export function useAppContext() {
                                                                                                                                                                          const ctx = useContext(AppContext);
                                                                                                                                                                            if (!ctx) throw new Error('useAppContext must be used within <AppProvider>');
                                                                                                                                                                              return ctx;
                                                                                                                                                                              }

                                                                                                                                                                              export default AppContext;
                                                                                                                                                                              