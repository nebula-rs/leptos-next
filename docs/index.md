---
layout: home

hero:
  name: leptos-next
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
  - title: "leptos-press"
    details: Documentação estilo VitePress em Leptos — Markdown (comrak) no build, CSR + SSG, llms.txt. Faz a documentação pública (nebula-docs).
  - title: "leptos-native"
    details: Runtime nativo sobre wry/tao/cargo-mobile2/tauri-bundler, sem o framework Tauri. Ponte Rust ↔ Rust via server functions.
  - title: Docs como fonte única
    details: Esta documentação é a referência para pessoas e para agentes de IA (AGENTS.md, CLAUDE.md, GEMINI.md, Copilot).
---

::: info Nomes
Repositório `nebula-rs/leptos-next` (pasta local `ws-leptos-next`), com um submódulo por app ([ADR-0009](./decisions/0009-repositorios-e-submodulos.md)). Crates: `leptos-nebula` (componentes), `leptos-native` (runtime nativo) e `leptos-press` (docs) — [ADR-0008](./decisions/0008-nome-leptos-nebula.md). Prefixo de classes e tokens: `lx` (`lx-btn`, `--lx-color-primary`).
:::
