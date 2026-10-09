# Armadilhas conhecidas

Problemas que já custaram tempo. Antes de depurar algo parecido, confira aqui; ao descobrir uma armadilha nova, registre-a.

| Sintoma | Causa | Correção |
|---|---|---|
| Build release do Trunk falha com *"memory.copy operations require bulk memory"* | Rust ≥ 1.87 emite bulk memory; o `wasm-opt` do Trunk (binaryen 123) não habilita por padrão | No `<link data-trunk rel="rust">`: `data-wasm-opt-params="--enable-bulk-memory --enable-nontrapping-float-to-int"` |
| Estado some / view quebra ao reexibir conteúdo de `<Show>` | Filhos de `<Show>` são **recriados** a cada exibição | Guarde os **dados** em `StoredValue`, não views já construídas |
| Erro de `Send`/`Sync` ao pôr store no contexto | Tipos `!Send` (ex.: `web_sys::Storage`, closures, futures no wasm) | `StoredValue::new_local` |
| `[profile.release]` sem efeito | Num membro do workspace ele é ignorado | Declarar no `Cargo.toml` da raiz |
| Falhas aleatórias de build | `trunk serve` aberto em paralelo com `trunk build` no mesmo `dist/` | Não rodar os dois juntos sobre o mesmo `dist/` |
| Shortcut do UnoCSS não aparece no CSS, sem erro | Nome começa com prefixo de variante (`empty-state` = variante `empty` + `state`) | Renomear (`state-empty`); a checagem de shortcuts detecta |
| Ícones lucide não carregam com pnpm | Carregamento automático do `presetIcons` não acha o pacote | Carregar a coleção explicitamente em `collections` |
| Moon falha com `ambiguous argument 'HEAD'` | `walkStrategy: 'vcs'` sem nenhum commit | Fazer o commit inicial |
