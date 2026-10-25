import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import * as THREE from "three";

const NODES = [
  { id: "azure", name: "Azure", role: "Control plane", pos: [0, 0, 0], color: "#4F8CFF", base: 4 },
  { id: "intune", name: "Intune", role: "Endpoint mgmt", pos: [2.4, 1.1, 0.6], color: "#6E8BFF", base: 18 },
  { id: "entra", name: "Entra ID", role: "Zero-trust identity", pos: [-2.2, 1.3, -0.4], color: "#A78BFA", base: 9 },
  { id: "defender", name: "Defender", role: "XDR telemetry", pos: [1.7, -1.6, -1.1], color: "#3DDC97", base: 22 },
  { id: "copilot", name: "M365 Copilot", role: "AI agents", pos: [-1.6, -1.5, 1.2], color: "#F5B84B", base: 41 },
  { id: "proxmox", name: "Linux / Proxmox", role: "Self-hosted lab", pos: [0.3, 2.2, -1.8], color: "#FF7A59", base: 12 }
];
const EDGES = [["azure", "intune"], ["azure", "entra"], ["azure", "defender"], ["azure", "copilot"], ["azure", "proxmox"], ["intune", "defender"], ["entra", "intune"], ["entra", "copilot"], ["proxmox", "intune"]];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

function Node({ node, active, onHover, reduce }) {
  const ref = useRef();
  const [ms, setMs] = useState(node.base);
  // simulated latency telemetry while hovered
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => setMs(Math.max(1, node.base + Math.round((Math.random() - 0.5) * node.base * 0.6))), 600);
    return () => clearInterval(t);
  }, [active, node.base]);
  useFrame(({ clock }) => {
    if (reduce || !ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * 2 + node.pos[0]) * 0.06;
    ref.current.scale.setScalar(active ? 1.35 : s);
  });
  return (
    <group position={node.pos}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); onHover(node.id); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { onHover(null); document.body.style.cursor = ""; }}
      >
        <icosahedronGeometry args={[node.id === "azure" ? 0.42 : 0.26, 1]} />
        <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={active ? 2.2 : 1.1} roughness={0.3} flatShading />
      </mesh>
      {/* fake glow halo */}
      <mesh scale={node.id === "azure" ? 1.9 : 1.5}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshBasicMaterial color={node.color} transparent opacity={active ? 0.25 : 0.12} depthWrite={false} />
      </mesh>
      <Html center distanceFactor={9} position={[0, -0.62, 0]} style={{ pointerEvents: "none" }}>
        <div className="whitespace-nowrap font-mono text-[11px] text-fg/80">{node.name}</div>
      </Html>
      {active && (
        <Html center distanceFactor={8} position={[0, 0.95, 0]} style={{ pointerEvents: "none" }}>
          <div className="whitespace-nowrap rounded-lg border border-line bg-bg/90 px-3 py-2 font-mono text-[11px] backdrop-blur">
            <div className="text-fg">{node.name} <span className="text-muted">· {node.role}</span></div>
            <div className="mt-1 flex gap-3"><span className="text-ok">● healthy</span><span>{ms} ms</span><span className="text-muted">{(ms * 2.1).toFixed(0)} pkt/s</span></div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Packets({ reduce, hovered }) {
  const COUNT = 3; // packets per edge
  const ref = useRef();
  const curves = useMemo(() => EDGES.map(([a, b]) => {
    const A = new THREE.Vector3(...byId[a].pos), B = new THREE.Vector3(...byId[b].pos);
    const mid = A.clone().add(B).multiplyScalar(0.5).multiplyScalar(1.15);
    return new THREE.QuadraticBezierCurve3(A, mid, B);
  }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = reduce ? 0.5 : clock.elapsedTime;
    curves.forEach((c, i) => {
      const hot = hovered && EDGES[i].includes(hovered);
      for (let k = 0; k < COUNT; k++) {
        const u = (t * (hot ? 0.55 : 0.22) + k / COUNT + i * 0.13) % 1;
        dummy.position.copy(c.getPoint(u));
        dummy.scale.setScalar(hot ? 1.6 : 1);
        dummy.updateMatrix();
        ref.current.setMatrixAt(i * COUNT + k, dummy.matrix);
      }
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      {curves.map((c, i) => (
        <Line key={i} points={c.getPoints(24)} color={hovered && EDGES[i].includes(hovered) ? "#9fb2ff" : "#6E8BFF"} transparent opacity={hovered && EDGES[i].includes(hovered) ? 0.8 : 0.25} lineWidth={1} />
      ))}
      <instancedMesh ref={ref} args={[null, null, EDGES.length * COUNT]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#8FA6FF" />
      </instancedMesh>
    </>
  );
}

export default function Topology({ reduce }) {
  const [hovered, setHovered] = useState(null);
  return (
    <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }} aria-label="Interactive 3D topology of cloud and security services">
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={40} />
      <group rotation={[0.15, -0.4, 0]} scale={0.9}>
        {NODES.map((n) => <Node key={n.id} node={n} active={hovered === n.id} onHover={setHovered} reduce={reduce} />)}
        <Packets reduce={reduce} hovered={hovered} />
      </group>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={!reduce && !hovered} autoRotateSpeed={0.6} rotateSpeed={0.6} />
    </Canvas>
  );
}
