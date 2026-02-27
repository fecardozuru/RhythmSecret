# Checklist de erros de build (Vite/Rollup) — RhythmSecret

Use esta lista para validar rapidamente no CI e também para repassar para outro agente de IA.

---

## STATUS ATUAL (27/02/2026)

### ✅ Build
- Build OK (commit `bc7c3ef` — Cloudflare Pages, 6h atrás)
- - Último deploy: `dd535eb0.rhythmsecret.pages.dev`
 
  - ### ✅ Firebase Auth — CORRIGIDO
  - - **Domínios autorizados adicionados no Firebase Console:**
    -   - `dd535eb0.rhythmsecret.pages.dev` (Custom) ✅
        -   - `rhythmsecret.pages.dev` (Custom) ✅
            - - **Causa raiz do erro `auth/unauthorized-domain`:** o domínio do deploy Cloudflare Pages não estava na lista de domínios autorizados do Firebase Authentication (Settings > Authorized domains). Isso causava o popup de login fechar imediatamente com erro.
             
              - ### ✅ Front-end visual — EXPLICAÇÃO DO GPT CODEX
              - O GPT Codex identificou que a mudança visual (front-end "desmontado") foi causada por **regressão de arquitetura no `Layout`**:
              - - O componente `Layout` passou a esperar conteúdo via `slot`, mas `AppPage` enviava filhos normais → parte da UI sumia/ficava fora de lugar.
                - - Corrigido em: `fix: corrigir AppPage para usar slots corretos do Layout`
                  - - Visual de referência correto: `https://28927e01.rhythmsecret.pages.dev/`
                   
                    - ### ⚠️ Pop-up de login piscava antes (HISTÓRICO)
                    - - **Causa**: `user` iniciava como `null`, então renderizava LoginPage imediatamente, antes do Firebase confirmar se havia sessão.
                      - - **Solução implementada**: `UserContext` usa `loading: true` inicial e aguarda `getRedirectResult()` + `onAuthStateChanged` antes de renderizar qualquer tela.
                        - - **Comportamento atual**: exibe "Validando autenticação..." enquanto carrega, depois renderiza LoginPage ou AppPage.
                         
                          - ---

                          ## 1) Contrato de export/import entre arquivos

                          - [ ] Verificar se **todo import nomeado** existe no arquivo de origem.
                          - [ ] - [ ] Validar com `npm run build` após cada correção.
                          - [ ] - [ ] Conferir especialmente erros no formato:
                          - [ ]   - `"X" is not exported by "arquivo"`
                          - [ ]     - `Could not resolve "path"`
                         
                          - [ ] ## 2) Tema (useTheme) e contexto
                         
                          - [ ] - [ ] Garantir que componentes importem `useTheme` de `src/contexts` (e não de constantes).
                          - [ ] - [ ] Confirmar que `ThemeContext` expõe `themeClasses` consumido pelos componentes de UI.
                          - [ ] - [ ] Validar tema padrão existente na constante `THEMES`.
                         
                          - [ ] ## 3) Caminhos de import e arquivos ausentes
                         
                          - [ ] - [ ] Revisar imports relativos em componentes movidos entre pastas.
                          - [ ] - [ ] Criar stubs/componentes ausentes (ex.: indicador offline PWA) quando o import for legítimo.
                          - [ ] - [ ] Evitar paths redundantes como `../../../components/...` quando há caminho local mais simples.
                         
                          - [ ] ## 4) Constantes musicais compatíveis com consumidores
                         
                          - [ ] - [ ] `TIME_SIGNATURES` deve estar no formato esperado pelos componentes (objeto indexado por "4/4", etc.).
                          - [ ] - [ ] Exportar `COMMON_TIME_SIGNATURES` quando usado em seletores.
                          - [ ] - [ ] Exportar `SUBDIVISION_OPTIONS` quando hooks legados dependem desse nome.
                          - [ ] - [ ] Garantir consistência de propriedades (numerator/denominator).
                         
                          - [ ] ## 5) Utilitários compartilhados
                         
                          - [ ] - [ ] Confirmar que `src/utils/formatters.js` exporta todas as funções importadas na UI.
                          - [ ] - [ ] Se necessário, adicionar funções faltantes (ex.: `formatTime`, `formatBatteryLevel`).
                          - [ ] - [ ] Atualizar também o default export do módulo, se o projeto usa ambos os formatos.
                         
                          - [ ] ## 6) Biblioteca de ícones (lucide-react)
                         
                          - [ ] - [ ] Validar nomes de ícones suportados pela versão instalada.
                          - [ ] - [ ] Substituir ícones inexistentes por equivalentes existentes.
                         
                          - [ ] ## 7) Firebase Authentication — Domínios Autorizados
                         
                          - [ ] - [ ] Adicionar **todos os domínios de deploy** no Firebase Console > Authentication > Settings > Authorized domains.
                          - [ ] - Domínios a adicionar para Cloudflare Pages:
                          - [ ]   - `*.rhythmsecret.pages.dev` (cada preview tem hash único, ex: `dd535eb0.rhythmsecret.pages.dev`)
                          - [ ]     - `rhythmsecret.pages.dev` (produção)
                          - [ ] - Sem isso: `auth/unauthorized-domain` → popup fecha imediatamente.
                         
                          - [ ] ## 8) Ordem de validação sugerida
                         
                          - [ ] 1. `npm install`
                          - [ ] 2. `npm run build`
                          - [ ] 3. Corrigir somente o primeiro erro reportado
                          - [ ] 4. Repetir até build verde
                          - [ ] 5. Rodar smoke-check local de navegação
                          - [ ] 6. Verificar domínios no Firebase Auth antes de testar login em produção
                         
                          - [ ] ## 9) Comandos úteis
                         
                          - [ ] ```bash
                          - [ ] npm install
                          - [ ] npm run build
                          - [ ] rg "from '../../constants/themes'" src -n
                          - [ ] rg "is not exported by|Could not resolve|Identifier .* already been declared" -n
                          - [ ] ```
                         
                          - [ ] ## 10) Observações de segurança/qualidade
                         
                          - [ ] - Vulnerabilidades de `npm audit` não bloquearam o build, mas devem ser tratadas separadamente.
                          - [ ] - Evitar correções "pontuais" sem alinhar o contrato global do módulo (causa efeito cascata).
                          - [ ] - Cada deploy Cloudflare Pages gera um subdomínio único — lembrar de adicionar ao Firebase Auth ao testar em preview URLs novas.
