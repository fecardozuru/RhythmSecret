/* ================================================================================
🔥 FIREBASE SERVICE - V2026.56
================================================================================
CHANGELOG:
1. Configuração centralizada do Firebase
2. Autenticação com Google e whitelist de administradores
3. Funções CRUD para gerenciamento de usuários
4. Sistema de whitelist para controle de acesso
================================================================================ */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';

/* ================================================================================
📋 CONFIGURAÇÃO INICIAL
================================================================================ */

// Configuração do Firebase usando variáveis de ambiente (segurança!)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializa Firebase apenas se não existir uma instância (evita duplicação)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Serviços do Firebase
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configurações do provedor Google
googleProvider.setCustomParameters({
  prompt: 'select_account'  // Força seleção de conta a cada login
});

/* ================================================================================
📁 CONSTANTES DO BANCO DE DADOS
================================================================================ */

// Nomes das coleções no Firestore
const WHITELIST_COLLECTION = 'admin_whitelist';  // Lista de emails autorizados
const USER_COLLECTION = 'users';                  // Dados dos usuários

// Emails administradores pré-aprovados (hardcoded para fallback)
const DEFAULT_ADMINS = [
  'felipecardosoru@gmail.com',   // Admin principal
  'marciocardosojr@gmail.com',    // Admin secundário
  'admin@rhythmsecret.com'         // Admin genérico
];

/* ================================================================================
🛡️ FUNÇÕES DE WHITELIST (CONTROLE DE ACESSO)
================================================================================ */

/**
 * Verifica se um email está autorizado a acessar o sistema
 * @param {string} email - Email do usuário a ser verificado
 * @returns {Promise<Object>} Status da verificação (inWhitelist, isAdmin, userData)
 */
export const isUserInWhitelist = async (email) => {
  try {
    // 1. Verifica se é admin padrão (hardcoded)
    if (DEFAULT_ADMINS.includes(email.toLowerCase())) {
      console.log(`✅ Admin padrão autorizado: ${email}`);
      return { inWhitelist: true, isAdmin: true };
    }

    // 2. Busca no Firestore (whitelist dinâmica)
    const whitelistRef = collection(db, WHITELIST_COLLECTION);
    const q = query(whitelistRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      console.log(`✅ Usuário autorizado via whitelist: ${email}`);
      return { 
        inWhitelist: true, 
        isAdmin: userData.isAdmin || false,
        userData 
      };
    }
    
    // 3. Não autorizado
    console.log(`❌ Acesso negado para: ${email}`);
    return { inWhitelist: false, isAdmin: false };
  } catch (error) {
    console.error('🔥 Erro ao verificar whitelist:', error);
    return { inWhitelist: false, isAdmin: false };
  }
};

/* ================================================================================
🔐 AUTENTICAÇÃO
================================================================================ */

/**
 * Login com Google (POPUP)
 * @returns {Promise<Object>} Dados do usuário autenticado
 */
export const signInWithGoogle = async () => {
  try {
    console.log('🔄 Iniciando login com Google...');
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log(`✅ Usuário autenticado: ${user.email}`);
    
    // Verifica autorização
    const whitelistStatus = await isUserInWhitelist(user.email);
    
    if (!whitelistStatus.inWhitelist) {
      // Se não autorizado, faz logout automático
      console.warn(`🚫 Usuário não autorizado: ${user.email}`);
      await auth.signOut();
      throw new Error('Acesso não autorizado. Contate o administrador.');
    }
    
    // Salva/atualiza dados do usuário
    await saveUserData(user, whitelistStatus);
    
    return {
      user,
      isAdmin: whitelistStatus.isAdmin,
      whitelistStatus
    };
  } catch (error) {
    console.error('🔥 Erro no login:', error);
    throw error;
  }
};

/**
 * Salva ou atualiza dados do usuário no Firestore
 * @param {Object} user - Objeto do usuário do Firebase
 * @param {Object} whitelistStatus - Status da whitelist
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
      // Atualiza usuário existente
      await updateDoc(userRef, userData);
      console.log(`✅ Usuário atualizado: ${user.email}`);
    } else {
      // Cria novo usuário
      await setDoc(userRef, userData);
      console.log(`✅ Novo usuário criado: ${user.email}`);
    }
  } catch (error) {
    console.error('🔥 Erro ao salvar dados do usuário:', error);
  }
};

/* ================================================================================
👑 FUNÇÕES ADMINISTRATIVAS
================================================================================ */

/**
 * Adiciona um email à whitelist (apenas admin)
 * @param {string} email - Email a ser adicionado
 * @param {boolean} isAdmin - Se o usuário será admin
 * @param {string} addedBy - Email de quem está adicionando
 */
export const addToWhitelist = async (email, isAdmin = false, addedBy) => {
  try {
    // Verifica se usuário atual é admin
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
    
    console.log(`✅ Email adicionado à whitelist: ${email}`);
    return { success: true, email };
  } catch (error) {
    console.error('🔥 Erro ao adicionar à whitelist:', error);
    throw error;
  }
};

/**
 * Remove um email da whitelist (apenas admin)
 * @param {string} email - Email a ser removido
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
    
    console.log(`✅ Email removido da whitelist: ${email}`);
    return { success: true, email };
  } catch (error) {
    console.error('🔥 Erro ao remover da whitelist:', error);
    throw error;
  }
};

/**
 * Lista todos os usuários na whitelist (apenas admin)
 * @returns {Promise<Array>} Lista de usuários autorizados
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
    console.error('🔥 Erro ao buscar whitelist:', error);
    throw error;
  }
};

/* ================================================================================
👤 FUNÇÕES DO USUÁRIO
================================================================================ */

/**
 * Verifica status do usuário atual (autenticado e autorizado)
 * @returns {Promise<Object|null>} Status do usuário ou null
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
    console.error('🔥 Erro ao buscar status do usuário:', error);
    return null;
  }
};

/**
 * Logout do usuário
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    console.log('✅ Logout realizado com sucesso');
  } catch (error) {
    console.error('🔥 Erro no logout:', error);
    throw error;
  }
};

/**
 * Observador de autenticação (callback executado quando estado muda)
 * @param {Function} callback - Função a ser executada
 */
export const onAuthStateChanged = (callback) => {
  return firebaseAuthStateChanged(auth, callback);
};

/* ================================================================================
📤 EXPORTAÇÕES
================================================================================ */

export { auth, db };
