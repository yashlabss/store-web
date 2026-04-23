"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { API_AUTH_BASE, API_LANDING_PAGES_BASE } from "../../lib/api";

const PURPLE = "#6b46ff";

type ThemePayload = {
  theme_name: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  card_style: string;
  primary_font: string;
  button_style: string;
  design_json: Record<string, unknown>;
};

/** Pre-built templates — visuals match Stan-style variety (hero + product list). */
type TemplateId =
  | "stan_classic"
  | "vibrant_sunset"
  | "midnight_social"
  | "bloom_purple"
  | "ocean_fresh";

type StoreTemplate = {
  id: TemplateId;
  label: string;
  shortLabel: string;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  pageGradient: string;
  card_style: "rounded" | "sharp" | "soft";
  button_style: "pill" | "rounded" | "square";
  primary_font: string;
  fontImportName: string;
  /** Renders as distinct mini-store layouts in the carousel. */
  variant: "light_cards" | "gradient_hero" | "dark_social" | "violet_cards" | "teal_fresh";
};

const TEMPLATES: StoreTemplate[] = [
  {
    id: "stan_classic",
    label: "Stan Classic",
    shortLabel: "Classic",
    primary_color: "#0f766e",
    secondary_color: "#6b46ff",
    background_color: "#f8f9fc",
    pageGradient: "linear-gradient(180deg, #ffffff 0%, #f8f9fc 100%)",
    card_style: "rounded",
    button_style: "pill",
    primary_font: "Plus Jakarta Sans",
    fontImportName: "Plus+Jakarta+Sans",
    variant: "light_cards",
  },
  {
    id: "bloom_purple",
    label: "Bloom",
    shortLabel: "Bloom",
    primary_color: "#7c3aed",
    secondary_color: "#a855f7",
    background_color: "#faf5ff",
    pageGradient: "linear-gradient(180deg, #ede9fe 0%, #faf5ff 40%, #ffffff 100%)",
    card_style: "soft",
    button_style: "rounded",
    primary_font: "Poppins",
    fontImportName: "Poppins",
    variant: "violet_cards",
  },
  {
    id: "vibrant_sunset",
    label: "Vibrant Sunset",
    shortLabel: "Sunset",
    primary_color: "#ea580c",
    secondary_color: "#ec4899",
    background_color: "#fff7ed",
    pageGradient: "linear-gradient(180deg, #ffedd5 0%, #fff7ed 50%, #ffffff 100%)",
    card_style: "rounded",
    button_style: "pill",
    primary_font: "DM Sans",
    fontImportName: "DM+Sans",
    variant: "gradient_hero",
  },
  {
    id: "midnight_social",
    label: "Midnight",
    shortLabel: "Midnight",
    primary_color: "#22d3ee",
    secondary_color: "#a78bfa",
    background_color: "#0f172a",
    pageGradient: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
    card_style: "rounded",
    button_style: "rounded",
    primary_font: "Inter",
    fontImportName: "Inter",
    variant: "dark_social",
  },
  {
    id: "ocean_fresh",
    label: "Ocean Fresh",
    shortLabel: "Ocean",
    primary_color: "#0284c7",
    secondary_color: "#06b6d4",
    background_color: "#f0f9ff",
    pageGradient: "linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 100%)",
    card_style: "soft",
    button_style: "pill",
    primary_font: "Inter",
    fontImportName: "Inter",
    variant: "teal_fresh",
  },
];

function templateToTheme(t: StoreTemplate): ThemePayload {
  return {
    theme_name: t.id,
    primary_color: t.primary_color,
    secondary_color: t.secondary_color,
    background_color: t.background_color,
    card_style: t.card_style,
    primary_font: t.primary_font,
    button_style: t.button_style,
    design_json: {
      pageGradient: t.pageGradient,
      variant: t.variant,
    },
  };
}

