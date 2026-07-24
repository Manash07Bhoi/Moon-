export const auroraVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    
    vec3 p = position;
    // Gentle ribbon wave
    p.y += sin(p.x * 0.5 + uTime * 0.5) * 2.0;
    p.z += cos(p.x * 0.3 + uTime * 0.3) * 2.0;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

export const auroraFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform float uIntensity;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Simple 2D noise
  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }
  
  void main() {
    // Noise base
    float n = rand(vUv * vec2(10.0, 1.0) + vec2(uTime * 0.1, 0.0));
    
    // Vertical fade
    float fade = sin(vUv.y * 3.14159);
    
    // Mix colors
    vec3 color = mix(uColor1, uColor2, vUv.x + n * 0.1);
    
    float alpha = fade * n * uIntensity;
    
    gl_FragColor = vec4(color, alpha);
  }
`;
