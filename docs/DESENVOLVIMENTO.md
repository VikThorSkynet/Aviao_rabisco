# Desenvolvimento e manutenção

## Instalação

Use Node.js 22.12+ na linha 22 ou 24+, npm e navegador WebGL. Three.js 0.160.0 e Vite 8.3.4 estão fixados com lockfile. Não atualizar dependências junto de uma mudança de documentação sem necessidade.

```sh
git clone https://github.com/VikThorSkynet/Aviao_rabisco.git
cd Aviao_rabisco
npm ci
npm run dev
```

## Comandos

| Comando | Resultado |
| --- | --- |
| npm run dev | Vite local em 127.0.0.1 |
| npm test | Testes Node em tests/*.test.js |
| npm run docs:check | Verifica links locais de Markdown |
| npm run memory:check | Valida memória e referências |
| npm run build | Bundle, CSS e HTML em dist/ |
| npm run release | Build e atualização do HTML da raiz |

`node_modules/` e `dist/` são ignorados. `game3.html` é versionado para jogar por duplo clique. Capturas em `docs/images/` são documentação, não dependências do runtime.

## Fluxo de mudança

1. Leia AGENTS.md, MEMORY.md e `.memory/state.json`.
2. Confira branch, remoto e mudanças locais.
3. Identifique módulo e contratos afetados, especialmente IDs persistidos.
4. Edite `src/` e documentos relacionados.
5. Execute testes pertinentes e verificadores de docs/memória.
6. Para mudanças no jogo, teste navegador e execute release.
7. Registre evidências, limitações e decisões na memória.
8. Revise o diff e apresente mudanças e validação. Ao finalizar, pergunte **"Posso fazer o commit dessas alterações?"** e aguarde autorização explícita. Um pedido de commit já feito pelo usuário na tarefa atual permite prosseguir sem perguntar novamente; permissões antigas não autorizam tarefas novas. Push requer autorização aplicável à tarefa atual.

Verificadores de memória/docs não substituem testes de comportamento. Git preserva histórico; `.memory/` resume continuidade.

## Build e distribuição

Vite compila IIFE com target ES2020 e Worker inline. `portable.mjs` embute CSS/JS e protege fechamento de tag de script. `release.mjs` copia o resultado para `game3.html`.

Não publicar `src/` como site estático pronto: precisa compilar. A publicação inicial no GitHub é código e HTML baixável; não ativa Pages, domínio ou deploy automático.

## Depuração

F3 no Livre mostra fps, chamadas de desenho, chunks, estado, altura sobre o chão e vento vertical. Q compara perfis. Pausar mapa ajuda a inspecionar cena, mas não representa desempenho de uma travessia.

`?test=1` expõe `window.__game` no Livre: referências aos modelos, cena, física, chunks, entradas, relógio, pausa, vento e save. Manipular esse estado ajuda testes, mas não demonstra habilidade ou comportamento normal do jogador.

Console deve ficar sem erros de JavaScript, Worker ou shader. Ao mudar ciclo de vida, confira retorno ao menu: reload é a limpeza atual.

## Navegador e hardware

O repositório não inclui o runner Playwright local original, que tinha caminhos específicos do computador de trabalho. O roteiro está em [TESTES.md](TESTES.md). Se acrescentar runner, use caminhos/URL configuráveis e declare dependências.

SwiftShader serve para verificar funcionamento e capturas, não para certificar fps em GPU de desktop ou celular físico.

## Áreas sensíveis

- Gerador: mesma seed pode mudar; preserve IDs ou planeje migração.
- Física: preserve passo fixo, recuperação e relançamento; confira voo sem sopros.
- LOD/pool: libere buffers e recalcule normais; confira frestas e crescimento de memória.
- UI: verifique toque, captura de ponteiro, layout estreito, pausa e menu.
- Persistência: valide tipos e mantenha dados antigos até migração bem-sucedida.
- Rota: evite refatoração ampla junto de uma mudança pequena no Livre.

## Memória

Registre fatos observados, não promessas. Estado deve ser curto; detalhes ficam em docs. Decisões duradouras vão para `decisions.json`, acontecimentos para journal. Datas e resultados só mudam após verificação real. Consulte [MEMORY.md](../MEMORY.md).
