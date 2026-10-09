# ADR-0007: `leptos-press` só com CSR e SSG — sem servidor em produção

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

Sites de documentação não precisam de backend. O Leptos 0.8 oferece geração estática: rotas marcadas com `SsrMode::Static(StaticRoute::new()…)` (`leptos_router::static_routes`) são pré-renderizadas pelo `leptos_axum` (`generate_route_list_with_ssg` → `StaticRouteGenerator`). A pré-renderização usa o renderizador de servidor (`ssr`) **durante o build**; o resultado é HTML estático + wasm com `hydrate`.

## Decisão

O `leptos-press` suporta exatamente dois modos:

| Modo | Build | Saída | Para quê |
|---|---|---|---|
| **CSR** | Trunk, feature `csr` | `index.html` + wasm | Desenvolvimento rápido; dentro do WebView do `<nome>-native` |
| **SSG** | binário de build com `ssr` (gera o HTML e termina) + wasm com `hydrate` | uma página HTML por rota + wasm | Publicação: SEO, primeira pintura sem esperar o wasm |

Não há modo SSR em produção nem server functions no `leptos-press`.

## Consequências

- **Todo componente do `<nome>-ui` e do `leptos-press` precisa ser seguro para SSR:** nada de `web_sys::window()`/`document`/`localStorage` durante a renderização — só em `Effect`, handlers ou atrás de `#[cfg(feature = "hydrate"/"csr")]`/checagem em tempo de execução. A lib não fixa `csr`/`hydrate`/`ssr` do `leptos`; quem decide é o app.
- O ui ganha uma checagem de compilação com `leptos/ssr` no host, além do wasm32.
- O HTML do SSG e o da hidratação precisam ser idênticos: estado que só existe no navegador (modo escuro salvo, largura da tela) é aplicado **depois** da hidratação. O modo escuro salvo pode "piscar" na primeira pintura — mitigação a decidir (padrão `prefers-color-scheme` em CSS, ou um script inline mínimo no `<head>`).
- O detalhe do pipeline SSG (rodar via `cargo-leptos` ou binário próprio, rotas com parâmetros vindas do conteúdo) é validado no plano do `leptos-press` antes de virar API.
