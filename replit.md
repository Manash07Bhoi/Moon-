# Moon Beyond Reach

A cinematic, music-driven 3D web experience about unspoken love — six acts rendered in React Three Fiber, scored to the Odia track "Dura Akasare Janha Tie."

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/moon-beyond-reach/src/` — all frontend source
  - `components/world/` — 3D scene objects (Moon, StarField, Lake, Forest, Rain, Fog, Galaxy, AuroraRibbon)
  - `components/` — UI overlays (EntryGate, LyricCueOverlay, ActIndicator, MuteControl, PostProcessing)
  - `systems/audio/AudioEngine.tsx` — Howler + Web Audio API analyser
  - `systems/timeline/LyricEngine.tsx` — act progression + lyric cue dispatch
  - `systems/camera/CinematicCamera.tsx` — per-act camera targets + orbit drag
  - `shaders/` — GLSL for star, water, moon, aurora, fog
  - `stores/` — Zustand stores: audio, experience, timeline, quality
- `artifacts/moon-beyond-reach/public/audio/track.mp3` — Odia track (7.8 MB)
- `artifacts/moon-beyond-reach/public/lyrics.json` — lyric + act cue data

## Architecture decisions

- **`useAudioStore.getState()` inside `useFrame`** — never subscribe via React selector inside R3F frame loops; always call `.getState()` for fresh values without triggering re-renders.
- **`instancedMesh` args memoized** — pass `useMemo`-wrapped `[geometry, material, count]` tuple; inline `new` calls recreate the THREE objects every render and cause R3F to teardown/rebuild the entire mesh.
- **Instance matrices must be initialized via `useEffect`** — `useMemo` runs before the mesh is mounted; `meshRef.current.setMatrixAt()` must be called in `useEffect` after mount.
- **`@react-three/postprocessing` v3** — `disableNormalPass` was renamed to `enableNormalPass` (inverted); `FilmGrain`/`BlendFunction` are not re-exported — use `Noise` and drop `BlendFunction` entirely.
- **Fog via refs** — `scene.fog` is created once and mutated each frame; creating `new THREE.Color()` inside `useFrame` was allocating every frame.

## Product

Six-act cinematic experience: Threshold → Overture → Moon → Water → Grove → Galaxy → Dawn. User clicks to enter; Odia song begins; camera breathes and drifts through acts automatically. All 3D, no UI beyond minimal act indicator and mute button.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
