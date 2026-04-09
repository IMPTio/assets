import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { BmicCoin } from "./BmicCoin";
import { Particles } from "./Particles";

const GOLD = "#f0a500";
const GOLD_LIGHT = "#ffd966";
const DARK_BG = "#090c14";

const StatBox: React.FC<{
  label: string;
  value: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ label, value, delay, frame, fps }) => {
  const opacity = interpolate(frame, [delay, delay + fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [delay, delay + fps * 0.5], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        background: "rgba(240,165,0,0.08)",
        border: "1px solid rgba(240,165,0,0.3)",
        borderRadius: 12,
        padding: "18px 28px",
        textAlign: "center",
        backdropFilter: "blur(8px)",
        minWidth: 160,
      }}
    >
      <div
        style={{
          color: GOLD_LIGHT,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: 1,
          lineHeight: 1,
          fontFamily: "sans-serif",
        }}
      >
        {value}
      </div>
      <div
        style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: 13,
          marginTop: 6,
          textTransform: "uppercase",
          letterSpacing: 2,
          fontFamily: "sans-serif",
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const BmicPresale: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Title fade in
  const titleOpacity = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [0, fps * 0.6], [-30, 0], {
    extrapolateRight: "clamp",
  });

  // PRESALE badge scale-in
  const badgeScale = spring({
    frame: frame - fps * 0.3,
    fps,
    from: 0,
    to: 1,
    config: { damping: 12, stiffness: 100, mass: 0.6 },
  });

  // Bottom tagline
  const tagOpacity = interpolate(frame, [fps * 1.2, fps * 1.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Glowing ring pulse
  const glowAlpha = 0.12 + 0.06 * Math.sin(frame * 0.07);

  return (
    <AbsoluteFill style={{ background: DARK_BG, overflow: "hidden" }}>
      {/* Deep space radial gradient background */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, #1a1030 0%, #0a0d1a 55%, #090c14 100%)",
        }}
      />

      {/* Subtle grid lines */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(240,165,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(240,165,0,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* 3D Scene */}
      <AbsoluteFill>
        <ThreeCanvas width={width} height={height}>
          {/* Lighting */}
          <ambientLight intensity={1.0} color="#ffe4aa" />
          <directionalLight position={[4, 6, 6]} intensity={2.5} color="#fff8e0" />
          <directionalLight position={[-3, 2, 4]} intensity={1.4} color="#ffcc66" />
          <directionalLight position={[0, -4, 3]} intensity={0.8} color="#ff8844" />
          <pointLight position={[2, 2, 5]} intensity={3.0} color="#ffffff" distance={12} />
          <pointLight position={[-1, 0, 3]} intensity={1.5} color="#ffaa33" distance={10} />

          {/* Background particles */}
          <Particles frame={frame} count={100} />

          {/* The BMIC coin, shifted right */}
          <group position={[1.8, 0, 0]}>
            <BmicCoin frame={frame} fps={fps} />
          </group>

          {/* Glow ring behind coin */}
          <mesh position={[1.8, 0, -0.5]}>
            <torusGeometry args={[2.1, 0.04, 16, 100]} />
            <meshStandardMaterial
              color="#ffaa00"
              emissive="#ff6600"
              emissiveIntensity={1.5}
              transparent
              opacity={glowAlpha * 3}
            />
          </mesh>
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Left-side overlay: text content */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 90,
          paddingRight: width / 2 + 40,
          gap: 0,
        }}
      >
        {/* PRESALE badge */}
        <div
          style={{
            transform: `scale(${badgeScale})`,
            transformOrigin: "left center",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: `linear-gradient(90deg, ${GOLD}22, ${GOLD}44)`,
            border: `1.5px solid ${GOLD}88`,
            borderRadius: 40,
            paddingLeft: 18,
            paddingRight: 22,
            paddingTop: 8,
            paddingBottom: 8,
            marginBottom: 28,
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: GOLD,
              boxShadow: `0 0 8px ${GOLD}`,
            }}
          />
          <span
            style={{
              color: GOLD_LIGHT,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            Live Presale
          </span>
        </div>

        {/* Main title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 74,
              fontWeight: 900,
              lineHeight: 1.0,
              fontFamily: "sans-serif",
              letterSpacing: -2,
              textShadow: "0 0 40px rgba(240,165,0,0.3)",
            }}
          >
            BMIC
          </div>
          <div
            style={{
              color: GOLD,
              fontSize: 74,
              fontWeight: 900,
              lineHeight: 1.0,
              fontFamily: "sans-serif",
              letterSpacing: -2,
              background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            PRESALE
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            opacity: titleOpacity,
            width: 60,
            height: 3,
            background: `linear-gradient(90deg, ${GOLD}, transparent)`,
            borderRadius: 2,
            marginTop: 24,
            marginBottom: 24,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            opacity: interpolate(frame, [fps * 0.8, fps * 1.3], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            color: "rgba(255,255,255,0.65)",
            fontSize: 17,
            fontFamily: "sans-serif",
            lineHeight: 1.6,
            letterSpacing: 0.3,
            maxWidth: 380,
            marginBottom: 36,
          }}
        >
          Join the future of decentralized finance.
          <br />
          Secure your BMIC tokens before listing.
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <StatBox
            label="Token Price"
            value="$0.085"
            delay={Math.floor(fps * 0.9)}
            frame={frame}
            fps={fps}
          />
          <StatBox
            label="Total Supply"
            value="1B"
            delay={Math.floor(fps * 1.05)}
            frame={frame}
            fps={fps}
          />
          <StatBox
            label="Raised"
            value="68%"
            delay={Math.floor(fps * 1.2)}
            frame={frame}
            fps={fps}
          />
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: tagOpacity,
            marginTop: 36,
            display: "inline-flex",
            alignSelf: "flex-start",
            background: `linear-gradient(90deg, ${GOLD}, #ff8c00)`,
            borderRadius: 10,
            paddingTop: 14,
            paddingBottom: 14,
            paddingLeft: 36,
            paddingRight: 36,
            boxShadow: `0 0 30px rgba(240,165,0,0.4)`,
          }}
        >
          <span
            style={{
              color: "#0a0a0a",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 2,
              textTransform: "uppercase",
              fontFamily: "sans-serif",
            }}
          >
            Buy Now
          </span>
        </div>
      </AbsoluteFill>

      {/* Bottom bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${GOLD}, #ff8c00, transparent)`,
          opacity: tagOpacity,
        }}
      />

      {/* Watermark */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 40,
          color: "rgba(255,255,255,0.2)",
          fontSize: 12,
          letterSpacing: 2,
          textTransform: "uppercase",
          fontFamily: "sans-serif",
        }}
      >
        bmic.io
      </div>
    </AbsoluteFill>
  );
};
