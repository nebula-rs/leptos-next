# ADR-0008: Nome `leptos-nebula` (componentes) e `leptos-native` (runtime)

- **Status:** Aceita
- **Data:** 2026-10-12

## Contexto

Os crates nasceram com nomes provisórios (`leptos-ui`, `leptos-native`). O `leptos-ui`/`leptos_ui` já existe no crates.io (projeto rust-ui), o que impediria publicar; o `leptos-native` está livre.

## Decisão

| Crate | Pasta | Papel |
|---|---|---|
| **`leptos-nebula`** | `apps/leptos-nebula` | Componentes, tokens e preset UnoCSS (pacote JS `leptos-nebula`, preset em `leptos-nebula/preset`) |
| **`leptos-native`** | `apps/leptos-native` | Runtime nativo — **mantém o nome original**: é infraestrutura genérica (WebView + server functions), independente da marca dos componentes |
| `leptos-press` | `apps/leptos-press` | Inalterado |

- Padrão `leptos-<nome>`: aparece nas buscas por "leptos" no crates.io e forma uma família com o `leptos-press` e o `leptos-native`. Só a biblioteca de componentes leva a marca.
- **Nebula:** mantém o tema astronômico do Quasar sem apontar para ninguém — e uma nebulosa é, literalmente, uma nuvem: um design system sem forma fixa, que muda de forma com o tema.
- O prefixo `lx` de classes e tokens fica (lê-se "leptos").
- Disponibilidade no crates.io conferida em 2026-10-12: `leptos-nebula` e `leptos-native` livres.

### Descartados

| Nome | Motivo |
|---|---|
| `leptos-ui` | Já existe no crates.io |
| **Pulsar** (`leptos-pulsar`) | Pulsar é o nome da empresa que detém o Quasar — sugeriria vínculo oficial. Não reconsiderar |
| Nova, Lumen, Lux | Genéricos demais; preferência pelo Nebula |

## Consequências

- Planos 0001–0003 citam os nomes antigos como registro histórico (nota no topo de cada um).
- **Nomes reservados no crates.io em 2026-10-12** com versões de reserva `0.0.0-wip` (sem código, README apontando para o repositório): `leptos-nebula`, `leptos-native`, `leptos-press`, `leptos-press-build`. Os pacotes de reserva não estão no repositório (são só `Cargo.toml` + `lib.rs` vazio + README).
- A [política do crates.io](https://crates.io/policies) proíbe reservar nomes por período prolongado sem funcionalidade ou desenvolvimento ativo no repositório: **publicar uma versão utilizável de cada crate o quanto antes** e manter os repositórios ativos. O `leptos-native` é o mais exposto (repositório só com o commit inicial).
- Nos `Cargo.toml` reais os crates continuam `publish = false` até a primeira versão utilizável (que exigirá trocar as dependências por caminho — ADR-0009).
