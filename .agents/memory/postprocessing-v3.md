---
    name: @react-three/postprocessing v3 API
    description: Breaking API changes in @react-three/postprocessing v3.0.x vs older docs/examples.
    ---

    ## Changes from v2 → v3

    - **`disableNormalPass` removed** — replaced by `enableNormalPass` (boolean, default false). Normal pass is disabled by default; omit the prop entirely unless you need SSGI.
    - **`FilmGrain` not exported** — use `Noise` instead (`<Noise premultiply />`).
    - **`BlendFunction` not exported** — `BlendFunction` is internal to `postprocessing` (the peer dependency). Do not import it from `@react-three/postprocessing`.
    - The rest of the common effects (Bloom, DepthOfField, ChromaticAberration, Vignette, Noise) are still exported normally.

    **Why:** Caused "does not provide an export named 'BlendFunction'" runtime error and TypeScript errors on mount.

    **How to apply:** Any time you use @react-three/postprocessing v3 — check exports via `Object.keys(await import('@react-three/postprocessing'))` before assuming an effect exists.
    