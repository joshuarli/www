import {
  Mesh, OrthographicCamera, PlaneGeometry, Scene,
  ShaderMaterial, Vector2, WebGLRenderer
} from 'three';

// One screen-space quad, one draw call, no textures, models, lights or postprocessing.
const canvas = document.querySelector('#sky');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer;
try {
  renderer = new WebGLRenderer({
    canvas, antialias: false, alpha: false, depth: false, stencil: false,
    powerPreference: 'low-power', failIfMajorPerformanceCaveat: true
  });
} catch {
  // The CSS atmosphere is the full fallback, not a loading screen.
}

if (renderer) {
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uPointer: { value: new Vector2(0, 0) }
  };
  const material = new ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uPointer;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p = p * 2.02 + 19.1;
          a *= 0.5;
        }
        return v;
      }
      void main() {
        vec2 uv = vUv;
        float ratio = uResolution.x / max(1.0, uResolution.y);
        vec2 p = (uv - 0.5) * vec2(ratio, 1.0);
        p += uPointer * 0.045;
        float t = uTime * 0.008;
        float broad = fbm(p * 2.2 + vec2(t, -t * 0.35));
        float detail = fbm(p * 5.2 + vec2(-t * 0.4, t * 0.15));
        float clouds = smoothstep(0.30, 0.68, broad * 0.78 + detail * 0.22);
        float illumination = smoothstep(0.28, 0.72, detail + uv.y * 0.12);

        vec3 sky = mix(vec3(0.79, 0.86, 0.88), vec3(0.91, 0.89, 0.84), uv.y);
        vec3 shade = vec3(0.77, 0.81, 0.81);
        vec3 sunlit = vec3(0.995, 0.975, 0.93);
        vec3 cloudColor = mix(shade, sunlit, illumination);
        vec3 color = mix(sky, cloudColor, clouds * 0.87);
        float haze = smoothstep(0.0, 0.92, 1.0 - length((uv - vec2(0.73, 0.66)) * vec2(0.85, 1.3)));
        color = mix(color, vec3(1.0, 0.97, 0.91), haze * 0.12);
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  scene.add(quad);

  // Never render at native Retina resolution for a deliberately soft backdrop.
  const isMobile = matchMedia('(max-width: 720px)').matches;
  const scale = isMobile ? 0.55 : 0.7;
  const frameInterval = 1000 / (isMobile ? 12 : 20);
  let animationFrame = 0;
  let lastFrame = 0;
  let startTime = 0;
  let active = false;
  let disposed = false;
  const pointer = new Vector2();

  function resize() {
    const width = Math.max(1, window.innerWidth);
    const height = Math.max(1, window.innerHeight);
    const pixelWidth = Math.round(width * scale);
    const pixelHeight = Math.round(height * scale);
    renderer.setSize(pixelWidth, pixelHeight, false);
    uniforms.uResolution.value.set(pixelWidth, pixelHeight);
  }
  function frame(now) {
    if (!active) return;
    animationFrame = requestAnimationFrame(frame);
    if (now - lastFrame < frameInterval) return;
    lastFrame = now;
    if (!startTime) startTime = now;
    uniforms.uTime.value = (now - startTime) * 0.001;
    uniforms.uPointer.value.lerp(pointer, 0.055);
    renderer.render(scene, camera);
  }
  function syncActive() {
    const shouldRun = !disposed && !document.hidden && !reducedMotion.matches;
    if (shouldRun === active) return;
    active = shouldRun;
    if (active) animationFrame = requestAnimationFrame(frame);
    else cancelAnimationFrame(animationFrame);
  }
  function onPointerMove(event) {
    pointer.set((event.clientX / innerWidth - 0.5) * 2, (event.clientY / innerHeight - 0.5) * 2);
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    syncActive();
    document.removeEventListener('visibilitychange', syncActive);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    reducedMotion.removeEventListener('change', syncActive);
    quad.geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  resize();
  renderer.render(scene, camera);
  canvas.classList.add('ready');
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('visibilitychange', syncActive);
  reducedMotion.addEventListener('change', syncActive);
  window.addEventListener('pagehide', dispose, { once: true });
  syncActive();
}
