"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_AUDIENCE_BASE, authFetch } from "../../../lib/api";
import { networkErrorMessage } from "../../../lib/networkError";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tag = { id: string; name: string; color: string };

type Subscriber = {
  id: string;
  name: string | null;
  email: string;
  source: string | null;
  tags: string[];
  subscribed_at: string;
  subscribed: boolean;
};

type AudiencePayload = {
  subscribers: Subscriber[];
  total: number;
  active: number;
  unsubscribed: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TAG_COLORS = [
  "#6b46ff",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function SourceBadge({ source }: { source: string | null }) {
  const s = (source || "manual").toLowerCase();
  const colorMap: Record<string, string> = {
    manual: "bg-slate-100 text-slate-600",
    import: "bg-blue-100 text-blue-700",
    store: "bg-violet-100 text-violet-700",
    checkout: "bg-emerald-100 text-emerald-700",
    api: "bg-amber-100 text-amber-700",
  };
  const cls = colorMap[s] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {s}
    </span>
  );
}

function TagChip({ name, color }: { name: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: `${color ?? "#6b46ff"}22`,
        color: color ?? "#6b46ff",
      }}
    >
      {name}
    </span>
  );
}

function parseCSV(
  text: string
): { name: string; email: string; tags: string }[] {
  const lines = text.split("\n").filter(Boolean);
  if (!lines.length) return [];
  const header = lines[0]
    .split(",")
    .map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  return lines
    .slice(1)
    .map((line) => {
      const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row: Record<string, string> = {};
      header.forEach((h, i) => {
        row[h] = vals[i] ?? "";
      });
      return {
        name: row.name ?? "",
        email: row.email ?? "",
        tags: row.tags ?? "",
      };
    })
    .filter((r) => r.email);
}

