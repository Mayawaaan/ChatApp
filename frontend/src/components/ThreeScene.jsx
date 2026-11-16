import React, { Component, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { resolveColorMode, useThemeStore } from "../store/useThemeStore";

function isWebGLAvailable() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

function createSpeechBubbleGeometry({
  width = 2.0,
  height = 1.3,
  radius = 0.34,
  depth = 0.28,
  tailSide = "left",
}) {
  const w = width / 2;
  const h = height / 2;
  const r = Math.min(radius, w * 0.45, h * 0.45);
  const tailW = 0.28;
  const tailH = 0.26;
  const tailOffset = w * 0.42;

  const shape = new THREE.Shape();

  // Start at top-left after corner radius
  shape.moveTo(-w + r, h);
  shape.lineTo(w - r, h);
  shape.quadraticCurveTo(w, h, w, h - r);
  shape.lineTo(w, -h + r);
  shape.quadraticCurveTo(w, -h, w - r, -h);

  if (tailSide === "right") {
    shape.lineTo(tailOffset + tailW * 0.3, -h);
    shape.quadraticCurveTo(
      tailOffset + tailW * 0.45,
      -h - tailH * 0.75,
      tailOffset + tailW * 0.65,
      -h - tailH
    );
    shape.quadraticCurveTo(
      tailOffset - tailW * 0.05,
      -h - tailH * 0.4,
      tailOffset - tailW * 0.55,
      -h
    );
  } else {
    shape.lineTo(-tailOffset + tailW * 0.55, -h);
    shape.quadraticCurveTo(
      -tailOffset + tailW * 0.05,
      -h - tailH * 0.4,
      -tailOffset - tailW * 0.65,
      -h - tailH
    );
    shape.quadraticCurveTo(
      -tailOffset - tailW * 0.45,
      -h - tailH * 0.75,
      -tailOffset - tailW * 0.3,
      -h
    );
  }

  shape.lineTo(-w + r, -h);
  shape.quadraticCurveTo(-w, -h, -w, -h + r);
  shape.lineTo(-w, h - r);
  shape.quadraticCurveTo(-w, h, -w + r, h);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.12,
    bevelSegments: 6,
    curveSegments: 24,
  });

  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function createPillGeometry(width, height, depth = 0.06) {
  const w = width / 2;
  const h = height / 2;
  const r = h;
  const shape = new THREE.Shape();

  shape.moveTo(-w + r, h);
  shape.lineTo(w - r, h);
  shape.quadraticCurveTo(w, h, w, 0);
  shape.quadraticCurveTo(w, -h, w - r, -h);
  shape.lineTo(-w + r, -h);
  shape.quadraticCurveTo(-w, -h, -w, 0);
  shape.quadraticCurveTo(-w, h, -w + r, h);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 12,
  });

  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

