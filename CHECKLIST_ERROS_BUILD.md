# Checklist de erros de build (Vite/Rollup) — RhythmSecret

Use esta lista para validar rapidamente no CI e também para repassar para outro agente de IA.

## 1) Contrato de export/import entre arquivos
- [ ] Verificar se **todo import nomeado** existe no arquivo de origem.
- [ ] Validar com `npm run build` após cada correção.
- [ ] Conferir especialmente erros no formato:
  - `"X" is not exported by "arquivo"`
  - `Could not resolve "path"`

## 2) Tema (useTheme) e contexto
- [ ] Garantir que componentes importem `useTheme` de `src/contexts` (e não de constantes).
- [ ] Confirmar que `ThemeContext` expõe `themeClasses` consumido pelos componentes de UI.
- [ ] Validar tema padrão existente na constante `THEMES`.

## 3) Caminhos de import e arquivos ausentes
- [ ] Revisar imports relativos em componentes movidos entre pastas.
- [ ] Criar stubs/componentes ausentes (ex.: indicador offline PWA) quando o import for legítimo.
- [ ] Evitar paths redundantes como `../../../components/...` quando há caminho local mais simples.

## 4) Constantes musicais compatíveis com consumidores
- [ ] `TIME_SIGNATURES` deve estar no formato esperado pelos componentes (objeto indexado por `"4/4"`, etc.).
- [ ] Exportar `COMMON_TIME_SIGNATURES` quando usado em seletores.
- [ ] Exportar `SUBDIVISION_OPTIONS` quando hooks legados dependem desse nome.
- [ ] Garantir consistência de propriedades (`numerator`/`denominator`).

## 5) Utilitários compartilhados
- [ ] Confirmar que `src/utils/formatters.js` exporta todas as funções importadas na UI.
- [ ] Se necessário, adicionar funções faltantes (ex.: `formatTime`, `formatBatteryLevel`).
- [ ] Atualizar também o `default export` do módulo, se o projeto usa ambos os formatos.

## 6) Biblioteca de ícones (lucide-react)
- [ ] Validar nomes de ícones suportados pela versão instalada.
- [ ] Substituir ícones inexistentes por equivalentes existentes.

## 7) Ordem de validação sugerida
1. `npm install`
2. `npm run build`
3. Corrigir **somente o primeiro erro** reportado
4. Repetir até build verde
5. Rodar smoke-check local de navegação

## 8) Comandos úteis
```bash
npm install
npm run build
rg "from '../../constants/themes'" src -n
rg "is not exported by|Could not resolve|Identifier .* already been declared" -n
```

## 9) Observações de segurança/qualidade
- [ ] Vulnerabilidades de `npm audit` não bloquearam o build, mas devem ser tratadas separadamente.
- [ ] Evitar correções “pontuais” sem alinhar o contrato global do módulo (causa efeito cascata).
