"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardShell, { PURPLE } from "../dashboard/DashboardShell";
import {
  IconChevronLeft,
  IconFolder,
  IconPencil,
  IconPlusSm,
  IconSliders,
  IconStoreTab,
} from "../dashboard/dashboardIcons";
import { API_PRODUCTS_BASE } from "../../lib/api";

type TabKey = "thumbnail" | "product" | "options";
type FieldType = "phone" | "text" | "multiple_choice" | "dropdown" | "checkboxes";

type CustomField = {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  /** Multiple choice, dropdown, checkboxes */
  options?: string[];
};

type CustomFieldErrors = {
  label?: string;
  options?: string;
};

type CollectEmailsFormErrors = {
  thumbnail?: string;
  title?: string;
  subtitle?: string;
  button?: string;
  fieldErrors?: Record<string, CustomFieldErrors>;
  productFile?: string;
  redirectUrl?: string;
  confirmationSubject?: string;
  confirmationBody?: string;
};

function validateCustomField(f: CustomField): CustomFieldErrors | null {
  const e: CustomFieldErrors = {};
  if (f.type === "phone") {
    if (!f.label.trim()) e.label = "Enter a label for this phone field.";
  } else if (f.type === "text") {
    if (!f.label.trim()) e.label = "Short answer title is required.";
  } else if (f.type === "multiple_choice" || f.type === "dropdown" || f.type === "checkboxes") {
    if (!f.label.trim()) e.label = "Title is required.";
    const opts = f.options ?? [];
    if (opts.length < 2) e.options = "Add at least two options.";
    else if (opts.some((o) => !String(o).trim())) e.options = "Every option must have text.";
  }
  return Object.keys(e).length ? e : null;
}

function validateThumbnailStep(
  thumbnailDataUrl: string | null,
  title: string,
  subtitle: string,
  buttonText: string,
  customFields: CustomField[],
): CollectEmailsFormErrors {
  const out: CollectEmailsFormErrors = {};
  if (!thumbnailDataUrl) out.thumbnail = "Please upload a thumbnail image.";
  if (!title.trim()) out.title = "Title is required.";
  if (!subtitle.trim()) out.subtitle = "Subtitle is required.";
  if (!buttonText.trim()) out.button = "Button text is required.";
  const fieldErrors: Record<string, CustomFieldErrors> = {};
  for (const f of customFields) {
    const fe = validateCustomField(f);
    if (fe) fieldErrors[f.id] = fe;
  }
  if (Object.keys(fieldErrors).length) out.fieldErrors = fieldErrors;
  return out;
}

function thumbnailStepHasErrors(e: CollectEmailsFormErrors): boolean {
  return Boolean(e.thumbnail || e.title || e.subtitle || e.button || (e.fieldErrors && Object.keys(e.fieldErrors).length > 0));
}

function validateProductStep(
  delivery: "upload" | "redirect",
  uploadedFileName: string | null,
  redirectUrl: string,
): CollectEmailsFormErrors {
  const out: CollectEmailsFormErrors = {};
  if (delivery === "upload") {
    if (!uploadedFileName?.trim()) out.productFile = "Please upload a file or switch to Redirect to URL.";
  } else {
    const u = redirectUrl.trim();
    if (!u) out.redirectUrl = "Please enter a redirect URL.";
    else {
      try {
        const parsed = new URL(u);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          out.redirectUrl = "URL must use http:// or https://.";
        }
      } catch {
        out.redirectUrl = "Enter a valid URL (e.g. https://example.com).";
      }
    }
  }
  return out;
}

function productStepHasErrors(e: CollectEmailsFormErrors): boolean {
  return Boolean(e.productFile || e.redirectUrl);
}

const CONFIRMATION_SUBJECT_MAX = 200;
const CONFIRMATION_BODY_MAX = 8000;
const DEFAULT_CONFIRMATION_SUBJECT =
  "Your `Product Name` download from @`My Username`!";
const DEFAULT_CONFIRMATION_BODY = `Hi \`Customer Name\`!

Here is your download for:
\`Product File(s)\`

- @\`My Username\``;

const PERSONALIZE_CHIPS: { label: string; value: string }[] = [
  { label: "Product Name", value: "`Product Name`" },
  { label: "Customer Name", value: "`Customer Name`" },
  { label: "Product File(s)", value: "`Product File(s)`" },
  { label: "My Username", value: "`My Username`" },
];

function validateOptionsStep(subject: string, body: string): CollectEmailsFormErrors {
  const out: CollectEmailsFormErrors = {};
  if (!subject.trim()) out.confirmationSubject = "Confirmation email subject is required.";
  const bodyTrim = body.trim();
  if (!bodyTrim) out.confirmationBody = "Confirmation email body is required.";
  else if (!body.includes("Product File(s)")) {
    out.confirmationBody =
      "Include the Product File(s) placeholder so buyers know how to access their download.";
  }
  return out;
}

function optionsStepHasErrors(e: CollectEmailsFormErrors): boolean {
  return Boolean(e.confirmationSubject || e.confirmationBody);
}

function insertIntoTextarea(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string,
): { next: string; caret: number } {
  const next = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  return { next, caret: selectionStart + insert.length };
}

function wrapTextareaSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string,
): { next: string; caret: number } {
  const selected = value.slice(selectionStart, selectionEnd);
  const wrapped = before + selected + after;
  const next = value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
  return { next, caret: selectionStart + wrapped.length };
}

type Props = {
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
};

const TITLE_MAX = 50;
const SUB_MAX = 100;
const BTN_MAX = 30;

