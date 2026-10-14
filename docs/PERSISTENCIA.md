# Persistência do jogador

A memória de desenvolvimento fica em `.memory/`, versionada no Git. Os saves ficam no `localStorage` do navegador. São sistemas distintos.

## Chaves

| Chave | Valor | Responsável |
| --- | --- | --- |
| `rabisco_seed` | Última seed escolhida | main.js |
| `rabisco_settings` | JSON de opções | config.js |
| `rabisco_free_v1_<seed>` | JSON de progresso por seed | ui/progress.js |
| `rabisco_best_pts` | Número em string | Rota |
| `rabisco_best_dist` | Número em string | Rota |
| `rabisco_best_pct` | Número em string | Rota |

Não há envio de saves ao GitHub. O repositório não guarda localStorage pessoal.

## Formato do Livre — v1

A versão está no prefixo da chave; o JSON não possui `schemaVersion`. Este exemplo ilustra o formato, não uma partida validada:

```json
{
  "album": ["Bando de papel"],
  "visited": ["30,13", "31,13"],
  "collected": ["0:-9:pena0"],
  "discovered": ["cachoeira"],
  "thermals": ["termal-0:-9:0"],
  "challenges": ["ponte"],
  "records": { "altitude": 250, "airtime": 90, "distance": 1200 },
  "safe": { "x": 40, "y": 200, "z": -1100, "yaw": 3.14159 },
  "time": 60
}
```

| Campo | Significado |
| --- | --- |
| album | Nomes de figurinhas |
| visited | Células `x,z`, índices 0–63 |
| collected | IDs dos coletáveis consumidos |
| discovered | IDs dos marcos |
| thermals | IDs únicos visitados |
| challenges | cachoeira, ponte e/ou termal |
| records.altitude | Maior Y absoluto, em metros |
| records.airtime | Maior duração de voo, em segundos |
| records.distance | Maior distância horizontal sem pousar, em metros |
| safe | Ponto seguro para recuperação |
| time | Tempo de simulação, em segundos |

As listas viram `Set` durante a sessão para evitar duplicação e retornam a arrays no save.

## Ciclo de salvamento

O Livre salva a cada aproximadamente cinco segundos de simulação e ao abrir mapa, perder foco, ocultar aba, sair ao menu ou disparar `beforeunload`. Encerramento abrupto pode perder os últimos segundos.

Reabrir uma seed restaura progresso e tempo. O ponto seguro é carregado para recuperação, mas o voo inicial começa no spawn, não na posição final anterior. Velocidade, posição corrente, sopros, carga de lançamento e ganho térmico parcial não são persistidos.

## Opções

```json
{
  "quality": "high",
  "sound": true,
  "volume": 0.45,
  "vario": false,
  "dayCycle": true,
  "weather": true,
  "sensitivity": 1
}
```

`readSettings()` combina defaults com o objeto salvo; toque começa em qualidade leve. `sensitivity` existe no formato, mas não está conectada ao controle nem exposta no menu.

## Robustez atual

Erro de parse do progresso retorna defaults. Falha de escrita do progresso mostra mensagem. Isso não equivale a validação completa: JSON válido com tipos incorretos, como `visited: 12`, pode quebrar conjuntos. Leitura da seed e algumas escritas de opções/recordes não têm tratamento uniforme de armazenamento bloqueado.

Armazenamento depende de origem, perfil e navegador. Em `file://`, a separação por caminho varia; a persistência foi testada no Edge. Vite/HTTPS e HTML aberto por arquivo têm origens diferentes. Trocar navegador ou mover o HTML pode criar outro armazenamento. Não há sincronização em nuvem nem exportação/importação no menu.

## Evolução e migração

1. Defina campos e IDs antes de alterar o leitor.
2. Decida se v1 é compatível ou se precisa de nova chave.
3. Leia dados antigos sem apagá-los e valide tipos/limites.
4. Migre campos reconhecidos e escreva a versão nova após sucesso.
5. Teste save ausente, JSON inválido, dados parciais, tipos incorretos e falha de escrita.
6. Atualize este contrato, memória e changelog.

Esse é o procedimento recomendado; um migrador v1→v2 ainda não existe.

## Inspeção e backup manual

Use DevTools → Application/Storage → Local Storage da origem em que joga. Consulta somente leitura:

```js
Object.keys(localStorage).filter(key => key.startsWith('rabisco_'));
```

Copie o valor da chave de uma seed para arquivo local como backup. Não versione saves pessoais. Para resetar, guarde o valor e remova apenas a chave desejada, sem limpar todo o armazenamento da origem.

O campo opcional `thermalGain` guarda de 0 a 30 m de avanço da missão 3. Saves antigos sem o campo começam em zero; conquistas existentes com ID `termal` são preservadas. Pousar ou recuperar não apaga o avanço.
