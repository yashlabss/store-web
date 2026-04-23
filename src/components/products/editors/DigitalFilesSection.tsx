"use client";

import { useCallback, useEffect, useState } from "react";
import { API_DIGITAL_PRODUCTS_BASE, authFetch } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProductFile = {
  id: string;
  file_name: string;
  file_url: string;
  file_size?: number | null;
  file_type?: string | null;
  sort_order?: number;
};

// ─── File type detection ─────────────────────────────────────────────────────

type FileKind = "pdf" | "video" | "zip" | "image" | "audio" | "doc" | "spreadsheet" | "file";

function detectFileKind(name: string, mimeType?: string | null): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const mime = (mimeType ?? "").toLowerCase();

  if (ext === "pdf" || mime.includes("pdf")) return "pdf";
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext) || mime.startsWith("video/")) return "video";
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext) || mime.includes("zip")) return "zip";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext) || mime.startsWith("image/")) return "image";
  if (["mp3", "wav", "flac", "aac", "ogg"].includes(ext) || mime.startsWith("audio/")) return "audio";
  if (["doc", "docx"].includes(ext) || mime.includes("word")) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext) || mime.includes("excel") || mime.includes("spreadsheet")) return "spreadsheet";
  return "file";
}

function formatFileSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── File kind icons ─────────────────────────────────────────────────────────

function FileKindIcon({ kind }: { kind: FileKind }) {
  const configs: Record<FileKind, { bg: string; color: string; label: string }> = {
    pdf: { bg: "#fee2e2", color: "#dc2626", label: "PDF" },
    video: { bg: "#ede9fe", color: "#7c3aed", label: "VID" },
    zip: { bg: "#fef3c7", color: "#d97706", label: "ZIP" },
    image: { bg: "#d1fae5", color: "#059669", label: "IMG" },
    audio: { bg: "#fce7f3", color: "#db2777", label: "AUD" },
    doc: { bg: "#dbeafe", color: "#2563eb", label: "DOC" },
    spreadsheet: { bg: "#dcfce7", color: "#16a34a", label: "XLS" },
    file: { bg: "#f1f5f9", color: "#64748b", label: "FILE" },
  };
  const c = configs[kind];
  return (
    <div
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-black"
      style={{ backgroundColor: c.bg, color: c.color }}
    >
      {c.label}
    </div>
  );
}

// ─── Individual file row ──────────────────────────────────────────────────────

function FileRow({
  file,
  onDelete,
}: {
  file: ProductFile;
  onDelete: (id: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const kind = detectFileKind(file.file_name, file.file_type);

  const handleDelete = async () => {
    setDeleting(true);
    onDelete(file.id);
  };

  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
      <FileKindIcon kind={kind} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">{file.file_name}</p>
        <div className="mt-0.5 flex items-center gap-2">
          {file.file_size ? (
            <span className="text-xs text-slate-400">{formatFileSize(file.file_size)}</span>
          ) : null}
          {file.file_url ? (
            <a
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-violet-600 hover:underline"
            >
              View
            </a>
          ) : null}
        </div>
      </div>

      {confirm ? (
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            disabled={deleting}
            onClick={() => void handleDelete()}
            className="rounded-lg bg-rose-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => setConfirm(false)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          title="Remove file"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      )}
    </li>
  );
}

// ─── Add file form ────────────────────────────────────────────────────────────

function AddFileForm({
  productId,
  onAdded,
}: {
  productId: string;
  onAdded: (files: ProductFile[]) => void;
}) {
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    const name = fileName.trim();
    const url = fileUrl.trim();
    if (!url) {
      setError("Please enter a file URL.");
      return;
    }
    // Auto-derive name from URL if empty
    const derivedName = name || url.split("/").pop() || "file";
    setAdding(true);
    setError("");
    try {
      const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${productId}/files`, {
        method: "POST",
        body: JSON.stringify({
          files: [{ file_name: derivedName, file_url: url }],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        files?: ProductFile[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message || "Could not add file.");
      onAdded(data.files ?? []);
      setFileName("");
      setFileUrl("");
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">Add a file via URL</p>
      <div className="space-y-2">
        <div>
          <label htmlFor="df-name" className="sr-only">File name</label>
          <input
            id="df-name"
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="File name (optional — auto-detected from URL)"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div>
          <label htmlFor="df-url" className="sr-only">File URL</label>
          <input
            id="df-url"
            type="url"
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="https://example.com/your-file.pdf"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-xs font-medium text-rose-600">{error}</p>
      ) : null}
      <button
        type="button"
        disabled={adding || !fileUrl.trim()}
        onClick={() => void handleAdd()}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition disabled:opacity-50"
        style={{ backgroundColor: "#6b46ff" }}
      >
        {adding ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
            Adding…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add File
          </>
        )}
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type Props = {
  productId: string;
};

export default function DigitalFilesSection({ productId }: Props) {
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_DIGITAL_PRODUCTS_BASE}/${productId}/files`);
      const data = (await res.json().catch(() => ({}))) as {
        files?: ProductFile[];
        message?: string;
      };
      if (!res.ok) throw new Error(data.message || "Could not load files.");
      setFiles(data.files ?? []);
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  const handleDelete = useCallback(
    async (fileId: string) => {
      // Optimistic removal
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      try {
        const res = await authFetch(
          `${API_DIGITAL_PRODUCTS_BASE}/${productId}/files/${fileId}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const d = (await res.json().catch(() => ({}))) as { message?: string };
          throw new Error(d.message || "Delete failed.");
        }
      } catch (e) {
        // Re-fetch to restore correct state
        setError(networkErrorMessage(e));
        void fetchFiles();
      }
    },
    [productId, fetchFiles]
  );

  const handleAdded = useCallback((newFiles: ProductFile[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">Uploaded Files</h3>
        {files.length > 0 ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
            {files.length} file{files.length !== 1 ? "s" : ""}
          </span>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600" role="alert">{error}</p>
      ) : null}

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 p-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-40 rounded bg-slate-100" />
                <div className="h-3 w-20 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : files.length === 0 ? (
        <p className="text-sm text-slate-400">No files yet. Add one below.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((f) => (
            <FileRow key={f.id} file={f} onDelete={handleDelete} />
          ))}
        </ul>
      )}

      <AddFileForm productId={productId} onAdded={handleAdded} />
    </div>
  );
}
