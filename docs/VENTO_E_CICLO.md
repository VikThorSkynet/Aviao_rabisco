# Vento legível e ciclo suave

## Direção na bandeira

A seta azul aponta **para onde o ar vai**, acompanhando o tecido. A legenda informa o ponto cardeal e a posição relativa ao avião: para frente, para trás, para a direita/esquerda ou diagonal. A velocidade continua em m/s. As legendas têm papel de fundo para permanecer legíveis à noite e quebram linha no celular.

## Como o vento sustenta

O vento horizontal desloca o avião. Para ganhar ou manter altura, procure o **ar subindo**. O novo cartão mostra a velocidade vertical do ar, enquanto o variômetro do HUD continua medindo a velocidade vertical do avião.

- Verde: ar subindo e avião ganhando altura. Em térmica, fazer círculos ajuda a permanecer no centro.
- Amarelo: ar sobe, mas não basta para a situação atual do avião. Aproximar-se do centro, nivelar um mergulho ou recuperar velocidade pode ajudar.
- Coral: ar descendo. A indicação reconhece descendente de encosta e orienta a sair desse lado.
- Neutro: procurar nuvens, aves e correntes de subida. À noite, preferir encostas que recebem vento.

Até nove setas verdes indicam térmicas fortes próximas; em leve, até seis. Elas aparecem a baixa altura, seguem a inclinação do vento e somem quando a força disponível fica fraca. A indicação também verifica o vento total na base da corrente, evitando marcar uma térmica cuja subida é vencida por uma descendente. O painel de ajuda explica a diferença entre movimento do ar e movimento do avião.

`windAt()` agora fornece a origem predominante da sustentação/descendente. As forças, limites e integração do voo continuam com os valores anteriores; a mudança é de leitura e orientação.

## Manhã, dia, tarde e noite

O ciclo continua com 12 minutos de simulação. `world/day-cycle.js` calcula pesos normalizados com interpolação suave. `render/paper-sky.js` mistura três texturas estáticas na GPU: dia, tarde e noite. A manhã usa o desenho diurno com tom creme. A tarde aquece céu, papel e neblina; a lua aparece gradualmente à noite.

Céu, tinta/papel e neblina usam pesos contínuos; não existe mais a troca seca entre imagens baseada no limiar de sol. O período e um relógio estilizado aparecem abaixo dos instrumentos. Ao desativar dia/noite, a aparência fica diurna.

O sol que controla térmicas mantém a função física existente. Assim, elas enfraquecem no fim da tarde e praticamente desaparecem à noite. Hora exibida é do mundo do jogo, não hora real do computador.

## Validação e reproduzir

19 testes Node passaram, incluindo direções relativas, dicas de sustentação, quatro períodos, soma dos pesos, limites de brilho e continuidade nos limites e na volta do ciclo.

`npm run test:soaring` verifica bandeira, legendas, céu de manhã/dia/tarde/noite, uma térmica real amostrada pela física e aviso verde de subida. Desktop 1365 × 768 e tarde em toque emulado 390 × 844, Edge/SwiftShader, sem erros de JavaScript/shader. Não é medição de desempenho em celular físico.

| Cena | Captura |
| --- | --- |
| Manhã | [Manhã](images/sky-morning-desktop.png) |
| Dia | [Dia](images/sky-day-desktop.png) |
| Tarde | [Tarde](images/sky-afternoon-desktop.png) |
| Noite | [Noite](images/sky-night-desktop.png) |
| Térmica e dica de subida | [Corrente](images/thermal-coach-desktop.png) |
| Tarde no celular emulado | [Celular](images/sky-afternoon-mobile.png) |

As cenas são posicionadas pelo hook de teste; não documentam uma partida normal inteira. As texturas são criadas uma vez; a mistura não redesenha/uploads um canvas grande a cada frame.

```sh
npm run release
npm test
npm run test:soaring
npm run test:navigation
npm run test:browser
npm run docs:check
npm run memory:check
```

No Windows com software GPU: `$env:RABISCO_SOFTWARE_GPU='1'`. Entrega aprovada pelo usuário: este commit inclui clareza do vento, ciclo suave e a navegação implementada anteriormente.