const ConnectedConversationsSculpture = ({ reducedMotion }) => {
  const groupRef = useRef(null);
  const { theme, colorMode } = useThemeStore();
  const [palette, setPalette] = useState({
    primary: "#4f46e5",
    light: "#a5b4fc",
    surface: "#f8fafc",
  });

  useEffect(() => {
    const resolvedMode = resolveColorMode(colorMode);
    const styles = getComputedStyle(document.documentElement);
    const primary = styles.getPropertyValue("--primary").trim() || "#4f46e5";
    const light = styles.getPropertyValue("--primary-light").trim() || "#a5b4fc";
    const surface = resolvedMode === "dark" ? "#cbd5e1" : "#f8fafc";
    setPalette({ primary, light, surface });
  }, [theme, colorMode]);

  const geometries = useMemo(() => {
    const primaryBubble = createSpeechBubbleGeometry({
      width: 2.05,
      height: 1.32,
      radius: 0.36,
      depth: 0.28,
      tailSide: "left",
    });

    const secondaryBubble = createSpeechBubbleGeometry({
      width: 1.54,
      height: 1.02,
      radius: 0.3,
      depth: 0.24,
      tailSide: "right",
    });

    const bridgeCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.35, -0.1, -0.1),
      new THREE.Vector3(0.32, 0.28, -0.55),
      new THREE.Vector3(0.82, 0.65, -0.44)
    );
    const bridgeTube = new THREE.TubeGeometry(bridgeCurve, 28, 0.055, 14, false);

    const linePrimary = createPillGeometry(0.95, 0.11, 0.05);
    const lineSecondary = createPillGeometry(0.62, 0.11, 0.05);

    return {
      primaryBubble,
      secondaryBubble,
      bridgeTube,
      linePrimary,
      lineSecondary,
    };
  }, []);

  useEffect(() => {
    return () => {
      Object.values(geometries).forEach((geo) => geo.dispose());
    };
  }, [geometries]);

  useFrame((state) => {
    if (reducedMotion || !groupRef.current) return;
    const t = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.65) * 0.08 - 0.05;
    groupRef.current.rotation.y = -0.16 + Math.sin(t * 0.35) * 0.09;
    groupRef.current.rotation.x = 0.06 + Math.cos(t * 0.28) * 0.035;
  });

  return (
    <group
      ref={groupRef}
      position={[-0.12, -0.05, 0]}
      rotation={[0.06, -0.16, 0]}
    >
      {/* Primary foreground conversation form */}
      <mesh
        geometry={geometries.primaryBubble}
        position={[-0.36, -0.18, 0.14]}
        rotation={[0.02, 0.1, -0.03]}
      >
        <meshPhysicalMaterial
          color={palette.primary}
          roughness={0.34}
          metalness={0.04}
          clearcoat={0.18}
          clearcoatRoughness={0.4}
        />
      </mesh>

      {/* Minimal recessed message bar reliefs on primary form */}
      <mesh
        geometry={geometries.linePrimary}
        position={[-0.4, -0.05, 0.42]}
        rotation={[0.02, 0.1, -0.03]}
      >
        <meshStandardMaterial
          color={palette.surface}
          roughness={0.45}
          metalness={0.02}
        />
      </mesh>
      <mesh
        geometry={geometries.lineSecondary}
        position={[-0.56, -0.26, 0.42]}
        rotation={[0.02, 0.1, -0.03]}
      >
        <meshStandardMaterial
          color={palette.light}
          roughness={0.45}
          metalness={0.02}
        />
      </mesh>

      {/* Secondary reply bubble form */}
      <mesh
        geometry={geometries.secondaryBubble}
        position={[0.84, 0.68, -0.44]}
        rotation={[-0.05, -0.18, 0.04]}
      >
        <meshPhysicalMaterial
          color={palette.surface}
          roughness={0.38}
          metalness={0.03}
          clearcoat={0.15}
          clearcoatRoughness={0.45}
        />
      </mesh>

      {/* Subtle connecting bridge linking the two forms into one sculpture */}
      <mesh geometry={geometries.bridgeTube}>
        <meshStandardMaterial
          color={palette.light}
          roughness={0.42}
          metalness={0.08}
        />
      </mesh>
    </group>
  );
};

const StaticSculptureFallback = () => (
  <div
    className="w-full h-full flex items-center justify-center p-8"
    aria-hidden="true"
  >
    <svg viewBox="0 0 280 220" className="w-64 h-auto drop-shadow-sm" fill="none">
      <path
        d="M126 52C126 39.8497 135.85 30 148 30H224C236.15 30 246 39.8497 246 52V94C246 106.15 236.15 116 224 116H212L224 134L194 116H148C135.85 116 126 106.15 126 94V52Z"
        fill="var(--surface)"
        stroke="var(--border)"
        strokeWidth="2"
      />
      <path
        d="M34 94C34 79.6406 45.6406 68 60 68H156C170.359 68 182 79.6406 182 94V146C182 160.359 170.359 172 156 172H88L60 194V172C45.6406 172 34 160.359 34 146V94Z"
        fill="var(--primary)"
      />
      <rect x="62" y="104" width="76" height="10" rx="5" fill="white" fillOpacity="0.92" />
      <rect x="62" y="124" width="52" height="10" rx="5" fill="white" fillOpacity="0.55" />
    </svg>
  </div>
);

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const ThreeScene = () => {
  const [webglReady, setWebglReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setWebglReady(isWebGLAvailable());
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (media) {
      setReducedMotion(media.matches);
      const listener = (e) => setReducedMotion(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  if (!webglReady) {
    return <StaticSculptureFallback />;
  }

  return (
    <WebGLErrorBoundary fallback={<StaticSculptureFallback />}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.15, 5.1], fov: 38 }}
        frameloop={reducedMotion ? "demand" : "always"}
        gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <ambientLight intensity={0.8} />
        <hemisphereLight args={["#ffffff", "#334155", 0.55]} />
        <directionalLight position={[4.5, 5.5, 5]} intensity={1.35} />
        <directionalLight position={[-4.5, -2, 3.5]} intensity={0.45} />
        <ConnectedConversationsSculpture reducedMotion={reducedMotion} />
      </Canvas>
    </WebGLErrorBoundary>
  );
};

export default ThreeScene;
