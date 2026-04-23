# gameplay-sync — Mobile ↔ Web-next

Sincroniza o estado da gameplay do mobile com o GM do `apps/web-next` via
`BroadcastChannel`.

## Arquitetura

```
┌────────────────────────┐                  ┌────────────────────────┐
│ apps/web-next (GM tab) │ ──broadcast──►   │ apps/mobile (Expo Web) │
│ localhost:3000         │  gm:state-sync   │ localhost:8081         │
│ gameplayStore          │                  │ gameplayStore (mobile) │
└────────────────────────┘                  └────────────────────────┘
         ▲                                           │
         └──────────── player:join ──────────────────┘
```

- GM (web-next) emite snapshots periódicos (`gm:state-sync`) com o
  world-state no formato do próprio store.
- Mobile escuta, **traduz** o shape pra mobile (`translate.ts`), e aplica
  no store local via `setState`.
- Mobile emite `player:join` no mount pra pedir snapshot inicial sem
  debounce.

## ⚠ Pré-requisito: mesmo origin

`BroadcastChannel` é bloqueado pelo browser entre origens diferentes. O
web-next roda em `localhost:3000` e o Expo Web em `localhost:8081` —
**origens diferentes**, canal não cruza.

### Solução 1 — Proxy reverso local (recomendado)

Subir um proxy que serve ambos em `localhost:8000`:

**Com Caddy** (`Caddyfile` na raiz):

```caddy
:8000 {
    handle_path /mobile/* {
        reverse_proxy localhost:8081
    }
    handle {
        reverse_proxy localhost:3000
    }
}
```

Rodar: `caddy run`. Depois acessar:

- GM: `http://localhost:8000/gameplay/demo?as=gm`
- Mobile: `http://localhost:8000/mobile/dev/gameplay/demo`

Ambos em origem `localhost:8000` → BroadcastChannel funciona.

**Com `local-ssl-proxy` ou `http-proxy-cli`** funciona análogo — config
mínima de rota.

### Solução 2 — Mesma porta (nem sempre viável)

Se conseguir rodar Expo Web e Next.js no mesmo host+porta (raro, conflito
natural), BroadcastChannel funciona sem proxy. Não recomendo.

### Solução 3 — Sem sync cross-app (fallback)

Se não subir proxy, o sync funciona internamente dentro de **cada app**:
duas abas do web-next conversam entre si; duas abas do mobile conversam
entre si. Cross-app fica desabilitado — nenhum erro, só não sincroniza.

## O que é traduzido

Hoje o translator (`translate.ts`) cobre apenas **tokens** e **flags
básicas de combate** (active, currentTurnIndex). Outros campos
(`fogCells`, `messages`, `markers`, `mapObjects`) têm shapes muito
divergentes e ficam pendentes.

Pra adicionar novo campo:

1. Descobrir shape no payload do web-next (ver
   `apps/web-next/src/lib/gameplay-sync/world-state-keys.ts`).
2. Adicionar campo em `WebNextSnapshot` no `translate.ts`.
3. Escrever função de tradução pro shape mobile.
4. Incluir no `translateSnapshot`.
5. Aplicar no `useWebSync` (já pega qualquer campo retornado pelo patch).

## Limitações conhecidas

- **Sync é one-way** (GM → mobile). Mobile não re-envia ações de volta
  ainda. Pra bidirecional, replicar o que o `web-next` faz em
  `useGameplayBroadcastSync` (listener de `player:*` actions).
- **Sem versioning de lockfile**: conflito de escrita simultânea é
  last-write-wins. Aceitável no MVP.
- **Native runtime (Expo Go)** não tem `BroadcastChannel` → o hook
  detecta via `typeof BroadcastChannel === "undefined"` e vira noop.
  Sync só opera em Expo Web.

## Quando migrar pra Socket.IO

Essa camada inteira (`broadcast-sync.ts` no web-next + `gameplay-sync/`
no mobile) é **ponte de dev**. Quando o backend subir, troca por
Socket.IO e mantém a mesma interface de payload. A shape do snapshot
(`WebNextSnapshot`) vira o contrato do evento do servidor.
