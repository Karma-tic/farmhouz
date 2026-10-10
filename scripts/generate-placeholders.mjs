/**
 * Generates tasteful, clearly-marked placeholder media for Farmhouze.
 *
 *   node scripts/generate-placeholders.mjs            # photos + hero frames + video
 *   node scripts/generate-placeholders.mjs --photos   # photos only
 *
 * Every file written here is a stand-in. Replace it with a real photo/video of the
 * same file name (see ASSETS.md). Photos carry a small "TODO-replace" tag.
 */
import sharp from "sharp";
import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const MEDIA = path.join(ROOT, "public/media");
const args = new Set(process.argv.slice(2));
const only = (k) => args.size === 0 || args.has(`--${k}`);

/* ------------------------------------------------------------------ helpers */
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
const R = (a, b) => a + rand() * (b - a);

const tag = (w, h) =>
  `<g font-family="monospace" font-size="${Math.round(w / 70)}" letter-spacing="2">
     <rect x="${w - w / 4.6}" y="${h - h / 13}" width="${w / 5}" height="${h / 22}" rx="${h / 44}" fill="#14130F" opacity=".55"/>
     <text x="${w - w / 4.6 + w / 10}" y="${h - h / 13 + h / 32}" text-anchor="middle" fill="#EDE6D6">TODO-replace</text>
   </g>`;

const grainDefs = `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0"/></filter>`;

function tree(x, y, s, c1 = "#3E5233", c2 = "#56703F") {
  return `<g><rect x="${x - s * 0.06}" y="${y - s * 0.5}" width="${s * 0.12}" height="${s * 0.5}" fill="#4A3A2A"/>
    <circle cx="${x}" cy="${y - s * 0.75}" r="${s * 0.42}" fill="${c1}"/>
    <circle cx="${x - s * 0.22}" cy="${y - s * 0.62}" r="${s * 0.3}" fill="${c2}" opacity=".85"/>
    <circle cx="${x + s * 0.2}" cy="${y - s * 0.9}" r="${s * 0.24}" fill="${c2}" opacity=".7"/></g>`;
}
function lights(x1, y1, x2, y2, n, sag, color = "#FFD38A") {
  let s = `<path d="M${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}" stroke="#2a2420" stroke-width="2" fill="none" opacity=".6"/>`;
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t * t * x2;
    const y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + sag) + t * t * y2;
    s += `<circle cx="${x}" cy="${y}" r="9" fill="${color}" opacity=".35"/><circle cx="${x}" cy="${y}" r="4" fill="${color}"/>`;
  }
  return s;
}
function house(x, y, w, h, night = false) {
  const win = night ? "#FFC46B" : "#2B2A27";
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${night ? "#2B2620" : "#E9DCC3"}"/>
    <polygon points="${x - w * 0.06},${y} ${x + w / 2},${y - h * 0.55} ${x + w * 1.06},${y}" fill="${night ? "#3A2018" : "#A8481F"}"/>`;
  for (let i = 0; i < 4; i++)
    s += `<rect x="${x + w * (0.1 + i * 0.22)}" y="${y + h * 0.3}" width="${w * 0.1}" height="${h * 0.35}" fill="${win}" opacity="${night ? 0.95 : 0.75}"/>`;
  return s;
}

