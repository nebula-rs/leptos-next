# ADR-0006: `leptos-press` — gerador de documentação estilo VitePress, com comrak

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

A documentação pública (`apps/docs`) deve ser feita com o próprio `<nome>-ui` (como a do Quasar é feita com o Quasar) e ainda assim ter o que o VitePress dá de graça: páginas em Markdown e `llms.txt`/`llms-full.txt`. Nada pronto no ecossistema Rust cobre isso:

- Renderizadores Leptos de Markdown ([leptos-md](https://github.com/epenabella/leptos-md)) interpretam em tempo de execução e não embutem componentes compilados; [leptos-markdown](https://github.com/rambip/leptos-markdown) foi arquivado.
- Geradores de `llms.txt` em Rust partem da API do rustdoc (`cargo-llms-txt`, `rustdoc-llms`) ou são presos ao mdBook (`mdbook-llms-txt-tools`).
- Projetos como [typstify](https://github.com/longcipher/typstify) e [Cinnog](https://docs.rs/crate/cinnog/latest) servem de estudo, não de dependência.

## Decisão

Separar em dois projetos:

| Projeto | Pasta | Papel |
|---|---|---|
| **`leptos-press`** | `apps/leptos-press` | Crate **genérico** para sites de documentação estilo VitePress: Markdown → páginas Leptos no build, layout de docs, `llms.txt`. Consome o `<nome>-ui` (visual pelos tokens) e não conhece os componentes que documenta |
| **`docs`** | `apps/docs` | A documentação pública dos pacotes, **construída com o `leptos-press`**. Contém o conteúdo e os componentes específicos (`DocExample`, `DocApi`) |

- Engine de Markdown: **[comrak](https://crates.io/crates/comrak)** (0.56): GFM, front-matter, alertas `> [!NOTE]` (mesma sintaxe dos `.md` do Quasar), containers `:::` (`block_directive`), notas de rodapé, ids de cabeçalho, realce via syntect.
- Markdown é processado **no build** e vira código Leptos — o parser não vai para o wasm. Detalhes em [leptos-press](../press/overview.md).

## Consequências

- Grafo: `docs` → `leptos-press` → `<nome>-ui`. O `leptos-press` precisa de alguns componentes do ui (botão, alerta, bloco de código, layout) antes de existir — afeta a ordem dos planos.
- O `leptos-press` é publicável sozinho; deve ficar genérico (nada de Form/Field nele).
- Exemplos e tabelas de API são compilados: exemplo quebrado quebra o build da documentação.
- Esta `/docs` interna continua em VitePress; migrá-la para o `leptos-press` fica como possibilidade futura (dogfooding), não como meta.
