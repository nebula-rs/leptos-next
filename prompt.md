# Kickoff: biblioteca de componentes + runtime nativo para Leptos

## Visão

Um projeto próprio, independente, que dê ao Leptos o que o Quasar dá ao Vue: componentes
prontos, temas por tokens e o mesmo código rodando na web, no desktop e no mobile.
São dois crates:

1. **`<nome>-ui`** — biblioteca de componentes + tokens de tema + preset UnoCSS.
2. **`<nome>-native`** (nome a definir) — runtime nativo montado sobre o **tooling** que o
   Tauri desenvolveu (`wry`, `tao`, `cargo-mobile2`, `tauri-bundler`), **sem o framework Tauri**.
   Toda ponte entre o frontend e o nativo é **Rust dos dois lados**: nada de IPC JS, nada de
   `window.__TAURI__`, nada de bindings traduzidos para JavaScript.

O repositório deve ter um app de exemplo (`examples/`) que serve de vitrine dos componentes e
de prova do runtime nativo — é por ele que tudo é validado.

## Antes de escrever código, pergunte-me

- Nome do projeto e dos crates; onde fica o repositório.
- Idioma da API: proposta = identificadores em inglês, comentários e docs em português.
- Licença.

## Crate 1 — `<nome>-ui`

**Escopo v0:**
- Componentes: Button, Card, Tag, Dialog, Segmented, DataTable, DetailList, Feedback (alerta,
  estado vazio, spinner), campos de formulário, PageHeader, BottomBar, Progress (segmentado),
  Stat, ThemeSwitcher.
- Store de tema: `data-theme` e `data-mode` no `<html>`, claro/escuro.
- Tema **`scandi`**: minimalista escandinavo, com paleta linho/tinta/fiorde/musgo/âmbar/argila,
  muito respiro, bordas finas, quase sem sombra e um acento frio.

**Implementações de referência do tema scandi** (consultar, não depender delas):
- `~/repos/omg-data-sync/frontend`: `style/tokens/` (primitivos → semânticos), `uno.config.ts`
  (shortcuts), `src/components/`, `scripts/check-shortcuts.mjs`, `docs/frontend/overview.md`.
- `~/repos/ws-jodias-concurso/apps/passei-app`: o mesmo tema adaptado para leitura no celular
  (coluna única, corpo maior, barra inferior fixa).

**Arquitetura de tokens, em três camadas:** primitivos (valores crus) → semânticos por tema
(`--color-surface`, `--space-md`…) → tokens de componente (`--btn-radius`…). Componentes só
usam semânticos e de componente. Um tema novo é só um arquivo de tokens.

**Decisão central — como o CSS chega a quem usa o crate.** O UnoCSS lê `.rs` como texto, então
as classes de um crate dependência não são vistas automaticamente. Avalie e recomende:
(a) o crate **entrega CSS pré-gerado** dos próprios componentes + os arquivos de tokens, e
exporta um **preset UnoCSS** para o app usar os mesmos shortcuts no próprio markup; ou
(b) o app inclui o fonte do crate no `content` do UnoCSS. Minha inclinação é (a). Resolva
também como um app com Trunk referencia esses arquivos.

**Regras — são restrições aprendidas na prática, não sugestões:**
- Classes **sempre literais** no código; escolher com `match`, nunca `format!`.
- Nome de shortcut não pode começar com prefixo de variante (`empty-`, `hover-`, `focus-`,
  `first-`, `last-`…): some do CSS sem aviso. A checagem de shortcuts vira teste do crate.
- Estados mutuamente exclusivos são shortcuts completos (`alt-correct`, `alt-wrong`), não
  modificador sobre base com cor: a ordem no CSS não é a ordem das classes.
- O tema do UnoCSS só aponta para tokens (`var(--…)`).
- Ícones lucide via `presetIcons`, com a coleção carregada explicitamente (com pnpm, o
  carregamento automático não acha o pacote).

## Crate 2 — `<nome>-native`

**Peças do tooling do Tauri a usar diretamente:**

