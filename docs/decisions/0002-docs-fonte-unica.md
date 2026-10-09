# ADR-0002: Docs como fonte única, inclusive para agentes de IA

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

O trabalho é dividido entre sessões de agentes (planejamento numa, implementação em outra). Ferramentas de IA (Claude Code, Codex/agents, Gemini, GitHub Copilot) leem arquivos de contexto próprios; duplicar conteúdo neles gera divergência.

## Decisão

- `docs/` (VitePress) é a **única fonte de verdade interna** sobre visão, arquitetura, convenções, armadilhas e comandos. Os agentes a leem e a **mantêm atualizada**.
- Ela não é a documentação pública dos pacotes: essa fica em `apps/docs`, para quem consome os crates ([`/docs` × `/apps/docs`](../guide/monorepo.md#docs-×-apps-docs)).
- `AGENTS.md` é o arquivo canônico para agentes e contém apenas **ponteiros** para páginas de `docs/` e regras de trabalho.
- `CLAUDE.md`, `GEMINI.md` e `.github/copilot-instructions.md` apenas redirecionam para `AGENTS.md`.
- Planos de implementação ficam em `.plan/` e apontam para `docs/` ([Planos](../project/plans.md)).
- O build gera `llms.txt` e `llms-full.txt` via `vitepress-plugin-llms`.

## Consequências

- Nova convenção ou decisão → escrever em `docs/`; os arquivos de agentes só mudam se surgir página nova a apontar.
- `prompt.md` (kickoff) é histórico: o conteúdo estável dele foi movido para `docs/`.
