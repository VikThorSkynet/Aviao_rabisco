# Mundo procedural

## Seed e coordenadas

`WorldModel` limpa espaços externos, limita a seed a 64 caracteres e usa `jardim-dos-ventos` quando vazia. Hash, PRNG e simplex ficam em `src/shared/math.js`. `coordinateSeed()` combina seed e coordenadas.

Mesma seed e mesma versão do gerador repetem o mundo. Alterar algoritmo, ordem de sorteios ou parâmetros pode mudar o mapa e seus IDs; avalie compatibilidade dos saves.

| Grandeza | Convenção |
| --- | --- |
| Mundo | 4096 × 4096 m |
| X / Z | −2048 a +2048 |
| Chunk | 128 × 128 m |
| cx / cz | −16 a 15 |
| Chave | `cx,cz` |
| Vertical | Y |
| Exploração | 64 × 64 células de 64 m |

Perto da borda, a física reorienta para dentro e limita a posição. Traços de margem indicam o fim da folha.

## Relevo

Combina fBm de simplex, cristas a partir de `1 - abs(noise)` e máscara de baixa frequência. O vale principal acompanha linha sinuosa; a vila tem área suavizada.

- `rawHeight(x,z)`: altura antes de escavar água.
- `heightAt(x,z)`: altura final, incluindo leitos e lagos.
- `normalAt(x,z)`: diferenças finitas, normal e inclinação.
- `windNormal(x,z)`: cache de normais em grade de 6 m.

Worker e física consultam `heightAt()`. Malhas distantes usam menos vértices; colisão continua no modelo completo. A interpolação visual pode diferir em encostas e leitos estreitos.

## Água

O rio principal garante três quedas em Z −900, 0 e 900. Sua altura desce e inclui degraus; X é sinuoso e depende da seed.

Vinte e cinco nascentes procuram terreno alto. Afluentes escolhem o mais baixo entre oito vizinhos. Depressões podem criar lagos; desníveis acima de oito metros podem criar quedas adicionais, até doze totais. Há ainda um lago grande e um escondido.

Segmentos de rio são indexados em células de 64 m. `waterAt()` consulta lagos e segmentos locais. `heightAt()` escava e suaviza leitos. O visual usa traços de shader, névoa e respingos reutilizados.

Não existe enchimento/transbordamento dinâmico, erosão por gotas ou conservação de volume. O vale principal é esculpido para garantir navegação e quedas; afluentes seguem o relevo de forma simplificada.

## Biomas e objetos

A classificação combina água, distância da vila/vale, altura, inclinação e ruído. Os seis biomas são planície, floresta, serra, vale das cachoeiras, lago e vila.

Vegetação usa tentativas com rejeição por distância, aproximando Poisson disk. Espaçamento mínimo de 11 m e exclusão do corredor principal evitam amontoar árvores. Florestas têm maior densidade; encostas íngremes recebem rochas.

Um chunk retorna arrays de posição, cor e índices e listas de árvores, rochas, quatro coletáveis, térmicas, rajadas e adereços. Não contém objetos Three.js nem funções.

## Streaming

| Qualidade | Raio | Máximo de blocos | Segmentos perto / longe | Pixel ratio máximo |
| --- | --- | --- | --- | --- |
| Alta | 3 | 49 | 24 / 8 | 1,5 |
| Leve | 2 | 25 | 16 / 6 | 1 |

É uma vizinhança quadrada, reduzida nas bordas. O centro 3 × 3 usa resolução próxima. Mover-se ou trocar Q regenera LOD quando necessário. Conteúdo determinístico permanece igual para uma coordenada.

Água, marcos e alguns objetos globais permanecem em memória. Não existe costura geral/skirt entre LODs; investigar frestas, especialmente com 16/6.

## Configuração

`CFG_FREE` concentra a intenção, mas alguns valores ainda são hardcoded em consumidores. `step`, qualidade, seed, nascentes, máximo do relevo e chance de penas têm consumidores diretos. Campos como `ridgeWeight`, `lakeMin`, `flight.pitchRate` e partes da configuração de vida não controlam todos os valores equivalentes em runtime.

Antes de mudar um parâmetro, procure seus consumidores com `rg`. Alterar só `world.size` não generaliza mapa, física, limites de chunks e água; esses sistemas usam dimensões atuais em outros pontos.

## Extensão

Novo adereço exige dados determinísticos, visual e eventual colisão. Fonte de vento exige alcance e consulta local. Marco exige ID estável e apresentação no mapa. Mudanças de IDs devem seguir o [contrato de persistência](PERSISTENCIA.md).
