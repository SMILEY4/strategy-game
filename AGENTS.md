# AGENTS.md

## Project structure

Monorepo with two top-level directories:

- `server/` — Kotlin 2.2 + Ktor 3.4 backend (Gradle 8.14, JVM 21)
- `webapp/` — React 19 + TypeScript 6 + Vite 8 frontend

No CI, no pre-commit hooks, no task runner at root.

## Server (`server/`)

### Build & run

```sh
cd server
./gradlew build                                   # compile + detekt + test
./gradlew :src:application:run                    # start dev server (localhost:8080)
./gradlew test                                    # all tests
./gradlew :src:application:test                   # single module tests
./gradlew :src:application:detekt                 # lint single module
```

Server config: `server/src/application/src/main/resources/application.conf`.
Port 8080, host overridable via env `HOST`.
Local overrides can be placed in `*.local.conf` / `*.local.txt` (gitignored).

### Modules

| Module | Path | Depends on |
|--------|------|-----------|
| `shared` | `src/shared` | — |
| `identity` | `src/identity` | shared |
| `platform` | `src/platform` | identity, shared |
| `engine` | `src/engine` | shared |
| `application` | `src/application` | all of the above + Ktor + Koin |

DI wired in `DependencyInjection.kt` via Koin. All API routes under `/api/`.

### Testing

- Tests use **Kotest** (`FreeSpec` style) run via JUnit Platform.
- Each module has a `TestScope` helper providing Koin DI.
- **ArangoDB must be running** for integration tests.
- MockK used for mocking.

### Linting

Detekt is auto-correcting, enforced (`ignoreFailures = false`), config at `server/detekt/detekt.yml`.

### Documentation

- Public API (service interfaces, domain events, error classes) should have minimal KDoc.
- Implementation classes and internal details can omit KDoc if the purpose is clear.

### Important

- Entrypoint: `Application.kt` uses Ktor's `EngineMain` pattern, NOT an `application` plugin.
- Serialization uses **kotlinx-serialization-json**, not Jackson (Jackson is ArangoDB-only).
- Kotlin compiler opt-ins: `ExperimentalUuidApi`, `ExperimentalTime`, `ExperimentalAtomicApi`.

## Webapp (`webapp/`)

### Commands

```sh
cd webapp
npm run dev       # vite dev server
npm run build     # tsc -b && vite build  (typecheck + bundle)
npm run lint      # eslint .
npm run test      # vitest
```

### Path aliases

`@` → `src/`, `@app` → `src/app/`, `@pages` → `src/pages/`, `@renderer` → `src/renderer/`, `@modules` → `src/modules/`

### Architecture

| Directory | Purpose |
|-----------|---------|
| `src/pages/` | Route pages: login, register, matchList, match, game |
| `src/app/features/` | Zustand stores: auth, game, match, user |
| `src/modules/client/` | Custom HTTP client (Bearer token auth) + WebSocket client |
| `src/modules/gamedb/` | Client-side game database |
| `src/modules/rendergraph/` | Custom Canvas/WebGL render engine |
| `src/app/i18n/` | i18next setup + auto-generated type defs |

### i18n codegen

Source of truth: `public/locales/_descriptions/*.json`.
Run manually (no npm script exists):

```sh
npx i18next
```

Generates `src/app/i18n/i18next.d.ts` + `resources.d.ts`.

### ESLint quirks

- `no-explicit-any` is **off** — using `any` is allowed.
- Unused vars must be prefixed with `_`.

### Testing

Vitest tests are colocated beside source files as `*.test.ts`.
