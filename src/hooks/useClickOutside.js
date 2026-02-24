import { useEffect } from 'react';

/**
 * useClickOutside — dispara callback quando o usuário clica fora do elemento ref.
  *
   * @param {React.RefObject} ref - ref do elemento a monitorar
    * @param {Function} callback - função chamada ao clicar fora
     * @param {boolean} enabled - ativa/desativa o listener
      */
      export function useClickOutside(ref, callback, enabled = true) {
        useEffect(() => {
            if (!enabled) return;

                function handleClick(e) {
                      if (ref.current && !ref.current.contains(e.target)) {
                              callback(e);
                                    }
                                        }

                                            document.addEventListener('mousedown', handleClick);
                                                document.addEventListener('touchstart', handleClick);

                                                    return () => {
                                                          document.removeEventListener('mousedown', handleClick);
                                                                document.removeEventListener('touchstart', handleClick);
                                                                    };
                                                                      }, [ref, callback, enabled]);
                                                                      }

                                                                      export default useClickOutside;
                                                                      