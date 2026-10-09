# Arquitetura

## Fluxo geral

```text
index.html → src/main.js → menu
                         ├─ startRoute() → jogo anterior isolado
                         └─ startFree()
                              ├─ WorldModel → dados determinísticos
                              ├─ Chunks → Worker e malhas
                              ├─ Flight / weather / windAt → simulação
                              ├─ WorldView / Life / updateFlock → cena
                              ├─ Progress / drawMap → exploração e saves
                              └─ Sound → áudio
```

## Módulos

| Arquivo | Responsabilidade |
| --- | --- |
| `src/main.js` | Menu, seed, opções, entrada nos modos e retorno por reload |
| `src/config.js` | CFG_FREE, declaração MODE e armazenamento de opções |
| `src/modes/route.js` | Rota anterior: geração, HUD, pontos, checkpoints e pouso |
| `src/modes/free.js` | Orquestração do Livre, eventos, loop e interfaces |
| `src/world/model.js` | Relevo, normais, água, biomas, marcos e conteúdo de chunks |
| `src/world/worker.js` | Geração fora da thread principal |
| `src/world/chunks.js` | Prioridade, respostas, LOD, descarte e pool |
| `src/physics/flight.js` | Voo, clima, vento, colisão e recuperação |
| `src/render/assets.js` | Avião, árvore desenhada em canvas e material do terreno |
| `src/render/world.js` | Câmera, luz, água, instancing e cena |
| `src/life/flock.js` | Boids e quatro aviões NPC |
| `src/life/life.js` | Chuva, estrelas, fumaça, respingos, margens e barcos |
| `src/ui/progress.js` | Descobertas, figurinhas, desafios, recordes e saves |
| `src/ui/navigation.js` | Bússola SVG e bandeira orientadas pelo avião/vento |
| `src/ui/missions.js` | Destinos reais, distância e estado das missões |
| `src/ui/map.js` | Mapa 2D com exploração e marcos |
| `src/audio/sound.js` | Ruído sintetizado, PannerNode e tons |
| `src/shared/math.js` | Hash, PRNG, simplex, interpolação e distância |

## Modos e ciclo de vida

O menu chama implementações distintas. `MODE` declara `combo`, `score`, `endGame` e `routeValidation`, falsos para Livre e verdadeiros para Rota. **Essa declaração ainda não é um sistema geral de feature flags.** O isolamento real vem dos módulos: o Livre não chama pontuação ou encerramento da Rota. Acrescentar um flag exige conectá-lo explicitamente aos consumidores.

A Rota substitui o conteúdo de `document.body`. Sair de qualquer modo recarrega a página, eliminando listeners e recursos anteriores. Não trocar os modos apenas chamando suas funções sem reload: ambos registram eventos globais e loops de animação.

## Loop do Livre

1. Agenda `requestAnimationFrame` e calcula delta real.
2. Limita o delta da simulação a 0,05 s para evitar saltos grandes.
3. Atualiza chunks; aplica até duas respostas por frame.
4. Aguarda o chunk inicial antes de avançar o voo.
5. Quando não está pausado, atualiza clima e acumula passos de **1/120 s**.
6. Amostra vento e chama `Flight.step()` em cada passo.
7. Processa coleta, progresso, áudio, notificações e salvamento.
8. Atualiza/renderiza a cena; atualiza HUD em frequência menor.

Mapa e ajuda pausam o voo. Uma aba oculta interrompe o processamento do frame e salva. O indicador de fps usa tempo real; dia/noite usa tempo de simulação, que pode avançar mais lentamente em desempenho muito baixo.

## Contrato do Worker

Inicialização: `{ seed }`. Pedido: `{ id, cx, cz, segments }`. Resposta: `{ id, chunk }` ou `{ id, error }`.

O Worker mantém seu `WorldModel`. Retorna `vertices`, `colors` e `indices` como arrays tipados, transferindo buffers; árvores, rochas, coletáveis e vento são dados serializáveis. Three.js fica na thread principal.

Até dois pedidos ficam pendentes. A geração prioriza distância ao centro; respostas obsoletas em região/LOD são rejeitadas. Um erro de Worker pausa o modo e mostra uma mensagem. A importação `?worker&inline` permite incluir o Worker no HTML portátil.

## Pool, LOD e renderização

O terreno compartilha material. Geometrias descartadas entram em pool limitado a oito. Antes de reutilizar uma geometria enviada à GPU, `dispose()` libera buffers antigos. O atributo `normal` é removido e recalculado para a nova quantidade de vértices: isso evita triângulos escuros após troca de LOD.

Árvores são planos cruzados com textura de canvas e `InstancedMesh`. Rochas e coletáveis também usam instancing. Adereços de chunks são reconstruídos, liberando seus recursos antigos. Rios, lagos e alguns objetos globais permanecem na cena: nem todo conteúdo usa streaming.

Neblina esconde a fronteira carregada. O material do terreno aplica curvas de nível, hachura por inclinação e picos claros. O cache do shader distingue qualidade; preserve esse contrato ao mudar os materiais.

## Compilação

Vite gera IIFE a partir de `src/main.js`. `scripts/portable.mjs` reúne JS e CSS em `dist/game3.html`; `scripts/release.mjs` copia a distribuição para a raiz.

A Rota e o Livre compartilham LOOK, desenhos de canvas e geometria do avião em render/theme.js, render/paper-art.js e render/assets.js. A física e os shaders históricos da Rota continuam isolados. O Livre usa material de papel/hachura e atlas de árvores; ver VALIDACAO_VISUAL.md.
