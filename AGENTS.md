# AGENTS.md

Instruções para agentes de IA neste repositório.

**A fonte de verdade é a documentação interna em [`docs/`](docs/)** — este arquivo só aponta para ela ([ADR-0002](docs/decisions/0002-docs-fonte-unica.md)). Não duplique conteúdo aqui.

> `/docs` (interna, para agentes — você a mantém) ≠ `/apps/docs` (pública, para quem usa os pacotes). Ver [docs/guide/monorepo.md](docs/guide/monorepo.md#docs-×-apps-docs).

## Leia antes de trabalhar

| Assunto | Página |
|---|---|
| Visão, escopo e decisões pendentes | [docs/project/vision.md](docs/project/vision.md) |
| Setup, ferramentas, ambiente e comandos | [docs/guide/getting-started.md](docs/guide/getting-started.md) |
| Monorepo, projetos e tarefas Moon | [docs/guide/monorepo.md](docs/guide/monorepo.md) |
| Convenções de código e regras dos componentes | [docs/guide/conventions.md](docs/guide/conventions.md) |
| Armadilhas conhecidas (leia antes de depurar) | [docs/guide/pitfalls.md](docs/guide/pitfalls.md) |
| Referências externas (Quasar em `~/repos/quasar`, tema scandi) | [docs/guide/references.md](docs/guide/references.md) |
| Biblioteca de componentes, tokens e CSS | [docs/ui/overview.md](docs/ui/overview.md) |
| Formulários (Form › Field › Input) | [docs/ui/forms.md](docs/ui/forms.md) |
| `leptos-press` (docs estilo VitePress) e `apps/docs` | [docs/press/overview.md](docs/press/overview.md) |
| Runtime nativo e spike | [docs/native/overview.md](docs/native/overview.md) |
| Decisões de arquitetura (ADRs) e pontos em aberto | [docs/decisions/index.md](docs/decisions/index.md) |
| Planos de implementação (`.plan/`) | [docs/project/plans.md](docs/project/plans.md) |

## Regras de trabalho

- Consulte a página relevante acima antes de alterar código ou estrutura.
- Implementando um plano de `.plan/`? Siga-o e registre desvios nele.
- `apps/*` são **submódulos git** (um repositório por app): commit primeiro no submódulo, depois o ponteiro na raiz — [fluxo](docs/guide/monorepo.md#repositorios-e-submodulos).
- Se a mudança altera arquitetura, comandos ou convenções, atualize `docs/` no mesmo trabalho; decisão nova → novo ADR.
- Se algo não está documentado, pergunte ou proponha a documentação — não invente convenções.
- pnpm, nunca npm. Dependência de sistema faltando → peça ao usuário o `sudo apt-get install …` exato.
