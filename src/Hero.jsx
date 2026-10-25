import { lazy, Suspense } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Card, Magnetic, Ticker } from "./ui.jsx";

const Topology = lazy(() => import("./Topology.jsx"));

// Impact metrics shown in the hero. Edit these to match your real numbers.
const METRICS = [
  { to: 10000, suffix: "+", label: "endpoints managed" },
  { to: 99.9, decimals: 1, suffix: "%", label: "automation uptime" },
  { to: 100, suffix: "%", label: "zero-trust enforced" },
  { to: 5, suffix: "+", label: "open-source fleet tools" }
];

export default function Hero() {
  const reduce = useReducedMotion();
  const line = { hidden: { y: "110%" }, show: (i) => ({ y: "0%", transition: { duration: 0.9, delay: 0.1 + i * 0.12, ease: [0.16, 1, 0.3, 1] } }) };
  return (
    <section id="top" className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-24 sm:pt-28 pb-10">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[min(900px,100vw)] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-12">
        <Card className="col-span-2 lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between min-h-[460px]">
          <div className="flex items-center gap-2 label"><span className="dot" />cloud infrastructure &amp; security architect</div>
          <div>
            <h1 className="mt-10 text-[clamp(2.6rem,6.4vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
              {["Secure by default.", "Automated by design."].map((t, i) => (
                <span key={t} className="block overflow-hidden pb-[0.06em]">
                  <motion.span className="block" variants={line} custom={i} initial={reduce ? false : "hidden"} animate="show">
                    {i ? <span className="bg-gradient-to-r from-fg to-accent bg-clip-text text-transparent">{t}</span> : t}
                  </motion.span>
                </span>
              ))}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted">
              <span className="text-fg font-medium">Deep Shah</span>, Cloud Infrastructure &amp; Security Architect in Canada. I design, secure and automate enterprise fleets with Intune, Entra ID, Defender and Microsoft 365 Copilot.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Magnetic><a href="#console" className="inline-flex h-11 items-center rounded-full bg-fg px-5 font-medium text-bg transition hover:opacity-90">Open the fleet console</a></Magnetic>
              <Magnetic><a href="#tools" className="inline-flex h-11 items-center rounded-full border border-line px-5 font-medium transition hover:border-accent">Build a script</a></Magnetic>
            </div>
          </div>
        </Card>

        <Card className="col-span-2 lg:col-span-5 min-h-[360px] lg:min-h-[460px]">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4 label">
            <span className="flex items-center gap-2"><span className="dot" />topology.live</span>
            <span className="hidden sm:inline">drag to rotate · hover a node</span>
          </div>
          <div className="absolute inset-0">
            <Suspense fallback={<div className="grid h-full place-items-center label">loading topology…</div>}>
              <Topology reduce={reduce} />
            </Suspense>
          </div>
          <p className="absolute inset-x-0 bottom-0 px-5 py-4 label">simulated packet flow and latency</p>
        </Card>

        {METRICS.map((m, i) => (
          <Card key={m.label} className="lg:col-span-3 p-4 sm:p-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
              <div className="text-3xl sm:text-5xl font-semibold tracking-tight"><Ticker {...m} /></div>
              <div className="label mt-2">{m.label}</div>
            </motion.div>
          </Card>
        ))}
      </div>
    </section>
  );
}
