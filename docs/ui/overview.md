# `<nome>-ui` — visão geral

Biblioteca de componentes Leptos (0.8, CSR) + tokens de tema + preset UnoCSS.

## Tokens

Três camadas — trocar o tema não exige mudar componentes:

| Camada | Exemplos | Quem usa |
|---|---|---|
| Primitivos (valores crus) | `--p-fjord-600`, `--p-linen-50`, `--p-font-humanist` | Só os arquivos de tema |
| Semânticos, por tema | `--color-surface`, `--color-primary`, `--space-md`, `--radius-md`, `--font-size-sm` | Tema do UnoCSS e componentes |
| De componente | `--btn-radius`, `--card-shadow`, `--field-border` | Shortcuts de cada componente |

- Um tema novo é **só um arquivo de tokens** (`[data-theme="<nome>"]` redefinindo semânticos e de componente).
- O tema ativo é `data-theme` no `<html>`; o modo, `data-mode="light|dark"`. Controlado por uma store de tema (contexto Leptos), persistida no `localStorage`.
- Temas: ver [Temas](#temas). Referência do scandi: `~/repos/omg-data-sync/frontend/style/tokens/` ([Referências](../guide/references.md)).

## Temas

Três temas iniciais, todos com modo claro e escuro. Trocar de tema = trocar o arquivo de tokens ativo (`data-theme` no `<html>`); **nenhum componente muda**.

| Tema | `data-theme` (proposto) | Caráter | Referência | Situação |
|---|---|---|---|---|
| **Scandi** | `scandi` | Minimalista escandinavo: linho/tinta/fiorde/musgo/âmbar/argila, muito respiro, bordas finas, quase sem sombra, um acento frio | `~/repos/omg-data-sync/frontend/style/tokens/` | Primeiro — `.plan/0001` |
| **Material Design 3** | `material` | Google Material You: paletas tonais geradas a partir de uma cor-semente, papéis de cor (`primary`, `on-primary`, `primary-container`, `surface-container-*`…), *state layers* (sobreposição de opacidade em hover/foco/pressionado), elevação por tonalidade, escala de formas (cantos) e escala tipográfica (display/headline/title/body/label) | [m3.material.io](https://m3.material.io) | Depois do scandi |
| **Liquid Glass** | `glass` | Linguagem visual da Apple (2025): superfícies translúcidas com desfoque e refração do fundo (`backdrop-filter`), realce especular nas bordas, cantos bem arredondados e concêntricos, controles que "flutuam" sobre o conteúdo | [developer.apple.com/design](https://developer.apple.com/design/) | Depois do scandi |

### O que isso exige da arquitetura de tokens

Os três temas diferem em muito mais que cor; os tokens semânticos e de componente precisam cobrir isso desde o scandi, para os outros temas serem **só arquivos de tokens**:

- **Cor por papel, não por valor:** pares superfície/conteúdo (`surface`/`on-surface`, `primary`/`on-primary`) e níveis de superfície (o MD3 tem vários `surface-container`; o scandi pode repetir valores).
- **Estados:** hover/foco/pressionado expressos por tokens (cor, opacidade de *state layer* ou nenhum) — nenhum componente fixa `:hover { background: … }` com valor próprio.
- **Elevação e efeitos:** sombra, tonalidade de elevação (MD3), `backdrop-filter`, translucidez e realce de borda (glass) como tokens de componente (`--…-card-backdrop`, `--…-card-highlight`…), com valor neutro (`none`) nos temas que não usam.
- **Forma e densidade:** escala de raios (inclusive "pílula"), espessura de borda, alturas de controle e espaçamento por tema.
- **Tipografia:** família, escala e pesos por tema (a escala do MD3 tem nomes próprios; mapear para a nossa).
- **Movimento:** durações e curvas de transição por tema.

### Cuidados

- **Liquid Glass:** `backdrop-filter` custa caro em GPU, principalmente em mobile/WebView — medir. Respeitar `prefers-reduced-transparency` (cair para superfícies opacas) e garantir contraste de texto sobre fundo translúcido.
- **Material Design 3:** a geração de paletas a partir da cor-semente (HCT) é algoritmo, não CSS — decidir se as paletas são pré-calculadas no arquivo de tokens ou geradas por ferramenta no build.
- Componentes que só existem num tema (ex.: FAB do MD3) não entram por causa do tema; o ui segue o catálogo do Quasar.

## Como o CSS chega a quem usa o crate

O UnoCSS lê `.rs` como texto, então classes usadas dentro de um crate dependência não são vistas pelo app. Proposta: o crate entrega **CSS pré-gerado** dos próprios componentes + os arquivos de tokens, e exporta um **preset UnoCSS** com os mesmos shortcuts para o markup do app — [ADR-0005](../decisions/0005-entrega-do-css.md).

## Regras dos componentes

Ver [Convenções → Componentes Leptos](../guide/conventions.md#componentes-leptos-nome-ui). Em resumo: classes literais (`match`, nunca `format!`), nada de shortcut com prefixo de variante, estados exclusivos como shortcuts completos, tema do UnoCSS só com `var(--…)`, ícones lucide com coleção explícita.

## Componentes

| Componente | ≈ Quasar | Situação |
|---|---|---|
| `Icon`, `Btn`, `Badge`, `Banner`, `Card`(+`Section`/`Actions`), `Separator`, `List`/`Item`…, `Layout`/`Header`/`Toolbar`/`Drawer`/`Page`…, `Tabs`/`TabPanels`…, `MarkupTable`, `ThemeSwitcher` | QIcon, QBtn, QBadge, QBanner, QCard, QSeparator, QList/QItem, QLayout…, QTabs…, QMarkupTable | Planejado, **parcial** (o que o `leptos-press` usa) — `.plan/0001` |
| `Form` + `use_form_child` | QForm, `useFormChild` | Planejado — [Formulários](./forms.md), `.plan/0003` |
| `Field` | QField | Depois do Form |
| `Input` | QInput | Depois do Field |
| `Select` e demais campos | QSelect… | Depois |
| Dialog, Segmented, DataTable, DetailList, Feedback, PageHeader, BottomBar, Progress, Stat | QDialog… | v0, ordem a definir |
