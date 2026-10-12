# `leptos-native` — visão geral

Runtime nativo montado sobre o **tooling** que o Tauri desenvolveu, **sem o framework Tauri**. Toda ponte entre frontend e nativo é **Rust dos dois lados**: nada de IPC JS, nada de `window.__TAURI__`, nada de bindings traduzidos para JavaScript.

::: warning Ainda não testado
Nada aqui foi validado. O trabalho começa por um **spike**; a API só é desenhada depois das respostas.
:::

## Peças do tooling do Tauri

| Crate | Papel |
|---|---|
| `wry` | WebView nativo por plataforma, *custom protocols*, canal IPC cru |
| `tao` | Janelas e laço de eventos, inclusive Android/iOS |
| `cargo-mobile2` | Gera o projeto Android Studio/Xcode para um app Rust |
| `tauri-bundler` | Instaladores desktop (msi, dmg, deb, AppImage) |

## A ponte

1. Um *custom protocol* do `wry` recebe `http::Request` e devolve `http::Response` — sem socket, sem rede.
2. O handler despacha para um `axum::Router` (como `tower::Service`, via `oneshot`) com as **server functions** do Leptos.
3. O frontend chama `#[server] fn` com tipos Rust de ponta a ponta.
4. O lado nativo implementa as capacidades (arquivos, notificações…) em Rust.
5. O mesmo protocolo serve os assets do frontend, embutidos no binário.

**Estrutura provável:** as `#[server] fn` num crate compartilhado, compilado com feature de cliente no frontend (wasm) e feature nativa no binário — no modelo `hydrate`/`ssr` do Leptos. O `leptos-native` fornece o handler, o registro das funções e o bootstrap (janela + WebView + protocolo).

## Spike — perguntas a responder

1. As server functions do Leptos 0.8 podem ser despachadas por um handler que **não é um servidor HTTP**?
2. Qual URL base no cliente? No Android/Windows um custom protocol vira `http://<scheme>.localhost`; no macOS/Linux, `<scheme>://localhost`. Como configurar isso do lado wasm na 0.8?
3. `wry` + `tao` sobem no Android sem o Tauri? Qual o papel do `cargo-mobile2` e da cola Kotlin que o `wry` exige (`android_binding!`)? Quanto do pipeline Gradle o Tauri fazia e precisará ser refeito?
4. Funciona num APK **sem a permissão `INTERNET`**? (Alvo: apps 100% offline.)

Entrega mínima do spike: as quatro respostas (mesmo negativas) e um "hello" de server function rodando no desktop.

## Risco a mapear, não esconder

"Só Rust" no Android esbarra em APIs da plataforma (permissões em tempo de execução, resultado de activity, notificações), que exigem JNI e às vezes um trecho Kotlin/Java. Identificar o **mínimo inevitável** e isolá-lo no crate, para que quem o usa nunca escreva Kotlin nem JS.
