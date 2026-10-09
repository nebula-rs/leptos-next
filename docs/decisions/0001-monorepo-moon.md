# ADR-0001: Monorepo orquestrado pelo Moon

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

O repositório reúne crates Rust (biblioteca de UI, runtime nativo) em `apps/`, a documentação pública (`apps/docs`) e a documentação interna em VitePress (`/docs`). É preciso um ponto único para rodar tarefas, com cache e grafo de dependências entre projetos.

## Decisão

- **Moon 2.x** como orquestrador; cada projeto tem seu `moon.yml` e é registrado em `.moon/workspace.yml`.
- Versões de ferramentas fixadas com **proto** (`.prototools`).
- **pnpm workspaces** para os pacotes JS; **um workspace Cargo na raiz** para os crates.
- Scripts do `package.json` raiz apenas delegam ao Moon.

## Consequências

- Comando padrão: `moon run <projeto>:<tarefa>`.
- O hasher usa `walkStrategy: 'vcs'`: o repositório precisa de git com ao menos um commit.
- Tarefas devem declarar `inputs`/`outputs` para aproveitar o cache.
- `[profile.*]` do Cargo só na raiz.
