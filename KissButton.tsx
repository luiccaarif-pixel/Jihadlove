import { AnimatePresence, motion } from "framer-motion";
import {
  CircleAlert,
  Heart,
  Info,
  Mic,
  Music2,
  Pause,
  Play,
  Quote,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import type { VoiceNote } from "../hooks/useVoiceNote";
import { formatTime } from "../lib/audio";
import type { BurstKind } from "./BurstLayer";

interface Accent {
  card: string;       // card background tint
  cardEdge: string;   // card border
  btnFrom: string;    // button gradient start
  btnTo: string;      // button gradient end
  btnShadow: string;  // button glow
  ring: string;       // progress ring stroke
  chip: string;       // small chip background
  chipText: string;
  msgBg: string;
  msgEdge: string;
  msgText: string;
  badge: string;
}

export const ACCENTS: Record<"one" | "two", Accent> = {
  one: {
    card: "bg-blush-50",
    cardEdge: "border-blush-200",
    btnFrom: "#FB7BA4",
    btnTo: "#F2568B",
    btnShadow: "0 18px 38px -12px rgba(242, 86, 139, 0.55), 0 4px 10px -2px rgba(242, 86, 139, 0.4)",
    ring: "#F2568B",
    chip: "bg-blush-100",
    chipText: "text-rose-deep",
    msgBg: "bg-white",
    msgEdge: "border-blush-300",
    msgText: "text-rose-deep",
    badge: "bg-blush-500",
  },
  two: {
    card: "bg-[#FDF1EC]",
    cardEdge: "border-[#F6D8CC]",
    btnFrom: "#FFA24D",
    btnTo: "#F2568B",
    btnShadow: "0 18px 38px -12px rgba(242, 86, 139, 0.45), 0 4px 12px -2px rgba(255, 162, 77, 0.45)",
    ring: "#FFA24D",
    chip: "bg-[#FFE9DB]",
    chipText: "text-[#B94A17]",
    msgBg: "bg-white",
    msgEdge: "border-[#F6B79B]",
    msgText: "text-[#B94A17]",
    badge: "bg-[#FF8A3D]",
  },
};

/* 5 soft equalizer bars shown while the voice is playing */
function WaveBars() {
  const bars = [
    { delay: "0s", dur: "0.82s", h: "h-5" },
    { delay: "0.18s", dur: "0.7s", h: "h-7" },
    { delay: "0.05s", dur: "0.95s", h: "h-8" },
    { delay: "0.28s", dur: "0.75s", h: "h-6" },
    { delay: "0.12s", dur: "1.0s", h: "h-5" },
  ];
  return (
    <div className="flex items-center gap-[3px]" aria-hidden>
      {bars.map((b, i) => (
        <span
          key={i}
          className={`wave-bar w-[3.5px] rounded-full bg-white/95 ${b.h}`}
          style={{ animationDelay: b.delay, animationDuration: b.dur }}
        />
      ))}
    </div>
  );
}

const RING_R = 27;
const RING_C = 2 * Math.PI * RING_R;

interface KissButtonProps {
  accent: Accent;
  numberLabel: string;
  displayText: string;
  buttonLabel: string;
  buttonSub: string;
  message: string;
  burstKind: BurstKind;
  note: VoiceNote;
  ready: boolean;
  onBurst: (kind: BurstKind, x: number, y: number) => void;
  onConnectClick: () => void;
}

export default function KissButton({
  accent,
  numberLabel,
  displayText,
  buttonLabel,
  buttonSub,
  message,
  burstKind,
  note,
  ready,
  onBurst,
  onConnectClick,
}: KissButtonProps) {
  const playing = note.status === "playing";
  const loading = note.status === "loading";
  const progress = note.duration > 0 ? Math.min(1, note.currentTime / note.duration) : 0;
  const showMessage =
    playing || note.status === "paused" || note.status === "ended" || loading;

  const fireBurst = (e: { clientX?: number; clientY?: number }) => {
    onBurst(burstKind, e.clientX ?? window.innerWidth / 2, e.clientY ?? window.innerHeight / 2);
  };

  const handlePrimary = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ready) {
      onConnectClick();
      return;
    }
    const wasPlaying = playing || loading;
    note.toggle();
    if (!wasPlaying) fireBurst(e);
  };

  const handleReplay = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ready) return;
    note.replay();
    fireBurst(e);
  };

  const handleStop = () => note.stop();

  const seekFill = `${progress * 100}%`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 90, damping: 17 }}
      className={`relative flex flex-col overflow-hidden rounded-[2rem] border ${accent.cardEdge} ${accent.card} p-5 shadow-[var(--shadow-soft)] sm:p-6`}
    >
      {/* number badge */}
      <div
        className={`absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full ${accent.badge} font-display text-sm font-bold text-white shadow-[var(--shadow-chip)]`}
        aria-hidden
      >
        {numberLabel}
      </div>

      {/* the words Jihad wants to say */}
      <div className="relative mb-5 pr-8">
        <Quote
          size={20}
          strokeWidth={2.4}
          className="absolute -left-1 -top-2 text-blush-300"
          fill="#FFCADA"
          aria-hidden
        />
        <p className="pl-6 text-[15px] font-medium leading-[1.85] text-ink sm:text-base">
          {displayText}
        </p>
      </div>

      {/* ------- the big tappable button (or the honest "not connected yet" box) ------- */}
      {!ready ? (
        <div className="rounded-3xl border-2 border-dashed border-blush-300 bg-white/70 px-5 py-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blush-100">
            <Mic size={26} className="text-blush-500" />
          </div>
          <p className="font-display text-lg font-bold text-rose-deep">
            অডিও এখনো সংযোগ হয়নি
          </p>
          <p className="mx-auto mt-1.5 max-w-xs text-[13px] leading-relaxed text-ink-soft">
            জিহাদের রেকর্ডিংটা এখনো সাইটে ঢোকানো হয়নি।{" "}
            <code className="rounded bg-blush-100 px-1.5 py-0.5 text-[11px] text-rose-deep">
              public/uploads/chumu-{note.id === "one" ? "one" : "two"}.mp3
            </code>{" "}
            রাখলেই এখানে সুর বেজে উঠবে।
          </p>
          <button
            type="button"
            onClick={onConnectClick}
            className="mt-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl border border-blush-300 bg-white px-5 py-2.5 font-display text-sm font-bold text-rose-deep shadow-[var(--shadow-chip)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95"
          >
            <Info size={17} />
            কীভাবে সংযোগ করবে, দেখো
          </button>
        </div>
      ) : (
        <>
          {note.status === "error" ? (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] leading-snug text-amber-900">
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <span>
                {note.error === "unsupported"
                  ? "এই ব্রাউজার ফাইলটা চালাতে পারল না। ফাইলটা .mp3 হলে সবচেয়ে ভালো চলে।"
                  : "ফাইলটা বাজাতে সমস্যা হলো। আবার চেষ্টা করো, নাহলে নিচের প্যানেল থেকে ফাইলটা আবার বেছে নাও।"}
              </span>
            </div>
          ) : null}

          <button
            type="button"
            onClick={handlePrimary}
            aria-pressed={playing}
            aria-label={
              playing
                ? `${buttonLabel} — বাজছে, থামানোর জন্য চাপো`
                : `${buttonLabel} — জিহাদের রেকর্ডিং শোনো`
            }
            className="group relative flex min-h-[76px] w-full touch-manipulation select-none items-center gap-3 overflow-hidden rounded-3xl px-3.5 py-3 text-left text-white transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] sm:gap-4 sm:px-4"
            style={{
              background: `linear-gradient(135deg, ${accent.btnFrom} 0%, ${accent.btnTo} 100%)`,
              boxShadow: accent.btnShadow,
            }}
          >
            {/* shimmer sweep */}
            <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <span className="shimmer-sweep absolute inset-y-[-30%] w-24 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            </span>

            {/* heart + progress ring */}
            <span className="relative flex h-[62px] w-[62px] shrink-0 items-center justify-center sm:h-[66px] sm:w-[66px]">
              <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90">
                <circle
                  cx="32" cy="32" r={RING_R}
                  fill="rgba(255,255,255,0.22)"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="3.5"
                />
                <circle
                  cx="32" cy="32" r={RING_R}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C * (1 - progress)}
                  style={{ transition: "stroke-dashoffset 0.18s linear" }}
                />
              </svg>
              <span className="relative flex h-11 w-11 items-center justify-center sm:h-12 sm:w-12">
                {loading ? (
                  <span className="h-7 w-7 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
                ) : playing ? (
                  <Pause size={30} fill="#fff" strokeWidth={1.5} />
                ) : (
                  <Heart size={34} fill="#ffffff" strokeWidth={0} className="drop-shadow" />
                )}
              </span>
            </span>

            {/* labels */}
            <span className="relative z-10 min-w-0 flex-1">
              <span className="block font-display text-[1.55rem] font-extrabold leading-tight tracking-tight drop-shadow-sm sm:text-3xl">
                {buttonLabel}
              </span>
              <span className="mt-0.5 block text-[11px] font-medium text-white/90 sm:text-xs">
                {buttonSub}
              </span>
            </span>

            {/* right slot: wave bars while playing, big tap hint otherwise */}
            <span className="relative z-10 flex w-12 shrink-0 items-center justify-center sm:w-14">
              {playing ? (
                <WaveBars />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 transition-transform duration-200 group-hover:scale-110 sm:h-12 sm:w-12">
                  <Play size={21} fill="#fff" strokeWidth={1.6} className="ml-0.5" />
                </span>
              )}
            </span>
          </button>

          {/* ------- progress scrubber + replay/stop ------- */}
          <div className="mt-3 flex items-center gap-2.5 px-1">
            <span className="w-9 text-right font-mono text-[11px] tabular-nums text-ink-soft">
              {formatTime(note.currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={note.duration > 0 ? note.duration : 100}
              step={0.05}
              value={note.duration > 0 ? note.currentTime : 0}
              onChange={(e) => note.seek(Number(e.target.value))}
              aria-label="রেকর্ডিং কতটুকু বাজল"
              className="blush-range h-1.5 flex-1"
              style={{ "--fill": seekFill } as React.CSSProperties}
            />
            <span className="w-9 font-mono text-[11px] tabular-nums text-ink-soft">
              {note.duration > 0 ? formatTime(note.duration) : "--:--"}
            </span>
            <button
              type="button"
              onClick={handleReplay}
              aria-label="আবার শুরু থেকে শোনো"
              title="আবার শুরু থেকে শোনো"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blush-200 bg-white text-rose-deep shadow-[var(--shadow-chip)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blush-50 active:scale-95"
            >
              <RotateCcw size={18} strokeWidth={2.4} />
            </button>
            <button
              type="button"
              onClick={handleStop}
              aria-label="থামো"
              title="থামো"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blush-200 bg-white text-ink-soft shadow-[var(--shadow-chip)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-blush-50 active:scale-95"
            >
              <X size={18} strokeWidth={2.4} />
            </button>
          </div>

          {/* ------- the sweet message that blooms after the kiss ------- */}
          <AnimatePresence>
            {showMessage && (
              <motion.div
                key="msg"
                initial={{ opacity: 0, height: 0, y: 14, scale: 0.92 }}
                animate={{ opacity: 1, height: "auto", y: 0, scale: 1 }}
                exit={{ opacity: 0, height: 0, y: -8, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 210, damping: 21 }}
                className="overflow-hidden"
              >
                <div
                  role="status"
                  aria-live="polite"
                  className={`mt-3 flex items-start gap-2.5 rounded-2xl border ${accent.msgEdge} ${accent.msgBg} px-4 py-3 shadow-[var(--shadow-chip)]`}
                >
                  <Sparkles size={19} className="mt-0.5 shrink-0 text-amber-400" fill="#FDE68A" />
                  <p className={`text-[14px] font-semibold leading-relaxed ${accent.msgText}`}>
                    {message}
                  </p>
                  <Heart size={17} className="mt-1 shrink-0 text-blush-500" fill="#F2568B" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.article>
  );
}
