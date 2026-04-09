import { spring } from "remotion";
import * as THREE from "three";

// Coin geometry notes:
// CylinderGeometry axis = local Y. Front face is at Y = +T/2.
// With coin rotation [1.25, rotationY, 0]:
//   local X = left-right on screen
//   local Z = up-down on screen
//   local Y = into/out of screen (coin thickness direction)
// So elements on the front face live at Y = FZ, and
// extend in XZ (left-right / up-down on screen).

export const BmicCoin: React.FC<{ frame: number; fps: number }> = ({
  frame,
  fps,
}) => {
  // At frame=90: rotationY = 90*0.022 - 1.48 = 0.5 rad → nice 3/4 front view
  const rotationY = frame * 0.022 - 1.48;
  const floatY = Math.sin(frame * 0.05) * 0.1;
  const pulse = 0.85 + 0.15 * Math.sin(frame * 0.08);

  const scaleIn = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    config: { damping: 20, stiffness: 120, mass: 0.6 },
  });

  const R = 1.5; // coin radius
  const T = 0.28; // thickness
  const FY = T / 2 + 0.008; // front face Y offset

  // Gold material shared props
  const goldProps = {
    color: "#ffe066" as const,
    emissive: "#ffd700" as const,
    emissiveIntensity: 0.75,
    metalness: 0.45,
    roughness: 0.12,
  };

  return (
    <group
      rotation={[1.25, rotationY, 0]}
      position={[0, floatY, 0]}
      scale={[scaleIn, scaleIn, scaleIn]}
    >
      {/* ── Coin body ── */}
      <mesh>
        <cylinderGeometry args={[R, R, T, 80]} />
        <meshStandardMaterial
          color="#c8820a"
          emissive="#a05008"
          emissiveIntensity={0.42}
          metalness={0.5}
          roughness={0.28}
        />
      </mesh>

      {/* ── Bright rim ── */}
      <mesh>
        <cylinderGeometry args={[R + 0.025, R + 0.025, T, 80, 1, true]} />
        <meshStandardMaterial
          color="#ffe880"
          emissive="#ffb300"
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* ── Recessed front face ── */}
      <mesh position={[0, FY, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R - 0.18, 80]} />
        <meshStandardMaterial
          color="#b87010"
          emissive="#7a4000"
          emissiveIntensity={0.3}
          metalness={0.45}
          roughness={0.35}
        />
      </mesh>

      {/* ── Recessed back face ── */}
      <mesh position={[0, -FY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R - 0.18, 80]} />
        <meshStandardMaterial
          color="#b87010"
          emissive="#7a4000"
          emissiveIntensity={0.3}
          metalness={0.45}
          roughness={0.35}
        />
      </mesh>

      {/* ── Decorative ring groove ── */}
      <mesh position={[0, FY + 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[R - 0.38, R - 0.22, 80]} />
        <meshStandardMaterial
          color="#ffe066"
          emissive="#ffcc00"
          emissiveIntensity={0.7}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>

      {/* ══════════════════════════════════════
          "B" letter on front face
          Face lies in XZ plane (at Y = FY).
          X = horizontal (left-right on screen)
          Z = vertical (up-down on screen)
          Y = depth toward viewer
         ══════════════════════════════════════ */}

      {/* Vertical stem */}
      <mesh position={[-0.3, FY + 0.04, 0]}>
        <boxGeometry args={[0.13, 0.06, 0.88]} />
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* Top horizontal bar */}
      <mesh position={[-0.07, FY + 0.04, 0.39]}>
        <boxGeometry args={[0.52, 0.06, 0.10]} />
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* Middle horizontal bar */}
      <mesh position={[-0.1, FY + 0.04, 0.01]}>
        <boxGeometry args={[0.44, 0.06, 0.10]} />
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* Bottom horizontal bar */}
      <mesh position={[-0.07, FY + 0.04, -0.39]}>
        <boxGeometry args={[0.52, 0.06, 0.10]} />
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* Top-right bump of B (torus in XZ plane → rotate π/2 around X) */}
      <mesh
        position={[0.06, FY + 0.04, 0.2]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.19, 0.055, 16, 32, Math.PI]} />
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* Bottom-right bump of B (larger) */}
      <mesh
        position={[0.11, FY + 0.04, -0.19]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.22, 0.055, 16, 32, Math.PI]} />
        <meshStandardMaterial {...goldProps} />
      </mesh>

      {/* ── Glowing edge ring ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[R + 0.045, 0.034, 16, 100]} />
        <meshStandardMaterial
          color="#ffdd44"
          emissive="#ff9900"
          emissiveIntensity={2.5 * pulse}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ── Soft front-face glow ── */}
      <mesh position={[0, FY + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.95, 64]} />
        <meshStandardMaterial
          color="#ffaa00"
          emissive="#ff7700"
          emissiveIntensity={0.3 + 0.12 * Math.sin(frame * 0.09)}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};
