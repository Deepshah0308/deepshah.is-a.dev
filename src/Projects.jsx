import { useEffect, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Section, Card, Magnetic } from "./ui.jsx";

const USER = "Deepshah0308";
// stars/forks here are the fallback when GitHub's API is rate-limited
const REPOS = [
  { repo: "awesome-intunetools", tag: "Intune", span: "md:col-span-2", stars: 35, forks: 4, site: "https://deepshah0308.github.io/awesome-intunetools/",
    desc: "A searchable directory of 120+ community tools, scripts and utilities for Microsoft Intune admins.", flow: ["tools.json", "build.py", "link check", "GitHub Pages"] },
  { repo: "awesome-m365-copilot", tag: "Copilot", span: "", stars: 0, forks: 0,
    desc: "Curated M365 Copilot guides, prompts, agent skills and governance links with a monthly log.", flow: ["curation", "Markdown", "monthly log"] },
  { repo: "canopy-umbrel-store", name: "Canopy", tag: "Self-hosted", span: "", stars: 0, forks: 0, site: "https://deepshah0308.github.io/canopy-umbrel-store/",
    desc: "An Umbrel community app store, home of YAMS, the pre-wired media server.", flow: ["Docker", "Umbrel", "auto-update"] },
  { repo: "getme", tag: "Tools", span: "", stars: 0, forks: 0,
    desc: "Check, claim and wire up a free is-a.dev subdomain in a few clicks, no backend.", flow: ["check", "domain JSON", "pre-filled PR"] },
  { repo: "dell-bloatware-removal", tag: "Intune", span: "", stars: 0, forks: 0,
    desc: "Strips Dell bloatware from Windows while keeping Dell Command | Update.", flow: ["detect", "uninstall", "Intune Win32"] }
];
const FILTERS = ["All", "Intune", "Copilot", "Self-hosted", "Tools"];
const CACHE = "gh-repo-stats";

function useStats() {
  const [stats, setStats] = useState(() => { try { return JSON.parse(localStorage.getItem(CACHE)) || {}; } catch { return {}; } });
  useEffect(() => {
    fetch(`https://api.github.com/users/${USER}/repos?per_page=100`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((list) => {
        const next = Object.fromEntries(list.map((r) => [r.name, { stars: r.stargazers_count, forks: r.forks_count }]));
        setStats(next);
        try { localStorage.setItem(CACHE, JSON.stringify(next)); } catch {}
      })
      .catch(() => {}); // keep cache/fallback numbers
  }, []);
  return stats;
}

function Tilt({ children, className }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.35 }}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height); }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Projects() {
  const [filter, setFilter] = useState("All");
  const stats = useStats();
  const shown = REPOS.filter((r) => filter === "All" || r.tag === filter);
  return (
    <Section id="work" eyebrow="// open source" title="Fleet tools I build in the open." intro="Live stars and forks from GitHub. Hover a card to see how it's put together.">
      <div role="group" aria-label="Filter projects" className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${filter === f ? "border-accent bg-accent/15 text-fg" : "border-line text-muted hover:text-fg"}`}>
            {f}
          </button>
        ))}
      </div>
      <motion.div layout className="grid auto-rows-[minmax(220px,auto)] gap-4 md:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((r) => {
            const s = stats[r.repo] || r;
            const href = `https://github.com/${USER}/${r.repo}`;
            return (
              <Tilt key={r.repo} className={filter === "All" ? r.span : ""}>
                <Card className="group h-full p-6 flex flex-col">
                  <div className="flex items-center justify-between label">
                    <span>{r.tag}</span>
                    <span className="flex gap-3 tabular-nums"><span>★ {s.stars}</span><span>⑂ {s.forks}</span></span>
                  </div>
                  <h3 className={`mt-6 font-semibold tracking-tight ${r.span && filter === "All" ? "text-3xl sm:text-4xl" : "text-2xl"}`}>{r.name || r.repo}</h3>
                  <p className="mt-2 text-muted">{r.desc}</p>
                  {/* architecture preview: the build pipeline, revealed on hover/focus */}
                  <div className="mt-auto pt-6">
                    <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-muted opacity-60 transition group-hover:opacity-100 group-focus-within:opacity-100">
                      {r.flow.map((step, i) => (
                        <span key={step} className="flex items-center gap-1.5">
                          {i > 0 && <span className="text-accent">→</span>}
                          <span className="rounded-md border border-line px-2 py-1">{step}</span>
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex gap-2">
                      <Magnetic><a href={href} className="inline-flex h-9 items-center rounded-full bg-fg px-4 text-sm font-medium text-bg">Source</a></Magnetic>
                      {r.site && <Magnetic><a href={r.site} className="inline-flex h-9 items-center rounded-full border border-line px-4 text-sm hover:border-accent">Live site</a></Magnetic>}
                    </div>
                  </div>
                </Card>
              </Tilt>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </Section>
  );
}
