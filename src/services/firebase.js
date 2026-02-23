// /src/services/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configurar provedor do Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Coleções do Firestore
const WHITELIST_COLLECTION = 'admin_whitelist';
const USER_COLLECTION = 'users';

// Emails administradores pré-aprovados (você pode adicionar o seu aqui)
const DEFAULT_ADMINS = [
  'felipecardosoru@gmail.com',  // Substitua pelo seu email
  'marciocardosojr@gmail.com',
  'admin@rhythmsecret.com'  // Outros emails admin
];

/**
 * Verifica se um email está na whitelist
 * @param {string} email - Email do usuário
 * @returns {Promise<boolean>} - True se estiver na whitelist
 */
export const isUserInWhitelist = async (email) => {
  try {
    // Primeiro verifica nos administradores padrão
    if (DEFAULT_ADMINS.includes(email.toLowerCase())) {
      return { inWhitelist: true, isAdmin: true };
    }

    // Busca no Firestore
    const whitelistRef = collection(db, WHITELIST_COLLECTION);
    const q = query(whitelistRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return { 
        inWhitelist: true, 
        isAdmin: userData.isAdmin || false,
        userData 
      };
    }
    
    return { inWhitelist: false, isAdmin: false };
  } catch (error) {
    console.error('Erro ao verificar whitelist:', error);
    return { inWhitelist: false, isAdmin: false };
  }
};

/**
 * Login com Google
 * @returns {Promise<Object>} - Dados do usuário
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Verifica se está na whitelist
    const whitelistStatus = await isUserInWhitelist(user.email);
    
    if (!whitelistStatus.inWhitelist) {
      // Se não está na whitelist, faz logout
      await auth.signOut();
      throw new Error('Acesso não autorizado. Contate o administrador.');
    }
    
    // Salva/atualiza informações do usuário no Firestore
    await saveUserData(user, whitelistStatus);
    
    return {
      user,
      isAdmin: whitelistStatus.isAdmin,
      whitelistStatus
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

/**
 * Salva dados do usuário no Firestore
 */
const saveUserData = async (user, whitelistStatus) => {
  try {
    const userRef = doc(db, USER_COLLECTION, user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email.toLowerCase(),
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: whitelistStatus.isAdmin,
      lastLogin: new Date().toISOString(),
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (userDoc.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
  }
};

/**
 * Adiciona um email à whitelist (apenas admin)
 */
export const addToWhitelist = async (email, isAdmin = false, addedBy) => {
  try {
    // Verifica se quem está adicionando é admin
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      throw new Error('Apenas administradores podem adicionar à whitelist');
    }
    
    // Adiciona à whitelist
    const whitelistRef = doc(db, WHITELIST_COLLECTION, email.toLowerCase());
    await setDoc(whitelistRef, {
      email: email.toLowerCase(),
      isAdmin,
      addedBy: addedBy || currentUser.email,
      addedAt: new Date().toISOString(),
      status: 'active'
    });
    
    return { success: true, email };
  } catch (error) {
    console.error('Erro ao adicionar à whitelist:', error);
    throw error;
  }
};

/**
 * Remove um email da whitelist
 */
export const removeFromWhitelist = async (email) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      throw new Error('Apenas administradores podem remover da whitelist');
    }
    
    const whitelistRef = doc(db, WHITELIST_COLLECTION, email.toLowerCase());
    await updateDoc(whitelistRef, {
      status: 'removed',
      removedAt: new Date().toISOString(),
      removedBy: currentUser.email
    });
    
    return { success: true, email };
  } catch (error) {
    console.error('Erro ao remover da whitelist:', error);
    throw error;
  }
};

/**
 * Lista todos os usuários na whitelist
 */
export const getWhitelist = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      throw new Error('Apenas administradores podem ver a whitelist');
    }
    
    const whitelistRef = collection(db, WHITELIST_COLLECTION);
    const q = query(whitelistRef, where('status', '!=', 'removed'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar whitelist:', error);
    throw error;
  }
};

/**
 * Verifica status do usuário atual
 */
export const getCurrentUserStatus = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    const whitelistStatus = await isUserInWhitelist(currentUser.email);
    
    return {
      ...userData,
      ...whitelistStatus
    };
  } catch (error) {
    console.error('Erro ao buscar status do usuário:', error);
    return null;
  }
};

/**
 * Logout
 */
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

// Observador de autenticação
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};

export { auth, db };// /src/services/firebase.js
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configurar provedor do Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Coleções do Firestore
const WHITELIST_COLLECTION = 'admin_whitelist';
const USER_COLLECTION = 'users';

