import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { usePrefersReducedMotion } from "../hooks/useIsMobile";

export type BurstKind = "kiss-one" | "kiss-two" | "tap" | "ended";

export interface BurstHandle {
  burst: (kind: BurstKind, x: number, y: number) => void;
}

type PType = "heart" | "kiss" | "sparkle" | "ring";

interface Particle {
  type: PType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  rot: number;
  vrot: number;
  size: number;
  color: string;
  glyph?: string;
  born: number;
  life: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
}

const HEART_COLORS = ["#F2568B", "#DB3D74", "#FB7BA4", "#FFA8C0", "#E11D48", "#FBB6CE"];
const KISS_ONE = ["😘"];
const KISS_TWO = ["😘", "💋", "😘"];

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

function drawHeart(ctx: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const s = p.size;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.moveTo(0, s * 0.38);
  ctx.bezierCurveTo(-s * 0.62, -s * 0.04, -s * 0.6, -s * 0.55, -s * 0.3, -s * 0.55);
  ctx.bezierCurveTo(-s * 0.1, -s * 0.55, 0, -s * 0.36, 0, -s * 0.27);
  ctx.bezierCurveTo(0, -s * 0.36, s * 0.1, -s * 0.55, s * 0.3, -s * 0.55);
  ctx.bezierCurveTo(s * 0.6, -s * 0.55, s * 0.62, -s * 0.04, 0, s * 0.38);
  ctx.closePath();
  ctx.fill();
  // glossy highlight
  ctx.globalAlpha = alpha * 0.55;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-s * 0.24, -s * 0.34, s * 0.13, s * 0.07, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const s = p.size;
  const twinkle = 0.72 + 0.28 * Math.sin((performance.now() / 130) + p.phase);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = alpha * twinkle;
  ctx.fillStyle = p.color;
  ctx.shadowColor = "#FFE9A8";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.16, -s * 0.16, s, 0);
  ctx.quadraticCurveTo(s * 0.16, s * 0.16, 0, s);
  ctx.quadraticCurveTo(-s * 0.16, s * 0.16, -s, 0);
  ctx.quadraticCurveTo(-s * 0.16, -s * 0.16, 0, -s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawKiss(ctx: CanvasRenderingContext2D, p: Particle, alpha: number) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.globalAlpha = alpha;
  ctx.font = `${p.size}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(p.glyph ?? "😘", 0, 0);
  ctx.restore();
}

function drawRing(ctx: CanvasRenderingContext2D, p: Particle, alpha: number) {
  const age = (performance.now() - p.born) / 1000;
  const progress = Math.min(1, age / p.life);
  const radius = p.size + progress * 190;
  ctx.save();
  ctx.globalAlpha = alpha * 0.85;
  ctx.strokeStyle = p.color;
  ctx.lineWidth = 3.5 * (1 - progress) + 0.8;
  ctx.beginPath();
  ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

const BurstLayer = forwardRef<BurstHandle>(function BurstLayer(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const lastRef = useRef(0);
  const reduced = usePrefersReducedMotion();
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;

  /* resize-aware canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const ensureLoop = () => {
    if (rafRef.current) return;
    lastRef.current = performance.now();
    const tick = (now: number) => {
      rafRef.current = 0;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const dt = Math.min(0.05, Math.max(0.001, (now - lastRef.current) / 1000));
      lastRef.current = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const list = particles.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        const age = (now - p.born) / 1000;
        if (age >= p.life) {
          list.splice(i, 1);
          continue;
        }
        p.vy += p.gravity * dt;
        p.x += (p.vx + p.swayAmp * Math.sin(age * p.swayFreq + p.phase)) * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;

        const fadeIn = Math.min(1, age / 0.14);
        const fadeOut = Math.min(1, (p.life - age) / (p.life * 0.32));
        const alpha = Math.max(0, Math.min(fadeIn, fadeOut));

        if (p.type === "heart") drawHeart(ctx, p, alpha);
        else if (p.type === "sparkle") drawSparkle(ctx, p, alpha);
        else if (p.type === "kiss") drawKiss(ctx, p, alpha);
        else if (p.type === "ring") drawRing(ctx, p, alpha);
      }

      if (list.length > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const spawnHeart = (x: number, y: number, power = 1) => {
    const angle = -Math.PI / 2 + rand(-0.85, 0.85);
    const speed = rand(150, 330) * power;
    particles.current.push({
      type: "heart",
      x: x + rand(-14, 14),
      y: y + rand(-8, 8),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 165,
      rot: rand(-0.5, 0.5),
      vrot: rand(-2.4, 2.4),
      size: rand(13, 24) * (power > 1 ? 1.15 : 1),
      color: pick(HEART_COLORS),
      born: performance.now(),
      life: rand(1.5, 2.3),
      swayAmp: rand(18, 46),
      swayFreq: rand(2.2, 3.6),
      phase: rand(0, Math.PI * 2),
    });
  };

  const spawnKiss = (x: number, y: number, glyphs: string[], power = 1) => {
    const angle = -Math.PI / 2 + rand(-0.6, 0.6);
    const speed = rand(170, 340) * power;
    particles.current.push({
      type: "kiss",
      x: x + rand(-10, 10),
      y: y + rand(-6, 6),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 135,
      rot: rand(-0.4, 0.4),
      vrot: rand(-1.6, 1.6),
      size: rand(20, 30) * (power > 1 ? 1.1 : 1),
      color: "#F2568B",
      glyph: pick(glyphs),
      born: performance.now(),
      life: rand(1.6, 2.4),
      swayAmp: rand(10, 30),
      swayFreq: rand(2, 3),
      phase: rand(0, Math.PI * 2),
    });
  };

  const spawnSparkle = (x: number, y: number, radial = false) => {
    const angle = radial ? rand(0, Math.PI * 2) : -Math.PI / 2 + rand(-1.1, 1.1);
    const speed = radial ? rand(90, 300) : rand(80, 240);
    particles.current.push({
      type: "sparkle",
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 240,
      rot: rand(0, Math.PI),
      vrot: rand(-3, 3),
      size: rand(5, 11),
      color: pick(["#FFD166", "#FFE9A8", "#FFF6D8", "#FBD38D"]),
      born: performance.now(),
      life: rand(0.8, 1.4),
      swayAmp: 0,
      swayFreq: 1,
      phase: rand(0, Math.PI * 2),
    });
  };

  useImperativeHandle(ref, () => ({
    burst(kind, x, y) {
      if (reducedRef.current) return;
      const B = particles.current;
      if (B.length > 240) B.splice(0, B.length - 240);
      const now = performance.now();

      if (kind === "tap") {
        for (let i = 0; i < 3; i++) spawnHeart(x, y, 0.5);
        spawnSparkle(x, y, true);
        spawnSparkle(x, y, true);
      } else if (kind === "ended") {
        for (let i = 0; i < 9; i++) spawnHeart(x, y, 0.9);
        for (let i = 0; i < 6; i++) spawnSparkle(x, y, true);
      } else if (kind === "kiss-one") {
        for (let i = 0; i < 10; i++) spawnHeart(x, y, 1);
        for (let i = 0; i < 4; i++) spawnKiss(x, y, KISS_ONE, 1);
        for (let i = 0; i < 8; i++) spawnSparkle(x, y, true);
      } else if (kind === "kiss-two") {
        for (let i = 0; i < 15; i++) spawnHeart(x, y, 1.18);
        for (let i = 0; i < 7; i++) spawnKiss(x, y, KISS_TWO, 1.15);
        for (let i = 0; i < 11; i++) spawnSparkle(x, y, true);
        particles.current.push({
          type: "ring",
          x, y,
          vx: 0, vy: 0, gravity: 0,
          rot: 0, vrot: 0,
          size: 14,
          color: "#F2568B",
          born: now,
          life: 0.85,
          swayAmp: 0, swayFreq: 1, phase: 0,
        });
      }
      ensureLoop();
    },
  }));

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    },
    []
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  );
});

export default BurstLayer;
