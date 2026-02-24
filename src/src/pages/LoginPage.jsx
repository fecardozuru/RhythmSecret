 tela de acesso exibida quando o usuário não está autenticado.
  *
   * Chama handleGoogleLogin (injetado via prop) para iniciar o fluxo OAuth.
    * Mantida simples e sem dependência de AudioEngine ou estado de metrônomo.
     */

     export default function LoginPage({ onLogin }) {
       const { isLoggingIn } = useUser();

         return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 gap-8 p-6">
                   <div className="flex flex-col items-center gap-3">
                           <Music size={56} className="text-primary" />
                                   <h1 className="text-4xl font-bold tracking-tight">RhythmSecret</h1>
                                           <p className="text-base-content/60 text-center max-w-xs">
                                                     Seu laboratório de ritmo — metrônomo avançado com subdivisões, grooves e muito mais.
                                                             </p>
                                                                   </div>

                                                                         <button
                                                                                 onClick={onLogin}
                                                                                         disabled={isLoggingIn}
                                                                                                 className="btn btn-primary btn-lg gap-2 min-w-[220px]"
                                                                                                       >
                                                                                                               {isLoggingIn ? (
                                                                                                                         <span className="loading loading-spinner loading-sm" />
                                                                                                                                 ) : (
                                                                                                                                           <img
                                                                                                                                                       src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                                                                                                                                                   alt="Google"
                                                                                                                                                                               className="w-5 h-5"
                                                                                                                                                                                         />
                                                                                                                                                                                                 )}
                                                                                                                                                                                                         {isLoggingIn ? 'Entrando...' : 'Entrar com Google'}
                                                                                                                                                                                                               </button>

                                                                                                                                                                                                                     <p className="text-xs text-base-content/40">
                                                                                                                                                                                                                             Acesso restrito a usuários autorizados.
                                                                                                                                                                                                                                   </p>
                                                                                                                                                                                                                                       </div>
                                                                                                                                                                                                                                         );
                                                                                                                                                                                                                                         }
                                                                                                                                                                                                                                         