function themeFromServer(json: Record<string, unknown> | null): ThemePayload | null {
  if (!json) return null;
  const name = (json.theme_name as string) || "stan_classic";
  const fromList = TEMPLATES.find((x) => x.id === name);
  if (fromList) {
    return {
      ...templateToTheme(fromList),
      ...json,
      design_json: {
        ...(fromList
          ? (templateToTheme(fromList).design_json as object)
          : {}),
        ...((json.design_json as object) || {}),
      },
    };
  }
  return {
    theme_name: name,
    primary_color: (json.primary_color as string) || "#0f766e",
    secondary_color: (json.secondary_color as string) || "#6b46ff",
    background_color: (json.background_color as string) || "#ffffff",
    card_style: (json.card_style as string) || "rounded",
    primary_font: (json.primary_font as string) || "Inter",
    button_style: (json.button_style as string) || "pill",
    design_json: (json.design_json as Record<string, unknown>) || {},
  };
}

function cardRadius(cardStyle: string): string {
  if (cardStyle === "sharp") return "0.5rem";
  if (cardStyle === "soft") return "1.5rem";
  return "1rem";
}

function buttonRadius(buttonStyle: string): string {
  if (buttonStyle === "square") return "0.35rem";
  if (buttonStyle === "rounded") return "0.75rem";
  return "9999px";
}

