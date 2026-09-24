"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function SpherePoints() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const values = new Float32Array(900 * 3);
    for (let index = 0; index < 900; index += 1) {
      const theta = index * Math.PI * (3 - Math.sqrt(5));
      const phi = Math.acos(1 - 2 * (index + 0.5) / 900);
      const radius = 1.48 + Math.sin(index * 12.9898) * 0.04;
      values[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      values[index * 3 + 1] = radius * Math.cos(phi);
      values[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    return values;
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * 0.045;
    points.current.rotation.y += (state.pointer.x * 0.08 - points.current.rotation.y) * 0.01;
    points.current.rotation.x = state.pointer.y * 0.06;
  });

  return <points ref={points}><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#ede8ff" size={0.018} sizeAttenuation transparent opacity={0.72} depthWrite={false} /></points>;
}

export function ParticleSphere() {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 4.6], fov: 42 }} gl={{ alpha: true, antialias: true }}><SpherePoints /></Canvas>;
}
