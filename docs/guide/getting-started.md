# Primeiros passos

## Pré-requisitos

| Ferramenta | Versão | Observação |
|---|---|---|
| [proto](https://moonrepo.dev/proto) | — | Gerencia as versões fixadas em `.prototools` (`proto use` na raiz) |
| Moon | 2.5.4 | Orquestrador do monorepo |
| Node.js | 24.x | Fixado em `.node-version` / `.prototools` |
| pnpm | 12.x | **Único** gerenciador de pacotes JS — nunca `npm` |
| Rust | stable (edition 2024) | Via [rustup](https://rustup.rs) |
| Target `wasm32-unknown-unknown` | — | `rustup target add wasm32-unknown-unknown` |
| Trunk | 0.21 | Bundler dos apps Leptos CSR |
| Targets Rust Android | — | Já instalados no ambiente de desenvolvimento |
| JDK, Android SDK, NDK | NDK 29.0.14206865 | Só para o `<nome>-native` no Android (ver abaixo) |

## Ambiente

- `JAVA_HOME`, `ANDROID_HOME` (`~/Android/Sdk`) e `NDK_HOME` (NDK 29.0.14206865) estão exportados no topo do `~/.bashrc`.
- **Dependência de sistema faltando:** peça ao usuário o comando `sudo apt-get install …` exato. Não improvise instalações, não use alternativas que contornem o pacote.

## Setup

```bash
pnpm install        # dependências JS (docs; depois UnoCSS)
moon projects       # lista os projetos registrados
```

::: warning Moon exige ao menos um commit
O hasher usa `walkStrategy: 'vcs'`: o Moon precisa de um `HEAD` válido no git para rodar tarefas.
:::

## Documentação

```bash
moon run docs:dev       # VitePress em http://localhost:5173
moon run docs:build     # build estático + llms.txt / llms-full.txt
```

## Próximos passos

- [Monorepo (Moon)](./monorepo.md)
- [Visão e escopo](../project/vision.md)
- [Convenções](./conventions.md) e [Armadilhas conhecidas](./pitfalls.md)