/* ----------------------------------------------------------------- scenes */
// Each scene draws into a W×H canvas. Palette leans warm to match the brand.
const scenes = {
  mist: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D8C4"/><stop offset="1" stop-color="#B9C6CF"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <circle cx="${W * 0.7}" cy="${H * 0.38}" r="${H * 0.07}" fill="#F7E7C9"/>
    <path d="M0 ${H * 0.55} Q ${W * 0.3} ${H * 0.45} ${W * 0.6} ${H * 0.53} T ${W} ${H * 0.5} V ${H} H 0Z" fill="#8FA08A" opacity=".7"/>
    <path d="M0 ${H * 0.65} Q ${W * 0.4} ${H * 0.58} ${W} ${H * 0.66} V ${H} H 0Z" fill="#6E8460"/>
    ${Array.from({ length: 9 }, (_, i) => tree(W * (0.05 + i * 0.11), H * (0.66 + (i % 2) * 0.02), H * 0.12, "#5E7357", "#71876A")).join("")}
    <rect y="${H * 0.5}" width="${W}" height="${H * 0.12}" fill="#F4EEE1" opacity=".35"/>
    <path d="M0 ${H * 0.78} Q ${W * 0.5} ${H * 0.72} ${W} ${H * 0.8} V ${H} H 0Z" fill="#4A5A3C"/>`,

  lawn: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE3EA"/><stop offset="1" stop-color="#F4EEE1"/></linearGradient>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C9A4E"/><stop offset="1" stop-color="#4A6B2E"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    ${house(W * 0.36, H * 0.38, W * 0.3, H * 0.16)}
    <rect y="${H * 0.54}" width="${W}" height="${H * 0.46}" fill="url(#g)"/>
    ${tree(W * 0.1, H * 0.56, H * 0.5)}${tree(W * 0.88, H * 0.57, H * 0.55)}${tree(W * 0.72, H * 0.55, H * 0.3)}
    ${lights(W * 0.1, H * 0.25, W * 0.88, H * 0.22, 14, H * 0.12)}
    <ellipse cx="${W * 0.5}" cy="${H * 0.8}" rx="${W * 0.18}" ry="${H * 0.03}" fill="#3F5A26" opacity=".5"/>`,

  pool: (W, H) => `
    <defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7FC4CF"/><stop offset="1" stop-color="#2E8FA3"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="#E8DCC4"/>
    <rect x="${W * 0.12}" y="${H * 0.2}" width="${W * 0.76}" height="${H * 0.58}" rx="${H * 0.03}" fill="#D9CBB0"/>
    <rect x="${W * 0.15}" y="${H * 0.24}" width="${W * 0.7}" height="${H * 0.5}" rx="${H * 0.02}" fill="url(#w)"/>
    ${Array.from({ length: 16 }, () => `<path d="M${R(W * 0.17, W * 0.8)} ${R(H * 0.27, H * 0.7)} q 30 -12 60 0 t 60 0" stroke="#D8F1F3" stroke-width="4" fill="none" opacity=".6"/>`).join("")}
    ${[0.2, 0.36, 0.52].map((x) => `<rect x="${W * x}" y="${H * 0.82}" width="${W * 0.12}" height="${H * 0.08}" rx="12" fill="#F4EEE1"/><rect x="${W * x}" y="${H * 0.82}" width="${W * 0.12}" height="${H * 0.025}" rx="8" fill="#C9963A"/>`).join("")}
    ${tree(W * 0.94, H * 0.3, H * 0.4)}${tree(W * 0.05, H * 0.95, H * 0.5)}`,

  rooms: (W, H) => `
    <rect width="${W}" height="${H}" fill="#EFE6D4"/>
    <rect x="${W * 0.55}" y="${H * 0.12}" width="${W * 0.3}" height="${H * 0.45}" fill="#CFE3EA"/>
    ${tree(W * 0.7, H * 0.58, H * 0.4, "#6E8A55", "#86A06A")}
    <rect x="${W * 0.55}" y="${H * 0.12}" width="${W * 0.3}" height="${H * 0.45}" fill="none" stroke="#A88B62" stroke-width="14"/>
    <line x1="${W * 0.7}" y1="${H * 0.12}" x2="${W * 0.7}" y2="${H * 0.57}" stroke="#A88B62" stroke-width="10"/>
    <rect y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="#BFA27A"/>
    <rect x="${W * 0.08}" y="${H * 0.5}" width="${W * 0.5}" height="${H * 0.28}" rx="18" fill="#FBF8F1"/>
    <rect x="${W * 0.08}" y="${H * 0.36}" width="${W * 0.5}" height="${H * 0.18}" rx="14" fill="#7A5B3C"/>
    <rect x="${W * 0.12}" y="${H * 0.45}" width="${W * 0.18}" height="${H * 0.09}" rx="20" fill="#F4EEE1"/>
    <rect x="${W * 0.34}" y="${H * 0.45}" width="${W * 0.18}" height="${H * 0.09}" rx="20" fill="#F4EEE1"/>
    <rect x="${W * 0.08}" y="${H * 0.6}" width="${W * 0.5}" height="${H * 0.18}" fill="#C9963A" opacity=".55"/>
    <polygon points="${W * 0.55},${H * 0.57} ${W * 0.85},${H * 0.57} ${W},${H} ${W * 0.4},${H}" fill="#FFF3D6" opacity=".35"/>`,

  orchard: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E4C0"/><stop offset="1" stop-color="#E9D3A6"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <rect y="${H * 0.55}" width="${W}" height="${H * 0.45}" fill="#7E8F4F"/>
    ${[0.55, 0.62, 0.72, 0.85, 1.02]
      .map((y, r) =>
        Array.from({ length: 7 }, (_, i) => tree(W * (-0.05 + i * 0.18 + (r % 2) * 0.09), H * y, H * (0.18 + r * 0.12), "#4B6236", "#6A8048")).join(""),
      )
      .join("")}
    ${Array.from({ length: 30 }, () => `<circle cx="${R(0, W)}" cy="${R(H * 0.2, H * 0.9)}" r="${R(6, 12)}" fill="#E6A53A" opacity=".85"/>`).join("")}`,

  bonfire: (W, H) => `
    <defs><radialGradient id="f" cx=".5" cy=".72" r=".55"><stop offset="0" stop-color="#E8823A" stop-opacity=".9"/><stop offset=".35" stop-color="#7A3A1A" stop-opacity=".55"/><stop offset="1" stop-color="#14130F" stop-opacity="0"/></radialGradient></defs>
    <rect width="${W}" height="${H}" fill="#14130F"/>
    ${Array.from({ length: 90 }, () => `<circle cx="${R(0, W)}" cy="${R(0, H * 0.5)}" r="${R(1, 3)}" fill="#EDE6D6" opacity="${R(0.3, 0.9)}"/>`).join("")}
    <rect width="${W}" height="${H}" fill="url(#f)"/>
    <ellipse cx="${W * 0.5}" cy="${H * 0.8}" rx="${W * 0.14}" ry="${H * 0.04}" fill="#3A2A20"/>
    <path d="M${W * 0.44} ${H * 0.79} Q ${W * 0.46} ${H * 0.6} ${W * 0.5} ${H * 0.52} Q ${W * 0.53} ${H * 0.62} ${W * 0.56} ${H * 0.79}Z" fill="#E8823A"/>
    <path d="M${W * 0.47} ${H * 0.79} Q ${W * 0.49} ${H * 0.66} ${W * 0.5} ${H * 0.6} Q ${W * 0.52} ${H * 0.68} ${W * 0.53} ${H * 0.79}Z" fill="#F6C46A"/>
    ${[0.26, 0.36, 0.64, 0.74].map((x) => `<rect x="${W * x - 30}" y="${H * 0.78}" width="60" height="70" rx="10" fill="#2A211A"/>`).join("")}
    ${Array.from({ length: 24 }, () => `<circle cx="${R(W * 0.42, W * 0.58)}" cy="${R(H * 0.3, H * 0.55)}" r="${R(2, 4)}" fill="#F6C46A" opacity="${R(0.4, 1)}"/>`).join("")}`,

  porch: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2B872"/><stop offset="1" stop-color="#F4DDB6"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <circle cx="${W * 0.3}" cy="${H * 0.52}" r="${H * 0.08}" fill="#FFF0D0"/>
    <path d="M0 ${H * 0.55} H ${W} V ${H} H 0Z" fill="#8C9A5A"/>
    <path d="M0 ${H * 0.6} H ${W} V ${H} H 0Z" fill="#6E7E44" opacity=".7"/>
    <rect y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="#9A7350"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect x="${i * W * 0.14}" y="${H * 0.72}" width="4" height="${H * 0.28}" fill="#6B4E35"/>`).join("")}
    <rect x="${W * 0.55}" y="${H * 0.62}" width="${W * 0.06}" height="${H * 0.1}" rx="8" fill="#F4EEE1"/>
    <path d="M${W * 0.61} ${H * 0.65} q 30 10 0 30" stroke="#F4EEE1" stroke-width="8" fill="none"/>
    <path d="M${W * 0.57} ${H * 0.6} q -10 -20 0 -40 q 10 -15 0 -30" stroke="#FFFFFF" stroke-width="4" fill="none" opacity=".6"/>
    <rect x="0" y="0" width="${W * 0.05}" height="${H}" fill="#6B4E35"/>`,

  decor: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4A6B"/><stop offset="1" stop-color="#C9663A"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <rect y="${H * 0.7}" width="${W}" height="${H * 0.3}" fill="#3F4F2F"/>
    ${lights(0, H * 0.15, W, H * 0.18, 18, H * 0.14)}${lights(0, H * 0.3, W, H * 0.26, 16, H * 0.1)}
    ${Array.from({ length: 10 }, (_, i) => `<line x1="${W * (0.08 + i * 0.095)}" y1="${H * 0.05}" x2="${W * (0.08 + i * 0.095)}" y2="${H * 0.55}" stroke="#E8A33A" stroke-width="10" stroke-dasharray="12 6" opacity=".9"/>`).join("")}
    <rect x="${W * 0.3}" y="${H * 0.55}" width="${W * 0.4}" height="${H * 0.18}" rx="10" fill="#FBF8F1" opacity=".92"/>
    ${Array.from({ length: 12 }, (_, i) => `<circle cx="${W * (0.33 + i * 0.03)}" cy="${H * 0.55}" r="10" fill="#F2B872"/>`).join("")}`,

  couple: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2B872"/><stop offset="1" stop-color="#C9663A"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <circle cx="${W * 0.5}" cy="${H * 0.55}" r="${H * 0.12}" fill="#FFE2A8" opacity=".9"/>
    <rect y="${H * 0.62}" width="${W}" height="${H * 0.38}" fill="#6B5A2E"/>
    ${tree(W * 0.12, H * 0.66, H * 0.55, "#3D3420", "#4E4228")}${tree(W * 0.9, H * 0.68, H * 0.6, "#3D3420", "#4E4228")}
    <g fill="#2A211A"><circle cx="${W * 0.46}" cy="${H * 0.46}" r="${H * 0.03}"/><rect x="${W * 0.44}" y="${H * 0.49}" width="${W * 0.04}" height="${H * 0.22}" rx="18"/>
    <circle cx="${W * 0.54}" cy="${H * 0.47}" r="${H * 0.028}"/><path d="M${W * 0.52} ${H * 0.5} h ${W * 0.04} l ${W * 0.03} ${H * 0.22} h -${W * 0.1}Z"/></g>`,

  hall: (W, H) => `
    <rect width="${W}" height="${H}" fill="#E7DCC6"/>
    <rect y="${H * 0.68}" width="${W}" height="${H * 0.32}" fill="#A8845C"/>
    <rect x="${W * 0.25}" y="${H * 0.5}" width="${W * 0.5}" height="${H * 0.08}" rx="10" fill="#6B4E35"/>
    <rect x="${W * 0.3}" y="${H * 0.58}" width="${W * 0.02}" height="${H * 0.14}" fill="#6B4E35"/><rect x="${W * 0.68}" y="${H * 0.58}" width="${W * 0.02}" height="${H * 0.14}" fill="#6B4E35"/>
    ${Array.from({ length: 5 }, (_, i) => `<rect x="${W * (0.32 + i * 0.075)}" y="${H * 0.44}" width="${W * 0.05}" height="${H * 0.06}" rx="6" fill="${["#A8481F", "#4A5A3C", "#C9963A", "#5C5448", "#2E8FA3"][i]}"/>`).join("")}
    <rect x="${W * 0.1}" y="${H * 0.12}" width="${W * 0.22}" height="${H * 0.28}" fill="#CFE3EA"/><rect x="${W * 0.68}" y="${H * 0.12}" width="${W * 0.22}" height="${H * 0.28}" fill="#CFE3EA"/>`,

  stars: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0B0A"/><stop offset="1" stop-color="#1F1B24"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    ${Array.from({ length: 220 }, () => `<circle cx="${R(0, W)}" cy="${R(0, H * 0.75)}" r="${R(0.8, 2.6)}" fill="#EDE6D6" opacity="${R(0.25, 1)}"/>`).join("")}
    <path d="M0 ${H * 0.78} Q ${W * 0.5} ${H * 0.74} ${W} ${H * 0.8} V ${H} H 0Z" fill="#0E0D0B"/>
    ${house(W * 0.4, H * 0.66, W * 0.22, H * 0.12, true)}
    ${tree(W * 0.2, H * 0.8, H * 0.35, "#0E0D0B", "#151410")}${tree(W * 0.82, H * 0.8, H * 0.3, "#0E0D0B", "#151410")}`,

  sunset: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B4A6B"/><stop offset=".5" stop-color="#F2B872"/><stop offset="1" stop-color="#C9663A"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <circle cx="${W * 0.55}" cy="${H * 0.66}" r="${H * 0.1}" fill="#FFD9A0"/>
    <path d="M0 ${H * 0.68} Q ${W * 0.3} ${H * 0.64} ${W * 0.6} ${H * 0.69} T ${W} ${H * 0.67} V ${H} H 0Z" fill="#3A2E24"/>
    ${Array.from({ length: 12 }, (_, i) => tree(W * (i * 0.09), H * (0.72 + (i % 3) * 0.01), H * R(0.08, 0.16), "#2A211A", "#33281F")).join("")}
    ${Array.from({ length: 5 }, (_, i) => `<path d="M${W * (0.2 + i * 0.05)} ${H * (0.3 + i * 0.03)} l 12 -6 l 12 6" stroke="#2A211A" stroke-width="3" fill="none"/>`).join("")}`,

  team: (W, H) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE3EA"/><stop offset="1" stop-color="#F4EEE1"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#s)"/>
    <rect y="${H * 0.5}" width="${W}" height="${H * 0.5}" fill="#6E8C45"/>
    ${tree(W * 0.85, H * 0.52, H * 0.55)}${tree(W * 0.08, H * 0.52, H * 0.4)}
    <rect x="${W * 0.62}" y="${H * 0.3}" width="${W * 0.16}" height="${H * 0.22}" fill="#FBF8F1" stroke="#5C5448" stroke-width="6"/>
    ${Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      const x = W * 0.4 + Math.cos(a) * W * 0.18, y = H * 0.72 + Math.sin(a) * H * 0.1;
      return `<circle cx="${x}" cy="${y - H * 0.08}" r="${H * 0.028}" fill="#2A211A"/><rect x="${x - H * 0.03}" y="${y - H * 0.05}" width="${H * 0.06}" height="${H * 0.08}" rx="14" fill="${["#A8481F", "#C9963A", "#4A5A3C", "#F4EEE1"][i % 4]}"/>`;
    }).join("")}`,

  peacock: (W, H) => `
    <rect width="${W}" height="${H}" fill="#C9D3A8"/>
    ${tree(W * 0.2, H * 0.9, H * 0.9, "#4B6236", "#6A8048")}${tree(W * 0.85, H * 0.9, H * 0.8, "#4B6236", "#6A8048")}
    <rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="#7E8F4F"/>
    <path d="M${W * 0.5} ${H * 0.72} Q ${W * 0.2} ${H * 0.8} ${W * 0.15} ${H * 0.95} L ${W * 0.85} ${H * 0.95} Q ${W * 0.8} ${H * 0.8} ${W * 0.5} ${H * 0.72}" fill="#1E6B5C"/>
    ${Array.from({ length: 14 }, (_, i) => `<circle cx="${W * (0.2 + i * 0.047)}" cy="${H * (0.9 - Math.sin((i / 13) * Math.PI) * 0.1)}" r="12" fill="#2E8FA3"/><circle cx="${W * (0.2 + i * 0.047)}" cy="${H * (0.9 - Math.sin((i / 13) * Math.PI) * 0.1)}" r="5" fill="#C9963A"/>`).join("")}
    <ellipse cx="${W * 0.5}" cy="${H * 0.66}" rx="${W * 0.03}" ry="${H * 0.08}" fill="#1C4E8A"/><circle cx="${W * 0.5}" cy="${H * 0.56}" r="${H * 0.025}" fill="#1C4E8A"/>`,
};

async function photo(scene, file, W, H, s = 1) {
  seed = s;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>${grainDefs}</defs>${scenes[scene](W, H)}
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5"/>${tag(W, H)}</svg>`;
  await mkdir(path.dirname(file), { recursive: true });
  const img = sharp(Buffer.from(svg));
  if (file.endsWith(".jpg")) await img.jpeg({ quality: 82 }).toFile(file);
  else await img.webp({ quality: 72 }).toFile(file);
}