function exportCSV(subscribers: Subscriber[]) {
  const header = [
    "Name",
    "Email",
    "Source",
    "Tags",
    "Subscribed At",
    "Status",
  ];
  const rows = subscribers.map((s) => [
    s.name ?? "",
    s.email,
    s.source ?? "manual",
    s.tags.join("|"),
    fmtDate(s.subscribed_at),
    s.subscribed ? "Subscribed" : "Unsubscribed",
  ]);
  const csv = [header, ...rows]
    .map((r) =>
      r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audience-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Add Subscriber Modal ─────────────────────────────────────────────────────

function AddSubscriberModal({
  onClose,
  onAdded,
}: {
  onClose: () => void;
  onAdded: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [tags, setTags] = useState("");
  const [source, setSource] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email) {
      setError("Email is required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_AUDIENCE_BASE}`, {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          source,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Failed to add subscriber."
        );
      onAdded();
      onClose();
    } catch (e) {
      setError(networkErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Add Subscriber
        </h2>
        <div className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            type="email"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          >
            <option value="manual">Manual</option>
            <option value="import">Import</option>
            <option value="store">Store</option>
          </select>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              className="flex-1 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
            >
              {loading ? "Adding…" : "Add Subscriber"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type MainTab = "subscribers" | "tags";

export default function AudiencePage() {
  const [tab, setTab] = useState<MainTab>("subscribers");
  const [audience, setAudience] = useState<AudiencePayload | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "subscribed" | "unsubscribed"
  >("all");
  const [tagFilter, setTagFilter] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [tagSaving, setTagSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAudience = useCallback(async () => {
    setListLoading(true);
    setListError("");
    try {
      const [audRes, tagRes] = await Promise.all([
        authFetch(`${API_AUDIENCE_BASE}`),
        authFetch(`${API_AUDIENCE_BASE}/tags`),
      ]);
      const audJson = await audRes.json().catch(() => ({}));
      const tagJson = await tagRes.json().catch(() => ({}));
      if (!audRes.ok)
        throw new Error(
          (audJson as { message?: string }).message || "Failed to load audience."
        );
      setAudience(audJson as AudiencePayload);
      if (tagRes.ok)
        setTags((tagJson as { tags?: Tag[] }).tags ?? []);
    } catch (e) {
      setListError(networkErrorMessage(e));
      setAudience({ subscribers: [], total: 0, active: 0, unsubscribed: 0 });
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAudience();
  }, [loadAudience]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return;
    try {
      await authFetch(`${API_AUDIENCE_BASE}/${id}`, { method: "DELETE" });
      void loadAudience();
    } catch {
      /* ignore */
    }
  };

  const handleBulkDelete = async () => {
    if (!selected.size || !confirm(`Delete ${selected.size} subscribers?`))
      return;
    await Promise.all(
      [...selected].map((id) =>
        authFetch(`${API_AUDIENCE_BASE}/${id}`, { method: "DELETE" })
      )
    );
    setSelected(new Set());
    void loadAudience();
  };

  const handleToggleSubscribed = async (sub: Subscriber) => {
    try {
      await authFetch(`${API_AUDIENCE_BASE}/${sub.id}`, {
        method: "PATCH",
        body: JSON.stringify({ subscribed: !sub.subscribed }),
      });
      void loadAudience();
    } catch {
      /* ignore */
    }
  };

  const handleImport = async (file: File) => {
    setImportLoading(true);
    setImportResult("");
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (!rows.length) {
        setImportResult("No valid rows found in CSV.");
        return;
      }
      const res = await authFetch(`${API_AUDIENCE_BASE}/bulk-import`, {
        method: "POST",
        body: JSON.stringify({ subscribers: rows }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          (json as { message?: string }).message || "Import failed."
        );
      setImportResult(
        `Imported ${(json as { imported?: number }).imported ?? rows.length} subscribers.`
      );
      void loadAudience();
    } catch (e) {
      setImportResult(networkErrorMessage(e));
    } finally {
      setImportLoading(false);
    }
  };

  const addTag = async () => {
    if (!newTagName.trim()) return;
    setTagSaving(true);
    try {
      const res = await authFetch(`${API_AUDIENCE_BASE}/tags`, {
        method: "POST",
        body: JSON.stringify({ name: newTagName.trim(), color: newTagColor }),
      });
      if (res.ok) {
        setNewTagName("");
        void loadAudience();
      }
    } catch {
      /* ignore */
    } finally {
      setTagSaving(false);
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm("Delete this tag?")) return;
    await authFetch(`${API_AUDIENCE_BASE}/tags/${id}`, { method: "DELETE" });
    void loadAudience();
  };

  const subs = audience?.subscribers ?? [];
  const filteredSubs = subs.filter((s) => {
    if (statusFilter === "subscribed" && !s.subscribed) return false;
    if (statusFilter === "unsubscribed" && s.subscribed) return false;
    if (tagFilter && !s.tags.includes(tagFilter)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !s.email.toLowerCase().includes(q) &&
        !(s.name ?? "").toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const allSelected =
    filteredSubs.length > 0 && filteredSubs.every((s) => selected.has(s.id));

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredSubs.map((s) => s.id)));
  };

  return (
    <div>
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Total Subscribers", value: audience?.total ?? 0 },
          { label: "Active", value: audience?.active ?? 0 },
          { label: "Unsubscribed", value: audience?.unsubscribed ?? 0 },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {s.label}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="mt-6 flex w-fit gap-1 rounded-xl bg-slate-100 p-1">
        {(["subscribers", "tags"] as MainTab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold capitalize transition-all ${
              tab === t
                ? "bg-white text-violet-700 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "subscribers" && (
        <>
          {/* Filters + Actions */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              placeholder="Search email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-sm placeholder-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
              <option value="all">All Status</option>
              <option value="subscribed">Subscribed</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
            >
              <option value="">All Tags</option>
              {tags.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="shrink-0 rounded-xl bg-violet-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              + Add
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={importLoading}
              className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              {importLoading ? "Importing…" : "Import CSV"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleImport(f);
                e.target.value = "";
              }}
            />
          </div>

          {importResult && (
            <p
              className={`mt-2 text-xs ${
                importResult.startsWith("Imported")
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              {importResult}
            </p>
          )}

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-violet-50 px-4 py-2.5">
              <span className="text-sm font-semibold text-violet-700">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={() => void handleBulkDelete()}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() =>
                  exportCSV(filteredSubs.filter((s) => selected.has(s.id)))
                }
                className="rounded-lg border border-violet-200 bg-white px-3 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
              >
                Export
              </button>
              <button
                type="button"
                onClick={() => setSelected(new Set())}
                className="ml-auto text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            </div>
          )}

          {listError && (
            <p className="mt-3 text-sm text-rose-600">{listError}</p>
          )}

          {/* Table */}
          {listLoading ? (
            <div className="mt-8 flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : filteredSubs.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 py-10 text-center text-sm text-slate-500">
              {subs.length === 0
                ? "No subscribers yet."
                : "No subscribers match your filters."}
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        className="rounded border-slate-300"
                      />
                    </th>
                    <th className="px-4 py-3">Name / Email</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Subscribed</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubs.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(s.id)}
                          onChange={() =>
                            setSelected((prev) => {
                              const n = new Set(prev);
                              n.has(s.id) ? n.delete(s.id) : n.add(s.id);
                              return n;
                            })
                          }
                          className="rounded border-slate-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {s.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">{s.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <SourceBadge source={s.source} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {s.tags.map((t) => {
                            const tag = tags.find((tg) => tg.name === t);
                            return (
                              <TagChip key={t} name={t} color={tag?.color} />
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {fmtDate(s.subscribed_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleToggleSubscribed(s)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            s.subscribed ? "bg-emerald-500" : "bg-slate-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                              s.subscribed ? "translate-x-4" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => void handleDelete(s.id)}
                          className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "tags" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">
              Manage Tags
            </h2>
            <div className="mb-5 flex flex-wrap gap-2">
              {tags.length === 0 ? (
                <p className="text-sm text-slate-400">No tags yet.</p>
              ) : (
                tags.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1"
                    style={{
                      borderColor: t.color,
                      backgroundColor: `${t.color}15`,
                    }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: t.color }}
                    >
                      {t.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => void deleteTag(t.id)}
                      className="ml-1 text-xs font-bold opacity-60 hover:opacity-100"
                      style={{ color: t.color }}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Tag Name
                </label>
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="e.g. VIP"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-500">
                  Color
                </label>
                <div className="flex gap-1.5">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTagColor(c)}
                      className={`h-6 w-6 rounded-full border-2 transition-all ${
                        newTagColor === c
                          ? "scale-110 border-slate-700"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void addTag()}
                disabled={tagSaving || !newTagName.trim()}
                className="shrink-0 rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                {tagSaving ? "Adding…" : "Add Tag"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <AddSubscriberModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => void loadAudience()}
        />
      )}
    </div>
  );
}
