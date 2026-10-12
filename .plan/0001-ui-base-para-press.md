# Plano 0001 — Base do `<nome>-ui` (o necessário para o `leptos-press`)

- **Status:** Concluído (2026-10-09) — critério de aceite 5 verificado em screenshots headless (claro, 1280px e 375px); troca de modo/persistência e `Auto` com OS escuro ficam para teste manual
- **Respostas aos bloqueios:** nome provisório mantido (`leptos-ui`), prefixo `lx`, licença `MIT OR Apache-2.0`
- **Data do plano:** 2026-10-09
- **Escopo:** workspace Cargo; crate `<nome>-ui` em `apps/leptos-ui`; pipeline de CSS (ADR-0005); tokens do tema scandi (claro/escuro) — com a arquitetura de tokens já preparada para os outros dois temas iniciais (Material Design 3 e Liquid Glass, implementados depois) — e store de tema; versões **parciais** dos componentes de que o `leptos-press` precisa; um playground temporário para ver tudo funcionando.
- **Depois:** plano 0002 (`leptos-press` v0 + `apps/docs`), plano 0003 (polimento de layout), plano 0004 (`Form`).

> **Nota (2026-10-12):** os crates foram renomeados depois deste plano — `leptos-ui` → `leptos-nebula` (pasta `apps/leptos-nebula`) ([ADR-0008](../docs/decisions/0008-nome-leptos-nebula.md)). Os nomes e caminhos abaixo são históricos.

> Este plano é autocontido: a sessão de implementação não viu a conversa de planejamento.
> Leia antes de começar:
>
> - `docs/project/vision.md` — visão, escopo, decisões pendentes
> - `docs/ui/overview.md` — tokens em três camadas, como o CSS chega ao app
> - `docs/press/overview.md` — o que o `leptos-press` vai pedir do ui (motivo deste plano)
> - `docs/guide/conventions.md` (**regras dos componentes — obrigatórias**) e `docs/guide/pitfalls.md`
> - `docs/guide/references.md` — Quasar em `~/repos/quasar`, tema scandi em `~/repos/omg-data-sync/frontend`
> - `docs/decisions/` — em especial ADR-0003 (Quasar como referência), ADR-0005 (entrega do CSS) e ADR-0007 (CSR + SSG: componentes seguros para SSR)

**"Parcial"** significa: API com os nomes do Quasar, mas só as props e slots listados aqui. As demais entram depois, sem quebrar o que existe. Para cada componente, leia o `Q<Comp>.json` (e mixins) antes de escrever a API — os nomes das props que **forem** implementadas devem coincidir com os do Quasar (em `snake_case`).

---

## 0. Bloqueios — resolver com o usuário ANTES de criar arquivos

| # | Pergunta | Por que bloqueia | Sugestão |
|---|---|---|---|
| 1 | **Nome do projeto e dos crates** | Nome do crate do ui (`leptos-ui` já existe no crates.io — a pasta pode manter o nome) | — |
| 2 | **Prefixo de classes e tokens** (o `q-` / `--q-` do Quasar) | Classes como `btn`, `card` e tokens como `--color-primary` colidem com o CSS do app que usa o crate | 1–3 letras derivadas do nome; ex.: classes `x-btn`, tokens `--x-color-primary` |
| 3 | Licença | `license` no `Cargo.toml`, arquivos `LICENSE-*` | `MIT OR Apache-2.0` |

Ao receber as respostas: substituir `<nome>` em `docs/` (buscar `<nome>`), registrar o prefixo em `docs/guide/conventions.md` e `docs/ui/overview.md`, atualizar `docs/project/vision.md#decisoes-pendentes`. Neste plano, `<px>` = prefixo de classe e `--<px>-` = prefixo de token.

Pré-condição do Moon: **ao menos um commit** (`walkStrategy: 'vcs'`). Se `git log` falhar, peça ao usuário o commit inicial.

---

## 1. Fundação do workspace

> **Já existe (esqueleto criado em 2026-10-09):** `Cargo.toml` da raiz (workspace, `[profile.release]`), `apps/leptos-ui/{Cargo.toml,src/lib.rs,moon.yml}` com o crate `leptos-ui` (nome provisório), features `csr`/`hydrate`/`ssr` repassando ao `leptos`, e as tarefas `check`, `check-wasm`, `check-ssr`, `lint`, `lint-wasm`, `fmt`, `test` — todas passando. Registrado em `.moon/workspace.yml`. Ao resolver o bloqueio 1 (nome), renomeie o crate e as referências (`-p leptos-ui` no `moon.yml`, `[workspace.dependencies]`). O que falta desta etapa: `license`, `package.json` do ui, playground, demais dependências.

