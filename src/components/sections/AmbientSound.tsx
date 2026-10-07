"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { usePhase } from "@/lib/motion/useDaylight";
import { usePrefersReducedMotion } from "@/lib/motion/useReducedMotion";

/**
 * Optional ambience, OFF by default and never offered with reduced motion.
 * Synthesised with Web Audio (no files): birdsong by day; crickets and a crackling
 * fire at night.
 */
export function AmbientSound() {
  const reduce = usePrefersReducedMotion();
  const phase = usePhase();
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const night = phase === "dusk" || phase === "night";

  useEffect(() => {
    if (!on) return;
    const ctx = ctxRef.current ?? new AudioContext();
    ctxRef.current = ctx;
    void ctx.resume();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
    const timers: number[] = [];

    const chirp = (f0: number, f1: number, dur: number, vol: number, when = ctx.currentTime) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(f0, when);
      o.frequency.exponentialRampToValueAtTime(f1, when + dur);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(vol, when + dur * 0.2);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      o.connect(g).connect(master);
      o.start(when);
      o.stop(when + dur + 0.05);
    };

    if (!night) {
      const bird = () => {
        const t = ctx.currentTime;
        const n = 2 + Math.floor(Math.random() * 4);
        const base = 2200 + Math.random() * 1800;
        for (let i = 0; i < n; i++) chirp(base, base * (1.2 + Math.random() * 0.5), 0.08 + Math.random() * 0.06, 0.08, t + i * 0.13);
        timers.push(window.setTimeout(bird, 900 + Math.random() * 2600));
      };
      bird();
    } else {
      const cricket = () => {
        const t = ctx.currentTime;
        for (let i = 0; i < 3; i++) chirp(4400, 4300, 0.04, 0.025, t + i * 0.06);
        timers.push(window.setTimeout(cricket, 450 + Math.random() * 500));
      };
      const crackle = () => {
        const len = Math.floor(ctx.sampleRate * 0.03);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
        const s = ctx.createBufferSource();
        const g = ctx.createGain();
        const f = ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 900 + Math.random() * 2500;
        g.gain.value = 0.12 + Math.random() * 0.2;
        s.buffer = buf;
        s.connect(f).connect(g).connect(master);
        s.start();
        timers.push(window.setTimeout(crackle, 40 + Math.random() * 380));
      };
      cricket();
      crackle();
    }

    return () => {
      timers.forEach(clearTimeout);
      master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.2);
      window.setTimeout(() => master.disconnect(), 600);
    };
  }, [on, night]);

  useEffect(() => () => void ctxRef.current?.close(), []);

  if (reduce) return null;
  return (
    <button
      type="button"
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className="eyebrow inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-line bg-night px-4 text-moon transition-colors hover:border-moon/60"
    >
      {on ? <Volume2 className="size-4" strokeWidth={1.5} aria-hidden="true" /> : <VolumeX className="size-4" strokeWidth={1.5} aria-hidden="true" />}
      Ambient sound {on ? "on" : "off"}
    </button>
  );
}
