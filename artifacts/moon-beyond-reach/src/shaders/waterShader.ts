export const waterVertexShader = `
  uniform float uTime;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  vec3 gerstnerWave(vec3 p, float steepness, float wavelength, float speed, float dir) {
    float k = 2.0 * 3.14159 / wavelength;
    float c = sqrt(9.8 / k);
    vec2 d = vec2(cos(dir), sin(dir));
    float f = k * (dot(d, p.xz) - c * uTime * speed);
    float a = steepness / k;
    
    return vec3(
      d.x * (a * cos(f)),
      a * sin(f),
      d.y * (a * cos(f))
    );
  }

  void main() {
    vUv = uv;
    
    vec3 p = position;
    p += gerstnerWave(p, 0.05, 5.0, 1.0, 0.0);
    p += gerstnerWave(p, 0.03, 2.5, 1.2, 1.0);
    
    vec4 worldPos = modelMatrix * vec4(p, 1.0);
    vWorldPosition = worldPos.xyz;
    
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const waterFragmentShader = `
  uniform vec3 uSkyColor;
  uniform vec3 uWaterColor;
  uniform vec3 uRippleOrigin;
  uniform float uRippleTime;
  
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    float dist = length(vWorldPosition.xz - uRippleOrigin.xz);
    float ripple = 0.0;
    
    if (uRippleTime > 0.0) {
      ripple = sin(dist * 10.0 - uRippleTime * 5.0) * exp(-dist * 0.1) * max(1.0 - uRippleTime * 0.2, 0.0);
    }
    
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, vec3(0.0, 1.0, 0.0)), 0.0), 3.0);
    
    vec3 finalColor = mix(uWaterColor, uSkyColor, fresnel);
    finalColor += vec3(ripple * 0.5); // Add ripple brightness
    
    gl_FragColor = vec4(finalColor, 0.8);
  }
`;
