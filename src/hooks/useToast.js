import { useState, useCallback } from 'react';

/**
 * useToast — gerencia notificações temporárias (toast).
  *
   * @param {number} duration - duração em ms antes do toast sumir (padrão: 2000)
    * @returns {{ toast, showToast }} - estado atual e função para exibir mensagem
     *
      * Uso:
       *   const { toast, showToast } = useToast();
        *   showToast('Preset salvo!');
         *   // Renderizar: toast && <Toast message={toast} />
          */
          export function useToast(duration = 2000) {
            const [toast, setToast] = useState(null);

              const showToast = useCallback(
                  (message) => {
                        setToast(message);
                              setTimeout(() => setToast(null), duration);
                                  },// Barrel export — hooks/
                                  export { useFirebaseSync } from './useFirebaseSync';
                                  export { useMenuManagement } from './useMenuManagement';
                                  export { useMetronomeEngine } from './useMetronomeEngine';
                                  export { useKeyboardShortcuts } from './useKeyboardShortcuts';
                                  export { useClickOutside } from './useClickOutside';
                                  export { useToast } from './useToast';
                                  
                                      [duration]
                                        );

                                          return { toast, showToast };
                                          }

                                          export default useToast;

                                          index.js
