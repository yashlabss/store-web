"use client";

import { Suspense } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_PUBLIC_BASE, resolvePlaybackUrl } from "../../../lib/api";

function formatClock(secondsRaw: number): string {
  const n = Number(secondsRaw);
  if (!Number.isFinite(n) || n < 0) return "0:00";
  const seconds = Math.floor(n);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Browsers expect `audio/mpeg` for MP3; some APIs return `audio/mp3`. */
function normalizeAudioMimeType(raw: string): string {
  const s = String(raw || "").trim().toLowerCase();
  if (!s) return "audio/mpeg";
  if (s === "audio/mp3" || s === "audio/mpeg3") return "audio/mpeg";
  return s;
}

function isBenignPlayError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const name = "name" in err ? String((err as DOMException).name) : "";
  const message = "message" in err ? String((err as Error).message) : "";
  if (name === "AbortError") return true;
  if (/interrupted by a call to pause|play\(\) request was interrupted/i.test(message)) return true;
  return false;
}

function AudioPreviewPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || searchParams.get("t") || "").trim();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const waveformRef = useRef<HTMLDivElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const resumeAtRef = useRef(0);
  /** Monotonic id so stale play() rejections are ignored after a new user action. */
  const playGenerationRef = useRef(0);
  const seekByImplRef = useRef<(delta: number) => void>(() => {});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [playbackError, setPlaybackError] = useState("");
  const [streamSrc, setStreamSrc] = useState("");
  const [streamMime, setStreamMime] = useState("audio/mpeg");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [waveformPeaks, setWaveformPeaks] = useState<number[] | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  /** From element metadata (preferred). */
  const [duration, setDuration] = useState(0);
  /** From API when upload probed (fallback until metadata loads). */
  const [durationHintSecs, setDurationHintSecs] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [authToken, setAuthToken] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  const downloadUrl = `${API_PUBLIC_BASE}/media/${encodeURIComponent(token)}?download=1`;

  const handleDownload = useCallback(async () => {
    if (downloadBusy || !token) return;
    setDownloadBusy(true);
    setDownloadError("");
    let objectUrl = "";
    try {
      const res = await fetch(downloadUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`Download failed (${res.status}).`);
      const blob = await res.blob();
      objectUrl = URL.createObjectURL(blob);
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
      const fileName = match ? decodeURIComponent(match[1]) : "audio";
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = fileName;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : "Could not download.");
    } finally {
      if (objectUrl) {
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      }
      setDownloadBusy(false);
    }
  }, [downloadBusy, downloadUrl, token]);

  const effectiveDuration = useMemo(() => {
    if (Number.isFinite(duration) && duration > 0) return duration;
    if (Number.isFinite(durationHintSecs) && durationHintSecs > 0) return durationHintSecs;
    return 0;
  }, [duration, durationHintSecs]);

  const saveProgress = useCallback(
    async (force = false) => {
      const a = audioRef.current;
      if (!token || !authToken || !a) return;
      const ct = a.currentTime || 0;
      const elDur = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
      const dur = elDur || effectiveDuration || 0;
      const completed = dur > 0 ? (ct / dur) * 100 : 0;
      try {
        await fetch(`${API_PUBLIC_BASE}/audio-progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token,
            current_time: ct,
            duration: dur,
            watched_seconds: ct,
            completed_percentage: completed,
          }),
          keepalive: force,
        });
      } catch {
        /* ignore */
      }
    },
    [token, authToken, effectiveDuration]
  );

  const applySeek = useCallback((targetSeconds: number) => {
    const a = audioRef.current;
    if (!a) return;
    const max =
      Number.isFinite(a.duration) && a.duration > 0
        ? a.duration
        : effectiveDuration > 0
          ? effectiveDuration
          : Number.POSITIVE_INFINITY;
    const next = Math.max(0, Math.min(max, targetSeconds));
    if (Number.isFinite(next)) {
      a.currentTime = next;
      setCurrentTime(a.currentTime || 0);
    }
  }, [effectiveDuration]);

  const seekBy = useCallback(
    (delta: number) => {
      const a = audioRef.current;
      if (!a) return;
      applySeek((a.currentTime || 0) + delta);
    },
    [applySeek]
  );

  seekByImplRef.current = seekBy;

  const seekToFraction = useCallback(
    (fraction: number) => {
      if (effectiveDuration <= 0) return;
      const f = Math.max(0, Math.min(1, fraction));
      applySeek(f * effectiveDuration);
    },
    [applySeek, effectiveDuration]
  );

  const pausePlayback = useCallback(() => {
    playGenerationRef.current += 1;
    const a = audioRef.current;
    if (!a) return;
    a.pause();
  }, []);

  const startPlayback = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    const gen = playGenerationRef.current;
    setPlaybackError("");
    try {
      await a.play();
      if (gen !== playGenerationRef.current) return;
    } catch (err) {
      if (gen !== playGenerationRef.current) return;
      if (isBenignPlayError(err)) return;
      const name = err && typeof err === "object" && "name" in err ? String((err as DOMException).name) : "";
      if (name === "NotAllowedError") {
        setPlaybackError("Click play again — the browser blocked autoplay until you interact with the page.");
        return;
      }
      if (name === "NotSupportedError") {
        setPlaybackError("This audio format could not be played. Try refreshing or another browser.");
        return;
      }
      setPlaybackError(err instanceof Error ? err.message : "Playback failed.");
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    if (!a.paused) {
      pausePlayback();
      return;
    }
    await startPlayback();
  }, [pausePlayback, startPlayback]);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing link token.");
      setLoading(false);
      return;
    }
    const localToken = typeof window === "undefined" ? "" : localStorage.getItem("buyer_auth_token") || "";
    if (!localToken) {
      const redirectTo = `/preview/audio?token=${encodeURIComponent(token)}`;
      router.replace(`/buyer/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setAuthToken(localToken);
    async function boot() {
      try {
        const res = await fetch(`${API_PUBLIC_BASE}/audio-access/${encodeURIComponent(token)}`, {
          headers: { Authorization: `Bearer ${localToken}` },
          cache: "no-store",
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Could not load secure audio.");
        const src = String(json?.stream?.src || "").trim();
        if (!src) throw new Error("Audio stream not available.");
        setStreamSrc(resolvePlaybackUrl(src));
        setStreamMime(normalizeAudioMimeType(String(json?.stream?.mime_type || "audio/mpeg")));
        const hint = Number(json?.stream?.duration_secs);
        setDurationHintSecs(Number.isFinite(hint) && hint > 0 ? hint : 0);
        setPlaybackError("");
        const cover = json?.stream?.cover_url;
        setCoverUrl(typeof cover === "string" && cover.trim() ? cover.trim() : null);
        const peaks = json?.stream?.waveform_peaks;
        setWaveformPeaks(Array.isArray(peaks) && peaks.length > 0 ? peaks.map((n: number) => Number(n)) : null);
        const savedPos = Number(json?.progress?.last_position_secs || 0);
        resumeAtRef.current = Math.max(0, savedPos);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load secure audio.");
      } finally {
        setLoading(false);
      }
    }
    void boot();
  }, [token, router]);

  useEffect(() => {
    if (!token || !authToken) return;
    saveTimerRef.current = window.setInterval(() => void saveProgress(false), 5000);
    const onUnload = () => void saveProgress(true);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    return () => {
      if (saveTimerRef.current) window.clearInterval(saveTimerRef.current);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      void saveProgress(true);
    };
  }, [token, authToken, saveProgress]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          void togglePlayback();
          break;
        case "KeyJ":
          e.preventDefault();
          seekByImplRef.current(-10);
          break;
        case "KeyL":
          e.preventDefault();
          seekByImplRef.current(10);
          break;
        case "KeyM":
          e.preventDefault();
          {
            const a = audioRef.current;
            if (a) {
              a.muted = !a.muted;
              setMuted(a.muted);
            }
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekByImplRef.current(-5);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekByImplRef.current(5);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlayback]);

  const applyResumePosition = useCallback((a: HTMLAudioElement) => {
    const start = resumeAtRef.current;
    if (start <= 0.5) return;
    const max = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : effectiveDuration;
    if (!Number.isFinite(max) || max <= 0) return;
    if (start < max - 0.5) {
      a.currentTime = start;
      resumeAtRef.current = 0;
      setCurrentTime(a.currentTime || 0);
    }
  }, [effectiveDuration]);

  const onLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLAudioElement>) => {
      const a = e.currentTarget;
      const dur = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
      if (dur > 0) setDuration(dur);
      setCurrentTime(a.currentTime || 0);
      queueMicrotask(() => {
        const el = audioRef.current;
        if (!el || !el.paused) return;
        applyResumePosition(el);
      });
    },
    [applyResumePosition]
  );

  const onDurationChange = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    const a = e.currentTarget;
    const dur = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
    if (dur > 0) setDuration(dur);
  }, []);

  const onTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLAudioElement>) => {
    setCurrentTime(e.currentTarget.currentTime || 0);
  }, []);

  const onPlay = useCallback(() => {
    setIsPlaying(true);
    setPlaybackError("");
  }, []);

  const onPause = useCallback(() => {
    setIsPlaying(false);
    setBuffering(false);
    void saveProgress(false);
  }, [saveProgress]);

  const progressFraction = useMemo(() => {
    if (effectiveDuration <= 0) return 0;
    return Math.max(0, Math.min(1, currentTime / effectiveDuration));
  }, [currentTime, effectiveDuration]);

  const barCount = waveformPeaks && waveformPeaks.length > 0 ? Math.min(waveformPeaks.length, 120) : 64;
  const displayPeaks = useMemo(() => {
    if (waveformPeaks && waveformPeaks.length > 0) {
      const src = waveformPeaks;
      if (src.length <= barCount) return src;
      const out: number[] = [];
      const step = src.length / barCount;
      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor(i * step);
        out.push(src[idx] ?? 0);
      }
      return out;
    }
    return Array.from({ length: barCount }, (_, i) => 0.25 + 0.55 * Math.sin((i / barCount) * Math.PI));
  }, [waveformPeaks, barCount]);

  const onWaveformPointer = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    const el = waveformRef.current;
    if (!el || effectiveDuration <= 0) return;
    const r = el.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const x = clientX - r.left;
    seekToFraction(r.width > 0 ? x / r.width : 0);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading audio…</div>;
  }
  if (error || !streamSrc) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        {error || "Audio not available."}
      </div>
    );
  }

  const timeRemainingSecs = effectiveDuration > 0 ? Math.max(0, effectiveDuration - currentTime) : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-lg px-4 py-8 md:max-w-xl">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl">
          <div className="space-y-4 p-5">
            {playbackError ? (
              <p className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-3 py-2 text-center text-sm text-amber-200">
                {playbackError}
              </p>
            ) : null}
            <audio
              key={streamSrc}
              ref={audioRef}
              preload="auto"
              playsInline
              className="hidden"
              onLoadedMetadata={(e) => {
                setPlaybackError("");
                onLoadedMetadata(e);
              }}
              onDurationChange={onDurationChange}
              onLoadedData={(e) => {
                const a = e.currentTarget;
                const dur = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : 0;
                if (dur > 0) setDuration(dur);
              }}
              onTimeUpdate={onTimeUpdate}
              onPlay={onPlay}
              onPause={onPause}
              onWaiting={() => setBuffering(true)}
              onPlaying={() => setBuffering(false)}
              onCanPlay={() => setBuffering(false)}
              onError={() => {
                setPlaybackError(
                  "Your browser could not load this audio. Try refreshing the page. If it keeps happening, the file may be missing or the signed link expired."
                );
                setBuffering(false);
                setIsPlaying(false);
              }}
              onVolumeChange={(e) => {
                const n = e.currentTarget;
                setMuted(n.muted);
                setVolume(n.volume);
              }}
            >
              <source src={streamSrc} type={streamMime} />
            </audio>

            <div>
              <div
                ref={waveformRef}
                role="slider"
                tabIndex={0}
                aria-valuenow={Math.round(progressFraction * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                className="relative flex h-24 cursor-pointer touch-none items-end justify-center gap-px rounded-lg bg-slate-950/80 px-1 pb-1 pt-3 outline-none ring-indigo-500 focus-visible:ring-2"
                onMouseDown={(e) => onWaveformPointer(e)}
                onTouchStart={(e) => onWaveformPointer(e)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    seekBy(-5);
                  } else if (e.key === "ArrowRight") {
                    e.preventDefault();
                    seekBy(5);
                  } else if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    void togglePlayback();
                  }
                }}
              >
                {displayPeaks.map((p, i) => {
                  const f = i / Math.max(1, displayPeaks.length - 1);
                  const played = f <= progressFraction;
                  const h = 8 + Math.min(92, Math.max(4, p * 100));
                  return (
                    <div
                      key={i}
                      className={`w-full max-w-[6px] rounded-t ${played ? "bg-indigo-500" : "bg-slate-700"}`}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
              {buffering ? (
                <p className="mt-1 text-center text-xs text-amber-300/90">Buffering…</p>
              ) : null}
            </div>

            <div className="flex items-center justify-between font-mono text-sm text-slate-400">
              <span>{formatClock(currentTime)}</span>
              <span>
                {timeRemainingSecs != null ? `${formatClock(timeRemainingSecs)} remaining` : "Duration loading…"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => seekBy(-10)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
              >
                −10s
              </button>
              <button
                type="button"
                onClick={() => void togglePlayback()}
                className="rounded-full border-2 border-indigo-500 bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-indigo-500"
                aria-pressed={isPlaying}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <button
                type="button"
                onClick={() => seekBy(10)}
                className="rounded-lg border border-slate-600 bg-slate-800 px-4 py-2 text-sm font-semibold hover:bg-slate-700"
              >
                +10s
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 border-t border-slate-800 pt-4 text-sm">
              <label className="flex items-center gap-2">
                <span className="text-slate-400">Speed</span>
                <select
                  value={String(playbackRate)}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPlaybackRate(next);
                    if (audioRef.current) audioRef.current.playbackRate = next;
                  }}
                  className="rounded-md border border-slate-600 bg-slate-800 px-2 py-1.5"
                >
                  {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                    <option key={s} value={s}>
                      {s}x
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2">
                <span className="text-slate-400">Volume</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    const a = audioRef.current;
                    const v = Number(e.target.value);
                    if (a) {
                      a.volume = v;
                      a.muted = v === 0;
                    }
                    setVolume(v);
                    setMuted(v === 0);
                  }}
                  className="w-28 accent-indigo-500"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  const a = audioRef.current;
                  if (!a) return;
                  a.muted = !a.muted;
                  setMuted(a.muted);
                }}
                className="rounded-md border border-slate-600 px-3 py-1.5 hover:bg-slate-800"
              >
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => void handleDownload()}
                disabled={downloadBusy}
                className="rounded-lg border border-emerald-600/60 bg-emerald-900/30 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadBusy ? "Preparing…" : "Download"}
              </button>
              {downloadError ? (
                <p className="text-xs font-medium text-rose-300">{downloadError}</p>
              ) : null}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          Shortcuts: Space / K (play/pause), J/L or arrows (seek), M (mute). Progress saves automatically.
        </p>
      </div>
    </main>
  );
}

export default function AudioPreviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading audio…</div>}>
      <AudioPreviewPageInner />
    </Suspense>
  );
}
