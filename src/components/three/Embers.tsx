"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/utils";

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  attribute float aSeed;
  attribute float aSpeed;
  attribute float aSize;
  varying float vAlpha;
  varying float vFirefly;
  void main() {
    vec3 p = position;
    float life = fract(aSeed + uTime * aSpeed);
    // embers rise from the bottom and drift; a few "fireflies" wander instead
    vFirefly = step(0.82, aSeed);
    p.y = mix(-1.15, 1.2, life) * (1.0 - vFirefly) + (p.y + sin(uTime * 0.6 + aSeed * 40.0) * 0.08) * vFirefly;
    p.x += sin(uTime * (0.6 + aSpeed) + aSeed * 30.0) * (0.04 + 0.1 * life);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float flicker = 0.6 + 0.4 * sin(uTime * (3.0 + aSeed * 6.0) + aSeed * 100.0);
    vAlpha = mix(smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.55, 1.0, life)), flicker * 0.9, vFirefly);
    gl_PointSize = aSize * uPixelRatio * (1.0 / -mv.z) * 22.0;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uEmber;
  uniform vec3 uFirefly;
  varying float vAlpha;
  varying float vFirefly;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float glow = smoothstep(0.5, 0.0, d);
    vec3 c = mix(uEmber, uFirefly, vFirefly);
    gl_FragColor = vec4(c * glow, glow * vAlpha);
  }
`;

/** Read a colour token from the design system (globals.css) */
const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "white";

function Field({ count }: { count: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const speed = new Float32Array(count);
    const size = new Float32Array(count);
    const r = mulberry32(12345);
    for (let i = 0; i < count; i++) {
      // embers concentrate near the centre (the fire); fireflies spread wide
      const spread = r() > 0.82 ? 1.6 : 0.55;
      pos[i * 3] = (r() - 0.5) * 2 * spread * (0.4 + r() * 0.6);
      pos[i * 3 + 1] = (r() - 0.5) * 1.6;
      pos[i * 3 + 2] = (r() - 0.5) * 0.8;
      seed[i] = r();
      speed[i] = 0.05 + r() * 0.12;
      size[i] = 0.6 + r() * 1.6;
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(typeof window === "undefined" ? 1 : window.devicePixelRatio, 2) },
      uEmber: { value: new THREE.Color(token("--ember")) },
      uFirefly: { value: new THREE.Color(token("--firefly")) },
    }),
    [],
  );

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt;
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={mat}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** WebGL ember + firefly field. `active` pauses rendering when off-screen. */
export default function Embers({ count, active }: { count: number; active: boolean }) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 1.6], fov: 70 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      frameloop={active ? "always" : "never"}
      aria-hidden="true"
    >
      <Field count={count} />
    </Canvas>
  );
}
