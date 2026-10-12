# ADR-0005: CSS pré-gerado + preset UnoCSS para quem usa o `leptos-nebula`

- **Status:** Aceita (implementada no plano 0001)
- **Data:** 2026-10-09

## Contexto

O UnoCSS lê arquivos `.rs` como texto para descobrir classes. Classes usadas dentro de um crate dependência (em `~/.cargo/registry` ou num path do workspace) não são vistas pelo UnoCSS do app. Opções:

- **(a)** o crate entrega **CSS pré-gerado** dos próprios componentes + os arquivos de tokens, e exporta um **preset UnoCSS** com os mesmos shortcuts para o app usar no próprio markup;
- **(b)** o app inclui o fonte do crate no `content` do UnoCSS.

## Decisão

**(a).** O CSS dos componentes passa a ser artefato versionado junto com o crate, independente do caminho onde o Cargo o colocou; o app só gera CSS para o próprio markup.

Mecanismo implementado:

- `apps/leptos-nebula/style/dist/ui.css` é **gerado** (`moon run leptos-nebula:css`) e **versionado**: reset do UnoCSS → primitivos → tema scandi (+ `@media (prefers-color-scheme: dark)` para quando `data-mode` não está definido) → base → shortcuts usados em `src/**/*.rs`. Quem usa o crate não roda Node.
- O crate expõe `pub const CSS: &str = include_str!(…/ui.css)` e o componente `UiStyles`, que injeta um `<style>` via `leptos_meta::Style`. Funciona igual com Trunk, no WebView do `leptos-native` e em SSG, sem configurar arquivos no app. Alternativa para *path deps*: `<link data-trunk rel="css" href="…/leptos-nebula/style/dist/ui.css">`.
- O preset `leptos-nebula/preset` (`presetUi()`, exportado pelo pacote JS `apps/leptos-nebula`) dá ao UnoCSS **do app** o tema (`bg-lx-primary`…), os mesmos shortcuts (`lx-btn`…) e os ícones lucide. O app gera só o CSS do próprio markup.
- Duplicação: um shortcut usado pelo app *e* pelo crate sai nos dois CSS (mesmo conteúdo, sem conflito). Aceito: o app evita duplicar usando utilitários/tema do preset em vez de shortcuts de componente.
- `css-check` (todo shortcut gera CSS) e `css-fresh` (o `ui.css` versionado está em dia) são tarefas do Moon e entram no `pnpm run check`.
- Um tema próprio do app = um CSS de tokens extra, carregado **depois** do `ui.css`.

Custo medido (2026-10-09): `ui.css` = 29 KB (5,9 KB gzip). Wasm do playground em `--release` = 273 KB (109 KB gzip), já com o CSS embutido via `include_str!` — sem cache separado do CSS, mas o crescimento é desprezível frente ao wasm.

## Consequências

- O crate precisa de um passo que gera e verifica o CSS dele (UnoCSS sobre os próprios `.rs`).
- (b) fica descartada por depender do caminho do crate no disco e por gerar o CSS da biblioteca em cada app.
