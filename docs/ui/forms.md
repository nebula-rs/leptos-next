# Formulários: Form › Field › Input

Os componentes de formulário são construídos nesta ordem ([ADR-0004](../decisions/0004-ordem-form-field-input.md)), espelhando o Quasar:

| Peça | ≈ Quasar | Papel |
|---|---|---|
| `Form` | `QForm` | Renderiza `<form>`, coordena validação, submit e reset dos filhos registrados |
| `use_form_child` | `useFormChild` | Contrato que qualquer campo usa para se registrar no `Form` mais próximo |
| `Field` | `QField` (`use-field`) | O "quadro" do campo: label, hint, erro, prefix/suffix, slots, design, `rules`. Implementa `use_form_child` |
| `Input`, `Select`… | `QInput`, `QSelect` | Controle nativo dentro do `Field`; herdam tudo do `Field` |

Referências no Quasar: `ui/src/components/form/QForm.{js,json,test.js}`, `ui/src/composables/use-form/use-form-child.js`, `docs/src/pages/vue-components/form.md` ([Referências](../guide/references.md)).

## Form

### Comportamento (portado do QForm)

- **Registro:** o `Form` fornece um contexto; cada filho se registra ao ser criado e sai ao ser descartado (`on_cleanup`). Filho `disabled` não fica registrado e tem a validação limpa ao ser desabilitado.
- **`validate(should_focus)`**:
  - padrão: valida os filhos **em sequência**, na ordem de registro, e para no primeiro inválido;
  - `greedy`: valida **todos** concorrentemente e coleta os inválidos;
  - uma validação que falha de forma inesperada conta como inválida, sem derrubar o `Form`;
  - um contador de validações descarta resultados **superados** (uma validação mais nova começou antes desta terminar): nenhum evento é emitido por uma validação superada;
  - em erro, foca o primeiro filho inválido que aceite foco, exceto com `no_error_focus` (um `should_focus` explícito sobrepõe a prop);
  - emite `on_validation_success` ou `on_validation_error` (com a identificação do primeiro filho inválido).
- **`submit`:** previne o envio nativo, valida; se válido e não superado, chama `on_submit`. Sem `on_submit`, faz o envio nativo do `<form>`.
- **`reset`:** chama `on_reset` **antes** de limpar as validações (para o app zerar os valores primeiro); depois `reset_validation()` e, com `autofocus` e sem `no_reset_focus`, `focus()`.
- **`focus`:** primeiro `[autofocus]`/`[data-autofocus]` com `tabindex`, senão o primeiro elemento com `tabindex` ≠ -1.
- **`autofocus`:** chama `focus()` ao montar.

### API proposta

| Quasar | `<nome>-ui` |
|---|---|
| props `autofocus`, `no-error-focus`, `no-reset-focus`, `greedy` | `autofocus`, `no_error_focus`, `no_reset_focus`, `greedy` (`bool`) |
| `@submit`, `@reset` | `on_submit: Callback<SubmitEvent>`, `on_reset: Callback<()>` |
| `@validation-success`, `@validation-error(ref)` | `on_validation_success`, `on_validation_error: Callback<FormChildId>` |
| métodos via `ref` | `FormHandle` (`Copy`): `validate`, `reset_validation`, `submit`, `reset`, `focus`, `children` |
| atributos HTML extras (`action`, `method`, `autocomplete`…) | repassados ao `<form>` |

### `use_form_child`

O filho informa: `validate` (assíncrono → `bool`), `reset_validation`, `focus` (opcional), `disabled: Signal<bool>` e uma identificação. Sem `Form` acima, não faz nada — exceto com `requires_form`, que registra erro no console.

### Decisões de implementação

- **Validação assíncrona desde o início.** `validate` devolve uma future (`LocalBoxFuture<'static, bool>`); regra síncrona é uma future já resolvida. Permite regra que chama `#[server] fn` — liga com o [runtime nativo](../native/overview.md).
- **Registro em `StoredValue::new_local`:** closures e futures no wasm são `!Send` ([Armadilhas](../guide/pitfalls.md)).
- **Coordenação separada do DOM:** ordem, `greedy`, descarte de resultados superados e escolha de quem recebe foco ficam num módulo puro, testado no host. O componente só liga isso ao `<form>` e ao DOM.

### Em aberto

- Integração com `ActionForm`/`ServerAction` do Leptos (validar e então despachar uma server function).
- Resumo agregado de erros acessível (o Quasar não tem; sugerido na doc de acessibilidade dele).

## Field

A planejar. API de partida: `ui/src/composables/private.use-field/use-field.json` no Quasar (`label`, `stack-label`, `hint`, `prefix`/`suffix`, `clearable`, `loading`, `counter`, designs `filled`/`outlined`/`standout`/`borderless`, `rounded`, `square`, `dense`, `disable`, `readonly`; slots `prepend`, `append`, `before`, `after`, `label`, `error`, `hint`, `counter`; `rules`, `lazy-rules`, `error`/`error-message`).

Pendente: label flutuante (Quasar) × fixo acima (scandi), ou ambos via `stack_label`; quais designs entram na v0.

## Input

A planejar. API: `ui/src/components/input/QInput.json` + mixins (`use-field`, `use-mask`, `private.use-form`). Máscara (`use-mask.js`) como módulo Rust puro, com os testes de `use-mask.test.js` como roteiro.
