# ADR-0005: CSS pré-gerado + preset UnoCSS para quem usa o `<nome>-ui`

- **Status:** Proposta
- **Data:** 2026-10-09

## Contexto

O UnoCSS lê arquivos `.rs` como texto para descobrir classes. Classes usadas dentro de um crate dependência (em `~/.cargo/registry` ou num path do workspace) não são vistas pelo UnoCSS do app. Opções:

- **(a)** o crate entrega **CSS pré-gerado** dos próprios componentes + os arquivos de tokens, e exporta um **preset UnoCSS** com os mesmos shortcuts para o app usar no próprio markup;
- **(b)** o app inclui o fonte do crate no `content` do UnoCSS.

## Decisão (proposta)

**(a).** O CSS dos componentes passa a ser artefato versionado junto com o crate, independente do caminho onde o Cargo o colocou; o app só gera CSS para o próprio markup.

A confirmar na implementação:
- como um app Trunk referencia os arquivos (ex.: `<link data-trunk rel="css">` apontando para arquivos copiados para o app por um passo de build, ou expostos por um pacote JS no workspace pnpm);
- como evitar CSS duplicado quando o app usa um shortcut que o crate já gerou;
- a checagem de shortcuts (nenhum some em silêncio) como teste do crate.

## Consequências

- O crate precisa de um passo que gera e verifica o CSS dele (UnoCSS sobre os próprios `.rs`).
- (b) fica descartada por depender do caminho do crate no disco e por gerar o CSS da biblioteca em cada app.
