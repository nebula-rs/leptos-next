# Armadilhas conhecidas

Problemas que já custaram tempo. Antes de depurar algo parecido, confira aqui; ao descobrir uma armadilha nova, registre-a.

| Sintoma | Causa | Correção |
|---|---|---|
| Build release do Trunk falha com *"memory.copy operations require bulk memory"* | Rust ≥ 1.87 emite bulk memory; o `wasm-opt` do Trunk (binaryen 123) não habilita por padrão | No `<link data-trunk rel="rust">`: `data-wasm-opt-params="--enable-bulk-memory --enable-nontrapping-float-to-int"` |
| Estado some / view quebra ao reexibir conteúdo de `<Show>` | Filhos de `<Show>` são **recriados** a cada exibição | Guarde os **dados** em `StoredValue`, não views já construídas |
| Erro de `Send`/`Sync` ao pôr store no contexto | Tipos `!Send` (ex.: `web_sys::Storage`, closures, futures no wasm) | `StoredValue::new_local` |
| `[profile.release]` sem efeito | Num membro do workspace ele é ignorado | Declarar no `Cargo.toml` da raiz |
| Falhas aleatórias de build | `trunk serve` aberto em paralelo com `trunk build` no mesmo `dist/` | Não rodar os dois juntos sobre o mesmo `dist/` |
| Shortcut do UnoCSS não aparece no CSS, sem erro | Nome começa com prefixo de variante (`empty-state` = variante `empty` + `state`) | Renomear (`state-empty`); a checagem de shortcuts detecta |
| Ícones lucide não carregam com pnpm | Carregamento automático do `presetIcons` não acha o pacote | Carregar a coleção explicitamente em `collections` |
| `ui.css` não vai para o git | `dist/` está no `.gitignore` | Exceção `!apps/leptos-nebula/style/dist/` no `.gitignore` (o CSS pré-gerado é versionado) |
| Moon falha com `ambiguous argument 'HEAD'` | `walkStrategy: 'vcs'` sem nenhum commit | Fazer o commit inicial |
| `force-prefers-color-scheme`/`preferredColorScheme` não muda o tema em screenshot headless | O `chrome-headless-shell` ignora a emulação | Testar o modo escuro com `data-mode="dark"` fixo (ou DevTools); `Auto` + OS escuro fica para teste manual |
| `<Tag a="b"></Tag>` no Markdown vira "HTML cru" | O CommonMark só trata uma tag como **bloco** HTML se a linha for só o tag completo (autofechado); com o fechamento na mesma linha vira parágrafo com HTML inline | Usar `<Tag a="b" />` sozinho, com linha em branco antes e depois |
| `<Routes>{routes()}</Routes>` não compila (`Defs: IntoRender`) | No `view!`, `{expr}` filho é tratado como view, não como `children` de `Routes` | Chamar `Routes(RoutesProps::builder().fallback(…).children(ToChildren::to_children(routes)).build())` |
| Muitas rotas geradas não compilam | `MatchNestedRoutes` existe só para tuplas de tamanho limitado (não para `Vec`) | Agrupar em tuplas aninhadas (o `leptos-press-build` faz de 12 em 12) |
| Hidratação do SSG entra em pânico ao abrir `/index.html` | A rota vem da URL: `/index.html` não casa nenhuma rota, o cliente renderiza o fallback e diverge do HTML | Servir/abrir sempre em `/` (e `/guia/pagina`); em release o erro é um `unreachable!()` sem detalhe — depure com build debug |
| `trunk build` falha com "found more than one target artifact" | O pacote tem lib e mais de um bin (`docs-app` com `ssr`, `press-static`) | `data-target-name="docs_app"` no `<link data-trunk rel="rust">` |
| Hook do Trunk recebe `$TRUNK_STAGING_DIR` literal (cria uma pasta com esse nome) | O Trunk não expande variáveis nos argumentos do hook | `command = "sh"`, `command_arguments = ["-c", "… \"$TRUNK_STAGING_DIR\""]` |
| `cargo leptos build` grava o `pkg/` fora do `apps/docs` | `site-root` é relativo à raiz do **workspace**, não ao pacote | `site-root = "apps/docs/dist/site"` e o bin do SSG entra na raiz do workspace antes de `get_configuration` |
| `cargo leptos` falha com "Several bin targets found" | Mais de um `[[bin]]` no pacote | `bin-target = "docs-app"` no `[package.metadata.leptos]` |
| Ícone lucide de um exemplo da documentação não aparece | O CSS do `apps/docs` é só o `ui.css` + `press.css`; o UnoCSS só viu os `.rs` do ui e do press | Usar nos exemplos ícones que o ui/press já usam (`copy`, `check`, `info`, `arrow-right`…) ou dar ao `apps/docs` um pipeline UnoCSS próprio |
| `queries overflow the depth limit` ao compilar o `leptos-press` em release (ssr) | O `view!` do `PressLayout` aninha muitos tipos; `cargo check` passa, mas o cálculo de layout do release estoura o limite de 128 | `#![recursion_limit = "256"]` no crate (já está no `leptos-press`); o `docs-app:build` pega o erro, o `check` não |
| Shortcut do UnoCSS com `group` (ou outra classe-marcador) some do CSS | `group` não é utilitário: o shortcut inteiro é descartado | Não pôr marcadores em shortcuts; escrever a classe literal no elemento (`class="group lxp-code"`) e usar `group-hover:` no shortcut |
| `cargo info <crate>` diz que o nome existe (versão `0.1.0 (from ./apps/…)`) | Dentro do workspace o `cargo info` resolve o crate **local** | Rodar fora do repositório (`cd /tmp && cargo info <crate>`) para consultar o crates.io |
