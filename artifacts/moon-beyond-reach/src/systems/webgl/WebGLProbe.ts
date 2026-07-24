/**
 * Synchronous WebGL availability probe.
 * Runs once at module load — before any React component mounts —
 * so we can conditionally render the Canvas and avoid the uncaught
 * THREE.WebGLRenderer error that bypasses error boundaries.
 */

export type WebGLTier =
  | { available: true; version: 2 | 1 }
  | { available: false; reason: string };

export const webGLTier: WebGLTier = (() => {
  if (typeof document === 'undefined') {
    return { available: false, reason: 'No document (SSR)' };
  }
  try {
    const canvas = document.createElement('canvas');

    // Try WebGL2 first
    let ctx = canvas.getContext('webgl2', { powerPreference: 'default' });
    if (ctx) {
      ctx.getExtension('WEBGL_lose_context')?.loseContext();
      return { available: true, version: 2 };
    }

    // Fall back to WebGL1
    ctx = canvas.getContext('webgl', { powerPreference: 'default' }) as WebGL2RenderingContext | null;
    if (ctx) {
      (ctx as unknown as WebGLRenderingContext).getExtension('WEBGL_lose_context')?.loseContext();
      return { available: true, version: 1 };
    }

    return { available: false, reason: 'getContext returned null' };
  } catch (e) {
    return { available: false, reason: String(e) };
  }
})();
