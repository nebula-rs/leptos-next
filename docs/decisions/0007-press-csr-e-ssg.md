# ADR-0007: `leptos-press` só com CSR e SSG — sem servidor em produção

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

Sites de documentação não precisam de backend. O Leptos 0.8 oferece geração estática: rotas marcadas com `SsrMode::Static(StaticRoute::new()…)` (`leptos_router::static_routes`) são pré-renderizadas pelo `leptos_axum` (`generate_route_list_with_ssg` → `StaticRouteGenerator`). A pré-renderização usa o renderizador de servidor (`ssr`) **durante o build**; o resultado é HTML estático + wasm com `hydrate`.

## Decisão

O `leptos-press` suporta exatamente dois modos:

| Modo | Build | Saída | Para quê |
|---|---|---|---|
| **CSR** | Trunk, feature `csr` | `index.html` + wasm | Desenvolvimento rápido; dentro do WebView do `leptos-native` |
| **SSG** | binário de build com `ssr` (gera o HTML e termina) + wasm com `hydrate` | uma página HTML por rota + wasm | Publicação: SEO, primeira pintura sem esperar o wasm |

Não há modo SSR em produção nem server functions no `leptos-press`.

## Consequências

- **Todo componente do `leptos-nebula` e do `leptos-press` precisa ser seguro para SSR:** nada de `web_sys::window()`/`document`/`localStorage` durante a renderização — só em `Effect`, handlers ou atrás de `#[cfg(feature = "hydrate"/"csr")]`/checagem em tempo de execução. A lib não fixa `csr`/`hydrate`/`ssr` do `leptos`; quem decide é o app.
- O ui ganha uma checagem de compilação com `leptos/ssr` no host, além do wasm32.
- O HTML do SSG e o da hidratação precisam ser idênticos: estado que só existe no navegador (modo escuro salvo, largura da tela) é aplicado **depois** da hidratação. O modo escuro salvo pode "piscar" na primeira pintura — mitigação a decidir (padrão `prefers-color-scheme` em CSS, ou um script inline mínimo no `<head>`).
- O detalhe do pipeline SSG (rodar via `cargo-leptos` ou binário próprio, rotas com parâmetros vindas do conteúdo) é validado no plano do `leptos-press` antes de virar API.

## Validação (plano 0002, 2026-10-09)

O pipeline foi validado num spike e depois no `apps/docs`. Confirmado:

- `generate_route_list_with_ssg` + `StaticRouteGenerator` pré-renderizam as rotas; o binário `ssr` (com `required-features`) gera os HTML e **termina**, sem servir nada. `cargo-leptos` compila o par `ssr` (bin) + `hydrate` (wasm); o bin roda depois.
- Os HTML hidratam em qualquer servidor estático; `leptos_meta` (`<Style>`, `<Title>`, `<Meta>`) sai no `<head>` de cada página.
- O mesmo crate compila em CSR com Trunk (`data-cargo-features="csr"`).
- O gerador escreve `rota.html`; para servidores de arquivos comuns o `docs-app` reorganiza em `rota/index.html`.
- `site-root` do `[package.metadata.leptos]` é relativo à **raiz do workspace** (o `cargo leptos` e o bin `docs-app` usam a mesma base; o bin muda para lá antes de ler a configuração).
- Rotas por página (sem parâmetros) são geradas pelo `leptos-press-build` como tuplas aninhadas de `Route` com `SsrMode::Static`; não foi preciso `static_params`.