const ratioSize = (ratio, long = 1600) => (ratio >= 1 ? [long, Math.round(long / ratio)] : [Math.round(long * ratio), long]);

async function photos() {
  const spaces = { lawn: "lawn", pool: "pool", rooms: "rooms", orchard: "orchard", bonfire: "bonfire" };
  for (const [k, sc] of Object.entries(spaces)) await photo(sc, `${MEDIA}/spaces/${k}.webp`, 2400, 1600, k.length);
  const packages = { "day-out": "pool", "night-stay": "stars", "weekend-escape": "porch", celebrations: "decor", shoots: "couple", corporate: "team" };
  for (const [k, sc] of Object.entries(packages)) await photo(sc, `${MEDIA}/packages/${k}.webp`, 1600, 1200, k.length * 3);
  const celebrations = { birthday: "lawn", haldi: "decor", wedding: "sunset", prewedding: "couple", offsite: "team" };
  for (const [k, sc] of Object.entries(celebrations)) await photo(sc, `${MEDIA}/celebrations/${k}.webp`, 1400, 1800, k.length * 5);
  const gallery = [
    ["mist", 1.5], ["pool", 0.8], ["lawn", 1.33], ["decor", 0.75], ["couple", 0.8], ["porch", 1.5],
    ["bonfire", 1], ["orchard", 0.75], ["sunset", 1.33], ["rooms", 1], ["pool", 1.5], ["sunset", 1.5],
    ["decor", 0.8], ["lawn", 1], ["peacock", 0.8], ["couple", 0.75], ["hall", 1.33], ["stars", 1.5],
  ];
  for (const [i, [sc, r]] of gallery.entries()) {
    const [w, h] = ratioSize(r);
    await photo(sc, `${MEDIA}/gallery/${String(i + 1).padStart(2, "0")}.webp`, w, h, i * 11 + 3);
  }
  await photo("porch", `${MEDIA}/og.jpg`, 1200, 630, 99);
  console.log("photos ✓");
}

