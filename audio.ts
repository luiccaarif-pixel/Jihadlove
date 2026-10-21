/* ------------------------------------------------------------------
 *  Only For You — বুশরার জন্য
 *  Voice-note layer for Jihad Hossain's two prerecorded recordings.
 *
 *  A recording can live in TWO places:
 *    1. Inside the deployed site itself, at   public/uploads/chumu-one.mp3
 *       and                                   public/uploads/chumu-two.mp3
 *       (committed to the repo — works for everyone, forever).
 *    2. Or only on this device, stored in the browser's IndexedDB —
 *       this is the "pick files right in the browser" escape hatch.
 *
 *  Auto-detection order: repo file (HTTP 200 + audio/*) → IndexedDB → missing.
 * ------------------------------------------------------------------ */

export type VoiceId = "one" | "two";

export const VOICE_DEFS: Record<
  VoiceId,
  { file: string; label: string; mimeHints: string[] }
> = {
  one: {
    file: "/uploads/chumu-one",
    label: "Chumu One — “চুমু চাই”",
    mimeHints: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg", "audio/aac", "audio/x-wav"],
  },
  two: {
    file: "/uploads/chumu-two",
    label: "Chumu Two — “আরও চুমু চাই”",
    mimeHints: ["audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/wav", "audio/ogg", "audio/aac", "audio/x-wav"],
  },
};

export const CANDIDATE_EXTENSIONS = ["mp3", "m4a", "wav", "ogg", "aac", "mp4"];

export type SourceType = "repo" | "device";

export interface VoiceSource {
  type: SourceType;
  /** playable URL or object-URL */
  url: string;
  /** display filename, e.g. "chumu-one.mp3" */
  fileName: string;
}

/* ------------------------------------------------------------------ */
/* Tiny promise-wrapped IndexedDB helper (no dependencies)             */
/* ------------------------------------------------------------------ */

const DB_NAME = "only-for-you-bushra";
const DB_VERSION = 1;
const STORE = "voices";

export interface StoredVoice {
  id: VoiceId;
  blob: Blob;
  fileName: string;
  mime: string;
  size: number;
  savedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

export async function idbGet(id: VoiceId): Promise<StoredVoice | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve((req.result as StoredVoice) ?? null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function idbSet(id: VoiceId, entry: StoredVoice): Promise<boolean> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(entry);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

export async function idbDelete(id: VoiceId): Promise<boolean> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Detection of the recordings inside the repo (public/uploads/)        */
/* ------------------------------------------------------------------ */

const probeCache: Partial<Record<VoiceId, VoiceSource | null>> = {};

export async function probeRepoFile(id: VoiceId): Promise<VoiceSource | null> {
  if (id in probeCache) return probeCache[id] ?? null;
  const base = VOICE_DEFS[id].file;
  for (const ext of CANDIDATE_EXTENSIONS) {
    const url = `${base}.${ext}`;
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (!res.ok) continue;
      const type = (res.headers.get("content-type") || "").toLowerCase();
      // Vite's SPA fallback returns text/html with 200 for missing files —
      // accept only things that really look like audio.
      if (type.includes("text/html")) continue;
      if (type && !type.includes("audio") && !type.includes("octet-stream") && !type.includes("mpeg") && !type.includes("mp4") && !type.includes("ogg")) {
        continue;
      }
      const hit: VoiceSource = { type: "repo", url, fileName: `chumu-${id}.${ext}` };
      probeCache[id] = hit;
      return hit;
    } catch {
      /* network hiccup — try next extension */
    }
  }
  probeCache[id] = null;
  return null;
}

export async function resolveVoiceSource(id: VoiceId): Promise<VoiceSource | null> {
  const repo = await probeRepoFile(id);
  if (repo) return repo;
  const stored = await idbGet(id);
  if (stored) {
    return {
      type: "device",
      url: URL.createObjectURL(stored.blob),
      fileName: stored.fileName,
    };
  }
  return null;
}

export function invalidateProbeCache() {
  delete probeCache.one;
  delete probeCache.two;
}

/* ------------------------------------------------------------------ */
/* File → StoredVoice                                                   */
/* ------------------------------------------------------------------ */

const ALLOWED_EXT = ["mp3", "m4a", "wav", "ogg", "aac", "mp4", "weba"];

export function isAudioFileLike(file: File): boolean {
  if (file.type.startsWith("audio/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXT.includes(ext);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export async function fileToStoredVoice(id: VoiceId, file: File): Promise<StoredVoice> {
  return {
    id,
    blob: file,
    fileName: file.name,
    mime: file.type || "audio/mpeg",
    size: file.size,
    savedAt: Date.now(),
  };
}
