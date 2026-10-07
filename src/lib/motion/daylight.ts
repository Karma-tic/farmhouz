import type { Phase } from "@/content/site";

/** Sky stops from the design system, positioned along the 0→1 daylight axis */
const STOPS: { at: number; top: string; bottom: string; veil: number; tint: [number, number, number, number]; phase: Phase }[] = [
  { at: 0.0, top: "#E9D8C4", bottom: "#B9C6CF", veil: 0.4, tint: [185, 198, 207, 0.0], phase: "dawn" },
  { at: 0.18, top: "#DCE3E0", bottom: "#E7E8E0", veil: 0.35, tint: [255, 255, 255, 0.0], phase: "morning" },
  { at: 0.36, top: "#CFE3EA", bottom: "#F4EEE1", veil: 0.3, tint: [255, 255, 255, 0.0], phase: "noon" },
  { at: 0.6, top: "#F2B872", bottom: "#C9663A", veil: 0.55, tint: [242, 184, 114, 0.07], phase: "golden" },
  { at: 0.8, top: "#5B4A6B", bottom: "#1F1B24", veil: 0, tint: [91, 74, 107, 0.0], phase: "dusk" },
  { at: 1.0, top: "#14130F", bottom: "#0B0B0A", veil: 0, tint: [20, 19, 15, 0], phase: "night" },
];

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(" ")})`;
};

export type SkyState = {
  top: string;
  bottom: string;
  veil: number;
  tint: string;
  phase: Phase;
};

export function skyAt(d: number): SkyState {
  const v = Math.min(1, Math.max(0, d));
  let i = 0;
  while (i < STOPS.length - 2 && v > STOPS[i + 1].at) i++;
  const a = STOPS[i], b = STOPS[i + 1];
  const t = (v - a.at) / (b.at - a.at);
  const tint = a.tint.map((c, k) => c + (b.tint[k] - c) * t);
  return {
    top: mix(a.top, b.top, t),
    bottom: mix(a.bottom, b.bottom, t),
    veil: a.veil + (b.veil - a.veil) * t,
    tint: `rgb(${tint.slice(0, 3).map(Math.round).join(" ")} / ${tint[3].toFixed(3)})`,
    phase: t < 0.5 ? a.phase : b.phase,
  };
}

/** 06:00 at daylight 0 → 23:48 at daylight 1 */
export function clockAt(d: number) {
  const minutes = 6 * 60 + Math.round(Math.min(1, Math.max(0, d)) * (17 * 60 + 48));
  const h24 = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}
