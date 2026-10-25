import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Lenis from "lenis";
import "./index.css";
import Hero from "./Hero.jsx";
import Console from "./Console.jsx";
import Tools from "./Tools.jsx";
import Projects from "./Projects.jsx";
import Focus from "./Focus.jsx";
import Contact from "./Contact.jsx";

function Nav() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || "dark");
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch {}
  }, [theme]);
  return (
    <nav className="fixed inset-x-0 top-3 z-40 mx-auto flex w-[min(100%-2rem,72rem)] items-center justify-between rounded-full border border-line bg-bg/70 px-4 py-2 backdrop-blur-xl">
      <a href="#top" className="font-semibold tracking-tight">deep<span className="text-accent">.</span>shah</a>
      <div className="flex items-center gap-1 sm:gap-4 text-sm text-muted">
        <a href="#console" className="hidden sm:inline hover:text-fg">Console</a>
        <a href="#tools" className="hidden sm:inline hover:text-fg">Tools</a>
        <a href="#work" className="hidden sm:inline hover:text-fg">Work</a>
        <a href="#contact" className="hover:text-fg px-2">Contact</a>
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "blueprint light" : "obsidian dark"} mode`}
          className="grid size-9 place-items-center rounded-full border border-line hover:border-accent hover:text-fg">
          {theme === "dark"
            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>}
        </button>
      </div>
    </nav>
  );
}

function App() {
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    let id = requestAnimationFrame(function raf(t) { lenis.raf(t); id = requestAnimationFrame(raf); });
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, []);
  return (
    <div className="noise">
      <div className="backdrop" />
      <Nav />
      <main>
        <Hero />
        <Console />
        <Tools />
        <Projects />
        <Focus />
        <Contact />
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
