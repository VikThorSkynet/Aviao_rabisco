# Estilo visual: referência da Rota e alinhamento do Livre

Planejamento publicado na [issue #1](https://github.com/VikThorSkynet/Aviao_rabisco/issues/1). O alinhamento visual ainda está pendente; este documento versiona o mapeamento e seus critérios de aceite.

## Objetivo

Fazer o **Modo Livre parecer parte do mesmo jogo que o Modo Rota**, usando a Rota atual como referência gráfica: caderno ilustrado, papel claro, traços de lápis/caneta, cores pastel e cenário alegre com espaço para respirar.

Solicitação: mapear o estilo da Rota e tornar o Livre fiel a ele graficamente e em estilo. Esta issue registra o diagnóstico e a implementação futura; a criação da issue não significa que o alinhamento já foi feito.

**Base analisada:** versão 3.0.0, commit [`48fff5b`](https://github.com/VikThorSkynet/Aviao_rabisco/commit/48fff5b195f0961a9ff3f39d1c4372c249376463). O mapeamento considera os estilos finais da Rota, incluindo os overrides do jardim. Não tomar o primeiro bloco antigo de CSS, mais escuro e carregado, como referência efetiva.

## Identidade visual a preservar

“Um avião dobrado à mão atravessando um jardim desenhado em papel.”

- Ilustração de caderno e desenho artesanal, com irregularidade discreta e intencional.
- Papel creme/esverdeado claro com fibras/grão de baixa intensidade.
- Céu azul pastel em degradê, nuvens desenhadas e sol de lápis sorridente.
- Tinta cinza azulada, preenchimentos suaves e hachura que substitui sombras volumétricas convencionais.
- Árvores com tronco desenhado, copa irregular, rabiscos internos e variações verde, dourada, rosa e lilás.
- Elementos de papelaria e formas reconhecíveis como desenhos, sem aparência de objetos genéricos de um motor 3D.
- Interface como pequenos cartões de papel, cantos irregulares, fita e tipografia manuscrita.
- Animações leves: pequenas variações de traço, movimentos suaves e feedback breve.
- Cor e detalhe servem à leitura do avião, das correntes e das passagens; o fundo deve continuar calmo.

## Mapeamento do estilo da Rota

| Camada | Referência concreta na Rota | Direção para o Livre |
| --- | --- | --- |
| Paleta-base | `LOOK.paper = #eef4e4`; tinta `#40515b`. CSS final: papel `#fff8e8`, acento `#d77c62`, azul `#4c8897` | Extrair tokens comuns; evitar paletas independentes em cada modo |
| Céu | `skyTexture()`: degradê `#cfeaf2 → #eaf4ed → #fff5da`, fibras sutis, nuvens desenhadas e sol sorridente fora do centro | Substituir o fundo diurno uniforme por uma composição de papel ilustrado; adaptar noite/clima a essa linguagem |
| Chão/papel | `groundTexture()`: base `#f6f5de`, fibras leves, pequenos tufos de grama e linhas azuladas muito discretas | Manter relevo 3D, mas tratá-lo como superfície de papel/lápis; curvas de nível continuam, sem competir com o voo |
| Materiais | `hatchMat()`: tons simplificados e hachura em camadas, com tinta e papel compartilhados | Aplicar família visual equivalente ao terreno e aos objetos importantes, evitando sombreamento realista independente |
| Contorno | `hullVert`/`hullFrag` e `inked()`: contorno irregular em espaço de tela; `LOOK.outlinePx = 1.3` | Contorno coerente em silhuetas próximas, com LOD/alternativa barata; não aplicar hull caro a todo o mapa |
| Linhas | `LineSegments2`/`LineMaterial`, estrelas/círculos com jitter e overshoot; avião com linha de 3 px | Garantir espessura legível e irregularidade leve em avião, objetos e símbolos; não depender apenas de linhas WebGL finas |
| Line boil | `LOOK.boilFps = 5`; `boilTick()` alterna frames de nuvem e desloca levemente o contorno do avião | Adotar variação de desenho discreta, sem tremor de câmera, jitter de física ou ruído forte em toda a tela |
| Árvores | `treeTexture(variant)`: quatro paletas; tronco marrom, copa irregular preenchida, loops internos translúcidos e segundo traço deslocado | Reutilizar a linguagem/gerador de textura, com atlas ou instancing e variações por seed |
| Paletas das árvores | Verde `#b2d6a4 / #477e63`; dourado `#efd696 / #ad9355`; rosa `#efb4a9 / #b77772`; lilás `#bfc9e6 / #7b83ab` | Tornar a floresta cromaticamente compatível com o jardim, preservando identidade dos biomas |
| Composição | `scatterScenery()`: bosques e flores laterais, centro aberto e elementos de papelaria esparsos | Distribuição com clareiras e corredores; adaptar ao mundo aberto, sem copiar a rota linear ou transformar a decoração em bloqueio visual |
| Nuvens | `cloudTexture()`: sprites preenchidos como papel, contorno e hachura; variantes com dois frames | Nuvens térmicas e névoa devem ser desenhos, não apenas esferas lisas |
| Avião | `makePlane()`: papel branco, dobras e quilha reconhecíveis, hachura, contorno irregular e rastro sutil | Compartilhar o asset visual e seu acabamento; preservar física/escala de colisão do Livre |
| Sombra | `shadowTexture()` e sombra suave desenhada, dependente de altitude | Acrescentar linguagem equivalente no relevo, sem sombra realista dura; ajustar à altura local |
| Tipografia | CSS declara `Patrick Hand` para texto e `Caveat` para destaques | Mesma família visual no HUD, mapa, ajuda e botões; verificar fonte efetivamente carregada e fallback |
| Cartões/HUD | `.sketch`: preenchimento quase opaco de papel, borda fina, cantos assimétricos, rotação leve, sombra pequena e fita | HUD/mapa do Livre devem pertencer à mesma família de cartões; conservar as informações próprias do Livre |
| Feedback | Animações curtas, notificações pequenas e cores suaves; `gentlePop`, textos que sobem e fade | Aplicar aos sopros, descoberta, pouso e recuperação, sem adicionar pressão por pontos/combo |
| Câmera | FOV 65 na Rota, câmera próxima e acompanhamento suave; avião é foco central | Comparar escala percebida, enquadramento e contraste, não copiar números isoladamente |

### Observação sobre as fontes

O CSS da Rota declara `Patrick Hand` e `Caveat`, mas a distribuição atual não inclui arquivos de fonte nem `@font-face` para elas. Portanto, **não assumir que esses nomes são a fonte realmente renderizada**: o fallback depende do ambiente. O alinhamento deve resolver tipografia e carregamento de forma consistente, preferencialmente com fontes locais/licenciadas no HTML portátil ou um fallback explicitamente escolhido, mantendo funcionamento offline.

## Diferenças atuais do Livre

| Aspecto | Implementação atual | Diferença visível |
| --- | --- | --- |
| Fundo | `WorldView.update()` muda uma cor uniforme com o sol | Falta o céu ilustrado, o degradê de papel e o sol da Rota |
| Terreno/objetos | `MeshStandardMaterial`, luz hemisférica/direcional e geometrias facetadas | Predomina volume 3D convencional, mesmo com hachura leve no terreno |
| Árvores | Uma textura verde com elipse e vários loops próximos ao contorno; planos cruzados | Copas mais repetitivas e pouca variação em comparação ao jardim de quatro cores |
| Nuvens/névoa | Esferas/instancing com material básico | Silhuetas e acabamento não acompanham os sprites desenhados da Rota |
| Avião | Outro modelo, `MeshStandardMaterial` e `LineBasicMaterial` | Dobras, proporções e tratamento do traço diferem da Rota |
| Coletáveis | Octaedros coloridos para penas/folhas | Parecem cristais; falta representar pena e folha como desenhos reconhecíveis |
| Interface | Georgia/serif nos destaques, system-ui no HUD, cartões e botões mais regulares | Aproxima-se de painel convencional, sem a mesma escrita/fita/cantos da Rota |
| Movimento do desenho | Balanço e rotações suaves, sem o mesmo sistema de boil/frames | A vida do mundo existe, mas o acabamento artesanal não é compartilhado |
| Água, vila e balões | Geometria simples e materiais próprios | Elementos novos precisam de uma extensão coerente da linguagem da Rota |

Captura do Livre na versão analisada:

![Modo Livre atual](https://raw.githubusercontent.com/VikThorSkynet/Aviao_rabisco/48fff5b195f0961a9ff3f39d1c4372c249376463/docs/images/modo-livre.png)

## Referências no código

### Rota — referência visual

- [CSS final e cartões](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L6-L8): observar a cascata e os overrides posteriores do jardim.
- [LOOK e paleta-base](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L107-L114).
- [Shaders de hachura/contorno e linhas](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L148-L270).
- [Papel, chão e céu](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L359-L483).
- [Árvores de quatro variantes e flores](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L484-L604).
- [Composição e clareiras](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L605-L667).
- [Nuvens desenhadas](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L669-L725).
- [Avião e rastro](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L965-L1020).
- [Boil, sombra e enquadramento](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L3184-L3193) e [updateVisuals](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L3372-L3437).
- [Grão e qualidade](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/route.js#L3584-L3607).

### Livre — pontos de integração

- [Assets e terreno](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/render/assets.js).
- [Cena, árvores, objetos, nuvens e câmera](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/render/world.js).
- [CSS do menu e HUD](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/style.css).
- [Mapa e álbum](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/ui/map.js) e [interfaces do Livre](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/modes/free.js).
- [Elementos de clima e vida](https://github.com/VikThorSkynet/Aviao_rabisco/blob/48fff5b195f0961a9ff3f39d1c4372c249376463/src/life/life.js).

## Implementação sugerida

### 1. Definir uma linguagem compartilhada

- [ ] Extrair paleta, tinta, papel, tipografia, espessuras e intensidade de grão para um tema comum.
- [ ] Criar materiais/helpers visuais compartilhados em `src/render/` e estilos comuns de cartão em CSS.
- [ ] Extrair os helpers da Rota de forma incremental, preservando sua aparência e seus sistemas atuais; não importar `startRoute()` para inicializar materiais.
- [ ] Centralizar textura/cor e configurar color space das texturas de canvas, evitando diferenças entre modos.
- [ ] Garantir tipografia consistente e offline, com licenças de fontes quando houver novos assets.

### 2. Prioridade de maior impacto visual

- [ ] Céu ilustrado e papel diurno compatíveis com Rota.
- [ ] Mesmo acabamento de avião: dobras, branco de papel, tinta e linha irregular legível.
- [ ] Árvores com as quatro variantes da Rota, copa irregular e rabiscos internos; preservar instancing/atlas e variação determinística.
- [ ] Nuvens de desenho, incluindo indicadores de térmicas.
- [ ] HUD, mapa, ajuda e notificações em cartões da mesma família gráfica.

### 3. Estender a linguagem ao mundo aberto

- [ ] Estilizar terreno, rochas e picos com hachura, papel e contorno seletivo; manter curvas de nível úteis e discretas.
- [ ] Desenhar penas e folhas reconhecíveis, substituindo o aspecto de cristal dos coletáveis.
- [ ] Água como tinta azul com linhas onduladas; cachoeira e névoa com traço/texture boil controlado.
- [ ] Casas, pontes-régua, balões, aves e barcos com acabamento de papelaria/rabisco consistente.
- [ ] Adaptar noite, chuva e arco-íris mantendo textura de papel, traço e legibilidade.
- [ ] Usar flores/grama e adereços pontualmente, com clareiras e corredores de voo livres visualmente.
- [ ] Adicionar rastro e sombra ilustrada proporcionais ao contexto do Livre, sem criar ruído excessivo.

### 4. Polir com orçamento de desempenho

- [ ] Boil de baixa amplitude/cadência, sem atualizar texturas grandes ou criar objetos por frame.
- [ ] Qualidade leve mantém a identidade visual mesmo com menos hachura, detalhe e objetos distantes.
- [ ] Manter pools, Worker, instancing, LOD e descarte correto de recursos.
- [ ] Avaliar névoa e enquadramento em conjunto: esconder streaming sem transformar o cenário num fundo lavado.

## Limites de escopo

- A fidelidade pedida é gráfica. O Livre continua com mundo aberto, mapa, dia/noite, clima, térmicas, pouso e relançamento.
- Não adicionar pontos, combo ou game over ao Livre para imitar o HUD da Rota.
- Não trocar seed, geração, IDs persistidos, colisões ou parâmetros de voo como efeito colateral da alteração visual.
- Não copiar o chão plano, os números de densidade ou as distâncias da Rota literalmente para o mapa aberto. Reusar a linguagem e adaptar composição/LOD ao terreno.
- Elementos sem equivalente direto na Rota devem parecer desenhados pela mesma mão, em vez de receber uma estética 3D independente.

## Critérios de aceite

- [ ] Comparação lado a lado deixa claro que ambos os modos pertencem ao mesmo jogo: papel, traço, árvores, avião e cartões têm a mesma família visual.
- [ ] Céu diurno do Livre tem tratamento ilustrado, degradê/papel e detalhes alegres compatíveis com a Rota.
- [ ] Árvores apresentam variação pastel, tronco desenhado, copa irregular e loops internos; não predominam elipses verdes idênticas.
- [ ] Avião permanece legível contra vegetação, água, terreno claro e noite, com dobras e contorno apropriados.
- [ ] HUD/mapa/álbum/ajuda têm cartões e tipografia coerentes; fontes/fallbacks funcionam no HTML portátil sem internet.
- [ ] Nuvens, água e objetos novos mantêm linguagem de rabisco; não se destacam como sólidos lisos/genéricos de motor 3D.
- [ ] Textura e boil são sutis, sem voltar à poluição visual das versões anteriores.
- [ ] Capturas comparativas da Rota e do Livre são anexadas ao trabalho, em **1365 × 768** e **390 × 844**, incluindo início de voo, floresta, cachoeira/vila, mapa e noite no Livre. Mesma qualidade e condições diurnas comparáveis; registrar seed/versão para repetir o Livre.
- [ ] Rota mantém sua aparência e funciona após a extração de helpers; Livre mantém pouso, relançamento, recuperação, coleta e persistência.
- [ ] `npm test`, `npm run docs:check`, `npm run memory:check` e `npm run release` passam; console sem erros de shader/Worker.
- [ ] Registrar custo de renderização e estabilidade de recursos antes/depois em alta e leve. Não certificar fps físico usando somente emulação/SwiftShader.
- [ ] Atualizar documentação, memória e changelog com o tema compartilhado e a validação efetivamente realizada.

## Sugestão de entrega

Separar em mudanças revisáveis: **tema + tipografia + cartões**, **céu + avião + árvores/nuvens**, **materiais e elementos do mundo**, **polimento e validação comparativa**. A issue só deve ser concluída depois da comparação visual; trocar apenas algumas cores não atende ao objetivo.

## Regra de conclusão das tarefas

Ao concluir cada tarefa desta implementação, apresentar mudanças e validação e perguntar **"Posso fazer o commit dessas alterações?"**. Aguardar autorização explícita antes de fazer commit. Se o usuário já solicitou o commit das alterações na tarefa atual, prosseguir após validar sem repetir a confirmação. Autorizações anteriores não se estendem a novas tarefas; push/deploy exigem autorização aplicável. Esta regra também está registrada em AGENTS.md e na memória persistente do repositório.
