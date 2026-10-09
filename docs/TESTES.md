# Testes, evidências e limitações

## Suíte versionada

`npm test` inclui memória, navegação e os seis testes de mundo/voo abaixo:

1. Determinismo de altura e árvores em três seeds; três quedas principais com desnível mínimo.
2. Vértices coerentes com heightAt e uma borda 24/8.
3. Sol diurno/noturno e ausência de térmicas sobre água na amostra.
4. Pouso, recarga, relançamento, recuperação e papel molhado.
5. Vento finito/limitado e declaração das opções do Livre.
6. Cinco minutos de voo térmico sem consumir sopros, com controle automatizado e luz diurna fixa.

O último não prova qualquer trajetória com clima variável ou habilidade de um jogador. O teste de borda não cobre todas as transições, especialmente 16/6.

## Verificações gráficas da versão 3.0.0

Windows, Edge headless, SwiftShader e Playwright do ambiente original; HTML aberto por file://. Scripts locais com caminhos privados não estão versionados como suíte portátil.

Passaram: menu, Livre, Worker, mapa, persistência após reload, Q, lançamento carregado, retorno ao menu e início da Rota. Não houve erros observados de JavaScript ou shader nesses fluxos.

Emulação móvel 390 × 844: toque no Soprar, mapa, 25 chunks e ausência de rolagem horizontal.

Três ciclos de travessias por quatro regiões reportaram 279, 280 e 280 geometrias GPU. É evidência dessa amostra, não medição de todos os buffers, memória total ou sessão de horas. Objetos globais são inicialmente registrados na GPU quando aparecem, então crescimento inicial não prova vazamento.

## Roteiro manual

1. Abra game3.html, entre no Livre e aguarde o terreno.
2. Voe, gire, mergulhe e sopre; confira HUD e console.
3. Colete pena/folha e confira limite de recarga.
4. Pouse devagar, espere recarga, carregue e relance.
5. Entre na água e provoque colisão; confirme recuperação sem game over.
6. Abra/feche Tab; confira exploração, álbum e pausa.
7. Descubra marco, recarregue e confira progresso.
8. Abra outra seed e confira independência.
9. Alterne Q e atravesse regiões; procure frestas, normais escuras e crescimento contínuo de recursos.
10. Confira dia/noite, clima e sustentação.
11. Inicie Rota; confira controles, checkpoints e pouso.
12. Repita em celular físico, usando F3 para medir fps.

## Pendências verificáveis

| Tema | Estado |
| --- | --- |
| FPS real | Metas 60 desktop / 30 celular não certificadas em hardware |
| Saves | Tipos não totalmente validados; tratamento de storage não uniforme |
| LOD | Sem costura geral; avaliar 16/6 |
| Configuração | Parte de CFG_FREE ainda tem equivalentes hardcoded |
| MODE | Declaração; isolamento efetivo por módulos |
| Água | Sem enchimento/transbordamento dinâmico |
| Streaming | Água e alguns objetos são globais |
| Álbum | Observação aproximada, sem oclusão completa |
| UI automatizada | Runners test:browser e test:visual disponíveis; hardware físico ainda pendente |
| Rota | Smoke de entrada; suíte Node não cobre toda geração/pontuação |
| Migração | Sem exportação/importação no menu nem migrador v1→v2 |

Atualize memória e evidências ao resolver uma pendência; editar implementação sozinho não comprova conclusão.

## Verificação da memória e documentação

A suíte npm test também inclui quatro testes em tests/memory.test.js: rejeição de campos/tipos inválidos, datas impossíveis, referências inexistentes/externas e validação da memória real. Total na publicação inicial: dez testes aprovados. docs:check verifica existência de links locais; não testa âncoras ou destinos externos. memory:check verifica estrutura e referências, não a veracidade das afirmações.

## Alinhamento visual — 2026-10-09

Runners reproduzíveis e capturas comparativas adicionados. Resultados e limites: [VALIDACAO_VISUAL.md](VALIDACAO_VISUAL.md). Testes de navegador executados em Edge/SwiftShader; não certificar fps físico.

## Navegação e missões

Cinco testes de navigation.test.js e o runner test:navigation cobrem orientação, vento relativo, transição pelo norte, alvos reais, limites do mapa, seleção e conclusão visual. Total atual: quinze testes Node. Plano, capturas e limites em [NAVEGACAO_MISSOES.md](NAVEGACAO_MISSOES.md).

## Clareza de vento e ciclo

Total atual: 19 testes Node. Runner test:soaring valida fases do dia, indicações e uma térmica real. Capturas e limites em [VENTO_E_CICLO.md](VENTO_E_CICLO.md).
