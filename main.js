import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
const { animate, scroll, stagger } = window.Motion; // loaded by the motion UMD script in index.html

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);

/* ---------- 3D fleet: devices drift unmanaged, then snap into a compliant sphere as you scroll ---------- */
const canvas = $("#fleet");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 15);
scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8a97, 1.7));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(5, 7, 9);
scene.add(sun);

const N = innerWidth < 700 ? 700 : 1400;
const fleet = new THREE.Group();
scene.add(fleet);
const mesh = new THREE.InstancedMesh(
  new THREE.BoxGeometry(0.2, 0.13, 0.014), // a laptop-shaped slab
  new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.25 }),
  N
);
fleet.add(mesh);

const grey = new THREE.Color("#A3AEB9"), signal = new THREE.Color("#E2561B");
const loose = [], lattice = [], qLoose = [], qLattice = [], delay = [], spin = [];
const tmp = new THREE.Object3D(), color = new THREE.Color(), p = new THREE.Vector3();
const golden = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  loose.push(new THREE.Vector3((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10 - 2));
  const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
  lattice.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r).multiplyScalar(4.4));
  tmp.position.copy(lattice[i]);
  tmp.lookAt(lattice[i].clone().multiplyScalar(2));
  qLattice.push(tmp.quaternion.clone());
  qLoose.push(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6)));
  delay.push(Math.random());
  spin.push(Math.random() * Math.PI * 2);
}

let progress = reduce ? 1 : 0, eased = progress, visible = true;
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const enrolledEl = $("#enrolled"), pctEl = $("#pct");
let lastCount = -1;

function frame(t) {
  if (visible) {
    eased += (progress - eased) * 0.08;
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    let count = 0;
    for (let i = 0; i < N; i++) {
      const e = ease(Math.min(1, Math.max(0, (eased * 1.35 - delay[i] * 0.35) / 1)));
      const drift = (1 - e) * 0.35;
      p.lerpVectors(loose[i], lattice[i], e);
      p.x += Math.sin(t * 0.0004 + spin[i]) * drift;
      p.y += Math.cos(t * 0.0005 + spin[i]) * drift;
      tmp.position.copy(p);
      tmp.quaternion.slerpQuaternions(qLoose[i], qLattice[i], e);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
      const done = e > 0.995;
      if (done) count++;
      mesh.setColorAt(i, color.copy(grey).lerp(signal, done ? 1 : e * 0.25));
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    fleet.rotation.y = t * 0.00008 * (reduce ? 0 : 1) + mouse.x * 0.35;
    fleet.rotation.x = mouse.y * 0.2;
    renderer.render(scene, camera);
    if (count !== lastCount) {
      lastCount = count;
      enrolledEl.textContent = count.toLocaleString();
      pctEl.textContent = Math.round((count / N) * 100);
    }
  }
  if (!reduce) requestAnimationFrame(frame);
}

function resize() {
  const { clientWidth: w, clientHeight: h } = canvas;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // keep the sphere framed on narrow screens
  camera.position.z = w < h ? 22 : 15;
  // on wide screens sit the sphere right of the headline
  fleet.position.x = w > 900 ? 2.8 : 0;
  camera.updateProjectionMatrix();
  if (reduce) frame(0);
}
addEventListener("resize", resize);
resize();
new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
});

if (!reduce) {
  const hint = $(".hint");
  scroll((v) => { progress = v; hint.style.opacity = Math.max(0, 1 - v * 5); }, { target: $(".hero"), offset: ["start start", "end end"] });
  requestAnimationFrame(frame);
  // the one orchestrated entrance: headline lines rise in
  animate(".hero h1 .ln > span", { y: ["110%", "0%"] }, { duration: 1, delay: stagger(0.12), ease: [0.2, 0.7, 0.2, 1] });
  animate(".hero .sub, .actions, .readout", { opacity: [0, 1] }, { duration: 0.8, delay: 0.5 });
}

/* ---------- projects: static list, refreshed with live stars ---------- */
const projects = [
  { repo: "awesome-intunetools", url: "https://deepshah0308.github.io/awesome-intunetools/", desc: "A searchable directory of 120+ community tools, scripts and utilities for Microsoft Intune admins.", lang: "Python", stars: 35 },
  { repo: "awesome-m365-copilot", desc: "Curated Microsoft 365 Copilot guides, prompts, agent skills and governance links, with a monthly updates log.", lang: "Markdown", stars: 0 },
  { repo: "canopy-umbrel-store", name: "Canopy", url: "https://deepshah0308.github.io/canopy-umbrel-store/", desc: "An Umbrel community app store, home of YAMS, the pre-wired self-hosted media server.", lang: "Python", stars: 0 },
  { repo: "getme", desc: "Check, claim and wire up a free is-a.dev subdomain in a few clicks, with no backend.", lang: "JavaScript", stars: 0 },
  { repo: "dell-bloatware-removal", desc: "Strips Dell bloatware from Windows machines while keeping Dell Command | Update.", lang: "PowerShell", stars: 0 }
];
const list = $("#projects");
function renderProjects() {
  list.replaceChildren(...projects.map((pr) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = pr.url || "https://github.com/Deepshah0308/" + pr.repo;
    a.innerHTML = `<span class="name"></span><span class="desc"></span><span class="meta"><span class="stars"></span><span class="lang"></span><span class="arrow" aria-hidden="true">↗</span></span>`;
    a.querySelector(".name").textContent = pr.name || pr.repo;
    a.querySelector(".desc").textContent = pr.desc;
    a.querySelector(".stars").textContent = "★ " + pr.stars;
    a.querySelector(".lang").textContent = pr.lang;
    li.append(a);
    return li;
  }));
}
renderProjects();
fetch("https://api.github.com/users/Deepshah0308/repos?per_page=100")
  .then((r) => (r.ok ? r.json() : []))
  .then((repos) => {
    for (const r of repos) {
      const pr = projects.find((x) => x.repo === r.name);
      if (pr) pr.stars = r.stargazers_count;
    }
    renderProjects();
  })
  .catch(() => {}); // keep the static counts when rate-limited

