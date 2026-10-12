# `leptos-nebula` — visão geral

Biblioteca de componentes Leptos (0.8; a lib não fixa CSR/SSR — ver [ADR-0007](../decisions/0007-press-csr-e-ssg.md)) + tokens de tema + preset UnoCSS. Crate `leptos-nebula` em `apps/leptos-nebula`; prefixo `lx` ([Convenções](../guide/conventions.md#prefixo-lx)).

## Tokens

Três camadas — trocar o tema não exige mudar componentes:

| Camada | Exemplos | Quem usa |
|---|---|---|
| Primitivos (valores crus) | `--lx-p-fjord-600`, `--lx-p-linen-50`, `--lx-p-font-humanist` | Só os arquivos de tema |
| Semânticos, por tema | `--lx-color-surface`, `--lx-color-primary`, `--lx-space-md`, `--lx-radius-md`, `--lx-font-size-sm` | Tema do UnoCSS e componentes |
| De componente | `--lx-btn-radius`, `--lx-card-shadow`, `--lx-header-bg` | Shortcuts de cada componente |

- Um tema novo é **só um arquivo de tokens** (`[data-theme="<nome>"]` redefinindo semânticos e de componente).
- O tema ativo é `data-theme` no `<html>`; o modo, `data-mode="light|dark"`. Controlado por uma store de tema (contexto Leptos), persistida no `localStorage`.
- Temas: ver [Temas](#temas). Arquivos: `apps/leptos-nebula/style/tokens/primitives.css`, `tokens/themes/scandi.css`, `base.css`. O recuo horizontal de `Item` (normal e `dense`) e de `ItemLabel header` vem de um único token de componente, `--lx-item-padding-x` (`dense` reduz só a altura, como no Quasar). Tokens de realce de código (`--lx-code-bg/text/comment/keyword/string/number/function/type/punct`) são usados pelo `leptos-press`. Cores com os nomes do Quasar (`primary`, `secondary`, `positive`, `negative`, `info`, `warning`) + `neutral`, cada uma com par `on-*` e `-soft`; a classe de cor do componente (`lx-tone-primary`…) só define `--lx-tone*`, e o design (`lx-btn-outline`…) lê essas variáveis. Origem do scandi: `~/repos/omg-data-sync/frontend/style/tokens/` ([Referências](../guide/references.md)).

## Temas

Três temas iniciais, todos com modo claro e escuro. Trocar de tema = trocar o arquivo de tokens ativo (`data-theme` no `<html>`); **nenhum componente muda**.

| Tema | `data-theme` (proposto) | Caráter | Referência | Situação |
|---|---|---|---|---|
| **Scandi** | `scandi` | Minimalista escandinavo: linho/tinta/fiorde/musgo/âmbar/argila, muito respiro, bordas finas, quase sem sombra, um acento frio | `~/repos/omg-data-sync/frontend/style/tokens/` | **Implementado** (claro/escuro; `.plan/0001`) |
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

O UnoCSS lê `.rs` como texto, então classes usadas dentro de um crate dependência não são vistas pelo app. Por isso o crate entrega **CSS pré-gerado** e exporta um **preset** ([ADR-0005](../decisions/0005-entrega-do-css.md), aceita):

```rust
use leptos::prelude::*;
use leptos_meta::provide_meta_context;
use leptos_nebula::{UiStyles, provide_theme};

#[component]
fn App() -> impl IntoView {
    provide_meta_context();
    provide_theme();      // data-theme/data-mode no <html>, persistido em localStorage
    view! { <UiStyles /> /* …Layout, Header, Drawer… */ }
}
```

- `UiStyles` injeta `leptos_nebula::CSS` (o `style/dist/ui.css`, via `include_str!`) num `<style>` do `<head>`. Zero arquivos para configurar no app; funciona em Trunk, WebView e SSG.
- Alternativa (só *path deps*): `<link data-trunk rel="css" href="…/apps/leptos-nebula/style/dist/ui.css" />`.
- Para usar os shortcuts/cores/ícones **no markup do app**: no `uno.config.ts` do app, `presets: [presetWind3({ preflight: false }), presetUi()]` com `import { presetUi } from 'leptos-nebula/preset'` (dependência `"leptos-nebula": "workspace:*"` no `package.json` do app). O app só gera o CSS do que ele mesmo usa; ícones lucide exigem `@iconify-json/lucide` no app.
- Tema próprio do app: um CSS de tokens extra, carregado **depois** do `ui.css`.
- O `ui.css` é **gerado e versionado** (`moon run leptos-nebula:css`); `css-check` e `css-fresh` garantem shortcuts válidos e arquivo em dia.
- Modo escuro: `data-mode="dark"` (store) ou, sem `data-mode`, `@media (prefers-color-scheme: dark)` — sem "piscar" no SSG. `data-mode` ausente só ocorre antes de a store rodar.

## Store de tema

`provide_theme()` (raiz do app) / `use_theme() -> ThemeStore` (`Copy`): `mode: RwSignal<Mode>` (`Light`/`Dark`/`Auto`, segue `prefers-color-scheme` e reage a mudanças) e `theme: RwSignal<Theme>` (`Scandi`; `Material` e `Glass` existem no enum mas só são aceitos quando tiverem tokens). Tudo que toca `window`/`localStorage` roda num `Effect` (chaves `lx.theme`, `lx.mode`). Lógica pura (parse, resolução de `Auto`) é testada no host.

## Regras dos componentes

Ver [Convenções → Componentes Leptos](../guide/conventions.md#componentes-leptos-nome-ui). Em resumo: classes literais (`match`, nunca `format!`), nada de shortcut com prefixo de variante, estados exclusivos como shortcuts completos, tema do UnoCSS só com `var(--…)`, ícones lucide com coleção explícita.

## Componentes

Todos **parciais**: API com os nomes do Quasar (`snake_case`), só as props e slots listados no doc comment de cada componente (que também diz o que **ainda não** existe). Código em `apps/leptos-nebula/src/components/`.

| Componente | ≈ Quasar | Situação |
|---|---|---|
| `Icon` | QIcon | Parcial: `name` (classe literal `i-lucide-…`), `size` |
| `Btn` (+ `BtnDesign`, `BtnType`) | QBtn | Parcial: `label`, `icon`, `icon_right`, `color`, `design` (`Unelevated`/`Outline`/`Flat`), `round`, `dense`, `href`/`target` (`<a>`), `type_`, `disable`, `aria_label`, `on_click` |
| `Badge` | QBadge | Parcial: `label`, `color`, `outline`, `align` |
| `Banner` (+ slots `BannerAvatar`, `BannerAction`) | QBanner | Parcial: `color`, `dense`, `rounded` |
| `Card`, `CardSection`, `CardActions` | QCard… | Parcial: `flat`, `bordered`, `square`; `horizontal`; `align`, `vertical` |
| `Separator` | QSeparator | Parcial: `vertical`, `spaced`, `inset` (bool) |
| `List`, `Item`, `ItemSection`, `ItemLabel` | QList… | Parcial: `bordered`, `separator`, `dense`, `padding`; `href`, `active`, `clickable`, `dense`, `inset_level`; `avatar`, `side`; `header`, `caption`, `lines` |
| `Layout`, `Header`, `Toolbar`, `ToolbarTitle`, `Drawer`, `PageContainer`, `Page` | QLayout… | Parcial: estrutura fixa (cabeçalho em cima, drawer ao lado, **sem** `view`); `Drawer`: `show`, `side`, `width`, `breakpoint`, `bordered`, `show_if_above` |
| `Tabs`, `Tab`, `TabPanels`, `TabPanel` | QTabs… | Parcial: `value: RwSignal<String>`, `align`, `dense`; `name`, `label`, `icon` |
| `MarkupTable` | QMarkupTable | Parcial: `dense`, `flat`, `bordered`, `separator`, `wrap_cells` |
| `ThemeSwitcher` | — (nosso) | Claro → escuro → auto pela store |
| `Form` + `use_form_child` | QForm, `useFormChild` | Planejado — [Formulários](./forms.md), `.plan/0004` |
| `Field` | QField | Depois do Form |
| `Input` | QInput | Depois do Field |
| `Select` e demais campos | QSelect… | Depois |
| Dialog, Segmented, DataTable, DetailList, Feedback, PageHeader, BottomBar, Progress, Stat | QDialog… | v0, ordem a definir |
