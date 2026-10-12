# Visão e escopo

Um projeto próprio e independente que dê ao **Leptos** o que o **Quasar** dá ao Vue: componentes prontos, temas por tokens e o mesmo código rodando na web, no desktop e no mobile.

## Entregáveis

| Peça | O que é |
|---|---|
| **`leptos-nebula`** (`apps/leptos-nebula`) | Biblioteca de componentes Leptos + tokens de tema + preset UnoCSS — [UI](../ui/overview.md) |
| **`leptos-native`** (`apps/leptos-native`) | Runtime nativo sobre o *tooling* do Tauri (`wry`, `tao`, `cargo-mobile2`, `tauri-bundler`), **sem o framework Tauri**. Ponte frontend ↔ nativo em **Rust dos dois lados** — [Native](../native/overview.md) |
| **`leptos-press`** (`apps/leptos-press`) | Crate genérico de documentação estilo VitePress (Markdown via comrak, `llms.txt`) sobre o `leptos-nebula` — [leptos-press](../press/overview.md) |
| **`apps/docs`** | Documentação **pública** para quem usa os pacotes, no molde da documentação do Quasar: uma página por componente, exemplos vivos com o código ao lado, tabela de API. Feita com o `leptos-press` (logo, estilizada pelo `leptos-nebula`) e prova do runtime nativo. **É por ela que tudo é validado.** |
| **`/docs`** (esta) | Documentação **interna** em VitePress: arquitetura, decisões, convenções, planos — contexto para os agentes, mantido por eles. Ver [`/docs` × `/apps/docs`](../guide/monorepo.md#docs-×-apps-docs) |

## Escopo v0 do `leptos-nebula`

- **Formulários**, nesta ordem ([ADR-0004](../decisions/0004-ordem-form-field-input.md)): `Form` → `Field` → `Input` / `Select` / demais campos.
- Demais componentes: Button, Card, Tag, Dialog, Segmented, DataTable, DetailList, Feedback (alerta, estado vazio, spinner), PageHeader, BottomBar, Progress (segmentado), Stat, ThemeSwitcher.
- Store de tema: `data-theme` e `data-mode` no `<html>`, claro/escuro.
- **Três temas iniciais**, todos com claro/escuro — detalhes em [UI → Temas](../ui/overview.md#temas):
  - **`scandi`**: minimalista escandinavo — paleta linho/tinta/fiorde/musgo/âmbar/argila, muito respiro, bordas finas, quase sem sombra, um acento frio. Primeiro a ser implementado;
  - **Material Design 3**;
  - **Liquid Glass**.

## Fora da v0

CLI unificada com modos (`dev -m android`), PWA, updater, iOS.

## Decisões pendentes

| Decisão | Situação |
|---|---|
| Nome do projeto e dos crates | **Decidido** (2026-10-12): `leptos-nebula` (ui), `leptos-native` (runtime), `leptos-press` — [ADR-0008](../decisions/0008-nome-leptos-nebula.md). Ainda `publish = false` até a primeira versão pública |
| Licença | **Decidida:** `MIT OR Apache-2.0` (`LICENSE-MIT`, `LICENSE-APACHE` na raiz) |
| Idioma da API | Proposta: identificadores em inglês, comentários e docs em pt-BR (adotada nas [convenções](../guide/conventions.md)) |
| Entrega do CSS a quem usa o crate | **Decidida:** CSS pré-gerado + preset — [ADR-0005](../decisions/0005-entrega-do-css.md) |
| Label do campo: flutuante (Quasar) × fixo acima (scandi) | Pendente — ver [Formulários](../ui/forms.md) |
| Tecnologia do `apps/docs` | **Decidida:** `leptos-press` + comrak — [ADR-0006](../decisions/0006-leptos-press.md) |
| Ordem dos planos | **Decidida:** base do ui para o press (parcial) → `leptos-press` + `apps/docs` → Form › Field › Input — [Planos](./plans.md) |
| Modos do `leptos-press` | **Decidido:** CSR + SSG, sem servidor — [ADR-0007](../decisions/0007-press-csr-e-ssg.md) |
| Prefixo de classes e tokens (o `q-` do Quasar) | **Decidido:** `lx` — classes `lx-btn`, tokens `--lx-color-primary` |
