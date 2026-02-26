import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseAuthStateChanged
} from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const saveUserData = async (user) => {
  if (!user) return;

  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Erro ao salvar dados do usuário:', error);
  }
};

export const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  await saveUserData(result.user);
  return result;
};

export const signInWithGoogleRedirect = async () => {
  await signInWithRedirect(auth, googleProvider);
};

export const signOut = async () => {
  await firebaseSignOut(auth);
};

export const onAuthStateChanged = (callback) => firebaseAuthStateChanged(auth, callback);

export const mapFirebaseAuthError = (error) => {
  const code = error?.code;

  if (code === 'auth/popup-closed-by-user') {
    return 'O pop-up foi fechado antes de concluir o login.';
  }

  if (code === 'auth/popup-blocked') {
    return 'Seu navegador bloqueou o pop-up. Tente novamente ou use o login por redirecionamento.';
  }

  if (code === 'auth/cancelled-popup-request') {
    return 'Já existe uma tentativa de login em andamento. Aguarde e tente novamente.';
  }

  if (code === 'auth/unauthorized-domain') {
    return 'Domínio não autorizado no Firebase Auth. Adicione o domínio atual em Authentication > Settings > Authorized domains.';
  }

  return 'Falha ao entrar com Google. Verifique configuração do Firebase e tente novamente.';
};

export { auth, db };
