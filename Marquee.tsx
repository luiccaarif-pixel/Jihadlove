const ITEMS = [
  "শুধু তুমি, বুশরা",
  "ভালোবাসি তোমাকে",
  "জিহাদের পিচ্চি বউ",
  "লক্ষ্মী বুশরা",
  "তোমার হাসিই আমার সব",
  "মুয়াহ — উম্মাহ",
  "বুশরা = বুশরার জন্য",
];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5 font-display text-[13px] font-bold tracking-wide sm:text-sm">
            {item}
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF" opacity="0.9" aria-hidden>
            <path d="M12 0l2.35 9.65L24 12l-9.65 2.35L12 24l-2.35-9.65L0 12l9.65-2.35L12 0z" />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div
      aria-hidden
      className="relative z-10 -rotate-[1.1deg] overflow-hidden border-y-2 border-rose-deep/10 bg-gradient-to-r from-blush-500 via-blush-400 to-blush-500 py-2 text-white shadow-[var(--shadow-chip)]"
    >
      <div className="marquee-track flex">
        <Row />
        <Row />
      </div>
    </div>
  );
}
