---
layout: home

hero:
  name: ws-leptos-next
  tagline: O que o Quasar é para o Vue, para o Leptos — componentes, temas por tokens e o mesmo código na web, no desktop e no mobile.
  actions:
    - theme: brand
      text: Visão e escopo
      link: /project/vision
    - theme: alt
      text: Primeiros passos
      link: /guide/getting-started
    - theme: alt
      text: Decisões (ADRs)
      link: /decisions/

features:
  - title: "leptos-nebula"
    details: Biblioteca de componentes Leptos, tokens de tema em três camadas e preset UnoCSS. Tema inicial scandi.
  - title: "leptos-native"
    details: Runtime nativo sobre wry/tao/cargo-mobile2/tauri-bundler, sem o framework Tauri. Ponte Rust ↔ Rust via server functions.
  - title: Docs como fonte única
    details: Esta documentação é a referência para pessoas e para agentes de IA (AGENTS.md, CLAUDE.md, GEMINI.md, Copilot).
---

::: info Nomes
`ws-leptos-next` é o nome da pasta. Crates: `leptos-nebula` (componentes), `leptos-native` (runtime nativo) e `leptos-press` (docs) — [ADR-0008](./decisions/0008-nome-leptos-nebula.md). Prefixo de classes e tokens: `lx` (`lx-btn`, `--lx-color-primary`).
:::
