"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { API_PUBLIC_BASE } from "../../../lib/api";

export default function PdfPreviewPage() {
  const searchParams = useSearchParams();
  const tokenFromToken = searchParams.get("token");
  const tokenFromT = searchParams.get("t");
  const safeToken = String(tokenFromToken || tokenFromT || "").trim();
  const mediaUrl = useMemo(
    () => (safeToken ? `${API_PUBLIC_BASE}/media/${encodeURIComponent(safeToken)}` : ""),
    [safeToken]
  );
  const downloadUrl = useMemo(
    () =>
      safeToken
        ? `${API_PUBLIC_BASE}/media/${encodeURIComponent(safeToken)}?download=1`
        : "",
    [safeToken]
  );

  if (!safeToken) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
          padding: 0,
        }}
      >
        Invalid or missing link token. Please open the latest email link.
      </div>
    );
  }

  return (
    <main style={{ width: "100vw", height: "100vh", margin: 0, background: "#0b1020" }}>
      <header
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid rgba(148,163,184,.25)",
          background: "rgba(15,23,42,.9)",
        }}
      >
        <div style={{ color: "#fff", fontWeight: 700 }}>Your PDF Preview</div>
        <a
          href={downloadUrl}
          style={{
            textDecoration: "none",
            background: "#4f46e5",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 8,
            fontWeight: 700,
          }}
        >
          Download
        </a>
      </header>
      <iframe
        src={mediaUrl}
        style={{ width: "100vw", height: "calc(100vh - 56px)", border: "none", display: "block" }}
        title="PDF Preview"
      />
    </main>
  );
}
