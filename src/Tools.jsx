import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Section, Card } from "./ui.jsx";
import { HARDENING, buildScript, highlight, estimateTokens, optimizePrompt } from "./lib/script.js";

const SAMPLE = "Could you please basically summarize the attached Intune compliance report and   just list the devices that are really out of compliance, in order to help the team prioritize?";

export default function Tools() {
  const [picked, setPicked] = useState(["bloat", "bitlocker"]);
  const [copied, setCopied] = useState(false);
  const [prompt, setPrompt] = useState(SAMPLE);

  const script = useMemo(() => buildScript(picked), [picked]);
  const tokens = useMemo(() => highlight(script), [script]);
  const optimized = useMemo(() => optimizePrompt(prompt), [prompt]);
  const before = estimateTokens(prompt), after = estimateTokens(optimized);
  const saved = before ? Math.round((1 - after / before) * 100) : 0;

  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const copy = async () => {
    try { await navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked; download still works */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([script], { type: "text/plain" }));
    Object.assign(document.createElement("a"), { href: url, download: "Invoke-FleetHardening.ps1" }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <Section id="tools" eyebrow="// free utility" title="Build a hardening script in ten seconds." intro="Toggle what you need and copy a ready-to-deploy PowerShell script for Intune. Nothing leaves your browser.">
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-4 p-5 sm:p-6">
          <p className="label mb-4">fleet script builder</p>
          <ul className="space-y-2">
            {HARDENING.map((h) => {
              const on = picked.includes(h.id);
              return (
                <li key={h.id}>
                  <button role="switch" aria-checked={on} onClick={() => toggle(h.id)}
                    className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition ${on ? "border-accent/60 bg-accent/10" : "border-line hover:border-accent/40"}`}>
                    <span><span className="block font-medium">{h.label}</span><span className="block text-sm text-muted">{h.hint}</span></span>
                    <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? "bg-accent" : "bg-line"}`}>
                      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 30 }} className={`absolute top-1 size-4 rounded-full bg-white ${on ? "right-1" : "left-1"}`} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-8 flex flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <span className="label">Invoke-FleetHardening.ps1 · {script.split("\n").length} lines</span>
            <div className="flex gap-2">
              <button onClick={copy} className="rounded-full border border-line px-4 py-1.5 text-sm transition hover:border-accent">{copied ? "Copied" : "Copy"}</button>
              <button onClick={download} className="rounded-full bg-fg px-4 py-1.5 text-sm font-medium text-bg transition hover:opacity-90">Download .ps1</button>
            </div>
          </div>
          <pre className="max-h-[440px] flex-1 overflow-auto p-5 font-mono text-[12.5px] leading-6" aria-label="Generated PowerShell script">
            <code>{tokens.map(([t, k], i) => (k ? <span key={i} className={`tok-${k}`}>{t}</span> : t))}</code>
          </pre>
        </Card>

        <Card className="lg:col-span-12 p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <p className="label">llm token optimizer preview</p>
            <p className="font-mono text-sm"><span className="text-muted">{before} → </span><span className="text-ok">{after} tokens</span><span className="text-muted"> · {saved}% saved (estimate)</span></p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="label">your prompt</span>
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5}
                className="mt-2 w-full resize-y rounded-xl border border-line bg-transparent p-4 font-mono text-[13px] outline-none focus:border-accent" />
            </label>
            <div>
              <span className="label">optimized</span>
              <div className="mt-2 min-h-[132px] rounded-xl border border-line p-4 font-mono text-[13px] whitespace-pre-wrap text-fg/90">{optimized || "…"}</div>
            </div>
          </div>
        </Card>
      </div>
    </Section>
  );
}
