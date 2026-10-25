import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useInView, animate, useReducedMotion } from "framer-motion";

// Card with a mouse-tracking spotlight; CSS reads --x/--y.
export function Card({ className = "", children, ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return <div onMouseMove={onMove} className={`card ${className}`} {...rest}>{children}</div>;
}

// Pulls its child toward the cursor a little, springing back on leave.
export function Magnetic({ children, strength = 0.35 }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  return (
    <motion.span
      className="inline-block"
      style={{ x, y }}
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.span>
  );
}

// Counts up once when scrolled into view.
export function Ticker({ to, decimals = 0, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    const c = animate(0, to, { duration: 1.8, ease: [0.16, 1, 0.3, 1], onUpdate: setV });
    return () => c.stop();
  }, [inView, to, reduce]);
  return <span ref={ref} className="tabular-nums">{v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

// Section heading + scroll-triggered reveal used by every section.
export function Section({ id, eyebrow, title, intro, children, className = "" }) {
  return (
    <section id={id} className={`scroll-mt-20 mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-24 ${className}`}>
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 sm:mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="label mb-3">{eyebrow}</p>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight max-w-[18ch] leading-[1.05]">{title}</h2>
        </div>
        {intro && <p className="text-muted max-w-md">{intro}</p>}
      </motion.header>
      {children}
    </section>
  );
}

export const reveal = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] } })
};
