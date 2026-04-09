import { useMemo } from "react";
import * as THREE from "three";

type ParticleData = {
  position: [number, number, number];
  size: number;
  seed: number;
};

export const Particles: React.FC<{ frame: number; count?: number }> = ({
  frame,
  count = 120,
}) => {
  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const seed = (i * 2654435761) % 4294967296;
      const r1 = ((seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
      const r2 = ((seed * 22695477 + 1) % 4294967296) / 4294967296;
      const r3 = ((seed * 214013 + 2531011) % 4294967296) / 4294967296;
      return {
        position: [
          (r1 - 0.5) * 18,
          (r2 - 0.5) * 14,
          (r3 - 0.5) * 10 - 4,
        ],
        size: 0.02 + r1 * 0.05,
        seed: r1,
      };
    });
  }, [count]);

  return (
    <>
      {particles.map((p, i) => {
        const pulse = 0.6 + 0.4 * Math.sin(frame * 0.04 + p.seed * 6.28);
        return (
          <mesh
            key={i}
            position={[
              p.position[0] + Math.sin(frame * 0.01 + p.seed * 3) * 0.3,
              p.position[1] + Math.cos(frame * 0.012 + p.seed * 2) * 0.25,
              p.position[2],
            ]}
          >
            <sphereGeometry args={[p.size * pulse, 6, 6]} />
            <meshStandardMaterial
              color="#ffaa33"
              emissive="#ff6600"
              emissiveIntensity={1.2}
              transparent
              opacity={0.5 + 0.3 * pulse}
            />
          </mesh>
        );
      })}
    </>
  );
};
