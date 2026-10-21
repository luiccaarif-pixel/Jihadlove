import { useCallback, useRef, useState } from "react";
import { Heart, Mic } from "lucide-react";
import AmbientBackground from "./components/AmbientBackground";
import BurstLayer, { type BurstHandle } from "./components/BurstLayer";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import KissButton, { ACCENTS } from "./components/KissButton";
import LoveNote from "./components/LoveNote";
import AudioConnectPanel from "./components/AudioConnectPanel";
import Footer from "./components/Footer";
import { useVoiceNote, type VoiceNote } from "./hooks/useVoiceNote";
import type { VoiceId } from "./lib/audio";

const COPY = {
  one: {
    displayText:
      "এই যে আমার পিচ্চি, তোমার জন্য অনেক অনেকগুলো চুমু! মুয়াহ! আরেকটা নাও, মুয়াহ! উম্মাহ! ভালোবাসি তোমাকে।",
    buttonLabel: "চুমু চাই",
    buttonSub: "চাপো — জিহাদের নিজের কণ্ঠ শুনবে",
    message: "এই নাও বুশরা, তোমার জন্য একগাদা চুমু!",
    numberLabel: "১",
    burstKind: "kiss-one" as const,
  },
  two: {
    displayText:
      "কী গো, একটা চুমুতে মন ভরেছে? দাঁড়াও, আরও দিচ্ছি! মুয়াহ, মুয়াহ, মুয়াহ! আমার লক্ষ্মী বউটা, এবার একটু হাসো তো!",
    buttonLabel: "আরও চুমু চাই",
    buttonSub: "চাপো — আরেকগাদা চুমু, শুনতে ভালো লাগবে",
    message: "আমার লক্ষ্মী বুশরা, একটু হাসো তো! তোমার হাসিটাই আমার সব। ❤️",
    numberLabel: "২",
    burstKind: "kiss-two" as const,
  },
};

export default function App() {
  const burstRef = useRef<BurstHandle>(null);
  const audioOneRef = useRef<HTMLAudioElement>(null);
  const audioTwoRef = useRef<HTMLAudioElement>(null);
  const notesRef = useRef<{ one?: VoiceNote; two?: VoiceNote }>({});
  const [panelSignal, setPanelSignal] = useState(0);

  /* starting one voice note stops the other — never both at once */
  const handleStart = useCallback((id: VoiceId) => {
    const other = id === "one" ? notesRef.current.two : notesRef.current.one;
    other?.stop();
  }, []);

  const one = useVoiceNote("one", audioOneRef, handleStart);
  const two = useVoiceNote("two", audioTwoRef, handleStart);
  notesRef.current = { one, two };

  const readiness = { one: one.source, two: two.source };
  const handleAudioChanged = useCallback(() => {
    one.reprobe();
    two.reprobe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPanel = useCallback(() => setPanelSignal((n) => n + 1), []);

  const tapBurst = useCallback((x: number, y: number) => {
    burstRef.current?.burst("tap", x, y);
  }, []);

  /* a gentle puff of hearts for taps anywhere that isn't a control */
  const handleBackgroundTap = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement | null;
    if (t?.closest("button, a, input, label, select, textarea, [role='slider']")) return;
    burstRef.current?.burst("tap", e.clientX, e.clientY);
  }, []);

  const bothReady = !!one.source && !!two.source;

  return (
    <div
      className="relative min-h-[100svh] overflow-x-clip bg-cream font-bangla text-ink"
      onPointerDown={handleBackgroundTap}
    >
      {/* the two real recordings live here — playsinline keeps iPhone happy */}
      <audio ref={audioOneRef} preload="metadata" playsInline webkit-playsinline="true" className="hidden" aria-hidden="true" />
      <audio ref={audioTwoRef} preload="metadata" playsInline webkit-playsinline="true" className="hidden" aria-hidden="true" />

      <AmbientBackground />
      <BurstLayer ref={burstRef} />

      <Hero onTapHeart={tapBurst} />

      <Marquee />

      <main id="kisses" className="relative z-10 scroll-mt-6 bg-blush-50 pb-4 pt-12 sm:pt-16">
        {/* section heading */}
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-blush-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-rose-deep shadow-[var(--shadow-chip)]">
            <Mic size={13} />
            জিহাদের নিজের কণ্ঠে
          </span>
          <h2 className="mt-4 font-display text-[1.75rem] font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            দুইটা চুমু, <span className="shimmer">শুধু তোমার জন্য</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] font-medium leading-relaxed text-ink-soft sm:text-[14.5px]">
            যেকোনো বাটন চাপো — যতবার খুশি শুনতে পারবে। হয়ে গেলে আবার রিপ্লে বাটনে চেপো।
          </p>
        </div>

        {/* the two kiss cards */}
        <div className="mx-auto mt-7 grid max-w-6xl gap-5 px-4 sm:px-6 md:mt-9 md:grid-cols-2 md:gap-6 lg:gap-8">
          <div id="chumu-button-1" className="scroll-mt-8">
            <KissButton
              accent={ACCENTS.one}
              numberLabel={COPY.one.numberLabel}
              displayText={COPY.one.displayText}
              buttonLabel={COPY.one.buttonLabel}
              buttonSub={COPY.one.buttonSub}
              message={COPY.one.message}
              burstKind={COPY.one.burstKind}
              note={one}
              ready={!!one.source}
              onBurst={(kind, x, y) => burstRef.current?.burst(kind, x, y)}
              onConnectClick={openPanel}
            />
          </div>
          <div id="chumu-button-2" className="scroll-mt-8">
            <KissButton
              accent={ACCENTS.two}
              numberLabel={COPY.two.numberLabel}
              displayText={COPY.two.displayText}
              buttonLabel={COPY.two.buttonLabel}
              buttonSub={COPY.two.buttonSub}
              message={COPY.two.message}
              burstKind={COPY.two.burstKind}
              note={two}
              ready={!!two.source}
              onBurst={(kind, x, y) => burstRef.current?.burst(kind, x, y)}
              onConnectClick={openPanel}
            />
          </div>
        </div>

        {/* tiny strip: both connected? */}
        <p
          role="status"
          className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-white/70 px-4 py-1.5 text-[11px] font-semibold text-ink-soft backdrop-blur"
        >
          <Heart size={12} fill="#F2568B" strokeWidth={0} className="text-blush-500" />
          {bothReady
            ? "দুইটা রেকর্ডিংই সংযুক্ত — বাটন চাপো আর শুনো"
            : "রেকর্ডিংগুলো এখনো সাইটে ঢোকানো হয়নি — নিচের প্যানেলটি দেখো"}
        </p>

        <div className="mt-6 sm:mt-8">
          <AudioConnectPanel readiness={readiness} onChanged={handleAudioChanged} openSignal={panelSignal} />
        </div>
      </main>

      <LoveNote />

      <Footer />
    </div>
  );
}
