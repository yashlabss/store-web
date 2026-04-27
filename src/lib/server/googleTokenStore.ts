import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

type GoogleTokenRecord = {
  coachId: string;
  accessToken: string;
  refreshToken: string;
  expiryDate?: number | null;
  email?: string | null;
  connected: boolean;
  updatedAt: string;
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "google-tokens.json");

let hydrated = false;
const tokenStore = new Map<string, GoogleTokenRecord>();

function hydrateIfNeeded() {
  if (hydrated) return;
  hydrated = true;
  try {
    if (!existsSync(STORE_FILE)) return;
    const raw = readFileSync(STORE_FILE, "utf8");
    const arr = JSON.parse(raw) as GoogleTokenRecord[];
    if (!Array.isArray(arr)) return;
    for (const rec of arr) {
      if (!rec || typeof rec.coachId !== "string") continue;
      tokenStore.set(rec.coachId, rec);
    }
  } catch {
    // Ignore malformed cache; runtime reconnection can repopulate it.
  }
}

function persistStore() {
  try {
    if (!existsSync(STORE_DIR)) mkdirSync(STORE_DIR, { recursive: true });
    const payload = JSON.stringify(Array.from(tokenStore.values()), null, 2);
    writeFileSync(STORE_FILE, payload, "utf8");
  } catch {
    // Best-effort cache only.
  }
}

export function upsertGoogleTokens(
  coachId: string,
  next: {
    accessToken?: string | null;
    refreshToken?: string | null;
    expiryDate?: number | null;
    email?: string | null;
  }
): GoogleTokenRecord {
  hydrateIfNeeded();
  const prev = tokenStore.get(coachId);
  const record: GoogleTokenRecord = {
    coachId,
    accessToken: next.accessToken || prev?.accessToken || "",
    refreshToken: next.refreshToken || prev?.refreshToken || "",
    expiryDate: typeof next.expiryDate === "number" ? next.expiryDate : (prev?.expiryDate ?? null),
    email: next.email ?? prev?.email ?? null,
    connected: true,
    updatedAt: new Date().toISOString(),
  };
  tokenStore.set(coachId, record);
  persistStore();
  return record;
}

export function getGoogleTokens(coachId: string): GoogleTokenRecord | null {
  hydrateIfNeeded();
  return tokenStore.get(coachId) || null;
}

export function getGoogleConnectionStatus(coachId: string): {
  connected: boolean;
  email?: string | null;
  expiryDate?: number | null;
  updatedAt?: string;
} {
  hydrateIfNeeded();
  const rec = tokenStore.get(coachId);
  if (!rec || !rec.connected) return { connected: false };
  return {
    connected: true,
    email: rec.email ?? null,
    expiryDate: rec.expiryDate ?? null,
    updatedAt: rec.updatedAt,
  };
}
