# Missão 2: passagem justa e tentativa curta

## Diagnóstico

A ponte antiga ficava apenas cinco metros acima do topo nominal da cachoeira. Depois de considerar água e colisão do tabuleiro, sobravam aproximadamente 2,1–2,3 m no centro nas seeds amostradas. Algumas laterais eram bloqueadas pelo terreno. A conclusão também só verificava proximidade/altura e podia aceitar posição parada ou acidente.

## Correção

- O tabuleiro é colocado 16 m acima da maior superfície amostrada na região da ponte e da aproximação, com margens adicionais de colisão. Esse valor não significa 16 m de tolerância para o centro do avião: há margens para água, chão e régua.
- Centro acompanha o rio naquele ponto; apoios se ajustam à altura real do terreno.
- Um aro de papel destaca a passagem. O mapa mostra a altitude do aro, no mesmo referencial do HUD.
- A vegetação e as rochas são retiradas do corredor após gerar o chunk; os sorteios anteriores são preservados.
- Para concluir, o avião precisa cruzar o plano da ponte em voo, com espaço abaixo do tabuleiro e acima da superfície. Acidente ou posição parada não contam.
- **Começar tentativa perto da ponte**, na missão 2 do mapa, inicia uma aproximação alinhada. A câmera acompanha imediatamente; o ponto seguro fica nessa aproximação para reduzir o custo de falhar. Não existe piloto automático: física, vento e comandos continuam ativos.
- Conclusão recebe mensagem, som e carimbo no mapa. Um sopro é recarregado quando há espaço. A recompensa não repete ao recarregar o save ou cruzar novamente uma missão já concluída.

Os IDs das missões e o formato do save permanecem os mesmos. Comparação com o commit anterior em 81 chunks de três seeds confirmou terreno, índices/cores de malha, coletáveis e térmicas iguais. Apenas as pontes e a vegetação/rochas do corredor mudam.

## Como passar

1. Abra Mapa e escolha missão 2.
2. Use **Começar tentativa perto da ponte** para aprender a aproximação.
3. Vise o aro, use correções curtas de direção e mantenha o nariz quase nivelado.
4. Cruze por baixo da régua, sem tocar nela ou na água. O aviso de conclusão confirma o sucesso.

Também é possível chegar voando normalmente. A opção de tentativa é uma ajuda voluntária, não uma exigência.

## Validação

22 testes Node passaram. Três novos testes verificam vão/corredor em várias seeds, travessia real sem sucesso em acidente/posição parada e 36 passagens das três pontes em 12 seeds com a física real, luz diurna fixa e sem usar sopros. Isso não certifica toda condição de chuva/noite ou toda condução possível.

Runner `npm run test:bridge`: botão de tentativa, passagem real, mensagem de sucesso e save após reload em desktop 1365 × 768 e toque emulado 390 × 844, Edge/SwiftShader, sem erros de JavaScript/shader.

| Revisão | Desktop | Celular emulado |
| --- | --- | --- |
| Aproximação | [Tentativa](images/bridge-attempt-desktop.png) | [Tentativa](images/bridge-attempt-mobile.png) |
| Sucesso | [Concluída](images/bridge-success-desktop.png) | [Concluída](images/bridge-success-mobile.png) |

## Direção para mais diversão

Priorizar objetivos claros, falha com tentativa próxima e reconhecimento de progresso. Uma sequência futura pode ensinar uma habilidade por vez: encontrar uma térmica, usar a corrente, atravessar a ponte e pousar. Dificuldade ajustável é outra evolução possível; ainda não foi criado um menu de níveis nesta tarefa. A orientação de permitir experiências de desafio adequadas a diferentes jogadores também aparece no [guia Microsoft XAG 108](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/108).

Esta entrega melhora o ciclo da missão 2. As propostas de sequência e níveis são sugestões, não recursos implementados. Entrega aprovada pelo usuário para commit e envio ao GitHub.