/** Preview CTA — forest / sea green from reference screenshots */
const PREVIEW_CTA_BG = "#005c47";

const PREVIEW_FIELD_BG = "#f4f7fb";

/** Max phone shell height (px); width follows 9:19.5 in CSS */
const PHONE_FRAME_MAX_H = 620;

function IconProduct({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M12 12v4M10 14h4" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9z" />
    </svg>
  );
}

function IconText() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h6" />
    </svg>
  );
}

function IconMultipleChoice() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconDropdown() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M9 12l3 3 3-3" />
    </svg>
  );
}

/** Circle + chevron — matches dropdown field card in form builder reference */
function IconDropdownFieldCard() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-slate-400" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10.5 12 13.5 15 10.5" />
    </svg>
  );
}

function IconCheckbox() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 12l3 3 5-5" />
    </svg>
  );
}

const FIELD_OPTIONS: { type: FieldType; label: string; icon: React.ReactNode }[] = [
  { type: "phone", label: "Phone", icon: <IconPhone /> },
  { type: "text", label: "Text", icon: <IconText /> },
  { type: "multiple_choice", label: "Multiple choice", icon: <IconMultipleChoice /> },
  { type: "dropdown", label: "Dropdown", icon: <IconDropdown /> },
  { type: "checkboxes", label: "Checkbox", icon: <IconCheckbox /> },
];

const ACCENT = "#6366f1";

function IconTrashField() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
    </svg>
  );
}

