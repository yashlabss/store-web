export const PRODUCT_CATEGORIES = [
  { key: "all", label: "All" },
  { key: "collect_emails_applications", label: "Collect Emails / Applications" },
  { key: "digital_product", label: "Digital Product" },
  { key: "coaching", label: "Coaching" },
  { key: "custom_product", label: "Custom Product" },
  { key: "ecourse", label: "eCourse" },
  { key: "recurring_membership", label: "Recurring Membership" },
  { key: "webinar", label: "Webinar" },
  { key: "community", label: "Community" },
  { key: "url_media", label: "URL / Media" },
  { key: "stan_affiliate", label: "Stan Affiliate Link" },
  { key: "audio", label: "Audio" },
  { key: "video", label: "Video" },
  { key: "pdf", label: "PDF" },
  { key: "uncategorized", label: "Uncategorized" },
] as const;

export type ProductCategoryKey = (typeof PRODUCT_CATEGORIES)[number]["key"];

const VALID_KEYS = new Set<ProductCategoryKey>(
  PRODUCT_CATEGORIES.map((x) => x.key)
);

const ALIAS_MAP: Record<string, ProductCategoryKey> = {
  collectemails: "collect_emails_applications",
  collect_emails: "collect_emails_applications",
  applications: "collect_emails_applications",
  application: "collect_emails_applications",
  digital: "digital_product",
  digital_products: "digital_product",
  custom: "custom_product",
  course: "ecourse",
  courses: "ecourse",
  membership: "recurring_membership",
  recurring: "recurring_membership",
  webinar: "webinar",
  community: "community",
  affiliate: "stan_affiliate",
  url: "url_media",
  media: "url_media",
  audio: "audio",
  video: "video",
  pdf: "pdf",
};

export function normalizeProductCategoryKey(raw: unknown): ProductCategoryKey | null {
  const base = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\/\-\s]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
  if (!base) return null;
  const mapped = ALIAS_MAP[base] || (base as ProductCategoryKey);
  return VALID_KEYS.has(mapped) ? mapped : null;
}

export function inferCategoryFromKind(kindRaw: string): ProductCategoryKey | null {
  const kind = String(kindRaw || "").trim().toLowerCase();
  if (!kind) return null;
  if (kind === "webinar") return "webinar";
  if (kind === "coaching") return "coaching";
  if (kind === "membership") return "recurring_membership";
  if (kind === "community") return "community";
  if (kind === "course") return "ecourse";
  if (kind === "url-media") return "url_media";
  if (kind === "affiliate") return "stan_affiliate";
  if (kind === "custom") return "collect_emails_applications";
  return null;
}

