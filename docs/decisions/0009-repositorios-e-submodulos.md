# ADR-0009: Um repositório por app, como submódulos do monorepo

- **Status:** Aceita
- **Data:** 2026-10-12

## Contexto

Os crates são publicados e evoluem separadamente (`leptos-nebula`, `leptos-press`, `leptos-native`) e a documentação pública (`apps/docs`) é um site à parte. Ao mesmo tempo, o desenvolvimento acontece junto: workspace Cargo, workspace pnpm, Moon, documentação interna e planos na raiz.

## Decisão

Organização GitHub **`nebula-rs`**:

| Repositório | Caminho no monorepo |
|---|---|
| `leptos-next` | raiz (superprojeto: Moon, workspace Cargo/pnpm, `/docs` interna, `.plan/`) |
| `leptos-nebula` | `apps/leptos-nebula` (submódulo) |
| `leptos-press` | `apps/leptos-press` (submódulo) |
| `leptos-native` | `apps/leptos-native` (submódulo) |
| `nebula-docs` | `apps/docs` (submódulo) |

- `.gitmodules` usa **URLs relativas** (`../leptos-nebula.git`): o submódulo é clonado pelo mesmo caminho do superprojeto (SSH com alias, HTTPS…).
- Cada submódulo tem o próprio `.gitignore` (o da raiz não se aplica dentro dele) e, nos crates, os arquivos `LICENSE-MIT`/`LICENSE-APACHE`.
- O Moon (hasher `vcs`) enxerga mudanças dentro dos submódulos — verificado em 2026-10-12 (alterar `src/lib.rs` invalida o cache; reverter volta ao cache).

## Consequências

- Clonar com `git clone --recurse-submodules` (ou `git submodule update --init` depois).
- **Fluxo de commit:** primeiro no submódulo (commit + push no repo do app), depois na raiz o novo ponteiro (`git add apps/<app>`) junto com docs/planos daquela mudança. Uma mudança que toca vários apps gera um commit em cada um + um na raiz.
- Os submódulos **não compilam sozinhos** hoje: usam `{ workspace = true }`, o `Cargo.lock` e o workspace pnpm da raiz, e dependem uns dos outros por caminho (`leptos-press` → `leptos-nebula`; `apps/docs` → ambos). Compilar/publicar cada um isoladamente exige trocar para dependências por versão (crates.io) ou git — decidir antes da primeira publicação.
- Os arquivos gerados versionados (`style/dist/ui.css`, `style/dist/press.css`) e a checagem `css-fresh` passam a viver no repositório de cada app.
