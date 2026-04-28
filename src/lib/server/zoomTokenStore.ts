import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type ZoomTokenRecord = {
  coachId: string;
  accessToken: string;
  refreshToken: string;
  expiryDate?: number | null;
  accountId?: string | null;
  email?: string | null;
  connected: boolean;
  updatedAt: string;
};

const STORE_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(STORE_DIR, "zoom-tokens.json");

let hydrated = false;
const tokenStore = new Map<string, ZoomTokenRecord>();

function hydrateIfNeeded() {
  if (hydrated) return;
  hydrated = true;
  try {
    if (!existsSync(STORE_FILE)) return;
    const raw = readFileSync(STORE_FILE, "utf8");
    const arr = JSON.parse(raw) as ZoomTokenRecord[];
    if (!Array.isArray(arr)) return;
    for (const rec of arr) {
      if (!rec || typeof rec.coachId !== "string") continue;
      tokenStore.set(rec.coachId, rec);
    }
  } catch {
    // Ignore malformed cache; reconnect can repopulate it.
  }
}

function persistStore() {
  try {
    if (!existsSync(STORE_DIR)) mkdirSync(STORE_DIR, { recursive: true });
    writeFileSync(STORE_FILE, JSON.stringify(Array.from(tokenStore.values()), null, 2), "utf8");
  } catch {
    // Best-effort cache only.
  }
}

export function upsertZoomTokens(
  coachId: string,
  next: {
    accessToken?: string | null;
    refreshToken?: string | null;
    expiryDate?: number | null;
    accountId?: string | null;
    email?: string | null;
  }
): ZoomTokenRecord {
  hydrateIfNeeded();
  const prev = tokenStore.get(coachId);
  const record: ZoomTokenRecord = {
    coachId,
    accessToken: next.accessToken || prev?.accessToken || "",
    refreshToken: next.refreshToken || prev?.refreshToken || "",
    expiryDate: typeof next.expiryDate === "number" ? next.expiryDate : (prev?.expiryDate ?? null),
    accountId: next.accountId ?? prev?.accountId ?? null,
    email: next.email ?? prev?.email ?? null,
    connected: true,
    updatedAt: new Date().toISOString(),
  };
  tokenStore.set(coachId, record);
  persistStore();
  return record;
}

export function getZoomTokens(coachId: string): ZoomTokenRecord | null {
  hydrateIfNeeded();
  return tokenStore.get(coachId) || null;
}

export function hasValidZoomCredentialTokens(
  rec: ZoomTokenRecord | null | undefined
): rec is ZoomTokenRecord & { accessToken: string; refreshToken: string } {
  if (!rec?.connected) return false;
  return Boolean(rec.accessToken?.trim()) && Boolean(rec.refreshToken?.trim());
}

export function getZoomConnectionStatus(coachId: string): {
  connected: boolean;
  email?: string | null;
  expiryDate?: number | null;
  updatedAt?: string;
} {
  hydrateIfNeeded();
  const rec = tokenStore.get(coachId);
  if (!hasValidZoomCredentialTokens(rec || null)) return { connected: false };
  return {
    connected: true,
    email: rec?.email ?? null,
    expiryDate: rec?.expiryDate ?? null,
    updatedAt: rec?.updatedAt,
  };
}
