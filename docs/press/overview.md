# `leptos-press` — visão geral

Crate genérico para escrever documentação estilo VitePress em Leptos, com o visual do `leptos-nebula` — [ADR-0006](../decisions/0006-leptos-press.md). Primeiro usuário: `apps/docs`.

::: info Estado
Implementado ([plano 0002](../project/plans.md)): `leptos-press-build`, runtime `leptos-press` e o primeiro consumidor, `apps/docs` (CSR e SSG). Fora da v0: busca, base URL para subcaminho, "editar esta página", i18n.
:::

## O que cobre do VitePress

| VitePress | `leptos-press` |
|---|---|
| Páginas `.md` com front-matter | `content/**/*.md`, front-matter YAML; processado pelo comrak **no build** |
| Componentes Vue dentro do Markdown | Tags registradas (`<DocExample file="Basic" />`) viram componentes Leptos **compilados** |
| `::: warning` / `> [!NOTE]` | `block_directive` e `alerts` do comrak → componente de alerta do ui |
| Realce de código (Shiki) | syntect no build → spans com classes; cores pelos tokens `--code-*` |
| `config.ts` (nav, sidebar) | Builder Rust no `build.rs` do site *(ou `press.toml` — a decidir)* |
| Tema padrão (layout, sidebar, outline, prev/next) | Layout feito com componentes do `leptos-nebula` |
| `vitepress-plugin-llms` | `llms.txt`, `llms-full.txt` e uma cópia `.md` por página, gerados no build |
| Busca local | Depois *(a decidir: índice no build + consulta em wasm × Pagefind)* |
| SSG | **CSR + SSG, sem servidor** — [ADR-0007](../decisions/0007-press-csr-e-ssg.md). SSG via `StaticRoute` do `leptos_router` 0.8, pré-renderizado no build |

## Spike do SSG (2026-10-09) — plano 0002 §0.2

Validado num exemplo descartável (Leptos 0.8.8, `leptos_axum` 0.8.10, `cargo-leptos` 0.3.11, Rust 1.98). **Todos os itens passaram**; o desenho segue.

| Item | Resultado |
|---|---|
| Duas rotas com `ssr=SsrMode::Static(StaticRoute::new())` pré-renderizadas por `generate_route_list_with_ssg` + `StaticRouteGenerator` | OK. O binário (`required-features = ["ssr"]`) chama `gen_.generate(&opts).await` e **termina**, sem servir nada |
| Hidratação dos HTML por servidor estático | OK (`python3 -m http.server`; clique no botão incrementa após hidratar) |
| `leptos_meta` (`<Style>`, `<Title>`, `<Meta>`) no `<head>` estático | OK: `<style>`, `<title>` e `<meta name="description">` saem no `<head>` de cada página |
| Mesmo crate em CSR com Trunk | OK: `<link data-trunk rel="rust" data-cargo-features="csr" />` |

Comandos: `cargo leptos build --release` (compila o bin `ssr` e o wasm `hydrate`), depois executar o bin com `LEPTOS_OUTPUT_NAME`, `LEPTOS_SITE_ROOT` e `LEPTOS_SITE_PKG_DIR` definidos (ou `[package.metadata.leptos]` + `get_configuration(None)`). `Cargo.toml`: `[package.metadata.leptos] bin-features = ["ssr"]`, `lib-features = ["hydrate"]`.

Achados que afetam o desenho:

- **Arquivo por rota:** a rota `/about` vira `about.html` (não `about/index.html`). Servidores estáticos sem reescrita (ex.: `python3 -m http.server`) não resolvem `/about` — o passo de publicação deve gravar `about/index.html` (ou documentar a reescrita).
- **Servir em `/`:** a hidratação decide a rota pela URL. Abrir `/index.html` não casa nenhuma rota, o cliente renderiza o fallback e a hidratação **entra em pânico** (mismatch). Sempre acessar `/`.
- **Mensagem de erro de hidratação:** só aparece em build debug; em release vira `unreachable!()` sem detalhe. Depure hidratação com `cargo leptos build` (debug).
- O bin precisa de `cargo-leptos` apenas para o par ssr+hydrate; o bin de geração em si roda direto.

