"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_PUBLIC_BASE } from "../../../lib/api";

type VideoSource = { quality: string; src: string; mime_type?: string | null; label?: string };
type SubtitleTrack = { id: string; label: string; srclang: string; src: string; default?: boolean };

function formatClock(secondsRaw: number): string {
  const seconds = Math.max(0, Math.floor(secondsRaw || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function VideoPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = String(searchParams.get("token") || searchParams.get("t") || "").trim();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const saveTimerRef = useRef<number | null>(null);
  const resumeAtRef = useRef(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<VideoSource[]>([]);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [selectedQuality, setSelectedQuality] = useState("auto");
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [authToken, setAuthToken] = useState("");
  const [downloading, setDownloading] = useState(false);

  const selectedSource = useMemo(() => {
    const exact = sources.find((s) => s.quality === selectedQuality);
    return exact || sources[0] || null;
  }, [sources, selectedQuality]);
  const downloadUrl = `${API_PUBLIC_BASE}/media/${encodeURIComponent(token)}?download=1`;

  const triggerDownload = useCallback(async () => {
    if (!downloadUrl || downloading) return;
    try {
      setDownloading(true);
      const res = await fetch(downloadUrl, { method: "GET", cache: "no-store" });
      if (!res.ok) throw new Error("Download failed.");
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "video.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      setError("Could not download video. Please try again.");
    } finally {
      setDownloading(false);
    }
  }, [downloadUrl, downloading]);

  const saveProgress = useCallback(
    async (force = false) => {
      const v = videoRef.current;
      if (!token || !authToken || !v) return;
      const ct = v.currentTime || 0;
      const dur = Number.isFinite(v.duration) ? v.duration : 0;
      const completed = dur > 0 ? (ct / dur) * 100 : 0;
      try {
        await fetch(`${API_PUBLIC_BASE}/video-progress`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token,
            current_time: ct,
            duration: dur,
            watched_seconds: force ? ct : ct,
            completed_percentage: completed,
          }),
          keepalive: force,
        });
      } catch {
        // Ignore intermittent save failures.
      }
    },
    [token, authToken]
  );

  function seekBy(seconds: number) {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const next = Math.max(0, Math.min(Number.isFinite(v.duration) ? v.duration : Infinity, v.currentTime + seconds));
    v.currentTime = Number.isFinite(next) ? next : v.currentTime;
    setCurrentTime(v.currentTime || 0);
  }

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing link token.");
      setLoading(false);
      return;
    }
    const localToken = typeof window === "undefined" ? "" : localStorage.getItem("buyer_auth_token") || "";
    if (!localToken) {
      const redirectTo = `/preview/video?token=${encodeURIComponent(token)}`;
      router.replace(`/buyer/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }
    setAuthToken(localToken);
    async function boot() {
      try {
        const accessRes = await fetch(`${API_PUBLIC_BASE}/video-access/${encodeURIComponent(token)}`, {
          headers: { Authorization: `Bearer ${localToken}` },
          cache: "no-store",
        });
        const accessJson = await accessRes.json().catch(() => ({}));
        if (!accessRes.ok) throw new Error(accessJson.message || "Could not load secure video.");
        const apiSources = Array.isArray(accessJson?.stream?.sources) ? accessJson.stream.sources : [];
        setSources(apiSources);
        setSubtitles(Array.isArray(accessJson?.stream?.subtitles) ? accessJson.stream.subtitles : []);
        const savedPos = Number(accessJson?.progress?.last_position_secs || 0);
        resumeAtRef.current = Math.max(0, savedPos);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load secure video.");
      } finally {
        setLoading(false);
      }
    }
    void boot();
  }, [token, router]);

  useEffect(() => {
    if (!token || !authToken) return;
    saveTimerRef.current = window.setInterval(() => {
      void saveProgress(false);
    }, 5000);
    const onUnload = () => {
      void saveProgress(true);
    };
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    return () => {
      if (saveTimerRef.current) window.clearInterval(saveTimerRef.current);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      void saveProgress(true);
    };
  }, [token, authToken, saveProgress]);

  const onLoadedMetadata = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    const dur = Number.isFinite(v.duration) ? v.duration : 0;
    setDuration(dur);
    setCurrentTime(v.currentTime || 0);
    const start = resumeAtRef.current;
    if (start > 0.5 && Number.isFinite(v.duration) && start < v.duration - 0.5) {
      v.currentTime = start;
      resumeAtRef.current = 0;
    }
  }, []);

  const onDurationChange = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget;
    if (Number.isFinite(v.duration)) setDuration(v.duration);
  }, []);

  const onTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime || 0);
  }, []);

  const onPause = useCallback(() => {
    setBuffering(false);
    void saveProgress(false);
  }, [saveProgress]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading video...</div>;
  }
  if (error || !selectedSource) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
        {error || "Video source not found."}
      </div>
    );
  }

  const timeRemaining = Math.max(0, duration - currentTime);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto w-full max-w-[1400px] px-3 py-3 md:px-4 md:py-4">
        <div
          className="relative overflow-hidden rounded-xl border border-slate-700 bg-black"
          style={{ height: "min(82vh, 920px)" }}
        >
          <video
            ref={videoRef}
            src={selectedSource.src}
            controls
            controlsList="nodownload"
            disablePictureInPicture={false}
            className="h-full w-full object-contain"
            onLoadedMetadata={onLoadedMetadata}
            onDurationChange={onDurationChange}
            onTimeUpdate={onTimeUpdate}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onPause={onPause}
            onRateChange={(e) => setPlaybackRate((e.target as HTMLVideoElement).playbackRate)}
            onVolumeChange={(e) => {
              const node = e.target as HTMLVideoElement;
              setMuted(node.muted);
              setVolume(node.volume);
            }}
          >
            {subtitles.map((track) => (
              <track
                key={track.id}
                kind="subtitles"
                srcLang={track.srclang}
                src={track.src}
                label={track.label}
                default={Boolean(track.default)}
              />
            ))}
          </video>
          {buffering ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 text-sm">
              Buffering...
            </div>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => seekBy(-10)}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold hover:bg-slate-700"
            >
              -10s
            </button>
            <button
              type="button"
              onClick={() => seekBy(10)}
              className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold hover:bg-slate-700"
            >
              +10s
            </button>
          </div>
          <label className="flex items-center gap-2">
            <span className="text-slate-300">Quality</span>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="rounded bg-slate-800 px-2 py-1"
            >
              {sources.map((s) => (
                <option key={`${s.quality}-${s.label}`} value={s.quality}>
                  {s.label || s.quality}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="text-slate-300">Speed</span>
            <select
              value={String(playbackRate)}
              onChange={(e) => {
                const next = Number(e.target.value);
                setPlaybackRate(next);
                if (videoRef.current) videoRef.current.playbackRate = next;
              }}
              className="rounded bg-slate-800 px-2 py-1"
            >
              {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                <option key={s} value={s}>
                  {s}x
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Volume</span>
            <span>{muted ? "Muted" : `${Math.round(volume * 100)}%`}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Time Left</span>
            <span>{Number.isFinite(duration) && duration > 0 ? formatClock(timeRemaining) : "—"}</span>
          </div>
          <button
            type="button"
            onClick={() => void triggerDownload()}
            disabled={downloading}
            className="ml-auto rounded-md border border-indigo-500 bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
          >
            {downloading ? "Downloading..." : "Download"}
          </button>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Keyboard shortcuts: Space/K (play/pause), J/L (seek), M (mute), F (fullscreen), C (captions).
        </p>
      </div>
    </main>
  );
}
