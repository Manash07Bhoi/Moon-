/**
 * Synchronous WebGL availability probe.
 *
 * Uses canvas.getContext() with the EXACT same arguments that makeRenderer
 * uses, so the probe result accurately reflects whether the main Canvas will
 * succeed. Runs at module-load time so App.tsx can skip <Canvas> entirely
 * when WebGL is unavailable — no error overlay, no thrown exceptions.
 */

export type WebGLTier =
  | { available: true; version: 2 | 1 }
  | { available: false; reason: string };

/** Context attributes mirrored from makeRenderer in App.tsx */
const CTX_ATTRS: WebGLContextAttributes = {
  powerPreference: 'default',
  antialias: false,
  alpha: false,
  stencil: false,
  depth: true,
};

export const webGLTier: WebGLTier = (() => {
  if (typeof document === 'undefined') {
    return { available: false, reason: 'No document (SSR)' };
  }
  try {
    const canvas = document.createElement('canvas');

    // Try WebGL2
    const ctx2 = canvas.getContext('webgl2', CTX_ATTRS);
    if (ctx2) {
      // Verify the context isn't a sandboxed stub by confirming basic GL ops work
      const shader = ctx2.createShader(ctx2.VERTEX_SHADER);
      if (shader) {
        ctx2.deleteShader(shader);
        ctx2.getExtension('WEBGL_lose_context')?.loseContext();
        return { available: true, version: 2 };
      }
    }

    // Try WebGL1
    const ctx1 = canvas.getContext('webgl', CTX_ATTRS) as WebGLRenderingContext | null;
    if (ctx1) {
      const shader = ctx1.createShader(ctx1.VERTEX_SHADER);
      if (shader) {
        ctx1.deleteShader(shader);
        ctx1.getExtension('WEBGL_lose_context')?.loseContext();
        return { available: true, version: 1 };
      }
    }

    return { available: false, reason: 'getContext returned null or non-functional' };
  } catch (e) {
    return { available: false, reason: String(e) };
  }
})();
