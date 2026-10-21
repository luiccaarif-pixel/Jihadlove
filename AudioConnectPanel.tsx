import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  CloudUpload,
  Eraser,
  FileMusic,
  FolderOpen,
  HardDrive,
  Info,
  Link2,
  Loader2,
  MicVocal,
  Upload,
} from "lucide-react";
import {
  fileToStoredVoice,
  formatBytes,
  idbDelete,
  idbGet,
  idbSet,
  isAudioFileLike,
  probeRepoFile,
  type VoiceId,
  type VoiceSource,
} from "../lib/audio";

export type VoiceReadiness = Record<VoiceId, VoiceSource | null>;

interface AudioConnectPanelProps {
  readiness: VoiceReadiness;
  onChanged: () => void;
  openSignal: number;
}

const META: Record<VoiceId, { title: string; hint: string }> = {
  one: { title: "Chumu One", hint: "বাটন ১ — “চুমু চাই” বাজাবে" },
  two: { title: "Chumu Two", hint: "বাটন ২ — “আরও চুমু চাই” বাজাবে" },
};

async function pickAudioFile(
  id: VoiceId,
  file: File
): Promise<{ ok: boolean; message: string }> {
  if (!isAudioFileLike(file)) {
    return { ok: false, message: "এটা অডিও ফাইল বলে মনে হচ্ছে না — mp3 / m4a / wav বেছে নাও।" };
  }
  const stored = await fileToStoredVoice(id, file);
  const saved = await idbSet(id, stored);
  if (!saved) {
    return { ok: false, message: "ব্রাউজারে সেভ করতে পারলাম না (স্টোরেজ বন্ধ থাকলে এমন হয়)। সাইটের uploads ফোল্ডারে ফাইলটা রেখে দাও — সেটাই সবচেয়ে নিরাপদ।" };
  }
  return { ok: true, message: `"${file.name}" সেভ হয়ে গেছে — এখন বাটনটা চাপলেই শুনতে পাবে।` };
}

