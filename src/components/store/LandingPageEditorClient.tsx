"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { API_LANDING_PAGES_BASE } from "../../lib/api";

type Props = {
  pageType: string;
  pageId?: string;
};

type LandingPage = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  location: "store" | "landing";
  hidden: boolean;
  data: Record<string, unknown>;
};

export default function LandingPageEditorClient({ pageType, pageId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(Boolean(pageId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState<LandingPage | null>(null);
  const [title, setTitle] = useState("My Landing Page");
  const [slug, setSlug] = useState("");
  const [headline, setHeadline] = useState("Grow your audience");
  const [description, setDescription] = useState("Explain your offer with a strong value proposition.");
  const [cta, setCta] = useState("Get Started");
  const [location, setLocation] = useState<"store" | "landing">("landing");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  useEffect(() => {
    if (!pageId || !token) return;
    setLoading(true);
    void fetch(`${API_LANDING_PAGES_BASE}/${encodeURIComponent(pageId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        const p = json.page as LandingPage | undefined;
        if (!p) return;
        setPage(p);
        setTitle(p.title || "My Landing Page");
        setSlug(p.slug || "");
        setLocation(p.location || "landing");
        const data = (p.data || {}) as {
          headline?: string;
          description?: string;
          cta?: string;
        };
        setHeadline(data.headline || "Grow your audience");
        setDescription(
          data.description || "Explain your offer with a strong value proposition."
        );
        setCta(data.cta || "Get Started");
      })
      .catch(() => setError("Could not load landing page."))
      .finally(() => setLoading(false));
  }, [pageId, token]);

  const previewUrl = useMemo(() => {
    const handle =
      typeof window !== "undefined"
        ? (localStorage.getItem("username_hint") || "creator").trim() || "creator"
        : "creator";
    const safeSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return `http://localhost:3001/${handle}/p/${safeSlug}`;
  }, [slug, title]);

  async function save(status: "draft" | "published") {
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        title,
        slug,
        page_type: pageType,
        status,
        location,
        hidden: false,
        data: { headline, description, cta },
      };
      const res = await fetch(
        pageId
          ? `${API_LANDING_PAGES_BASE}/${encodeURIComponent(pageId)}`
          : API_LANDING_PAGES_BASE,
        {
          method: pageId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Could not save page.");
      router.push("/dashboard/store?tab=landing-pages-tab");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save page.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <nav className="text-sm text-slate-500">
          <Link href="/dashboard/store?tab=landing-pages-tab" className="hover:text-slate-800">
            Landing Pages
          </Link>{" "}
          / <span className="font-semibold text-slate-900">Edit Page</span>
        </nav>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <div>
          <label className="text-sm font-semibold text-slate-800">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
            placeholder="my-landing-page"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">Page Location</label>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => setLocation("landing")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${location === "landing" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}
            >
              Landing Pages tab
            </button>
            <button
              type="button"
              onClick={() => setLocation("store")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${location === "store" ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-600"}`}
            >
              Store tab
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">Headline</label>
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-800">CTA Button</label>
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => void save("draft")}
            className="rounded-full border-2 border-violet-600 px-6 py-2.5 text-sm font-bold text-violet-700 disabled:opacity-50"
          >
            Save Draft
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save("published")}
            className="rounded-full bg-violet-600 px-6 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            Publish
          </button>
        </div>
      </div>
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Preview</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">{headline}</h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          <button className="mt-4 w-full rounded-full bg-violet-600 py-2.5 text-sm font-bold text-white">
            {cta}
          </button>
          <p className="mt-4 break-all text-xs text-slate-500">{previewUrl}</p>
          <p className="mt-2 text-xs text-slate-400">
            {page?.status === "published" ? "Published page" : "Draft preview"}
          </p>
        </div>
      </aside>
    </div>
  );
}
