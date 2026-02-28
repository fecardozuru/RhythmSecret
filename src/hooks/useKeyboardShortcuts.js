import { useEffect, useCallback } from 'react';

/**
 * useKeyboardShortcuts — registra atalhos de teclado globais.
  *
   * @param {object} handlers - mapa de tecla → callback
    *   Ex: { ' ': togglePlay, 'ArrowUp': increaseBpm, 'ArrowDown': decreaseBpm }
     * @param {boolean} enabled - desabilita os atalhos quando false (ex: modal aberto)
      */
      export function useKeyboardShortcuts(handlers = {}, enabled = true) {
        const handleKeyDown = useCallback(
            (e) => {
                  if (!enabled) return;

                        // Não disparar quando o usuário está digitando num input/textarea
                              const tag = e.target.tagName;
                                    if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;

                                          const handler = handlers[e.key];
                                                if (handler) {
                                                        e.preventDefault();
                                                                handler(e);
                                                                      }
                                                                          },
                                                                              [handlers, enabled]
                                                                                );

                                                                                  useEffect(() => {
                                                                                      window.addEventListener('keydown', handleKeyDown);
                                                                                          return () => window.removeEventListener('keydown', handleKeyDown);
                                                                                            }, [handleKeyDown]);
                                                                                            }

                                                                                            export default useKeyboardShortcuts;
                                                                                            