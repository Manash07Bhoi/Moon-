---
name: WebGL probe pattern for Replit preview
description: How to accurately detect WebGL unavailability in Replit's sandboxed preview iframe, and suppress the Vite dev overlay when WebGL fails at runtime.
---

# WebGL probe pattern for Replit preview

## The problem
In Replit's preview iframe, `canvas.getContext('webgl2')` may return a non-null context object, but the GPU is actually unavailable (VENDOR=0xffff). `THREE.WebGLRenderer` does NOT throw in this case — it logs `console.error` and continues with a broken context. A simple `getContext() != null` probe returns `available: true` incorrectly, causing `makeRenderer` in R3F's `gl` prop to throw an uncaught exception that hits the Vite dev overlay.

## How to fix

### 1. Accurate probe (WebGLProbe.ts)
Use `createShader()` as a functional verification after `getContext()` — a sandboxed/broken context returns non-null from `getContext` but fails or returns null from `createShader`:

```ts
const ctx = canvas.getContext('webgl2', CTX_ATTRS);
if (ctx) {
  const shader = ctx.createShader(ctx.VERTEX_SHADER);
  if (shader) { ctx.deleteShader(shader); loseContext(); return { available: true, version: 2 }; }
}
return { available: false, reason: 'non-functional context' };
```

Use the EXACT SAME `WebGLContextAttributes` as `makeRenderer` uses — different attrs (e.g. `alpha: false`) can cause a probe canvas to succeed while the main canvas fails.

### 2. Safety-net in App.tsx
Even with an accurate probe, add a capture-phase window error handler as a fallback. It suppresses the Vite overlay and flips a `webglFailed` state:

```tsx
const [webglFailed, setWebglFailed] = useState(!webGLTier.available);
useEffect(() => {
  const handle = (e: ErrorEvent) => {
    if ((e.error?.message ?? e.message ?? '').includes('WebGL')) {
      e.preventDefault(); e.stopImmediatePropagation();
      setWebglFailed(true);
    }
  };
  window.addEventListener('error', handle, true); // capture phase
  return () => window.removeEventListener('error', handle, true);
}, [webglFailed]);
```

Then gate `<Canvas>` on `!webglFailed` instead of `webGLTier.available`.

**Why:** `event.preventDefault()` + `stopImmediatePropagation()` in capture phase runs before Vite's overlay plugin's bubble-phase listener, suppressing the overlay while the `CanvasErrorBoundary` / `WebGLFallback` handles the UI gracefully.

## API server PORT in dev
The api-server artifact.toml has no `[services.env]` block for dev, so PORT is not injected. Fix the dev script in `artifacts/api-server/package.json`:
```json
"dev": "export PORT=${PORT:-8080}; export NODE_ENV=development; pnpm run build && pnpm run start"
```
