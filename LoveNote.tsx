import { Heart, Quote } from "lucide-react";

export default function LoveNote() {
  return (
    <section aria-label="জিহাদের ছোট্ট বার্তা" className="relative z-10 mx-auto w-full max-w-3xl px-4 py-12 sm:px-6 sm:py-14">
      <div className="relative overflow-hidden rounded-[2.2rem] border border-blush-200 bg-gradient-to-br from-white via-blush-50 to-[#FFF3EC] px-6 py-8 text-center shadow-[var(--shadow-soft)] sm:px-12 sm:py-10">
        {/* faint oversized script backdrop */}
        <span
          aria-hidden
          className="pointer-events-none absolute -left-3 top-2 select-none font-script text-[5.5rem] leading-none text-blush-100 sm:text-[7.5rem]"
        >
          বুশরা
        </span>
        <Quote size={30} className="relative mx-auto text-blush-400" fill="#FFCADA" strokeWidth={1.8} aria-hidden />
        <p className="relative mx-auto mt-4 max-w-xl text-[15.5px] font-medium leading-[2.05] text-ink sm:text-[17px]">
          বুশরা, এই ছোট্ট ওয়েবসাইটটা{" "}
          <span className="relative inline-block">
            <span className="relative z-10 px-0.5 font-semibold text-rose-deep">শুধু তোমার</span>
            <span aria-hidden className="absolute inset-x-0 bottom-0.5 z-0 h-[0.42em] rounded-sm bg-blush-200/80" />
          </span>{" "}
          জন্য বানিয়েছে তোমার জিহাদ। তুমি আমার কাছে{" "}
          <span className="whitespace-nowrap font-semibold text-rose-deep">অনেক স্পেশাল</span>।
          <Heart size={17} className="ml-1.5 inline-block align-[-2px]" fill="#F2568B" strokeWidth={0} aria-hidden />
        </p>
        <div className="relative mt-6 flex items-center justify-center gap-2">
          <span className="h-px w-12 bg-blush-300" />
          <span className="font-script text-lg text-blush-500">তোমার জিহাদ</span>
          <span className="h-px w-12 bg-blush-300" />
        </div>
      </div>
    </section>
  );
}
