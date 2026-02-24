import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';

/**
 * LoginPage - Tela de autenticação do RhythmSecret.
  * Exibe botão de login com Google via Firebase Auth.
   * Após login bem-sucedido, App.jsx redireciona para AppPage.
    */
    function LoginPage() {
      const [isLoggingIn, setIsLoggingIn] = useState(false);
        const [error, setError] = useState(null);

          const handleGoogleLogin = async () => {
              setIsLoggingIn(true);
                  setError(null);
                      try {
                            const provider = new GoogleAuthProvider();
                                  await signInWithPopup(auth, provider);
                                      } catch (err) {
                                            setError('Falha ao entrar. Tente novamente.');
                                                  console.error('Login error:', err);
                                                      } finally {
                                                            setIsLoggingIn(false);
                                                                }
                                                                  };

                                                                    return (
                                                                        <div className="min-h-screen flex items-center justify-center bg-gray-900">
                                                                              <div className="bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-6 shadow-xl">
                                                                                      <h1 className="text-3xl font-bold text-white">RhythmSecret</h1>
                                                                                              <p className="text-gray-400 text-sm">Faça login para continuar</p>
                                                                                                      {error && <p className="text-red-400 text-sm">{error}</p>}
                                                                                                              <button
                                                                                                                        onClick={handleGoogleLogin}
                                                                                                                                  disabled={isLoggingIn}
                                                                                                                                            className="flex items-center gap-3 bg-white text-gray-800 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition disabled:opacity-60"
                                                                                                                                                    >
                                                                                                                                                              {isLoggingIn && <span className="animate-spin loading-sm" />}
                                                                                                                                                                        <img
                                                                                                                                                                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                                                                                                                                                                                alt="Google"
                                                                                                                                                                                                            className="w-5 h-5"
                                                                                                                                                                                                                      />
                                                                                                                                                                                                                                {isLoggingIn ? 'Entrando...' : 'Entrar com Google'}
                                                                                                                                                                                                                                        </button>
                                                                                                                                                                                                                                                <p className="text-xs text-gray-500">Acesso restrito a usuários autorizados.</p>
                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                            export default LoginPage;