### 1.1 Arquivos

```
Cargo.toml                         # [workspace] resolver 3, members, [workspace.package], [workspace.dependencies], [profile.release]
apps/leptos-ui/Cargo.toml          # <nome>-ui
apps/leptos-ui/moon.yml
apps/leptos-ui/package.json        # lado JS: UnoCSS, preset, geração do CSS (membro do pnpm workspace)
apps/leptos-ui/src/lib.rs
apps/leptos-ui/playground/         # app Trunk TEMPORÁRIO (crate do workspace, publish = false) — ver etapa 5
```

### 1.2 `Cargo.toml` (raiz)

- `[workspace.package]`: `version = "0.1.0"`, `edition = "2024"`, `license`, `publish = false` (por ora).
- `[workspace.dependencies]` (versões já no cache do cargo, usadas em `~/repos/omg-data-sync`): `leptos = "0.8"` (o app liga `csr`; a lib **não** fixa `csr`/`hydrate`/`ssr`), `leptos_meta = "0.8"`, `leptos_router = "0.8"`, `web-sys = "0.3"`, `wasm-bindgen = "0.2"`, `console_error_panic_hook = "0.1"`.
- `[profile.release]` **aqui** (num membro é ignorado): `opt-level = "z"`, `lto = true`, `codegen-units = 1`.

### 1.3 Moon e pnpm

- `.moon/workspace.yml`: `leptos-ui: 'apps/leptos-ui'` (o id `docs` é a documentação interna).
- `pnpm-workspace.yaml`: incluir `apps/leptos-ui`.
- `apps/leptos-ui/moon.yml` (`language: 'rust'`, `layer: 'library'`):
  - `css` — gera o CSS (etapa 2); `css-check` — todo shortcut gera CSS; `css-fresh` — regenera e falha se o arquivo versionado mudou (`git diff --exit-code`);
  - `check`, `lint` (`-D warnings`), `fmt --check`, `test` — host **e** `--target wasm32-unknown-unknown` para check/lint; `check-ssr` (etapa 2.3);
  - `playground` — `trunk serve` do playground (`preset: 'server'`).
- `package.json` raiz: `check` passa a incluir `leptos-ui:css-check leptos-ui:css-fresh`.

### Critério de aceite 1
`moon run leptos-ui:check leptos-ui:lint leptos-ui:fmt leptos-ui:test` passa com um `lib.rs` mínimo.

---

## 2. Pipeline de CSS (ADR-0005, opção a)

Problema: o UnoCSS lê `.rs` como texto e não enxerga as classes de um crate dependência. Solução: **o crate entrega o próprio CSS pronto** e exporta um **preset** para o app usar os mesmos shortcuts no markup dele.

### 2.1 Arquivos

```
apps/leptos-ui/
├── uno/preset.ts            # preset exportado: theme → tokens, shortcuts, presetIcons (lucide, coleção explícita)
├── uno.config.ts            # presets: [presetWind3(), presetUi()] — content: src/**/*.rs
├── scripts/build-css.mjs    # gera dist/ui.css (ordem abaixo)
├── scripts/check-shortcuts.mjs  # portar de ~/repos/omg-data-sync/frontend/scripts/check-shortcuts.mjs
└── style/
    ├── tokens/primitives.css
    ├── tokens/themes/scandi.css
    ├── base.css             # tipografia e foco globais mínimos
    └── dist/ui.css          # GERADO — versionado, nunca editar à mão
```

- Ordem em `dist/ui.css`: reset/preflight do UnoCSS → `primitives.css` → `themes/scandi.css` → `base.css` → utilitários/shortcuts gerados a partir de `src/**/*.rs`.
- Versionar `dist/ui.css` é o que torna o crate autocontido (crates.io/git): quem usa o crate não roda Node. `css-fresh` garante que ele está em dia. Registrar em `docs/guide/conventions.md` → "Arquivos gerados".
- Dependências JS (`pnpm`, nunca npm): `unocss`, `@unocss/cli` (ou API `createGenerator`), `@iconify-json/lucide`.

### 2.2 Como o CSS chega ao app (a decidir na implementação, recomendação abaixo)