## Arquitetura

Um projeto Moon (`leptos-press`), **dois crates**: o lado de build (comrak, syntect, quote) nunca entra no wasm nem no grafo do runtime, e seus testes rodam sem compilar o Leptos.

```
apps/leptos-press/
├── src/                 # crate leptos-press — runtime (wasm + ssr)
├── build/               # crate leptos-press-build — host only
│   ├── src/             # Site, render (AST → código), page, frontmatter, highlight
│   └── tests/           # fixtures .md → snapshots (.expected.rs / .expected.md)
├── uno/, scripts/       # UnoCSS do press (preset do ui + shortcuts lxp-*)
├── style/prose.css      # tipografia do Markdown + realce (só tokens)
└── style/dist/press.css # GERADO e versionado (mesmo modelo do ui.css)
```

### Build (`leptos-press-build`)

No `build.rs` do site:

```rust
leptos_press_build::Site::new("content")
    .title("leptos-nebula")
    .description("…")
    .nav([("Guia", "/guide/"), ("Componentes", "/components/")])
    .group("guide", "Guia")              // ordem e título dos grupos da sidebar
    .sidebar_from_folders()              // grupos = pastas de 1º nível; ordem = `order`, depois título
    .component(DocExample::new())        // tags aceitas no Markdown (trait MdComponent)
    .build()                             // $OUT_DIR/press.rs e $OUT_DIR/press-static/
    .unwrap_or_else(|e| panic!("{e}"));  // erro: arquivo.md:linha: mensagem
```

- **Saídas:** `press.rs` (`SITE: SiteMeta`, uma `fn page_N() -> AnyView` por página, `routes()`) e `press-static/` (`llms.txt`, `llms-full.txt`, uma cópia `.md` por página). O site inclui `press.rs` com `include!` e precisa depender de `leptos`, `leptos_router` e `leptos-press`.
- **`routes()`** devolve tuplas aninhadas de `Route` com `SsrMode::Static` (uma rota por página; `MatchNestedRoutes` só existe para tuplas de tamanho limitado, então o gerador agrupa de 12 em 12). O 404 é o `NotFound` do runtime, não gerado.
- **Texto corrido vira HTML estático**: parágrafos, listas, cabeçalhos (com `id` e âncora), citações etc. são escritos no build e chamados como `leptos_press::html("…")` (`inner_html`). Só o que precisa de componente vira chamada própria: `code_block` (realce syntect no build), `table` (`MarkupTable`), `alert` (`Banner`) e as tags registradas. Estilo dos elementos: `style/prose.css`.
- **Tags no Markdown** (`trait MdComponent`): `tag()`, `codegen()` (expressão que vira view), `items()` (itens de módulo, ex.: `#[path] mod`; deduplicados) e `llms()` (Markdown para `llms-full.txt` e a cópia `.md`). Só a forma **autofechada** (`<DocExample file="Basic" />`), sozinha num bloco (linha em branco antes e depois). Tag não registrada, HTML cru, atributo malformado/desconhecido/obrigatório ausente, front-matter inválido, link interno `/…` quebrado, link do nav sem página e rota duplicada → **erro de build** com `arquivo:linha`.
- Links relativos `./outra.md#x` viram a rota da página; links externos ganham `target="_blank" rel="noopener noreferrer"`.
- Front-matter: `title`, `description`/`desc`, `layout: doc|home`, `order`, `hero`/`features` (home); chaves extras (ex.: `examples: Btn`) ficam em `ctx.front.str("examples")`.
- `cargo test -p leptos-press-build` roda no host, sem compilar o Leptos. Para regravar snapshots: `UPDATE_EXPECT=1 cargo test -p leptos-press-build`.

### Runtime (`leptos-press`)

