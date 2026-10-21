import { motion } from "framer-motion";
import { ChevronDown, Heart, Sparkles } from "lucide-react";
import { Garland } from "./AmbientBackground";

interface HeroProps {
  onTapHeart: (x: number, y: number) => void;
}

export default function Hero({ onTapHeart }: HeroProps) {
  const scrollToButtons = () => {
    document.getElementById("chumu-button-1")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <header className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <Garland />

      {/* top bar — Jihad → Bushra signature */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 sm:px-8 sm:pt-5">
        <div className="flex items-center gap-2 rounded-full border border-blush-200 bg-white/75 py-1.5 pl-1.5 pr-4 shadow-[var(--shadow-chip)] backdrop-blur">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 font-display text-[13px] font-bold text-white">
            জে
          </span>
          <span className="font-display text-[11px] font-bold tracking-wide text-rose-deep sm:text-xs">
            JIHAD → BUSHRA
          </span>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-blush-200 bg-white/75 px-4 py-1.5 text-[11px] font-semibold text-ink-soft shadow-[var(--shadow-chip)] backdrop-blur sm:flex">
          <Sparkles size={13} className="text-amber-400" />
          শুধু তোমার জন্য
        </div>
      </div>

      {/* main hero content */}
      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 content-center items-center gap-6 px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:grid-cols-12 lg:gap-10 lg:pb-20">
        {/* text block */}
        <div className="order-2 text-center lg:order-1 lg:col-span-7 lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 120, damping: 15 }}
            className="font-script text-xl text-blush-500 sm:text-2xl lg:text-[1.75rem]"
          >
            Only For You
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, type: "spring", stiffness: 110, damping: 16 }}
            className="mt-2 font-display text-[2.15rem] font-extrabold leading-[1.18] tracking-tight text-ink sm:text-5xl sm:leading-[1.14] lg:text-[3.4rem]"
          >
            শুধু আমার
            <br />
            <button
              type="button"
              onClick={(e) => onTapHeart(e.clientX, e.clientY)}
              aria-label="বুশরা — আমার বুশরা"
              className="shimmer group relative -my-1 inline-block cursor-pointer px-2 py-1 text-[1.32em] leading-none transition-transform duration-300 hover:scale-[1.04] active:scale-95"
            >
              বুশরার
              <span
                aria-hidden
                className="pointer-events-none absolute -bottom-1 left-0 h-[0.16em] w-full rounded-full bg-[linear-gradient(90deg,transparent,#FB7BA4,#F2568B,#FB7BA4,transparent)] opacity-80"
              />
            </button>
            <br />
            জন্য
          </motion.h1>

          {/* heartbeat heart divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, type: "spring", stiffness: 260, damping: 12 }}
            className="mt-4 flex items-center justify-center gap-3 lg:justify-start"
          >
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-blush-300 sm:w-16" />
            <button
              type="button"
              onClick={(e) => onTapHeart(e.clientX, e.clientY)}
              aria-label="একটা চুমু পাঠাও"
              className="hero-heart cursor-pointer drop-shadow-[0_6px_14px_rgba(242,86,139,0.45)] transition-transform active:scale-90"
            >
              <Heart size={40} fill="#F2568B" strokeWidth={1.2} className="text-rose-deep sm:h-11 sm:w-11" />
            </button>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-blush-300 sm:w-16" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 110, damping: 17 }}
            className="mx-auto mt-4 max-w-md text-[14.5px] font-medium leading-[1.9] text-ink-soft sm:text-[16.5px] lg:mx-0"
          >
            আমার পিচ্চি বউটার জন্য একটু আদর,
            <br />
            শুধু জিহাদের পক্ষ থেকে।
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, type: "spring", stiffness: 110, damping: 17 }}
            type="button"
            onClick={scrollToButtons}
            className="group mx-auto mt-6 inline-flex min-h-[54px] items-center gap-2 rounded-full bg-ink px-7 py-3 font-display text-[15px] font-bold text-blush-50 shadow-[var(--shadow-lift)] transition-transform duration-200 hover:-translate-y-0.5 active:scale-95 lg:mx-0"
          >
            নিচের চুমুগুলো নাও
            <ChevronDown size={19} className="transition-transform duration-300 group-hover:translate-y-0.5" />
          </motion.button>
        </div>

        {/* illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: 34 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 90, damping: 15 }}
          className="relative order-1 mx-auto w-[min(64vw,262px)] sm:w-[min(52vw,300px)] lg:order-2 lg:col-span-5 lg:w-full lg:max-w-[380px]"
        >
          {/* glow halo */}
          <div
            aria-hidden
            className="glow-breathe absolute left-1/2 top-1/2 -z-10 h-[112%] w-[116%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(255,182,206,0.85) 0%, rgba(255,228,236,0.35) 55%, transparent 75%)" }}
          />
          {/* orbiting sparkles around the artwork */}
          <Sparkles size={26} className="twinkle absolute -left-2 top-6 z-10 text-amber-400" style={{ "--delay": "-0.8s", "--dur": "2.6s" } as React.CSSProperties} fill="#FDE68A" aria-hidden />
          <Sparkles size={20} className="twinkle absolute right-1 top-16 z-10 text-blush-400" style={{ "--delay": "-1.6s", "--dur": "3.1s" } as React.CSSProperties} fill="#FFCADA" aria-hidden />
          <Sparkles size={22} className="twinkle absolute -right-2 bottom-24 z-10 text-amber-300" style={{ "--delay": "-0.4s", "--dur": "2.9s" } as React.CSSProperties} fill="#FEF3C7" aria-hidden />

          <div className="relative rotate-[1.6deg] rounded-[2rem] border-[6px] border-white bg-white p-2 shadow-[0_30px_70px_-25px_rgba(190,24,93,0.5),0_10px_25px_-10px_rgba(190,24,93,0.3)] sm:p-2.5">
            <img
              src="/images/bushra-hero.jpg"
              alt="চাঁদের ওপর বসে থাকা জিহাদ আর বুশরা — প্যাস্টেল জলরং ছবি"
              width={733}
              height={1100}
              className="aspect-[4/5] w-full rounded-[1.55rem] object-cover"
              loading="eager"
              draggable={false}
            />
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/85 px-4 py-1 font-script text-[13px] text-rose-deep shadow backdrop-blur sm:text-sm">
              জিহাদ &amp; বুশরা
            </div>
          </div>

          {/* taped corners */}
          <div aria-hidden className="absolute -left-3 top-8 h-6 w-16 rotate-[-38deg] rounded-sm bg-amber-100/90 shadow-sm ring-1 ring-amber-200/60" />
          <div aria-hidden className="absolute -right-3 top-8 h-6 w-16 rotate-[38deg] rounded-sm bg-amber-100/90 shadow-sm ring-1 ring-amber-200/60" />
        </motion.div>
      </div>

      {/* soft scalloped bottom edge */}
      <svg
        aria-hidden
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="pointer-events-none absolute bottom-[-1px] left-0 z-10 h-8 w-full sm:h-12"
      >
        <path
          d="M0,32 C90,58 180,6 270,26 C360,46 450,10 540,28 C630,46 720,12 810,28 C900,44 990,8 1080,26 C1170,44 1260,14 1350,28 C1395,35 1420,26 1440,30 L1440,60 L0,60 Z"
          fill="#FFF1F5"
        />
      </svg>
    </header>
  );
}