**Recomendação:** `pub const CSS: &str = include_str!("../style/dist/ui.css")` + componente **`UiStyles`** que injeta um `<style>` via `leptos_meta::Style`.
- Funciona igual com Trunk, no WebView do `<nome>-native` e, no futuro, em SSG (o `leptos_meta` renderiza no `<head>`). Zero configuração de arquivos no app.
- Custo: CSS dentro do wasm (sem cache separado). Medir o tamanho e registrar.
- Alternativa a oferecer também: o arquivo `style/dist/ui.css` referenciado por `<link data-trunk rel="css" href="…">` (só para path deps). Documentar ambas em `docs/ui/overview.md`.
- Um tema próprio do app = um CSS de tokens extra, carregado **depois** do `ui.css`.

### 2.3 Seguro para SSR (ADR-0007)

O `leptos-press` gera páginas estáticas (SSG): os componentes do ui também são renderizados no build, com `leptos/ssr`, e depois hidratados.

- Nenhum acesso a `window`/`document`/`localStorage`/`matchMedia` durante a renderização — só em `Effect` e handlers.
- A lib não liga `csr`/`hydrate`/`ssr` do `leptos`; tarefa `check-ssr` no `moon.yml`: compila o ui no host com `leptos/ssr` (pode ser via feature de teste do próprio crate que repassa `leptos/ssr`).
- Estado só do navegador (modo salvo, largura) entra depois da hidratação. Para o modo escuro não "piscar" no SSG, o `scandi.css` deve responder também a `@media (prefers-color-scheme: dark)` quando `data-mode` estiver ausente; registrar se ainda assim for preciso um script inline mínimo.

### 2.4 Tokens e regras

- **Três temas iniciais** (ver `docs/ui/overview.md#temas`): `scandi`, Material Design 3 (`material`) e Liquid Glass (`glass`). **Este plano implementa só o scandi**, mas os tokens semânticos e de componente devem seguir a seção "O que isso exige da arquitetura de tokens" daquela página — papéis de cor com pares `on-*`, níveis de superfície, estados por token, elevação/efeitos (`backdrop-filter`, realce) como tokens com valor neutro no scandi, escala de raios, tipografia e movimento por tema. Critério: escrever o tema seguinte não pode exigir mudar nenhum componente nem shortcut.
- Portar `~/repos/omg-data-sync/frontend/style/tokens/primitives.css` (só as paletas do scandi) e `themes/scandi.css` (claro **e** escuro). Não portar o tema `corporate`.
- Três camadas (ver `docs/ui/overview.md#tokens`); aplicar o prefixo de token `--<px>-` em semânticos e de componente.
- O tema do UnoCSS só aponta para `var(--…)`. Shortcuts com prefixo `<px>-`; **nenhum** nome começando com prefixo de variante (`empty-`, `hover-`, `focus-`, `first-`, `last-`, `odd-`, `even-`…).
- **Cores (decisão deste plano):** API com os nomes do Quasar — `Color::{Primary, Secondary, Positive, Negative, Info, Warning, Neutral}` (`Neutral` é nosso; Quasar não tem). Mapear para os semânticos do scandi (`positive` → `--…-success`, `negative` → `--…-danger`…). Cor e design são **ortogonais** sem quebrar a regra de "estados exclusivos como shortcuts completos": a classe de cor só define variáveis locais (`--<px>-tone`, `--<px>-tone-contrast`, `--<px>-tone-soft`), e cada design (`unelevated`, `outline`, `flat`) é um shortcut completo que só lê essas variáveis — as duas classes nunca disputam a mesma propriedade.

### Critério de aceite 2
`moon run leptos-ui:css leptos-ui:css-check leptos-ui:css-fresh` passam; `dist/ui.css` contém tokens claro/escuro e os shortcuts usados nos `.rs`.

---

## 3. Store de tema

Referência: `~/repos/omg-data-sync/frontend/src/stores/theme.rs`, `composables/use_theme.rs`; Quasar `ui/src/plugins/dark/` (modelo `Dark.set(true | false | 'auto')`).

- `provide_theme()` / `use_theme() -> ThemeStore` (`Copy`): `mode: RwSignal<Mode>` com `Mode::{Light, Dark, Auto}` (`Auto` segue `prefers-color-scheme` e reage a mudanças) e `theme: RwSignal<Theme>`. `Theme` já nasce pensando nos três temas (`Scandi`, `Material`, `Glass`), mas só expõe/aceita os que tiverem arquivo de tokens — neste plano, só `Scandi`; `data-theme` já é escrito.
- Aplica `data-theme`/`data-mode` (resolvido para `light`/`dark`) no `<html>`; persiste no `localStorage` (chave com o prefixo).
- `web_sys::Storage`/`MediaQueryList` são `!Send` → `StoredValue::new_local` (ver armadilhas).
- Lógica pura (parse/serialização de `Mode`, resolução de `Auto`) testada no host.

