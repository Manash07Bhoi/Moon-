export const fogVertexShader = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const fogFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uDensity;
  
  varying vec3 vWorldPosition;
  
  void main() {
    float depth = gl_FragCoord.z / gl_FragCoord.w;
    float fogFactor = exp2(-uDensity * uDensity * depth * depth * 1.442695);
    fogFactor = 1.0 - clamp(fogFactor, 0.0, 1.0);
    
    gl_FragColor = vec4(uColor, fogFactor * 0.5);
  }
`;
