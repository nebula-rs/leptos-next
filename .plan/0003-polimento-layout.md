# Plano 0003 — Polimento de layout (`leptos-press` + `List`/`Item` do ui)

- **Status:** Concluído (2026-10-09) — desvios em [Desvios registrados](#desvios-registrados)
- **Data do plano:** 2026-10-09
- **Escopo:** corrigir os problemas de layout vistos no `apps/docs` (captura do usuário em `/components/banner`, tema escuro, ~1900px). Nenhuma feature nova.
- **Depende de:** planos 0001 e 0002 (concluídos). **Depois:** plano 0004 (`Form`).

> **Nota (2026-10-12):** os crates foram renomeados depois deste plano — `leptos-ui` → `leptos-nebula` (pasta `apps/leptos-nebula`) ([ADR-0008](../docs/decisions/0008-nome-leptos-nebula.md)). Os nomes e caminhos abaixo são históricos.

> Este plano é autocontido: a sessão de implementação não viu a conversa de planejamento.
> Leia antes de começar: `docs/press/overview.md`, `docs/ui/overview.md`, `docs/guide/conventions.md` (regras de shortcuts — **estados exclusivos são shortcuts completos**, classes literais), `docs/guide/pitfalls.md`.

## Referência visual

O tema padrão do **VitePress** é a referência de layout de docs. Há um VitePress rodando localmente: a documentação interna (`moon run docs:dev`, http://localhost:5173). Compare lado a lado com `moon run docs-app:dev` (http://localhost:8080) e **meça lá** (DevTools) larguras e recuos em vez de chutar. Para listas/itens, a referência é o Quasar (`~/repos/quasar/ui/src/components/item/QItem.sass`).

Verificação de cada item: capturas (headless serve; ver `docs/guide/pitfalls.md` sobre modo escuro em headless) em **1920px, 1280px, 1024px e 375px**, claro e escuro, de `/`, `/guide/getting-started` e `/components/banner`.

---

## 1. `List`/`Item` (ui) — recuo horizontal consistente

**Sintoma:** na sidebar e no outline, o texto dos itens fica mais à esquerda que o rótulo de grupo ("Guia", "Componentes", "Nesta página"); o item ativo tem fundo encostado nas bordas da gaveta.

**Causa:** `apps/leptos-ui/uno/shortcuts.ts` — `lx-item-size-dense` usa `px-[sm]`, enquanto `lx-item-label-header` usa `px-[md]` sempre. No Quasar, `dense` reduz só a **altura**/padding vertical (`.q-item--dense { min-height: 32px; padding: 2px 16px }`); o recuo horizontal é o mesmo do item normal e do header.

**Correção (ui):**
- `lx-item-size-dense`: mesmo padding horizontal do normal; só altura e padding vertical menores.
- O padding horizontal de item e de `ItemLabel header` vem de **um** token de componente (ex.: `--lx-item-padding-x`), para nunca mais divergirem.
- `ItemLabel header`: confirmar alinhamento do texto com o texto do item (mesmo `padding-x`), e espaço acima maior entre grupos (o 1º grupo sem espaço extra).
- Teste do ui (host) ou checagem no `css-check`: `lx-item-size-dense` e `lx-item-label-header` usam o mesmo token de padding horizontal (pode ser um teste que lê `uno/shortcuts.ts`/`ui.css` e compara — ou registrar como verificação visual se ficar artificial).

**Correção (press):** `lxp-sidebar` e `lxp-outline` ganham padding horizontal próprio, para o fundo do item ativo/hover não tocar as bordas da gaveta (raio `--lx-item-radius` já existe).

---

## 2. Container: conteúdo + outline juntos e centralizados

**Sintoma:** em tela larga sobra um vão grande entre a sidebar e o conteúdo, e o outline fica colado na borda direita da janela.

**Causa:** `apps/leptos-press/src/layout.rs` põe o outline num `Drawer` (`side=Right`) na 3ª coluna do grid do `Layout`; o conteúdo centraliza sozinho (`lxp-content` com `mx-auto` e `max-w-[--lx-content-max-width]` = 72rem) no meio.

**Correção (press):**
- O outline deixa de ser `Drawer`: vira um `<aside>` **dentro** da área de conteúdo, num container `lxp-doc` = grid `[conteúdo | aside]`, centralizado, com largura máxima — como `VPDoc` do VitePress (medir no `/docs`: coluna de texto ~688px, aside ~224–256px, gap entre eles).
- Aside `sticky` abaixo do cabeçalho, com rolagem própria se for longo.
- Abaixo do breakpoint do outline (hoje 1280px, `layout.rs`), o aside some (v0). Registrar como próximo passo o "Nesta página" recolhível no topo do conteúdo, como o VitePress faz no mobile.
- Páginas sem outline (sem `h2`/`h3`) e a home: o container usa a largura sem aside, sem coluna vazia.
- O `Layout` do ui continua com 3 colunas (é API do ui); o press só deixa de usar a coluna direita. Remover o `outline_open`/`Drawer` direito e o código que só existia para ele.

---

## 3. Nav do cabeçalho

**Sintoma:** "Guia" (inativo) aparece em branco e negrito; "Componentes" (ativo) em cor primária — o inativo parece o ativo.

**Causa:** a nav usa `Btn flat` com `color=Primary` (ativo) / `Neutral` (inativo); o peso e a cor do `Btn` não foram pensados para links de navegação.

**Correção (press):** links de navegação como `<a>` com shortcuts próprios — `lxp-nav-link` e `lxp-nav-link-active` (**dois shortcuts completos**, não base + modificador): mesmo peso e tamanho nos dois estados; ativo = cor primária (e opcionalmente um indicador sob o texto); `aria-current="page"` no ativo. O ativo continua sendo calculado pela seção da rota atual (como hoje).

---

## 4. Caixa de exemplo (`ExampleBox`) e `DocExample`

**Sintoma:** o título da caixa ("Cores") repete o `h2` logo acima; a caixa é um `Card` com borda e o bloco de código dentro tem **outra** borda, raio e margem — bordas aninhadas e uma faixa vazia embaixo.

**Correção:**
- **Título opcional** no `ExampleBox` (press) e no `DocExample` (`apps/docs/build/components.rs`): sem `title`, não há barra de título. Revisar `apps/docs/content/components/*.md` e remover títulos que repetem o cabeçalho da seção.
- **Código encostado na base da caixa:** o `CodeBlock` ganha um modo "anexado" (prop, ex.: `attached: bool`) que troca `lxp-code` por **outro shortcut completo**, `lxp-code-attached` (sem borda própria exceto a superior, sem raio, sem margem). O `ExampleBox` renderiza o código nesse modo. O `Card` da caixa mantém a única borda externa.
- Palco do exemplo (`lxp-example-stage`) com padding consistente e alinhamento que funcione para componentes inline (`Btn`) e de bloco (`Banner` — hoje encolhem lado a lado; avaliar `flex-col`/`items-start` por padrão ou uma prop no `DocExample`, ex.: `layout="column"`). Registrar a escolha.

---

## 5. Barra do bloco de código

**Sintoma:** o selo da linguagem (`Badge outline`) é pequeno, com borda pesada, e a barra ocupa uma faixa inteira.

**Correção (press), no modelo do VitePress:**
- Sem barra: a linguagem vira um rótulo discreto no canto superior direito (texto pequeno, cor `on-surface-muted`, sem borda).
- O botão copiar fica no mesmo canto; aparece no **hover** do bloco **e** quando focado por teclado (`:focus-visible`/`focus-within`) — nunca inacessível. Em telas de toque (sem hover), sempre visível (`@media (hover: none)`).
- Ao copiar, o rótulo da linguagem dá lugar ao "Copiado" ou o ícone vira ✓ (como hoje).
- Rolagem horizontal do `<pre>` não pode ficar por baixo do botão (padding-right ou botão fora da área rolável).

---

## 6. Checagem geral (lista para a revisão visual)

Comparando com o `/docs` (VitePress), revisar e corrigir o que for pequeno; o que for grande vira item em "Fora deste plano":

- Recuo do título "leptos-ui" no cabeçalho alinhado com o texto dos itens da sidebar.
- Espaçamento vertical da "prose" (`apps/leptos-press/style/prose.css`): `h2` com borda superior + margem; parágrafo → exemplo → parágrafo.
- Larguras: sidebar (medir a do VitePress), conteúdo, aside.
- 375px: cabeçalho (menu, título, tema), gaveta sobreposta, código com rolagem horizontal, exemplos sem estourar a largura.
- Claro e escuro com o mesmo resultado estrutural.

---

## 7. Encerramento

- `pnpm run check` (inclui `css-check`/`css-fresh` de ui e press), testes do `leptos-press-build` (os snapshots mudam se o `DocExample` mudar — revisar o diff, não aceitar às cegas).
- Capturas antes/depois (1920 e 375px) anexadas ou descritas no plano.
- Atualizar `docs/`: `docs/press/overview.md` (layout `lxp-doc`, `CodeBlock attached`, `ExampleBox` com título opcional), `docs/ui/overview.md` (token `--lx-item-padding-x`, comportamento do `dense`), `docs/guide/pitfalls.md` (o que surgir), `docs/project/plans.md`.
- Marcar este plano como **Concluído** no topo, listando desvios.

## Desvios registrados

- **Referência VitePress:** não medi o `/docs` ao vivo; usei os valores padrão do tema (sidebar 272px, coluna de texto 688px, aside 224px, gap 64px). A sidebar do press ficou com 280px (`Drawer width`).
- **§1:** token `--lx-item-padding-x` (scandi); `dense` só reduz altura e padding vertical; cabeçalho de grupo com espaço acima (`lg`) e `first:pt-[sm]` no primeiro. O `css-check` do ui ganhou a verificação de que `lx-item-size-normal`, `lx-item-size-dense` e `lx-item-label-header` usam o token. `lxp-sidebar` ganhou `px-[sm]` e o título do cabeçalho `pl-[sm]` para alinhar com o texto dos itens.
- **§2:** outline virou `<aside class="lxp-aside">` dentro de `lxp-doc-aside` (3 shortcuts de container: `lxp-doc-aside`, `lxp-doc-plain`, `lxp-doc-wide`); `outline_open` e o `Drawer` direito foram removidos. O aside some em `<1280px` via `xl:` do UnoCSS.
- **§3:** `lxp-nav-link` e `lxp-nav-link-active` (completos), `aria-current="page"`. Sem indicador sob o texto (opcional).
- **§4:** `ExampleBox` com `title` opcional (`optional_no_strip`) e `column`; `DocExample` ganhou `layout="row|column"` (padrão `row`; a página do Banner usa `column`). `CodeBlock attached` + `code_block_attached` (shortcut `lxp-code-attached`). Títulos dos exemplos removidos das páginas.
- **§5:** barra removida: `lxp-code-tools` (rótulo + botão) no canto; botão com `group-hover`/`focus-within` e `@media(hover:none)`. `group` fica como classe literal no elemento, não no shortcut. O `<pre>` ganhou `pr-[4rem]`; com rolagem horizontal em 375px o rótulo ainda pode cobrir o fim da primeira linha (ajuste fino fica para depois).
- **§6:** margem do primeiro/último filho do conteúdo de alertas zerada (`prose.css`). Build release do `leptos-press` precisou de `#![recursion_limit = "256"]`.
- **Verificação:** capturas headless em 1920 (escuro), 1280, 1024 e 375px conferidas; o botão de copiar aparece sempre no headless (ele reporta `hover: none`), então o comportamento de hover real não foi exercitado.

## Fora deste plano

"Nesta página" recolhível no mobile, destaque da seção visível no outline (scroll spy), busca, páginas dos demais componentes.