---

## 4. Componentes parciais

Ordem sugerida = ordem da tabela. Cada um: arquivo em `apps/leptos-ui/src/components/<nome>.rs`, doc comment (pt-BR) com o `≈ Q<Comp>` e a lista do que **ainda não** foi implementado, classes literais escolhidas com `match`.

| Componente (≈ Quasar) | Referência (`~/repos/quasar/ui/src/components/…`) | Props/slots da v0 | Uso no press |
|---|---|---|---|
| `Icon` (QIcon) | `icon/QIcon.json` | `name: &'static str` (classe literal `i-lucide-…`), `size` | Ícones em toda parte |
| `Btn` (QBtn) | `btn/QBtn.json` + `btn/use-btn.json` | `label`, `icon`, `icon_right`, `color`, design exclusivo (`unelevated` padrão, `outline`, `flat` → enum), `round`, `dense`, `href`/`target` (renderiza `<a>`), `type`, `disable`, `aria-label`, `on_click`; slot default | Hero, nav, copiar código, menu mobile, prev/next |
| `Badge` (QBadge) | `badge/QBadge.json` | `label`/children, `color`, `outline`, `align` | "v0.2+", rótulos de seção |
| `Banner` (QBanner) | `banner/QBanner.json` | children, `color`, `dense`, `rounded`; slots `avatar`, `action` | Alertas `> [!NOTE]` e containers `:::` |
| `Card`, `CardSection`, `CardActions` (QCard…) | `card/*.json` | Card: `flat`, `bordered`, `square`; Section: `horizontal`; Actions: `align`, `vertical` | Features da home, moldura de exemplo |
| `Separator` (QSeparator) | `separator/QSeparator.json` | `vertical`, `spaced`, `inset` | Sidebar, rodapé |
| `List`, `Item`, `ItemSection`, `ItemLabel` (QList…) | `item/*.json` (+ `use-router-link`) | List: `bordered`, `separator`, `dense`, `padding`; Item: `href` (via `leptos_router` `<A>` quando interno), `active`, `clickable`, `dense`, `inset_level`; Section: `avatar`, `side`; Label: `header`, `caption`, `lines` | Sidebar de navegação, outline da página |
| `Layout`, `Header`, `Toolbar`, `ToolbarTitle`, `Drawer`, `PageContainer`, `Page` | `layout/`, `header/`, `toolbar/`, `drawer/`, `page/` | Layout: estrutura fixa (cabeçalho em cima, drawer à esquerda) — **sem** `view`; Header: `bordered`, `elevated`; Drawer: `show: RwSignal<bool>`, `side`, `width`, `breakpoint` (acima: fixo; abaixo: sobreposto com fundo escuro, fecha ao clicar fora/Esc), `bordered`; Page: `padding` | Esqueleto do site de docs |
| `Tabs`, `Tab`, `TabPanels`, `TabPanel` | `tabs/`, `tab-panels/` | Tabs: `value: RwSignal<String>`, `align`, `dense`; Tab: `name`, `label`, `icon`; Panels: `value`; Panel: `name` | Exemplo ↔ código, grupos de código |
| `MarkupTable` (QMarkupTable) | `markup-table/QMarkupTable.json` | `dense`, `flat`, `bordered`, `separator`, `wrap_cells`; slot default (um `<table>` nativo) | Tabelas do Markdown, tabela de API |
| `ThemeSwitcher` (nosso) | — | alterna claro/escuro/auto pela store | Cabeçalho do site |

Fora deste plano (podem esperar): Dialog, Segmented, DataTable, DetailList, Feedback, PageHeader, BottomBar, Progress, Stat, Tooltip, ExpansionItem, campos de formulário (planos 0003+).

- Componentes que são do **site de docs** e não do ui — **não** fazer aqui: bloco de código com realce e botão copiar, "prose" do Markdown, outline, prev/next. Ficam no `leptos-press` (plano 0002), montados com estes componentes.
- Ícones usados internamente (menu, fechar, chevron, sol/lua) são classes literais no `.rs` do ui → entram no `dist/ui.css`.

