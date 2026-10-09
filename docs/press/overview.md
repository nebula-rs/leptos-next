# `leptos-press` — visão geral

Crate genérico para escrever documentação estilo VitePress em Leptos, com o visual do `<nome>-ui` — [ADR-0006](../decisions/0006-leptos-press.md). Primeiro usuário: `apps/docs`.

::: info Desenho proposto
Nada aqui foi implementado. Pontos marcados *(a decidir)* estão em aberto.
:::

## O que cobre do VitePress

| VitePress | `leptos-press` |
|---|---|
| Páginas `.md` com front-matter | `content/**/*.md`, front-matter YAML; processado pelo comrak **no build** |
| Componentes Vue dentro do Markdown | Tags registradas (`<DocExample file="Basic" />`) viram componentes Leptos **compilados** |
| `::: warning` / `> [!NOTE]` | `block_directive` e `alerts` do comrak → componente de alerta do ui |
| Realce de código (Shiki) | syntect no build → spans com classes; cores pelos tokens `--code-*` |
| `config.ts` (nav, sidebar) | Builder Rust no `build.rs` do site *(ou `press.toml` — a decidir)* |
| Tema padrão (layout, sidebar, outline, prev/next) | Layout feito com componentes do `<nome>-ui` |
| `vitepress-plugin-llms` | `llms.txt`, `llms-full.txt` e uma cópia `.md` por página, gerados no build |
| Busca local | Depois *(a decidir: índice no build + consulta em wasm × Pagefind)* |
| SSG | **CSR + SSG, sem servidor** — [ADR-0007](../decisions/0007-press-csr-e-ssg.md). SSG via `StaticRoute` do `leptos_router` 0.8, pré-renderizado no build |

## Arquitetura

```
apps/leptos-press/
└── src/
    ├── lib.rs          # runtime (wasm): layout, sidebar, outline, CodeBlock, Alert… sobre o <nome>-ui
    └── build/          # feature "build" (host): comrak → código Leptos, llms.txt
```

Uma crate, duas faces (*a decidir*: crate única com feature `build` × par `leptos-press` + `leptos-press-build`):

- **Build** (dependência de `build.rs` do site): lê o conteúdo, faz o parse com comrak, percorre a AST e **gera Rust** (`$OUT_DIR/press.rs`: páginas como componentes, tabela de rotas, nav/sidebar). Gerar `view!`/tokens — e não uma string HTML — é o que permite componentes compilados no meio do texto.
- **Runtime** (wasm): `PressApp`/`PressLayout` e os componentes que a AST usa (cabeçalho com âncora, tabela, bloco de código com copiar, alerta/container).
- **Arquivos estáticos** (`llms*.txt`, `.md` por página): escritos por um binário do crate chamado num hook do Trunk (`$TRUNK_STAGING_DIR`) ou tarefa Moon — não pelo `build.rs`, que só deve escrever em `OUT_DIR`.

### Componentes no Markdown

O site registra, no `build.rs`, cada tag aceita no Markdown com **duas** saídas:

1. **código** — como a tag vira componente Leptos (ex.: `<DocExample file="Basic" />` → `<DocExample view=examples::form::Basic source=include_str!("…/Basic.rs") />`);
2. **texto para LLM** — como a tag aparece em `llms-full.txt` (ex.: o código-fonte do exemplo em bloco ```` ```rust ````; a tabela de API em Markdown).

Tag não registrada ou arquivo inexistente → **erro de build**, com arquivo e linha do `.md`.

### `llms.txt`

Formato [llmstxt.org](https://llmstxt.org): `llms.txt` = título, descrição e links por seção (de `title`/`desc` do front-matter); `llms-full.txt` = todas as páginas concatenadas, com as tags expandidas pela saída "texto para LLM" — melhor que o plugin do VitePress, que deixa componentes como tags vazias.

## Regras

- **Genérico:** nada específico dos componentes documentados entra no `leptos-press`; isso vive no site (`apps/docs`).
- Visual só por tokens/shortcuts do `<nome>-ui` (mesmas [regras de componentes](../guide/conventions.md#componentes-leptos-nome-ui)).
- Lógica de build (AST → código, AST → llms) testável no host com fixtures `.md` → saída esperada.
- Tudo seguro para SSR: nada de API do navegador durante a renderização ([ADR-0007](../decisions/0007-press-csr-e-ssg.md)).
