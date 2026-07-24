export const moonVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const moonFragmentShader = `
  uniform vec3 uColor;
  uniform vec3 uEmissive;
  uniform float uPulse;
  
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    
    float rim = 1.0 - max(dot(viewDir, normal), 0.0);
    rim = smoothstep(0.6, 1.0, rim);
    
    // Base color
    vec3 baseColor = uColor * 0.5;
    
    // Emissive pulse
    vec3 emissive = uEmissive * (0.8 + 0.4 * uPulse);
    
    // Add rim lighting
    vec3 finalColor = baseColor + emissive * rim * 2.0;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;