### Critério de aceite 4
Todos os componentes acima compilam para wasm32 **e** com `leptos/ssr` (`check-ssr`) sem warnings; nenhum usa `format!` para classe; `css-check` passa.

---

## 5. Playground temporário (prova do consumo do CSS)

`apps/leptos-ui/playground/` — app Trunk mínimo que depende do ui **como um consumidor externo faria** (path dependency, sem acesso aos `.rs` do ui no UnoCSS dele). É o que valida o ADR-0005 antes do `leptos-press` existir; o plano 0002 o substitui por `apps/docs` e ele é **removido** lá.

- `index.html` com `<link data-trunk rel="rust" data-wasm-opt="z" data-wasm-opt-params="--enable-bulk-memory --enable-nontrapping-float-to-int" />` (armadilha do binaryen).
- Uma página com o esqueleto `Layout` + `Header` (com `ThemeSwitcher` e botão de menu) + `Drawer` (lista de links) + `Page` mostrando cada componente e suas variações (cores × designs do `Btn`, `Banner` por cor, `Tabs`, `MarkupTable`…).
- O playground usa ao menos **um** shortcut do preset no próprio markup, gerado pelo UnoCSS **dele** — prova da segunda metade da opção (a).

### Critério de aceite 5 (manual, no navegador)
- `moon run leptos-ui:playground` → `http://localhost:8080` renderiza tudo estilizado, sem CSS próprio do playground além do shortcut de teste.
- Claro/escuro/auto trocam todos os componentes; a escolha persiste ao recarregar.
- Drawer: fixo em tela larga; sobreposto e fechável em tela estreita (DevTools, 375px).
- `trunk build --release` passa (bulk memory) — não rodar ao mesmo tempo que o `trunk serve` no mesmo `dist/`.
- Registrar o tamanho do wasm e do `ui.css` (para acompanhar o custo do `include_str!`).

---

## 6. Encerramento

- `cargo fmt`, `cargo clippy -- -D warnings` (host e wasm32), `cargo test`, `css-check`, `css-fresh`.
- Atualizar `docs/`:
  - `docs/ui/overview.md` — componentes (marcar "parcial" e o que falta), como usar `UiStyles`/preset/link, prefixo;
  - `docs/decisions/0005-entrega-do-css.md` — de **Proposta** para **Aceita** (ou novo ADR, se a recomendação mudar), com o mecanismo escolhido e os números de tamanho;
  - `docs/guide/monorepo.md` (projetos e tarefas), `docs/guide/conventions.md` (prefixo, `dist/ui.css` como gerado), `docs/guide/pitfalls.md` (o que aparecer);
  - `docs/project/plans.md` — status.
- Marcar este plano como **Concluído** no topo, listando desvios.

---

## Desvios (registrados na implementação)

- **`Item` com `href` renderiza `<a>` simples**, não `leptos_router::A`: o `Router` do app já intercepta cliques em `<a>` e a lib fica sem depender de `leptos_router` (e sem pânico fora de um `Router`).
- **Primitivos também prefixados** (`--lx-p-*`), não só semânticos e de componente — evita colisão com o CSS do app.
- **Shortcuts em `uno/shortcuts.ts`** (exportados por `uno/preset.ts`); `uno.config.ts` fica mínimo. A checagem usa `shortcuts` direto.
- **`@unocss/cli` só no playground**: o `ui.css` é gerado por `scripts/build-css.mjs` (API `createGenerator`), que também repete o bloco escuro em `@media (prefers-color-scheme: dark)` a partir dos marcadores `dark:start/dark:end` do `scandi.css`.
- **`Drawer` ganhou `show_if_above`** (≈ Quasar `show-if-above`) para abrir/fechar ao cruzar o breakpoint; o SSR assume tela larga.
- **Cores de superfície** seguem o contrato multi-tema (`on-surface`, `surface-raised`, `--lx-state-*-filter`, `--lx-surface-backdrop/highlight` neutros) em vez dos nomes do omg-data-sync (`text`, `muted`…).
- **Estado `hover`/pressionado** é um `filter` por token (`--lx-state-hover-filter`), no lugar de cores `*-hover` por papel.
- **`type` do `Btn` é `type_`** (palavra reservada).
- Medidas: `ui.css` 29 KB (5,9 KB gzip); wasm do playground em `--release` 273 KB (109 KB gzip).
- `.gitignore`: exceção para `apps/leptos-ui/style/dist/` (o `dist/` global ignorava o `ui.css`).
