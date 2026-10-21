import { useMemo } from "react";
import { motion } from "framer-motion";
import { useIsMobile, usePrefersReducedMotion } from "../hooks/useIsMobile";

/* Deterministic pseudo-random generator so the layout is stable between renders */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PETAL_COLORS = ["#FFCADA", "#FFA8C0", "#FFE4EC", "#FB9FBE", "#FDD3E0"];
const HEART_COLORS = ["#FB7BA4", "#F2568B", "#FFC0D4", "#F484A9"];

interface FloatItem {
  left: number;
  size: number;
  dur: number;
  delay: number;
  drift: number;
  opacity: number;
  color: string;
  shape: "heart" | "petal";
}

function FloatingHearts() {
  const isMobile = useIsMobile();
  const reduced = usePrefersReducedMotion();

  const items = useMemo<FloatItem[]>(() => {
    const rng = mulberry32(20261021);
    const count = isMobile ? 13 : 26;
    return Array.from({ length: count }, (_, i) => ({
      left: rng() * 100,
      size: i % 3 === 0 ? 18 + rng() * 14 : 10 + rng() * 14,
      dur: 17 + rng() * 14,
      delay: -rng() * 30,
      drift: (rng() - 0.5) * 160,
      opacity: 0.32 + rng() * 0.35,
      color:
        rng() > 0.45
          ? HEART_COLORS[Math.floor(rng() * HEART_COLORS.length)]
          : PETAL_COLORS[Math.floor(rng() * PETAL_COLORS.length)],
      shape: rng() > 0.4 ? "heart" : "petal",
    }));
  }, [isMobile]);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((it, i) => (
        <span
          key={i}
          className="float-item absolute bottom-[-40px]"
          style={
            {
              left: `${it.left}%`,
              "--dur": `${it.dur}s`,
              "--delay": `${it.delay}s`,
              "--drift": `${it.drift}px`,
              "--po": it.opacity,
              opacity: 0,
            } as React.CSSProperties
          }
        >
          {it.shape === "heart" ? (
            <svg width={it.size} height={it.size} viewBox="0 0 24 24" fill={it.color}>
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 4.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          ) : (
            <svg width={it.size} height={it.size} viewBox="0 0 24 24" fill={it.color}>
              <ellipse cx="12" cy="12" rx="6.5" ry="10" transform="rotate(35 12 12)" />
            </svg>
          )}
        </span>
      ))}
    </div>
  );
}

function TwinkleStars() {
  const reduced = usePrefersReducedMotion();
  const stars = useMemo(() => {
    const rng = mulberry32(9917);
    return Array.from({ length: 22 }, () => ({
      left: rng() * 100,
      top: rng() * 88,
      size: 4 + rng() * 8,
      delay: -rng() * 4,
      dur: 2.4 + rng() * 2.4,
    }));
  }, []);

  if (reduced) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((s, i) => (
        <svg
          key={i}
          className="twinkle absolute"
          style={
            {
              left: `${s.left}%`,
              top: `${s.top}%`,
              "--delay": `${s.delay}s`,
              "--dur": `${s.dur}s`,
            } as React.CSSProperties
          }
          width={s.size}
          height={s.size}
          viewBox="0 0 24 24"
          fill="#F9D77E"
        >
          <path d="M12 0l2.35 9.65L24 12l-9.65 2.35L12 24l-2.35-9.65L0 12l9.65-2.35L12 0z" />
        </svg>
      ))}
    </div>
  );
}

/* ---------- fairy-light garland hung across the hero ---------- */
const G_SEGMENTS: [number, number, number, number, number, number][] = [
  // x1, y1, cx, cy, x2, y2
  [-30, 6, 330, 108, 706, 34],
  [706, 34, 1110, 108, 1470, 6],
];
const BULB_COLORS = ["#FB7BA4", "#FFE3EC", "#F9D77E", "#FFC9D9", "#FDE68A", "#FDA4AF"];

function quadPoint(seg: number[], t: number) {
  const [x1, y1, cx, cy, x2, y2] = seg;
  const mt = 1 - t;
  return {
    x: mt * mt * x1 + 2 * mt * t * cx + t * t * x2,
    y: mt * mt * y1 + 2 * mt * t * cy + t * t * y2,
  };
}

export function Garland() {
  const bulbs = useMemo(() => {
    const list: { x: number; y: number; drop: number; color: string; big: boolean }[] = [];
    G_SEGMENTS.forEach((seg) => {
      for (let t = 0.06; t <= 0.96; t += 0.082) {
        const p = quadPoint(seg, t);
        const idx = Math.round(t * 100);
        list.push({
          x: p.x,
          y: p.y,
          drop: 7 + (idx % 3) * 3,
          color: BULB_COLORS[idx % BULB_COLORS.length],
          big: idx % 4 === 1,
        });
      }
    });
    return list;
  }, []);

  const wire = G_SEGMENTS.map(
    (s) => `M ${s[0]} ${s[1]} Q ${s[2]} ${s[3]} ${s[4]} ${s[5]}`
  ).join(" ");

  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 1440 116"
      preserveAspectRatio="xMidYMin slice"
      className="pointer-events-none absolute left-0 top-0 z-[1] h-20 w-full sm:h-24 lg:h-28"
      animate={{ rotate: [-0.45, 0.6, -0.45] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      style={{ transformOrigin: "50% 0%" }}
    >
      <defs>
        <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6D8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFF6D8" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={wire} fill="none" stroke="#B9849A" strokeWidth="1.6" opacity="0.85" />
      {bulbs.map((b, i) => (
        <g key={i}>
          <line
            x1={b.x}
            y1={b.y}
            x2={b.x}
            y2={b.y + b.drop}
            stroke="#B9849A"
            strokeWidth="1.4"
            opacity="0.85"
          />
          <circle cx={b.x} cy={b.y + b.drop + 3} r="8.5" fill="url(#bulbGlow)" />
          {b.big ? (
            <path
              transform={`translate(${b.x} ${b.y + b.drop + 1.5}) scale(0.42) translate(-12 -12)`}
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 4.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill={b.color}
              stroke="#B9849A"
              strokeWidth="1.6"
            />
          ) : (
            <circle
              cx={b.x}
              cy={b.y + b.drop + 3}
              r="4.6"
              fill={b.color}
              stroke="#B9849A"
              strokeWidth="1.3"
            />
          )}
        </g>
      ))}
    </motion.svg>
  );
}

/** Fixed, decorative, behind everything. */
export default function AmbientBackground() {
  return (
    <>
      {/* soft blush aurora washes */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div
          className="absolute -left-32 top-[-10%] h-[34rem] w-[34rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #FFD3E1 0%, transparent 70%)", opacity: 0.75 }}
        />
        <div
          className="absolute -right-36 top-[28%] h-[36rem] w-[36rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #FFE0CC 0%, transparent 70%)", opacity: 0.7 }}
        />
        <div
          className="absolute bottom-[-14%] left-[22%] h-[38rem] w-[38rem] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #FFDCE8 0%, transparent 70%)", opacity: 0.8 }}
        />
      </div>
      <TwinkleStars />
      <FloatingHearts />
    </>
  );
}
