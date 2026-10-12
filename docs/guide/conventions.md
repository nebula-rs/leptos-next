# Convenções

## Gerais

- Idioma: identificadores, API pública e mensagens de commit em **inglês**; comentários, doc comments e documentação em **português (pt-BR)**.
- Decisão de arquitetura nova ou alterada → novo ADR em [`decisions/`](../decisions/index.md).
- Mudou estrutura, comando ou convenção? Atualize a página correspondente em `docs/` no mesmo trabalho.
- Trabalho grande → plano em `.plan/` antes de implementar ([Planos](../project/plans.md)).
- pnpm, nunca npm.

- Commits: primeiro no submódulo do app, depois o ponteiro na raiz ([fluxo](./monorepo.md#repositorios-e-submodulos)).

## Rust

- Edition 2024, workspace Cargo na raiz; dependências via `[workspace.dependencies]` + `{ workspace = true }`.
- `[profile.*]` só no `Cargo.toml` da raiz (num membro é ignorado).
- Sem `unwrap()`/`panic!` em código de biblioteca, exceto invariantes documentadas.
- Lógica sem DOM (validação, máscara, coordenação de formulário) em módulos puros, **testáveis no host** (`cargo test`), separados dos componentes.
- Antes de concluir: `cargo fmt`, `cargo clippy -- -D warnings` (host e `--target wasm32-unknown-unknown`), `cargo test`.

## Componentes Leptos (`leptos-nebula`)

Restrições aprendidas na prática — não são sugestões:

- **Classes sempre literais** no código; escolher com `match`, nunca `format!`. O UnoCSS lê `.rs` como texto.
- **Nome de shortcut não pode começar com prefixo de variante** do UnoCSS (`empty-`, `hover-`, `focus-`, `first-`, `last-`, `odd-`, `even-`…): o shortcut some do CSS sem aviso. A checagem de shortcuts é **teste do crate**.
- **A base de um componente não define propriedade que uma variante também define** (ex.: raio do `lx-btn` fica nas variantes de tamanho, não na base, porque `round` troca o raio). Incluindo ordem dentro do mesmo shortcut: `border-0` + `border-top` conflitam; o reset do Uno já zera bordas.
- **Estados mutuamente exclusivos são shortcuts completos** (`alt-correct`, `alt-wrong`), não modificador sobre uma base com cor: a ordem no CSS não é a ordem das classes.
- **O tema do UnoCSS só aponta para tokens** (`var(--…)`).
- **Ícones lucide via `presetIcons`**, com a coleção carregada explicitamente (com pnpm, o carregamento automático não acha o pacote).
- Componentes usam apenas tokens **semânticos** e **de componente**, nunca primitivos ([tokens](../ui/overview.md#tokens)).
- **Seguro para SSR** ([ADR-0007](../decisions/0007-press-csr-e-ssg.md)): nada de `window`/`document`/`localStorage` durante a renderização — só em `Effect` e handlers. A lib não fixa `csr`/`hydrate`/`ssr`.
- API espelha a do Quasar quando fizer sentido ([ADR-0003](../decisions/0003-quasar-como-referencia.md)): mesmos nomes de props em `snake_case`, mesmos eventos como `on_*`.

## Prefixos `lx` e `lxp`

Classes e shortcuts: `lx-<componente>[-<variante>]` (`lx-btn`, `lx-btn-outline`). Tokens semânticos e de componente: `--lx-…` (`--lx-color-primary`, `--lx-btn-radius`); primitivos: `--lx-p-…`. Utilitários de cor do preset: `bg-lx-primary`. O `leptos-press` usa `lxp-<parte>` (`lxp-prose`, `lxp-code`) e `--lx-code-*` para o realce de código; as mesmas regras de shortcut valem. Variáveis locais de cor de um componente: `--lx-tone`, `--lx-tone-contrast`, `--lx-tone-soft`.

## Arquivos gerados — nunca editar à mão

- `apps/leptos-nebula/style/dist/ui.css` — **versionado** (torna o crate autocontido). Regenerar com `moon run leptos-nebula:css`; `css-fresh` falha se estiver desatualizado
- `apps/leptos-press/style/dist/press.css` — **versionado**, mesmo modelo; regenerar com `moon run leptos-press:css`
- `$OUT_DIR/press.rs` e `$OUT_DIR/press-static/` do `apps/docs` (gerados pelo `build.rs` via `leptos-press-build`)
- `docs/.vitepress/dist/` (inclui `llms.txt` / `llms-full.txt`)

## Nunca commitar

`target/`, `node_modules/`, `dist/`, `.moon/cache/`, arquivos `.env`.
