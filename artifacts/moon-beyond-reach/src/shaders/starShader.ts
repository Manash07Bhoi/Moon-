export const starVertexShader = `
  uniform float uTime;
  attribute float aSize;
  attribute float aPhase;
  
  varying float vAlpha;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    
    // Twinkle effect based on phase and time
    float twinkle = sin(uTime * 2.0 + aPhase) * 0.5 + 0.5;
    vAlpha = mix(0.2, 1.0, twinkle);
    
    gl_Position = projectionMatrix * mvPosition;
    
    // Size attenuation
    gl_PointSize = aSize * (100.0 / -mvPosition.z);
  }
`;

export const starFragmentShader = `
  uniform vec3 uColor;
  uniform float uBassPulse;
  
  varying float vAlpha;
  
  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;
    
    // Gaussian falloff
    float alpha = exp(-dist * dist * 10.0) * vAlpha;
    
    // Bass boost
    vec3 color = uColor * (1.0 + uBassPulse * 2.0);
    
    gl_FragColor = vec4(color, alpha);
  }
`;
