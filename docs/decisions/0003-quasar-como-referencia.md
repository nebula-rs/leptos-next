# ADR-0003: Quasar como referência de API, comportamento e documentação

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

O objetivo é dar ao Leptos o que o Quasar dá ao Vue. O Quasar tem API declarada em JSON por componente, testes extensos e documentação madura — um roteiro pronto.

## Decisão

- Um clone raso do Quasar fica em `~/repos/quasar`, **fora** deste repositório, apenas para consulta.
- A API de cada componente parte do `Q<Comp>.json` **e dos mixins** que ele declara; os testes do Quasar são o roteiro dos nossos; a página `docs/src/pages/vue-components/<comp>.md` é o modelo da página na documentação pública (`apps/docs`).
- Nomes e semântica seguem o Quasar quando fizer sentido, com o mapeamento Vue → Leptos de [Referências](../guide/references.md). Desvios são deliberados e documentados.
- Nenhum código, CSS ou asset do Quasar é copiado para cá.

## Consequências

- Quem implementa um componente lê primeiro os arquivos do Quasar correspondentes.
- O visual não segue o Quasar: segue os tokens do tema (scandi).