/* ------------------------------------------------------- hero drone scene */
// A small pinhole-camera renderer: flat ground polygons + billboards, so every
// frame is crisp vector art. Sky is left transparent so the page sky shows through.
function heroFrame(t, W, H) {
  const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const e = ease(t);
  const zc = 0 + e * 206;
  const camH = 70 - e * 68.2;
  const pitch = (-30 + e * 28) * (Math.PI / 180);
  const f = W * 0.6;
  const cx = W / 2;
  const horizon = H / 2 + f * Math.tan(pitch);
  const NEAR = 0.6;
  const proj = (x, y, z) => {
    const d = z - zc;
    return [cx + (f * x) / d, horizon + (f * (camH - y)) / d];
  };
  const clipGround = (pts) => {
    // pts: [x,z] in order; clip against z >= zc+NEAR
    const out = [];
    const zn = zc + NEAR;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      const ina = a[1] >= zn, inb = b[1] >= zn;
      if (ina) out.push(a);
      if (ina !== inb) {
        const k = (zn - a[1]) / (b[1] - a[1]);
        out.push([a[0] + (b[0] - a[0]) * k, zn]);
      }
    }
    return out;
  };
  const ground = (pts, fill, extra = "") => {
    const c = clipGround(pts);
    if (c.length < 3) return "";
    return `<polygon points="${c.map(([x, z]) => proj(x, 0, z).map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="${fill}" ${extra}/>`;
  };
  let s = "";
  // far hills (billboard at huge distance)
  const hz = 4000;
  if (hz - zc > NEAR) {
    let d = "";
    for (let x = -6000; x <= 6000; x += 400) {
      const [px, py] = proj(x, 120 + 90 * Math.sin(x / 900) + 50 * Math.sin(x / 330), hz);
      d += `${d ? "L" : "M"}${px.toFixed(1)} ${py.toFixed(1)} `;
    }
    const [, gy] = proj(0, 0, hz);
    s += `<path d="${d} L ${W * 4} ${gy + 2} L ${-W * 3} ${gy + 2}Z" fill="#8FA08A" opacity=".85"/>`;
  }
  // base ground
  {
    const [, gy] = proj(0, 0, hz);
    s += `<rect x="0" y="${gy.toFixed(1)}" width="${W}" height="${Math.max(0, H - gy + 2).toFixed(1)}" fill="#7C8F5A"/>`;
  }
  // fields: patchwork
  seed = 42;
  const fieldCols = ["#8DA35B", "#A9B66A", "#C9B26A", "#6E8A4A", "#B7A257", "#7FA05A"];
  for (let z = -40; z < 195; z += 18) {
    for (let x = -900; x < 900; x += 120) {
      const col = fieldCols[Math.floor(rand() * fieldCols.length)];
      if (Math.abs(x + 60) < 70 && z > 150) continue;
      s += ground([[x + 2, z + 1], [x + 118, z + 1], [x + 118, z + 17], [x + 2, z + 17]], col);
    }
  }
  // crop rows
  for (let x = -880; x < 880; x += 9) s += ground([[x, -40], [x + 1.2, -40], [x + 1.2, 150], [x, 150]], "#5E7A3E", 'opacity=".35"');
  // dirt road to the gate
  s += ground([[-5, -60], [5, -60], [5, 200], [-5, 200]], "#C8B08A");
  // lawn inside the walls
  s += ground([[-110, 200], [110, 200], [110, 300], [-110, 300]], "#5F8F3A");
  s += ground([[-3, 200], [3, 200], [3, 252], [-3, 252]], "#D8C7A4");
  // ---- vertical things, painter's order (far → near)
  const items = [];
  const billboard = (x, z, draw) => items.push({ z, draw: () => (z - zc > NEAR ? draw((f) / (z - zc), proj(x, 0, z)) : "") });
  // house
  billboard(0, 262, (k, [px, py]) => {
    const w = 60 * k, h = 15 * k;
    let g = `<rect x="${px - w / 2}" y="${py - h}" width="${w}" height="${h}" fill="#E9DCC3"/>`;
    g += `<polygon points="${px - w * 0.56},${py - h} ${px},${py - h - 9 * k} ${px + w * 0.56},${py - h}" fill="#A8481F"/>`;
    for (let i = 0; i < 5; i++) g += `<rect x="${px - w / 2 + w * (0.08 + i * 0.18)}" y="${py - h * 0.75}" width="${w * 0.08}" height="${h * 0.42}" fill="#3A332A" opacity=".8"/>`;
    g += `<rect x="${px - w * 0.06}" y="${py - h * 0.6}" width="${w * 0.12}" height="${h * 0.6}" fill="#6B4E35"/>`;
    return g;
  });
  // trees around
  seed = 9;
  const treeSpots = [];
  for (let i = 0; i < 70; i++) treeSpots.push([R(-700, 700), R(-30, 190)]);
  for (let i = 0; i < 14; i++) treeSpots.push([(i % 2 ? 1 : -1) * R(60, 105), R(215, 290)]);
  for (let i = 0; i < 30; i++) treeSpots.push([R(-1400, 1400), R(300, 900)]);
  for (const [x, z] of treeSpots) {
    if (Math.abs(x) < 14 && z < 200) continue;
    const h = R(9, 15);
    billboard(x, z, (k, [px, py]) => {
      const sz = h * k;
      if (sz < 1.2) return "";
      return `<rect x="${px - sz * 0.05}" y="${py - sz * 0.45}" width="${sz * 0.1}" height="${sz * 0.45}" fill="#4A3A2A"/><circle cx="${px}" cy="${py - sz * 0.7}" r="${sz * 0.38}" fill="#3E5233"/><circle cx="${px - sz * 0.15}" cy="${py - sz * 0.78}" r="${sz * 0.22}" fill="#56703F"/>`;
    });
  }
  // boundary wall with gate at z=200
  billboard(0, 200, (k, [px, py]) => {
    const wh = 2.4 * k;
    const gap = 7 * k;
    let g = `<rect x="${px - 110 * k}" y="${py - wh}" width="${110 * k - gap}" height="${wh}" fill="#D9C9A8"/>`;
    g += `<rect x="${px + gap}" y="${py - wh}" width="${110 * k - gap}" height="${wh}" fill="#D9C9A8"/>`;
    g += `<rect x="${px - 110 * k}" y="${py - wh}" width="${220 * k}" height="${wh * 0.12}" fill="#A8481F"/>`;
    const ph = 6.5 * k, pw = 1.3 * k;
    g += `<rect x="${px - gap - pw}" y="${py - ph}" width="${pw}" height="${ph}" fill="#C9B48E"/><rect x="${px + gap}" y="${py - ph}" width="${pw}" height="${ph}" fill="#C9B48E"/>`;
    g += `<path d="M${px - gap - pw / 2} ${py - ph} Q ${px} ${py - ph - 2.2 * k} ${px + gap + pw / 2} ${py - ph}" stroke="#4A5A3C" stroke-width="${0.7 * k}" fill="none"/>`;
    return g;
  });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) s += it.draw();
  // gentle haze near the horizon, fading sky→ground
  s += `<rect x="0" y="${horizon - H * 0.03}" width="${W}" height="${H * 0.08}" fill="#F4EEE1" opacity=".18"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs><clipPath id="c"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#c)">${s}</g></svg>`;
}

