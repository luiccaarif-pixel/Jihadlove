import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-2 overflow-hidden border-t border-blush-200 bg-gradient-to-b from-blush-50 to-blush-100">
      {/* scalloped top */}
      <svg aria-hidden viewBox="0 0 1440 26" preserveAspectRatio="none" className="block h-5 w-full sm:h-6">
        <path
          d="M0,0 L1440,0 L1440,8 C1400,26 1360,2 1320,12 C1280,22 1240,4 1200,12 C1160,20 1120,4 1080,12 C1040,20 1000,4 960,12 C920,20 880,4 840,12 C800,20 760,4 720,12 C680,20 640,4 600,12 C560,20 520,4 480,12 C440,20 400,4 360,12 C320,20 280,4 240,12 C200,20 160,4 120,12 C80,20 40,4 0,12 Z"
          fill="#FFF9F6"
        />
      </svg>
      <div className="mx-auto max-w-3xl px-6 pb-9 pt-2 text-center">
        <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-display text-[13.5px] font-bold text-rose-deep sm:text-[15px]">
          Made with all my love
          <Heart size={16} fill="#F2568B" strokeWidth={0} className="inline-block" aria-label="love" />
          Jihad Hossain
          <span className="text-blush-400">→</span>
          <span className="font-script text-lg leading-none text-blush-600 sm:text-xl">Bushra</span>
        </p>
        <p className="mt-2.5 text-[11px] font-medium leading-relaxed text-ink-soft">
          © {new Date().getFullYear()} Jihad Hossain · শুধু বুশরার জন্য বানিয়েছেন · ভালোবাসা ছাড়া কিছু নয়
        </p>
      </div>
    </footer>
  );
}