| Crate | Papel |
|---|---|
| `wry` | WebView nativo por plataforma, *custom protocols*, canal IPC cru |
| `tao` | Janelas e laço de eventos, inclusive Android/iOS |
| `cargo-mobile2` | Gera o projeto Android Studio/Xcode para um app Rust |
| `tauri-bundler` | Instaladores desktop (msi, dmg, deb, AppImage) |

**A ponte:** um custom protocol do `wry` recebe `http::Request` e devolve `http::Response`,
sem socket e sem rede. O handler despacha para um `axum::Router` (como `tower::Service`, via
`oneshot`) com as **server functions** do Leptos. O frontend chama `#[server] fn` com tipos
Rust de ponta a ponta. O lado nativo implementa as capacidades (arquivos, notificações etc.)
em Rust. O mesmo protocolo serve os assets do frontend embutidos no binário.

**Estrutura provável:** as `#[server] fn` ficam num crate compartilhado, compilado com feature
de cliente no frontend (wasm) e feature nativa no binário — no modelo `hydrate`/`ssr` do
Leptos. O `<nome>-native` fornece o handler, o registro das funções e o bootstrap
(janela + WebView + protocolo).

**Isto não foi testado. Comece por um spike** e só depois desenhe a API. O spike responde:
1. As server functions do Leptos 0.8 podem ser despachadas por um handler que não é um
   servidor HTTP?
2. Qual URL base no cliente: no Android/Windows um custom protocol vira
   `http://<scheme>.localhost`, no macOS/Linux `<scheme>://localhost`. Como configurar isso
   do lado wasm na 0.8?
3. `wry` + `tao` sobem no Android sem o Tauri? Qual o papel do `cargo-mobile2` e da cola
   Kotlin que o `wry` exige (`android_binding!`)? Quanto do pipeline Gradle o Tauri fazia
   por nós e precisará ser refeito?
4. Funciona num APK **sem a permissão `INTERNET`**? (O alvo é poder fazer apps 100% offline.)

**Risco a mapear, não a esconder:** "só Rust" no Android esbarra em APIs da plataforma
(permissões em tempo de execução, resultado de activity, notificações), que exigem JNI e às
vezes um trecho Kotlin/Java. Identifique o mínimo inevitável e isole-o no crate, para que
quem o usa nunca escreva Kotlin nem JS.

**Fora da v0:** CLI unificada com modos (`dev -m android`), PWA, updater, iOS.

## Armadilhas que já custaram tempo

- **Rust ≥ 1.87 + o `wasm-opt` do Trunk (binaryen 123):** o build release falha com
  "memory.copy operations require bulk memory". Correção: no `<link data-trunk rel="rust">`,
  `data-wasm-opt-params="--enable-bulk-memory --enable-nontrapping-float-to-int"`.
- **Filhos de `<Show>`** são recriados a cada exibição: guarde os **dados** em `StoredValue`,
  não views já construídas.
- **Tipos `!Send`** (ex.: `web_sys::Storage`) num store em contexto: `StoredValue::new_local`.
- **`[profile.release]` num membro do workspace é ignorado**: ele fica na raiz.
- Um `trunk serve` aberto em paralelo com `trunk build` no mesmo `dist/` causa falhas falsas.

## Ambiente

- pnpm, nunca npm.
- Dependência de sistema faltando → me pedir o `sudo apt-get install …` exato; não improvise.
- `JAVA_HOME`, `ANDROID_HOME` (`~/Android/Sdk`) e `NDK_HOME` (NDK 29.0.14206865) estão no topo
  do `~/.bashrc`. Targets Rust Android já instalados.

## Entrega da primeira sessão

1. As perguntas acima respondidas por mim.
2. Crate 1 com Button, Card e Tag portados + tokens scandi + preset, rodando no app de exemplo,
   com a decisão do CSS justificada.
3. Spike do crate 2 com respostas às quatro perguntas, mesmo que negativas, e um "hello"
   de server function rodando no desktop.
