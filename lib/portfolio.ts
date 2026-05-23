// localStorage-backed portfolio of past Mad Men campaigns. Survives refresh,
// gives us a newest-first feed on landing and a dedicated /portfolio page.
//
// Storage shape: a single key holding a Record<id, PortfolioEntry>. We sort on
// read by updatedAt desc. Images are stored as base64 data URLs so they
// rehydrate without re-hitting Qwen. Cap at MAX_ENTRIES, FIFO evict the
// oldest by updatedAt.

const STORAGE_KEY = "madmen.portfolio.v1";
const MAX_ENTRIES = 12; // ~12 entries * ~1.5MB each = ~18MB, brushing browser limits

export type PortfolioEntry = {
  id: string; // CrewAI kickoff_id
  client: string; // brand name shown to user
  prompt: string; // current Qwen-Image-Edit prompt (may be edited)
  promptOriginal: string; // original crew output
  imageDataUrl: string | null; // base64 PNG data URL, or null until rendered
  createdAt: number;
  updatedAt: number;
};

type Store = Record<string, PortfolioEntry>;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readStore(): Store {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

function writeStore(store: Store): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    // Notify same-tab listeners (storage event only fires cross-tab)
    window.dispatchEvent(new CustomEvent("madmen-portfolio-change"));
  } catch (err) {
    // If quota exceeded, evict half the entries and retry once.
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      const trimmed = evictOldest(store, Math.ceil(Object.keys(store).length / 2));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        window.dispatchEvent(new CustomEvent("madmen-portfolio-change"));
      } catch {
        // swallow — next save will overwrite
      }
    }
  }
}

function evictOldest(store: Store, count: number): Store {
  const entries = Object.values(store).sort((a, b) => a.updatedAt - b.updatedAt);
  const toRemove = entries.slice(0, count).map((e) => e.id);
  const next = { ...store };
  for (const id of toRemove) delete next[id];
  return next;
}

export function loadPortfolioEntry(id: string): PortfolioEntry | null {
  const store = readStore();
  return store[id] ?? null;
}

export function listPortfolioEntries(): PortfolioEntry[] {
  const store = readStore();
  return Object.values(store).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function savePortfolioEntry(
  partial: Partial<PortfolioEntry> & Pick<PortfolioEntry, "id" | "client">,
): PortfolioEntry {
  const store = readStore();
  const now = Date.now();
  const existing = store[partial.id];
  const merged: PortfolioEntry = {
    id: partial.id,
    client: partial.client,
    prompt: partial.prompt ?? existing?.prompt ?? "",
    promptOriginal: partial.promptOriginal ?? existing?.promptOriginal ?? partial.prompt ?? "",
    imageDataUrl: partial.imageDataUrl ?? existing?.imageDataUrl ?? null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  let next = { ...store, [merged.id]: merged };
  const ids = Object.keys(next);
  if (ids.length > MAX_ENTRIES) {
    next = evictOldest(next, ids.length - MAX_ENTRIES);
  }
  writeStore(next);
  return merged;
}

export function deletePortfolioEntry(id: string): void {
  const store = readStore();
  if (!(id in store)) return;
  const next = { ...store };
  delete next[id];
  writeStore(next);
}

// Helper for the image render path: convert a Blob to a base64 data URL.
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

// Subscribe to portfolio changes (same-tab via CustomEvent, cross-tab via
// `storage` event). Returns an unsubscribe function.
export function subscribePortfolio(listener: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => listener();
  const storageHandler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) listener();
  };
  window.addEventListener("madmen-portfolio-change", handler);
  window.addEventListener("storage", storageHandler);
  return () => {
    window.removeEventListener("madmen-portfolio-change", handler);
    window.removeEventListener("storage", storageHandler);
  };
}