Contrato com o código gerado (`content.rs`): `html`, `table`, `code_block`, `alert` (`AlertKind`), `render_page` — mudar assinatura exige mudar o gerador. Layout: `PressApp` (contextos, `UiStyles` + `PressStyles`, `Router`, rotas), `PressLayout` (cabeçalho com nav — links `<a>` com `lxp-nav-link`/`lxp-nav-link-active` — e `ThemeSwitcher`; sidebar em `Drawer` com `show_if_above`; no centro, o container `lxp-doc-*` com **conteúdo + outline juntos**: o outline é um `<aside>` sticky que só aparece a partir de 1280px, como o `VPDoc` do VitePress — coluna de texto 43rem, aside 14rem, gap 4rem; sem outline ou na home o container não reserva coluna; a home não tem sidebar nem outline), `Sidebar`, `Outline`, `PrevNext`, `HomeLayout`, `CodeBlock` (sem barra: linguagem e botão de copiar no canto; o botão aparece no hover/foco do bloco e fica sempre visível sem hover; `attached` encosta o bloco na base de uma caixa), `Prose`, `NotFound`, `PressStyles`.

- Prefixo de classes `lxp-` (o ui usa `lx-`). `press.css` **não** repete reset nem tokens: carregue `PressStyles` depois de `UiStyles`.
- Cores do realce: tokens `--lx-code-{text,comment,keyword,string,number,function,type,punct}` do tema ([UI](../ui/overview.md)); `prose.css` mapeia os escopos do syntect para eles.
- Modo escuro salvo pode "piscar" no SSG (o `ui.css` já respeita `prefers-color-scheme` sem `data-mode`); aceito na v0.
- Não implementado ainda: destaque da seção visível no outline (opcional no plano).

### Consumidor: `apps/docs`

- `build.rs` configura o `Site` e registra as tags do site (`build/components.rs`); `src/lib.rs` inclui o `press.rs` gerado, define `App` (`PressApp`) e o `shell` do SSG. Conteúdo em `content/`, exemplos em `examples/<componente>/<nome>.rs`, API em `api/<Comp>.json`.
- **`DocExample`** (`<DocExample file="colors" />`; `title` opcional — sem ele não há barra de título —, `layout="row"` (padrão, componentes inline) ou `"column"` (componentes de bloco como `Banner`)): resolve `examples/<front-matter "examples">/<file>.rs`, compila o arquivo como módulo (`#[path]`; **erro no exemplo quebra o build**) e mostra o exemplo vivo numa caixa (`ExampleBox`) com o código-fonte (realçado no build) encostado na base. O arquivo exporta `#[component] pub fn Example()`. Saída `llms`: o fonte em bloco `rust`.
- **`DocApi`** (`<DocApi file="Btn" />`): lê `api/Btn.json` e gera tabelas de props, slots e eventos. Formato: `props.<nome> { type, desc, default?, values? }`, `slots.<nome> { desc }`, `events.<nome> { desc }`; documente **só o que está implementado**. Saída `llms`: as mesmas tabelas em Markdown.
- Arquivo ausente (`file="NaoExiste"`), JSON inválido ou exemplo que não compila → o build falha, com `pagina.md:linha` quando o erro vem da tag.
- Páginas de componentes que ainda faltam: `Badge`, `Card`, `Separator`, `List`/`Item`, `Layout`/`Header`/`Drawer`, `Tabs`, `MarkupTable`, `ThemeSwitcher`, `Icon`. `Form` entra no plano 0004.
- Tamanhos medidos (release, 2026-10-09): wasm do `apps/docs` 776 KB (267 KB gzip); `btn/index.html` 92 KB (12,7 KB gzip, com `ui.css` 30 KB + `press.css` 14 KB embutidos em cada página); `ui.css` + `press.css` = 44 KB.

## Regras

- **Genérico:** nada específico dos componentes documentados entra no `leptos-press`; isso vive no site (`apps/docs`).
- Visual só por tokens/shortcuts do `leptos-nebula` (mesmas [regras de componentes](../guide/conventions.md#componentes-leptos-nome-ui)).
- Lógica de build (AST → código, AST → llms) testável no host com fixtures `.md` → saída esperada.
- Tudo seguro para SSR: nada de API do navegador durante a renderização ([ADR-0007](../decisions/0007-press-csr-e-ssg.md)).
