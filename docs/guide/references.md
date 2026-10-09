# Referências

Código externo usado **apenas como consulta** — nunca como dependência ([ADR-0003](../decisions/0003-quasar-como-referencia.md)).

## Quasar (`~/repos/quasar`)

Clone raso de `quasarframework/quasar` (branch `dev`). É a referência de **API, comportamento e documentação** dos componentes.

| O quê | Onde | Uso |
|---|---|---|
| Implementação | `ui/src/components/<comp>/Q<Comp>.js` | Comportamento, casos de borda |
| **API declarada** | `ui/src/components/<comp>/Q<Comp>.json` | Props, slots, eventos, métodos — ponto de partida da nossa API |
| Mixins da API | campo `"mixins"` do JSON → ex.: `ui/src/composables/private.use-field/use-field.json`, `ui/src/components/input/use-mask.json`, `ui/src/composables/use-form/private.use-form.json` | A API completa de um componente = JSON próprio + mixins |
| Composables | `ui/src/composables/` | Lógica compartilhada (ex.: `use-form/use-form-child.js`) |
| Testes | `ui/src/components/<comp>/*.test.js` | **Roteiro** dos nossos testes (casos a portar) |
| Estilo | `ui/src/components/<comp>/Q<Comp>.sass` | Medidas e estados (adaptar para tokens) |
| Documentação | `docs/src/pages/vue-components/<comp>.md` | Estrutura das páginas do `apps/docs` |
| Exemplos | `docs/src/examples/Q<Comp>/*.vue` | Exemplos vivos a reproduzir no `apps/docs` |

Mapeamento de API Vue → Leptos:

| Quasar | Leptos (`<nome>-ui`) |
|---|---|
| prop `kebab-case` | prop `snake_case` |
| `v-model` | `RwSignal<T>` (prop `value`/`model`) |
| evento `@foo-bar` | prop `on_foo_bar: Callback<…>` |
| slot nomeado | `#[slot]` |
| métodos via `ref` | *handle* `Copy` passado por prop |
| `provide`/`inject` | `provide_context`/`use_context` |

## Implementações anteriores do tema scandi

Consultar, não depender.

| Projeto | Caminhos | O que tem |
|---|---|---|
| `~/repos/omg-data-sync/frontend` | `style/tokens/` (primitivos → temas), `uno.config.ts` (shortcuts), `src/components/`, `scripts/check-shortcuts.mjs`, `docs/frontend/overview.md` | Tema scandi completo para desktop; componentes Btn, Card, Tag, Dialog, Segmented, DataTable, DetailList, campos de formulário… |
| `~/repos/ws-jodias-concurso/apps/passei-app` | — | O mesmo tema adaptado para leitura no celular: coluna única, corpo maior, barra inferior fixa |
