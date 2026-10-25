import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, Magnetic } from "./ui.jsx";

const EMAIL = "shahdeepv03@gmail.com";
const LINKS = [
  { label: "GitHub", href: "https://github.com/Deepshah0308" },
  // shortcut: LinkedIn appears once a profile URL is filled in here
  { label: "LinkedIn", href: "" },
  { label: "shahdeep.ca", href: "https://shahdeep.ca" }
].filter((l) => l.href);
const COLORS = ["var(--accent)", "var(--ok)", "var(--warn)", "#ffffff"];

export default function Contact() {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setToast("Email copied to clipboard");
      if (!reduce) setBurst((b) => b + 1);
    } catch {
      setToast(`Copy blocked by your browser. The address is ${EMAIL}`);
    }
    setTimeout(() => setToast(""), 2400);
  };

  return (
    <section id="contact" className="scroll-mt-20 mx-auto max-w-7xl px-4 sm:px-6 pb-10">
      <Card className="relative p-8 sm:p-14">
        <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-20 h-96 w-96 rounded-full opacity-30 blur-3xl" style={{ background: "var(--accent)" }} />
        <p className="label">// contact</p>
        <h2 className="mt-4 max-w-[14ch] text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.02]">Have a fleet that needs taming?</h2>
        <a href={`mailto:${EMAIL}`} className="mt-6 inline-block font-mono text-lg sm:text-2xl text-muted hover:text-fg break-all">{EMAIL}</a>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="relative">
            <Magnetic>
              <button onClick={copy} className="inline-flex h-12 items-center rounded-full bg-fg px-6 font-medium text-bg transition hover:opacity-90">Copy email</button>
            </Magnetic>
            {/* confetti burst, re-keyed on every copy */}
            <span key={burst} aria-hidden className="pointer-events-none absolute left-1/2 top-1/2">
              {burst > 0 && Array.from({ length: 18 }, (_, i) => {
                const a = (i / 18) * Math.PI * 2;
                return (
                  <motion.i key={i} className="absolute block size-2 rounded-[2px]" style={{ background: COLORS[i % 4] }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{ x: Math.cos(a) * (60 + (i % 3) * 25), y: Math.sin(a) * (60 + (i % 3) * 25) + 30, opacity: 0, rotate: 270 }}
                    transition={{ duration: 0.9, ease: "easeOut" }} />
                );
              })}
            </span>
          </span>
          {LINKS.map((l) => (
            <Magnetic key={l.label}><a href={l.href} className="inline-flex h-12 items-center rounded-full border border-line px-6 transition hover:border-accent">{l.label}</a></Magnetic>
          ))}
        </div>
      </Card>
      <footer className="flex flex-col gap-2 py-8 label sm:flex-row sm:justify-between">
        <span>© Deep Shah · deepshah.is-a.dev</span>
        <span>React · Three.js · Framer Motion · GitHub Pages</span>
      </footer>
      <AnimatePresence>
        {toast && (
          <motion.div role="status" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-bg/90 px-5 py-3 font-mono text-sm backdrop-blur">
            <span className="text-ok">✓</span> {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