/* ---------- console ---------- */
const out = $("#out"), input = $("#cmd");
let tools = null;
const TOOLS_URL = "https://raw.githubusercontent.com/Deepshah0308/awesome-intunetools/main/data/tools.json";

function print(text, cls) {
  const div = document.createElement("div");
  if (cls) div.className = cls;
  div.textContent = text;
  out.append(div);
  out.scrollTop = out.scrollHeight;
  return div;
}
function printLink(label, href, note) {
  const div = document.createElement("div");
  const a = document.createElement("a");
  a.href = href; a.textContent = label; a.target = "_blank"; a.rel = "noopener";
  div.append(a);
  if (note) div.append(document.createTextNode("  " + note));
  out.append(div);
}
async function loadTools() {
  if (!tools) tools = await fetch(TOOLS_URL).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); });
  return tools;
}

const commands = {
  help() {
    print("whoami          who runs this fleet\nprojects        open-source work\ntools <query>   search the Intune tools directory (live)\nrandom          pull a random Intune tool\nfocus           what I work on\ncontact         get in touch\nclear           wipe the screen", "dim");
  },
  whoami() {
    print("Deep Shah, Infrastructure Platform & Security Engineer, Canada.\nI design, secure and automate enterprise environments:\nIntune, Autopilot, Entra ID, Conditional Access, Microsoft 365, Purview.");
  },
  projects() {
    for (const pr of projects) printLink((pr.name || pr.repo).padEnd(24), pr.url || "https://github.com/Deepshah0308/" + pr.repo, "★ " + pr.stars);
  },
  focus() {
    print("endpoint management   identity & access   m365 & copilot   automation", "dim");
  },
  contact() {
    printLink("Deep030899@gmail.com", "mailto:Deep030899@gmail.com");
    printLink("github.com/Deepshah0308", "https://github.com/Deepshah0308");
  },
  clear() { out.replaceChildren(); },
  async tools(q) {
    if (!q) return print("usage: tools <query>   e.g. tools autopilot", "dim");
    const loading = print("querying awesome-intunetools…", "dim");
    try {
      const d = await loadTools();
      const term = q.toLowerCase();
      const hits = d.tools.filter((t) => (t.name + " " + t.desc + " " + t.category + " " + t.author).toLowerCase().includes(term));
      loading.textContent = `${hits.length} of ${d.tools.length} tools match "${q}"`;
      hits.slice(0, 8).forEach((t) => printLink(t.name, t.url, "· " + t.desc));
      if (hits.length > 8) printLink(`see all ${hits.length} in the directory`, "https://deepshah0308.github.io/awesome-intunetools/");
    } catch (e) {
      loading.textContent = "Couldn't reach GitHub (" + e.message + "). Try again in a moment.";
    }
  },
  async random() {
    try {
      const d = await loadTools();
      const t = d.tools[Math.floor(Math.random() * d.tools.length)];
      print(`${t.name} by ${t.author}`, "ok");
      printLink(t.url, t.url, "· " + t.desc);
    } catch (e) {
      print("Couldn't reach GitHub (" + e.message + "). Try again in a moment.", "dim");
    }
  },
  sudo() {
    print("Access denied. Conditional Access policy \"Block untrusted visitors\" blocked this sign-in.\nError AADSTS53003. Ask your admin, who is me.", "ok");
  }
};

async function run(raw) {
  const line = raw.trim();
  if (!line) return;
  print(line, "cmd");
  const [name, ...rest] = line.split(/\s+/);
  const key = name.toLowerCase();
  const fn = Object.hasOwn(commands, key) && commands[key]; // ignore prototype names like "constructor"
  if (fn) await fn(rest.join(" "));
  else print(`zsh: command not found: ${name}. Type help.`, "dim");
}

$("#prompt").addEventListener("submit", (e) => {
  e.preventDefault();
  run(input.value);
  input.value = "";
});
document.querySelectorAll("[data-cmd]").forEach((b) => b.addEventListener("click", () => { run(b.dataset.cmd); input.focus({ preventScroll: true }); }));
print("Fleet console ready. Type help to see what it can do.", "dim");