export default function AudioConnectPanel({ readiness, onChanged, openSignal }: AudioConnectPanelProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<VoiceId | null>(null);
  const [feedback, setFeedback] = useState<Partial<Record<VoiceId, { ok: boolean; text: string }>>>({});
  const [storedInfo, setStoredInfo] = useState<Partial<Record<VoiceId, { fileName: string; size: number; savedAt: number }>>>({});
  const [copied, setCopied] = useState(false);
  const inputOne = useRef<HTMLInputElement>(null);
  const inputTwo = useRef<HTMLInputElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const allReady = !!readiness.one && !!readiness.two;

  /* open + scroll when someone taps "how to connect" */
  useEffect(() => {
    if (openSignal === 0) return;
    setOpen(true);
    const t = window.setTimeout(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(t);
  }, [openSignal]);

  /* read stored-file metadata for the cards */
  const refreshStored = useCallback(async () => {
    const next: typeof storedInfo = {};
    for (const id of ["one", "two"] as VoiceId[]) {
      const s = await idbGet(id);
      if (s) next[id] = { fileName: s.fileName, size: s.size, savedAt: s.savedAt };
    }
    setStoredInfo(next);
  }, []);

  useEffect(() => {
    void refreshStored();
  }, [readiness, refreshStored]);

  const handleFile = async (id: VoiceId, file: File | undefined) => {
    if (!file) return;
    setBusy(id);
    setFeedback((f) => ({ ...f, [id]: undefined }));
    const result = await pickAudioFile(id, file);
    setFeedback((f) => ({ ...f, [id]: { ok: result.ok, text: result.message } }));
    setBusy(null);
    if (result.ok) {
      onChanged();
      void refreshStored();
    }
  };

  const handleRemoveDevice = async (id: VoiceId) => {
    setBusy(id);
    await idbDelete(id);
    setFeedback((f) => ({ ...f, [id]: { ok: true, text: "এই ব্রাউজার থেকে ফাইলটা সরিয়ে দিলাম।" } }));
    setBusy(null);
    onChanged();
    void refreshStored();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText("public/uploads/");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const cardFor = (id: VoiceId) => {
    const src = readiness[id];
    const stored = storedInfo[id];
    const repo = src?.type === "repo";
    const device = src?.type === "device";
    const inputRef = id === "one" ? inputOne : inputTwo;
    const fb = feedback[id];
    const isBusy = busy === id;

    return (
      <div
        key={id}
        className={`rounded-3xl border-2 p-4 transition-colors duration-300 sm:p-5 ${
          src ? "border-emerald-200 bg-emerald-50/70" : "border-dashed border-blush-300 bg-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              src ? "bg-emerald-100 text-emerald-600" : "bg-blush-100 text-blush-500"
            }`}
          >
            {src ? <Check size={22} strokeWidth={3} /> : <FileMusic size={22} />}
          </div>
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-ink">{META[id].title}</p>
            <p className="text-[11px] leading-snug text-ink-soft">{META[id].hint}</p>
          </div>
          <span
            className={`ml-auto shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide ${
              src ? "bg-emerald-500 text-white" : "bg-amber-400 text-amber-950"
            }`}
          >
            {src ? "সংযুক্ত" : "বাকি"}
          </span>
        </div>

        <div className="mt-3 rounded-2xl bg-white/80 px-3.5 py-2.5 text-[11.5px] leading-relaxed text-ink-soft">
          {repo && (
            <>
              <span className="font-semibold text-emerald-700">সাইটের ভেতরে আছে: </span>
              <code className="break-all text-emerald-800">{src?.fileName}</code> — সবার কাছেই কাজ করবে।
            </>
          )}
          {device && !repo && (
            <>
              <span className="font-semibold text-emerald-700">এই ব্রাউজারে সেভ করা: </span>
              <code className="break-all text-emerald-800">{stored?.fileName ?? src?.fileName}</code>
              {stored ? ` (${formatBytes(stored.size)})` : ""} — শুধু এই ফোন/ল্যাপটপে শুনতে পাবে। সবাইকে দেখাতে চাইলে নিচের ২ নম্বর ধাপটা করো।
            </>
          )}
          {!src && (
            <>
              <span className="font-semibold text-amber-800">এখনো কিছু নেই।</span> নিচের ধাপগুলো অনুসরণ করো — দুই মিনিটেই হয়ে যাবে।
            </>
          )}
        </div>

        {fb && (
          <p
            role="status"
            className={`mt-2 rounded-xl px-3 py-2 text-[11.5px] leading-snug ${
              fb.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-50 text-red-700"
            }`}
          >
            {fb.text}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isBusy}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-2xl bg-ink px-4 py-2 text-[12.5px] font-semibold text-blush-50 shadow-sm transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          >
            {isBusy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            এই ব্রাউজারে বেছে নাও
          </button>
          {device && (
            <button
              type="button"
              onClick={() => void handleRemoveDevice(id)}
              disabled={isBusy}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-2xl border border-blush-200 bg-white px-4 py-2 text-[12.5px] font-semibold text-ink-soft transition-transform duration-150 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
            >
              <Eraser size={16} />
              ব্রাউজার থেকে সরাও
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,.mp3,.m4a,.wav,.ogg,.aac,.mp4"
            className="hidden"
            onChange={(e) => {
              void handleFile(id, e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <section
      ref={sectionRef}
      id="voice-connect"
      aria-labelledby="voice-connect-title"
      className="relative z-10 mx-auto w-full max-w-3xl scroll-mt-6 px-4 sm:px-6"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="voice-connect-body"
        id="voice-connect-title"
        className="group flex w-full items-center gap-3 rounded-3xl border border-blush-200 bg-white/85 px-4 py-3.5 text-left shadow-[var(--shadow-chip)] backdrop-blur transition-colors hover:border-blush-300 sm:gap-4 sm:px-6"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blush-400 to-blush-600 text-white">
          <MicVocal size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[15px] font-bold text-ink sm:text-base">
            ভয়েস সংযোগ — জিহাদের রেকর্ডিং এখানে ঢোকাও
          </span>
          <span className="block text-[11px] leading-snug text-ink-soft">
            {allReady
              ? "দুইটা রেকর্ডিংই সংযুক্ত আছে — বাটন চাপুন আর শুনুন ❤️"
              : "দুইটা ফাইল এখনো সাইটে ঢোকানো হয়নি — নিচের ধাপগুলো দেখে নাও"}
          </span>
        </span>
        <span
          className={`mr-1 hidden h-3 w-3 shrink-0 rounded-full sm:block ${
            readiness.one ? "bg-emerald-400" : "bg-amber-400"
          }`}
          aria-hidden
        />
        <span
          className={`hidden h-3 w-3 shrink-0 rounded-full sm:block ${
            readiness.two ? "bg-emerald-400" : "bg-amber-400"
          }`}
          aria-hidden
        />
        <ChevronDown
          size={22}
          className={`shrink-0 text-ink-soft transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          id="voice-connect-body"
          className="mt-3 overflow-hidden rounded-3xl border border-blush-200 bg-blush-50/90 p-4 shadow-[var(--shadow-soft)] backdrop-blur sm:p-6"
        >
          <div className="mb-4 flex items-start gap-2.5 rounded-2xl border border-blush-200 bg-white px-4 py-3 text-[12.5px] leading-relaxed text-ink">
            <Info size={17} className="mt-0.5 shrink-0 text-blush-500" />
            <p>
              <strong>সত্যি কথা:</strong> জিহাদের কণ্ঠের রেকর্ডিং ছাড়া এই সাইট খালি — এখানে কোনো
              জেনারেট করা বা কৃত্রিম কণ্ঠ ব্যবহার করা হয় না। নিচের যে কোনো একটা পথ বেছে নাও:
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {/* Step 1 — quick: this browser only */}
            <div className="md:col-span-2">
              <div className="flex h-full flex-col rounded-3xl border border-blush-200 bg-white p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blush-500 font-display text-[13px] font-extrabold text-white">১</span>
                  <p className="font-display text-[14px] font-bold text-ink">এই ডিভাইসে, এক চাপুন</p>
                </div>
                <p className="mt-2 flex-1 text-[12px] leading-relaxed text-ink-soft">
                  স্টুডিওতে যে রেকর্ডিং দুটো আছে, সেগুলো সরাসরি এখানে বেছে নিলেই এই ব্রাউজারেই সেভ হয়ে
                  যাবে — ভালো করে শুনে টেস্ট করার জন্য পারফেক্ট। মনে রাখো: এটা শুধু এই ফোন/ল্যাপটপের এই
                  ব্রাউজারেই কাজ করবে, অন্য কারও কাছে নয়।
                </p>
                <div className="mt-3 grid gap-3">{(["one", "two"] as VoiceId[]).map(cardFor)}</div>
              </div>
            </div>

            {/* Step 2 — permanent: inside the repo */}
            <div className="md:col-span-3">
              <div className="flex h-full flex-col rounded-3xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 font-display text-[13px] font-extrabold text-white">২</span>
                  <div>
                    <p className="font-display text-[14px] font-bold text-emerald-900">স্থায়ীভাবে সাইটের ভেতরে (সবচেয়ে ভালো উপায়)</p>
                  </div>
                </div>
                <ol className="mt-3 flex-1 space-y-2.5 text-[12px] leading-relaxed text-emerald-950">
                  {[
                    <>প্রজেক্টের <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-emerald-800">public/uploads/</code> ফোল্ডারটা খোলো।</>,
                    <>জিহাদের রেকর্ডিং দুটো সেখানে রাখো — ঠিক এই নামে:</>,
                    <>Deploy করো (Vercel হলে <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[10.5px] text-emerald-800">git push</code> করলেই হবে)।</>,
                    <>ব্যস — এখন থেকে সবার কাছেই বাটন চাপলে জিহাদের আসল কণ্ঠ শুনতে পাবে।</>,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 font-display text-[10px] font-bold text-emerald-800">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 rounded-2xl border border-emerald-200 bg-white p-3 font-mono text-[10.5px] leading-relaxed text-emerald-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      <HardDrive size={12} /> public/uploads/
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800 transition-colors hover:bg-emerald-200"
                    >
                      {copied ? <Check size={11} /> : <Link2 size={11} />}
                      {copied ? "কপি হয়েছে" : "পাথ কপি"}
                    </button>
                  </div>
                  <pre className="mt-1.5 overflow-x-auto whitespace-pre">{`chumu-one.mp3   ← “চুমু চাই” বাটন
chumu-two.mp3   ← “আরও চুমু চাই” বাটন`}</pre>
                </div>
                <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-emerald-800">
                  <FolderOpen size={12} className="shrink-0" />
                  <span>.m4a / .wav / .ogg / .aac-ও চলবে — শুধু নাম chumu-one আর chumu-two রাখো। ফোল্ডারে <code className="font-mono">README.txt</code>-এও লেখা আছে।</span>
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              const repo1 = await probeRepoFile("one");
              const repo2 = await probeRepoFile("two");
              setFeedback({
                one: repo1
                  ? { ok: true, text: `পাওয়া গেছে: ${repo1.fileName}` }
                  : { ok: false, text: "public/uploads/chumu-one.* এখনো নেই।" },
                two: repo2
                  ? { ok: true, text: `পাওয়া গেছে: ${repo2.fileName}` }
                  : { ok: false, text: "public/uploads/chumu-two.* এখনো নেই।" },
              });
            }}
            className="mt-4 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border border-blush-300 bg-white px-4 py-2 text-[12px] font-bold text-rose-deep transition-transform hover:-translate-y-0.5 active:scale-95"
          >
            <CloudUpload size={16} />
            সার্ভারে ফাইলগুলো আবার খোঁজো
          </button>
        </div>
      )}
    </section>
  );
}
