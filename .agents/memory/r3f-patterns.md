---
    name: R3F performance patterns
    description: Non-obvious R3F rules for instancedMesh, frame loops, and store reads that caused runtime crashes.
    ---

    ## Rules

    1. **instancedMesh args must be memoized** — pass `useMemo(() => [geo, mat, count], [])` as the `args` prop. Inline `new THREE.BufferGeometry()` creates a new reference every render; R3F sees a changed args array and rebuilds the entire mesh each frame.

    2. **Abstract THREE.Material crashes R3F** — passing `new THREE.Material()` (base class) to instancedMesh args causes "Cannot convert undefined or null to object" at runtime because material.uniforms is undefined. Use concrete subclasses (`THREE.MeshBasicMaterial`) even as a placeholder.

    3. **Instance matrices need useEffect, not useMemo** — `meshRef.current` is null during useMemo. Call `mesh.setMatrixAt()` inside `useEffect(() => {...}, [])` so the mesh is mounted before you write matrices. Mark `mesh.instanceMatrix.needsUpdate = true` after.

    4. **Read store state inside useFrame with getState()** — using a React selector (`useStore((s) => s.value)`) inside a useFrame closure captures a stale value from the last render. Call `useStore.getState().value` instead for always-fresh data without triggering re-renders.

    5. **Avoid allocations in useFrame** — `new THREE.Vector3()`, `new THREE.Color()` inside the frame loop run 60× per second. Pre-allocate with useRef/useMemo and mutate in-place (set/lerp/copy).

    **Why:** Discovered while fixing crashes in StarField (no matrices → invisible), Forest/Rain (abstract Material → null object error), and Fog (new Color every frame).

    **How to apply:** Any time you write an R3F component that uses instancedMesh or reads audio/timeline data in useFrame.
    