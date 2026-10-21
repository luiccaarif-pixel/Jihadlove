import { useCallback, useEffect, useRef, useState } from "react";
import {
  resolveVoiceSource,
  invalidateProbeCache,
  type VoiceId,
  type VoiceSource,
} from "../lib/audio";

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error";

export type ErrorKind = "missing" | "unsupported" | "unknown";

export interface VoiceNote {
  id: VoiceId;
  /** resolved source (repo file or this-device stored file), null while loading */
  source: VoiceSource | null;
  /** true once the initial detection finished */
  probed: boolean;
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  error: ErrorKind | null;
  /** play from the beginning if ended/idle, otherwise resume/pause toggle */
  toggle: () => void;
  replay: () => void;
  stop: () => void;
  seek: (t: number) => void;
  /** re-detect source after the audio files changed on disk / in storage */
  reprobe: () => void;
}

/**
 * Drives one <audio> element bound to a ref. Only ONE of the two voice notes
 * may ever sound at a time — starting one stops the other.
 */
export function useVoiceNote(
  id: VoiceId,
  audioRef: React.RefObject<HTMLAudioElement | null>,
  onStart?: (id: VoiceId) => void
): VoiceNote {
  const [source, setSource] = useState<VoiceSource | null>(null);
  const [probed, setProbed] = useState(false);
  const [probeTick, setProbeTick] = useState(0);
  const [status, setStatus] = useState<PlaybackStatus>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<ErrorKind | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  /* ---------- detection (repo file → device storage) ---------- */
  useEffect(() => {
    let cancelled = false;
    setProbed(false);
    resolveVoiceSource(id).then((src) => {
      if (cancelled) {
        if (src?.type === "device") URL.revokeObjectURL(src.url);
        return;
      }
      if (objectUrlRef.current && objectUrlRef.current !== src?.url) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
      objectUrlRef.current = src?.type === "device" ? src.url : null;
      setSource(src);
      setProbed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [id, probeTick]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    []
  );

  /* ---------- element event wiring ---------- */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    const onPlay = () => setStatus("playing");
    const onPause = () => {
      // 'pause' also fires right before 'ended' — if we're at the end, stay ended
      setStatus((s) => (s === "playing" || s === "loading" ? "paused" : s));
    };
    const onEnded = () => setStatus("ended");
    const onTime = () => setCurrentTime(el.currentTime || 0);
    const onMeta = () => setDuration(Number.isFinite(el.duration) ? el.duration : 0);
    const onWaiting = () => setStatus((s) => (s === "playing" ? "playing" : s));
    const onError = () => {
      setStatus("error");
      setError((prev) => prev ?? "unknown");
    };

    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("waiting", onWaiting);
    el.addEventListener("error", onError);

    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("waiting", onWaiting);
      el.removeEventListener("error", onError);
    };
  }, [audioRef]);

  /* ---------- (re)load the element when the source changes ---------- */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (source) {
      setStatus("idle");
      setError(null);
      setCurrentTime(0);
      el.src = source.url;
      el.load();
    } else if (probed) {
      setStatus("idle");
      setError("missing");
      el.removeAttribute("src");
      el.load();
    }
  }, [source, probed, audioRef]);

  /* ---------- actions ---------- */
  const playInternal = useCallback(async () => {
    const el = audioRef.current;
    if (!el || !source) {
      setStatus("error");
      setError("missing");
      return;
    }
    if (el.ended || el.currentTime >= (el.duration || Infinity)) {
      el.currentTime = 0;
    }
    setStatus("loading");
    setError(null);
    try {
      await el.play(); // must stay inside the click gesture — mobile-safe
      onStartRef.current?.(id);
    } catch (err) {
      const name = (err as DOMException)?.name;
      setStatus("error");
      setError(name === "NotSupportedError" ? "unsupported" : "unknown");
    }
  }, [audioRef, source, id]);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (status === "playing" || status === "loading") {
      el.pause();
      setStatus("paused");
      return;
    }
    void playInternal();
  }, [audioRef, status, playInternal]);

  const replay = useCallback(() => {
    const el = audioRef.current;
    if (!el || !source) {
      setStatus("error");
      setError("missing");
      return;
    }
    el.currentTime = 0;
    void playInternal();
  }, [audioRef, source, playInternal]);

  const stop = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setCurrentTime(0);
    setStatus((s) => (s === "error" ? s : "idle"));
  }, [audioRef]);

  const seek = useCallback(
    (t: number) => {
      const el = audioRef.current;
      if (!el || !source || !Number.isFinite(t)) return;
      el.currentTime = t;
      setCurrentTime(t);
    },
    [audioRef, source]
  );

  const reprobe = useCallback(() => {
    invalidateProbeCache();
    setProbeTick((n) => n + 1);
  }, []);

  return {
    id,
    source,
    probed,
    status,
    currentTime,
    duration,
    error,
    toggle,
    replay,
    stop,
    seek,
    reprobe,
  };
}
