import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

/**
 *  * UserContext — gerencia o estado de autenticação do usuário.
 *  *
  * Observa o onAuthStateChanged do Firebase e expõe:
   *   - user: objeto do Firebase Auth (null se não autenticado)
    *   - loading: boolean enquanto resolve o estado inicial
     *   - isAuthorized: indica se o email está na lista de usuários permitidos
      */

      const UserContext = createContext(null);

      export function UserProvider({ children, authorizedEmails = [] }) {
        const [user, setUser] = useState(null);
          const [loading, setLoading] = useState(true);
            const [isLoggingIn, setIsLoggingIn] = useState(false);

              useEffect(() => {
                  const auth = getAuth();
                      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
                            setUser(firebaseUser);
                                  setLoading(false);
                                      });
                                          return unsubscribe;
                                            }, []);

                                              const isAuthorized = user
                                                  ? authorizedEmails.length === 0 || authorizedEmails.includes(user.email)
                                                      : false;

                                                        const value = { user, loading, isLoggingIn, setIsLoggingIn, isAuthorized };

                                                          return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
                                                          }

                                                          export function useUser() {
                                                            const ctx = useContext(UserContext);
                                                              if (!ctx) throw new Error('useUser must be used within <UserProvider>');
                                                                return ctx;
                                                                }

                                                                export default UserContext;
                                                                
 */