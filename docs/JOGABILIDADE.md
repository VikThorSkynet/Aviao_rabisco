# Jogabilidade

## Modos

**Rota:** percurso procedural, anéis, coleções, pontos, combo, checkpoints e pouso no alvo. Preserva as mecânicas anteriores, incluindo recuperação.

**Livre:** explorar e aprender a usar o vento. Colisões não encerram uma partida: o avião amassa e reaparece no último ponto seguro. Pouso suave permite descansar e relançar.

## Controles

| Ação | Livre | Rota |
| --- | --- | --- |
| Nariz para baixo / cima | W / S ou ↑ / ↓ | W / S ou ↑ / ↓ |
| Virar / inclinar | A / D ou ← / → | A / D ou ← / → |
| Sopro | Espaço | Espaço |
| Relançar no chão | Segurar Espaço e soltar | Pouso integra o objetivo da rota |
| Mapa | Tab | Não tem mapa do Livre |
| Checkpoint | Pousos definem ponto seguro | C; toque longo |
| Reiniciar | Retornar pelo menu | R |
| Qualidade / som | Q / M | Q / M |
| Diagnóstico / ajuda | F3 / H | F3 / H |
| Menu | Esc ou botão | Esc ou botão |

No Livre com toque, arrastar horizontalmente vira; verticalmente muda o nariz. **Soprar** dá impulso no ar e carrega lançamento no chão. Soltar o arrasto zera o comando. Perder foco limpa entradas, evitando teclas presas.

## Energia e sopros

Baixar o nariz aumenta velocidade e perde altura. Levantar transforma velocidade em subida; o ar vertical também influencia. Curvas aumentam afundamento. O vento global desloca o avião e correntes locais podem sustentar ou derrubar.

É uma física de jogo, não uma simulação aerodinâmica completa. A atualização normal limita velocidade entre 4 e 32 m/s.

O Livre começa com cinco sopros. Cada impulso exige uma unidade, consome uma e respeita cooldown. Penas dão +1 e folhas +0,5, com máximo de cinco. No chão, uma unidade recarrega a cada dez segundos. Meio sopro sozinho não dispara.

## Sustentação

- Encostas: normal do terreno e vento definem subida ou descida; efeito cai com altura.
- Térmicas: perfil em sino, inclinação pelo vento, ciclo de vida e dependência do sol; não surgem sobre água.
- Rajadas: fontes locais concentradas.
- Onda: faixas senoidais a sotavento de relevo alto.
- Efeito solo: reduz afundamento gradualmente nos dois metros inferiores.
- Cachoeiras: leve descendente perto da queda e ascendente na névoa da base.
- Fontes temáticas: gêiser, balões, vila e empurrão horizontal próximo dela.

Nuvens e aves ajudam a encontrar correntes. À noite e na chuva, térmicas enfraquecem. Dia/noite dura cerca de 12 minutos de simulação; vento global muda lentamente.

## Pouso e recuperação

Estados: `flying`, `grounded`, `crumpled`. Impacto lento em terreno pouco inclinado pode virar pouso. Contato leve em encosta moderada pode deslizar. Impactos fortes, troncos, rochas, ponte e balão provocam recuperação. Água causa papel molhado e retorno suave.

Um pouso define ponto seguro acima do local. Segure Espaço, mire e solte para relançar, até 14 m/s. Catapultas iniciam a 30 m/s. O Livre não mostra game over.

## Mapa e álbum

Tab pausa e abre grade de 64 × 64 células. Áreas próximas do avião são exploradas; rios só aparecem dentro da exploração. Marcos descobertos viram símbolos: pico, vila, cachoeira, lago, lago escondido e ninho.

Figurinhas incluem arco-íris, peixe, borboleta e bando. A observação usa aproximações de distância/visibilidade; não há um sistema de fotografia ou oclusão completo.

Desafios opcionais: atravessar a queda, passar sob ponte-régua e acumular 300 m de subida térmica no mesmo voo. Esse último soma ganhos positivos quando uma térmica é detectada e o cooldown acabou; não verifica uma subida contínua do nível zero até 300 m.

Recordes incluem altitude absoluta Y, duração de voo, distância horizontal sem pousar e IDs de térmicas visitados. Altura sobre o terreno aparece no diagnóstico, não no indicador principal.

## Opções

Qualidade, sons, volume, variômetro sonoro, dia/noite e clima ficam no menu. Q muda qualidade em voo; M alterna som. Ponteiro de toque usa qualidade leve por padrão. As opções ficam no navegador.

## Bússola, vento e direção de missão

No Livre, a bússola fica à direita abaixo do HUD; a bandeira fica à esquerda. A agulha coral indica norte, a referência central indica o avião. A bandeira mostra para onde o vento sopra em relação ao avião, com intensidade. A marcação textual central anterior foi substituída.

No mapa, escolha uma aventura para destacar um destino sugerido real, distância, rumo e linha de direção. A vista foca a missão; Ver mundo inteiro oferece visão geral. Pins 1/2/3 correspondem a cachoeira/ponte/térmica e ✓ indica concluída. Térmicas são mais fortes de dia. Terreno desconhecido continua oculto, mesmo com os objetivos visíveis. Detalhes: [NAVEGACAO_MISSOES.md](NAVEGACAO_MISSOES.md).

## Leitura do ar e tarde

A bandeira indica para onde o ar vai e a posição relativa ao avião. O cartão de corrente distingue a subida do ar da subida do avião e oferece dicas de térmica/encosta/descendente. Setas verdes marcam correntes fortes próximas. Tarde tem tons quentes e as quatro fases se misturam suavemente. Detalhes: [VENTO_E_CICLO.md](VENTO_E_CICLO.md).
