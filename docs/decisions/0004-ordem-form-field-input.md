# ADR-0004: Formulários construídos na ordem Form › Field › Input

- **Status:** Aceita
- **Data:** 2026-10-09

## Contexto

No Quasar, `QInput`/`QSelect` herdam quase toda a API de `QField` (via `use-field`), e `QField` se registra no `QForm` (via `useFormChild`). Começar pelo `Input` obrigaria a redesenhar o contrato de validação depois.

## Decisão

Implementar nesta ordem: `Form` (+ `use_form_child`) → `Field` → `Input` / `Select` / demais campos. Cada etapa define o contrato que a seguinte consome.

## Consequências

- O `Form` é validado antes de haver campos reais: o `apps/docs` usa um filho provisório que chama `use_form_child`.
- O contrato de validação nasce assíncrono ([Formulários](../ui/forms.md#decisoes-de-implementacao)).