// Emails administradores pré-aprovados (você pode adicionar o seu aqui)
const DEFAULT_ADMINS = [
  'felipecardosoru@gmail.com',  // Substitua pelo seu email
  'marciocardosojr@gmail.com',
  'admin@rhythmsecret.com'  // Outros emails admin
];

/**
 * Verifica se um email está na whitelist
 * @param {string} email - Email do usuário
 * @returns {Promise<boolean>} - True se estiver na whitelist
 */
export const isUserInWhitelist = async (email) => {
  try {
    // Primeiro verifica nos administradores padrão
    if (DEFAULT_ADMINS.includes(email.toLowerCase())) {
      return { inWhitelist: true, isAdmin: true };
    }

    // Busca no Firestore
    const whitelistRef = collection(db, WHITELIST_COLLECTION);
    const q = query(whitelistRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      return { 
        inWhitelist: true, 
        isAdmin: userData.isAdmin || false,
        userData 
      };
    }
    
    return { inWhitelist: false, isAdmin: false };
  } catch (error) {
    console.error('Erro ao verificar whitelist:', error);
    return { inWhitelist: false, isAdmin: false };
  }
};

/**
 * Login com Google
 * @returns {Promise<Object>} - Dados do usuário
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Verifica se está na whitelist
    const whitelistStatus = await isUserInWhitelist(user.email);
    
    if (!whitelistStatus.inWhitelist) {
      // Se não está na whitelist, faz logout
      await auth.signOut();
      throw new Error('Acesso não autorizado. Contate o administrador.');
    }
    
    // Salva/atualiza informações do usuário no Firestore
    await saveUserData(user, whitelistStatus);
    
    return {
      user,
      isAdmin: whitelistStatus.isAdmin,
      whitelistStatus
    };
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

/**
 * Salva dados do usuário no Firestore
 */
const saveUserData = async (user, whitelistStatus) => {
  try {
    const userRef = doc(db, USER_COLLECTION, user.uid);
    const userDoc = await getDoc(userRef);
    
    const userData = {
      uid: user.uid,
      email: user.email.toLowerCase(),
      displayName: user.displayName,
      photoURL: user.photoURL,
      isAdmin: whitelistStatus.isAdmin,
      lastLogin: new Date().toISOString(),
      createdAt: userDoc.exists() ? userDoc.data().createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (userDoc.exists()) {
      await updateDoc(userRef, userData);
    } else {
      await setDoc(userRef, userData);
    }
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
  }
};

/**
 * Adiciona um email à whitelist (apenas admin)
 */
export const addToWhitelist = async (email, isAdmin = false, addedBy) => {
  try {
    // Verifica se quem está adicionando é admin
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      throw new Error('Apenas administradores podem adicionar à whitelist');
    }
    
    // Adiciona à whitelist
    const whitelistRef = doc(db, WHITELIST_COLLECTION, email.toLowerCase());
    await setDoc(whitelistRef, {
      email: email.toLowerCase(),
      isAdmin,
      addedBy: addedBy || currentUser.email,
      addedAt: new Date().toISOString(),
      status: 'active'
    });
    
    return { success: true, email };
  } catch (error) {
    console.error('Erro ao adicionar à whitelist:', error);
    throw error;
  }
};

/**
 * Remove um email da whitelist
 */
export const removeFromWhitelist = async (email) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      throw new Error('Apenas administradores podem remover da whitelist');
    }
    
    const whitelistRef = doc(db, WHITELIST_COLLECTION, email.toLowerCase());
    await updateDoc(whitelistRef, {
      status: 'removed',
      removedAt: new Date().toISOString(),
      removedBy: currentUser.email
    });
    
    return { success: true, email };
  } catch (error) {
    console.error('Erro ao remover da whitelist:', error);
    throw error;
  }
};

/**
 * Lista todos os usuários na whitelist
 */
export const getWhitelist = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('Usuário não autenticado');
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists() || !userDoc.data().isAdmin) {
      throw new Error('Apenas administradores podem ver a whitelist');
    }
    
    const whitelistRef = collection(db, WHITELIST_COLLECTION);
    const q = query(whitelistRef, where('status', '!=', 'removed'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar whitelist:', error);
    throw error;
  }
};

/**
 * Verifica status do usuário atual
 */
export const getCurrentUserStatus = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    
    const userDoc = await getDoc(doc(db, USER_COLLECTION, currentUser.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    const whitelistStatus = await isUserInWhitelist(currentUser.email);
    
    return {
      ...userData,
      ...whitelistStatus
    };
  } catch (error) {
    console.error('Erro ao buscar status do usuário:', error);
    return null;
  }
};

/**
 * Logout
 */
export const signOut = async () => {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

// Observador de autenticação
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};

export { auth, db };
