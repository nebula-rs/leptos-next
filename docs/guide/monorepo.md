# Monorepo (Moon)

O repositório é orquestrado pelo [Moon](https://moonrepo.dev) — ver [ADR-0001](../decisions/0001-monorepo-moon.md).

## Estrutura

Atual:

```
leptos-next/                 # repositório nebula-rs/leptos-next (pasta local: ws-leptos-next)
├── .moon/workspace.yml      # registro de projetos, VCS, hasher
├── .prototools              # versões fixadas: moon, node, pnpm
├── .plan/                   # planos de implementação (um arquivo por etapa)
├── package.json             # scripts raiz (delegam ao Moon)
├── pnpm-workspace.yaml      # pacotes JS do workspace
├── AGENTS.md / CLAUDE.md / GEMINI.md / .github/copilot-instructions.md
└── docs/                    # projeto Moon "docs" (VitePress) — esta documentação
```

Apps — cada um é um **repositório próprio, como submódulo git** ([ADR-0009](../decisions/0009-repositorios-e-submodulos.md)):

```
├── Cargo.toml               # workspace Cargo na raiz — [profile.release] fica AQUI
├── .gitmodules              # URLs relativas: ../<repo>.git (org nebula-rs)
└── apps/
    ├── leptos-nebula/       # submódulo nebula-rs/leptos-nebula — crate + pacote JS (UnoCSS/preset)
    ├── leptos-native/       # submódulo nebula-rs/leptos-native — crate (ainda vazio)
    ├── leptos-press/        # submódulo nebula-rs/leptos-press — docs estilo VitePress (ADR-0006)
    └── docs/                # submódulo nebula-rs/nebula-docs — documentação PÚBLICA
```

A raiz é o repositório `nebula-rs/leptos-next`.

## Repositórios e submódulos

```bash
git clone --recurse-submodules git@github.com:nebula-rs/leptos-next.git
git submodule update --init          # se clonou sem --recurse-submodules
```

Fluxo de commit de uma mudança num app:

1. No submódulo (`cd apps/<app>`): commit (e push) no repositório do app.
2. Na raiz: `git add apps/<app>` (novo ponteiro) + docs/planos da mudança, commit (e push).

Mudança em vários apps = um commit em cada app + um na raiz. Os apps **não compilam isolados** (dependem do workspace da raiz) — ver consequências no ADR-0009.


## `/docs` × `/apps/docs`

São projetos distintos — não confunda:

| | `/docs` (esta) | `/apps/docs` |
|---|---|---|
| Público | Agentes de IA e mantenedores | Quem **consome** os pacotes |
| Conteúdo | Arquitetura, decisões, convenções, armadilhas, planos | Guia de uso, uma página por componente, exemplos vivos, API (no molde da docs do Quasar) |
| Quem atualiza | Os próprios agentes, a cada mudança | Junto com cada componente/feature pública |
| Tecnologia | VitePress | [`leptos-press`](../press/overview.md) (Leptos + comrak, visual do `leptos-nebula`) |
| Id no Moon | `docs` | `docs-app` |

Grafo de dependências: `apps/docs` → `leptos-press` → `leptos-nebula`.

Detalhe interno (como algo foi implementado, por que) vai em `/docs`; o que o usuário do pacote precisa saber vai em `/apps/docs`.

## Projetos

| Projeto | Caminho | Linguagem | Tarefas |
|---|---|---|---|
| `docs` | `docs/` | TypeScript (VitePress) | `dev`, `build`, `preview` |
| `leptos-nebula` | `apps/leptos-nebula/` | Rust (lib; crate `leptos-nebula`) + pacote JS | `css`, `css-check`, `css-fresh`, `check`, `check-wasm`, `check-ssr`, `lint`, `lint-wasm`, `fmt`, `test` |
| `leptos-press` | `apps/leptos-press/` | Rust (dois crates: `leptos-press` runtime e `leptos-press-build` host-only em `build/`) + pacote JS | `css`, `css-check`, `css-fresh`, `check`, `check-wasm`, `check-ssr`, `lint`, `lint-wasm`, `fmt`, `test` |
| `docs-app` | `apps/docs/` | Rust (app; lib `hydrate`/`csr` + bin `ssr` do SSG) | `dev`, `build`, `preview`, `check`, `check-wasm`, `check-ssr`, `lint`, `fmt` |

### `leptos-nebula`: tarefas

- `css` gera `style/dist/ui.css` (versionado); `css-check` valida os shortcuts; `css-fresh` gera em memória e falha se difere do arquivo versionado.
- `check`/`lint`/`fmt`/`test` no host; `check-wasm`/`lint-wasm` também para `wasm32-unknown-unknown`; `check-ssr` compila o crate com `leptos/ssr`.
- O playground temporário foi removido (plano 0002); `apps/docs` é o consumidor externo do ui.
- `pnpm run check` (raiz) inclui `css-check` e `css-fresh`.

### `leptos-press` e `docs-app`: tarefas

- `leptos-press:test` roda os testes do `leptos-press-build` no host, sem compilar o Leptos. `css`/`css-check`/`css-fresh` fazem o mesmo para o `press.css` (versionado).
- `docs-app:dev` — **CSR**: `trunk serve` em `http://localhost:8080` (saída em `dist/csr`). Um hook do Trunk roda o bin `press-static` para copiar `llms.txt`, `llms-full.txt` e as cópias `.md` para a pasta de saída.
- `docs-app:build` — **SSG**: `cargo leptos build --release` (wasm `hydrate` + bin `ssr`) e depois o bin `docs-app`, que gera um HTML por rota em `apps/docs/dist/site/<rota>/index.html`, copia os arquivos estáticos e termina. `docs-app:preview` serve essa pasta em `http://localhost:8081`.
- `dist/csr` e `dist/site` são diretórios diferentes de propósito: `dev` e `build` não podem escrever no mesmo `dist/` ao mesmo tempo ([armadilhas](./pitfalls.md)).

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
