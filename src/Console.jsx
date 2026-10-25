import { useEffect, useRef, useState } from "react";
import { Section, Card } from "./ui.jsx";

// Simulated fleet output. Each line: [text, tone]. Tones map to colours below.
const OUT = {
  help: [
    ["Available commands", "head"],
    ["  whoami            who runs this fleet", ""],
    ["  fleet --status    health of the managed estate", ""],
    ["  intune --remediate  run proactive remediations", ""],
    ["  copilot --agents  list deployed M365 Copilot agents", ""],
    ["  clear             wipe this tab", ""]
  ],
  whoami: [
    ["deep.shah", "head"],
    ["Cloud Infrastructure & Security Architect · Canada", ""],
    ["stack: Intune · Autopilot · Entra ID · Defender · M365 Copilot · PowerShell · Proxmox", "muted"],
    ["contact: shahdeepv03@gmail.com", "muted"]
  ],
  "fleet --status": [
    ["Querying Microsoft Graph…", "muted"],
    ["[OK]   Compliance          98.7% compliant across Windows, macOS, iOS", "ok"],
    ["[OK]   BitLocker           escrowed keys for every encrypted device", "ok"],
    ["[WARN] Updates             142 devices behind on the latest quality update", "warn"],
    ["[OK]   Defender            real-time protection on, signatures current", "ok"],
    ["Fleet healthy. 1 warning.", "head"]
  ],
  "intune --remediate": [
    ["Triggering proactive remediations…", "muted"],
    ["[RUN]  Detect-StaleTime.ps1        → 37 devices drifted, resynced", "info"],
    ["[RUN]  Detect-DiskCleanup.ps1      → 12.4 GB reclaimed", "info"],
    ["[RUN]  Detect-ServiceHealth.ps1    → IntuneManagementExtension restarted on 4", "info"],
    ["[OK]   All remediations reported success", "ok"]
  ],
  "copilot --agents": [
    ["Deployed Copilot agents", "head"],
    ["[LIVE] helpdesk-triage      routes tickets from Teams to the right queue", "ok"],
    ["[LIVE] policy-explainer     answers 'why was I blocked?' from CA logs", "ok"],
    ["[PILOT] onboarding-buddy    walks new hires through Autopilot", "warn"],
    ["Purview DLP and sensitivity labels enforced on all agents.", "muted"]
  ]
};
const PRESETS = ["help", "whoami", "fleet --status", "intune --remediate", "copilot --agents", "clear"];
const TONE = { head: "text-fg font-medium", ok: "text-ok", warn: "text-warn", info: "text-accent", muted: "text-muted", err: "text-red-400", cmd: "text-fg" };
const BADGE = /^\[(OK|WARN|RUN|LIVE|PILOT)\]/;
const TABS = ["fleet-01", "intune", "copilot"];
const welcome = () => [["Fleet console. This is a simulated environment. Type help.", "muted"]];

function Line({ text, tone }) {
  const m = text.match(BADGE);
  if (tone === "cmd") return <div><span className="text-accent">deep@fleet ~ %</span> {text}</div>;
  if (!m) return <div className={TONE[tone] || ""}>{text}</div>;
  return (
    <div className={TONE[tone] || ""}>
      <span className="mr-2 inline-block min-w-[3.6rem] rounded border border-current/40 px-1 text-center text-[10px] leading-5">{m[1]}</span>
      {text.slice(m[0].length).trim()}
    </div>
  );
}

export default function Console() {
  const [tab, setTab] = useState(0);
  const [logs, setLogs] = useState(() => TABS.map(welcome));
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const outRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { outRef.current?.scrollTo({ top: outRef.current.scrollHeight }); }, [logs, tab]);

  const push = (t, line) => setLogs((L) => L.map((l, i) => (i === t ? [...l, line] : l)));

  function run(raw) {
    const cmd = raw.trim().replace(/\s+/g, " ");
    if (!cmd || busy) return;
    const t = tab;
    if (cmd === "clear") return setLogs((L) => L.map((l, i) => (i === t ? [] : l)));
    push(t, [cmd, "cmd"]);
    const lines = OUT[cmd] || [[`zsh: command not found: ${cmd}. Try help.`, "err"]];
    setBusy(true);
    // stream line by line like a real shell
    lines.forEach((line, i) => timers.current.push(setTimeout(() => {
      push(t, line);
      if (i === lines.length - 1) setBusy(false);
    }, 140 + i * 160)));
  }

  return (
    <Section id="console" eyebrow="// interactive" title="Ask the fleet console." intro="Pick a preset or type your own command. Each tab keeps its own session.">
      <Card className="backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(110,139,255,.35)]">
        <div className="flex items-center gap-2 border-b border-line px-4">
          <span className="flex gap-1.5 py-3" aria-hidden><i className="size-3 rounded-full bg-[#FF5F57]" /><i className="size-3 rounded-full bg-[#FEBC2E]" /><i className="size-3 rounded-full bg-[#28C840]" /></span>
          <div role="tablist" aria-label="Console sessions" className="ml-3 flex overflow-x-auto">
            {TABS.map((name, i) => (
              <button key={name} role="tab" aria-selected={tab === i} onClick={() => setTab(i)}
                className={`font-mono text-xs px-3 py-3 border-b-2 transition ${tab === i ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg"}`}>
                {name}
              </button>
            ))}
          </div>
          <span className="ml-auto label hidden sm:inline">zsh · 120×32</span>
        </div>
        <div ref={outRef} role="log" aria-live="polite" tabIndex={0} className="h-[340px] overflow-y-auto px-5 py-4 font-mono text-[13px] leading-6 whitespace-pre-wrap">
          {logs[tab].map(([text, tone], i) => <Line key={i} text={text} tone={tone} />)}
          {busy && <span className="inline-block h-4 w-2 animate-pulse bg-accent align-middle" />}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }} className="flex items-center gap-3 border-t border-line px-5 py-3 font-mono text-[13px]">
          <label htmlFor="cmd" className="text-accent whitespace-nowrap">deep@fleet ~ %</label>
          <input id="cmd" value={input} onChange={(e) => setInput(e.target.value)} autoComplete="off" spellCheck="false" placeholder="type a command"
            className="min-w-0 flex-1 bg-transparent text-fg outline-none placeholder:text-muted" />
        </form>
        <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => run(p)} disabled={busy}
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition hover:border-accent hover:text-fg disabled:opacity-50">
              {p}
            </button>
          ))}
        </div>
      </Card>
    </Section>
  );
}
