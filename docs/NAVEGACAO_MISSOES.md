# Plano e entrega: bússola, vento e missões

## Planejamento apresentado antes da implementação

1. Substituir a direção textual do Livre por uma bússola desenhada em papel, alinhada à direita logo abaixo do HUD. Mostrar rosa dos ventos, norte e rumo do avião.
2. Colocar à esquerda uma bandeirinha pequena, orientada pelo vetor horizontal do vento em relação ao avião, com intensidade.
3. Mostrar destinos das três missões no mapa, com números, legenda, seleção, direção, distância e estado concluído.

Na revisão visual, os destinos próximos ficavam agrupados no mapa de 4 km. A implementação inclui vista focada na missão e alternância para o mundo inteiro, preservando a exploração.

## Implementação

- `src/ui/navigation.js`: SVGs de papel/rabisco e conversão de yaw/vetores para direções. A agulha coral aponta norte; a referência do avião fica voltada para cima. O rumo aparece abaixo. A bandeira aponta para onde o ar vai, relativo à orientação do avião, usando o vento horizontal amostrado pela física. Em calmaria, fica discreta. Rotação atravessa 0° pelo caminho curto.
- `src/ui/missions.js`: destinos sugeridos da cachoeira principal mais próxima, ponte-régua mais próxima e térmica local mais próxima. Fontes são os dados reais do mundo/chunks. Na ausência de chunks, busca térmicas por seed na região inicial, sem alterar geração ou progresso.
- `src/ui/map.js`: pins numerados, ✓ concluído, conectores para evitar sobreposição, linha pontilhada até o destino selecionado e vista focada com limites finitos. Só os pins e a direção aparecem sobre papel desconhecido; o terreno continua oculto.
- `src/modes/free.js`: integração no HUD e seleção da missão no mapa. Ao reabrir após concluir a selecionada, sugere outra pendente. Missões concluídas podem ser selecionadas para revisitar. A seleção é da sessão e não muda o formato dos saves.
- Interface usa cartões e escrita já adotados pelo jogo. A marcação antiga no centro foi removida. Os dois instrumentos ficam abaixo do cartão de altitude: vento à esquerda e bússola à direita, no desktop e no celular.

## Como usar

Abra Livre. Para direção, consulte a bússola; para o deslocamento do ar, observe a bandeira e sua intensidade em m/s. Ao virar o avião, os instrumentos acompanham essa orientação.

Abra Tab ou Mapa. Em **Pequenas aventuras**, escolha uma missão; o pin destacado e a linha pontilhada mostram a direção em linha reta. Os cartões informam distância horizontal e ponto cardeal. **Ver mundo inteiro** troca a escala; **Focar missão** retorna à vista local. Ao selecionar outra missão, a vista volta a focá-la.

A missão térmica mostra quanto já foi acumulado no voo e lembra que correntes são mais fortes de dia. Pouso/colisão continuam reiniciando a tentativa, conforme a regra existente. A linha não controla o avião nem calcula um caminho que evite o relevo.

No mapa, botões funcionam com teclado; Escape ou Fechar encerra o painel. Tab alterna o mapa quando o foco está fora dele; dentro do painel, Tab navega pelos controles.

## Validação

- Quinze testes Node: dez anteriores e cinco de orientação, vento, transição de ângulos, destinos reais e enquadramento nas bordas.
- Runner `npm run test:navigation`: rumos N/O, movimento da bandeira ao virar e ao mudar o vento, ausência do indicador antigo, posicionamento abaixo do HUD, seleção de missões, vista global/local, estado concluído, teclado e retorno à Rota.
- Desktop 1365 × 768 e toque emulado 390 × 844, Edge/SwiftShader. Sem rolagem horizontal ou erros de JavaScript/shader.
- Smoke `npm run test:browser` verifica também voo, Worker, mapa, persistência, qualidade, relançamento e Rota.
- Física, gerador, regras de conclusão e formato do progresso sem alterações.

| Revisão | Desktop | Celular emulado |
| --- | --- | --- |
| Instrumentos | [HUD](images/navigation-desktop.png) | [HUD](images/navigation-mobile.png) |
| Destinos e conclusão | [Mapa](images/mission-map-desktop.png) | [Mapa](images/mission-map-mobile.png) |

Os testes de conclusão no runner manipulam o estado de progresso para verificar a UI. As capturas não representam uma partida completa. Esta é validação funcional e visual emulada; não mede fps de hardware físico.

```sh
npm run release
npm test
npm run test:navigation
npm run test:browser
npm run docs:check
npm run memory:check
```

Para reproduzir software GPU no Windows: `$env:RABISCO_SOFTWARE_GPU='1'`. Chromium pode ser escolhido por RABISCO_BROWSER, conforme o guia de desenvolvimento. Entrega de navegação e missões aprovada pelo usuário para commit e envio ao GitHub.

## Clareza do vento e períodos do dia

A bandeira passou a ter uma seta do sentido do ar, legenda cardinal e indicação relativa ao avião. Um cartão separado explica ar subindo/descendo e oferece dica da corrente. Manhã, dia, tarde e noite se misturam sem a troca brusca de textura anterior. Detalhes e capturas: [VENTO_E_CICLO.md](VENTO_E_CICLO.md).