/** Mini phone used inside carousel + main preview. */
function StorefrontMiniPreview({
  t,
  name,
  compact,
}: {
  t: ThemePayload;
  name: string;
  compact: boolean;
}) {
  const meta = TEMPLATES.find((x) => x.id === t.theme_name) || TEMPLATES[0];
  const grad =
    (t.design_json?.pageGradient as string) || meta.pageGradient;
  const variant =
    (t.design_json?.variant as string) || meta.variant;
  const isDark = variant === "dark_social";
  const textMain = isDark ? "#f8fafc" : "#0f172a";
  const textSub = isDark ? "#94a3b8" : "#64748b";

  return (
    <div
      className={`mx-auto flex flex-col overflow-hidden border-[6px] border-slate-900 bg-slate-900 shadow-xl ${
        compact ? "h-[200px] w-[112px] rounded-[20px] text-[8px]" : "h-[min(520px,70vh)] w-[280px] rounded-[28px] text-sm"
      }`}
      style={{ fontFamily: t.primary_font }}
    >
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto"
        style={{ background: grad }}
      >
        <div
          className="flex flex-col items-center px-3 pt-6 pb-3"
          style={{ color: textMain }}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold text-slate-600"
            style={{
              background: isDark ? "rgba(255,255,255,0.1)" : "#dbeafe",
            }}
          >
            {name.charAt(0).toUpperCase() || "?"}
          </div>
          <p className="mt-2 text-center text-[15px] font-bold leading-tight">
            {name}
          </p>
          {!compact && (
            <div className="mt-2 flex gap-2 text-[10px] text-slate-500">
              <span>TIK</span>
              <span>IN</span>
              <span>IG</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2.5 px-2.5 pb-6">
          {[
            { title: "Get my PDF", sub: "Download instantly", price: "₹0.50" },
            { title: "My product", sub: "Full guide inside", price: "₹9.99" },
          ].map((p, i) => (
            <div
              key={i}
              className="border border-white/20 bg-white/90 shadow-sm"
              style={{
                borderRadius: cardRadius(t.card_style),
                ...(isDark && {
                  background: "rgba(30,41,59,0.85)",
                  borderColor: "rgba(148,163,184,0.2)",
                }),
              }}
            >
              <div className="flex gap-2 p-2.5">
                <div
                  className="h-12 w-12 shrink-0 overflow-hidden"
                  style={{ borderRadius: cardRadius(t.card_style) }}
                >
                  {i === 0 ? (
                    <div
                      className="h-full w-full bg-gradient-to-br from-pink-200 to-amber-100"
                      aria-hidden
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center bg-slate-100 text-[9px] text-slate-400"
                      aria-hidden
                    >
                      file
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="line-clamp-1 text-[12px] font-bold"
                    style={{ color: textMain }}
                  >
                    {p.title}
                  </p>
                  <p
                    className="line-clamp-1 text-[10px] leading-tight"
                    style={{ color: textSub }}
                  >
                    {p.sub}
                  </p>
                  <p
                    className="mt-0.5 text-[11px] font-bold"
                    style={{ color: t.secondary_color }}
                  >
                    {p.price}
                  </p>
                </div>
              </div>
              <div className="px-2.5 pb-2.5">
                <div
                  className="w-full py-1.5 text-center text-[10px] font-bold text-white"
                  style={{
                    backgroundColor: t.primary_color,
                    borderRadius: buttonRadius(t.button_style),
                  }}
                >
                  {i === 0 ? "Get My Guide" : "Buy now"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditDesignClient() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemePayload>(templateToTheme(TEMPLATES[0]));
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollRaf = useRef<number | null>(null);
  const lastScrolledIndex = useRef(0);

  // Load Google Font for current theme
  useEffect(() => {
    const t = TEMPLATES.find((x) => x.id === theme.theme_name) || TEMPLATES[0];
    const id = `gf-${t.fontImportName}`;
    if (typeof document === "undefined") return;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${t.fontImportName}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }, [theme.theme_name]);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    void fetch(`${API_LANDING_PAGES_BASE}/theme`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((json) => {
        const loaded = themeFromServer(json.theme as Record<string, unknown>);
        if (loaded) {
          setTheme(loaded);
          const idx = TEMPLATES.findIndex((x) => x.id === loaded.theme_name);
          if (idx >= 0) {
            lastScrolledIndex.current = idx;
            setActiveIndex(idx);
            requestAnimationFrame(() => {
              itemRefs.current[idx]?.scrollIntoView({
                inline: "center",
                block: "nearest",
                behavior: "auto",
              });
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let bestI = 0;
    let bestD = Number.POSITIVE_INFINITY;
    itemRefs.current.forEach((node, i) => {
      if (!node) return;
      const c = node.offsetLeft + node.offsetWidth / 2;
      const d = Math.abs(center - c);
      if (d < bestD) {
        bestD = d;
        bestI = i;
      }
    });
    if (bestI === lastScrolledIndex.current) return;
    lastScrolledIndex.current = bestI;
    setActiveIndex(bestI);
    setTheme((prev) => {
      if (TEMPLATES[bestI].id === prev.theme_name) return prev;
      return templateToTheme(TEMPLATES[bestI]);
    });
  }, []);

  const onScroll = () => {
    if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(updateActiveFromScroll);
  };

  function scrollToIndex(i: number) {
    const node = itemRefs.current[i];
    if (node) {
      node.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
    }
  }

  function applyTemplateAtIndex(i: number) {
    lastScrolledIndex.current = i;
    setActiveIndex(i);
    setTheme(templateToTheme(TEMPLATES[i]));
  }

  async function saveTheme() {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`${API_LANDING_PAGES_BASE}/theme`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { message?: string }).message || "Could not save design.");
      setMsg("Design saved successfully.");
      window.setTimeout(() => router.push("/dashboard/store?tab=design"), 700);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save design.");
    } finally {
      setSaving(false);
    }
  }

  const displayName = useDisplayName();
  const currentTemplate = TEMPLATES[activeIndex] || TEMPLATES[0];

  if (loading) {
    return (
      <div className="flex justify-center py-14">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <nav className="mb-2 flex flex-wrap items-center gap-2 text-[15px]">
        <Link
          href="/dashboard/store?tab=design"
          className="font-medium text-slate-500 hover:text-slate-800"
        >
          My Store
        </Link>
        <span className="text-slate-400">/</span>
        <span className="font-bold text-slate-900">Edit Design</span>
      </nav>
      {msg ? <p className="mb-2 text-sm text-slate-600">{msg}</p> : null}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_min(340px,36vw)]">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Choose a template
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Scroll the carousel — the template in the center is applied to your
            store preview. Adjust colors and font below, then save.
          </p>

          {/* Scrollable template carousel (center = selected) */}
          <div className="relative mt-6">
            <div
              ref={scrollerRef}
              onScroll={onScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-[calc(50%-5rem)] pb-2 pt-4 [scrollbar-width:none] md:px-[calc(50%-6rem)] [&::-webkit-scrollbar]:hidden"
            >
              {TEMPLATES.map((tmpl, i) => {
                const tPreview = templateToTheme(tmpl);
                const isCenter = i === activeIndex;
                return (
                  <div
                    key={tmpl.id}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    className="snap-center shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        applyTemplateAtIndex(i);
                        scrollToIndex(i);
                      }}
                      className="relative block transition-transform duration-300"
                      style={{
                        transform: isCenter ? "scale(1.08) translateY(-4px)" : "scale(0.88)",
                        zIndex: isCenter ? 10 : 1,
                        opacity: isCenter ? 1 : 0.65,
                      }}
                    >
                      <span className="sr-only">Select {tmpl.label}</span>
                      <div className="pointer-events-none">
                        <StorefrontMiniPreview
                          t={tPreview}
                          name={displayName}
                          compact
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  const next = Math.max(0, activeIndex - 1);
                  applyTemplateAtIndex(next);
                  scrollToIndex(next);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label="Previous template"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <p className="min-w-[8rem] text-center text-sm font-bold text-slate-900">
                {currentTemplate.label}
              </p>
              <button
                type="button"
                onClick={() => {
                  const next = Math.min(TEMPLATES.length - 1, activeIndex + 1);
                  applyTemplateAtIndex(next);
                  scrollToIndex(next);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
                aria-label="Next template"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                  <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Color + font (Stan-style panel) */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Customize
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-6">
              <div>
                <p className="text-sm font-semibold text-slate-800">Colors</p>
                <div className="mt-2 flex gap-2">
                  <input
                    type="color"
                    value={theme.primary_color}
                    onChange={(e) =>
                      setTheme((t) => ({ ...t, primary_color: e.target.value }))
                    }
                    className="h-11 w-11 cursor-pointer rounded-lg border-2 border-slate-200"
                    aria-label="Primary color"
                  />
                  <input
                    type="color"
                    value={theme.secondary_color}
                    onChange={(e) =>
                      setTheme((t) => ({
                        ...t,
                        secondary_color: e.target.value,
                      }))
                    }
                    className="h-11 w-11 cursor-pointer rounded-lg border-2 border-slate-200"
                    aria-label="Secondary color"
                  />
                </div>
              </div>
              <div className="min-w-[12rem] flex-1">
                <label className="text-sm font-semibold text-slate-800" htmlFor="font-select">
                  Font
                </label>
                <select
                  id="font-select"
                  value={theme.primary_font}
                  onChange={(e) =>
                    setTheme((t) => ({ ...t, primary_font: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option>Plus Jakarta Sans</option>
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>DM Sans</option>
                  <option>Roboto</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Link
                href="/dashboard/store?tab=design"
                className="inline-flex items-center justify-center rounded-full border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="button"
                disabled={saving}
                onClick={() => void saveTheme()}
                className="inline-flex min-w-[7rem] items-center justify-center rounded-full px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                style={{ backgroundColor: PURPLE }}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* Live phone — mirrors centered template + edits */}
        <aside className="lg:sticky lg:top-20">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            Preview
          </p>
          <div
            className="mx-auto flex justify-center"
            style={{ fontFamily: theme.primary_font }}
          >
            <StorefrontMiniPreview
              t={theme}
              name={displayName}
              compact={false}
            />
          </div>
        </aside>
      </div>

    </div>
  );
}

function useDisplayName() {
  const [name, setName] = useState("Creator");
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    void fetch(`${API_AUTH_BASE}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((j: { user?: { full_name?: string; username?: string } }) => {
        const u = j.user;
        if (u) {
          const h = (u.username || "creator").trim();
          setName(
            u.full_name?.trim() || h.charAt(0).toUpperCase() + h.slice(1)
          );
        }
      });
  }, []);
  return name;
}
