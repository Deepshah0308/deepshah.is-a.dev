import { motion, useReducedMotion } from "framer-motion";
import { Section, Card, reveal } from "./ui.jsx";

// Each card gets a small SVG animation that says what the area is about.
function Endpoints({ r }) {
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-full" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <motion.rect key={i} x={8 + (i % 6) * 25} y={10 + Math.floor(i / 6) * 38} width="18" height="12" rx="2" fill="none" stroke="var(--accent)"
          animate={r ? undefined : { stroke: ["var(--line)", "var(--ok)", "var(--ok)"] }} transition={{ duration: 2.4, delay: i * 0.18, repeat: Infinity, repeatDelay: 1.2 }} />
      ))}
    </svg>
  );
}
function Shield({ r }) {
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-full" aria-hidden>
      <motion.path d="M80 8 L112 20 V44 C112 62 98 76 80 82 C62 76 48 62 48 44 V20 Z" fill="none" stroke="var(--accent)" strokeWidth="2"
        initial={{ pathLength: r ? 1 : 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4 }} />
      <rect x="70" y="42" width="20" height="16" rx="3" fill="var(--accent)" />
      <motion.path d="M74 42 V36 a6 6 0 0 1 12 0 V42" fill="none" stroke="var(--accent)" strokeWidth="2.5"
        animate={r ? undefined : { y: [-4, 0, 0, -4] }} transition={{ duration: 3, repeat: Infinity }} />
    </svg>
  );
}
function Neural({ r }) {
  const pts = [[30, 20], [30, 45], [30, 70], [80, 30], [80, 60], [130, 45]];
  const links = [[0, 3], [1, 3], [1, 4], [2, 4], [3, 5], [4, 5], [0, 4], [2, 3]];
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-full" aria-hidden>
      {links.map(([a, b], i) => <line key={i} x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} stroke="var(--line)" />)}
      {pts.map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r="5" fill="var(--warn)"
          animate={r ? undefined : { opacity: [0.3, 1, 0.3], r: [4, 6, 4] }} transition={{ duration: 1.8, delay: i * 0.25, repeat: Infinity }} />
      ))}
    </svg>
  );
}
function Gear({ r }) {
  return (
    <svg viewBox="0 0 160 90" className="h-24 w-full" aria-hidden>
      <motion.g style={{ originX: "80px", originY: "45px" }} animate={r ? undefined : { rotate: 360 }} transition={{ duration: 8, ease: "linear", repeat: Infinity }}>
        {Array.from({ length: 8 }, (_, i) => <rect key={i} x="76" y="13" width="8" height="12" rx="2" fill="var(--ok)" transform={`rotate(${i * 45} 80 45)`} />)}
        <circle cx="80" cy="45" r="22" fill="none" stroke="var(--ok)" strokeWidth="6" />
      </motion.g>
      <text x="80" y="49" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--fg)">PS&gt;</text>
    </svg>
  );
}

const AREAS = [
  { title: "Endpoint management", body: "Intune, Autopilot and Win32 app delivery that enrolls a laptop before its owner unboxes it.", Art: Endpoints },
  { title: "Identity & zero trust", body: "Entra ID, Conditional Access and phishing-resistant MFA so every sign-in earns its access.", Art: Shield },
  { title: "Microsoft 365 Copilot & AI agents", body: "Rolling out Copilot and custom agents safely, with Purview labels and DLP underneath.", Art: Neural },
  { title: "Infrastructure automation", body: "PowerShell and Graph API runbooks that turn a forty-step checklist into one command.", Art: Gear }
];

export default function Focus() {
  const r = useReducedMotion();
  return (
    <Section id="focus" eyebrow="// focus" title="Where I spend my time.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AREAS.map(({ title, body, Art }, i) => (
          <motion.div key={title} variants={reveal} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}>
            <Card className="h-full p-6">
              <Art r={r} />
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 text-muted">{body}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
