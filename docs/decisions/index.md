# Decisões de Arquitetura (ADRs)

Cada decisão relevante é registrada como um ADR curto e imutável. Para mudar uma decisão, crie um novo ADR que a **substitua** e marque o antigo como `Substituída por ADR-XXXX`.

| ADR | Título | Status |
|---|---|---|
| [0001](./0001-monorepo-moon.md) | Monorepo orquestrado pelo Moon | Aceita |
| [0002](./0002-docs-fonte-unica.md) | Docs VitePress como fonte única, inclusive para agentes de IA | Aceita |
| [0003](./0003-quasar-como-referencia.md) | Quasar como referência de API, comportamento e documentação | Aceita |
| [0004](./0004-ordem-form-field-input.md) | Formulários construídos na ordem Form › Field › Input | Aceita |
| [0005](./0005-entrega-do-css.md) | CSS pré-gerado + preset UnoCSS para quem usa o `leptos-nebula` | Aceita |
| [0006](./0006-leptos-press.md) | `leptos-press`: gerador de documentação estilo VitePress, com comrak | Aceita |
| [0007](./0007-press-csr-e-ssg.md) | `leptos-press` só com CSR e SSG — sem servidor em produção | Aceita |
| [0008](./0008-nome-leptos-nebula.md) | Nome `leptos-nebula` (componentes); `leptos-native` mantido | Aceita |
| [0009](./0009-repositorios-e-submodulos.md) | Um repositório por app, como submódulos do monorepo | Aceita |

## Em aberto

- Label flutuante × fixo no `Field`; designs na v0
- `leptos-press`: busca ([leptos-press](../press/overview.md))
- Dependências por caminho → por versão antes da primeira publicação real ([ADR-0009](./0009-repositorios-e-submodulos.md)); publicar versões utilizáveis dos nomes reservados ([ADR-0008](./0008-nome-leptos-nebula.md))
- Licença do conteúdo do `nebula-docs` (os crates são `MIT OR Apache-2.0`)
- Respostas do spike do `leptos-native` ([Native](../native/overview.md))

## Modelo

Copie `docs/decisions/template.md` para `NNNN-titulo-curto.md` e adicione na tabela acima e na sidebar (`.vitepress/config.ts`).
