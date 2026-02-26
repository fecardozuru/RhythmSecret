import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from '../services/firebase';

const UserContext = createContext(null);

export function UserProvider({ children, authorizedEmails = [] }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const isAuthorized = useMemo(() => {
    if (!user) return false;
    if (authorizedEmails.length === 0) return true;
    return authorizedEmails.includes(user.email);
  }, [user, authorizedEmails]);

  const value = useMemo(
    () => ({ user, loading, isAuthorized }),
    [user, loading, isAuthorized]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within <UserProvider>');
  return ctx;
}

export default UserContext;
