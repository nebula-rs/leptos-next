# Planos de implementação

Trabalho grande é planejado numa sessão e implementado em outra. Os planos ficam em **`.plan/`** na raiz do repositório (fora do site da documentação), um arquivo por etapa.

## Regras

- Um plano é **autocontido**: quem implementa não viu a conversa de planejamento. Ele cita caminhos exatos de referência, critérios de aceite e decisões pendentes.
- O plano aponta para esta documentação em vez de copiá-la. Decisão tomada durante o planejamento vira ADR ou página aqui, não só texto no plano.
- Ao concluir uma etapa: marcar o plano como concluído (status no topo) e atualizar as páginas de `docs/` afetadas.
- Se a implementação divergir do plano, registre o desvio e o motivo no próprio plano.

## Planos

| Plano | Etapa | Status |
|---|---|---|
| `.plan/0001-ui-base-para-press.md` | Workspace Cargo, crate `leptos-nebula`, pipeline de CSS, tokens scandi, store de tema, componentes **parciais** que o press usa, playground temporário | Concluído (2026-10-09) |
| `.plan/0002-leptos-press-v0.md` | Spike do SSG; `leptos-press` (runtime + `leptos-press-build`), CSR + SSG, `llms.txt`; `apps/docs` com `DocExample`/`DocApi` e as primeiras páginas; remove o playground | Concluído (2026-10-09) |
| `.plan/0003-polimento-layout.md` | Polimento do layout do `leptos-press` e do `List`/`Item` do ui (alinhamentos, container conteúdo + outline, nav, exemplo e bloco de código) | Concluído (2026-10-09) |
| `.plan/0004-form.md` | `Form` + `use_form_child` com testes | Planejado |