async function hero() {
  const dir = `${MEDIA}/hero-flight`;
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const N = 120;
  for (let i = 0; i < N; i++) {
    const svg = heroFrame(i / (N - 1), 1920, 1080);
    await sharp(Buffer.from(svg)).webp({ quality: 62, alphaQuality: 80 }).toFile(`${dir}/${String(i + 1).padStart(4, "0")}.webp`);
  }
  // poster = final frame on an opaque morning sky (used for reduced motion / OG fallbacks)
  const sky = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE3EA"/><stop offset="1" stop-color="#F4EEE1"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#s)"/></svg>`;
  await sharp(Buffer.from(sky)).composite([{ input: `${dir}/0120.webp` }]).webp({ quality: 70 }).toFile(`${MEDIA}/hero-poster-farmhouse.webp`);
  console.log("hero frames ✓");

  // vertical mobile loop (ping-pong over the second half of the flight)
  const tmp = path.join(ROOT, ".tmp-hero");
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  const M = 84; // 3.5s forward @24fps, then reversed → 7s loop
  const skyV = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9D8C4"/><stop offset="1" stop-color="#B9C6CF"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#s)"/></svg>`;
  const skyBuf = await sharp(Buffer.from(skyV)).png().toBuffer();
  for (let i = 0; i < M; i++) {
    const t = 0.35 + (i / (M - 1)) * 0.65;
    const fr = await sharp(Buffer.from(heroFrame(t, 1080, 1920))).png().toBuffer();
    await sharp(skyBuf).composite([{ input: fr }]).png().toFile(`${tmp}/${String(i + 1).padStart(4, "0")}.png`);
    await sharp(skyBuf).composite([{ input: fr }]).png().toFile(`${tmp}/${String(2 * M - i).padStart(4, "0")}.png`);
  }
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "24", "-i", `${tmp}/%04d.png`, "-vf", "scale=720:-2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "30", "-preset", "slow", "-an", "-movflags", "+faststart", `${MEDIA}/hero-mobile-farmhouse.mp4`]);
  await sharp(`${tmp}/0001.png`).resize(720).webp({ quality: 65 }).toFile(`${MEDIA}/hero-mobile-poster-farmhouse.webp`);
  await rm(tmp, { recursive: true, force: true });
  console.log("mobile video ✓");
}

if (only("photos")) await photos();
if (only("hero")) await hero();
