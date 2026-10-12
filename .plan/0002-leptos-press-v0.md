# Plano 0002 — `leptos-press` v0 + `apps/docs`

- **Status:** Concluído (2026-10-09) — desvios em [Desvios registrados](#desvios-registrados)
- **Data do plano:** 2026-10-09
- **Escopo:** crate `leptos-press` (runtime + build), modos **CSR e SSG** (sem servidor), `llms.txt`/`llms-full.txt`/`.md` por página, e a documentação pública `apps/docs` com as primeiras páginas (incluindo `Btn` com exemplo vivo e tabela de API). Remove o playground do ui.
- **Depende de:** plano 0001 (concluído). **Depois:** plano 0003 (polimento de layout), plano 0004 (`Form`), cuja página entra em `apps/docs`.

> **Nota (2026-10-12):** os crates foram renomeados depois deste plano — `leptos-ui` → `leptos-nebula` (pasta `apps/leptos-nebula`) ([ADR-0008](../docs/decisions/0008-nome-leptos-nebula.md)). Os nomes e caminhos abaixo são históricos.

> Este plano é autocontido: a sessão de implementação não viu a conversa de planejamento.
> Leia antes de começar:
>
> - `docs/press/overview.md` — **desenho do `leptos-press`** (fonte deste plano)
> - ADR-0006 (`leptos-press` + comrak), ADR-0007 (CSR + SSG, componentes seguros para SSR), ADR-0005 (entrega do CSS — o press segue o mesmo modelo do ui)
> - `docs/ui/overview.md` — componentes **parciais** disponíveis e como usar `UiStyles`/preset
> - `docs/guide/conventions.md` (regras obrigatórias), `docs/guide/pitfalls.md`
> - API real do ui: `apps/leptos-ui/src/lib.rs` e `src/components/*.rs` (nomes do Quasar; ex.: `Btn`, `Banner` com slots `BannerAvatar`/`BannerAction`, `Drawer` com `show_if_above`, `Item` com `href` renderizando `<a>`)
> - Modelo de docs: `~/repos/quasar/docs/src/` (páginas `pages/vue-components/*.md`, `components/DocExample.vue`, `DocApi.vue`, `layouts/doc-layout/`) e o tema padrão do VitePress (layout, sidebar, outline, prev/next)

---

## 0. Bloqueios e spike

### 0.1 Perguntar ao usuário antes de começar

| # | Pergunta | Sugestão |
|---|---|---|
| 1 | Instalar o **`cargo-leptos`** (`cargo install cargo-leptos --locked`)? É o caminho padrão do Leptos para compilar o par `ssr` (binário) + `hydrate` (wasm) do SSG. Não está instalado | Sim |
| 2 | Prefixo das classes do press | `lxp-` (o ui usa `lx-`; nenhum nome pode começar com prefixo de variante do UnoCSS) |

### 0.2 Spike do SSG (antes de desenhar a API — ADR-0007 pede validação)

Num exemplo descartável (fora do repo ou numa pasta que será apagada), com Leptos 0.8:

1. Duas rotas estáticas com `ssr=SsrMode::Static(StaticRoute::new())`, pré-renderizadas via `leptos_axum::generate_route_list_with_ssg` + `StaticRouteGenerator` — **o binário gera os HTML e termina**, sem servir nada.
2. O wasm `hydrate` hidrata os HTML gerados (servidos por qualquer servidor estático, ex.: `python3 -m http.server`).
3. `leptos_meta` (`<Style>` do `UiStyles`, `<Title>`, `<Meta>`) sai no `<head>` do HTML estático.
4. O mesmo crate também compila em **CSR** com Trunk (`data-cargo-features="csr"`).

Registre as respostas (e os comandos exatos) em `docs/press/overview.md`. Se algum item falhar, **pare e reporte** antes de seguir: a alternativa (renderizar cada rota com `leptos::tachys` à mão num binário próprio) muda o desenho.

---

## 1. Estrutura

```
apps/leptos-press/                 # projeto Moon "leptos-press" (um projeto, dois crates)
├── Cargo.toml                     # crate leptos-press — runtime (wasm + ssr): layout e componentes do site
├── src/
├── build/                         # crate leptos-press-build — host only: comrak, syntect, codegen, llms
│   ├── Cargo.toml
│   ├── src/
│   └── tests/fixtures/            # .md → saída esperada
├── package.json                   # UnoCSS do press (preset do leptos-ui) → style/dist/press.css
├── uno.config.ts, uno/shortcuts.ts, scripts/build-css.mjs, scripts/check-shortcuts.mjs
├── style/dist/press.css           # GERADO e versionado (mesmo modelo do ui.css)
└── moon.yml

apps/docs/                         # projeto Moon "docs-app" — documentação pública
├── Cargo.toml                     # lib (hydrate/csr) + bin (ssr: gera o site estático)
├── build.rs                       # chama leptos-press-build
├── content/**/*.md                # páginas
├── examples/<comp>/<nome>.rs      # exemplos vivos (compilados)
├── api/<Comp>.json                # API por componente (formato inspirado nos Q*.json)
├── src/
│   ├── lib.rs                     # App: include do código gerado + componentes do site (DocExample, DocApi)
│   └── main.rs                    # bin: SSG (cfg ssr)
├── index.html, Trunk.toml         # modo CSR
└── moon.yml
```

**Dois crates no `leptos-press`** (decisão deste plano): o lado de build (comrak, syntect, quote) nunca entra no wasm nem no grafo de compilação do runtime, e seus testes rodam sem compilar o Leptos. Ambos com o mesmo número de versão.

- Registrar `leptos-press: 'apps/leptos-press'` e `docs-app: 'apps/docs'` em `.moon/workspace.yml`; membros no `Cargo.toml` raiz; pacotes JS no `pnpm-workspace.yaml`.
- **Remover** `apps/leptos-ui/playground/` (membro do workspace, pacote pnpm, tarefas `playground*` no `moon.yml` do ui) — o `apps/docs` assume o papel de consumidor externo do ui.
- Dependências novas no `[workspace.dependencies]`: `comrak = "0.56"` (default-features off se possível; sem o plugin syntect do comrak — o realce é chamado por nós), `syntect = "5"`, `quote = "1"`, `proc-macro2 = "1"`, `prettyplease = "0.3"` + `syn = { version = "2", features = ["full"] }` (formatar o código gerado), `serde`/`serde_json`, um parser YAML mantido para o front-matter (ex.: `serde_yaml_ng = "0.10"` — confirmar manutenção), `leptos_router`, `leptos_axum` (só `ssr`), `axum`/`tokio` (só no bin SSG).

---

## 2. `leptos-press-build` — Markdown → código Leptos (host)

### 2.1 API do `build.rs` do site

```rust
// apps/docs/build.rs
fn main() {
    leptos_press_build::Site::new("content")
        .title("leptos-ui")
        .description("…")
        .nav([("Guia", "/guide/"), ("Componentes", "/components/")])
        .sidebar_from_folders()          // grupos = pastas; ordem = front-matter `order`, depois título
        .component(DocExample::new())    // tags aceitas no Markdown (trait abaixo)
        .component(DocApi::new())
        .build()                          // escreve $OUT_DIR/press.rs e $OUT_DIR/press-static/
        .unwrap_or_else(|e| panic!("{e}"));   // erro com arquivo:linha do .md
}
```

- `cargo:rerun-if-changed` para `content/`, `examples/`, `api/` e cada arquivo lido.
- Configuração no `build.rs` (Rust tipado) — não há `press.toml` na v0.

### 2.2 Componentes no Markdown (extensão)

```rust
pub trait MdComponent {
    fn tag(&self) -> &'static str;                                    // "DocExample"
    /// Código Rust (tokens) que substitui a tag na página.
    fn codegen(&self, attrs: &Attrs, ctx: &Ctx) -> Result<TokenStream, Error>;
    /// Markdown que substitui a tag no llms-full.txt e na cópia .md da página.
    fn llms(&self, attrs: &Attrs, ctx: &Ctx) -> Result<String, Error>;
}
```

- Tags vêm como bloco HTML do comrak (`<DocExample file="Basic" title="…" />`); parser mínimo de atributos `nome="valor"`.
- **Tag não registrada, HTML cru ou atributo inválido → erro de build** com `arquivo.md:linha`.
- `Ctx` dá: caminho do `.md`, front-matter da página (ex.: `examples: Btn` como no Quasar), raiz do site, e um meio de registrar arquivos lidos (para o `rerun-if-changed`).

### 2.3 Mapeamento da AST

| Markdown (comrak) | Gerado (leptos-press + leptos-ui) |
|---|---|
| front-matter YAML | `PageMeta { path, title, desc, layout, order, headings, … }` |
| `#`…`######` | `<h* id=… class=…>` com âncora; `h2`/`h3` entram no outline |
| parágrafo, ênfase, links, listas, `hr`, imagens | HTML com classes de "prose" do press; links internos `/…` como `<a>` (o `Router` intercepta) |
| código inline | `<code class=…>` |
| bloco de código ```` ```rust ```` | `<CodeBlock lang="rust" code=… highlighted=… />` — realce **no build** (syntect, HTML com classes), botão copiar |
| tabela GFM | `<MarkupTable>` |
| `> [!NOTE]`/`[!TIP]`/`[!IMPORTANT]`/`[!WARNING]`/`[!CAUTION]` | `<Banner color=…>` com ícone (ex.: NOTE→`Info`, TIP→`Positive`, IMPORTANT→`Primary`, WARNING→`Warning`, CAUTION→`Negative`) |
| `::: tip`/`warning`/`danger`/`info` (`block_directive`) | idem `Banner`; título opcional após o tipo |
| tag registrada | saída do `MdComponent::codegen` |
| HTML cru | erro |

- **Tamanho do código gerado:** não gerar um único `view!` gigante por página (tempo de compilação e limites de tipo). Gerar cada bloco de topo como `.into_any()` e a página como `Vec<AnyView>`; uma função por página.
- O HTML realçado do syntect entra por `inner_html` (conteúdo gerado no build, não do usuário) — documentar a razão no código.
- Tokens de cor do realce: adicionar ao **ui** (os temas são do ui) `--lx-code-{text,comment,keyword,string,number,function,type,punct}` no `scandi.css` (claro e escuro); o CSS do press mapeia as classes do syntect para esses tokens.

### 2.4 Saídas

- `$OUT_DIR/press.rs`: `SITE: SiteMeta` (título, descrição, nav, sidebar), `PAGES: &[PageMeta]`, uma `fn` por página, e a tabela de rotas (`<Route path=path!("…") view=… ssr=SsrMode::Static(StaticRoute::new()) />` — rotas sem parâmetro: cada página é sua rota) + página 404.
- `$OUT_DIR/press-static/`: `llms.txt`, `llms-full.txt`, `<rota>.md` — escritos aqui pelo `build.rs` (único lugar permitido) e **copiados** para a saída pelo passo da etapa 4.
- `llms.txt` no formato [llmstxt.org](https://llmstxt.org): `# título`, `> descrição`, seções = grupos da sidebar, itens `- [título](url.md): desc`. `llms-full.txt`: todas as páginas, tags expandidas pela saída `llms`.

### 2.5 Testes (host)

Fixtures `tests/fixtures/<caso>.md` → código gerado (formatado com `prettyplease`) e `.llms.md` esperados (snapshot; usar `insta` se ajudar). Casos mínimos: cabeçalhos e outline, cada tipo de alerta/container, tabela, código com realce, link interno, tag registrada, tag desconhecida (erro com linha), HTML cru (erro), front-matter inválido (erro), `llms.txt`/`llms-full.txt` de um site com duas seções.

### Critério de aceite 2
`cargo test -p leptos-press-build` verde, sem compilar o Leptos.

---

## 3. `leptos-press` — runtime (wasm + ssr)

Seguro para SSR (ADR-0007). Features `csr`/`hydrate`/`ssr` repassadas ao `leptos` e ao `leptos-ui`. Visual só por tokens e shortcuts (prefixo `lxp-`), CSS pré-gerado em `style/dist/press.css` com o mesmo pipeline do ui (`css`, `css-check`, `css-fresh`) e entregue por `PressStyles` (como o `UiStyles`).

| Componente | Montado com (leptos-ui) | Comportamento v0 |
|---|---|---|
| `PressApp` | `provide_meta_context`, `provide_theme`, `UiStyles`, `PressStyles`, `Router` | Raiz do site; recebe o que o `press.rs` gerou |
| `PressLayout` | `Layout`, `Header`, `Toolbar`, `Drawer` (`show_if_above`), `PageContainer`, `Page` | Cabeçalho (título, nav, `ThemeSwitcher`, botão de menu no mobile), sidebar à esquerda, conteúdo, outline à direita (≥ 1280px) |
| `Sidebar` | `List`, `ItemLabel header`, `Item href active` | Grupos da sidebar; item ativo pela rota atual |
| `Outline` | `List dense`, `Item` | `h2`/`h3` da página; destaque da seção visível é opcional (Effect com `IntersectionObserver`) |
| `PrevNext` | `Card`, `Btn flat` | Página anterior/seguinte pela ordem da sidebar |
| `HomeLayout` | `Btn`, `Card` | `layout: home` no front-matter: hero (nome, tagline, ações) + features — como a home do VitePress |
| `CodeBlock` | `Btn round flat` (copiar), `Badge` (linguagem) | HTML realçado + copiar (Clipboard API só no handler) |
| `Prose` | — | Container com os estilos do Markdown (tipografia por tokens) |
| `NotFound` | `Btn` | 404 |

- Título/descrição por página com `leptos_meta` (`<Title>`, `<Meta name="description">`).
- Modo escuro salvo pode "piscar" no SSG (o `ui.css` já respeita `prefers-color-scheme` sem `data-mode`) — aceitar na v0 e registrar.

### Critério de aceite 3
`check`, `check-wasm`, `check-ssr`, `lint`, `fmt`, `css-check`, `css-fresh` do `leptos-press` passam.

---

## 4. `apps/docs` — a documentação pública

### 4.1 Build

- **CSR (dev):** `moon run docs-app:dev` → Trunk com `data-cargo-features="csr"`, `data-wasm-opt-params="--enable-bulk-memory --enable-nontrapping-float-to-int"` (armadilha). Um hook do Trunk (ou tarefa Moon) copia `press-static/` para a saída — localizar o `OUT_DIR` de forma robusta (ex.: o `build.rs` grava o caminho num arquivo conhecido, ou o bin `ssr` tem um subcomando `static <dir>`).
- **SSG (publicação):** `moon run docs-app:build` → `cargo leptos build --release` (ou o fluxo validado no spike) + executar o bin, que gera um HTML por rota e copia `press-static/` → pasta final servível estaticamente. Tarefa `docs-app:preview` serve a pasta estática.
- `ssg` e `dev` não podem escrever no mesmo `dist/` ao mesmo tempo (armadilha do Trunk).

### 4.2 Componentes do site (vivem em `apps/docs`, não no press)

- **`DocExample`** (≈ `DocExample.vue` do Quasar): `<DocExample file="Basic" title="…" />` resolve `examples/<front-matter examples>/<file>.rs`, inclui o arquivo como módulo (`#[path]`) e gera `<DocExample title view=<mod>::Example source=include_str!(…) />`; o componente mostra `Tabs` "Exemplo | Código" (ou exemplo com o código abaixo). `llms`: o fonte em bloco ```` ```rust ````. Convenção do arquivo: exporta `#[component] pub fn Example()`.
- **`DocApi`** (≈ `DocApi.vue`): `<DocApi file="Btn" />` lê `api/Btn.json` e gera tabelas de props/slots/eventos (`MarkupTable`). Formato v0 — subconjunto dos `Q*.json`: `props.<nome> { type, desc, default?, values? }`, `slots.<nome> { desc }`, `events.<nome> { desc }`; **só** o que está implementado (componentes parciais!). `llms`: as mesmas tabelas em Markdown. Erro de build se o JSON não existir ou for inválido.

### 4.3 Conteúdo v0

```
content/
├── index.md                       # layout: home
├── guide/getting-started.md       # instalar o leptos-ui, UiStyles, provide_theme, preset UnoCSS opcional
├── guide/theming.md               # tokens em 3 camadas, data-theme/data-mode, temas (scandi agora; MD3 e Liquid Glass depois)
└── components/
    ├── btn.md                     # DocApi + DocExample (cores, designs, ícone, round, href)
    └── banner.md                  # DocApi + DocExample (cores, avatar, action)
```

Texto para **quem usa os pacotes** (não copiar `/docs` interna — ver `docs/guide/monorepo.md#docs-×-apps-docs`). Páginas dos demais componentes parciais podem vir depois; registrar quais faltam em `docs/press/overview.md`.

### Critério de aceite 4 (manual + verificável)
- `moon run docs-app:dev`: navegação entre páginas, sidebar com item ativo, outline, prev/next, tema claro/escuro, menu no mobile (375px), copiar código, exemplos vivos funcionando.
- `moon run docs-app:build` gera HTML estático: `curl` numa página mostra o **conteúdo** no HTML (não só um `<body>` vazio) e o `<style>` do `UiStyles` no `<head>`; servida estaticamente, a página hidrata (exemplos interativos funcionam).
- `llms.txt`, `llms-full.txt` e `components/btn.md` existem na saída; `llms-full.txt` contém o fonte dos exemplos e as tabelas de API.
- Quebrar um exemplo (erro de compilação) ou citar `file="NaoExiste"` **quebra o build**.
- Registrar tamanhos (wasm do docs, HTML de uma página).

---

## 5. Encerramento

- `cargo fmt`, `cargo clippy -- -D warnings` (host, wasm32, ssr), `cargo test`, `css-check`, `css-fresh` dos dois projetos de CSS.
- Atualizar `docs/`:
  - `docs/press/overview.md` — de "desenho proposto" para o real: resultado do spike, comandos, API do `Site`/`MdComponent`, desvios;
  - `docs/decisions/0007-press-csr-e-ssg.md` — consequências confirmadas pelo spike (ou novo ADR, se o fluxo mudar);
  - `docs/guide/monorepo.md` (projetos, tarefas, playground removido), `docs/guide/getting-started.md` (`cargo-leptos`), `docs/guide/conventions.md` (`press.css` como gerado; prefixo `lxp-`), `docs/guide/pitfalls.md`, `docs/ui/overview.md` (tokens `--lx-code-*`), `docs/project/plans.md`.
- Marcar este plano como **Concluído** no topo, listando desvios.

## Desvios registrados

- **§1:** `syn = "3"` (não `2`): `prettyplease` 0.3 usa o `syn` 3. `comrak` com `default-features = false`; `syntect` com `regex-fancy` (sem onig, evita dependência C). `apps/leptos-ui/playground/` já saiu do workspace Cargo/pnpm e das tarefas Moon, mas o diretório (não versionado) continua no disco por decisão do usuário: só apagar depois que `apps/docs` estiver funcionando (§4, critério de aceite 4). Pendente no encerramento (§5).
- **§2:** `MdComponent` ganhou `items()` (itens de módulo, para o `#[path] mod` do `DocExample`). Só tags **autofechadas** (`<Tag … />`) e sozinhas num bloco: o CommonMark só trata assim como bloco HTML. Texto corrido sai como **HTML estático** (`leptos_press::html`) em vez de `view!`/`AnyView` por elemento; só `code_block`, `table`, `alert` e as tags são chamadas próprias. `routes()` é uma função gerada com **tuplas aninhadas** de `Route` (não há `impl` de `MatchNestedRoutes` para `Vec`), e o 404 é o `NotFound` do runtime (não é gerado). Acréscimos: `Site::group(pasta, título)`, nav que aponta para pasta resolve para a primeira página dela, validação de links internos, links `./x.md`. `sidebar_from_folders()` é só documentação (a sidebar por pastas é sempre o comportamento). O `Site::generate()` devolve a saída em memória (os testes usam isso); `build()` escreve em disco.
- **§3:** `features[].icon` do front-matter é emoji/texto curto (classes de ícone precisam ser literais no `.rs`). O destaque da seção visível no outline (opcional) ficou de fora. `press.css` não repete reset/tokens: depende do `ui.css` (`UiStyles` antes de `PressStyles`). Tipografia do Markdown em `style/prose.css` (seletores de elemento, só tokens), shortcuts `lxp-*` só para classes. O ui ganhou os tokens `--lx-code-*` (e o `ui.css` foi regenerado).
- **§4:** `apps/docs` ganhou o bin `press-static` (copia `llms*.txt`/`.md` para uma pasta) para o hook do Trunk; o build usa `data-target-name="docs_app"` no `index.html` (lib + 2 bins). Saídas separadas: `dist/csr` (Trunk) e `apps/docs/dist/site` (SSG). O SSG grava `rota/index.html` (o gerador escreve `rota.html`). `site-root` é relativo à raiz do workspace. `ExampleBox` (exemplo + código abaixo, sem abas) é um componente genérico do **press**; o `DocExample` do site só gera a chamada. As tags `DocExample`/`DocApi` ficam em `apps/docs/build/components.rs`. Os ícones dos exemplos precisam existir no `ui.css`/`press.css` (o `apps/docs` não tem UnoCSS próprio). O ADR-0007 ganhou a seção "Validação" em vez de um novo ADR (o fluxo não mudou).
- **§5:** playground removido do disco só no fim (decisão do usuário: depois de o `apps/docs` funcionar).
- **Medidas:** wasm do docs 776 KB (267 KB gzip); `components/btn/index.html` 92 KB (12,7 KB gzip); `ui.css` 30 KB + `press.css` 14 KB.
- **Aceite 4:** verificado em navegador headless (hidratação, exemplo interativo, navegação cliente, sidebar ativa, outline, claro/escuro, menu a 375px, `file="NaoExiste"` e exemplo que não compila quebram o build). **Verificado manualmente pelo usuário (2026-10-09):** o clique em "copiar código" (copia o fonte exato do exemplo) e o `trunk serve` interativo (`moon run docs-app:dev`) — os dois itens que o headless não cobria.

## Fora deste plano

Busca (índice no build + consulta em wasm × Pagefind), base URL para hospedagem em subcaminho, "editar esta página", i18n, páginas dos demais componentes, migrar a `/docs` interna para o `leptos-press`.
