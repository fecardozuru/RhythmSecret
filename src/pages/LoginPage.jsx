import React, { useState } from 'react';
import {
  mapFirebaseAuthError,
  signInWithGoogle,
  signInWithGoogleRedirect,
} from '../services/firebase';

function LoginPage() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError('');

    try {
      await signInWithGoogle();
    } catch (err) {
      const code = err?.code;

      // fallback para navegadores/ambientes que bloqueiam popup
      if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
        try {
          await signInWithGoogleRedirect();
          return;
        } catch (redirectErr) {
          setError(mapFirebaseAuthError(redirectErr));
          return;
        }
      }

      setError(mapFirebaseAuthError(err));
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-5 shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-white">RhythmSecret</h1>
        <p className="text-gray-400 text-sm text-center">Faça login com Google para utilizar o serviço.</p>

        {error ? <p className="text-red-400 text-sm text-center">{error}</p> : null}

        <button
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition disabled:opacity-60"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          {isLoggingIn ? 'Entrando...' : 'Entrar com Google'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Se o pop-up não abrir ou fechar rapidamente, verifique bloqueador de pop-up e domínios autorizados no Firebase.
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
