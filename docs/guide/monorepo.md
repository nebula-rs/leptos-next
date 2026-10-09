# Monorepo (Moon)

O repositório é orquestrado pelo [Moon](https://moonrepo.dev) — ver [ADR-0001](../decisions/0001-monorepo-moon.md).

## Estrutura

Atual:

```
ws-leptos-next/
├── .moon/workspace.yml      # registro de projetos, VCS, hasher
├── .prototools              # versões fixadas: moon, node, pnpm
├── .plan/                   # planos de implementação (um arquivo por etapa)
├── package.json             # scripts raiz (delegam ao Moon)
├── pnpm-workspace.yaml      # pacotes JS do workspace
├── AGENTS.md / CLAUDE.md / GEMINI.md / .github/copilot-instructions.md
└── docs/                    # projeto Moon "docs" (VitePress) — esta documentação
```

Pastas já criadas, ainda sem projeto (ver [Visão e escopo](../project/vision.md)):

```
├── Cargo.toml               # workspace Cargo na raiz — [profile.release] fica AQUI
└── apps/
    ├── leptos-ui/           # crate <nome>-ui (esqueleto criado)
    ├── leptos-native/       # crate <nome>-native
    ├── leptos-press/        # crate leptos-press — docs estilo VitePress sobre o ui (ADR-0006)
    └── docs/                # documentação PÚBLICA, feita com o leptos-press
```

## `/docs` × `/apps/docs`

São projetos distintos — não confunda:

| | `/docs` (esta) | `/apps/docs` |
|---|---|---|
| Público | Agentes de IA e mantenedores | Quem **consome** os pacotes |
| Conteúdo | Arquitetura, decisões, convenções, armadilhas, planos | Guia de uso, uma página por componente, exemplos vivos, API (no molde da docs do Quasar) |
| Quem atualiza | Os próprios agentes, a cada mudança | Junto com cada componente/feature pública |
| Tecnologia | VitePress | [`leptos-press`](../press/overview.md) (Leptos + comrak, visual do `<nome>-ui`) |
| Id no Moon | `docs` | `docs-app` (planejado) |

Grafo de dependências: `apps/docs` → `leptos-press` → `<nome>-ui`.

Detalhe interno (como algo foi implementado, por que) vai em `/docs`; o que o usuário do pacote precisa saber vai em `/apps/docs`.

## Projetos

| Projeto | Caminho | Linguagem | Tarefas |
|---|---|---|---|
| `docs` | `docs/` | TypeScript (VitePress) | `dev`, `build`, `preview` |
| `leptos-ui` | `apps/leptos-ui/` | Rust (lib; crate `leptos-ui`, nome provisório) | `check`, `check-wasm`, `check-ssr`, `lint`, `lint-wasm`, `fmt`, `test` |

## Comandos

```bash
moon run <projeto>:<tarefa>   # ex.: moon run docs:build
moon run :build               # executa "build" em todos os projetos
moon tasks <projeto>          # lista as tarefas de um projeto
```

## Adicionando um projeto

1. Criar a pasta com um `moon.yml` (`language`, `layer`, `tasks`).
2. Registrar em `.moon/workspace.yml` → `projects`.
3. Se for pacote JS, incluir em `pnpm-workspace.yaml`.
4. Se for crate Rust, incluir em `members` do `Cargo.toml` da raiz.
5. Atualizar a tabela **Projetos** desta página.

## Cache

As tarefas declaram `inputs`/`outputs`; o Moon pula a execução quando nada mudou. Tarefas de servidor (`dev`, `preview`, `trunk serve`) usam `preset: 'server'`, que desativa cache e CI.