function RequiredToggle({ value, onChange }: { value: boolean; onChange: (next: boolean) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-slate-600">Required</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${value ? "bg-indigo-500" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] ${value ? "left-4" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function defaultFieldPayload(type: FieldType): Omit<CustomField, "id"> {
  switch (type) {
    case "phone":
      return { type, label: "Phone Number", required: false };
    case "text":
      return { type, label: "", required: false };
    case "multiple_choice":
      return { type, label: "", required: false, options: ["Option 1", "Option 2"] };
    case "dropdown":
      return { type, label: "", required: false, options: ["Option 1", "Option 2"] };
    case "checkboxes":
      return { type, label: "", required: false, options: ["Option 1", "Option 2"] };
    default:
      return { type: "text", label: "", required: false };
  }
}

function FieldFooterActions({
  required,
  onRequired,
  onRemove,
}: {
  required: boolean;
  onRequired: (v: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
      <RequiredToggle value={required} onChange={onRequired} />
      <button type="button" onClick={onRemove} className="text-slate-400 transition hover:text-rose-500" aria-label="Delete field">
        <IconTrashField />
      </button>
    </div>
  );
}

function CustomFieldBuilderCard({
  field,
  errors,
  onLabel,
  onRequired,
  onRemove,
  onOptionChange,
  onAddOption,
  onRemoveOption,
}: {
  field: CustomField;
  errors?: CustomFieldErrors | null;
  onLabel: (v: string) => void;
  onRequired: (v: boolean) => void;
  onRemove: () => void;
  onOptionChange: (index: number, v: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
}) {
  if (field.type === "phone") {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <div
          className={`flex items-center justify-between gap-3 rounded-lg border bg-slate-100/90 px-3 py-3 ${
            errors?.label ? "border-rose-500 ring-1 ring-rose-200" : "border-slate-200"
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2.5 text-slate-700">
            <IconPhone />
            <input
              value={field.label}
              onChange={(e) => onLabel(e.target.value)}
              aria-invalid={Boolean(errors?.label)}
              className="min-w-0 flex-1 bg-transparent text-[15px] font-medium outline-none placeholder:text-slate-400"
              placeholder="Phone Number"
            />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <RequiredToggle value={field.required} onChange={onRequired} />
            <button type="button" onClick={onRemove} className="text-slate-400 hover:text-rose-500" aria-label="Delete field">
              <IconTrashField />
            </button>
          </div>
        </div>
        {errors?.label ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.label}</p> : null}
      </div>
    );
  }

  if (field.type === "text") {
    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <div
          className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 ${
            errors?.label ? "border-rose-500 ring-1 ring-rose-200" : "border-slate-200"
          }`}
        >
          <span className="shrink-0 text-slate-400">
            <IconText />
          </span>
          <input
            value={field.label}
            onChange={(e) => onLabel(e.target.value)}
            placeholder="Short Answer Title"
            aria-invalid={Boolean(errors?.label)}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-400"
          />
        </div>
        {errors?.label ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.label}</p> : null}
        <FieldFooterActions required={field.required} onRequired={onRequired} onRemove={onRemove} />
      </div>
    );
  }

  if (field.type === "multiple_choice" || field.type === "dropdown" || field.type === "checkboxes") {
    const titlePh =
      field.type === "multiple_choice"
        ? "Multiple choice title..."
        : field.type === "dropdown"
          ? "Dropdown title..."
          : "Checkbox title...";
    const IconOpt =
      field.type === "multiple_choice" ? (
        <IconMultipleChoice />
      ) : field.type === "dropdown" ? (
        <IconDropdownFieldCard />
      ) : (
        <IconCheckbox />
      );

    const opts = field.options ?? ["Option 1", "Option 2"];

    return (
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <div
          className={`flex items-center gap-2.5 rounded-lg border bg-white px-3 py-2.5 ${
            errors?.label ? "border-rose-500 ring-1 ring-rose-200" : "border-slate-200"
          }`}
        >
          <span className="shrink-0 text-slate-400">{IconOpt}</span>
          <input
            value={field.label}
            onChange={(e) => onLabel(e.target.value)}
            placeholder={titlePh}
            aria-invalid={Boolean(errors?.label)}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-400"
          />
        </div>
        {errors?.label ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.label}</p> : null}
        <div className="mt-3 space-y-2">
          {opts.map((opt, i) => (
            <div
              key={`${field.id}-opt-${i}`}
              className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 ${
                errors?.options && !String(opt).trim() ? "border-rose-400 ring-1 ring-rose-100" : "border-slate-200"
              }`}
            >
              <input
                value={opt}
                onChange={(e) => onOptionChange(i, e.target.value)}
                aria-invalid={Boolean(errors?.options && !String(opt).trim())}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => onRemoveOption(i)}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Remove option"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        {errors?.options ? <p className="mt-2 text-xs font-medium text-rose-600">{errors.options}</p> : null}
        <button type="button" onClick={onAddOption} className="mt-3 text-sm font-semibold" style={{ color: ACCENT }}>
          + Add Option
        </button>
        <FieldFooterActions required={field.required} onRequired={onRequired} onRemove={onRemove} />
      </div>
    );
  }

  return null;
}

function LivePreview({
  imageUrl,
  title,
  subtitle,
  buttonText,
  customFields,
}: {
  imageUrl: string | null;
  title: string;
  subtitle: string;
  buttonText: string;
  customFields: CustomField[];
}) {
  const phoneFrameStyle: CSSProperties = {
    height: `min(${PHONE_FRAME_MAX_H}px, calc(100dvh - 7rem))`,
    width: `min(286px, calc(min(${PHONE_FRAME_MAX_H}px, calc(100dvh - 7rem)) * 9 / 19.5))`,
    maxWidth: "min(286px, calc(100vw - 2.5rem))",
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-1 py-2">
      {/* 9:19.5 device shell, thick bezel — matches Stan reference proportions */}
      <div
        className="box-border flex shrink-0 flex-col overflow-hidden rounded-[2.75rem] border-[8px] border-black bg-black shadow-[0_14px_44px_rgba(0,0,0,0.22)]"
        style={phoneFrameStyle}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[1.85rem] bg-white">
          <div className="flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-2.5 py-5">
            <div className="mx-auto w-full max-w-[15.5rem] rounded-2xl border border-slate-300 bg-white px-3 py-3 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200/80">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white">
                      <IconFolder className="h-7 w-7 text-amber-500" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <h3 className="text-left text-[15px] font-bold leading-snug tracking-tight text-slate-900">
                    {title || "Your title here"}
                  </h3>
                  <p className="mt-1.5 text-left text-[13px] font-normal leading-snug text-slate-500">
                    {subtitle || "Your subtitle here"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div
                  className="rounded-lg border border-slate-200/90 px-3 py-2.5 text-[13px] text-slate-400"
                  style={{ backgroundColor: PREVIEW_FIELD_BG }}
                >
                  Enter your name
                </div>
                <div
                  className="rounded-lg border border-slate-200/90 px-3 py-2.5 text-[13px] text-slate-400"
                  style={{ backgroundColor: PREVIEW_FIELD_BG }}
                >
                  Enter your email
                </div>
                {customFields.map((f) => {
                  const opt = FIELD_OPTIONS.find((o) => o.type === f.type);
                  let line =
                    f.label ||
                    (f.type === "phone"
                      ? "Phone Number"
                      : f.type === "text"
                        ? "Short answer"
                        : opt?.label ?? "Field");
                  if ((f.type === "multiple_choice" || f.type === "dropdown" || f.type === "checkboxes") && !f.label?.trim()) {
                    line = opt?.label ?? line;
                  }
                  return (
                    <div
                      key={f.id}
                      className="rounded-lg border border-slate-200/90 px-3 py-2.5 text-[13px] text-slate-400"
                      style={{ backgroundColor: PREVIEW_FIELD_BG }}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="mt-4 w-full rounded-xl py-3 text-[11px] font-bold uppercase tracking-wide text-white"
                style={{ backgroundColor: PREVIEW_CTA_BG }}
              >
                {buttonText ? buttonText.toUpperCase() : "SUBMIT & DOWNLOAD"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CollectEmailsClient({ displayName, handle, showName, onSignOut }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>("thumbnail");
  const [title, setTitle] = useState("Get My FREE Guide Now!");
  const [subtitle, setSubtitle] = useState("Join my email list and never miss an update from me!");
  const [buttonText, setButtonText] = useState("SUBMIT & DOWNLOAD");
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [delivery, setDelivery] = useState<"upload" | "redirect">("upload");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [emailFlowsOpen, setEmailFlowsOpen] = useState(true);
  const [confirmationOpen, setConfirmationOpen] = useState(true);
  const [emailFlowIds, setEmailFlowIds] = useState<string[]>([]);
  const [confirmationSubject, setConfirmationSubject] = useState(DEFAULT_CONFIRMATION_SUBJECT);
  const [confirmationBody, setConfirmationBody] = useState(DEFAULT_CONFIRMATION_BODY);
  const [formErrors, setFormErrors] = useState<CollectEmailsFormErrors>({});
  const [productId, setProductId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);
  const confirmationSubjectRef = useRef<HTMLInputElement>(null);
  const confirmationBodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const id = searchParams.get("id");
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!id || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_PRODUCTS_BASE}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !(data as { product?: Record<string, unknown> }).product) {
          throw new Error((data as { message?: string }).message || "Could not load product.");
        }
        if (cancelled) return;
        const p = (data as { product: Record<string, unknown> }).product;
        setProductId(typeof p.id === "string" ? p.id : null);
        setTitle(typeof p.title === "string" ? p.title : "");
        setSubtitle(typeof p.subtitle === "string" ? p.subtitle : "");
        setButtonText(typeof p.button_text === "string" ? p.button_text : "SUBMIT & DOWNLOAD");
        setThumbnailDataUrl(typeof p.thumbnail_url === "string" ? p.thumbnail_url : null);
        const cj = (p.checkout_json || {}) as {
          digital_delivery?: "upload" | "redirect";
          digital_file_name?: string;
          digital_redirect_url?: string;
        };
        if (cj.digital_delivery === "upload" || cj.digital_delivery === "redirect") {
          setDelivery(cj.digital_delivery);
        }
        setUploadedFileName(typeof cj.digital_file_name === "string" ? cj.digital_file_name : null);
        setRedirectUrl(typeof cj.digital_redirect_url === "string" ? cj.digital_redirect_url : "");
        const oj = (p.options_json || {}) as {
          custom_fields?: CustomField[];
          confirmation_email?: { subject?: string; body?: string };
          email_flows?: { id?: string }[];
        };
        if (Array.isArray(oj.custom_fields)) {
          const hydrated = oj.custom_fields
            .filter((f) => f && typeof f === "object")
            .map((f) => ({
              id:
                typeof f.id === "string" && f.id
                  ? f.id
                  : typeof crypto !== "undefined" && "randomUUID" in crypto
                    ? crypto.randomUUID()
                    : `field-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              type: (f.type as FieldType) || "text",
              label: typeof f.label === "string" ? f.label : "",
              required: Boolean(f.required),
              options: Array.isArray(f.options)
                ? f.options.map((x) => String(x))
                : undefined,
            }));
          setCustomFields(hydrated);
        } else {
          setCustomFields([]);
        }
        const ce = oj.confirmation_email;
        setConfirmationSubject(typeof ce?.subject === "string" ? ce.subject : DEFAULT_CONFIRMATION_SUBJECT);
        setConfirmationBody(typeof ce?.body === "string" ? ce.body : DEFAULT_CONFIRMATION_BODY);
        setEmailFlowIds(
          Array.isArray(oj.email_flows)
            ? oj.email_flows.map((x) => String(x?.id || "")).filter(Boolean)
            : []
        );
        const active = typeof p.active_tab === "string" ? p.active_tab : "thumbnail";
        setActiveTab(active === "checkout" ? "product" : active === "options" ? "options" : "thumbnail");
        setFormErrors({});
      } catch (e) {
        if (!cancelled) setSaveMsg(e instanceof Error ? e.message : "Could not load product.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  const onPickThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setThumbnailFileName(file.name);
    const r = new FileReader();
    r.onload = () => {
      setThumbnailDataUrl(r.result as string);
      setFormErrors((prev) => ({ ...prev, thumbnail: undefined }));
    };
    r.readAsDataURL(file);
  };

  const clearFieldBuilderError = (fieldId: string) => {
    setFormErrors((prev) => {
      if (!prev.fieldErrors?.[fieldId]) return prev;
      const next = { ...prev.fieldErrors };
      delete next[fieldId];
      return { ...prev, fieldErrors: Object.keys(next).length ? next : undefined };
    });
  };

  const addField = (type: FieldType) => {
    const payload = defaultFieldPayload(type);
    setCustomFields((prev) => [...prev, { id: crypto.randomUUID(), ...payload }]);
    setDropdownOpen(false);
  };

  const updateFieldLabel = (id: string, label: string) => {
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)));
    clearFieldBuilderError(id);
  };

  const updateFieldRequired = (id: string, required: boolean) => {
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, required } : f)));
    clearFieldBuilderError(id);
  };

  const updateFieldOption = (fieldId: string, optionIndex: number, value: string) => {
    setCustomFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId || !f.options) return f;
        const options = f.options.map((o, i) => (i === optionIndex ? value : o));
        return { ...f, options };
      }),
    );
    clearFieldBuilderError(fieldId);
  };

  const addFieldOption = (fieldId: string) => {
    setCustomFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId || !f.options) return f;
        return { ...f, options: [...f.options, `Option ${f.options.length + 1}`] };
      }),
    );
    clearFieldBuilderError(fieldId);
  };

  const removeFieldOption = (fieldId: string, optionIndex: number) => {
    setCustomFields((prev) =>
      prev.map((f) => {
        if (f.id !== fieldId || !f.options) return f;
        const options = f.options.filter((_, i) => i !== optionIndex);
        return { ...f, options: options.length ? options : [""] };
      }),
    );
    clearFieldBuilderError(fieldId);
  };

  const removeField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    clearFieldBuilderError(id);
  };

  const goToProductTab = () => {
    const e = validateThumbnailStep(thumbnailDataUrl, title, subtitle, buttonText, customFields);
    if (thumbnailStepHasErrors(e)) {
      setFormErrors((prev) => ({
        ...prev,
        thumbnail: e.thumbnail,
        title: e.title,
        subtitle: e.subtitle,
        button: e.button,
        fieldErrors: e.fieldErrors,
      }));
      return;
    }
    setFormErrors((prev) => ({
      ...prev,
      thumbnail: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
      fieldErrors: undefined,
    }));
    setActiveTab("product");
  };

  const goToOptionsTab = () => {
    const e = validateProductStep(delivery, uploadedFileName, redirectUrl);
    if (productStepHasErrors(e)) {
      setFormErrors((prev) => ({
        ...prev,
        productFile: e.productFile,
        redirectUrl: e.redirectUrl,
      }));
      return;
    }
    setFormErrors((prev) => ({
      ...prev,
      productFile: undefined,
      redirectUrl: undefined,
    }));
    setActiveTab("options");
  };

  const validateOptionsNow = () => {
    const e = validateOptionsStep(confirmationSubject, confirmationBody);
    if (optionsStepHasErrors(e)) {
      setFormErrors((prev) => ({ ...prev, ...e }));
      return false;
    }
    setFormErrors((prev) => ({ ...prev, confirmationSubject: undefined, confirmationBody: undefined }));
    return true;
  };

  const handleSaveDraft = async () => {
    const ok = await saveToApi("draft");
    if (!ok) return;
    setSaveMsg("Draft saved.");
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handlePublish = async () => {
    const thumbErrors = validateThumbnailStep(
      thumbnailDataUrl,
      title,
      subtitle,
      buttonText,
      customFields
    );
    const productErrors = validateProductStep(delivery, uploadedFileName, redirectUrl);
    const optionsErrors = validateOptionsStep(confirmationSubject, confirmationBody);
    const e: CollectEmailsFormErrors = {
      ...thumbErrors,
      ...productErrors,
      ...optionsErrors,
    };

    if (
      thumbnailStepHasErrors(thumbErrors) ||
      productStepHasErrors(productErrors) ||
      optionsStepHasErrors(optionsErrors)
    ) {
      setFormErrors((prev) => ({ ...prev, ...e }));
      if (thumbnailStepHasErrors(thumbErrors)) setActiveTab("thumbnail");
      else if (productStepHasErrors(productErrors)) setActiveTab("product");
      else setActiveTab("options");
      return;
    }

    setFormErrors((prev) => ({
      ...prev,
      thumbnail: undefined,
      title: undefined,
      subtitle: undefined,
      button: undefined,
      fieldErrors: undefined,
      productFile: undefined,
      redirectUrl: undefined,
      confirmationSubject: undefined,
      confirmationBody: undefined,
    }));

    const ok = await saveToApi("published");
    if (!ok) return;
    setSaveMsg("Published! Redirecting to My Store...");
    window.setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const insertSubjectToken = (token: string) => {
    const el = confirmationSubjectRef.current;
    const v = confirmationSubject;
    const start = el?.selectionStart ?? v.length;
    const end = el?.selectionEnd ?? start;
    const { next, caret } = insertIntoTextarea(v, start, end, token);
    setConfirmationSubject(next.slice(0, CONFIRMATION_SUBJECT_MAX));
    setFormErrors((p) => ({ ...p, confirmationSubject: undefined }));
    queueMicrotask(() => {
      const ref = confirmationSubjectRef.current;
      if (ref) {
        ref.focus();
        ref.setSelectionRange(caret, caret);
      }
    });
  };

  const insertBodyToken = (token: string) => {
    const el = confirmationBodyRef.current;
    const v = confirmationBody;
    const start = el?.selectionStart ?? v.length;
    const end = el?.selectionEnd ?? start;
    const { next, caret } = insertIntoTextarea(v, start, end, token);
    setConfirmationBody(next.slice(0, CONFIRMATION_BODY_MAX));
    setFormErrors((p) => ({ ...p, confirmationBody: undefined }));
    queueMicrotask(() => {
      const ref = confirmationBodyRef.current;
      if (ref) {
        ref.focus();
        ref.setSelectionRange(caret, caret);
      }
    });
  };

  const wrapBodySelection = (before: string, after: string) => {
    const el = confirmationBodyRef.current;
    const v = confirmationBody;
    const start = el?.selectionStart ?? 0;
    const end = el?.selectionEnd ?? start;
    const { next, caret } = wrapTextareaSelection(v, start, end, before, after);
    setConfirmationBody(next.slice(0, CONFIRMATION_BODY_MAX));
    setFormErrors((p) => ({ ...p, confirmationBody: undefined }));
    queueMicrotask(() => {
      const ref = confirmationBodyRef.current;
      if (ref) {
        ref.focus();
        ref.setSelectionRange(caret, caret);
      }
    });
  };

  const tabClass = (t: TabKey) =>
    `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
      activeTab === t
        ? "border-transparent text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
    }`;

  const saveToApi = async (saveStatus: "draft" | "published"): Promise<boolean> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    if (!token) {
      setSaveMsg("Please log in again.");
      return false;
    }
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch(`${API_PRODUCTS_BASE}/draft`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: productId || undefined,
          status: saveStatus,
          active_tab: activeTab === "product" ? "checkout" : activeTab,
          style: "callout",
          title: title.slice(0, TITLE_MAX),
          subtitle: subtitle.slice(0, SUB_MAX),
          button_text: buttonText.slice(0, BTN_MAX),
          price_numeric: 9.99,
          thumbnail_url: thumbnailDataUrl,
          checkout_json: {
            digital_delivery: delivery,
            digital_file_name: uploadedFileName,
            digital_redirect_url: redirectUrl,
          },
          options_json: {
            collect_emails: true,
            custom_fields: customFields,
            confirmation_email: {
              subject: confirmationSubject.slice(0, CONFIRMATION_SUBJECT_MAX),
              body: confirmationBody.slice(0, CONFIRMATION_BODY_MAX),
            },
            email_flows: emailFlowIds.map((id) => ({ id })),
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { message?: string }).message || "Save failed.");
      const p = (data as { product?: { id?: string } }).product;
      if (p?.id) setProductId(p.id);
      return true;
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Save failed.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      displayName={displayName}
      handle={handle}
      showName={showName}
      onSignOut={onSignOut}
      navContext="add-product"
      preview={
        <LivePreview
          imageUrl={thumbnailDataUrl}
          title={title}
          subtitle={subtitle}
          buttonText={buttonText}
          customFields={customFields}
        />
      }
      topLeft={
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/store/product/add" className="flex items-center gap-1 text-slate-500 hover:text-slate-800" aria-label="Back">
            <IconChevronLeft />
          </Link>
          <nav className="flex flex-wrap items-center gap-2 text-[15px]">
            <Link href="/dashboard" className="font-medium text-slate-500 hover:text-slate-800">My Store</Link>
            <span className="text-slate-400">/</span>
            <Link href="/dashboard/store/product/add" className="font-medium text-slate-500 hover:text-slate-800">Add a new product</Link>
            <span className="text-slate-400">/</span>
            <span className="font-bold text-slate-900">Collect Emails</span>
          </nav>
        </div>
      }
    >
      <input ref={thumbnailFileRef} type="file" className="hidden" accept="image/*" onChange={onPickThumbnail} aria-hidden />
      {saveMsg ? (
        <p className="mt-4 text-sm font-medium text-emerald-600" role="status">
          {saveMsg}
        </p>
      ) : null}

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap" style={{ gap: "7px" }}>
        <button
          type="button"
          className={tabClass("thumbnail")}
          style={activeTab === "thumbnail" ? { backgroundColor: PURPLE } : undefined}
          onClick={() => setActiveTab("thumbnail")}
        >
          <IconStoreTab className={activeTab === "thumbnail" ? "text-white" : "text-slate-500"} />
          Thumbnail
        </button>
        <button
          type="button"
          className={tabClass("product")}
          style={activeTab === "product" ? { backgroundColor: PURPLE } : undefined}
          onClick={() => setActiveTab("product")}
        >
          <IconProduct className={activeTab === "product" ? "text-white" : "text-slate-500"} />
          Product
        </button>
        <button
          type="button"
          className={tabClass("options")}
          style={activeTab === "options" ? { backgroundColor: PURPLE } : undefined}
          onClick={() => setActiveTab("options")}
        >
          <IconSliders className={activeTab === "options" ? "text-white" : "text-slate-500"} />
          Options
        </button>
      </div>

      {activeTab === "thumbnail" ? (
        <div className="mt-8 space-y-10">

          {/* 1. Select image */}
          <section>
            <h2 className="text-base font-bold text-slate-900">
              1<span className="ml-2 font-semibold">Select image</span>
            </h2>
            <div
              className={`mt-4 flex flex-col gap-4 rounded-2xl border border-dashed bg-white p-4 sm:flex-row sm:items-center ${
                formErrors.thumbnail ? "border-rose-400 ring-1 ring-rose-100" : "border-slate-300"
              }`}
            >
              <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200">
                {thumbnailDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailDataUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <IconFolder className="h-14 w-14 text-amber-500" />
                )}
                <button
                  type="button"
                  className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-violet-600 shadow"
                  aria-label="Change image"
                  onClick={() => thumbnailFileRef.current?.click()}
                >
                  <IconPencil />
                </button>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <p className="text-xs font-semibold text-slate-700">Thumbnail</p>
                <p className="text-xs text-slate-400">400 x 400</p>
                {thumbnailFileName && (
                  <p className="truncate text-xs text-slate-500">{thumbnailFileName}</p>
                )}
                <button
                  type="button"
                  onClick={() => thumbnailFileRef.current?.click()}
                  className="mt-1 rounded-lg border-2 border-slate-900 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-slate-50"
                >
                  Choose Image
                </button>
              </div>
            </div>
            {formErrors.thumbnail ? <p className="text-xs font-medium text-rose-600">{formErrors.thumbnail}</p> : null}
          </section>

          {/* 2. Add text */}
          <section>
            <h2 className="text-base font-bold text-slate-900">
              2<span className="ml-2 font-semibold">Add text</span>
            </h2>
            <div className="mt-4 space-y-5">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="em-title" className="text-sm font-semibold text-slate-800">Title</label>
                  <span className="text-xs text-slate-400">{title.length}/{TITLE_MAX}</span>
                </div>
                <input
                  id="em-title"
                  value={title}
                  maxLength={TITLE_MAX}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setFormErrors((p) => ({ ...p, title: undefined }));
                  }}
                  aria-invalid={Boolean(formErrors.title)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    formErrors.title
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {formErrors.title ? <p className="mt-1.5 text-xs font-medium text-rose-600">{formErrors.title}</p> : null}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="em-subtitle" className="text-sm font-semibold text-slate-800">Subtitle</label>
                  <span className="text-xs text-slate-400">{subtitle.length}/{SUB_MAX}</span>
                </div>
                <input
                  id="em-subtitle"
                  value={subtitle}
                  maxLength={SUB_MAX}
                  onChange={(e) => {
                    setSubtitle(e.target.value);
                    setFormErrors((p) => ({ ...p, subtitle: undefined }));
                  }}
                  aria-invalid={Boolean(formErrors.subtitle)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    formErrors.subtitle
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {formErrors.subtitle ? <p className="mt-1.5 text-xs font-medium text-rose-600">{formErrors.subtitle}</p> : null}
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label htmlFor="em-btn" className="text-sm font-semibold text-slate-800">
                    Button<span className="text-rose-500">*</span>
                  </label>
                  <span className="text-xs text-slate-400">{buttonText.length}/{BTN_MAX}</span>
                </div>
                <input
                  id="em-btn"
                  value={buttonText}
                  maxLength={BTN_MAX}
                  onChange={(e) => {
                    setButtonText(e.target.value);
                    setFormErrors((p) => ({ ...p, button: undefined }));
                  }}
                  aria-invalid={Boolean(formErrors.button)}
                  className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                    formErrors.button
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                      : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                  }`}
                />
                {formErrors.button ? <p className="mt-1.5 text-xs font-medium text-rose-600">{formErrors.button}</p> : null}
              </div>
            </div>
          </section>

          {/* 3. Collect info */}
          <section>
            <h2 className="text-base font-bold text-slate-900">
              3<span className="ml-2 font-semibold">Collect info</span>
            </h2>
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">Fields</p>
              <p className="text-xs text-slate-500">Basic info fields can&apos;t be edited</p>

              {/* Fixed fields */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
                <input disabled readOnly value="Name" className="flex-1 cursor-not-allowed bg-transparent text-[15px] outline-none" />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="M2 7l10 7 10-7" />
                </svg>
                <input disabled readOnly value="Email" className="flex-1 cursor-not-allowed bg-transparent text-[15px] outline-none" />
              </div>

              <hr className="border-slate-200" />

              <p className="text-sm text-slate-500">Collect additional customer info</p>

              {/* Dynamic custom fields — form-builder style cards */}
              <div className="space-y-4">
                {customFields.map((field) => (
                  <CustomFieldBuilderCard
                    key={field.id}
                    field={field}
                    errors={formErrors.fieldErrors?.[field.id]}
                    onLabel={(v) => updateFieldLabel(field.id, v)}
                    onRequired={(v) => updateFieldRequired(field.id, v)}
                    onRemove={() => removeField(field.id)}
                    onOptionChange={(i, v) => updateFieldOption(field.id, i, v)}
                    onAddOption={() => addFieldOption(field.id)}
                    onRemoveOption={(i) => removeFieldOption(field.id, i)}
                  />
                ))}
              </div>

              {/* Add Field button + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-500 bg-white px-4 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add Field
                </button>

                {dropdownOpen && (
                  <div className="absolute left-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg">
                    {FIELD_OPTIONS.map((opt) => (
                      <button
                        key={opt.type}
                        type="button"
                        onClick={() => addField(opt.type)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <span className="text-slate-400">{opt.icon}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      ) : activeTab === "product" ? (
        <div className="mt-8 space-y-6">
          <input
            ref={uploadFileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadedFileName(file.name);
                setFormErrors((p) => ({ ...p, productFile: undefined }));
              }
              e.target.value = "";
            }}
            aria-hidden
          />

          {/* Heading + toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Upload Attachment &amp; Files</h2>
            <div className="flex overflow-hidden rounded-lg border border-slate-200" style={{ gap: "5px", marginTop: "10px" }}>
              <button
                type="button"
                onClick={() => {
                  setDelivery("upload");
                  setFormErrors((p) => ({ ...p, redirectUrl: undefined }));
                }}
                className="px-4 py-2 text-sm font-semibold transition"
                style={delivery === "upload" ? { backgroundColor: "#2563eb", color: "#fff" } : { backgroundColor: "transparent", color: "#475569" }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setDelivery("redirect");
                  setFormErrors((p) => ({ ...p, productFile: undefined }));
                }}
                className="px-4 py-2 text-sm font-semibold transition"
                style={delivery === "redirect" ? { backgroundColor: "#2563eb", color: "#fff" } : { backgroundColor: "transparent", color: "#475569" }}
              >
                Redirect to URL
              </button>
            </div>
          </div>

          {/* Upload box */}
          {delivery === "upload" ? (
            <div>
              <div
                className={`flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed bg-slate-50/80 px-6 py-10 ${
                  formErrors.productFile ? "border-rose-400 ring-1 ring-rose-100" : "border-slate-200"
                }`}
              >
                <p className="text-sm font-medium text-slate-500">
                  {uploadedFileName ?? "Drag Your File(s) Here"}
                </p>
                <button
                  type="button"
                  onClick={() => uploadFileRef.current?.click()}
                  className="rounded-lg border-2 px-6 py-2.5 text-sm font-bold transition hover:bg-blue-50"
                  style={{ borderColor: "#2563eb", color: "#2563eb" }}
                >
                  Upload
                </button>
              </div>
              {formErrors.productFile ? <p className="mt-2 text-xs font-medium text-rose-600">{formErrors.productFile}</p> : null}
            </div>
          ) : (
            <div className="mt-2">
              <label className="text-sm font-semibold text-slate-800" htmlFor="redirect-url">
                Redirect URL
              </label>
              <input
                id="redirect-url"
                type="url"
                placeholder="https://"
                value={redirectUrl}
                onChange={(e) => {
                  setRedirectUrl(e.target.value);
                  setFormErrors((p) => ({ ...p, redirectUrl: undefined }));
                }}
                aria-invalid={Boolean(formErrors.redirectUrl)}
                className={`mt-1 w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:ring-2 ${
                  formErrors.redirectUrl
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-100"
                    : "border-slate-200 focus:border-violet-400 focus:ring-violet-100"
                }`}
              />
              {formErrors.redirectUrl ? <p className="mt-1.5 text-xs font-medium text-rose-600">{formErrors.redirectUrl}</p> : null}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setEmailFlowsOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="flex items-center gap-3">
                <span className="text-base font-bold text-slate-900">Email Flows</span>
              </span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${emailFlowsOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {emailFlowsOpen ? (
              <div className="border-t border-slate-100 px-5 pb-5 pt-2">
                <div className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/90 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">Add an Email Flow</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Send an automatic email drip to your customers when this product is purchased.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const id =
                        typeof crypto !== "undefined" && "randomUUID" in crypto
                          ? crypto.randomUUID()
                          : `flow-${Date.now()}`;
                      setEmailFlowIds((ids) => [...ids, id]);
                    }}
                    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-95"
                    style={{ backgroundColor: PURPLE }}
                  >
                    <IconPlusSm className="text-white" />
                    Add Flow
                  </button>
                </div>
                {emailFlowIds.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {emailFlowIds.map((fid, i) => (
                      <li
                        key={fid}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        <span className="font-medium text-slate-800">Email flow {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => setEmailFlowIds((ids) => ids.filter((x) => x !== fid))}
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,.06)]">
            <button
              type="button"
              onClick={() => setConfirmationOpen((o) => !o)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left transition hover:bg-slate-50/80"
            >
              <span className="text-base font-bold text-slate-900">Confirmation Email</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`shrink-0 text-slate-400 transition ${confirmationOpen ? "rotate-180" : ""}`}
                aria-hidden
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {confirmationOpen ? (
              <div className="space-y-5 border-t border-slate-100 px-5 pb-5 pt-4">
                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="conf-subject">
                      Subject
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmationSubject(DEFAULT_CONFIRMATION_SUBJECT);
                        setFormErrors((p) => ({ ...p, confirmationSubject: undefined }));
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Restore Default
                    </button>
                  </div>
                  <input
                    ref={confirmationSubjectRef}
                    id="conf-subject"
                    value={confirmationSubject}
                    maxLength={CONFIRMATION_SUBJECT_MAX}
                    onChange={(e) => {
                      setConfirmationSubject(e.target.value);
                      setFormErrors((p) => ({ ...p, confirmationSubject: undefined }));
                    }}
                    onBlur={validateOptionsNow}
                    aria-invalid={Boolean(formErrors.confirmationSubject)}
                    className={`w-full rounded-xl border px-4 py-3 text-[15px] outline-none focus:border-violet-400 ${
                      formErrors.confirmationSubject ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                    }`}
                  />
                  {formErrors.confirmationSubject ? (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">{formErrors.confirmationSubject}</p>
                  ) : null}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {PERSONALIZE_CHIPS.map((chip) => (
                      <button
                        key={`sub-${chip.label}`}
                        type="button"
                        onClick={() => insertSubjectToken(chip.value)}
                        className="rounded-lg border border-violet-200 bg-violet-50/80 px-2 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="conf-body">
                      Body
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmationBody(DEFAULT_CONFIRMATION_BODY);
                        setFormErrors((p) => ({ ...p, confirmationBody: undefined }));
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Restore Default
                    </button>
                  </div>
                  <div
                    className={`overflow-hidden rounded-xl border ${
                      formErrors.confirmationBody ? "border-rose-500 ring-1 ring-rose-100" : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1 border-b border-violet-100 bg-violet-50/60 px-2 py-2">
                      {(
                        [
                          { label: "H", wrap: ["### ", ""] },
                          { label: "B", wrap: ["**", "**"] },
                          { label: "S", wrap: ["~~", "~~"] },
                          { label: "I", wrap: ["*", "*"] },
                        ] as const
                      ).map((t) => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => wrapBodySelection(t.wrap[0], t.wrap[1])}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-slate-700 hover:bg-white"
                        >
                          {t.label}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => insertBodyToken("\n- ")}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                      >
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertBodyToken("[link text](https://)")}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-white"
                      >
                        Link
                      </button>
                      <details className="relative ml-auto">
                        <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50 [&::-webkit-details-marker]:hidden">
                          <IconPlusSm className="h-3.5 w-3.5 text-violet-600" />
                          Personalize
                        </summary>
                        <div className="absolute right-0 z-10 mt-1 min-w-[11rem] rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                          {PERSONALIZE_CHIPS.map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => insertBodyToken(chip.value)}
                              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-violet-50"
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                    <textarea
                      ref={confirmationBodyRef}
                      id="conf-body"
                      value={confirmationBody}
                      maxLength={CONFIRMATION_BODY_MAX}
                      onChange={(e) => {
                        setConfirmationBody(e.target.value);
                        setFormErrors((p) => ({ ...p, confirmationBody: undefined }));
                      }}
                      onBlur={validateOptionsNow}
                      rows={12}
                      aria-invalid={Boolean(formErrors.confirmationBody)}
                      className="w-full resize-y border-0 bg-white px-4 py-3 text-[15px] outline-none focus:ring-0"
                    />
                  </div>
                  {formErrors.confirmationBody ? (
                    <p className="mt-1.5 text-xs font-medium text-rose-600">{formErrors.confirmationBody}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Bottom actions */}
      <div className="mt-10 border-t border-slate-100 pt-8">
        <div className="mb-3 flex justify-end">
          <button type="button" className="text-sm italic text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline">
            Improve this page
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSaveDraft()}
            className="inline-flex items-center justify-center gap-2 border-2 bg-white px-6 py-3 text-sm font-bold transition disabled:opacity-50"
            style={{ borderColor: PURPLE, color: PURPLE, borderRadius: "8px" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            Save As Draft
          </button>
          {activeTab === "thumbnail" && (
            <button
              type="button"
              onClick={goToProductTab}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              style={{ borderRadius: "8px" }}
            >
              Next
            </button>
          )}
          {activeTab === "product" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handlePublish()}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
              style={{ borderRadius: "8px" }}
            >
              Publish
            </button>
          )}
          {activeTab === "options" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handlePublish()}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400 disabled:opacity-50"
              style={{ borderRadius: "8px" }}
            >
              Publish
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
