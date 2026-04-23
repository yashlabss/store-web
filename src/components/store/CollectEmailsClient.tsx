"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import DashboardShell, { PURPLE } from "../dashboard/DashboardShell";
import {
  IconChevronLeft,
  IconFolder,
  IconPencil,
  IconSliders,
  IconStoreTab,
} from "../dashboard/dashboardIcons";

type TabKey = "thumbnail" | "product" | "options";
type FieldType = "phone" | "text" | "multiple_choice" | "dropdown" | "checkboxes";

type CustomField = {
  id: string;
  type: FieldType;
  label: string;
};

type Props = {
  displayName: string;
  handle: string;
  showName: string;
  onSignOut: () => void;
};

const TITLE_MAX = 50;
const SUB_MAX = 100;
const BTN_MAX = 30;

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
  { type: "checkboxes", label: "Checkboxes", icon: <IconCheckbox /> },
];

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
  return (
    <div className="flex h-full items-center justify-center">
    <div className="w-full max-w-[260px]">
      <div className="overflow-hidden rounded-2xl border-[6px] border-black bg-white shadow-xl">
        <div className="max-h-[540px] overflow-y-auto px-4 pb-6 pt-4">
          {/* Thumbnail */}
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-36 w-full object-cover" />
            ) : (
              <div className="flex h-36 w-full items-center justify-center bg-slate-200">
                <IconFolder className="h-14 w-14 text-slate-400" />
              </div>
            )}
          </div>

          {/* Title & subtitle */}
          <h3 className="mt-4 text-center text-[16px] font-bold leading-snug text-slate-900">
            {title || "Your title here"}
          </h3>
          <p className="mt-1.5 text-center text-sm text-slate-500">
            {subtitle || "Your subtitle here"}
          </p>

          {/* Fields */}
          <div className="mt-4 space-y-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
              Name
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
              Email
            </div>
            {customFields.map((f) => {
              const opt = FIELD_OPTIONS.find((o) => o.type === f.type);
              return (
                <div key={f.id} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-400">
                  {f.label || opt?.label || f.type}
                </div>
              );
            })}
          </div>

          {/* CTA button */}
          <button
            type="button"
            className="mt-4 w-full rounded-full py-3 text-[14px] font-bold text-white"
            style={{ backgroundColor: PURPLE }}
          >
            {buttonText || "Submit"}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

export default function CollectEmailsClient({ displayName, handle, showName, onSignOut }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("thumbnail");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);
  const [thumbnailFileName, setThumbnailFileName] = useState<string | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [delivery, setDelivery] = useState<"upload" | "redirect">("upload");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const onPickThumbnail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setThumbnailFileName(file.name);
    const r = new FileReader();
    r.onload = () => setThumbnailDataUrl(r.result as string);
    r.readAsDataURL(file);
  };

  const addField = (type: FieldType) => {
    setCustomFields((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, label: "" },
    ]);
    setDropdownOpen(false);
  };

  const updateFieldLabel = (id: string, label: string) => {
    setCustomFields((prev) => prev.map((f) => (f.id === id ? { ...f, label } : f)));
  };

  const removeField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  const tabClass = (t: TabKey) =>
    `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${
      activeTab === t
        ? "border-transparent text-white shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
    }`;

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

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap" style={{ gap: "7px" }}>
        <button
          type="button"
          className={tabClass("thumbnail")}
          style={activeTab === "thumbnail" ? { backgroundColor: PURPLE } : undefined}
          onClick={() => setActiveTab("thumbnail")}
        >
          <IconStoreTab className={activeTab === "thumbnail" ? "text-white" : "text-[#6b46ff]"} />
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
            <div className="mt-4 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center">
              <div className="relative flex h-[120px] w-[120px] shrink-0 items-center justify-center rounded-xl bg-[#dbeafe]">
                {thumbnailDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumbnailDataUrl} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  <IconFolder className="h-14 w-14" />
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
                  className="mt-1 rounded-lg border-2 px-3 py-1.5 text-xs font-bold"
                  style={{ borderColor: PURPLE, color: PURPLE }}
                >
                  Choose Image
                </button>
              </div>
            </div>
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
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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
                  onChange={(e) => setButtonText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
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

              {/* Dynamic custom fields */}
              {customFields.map((field) => {
                const opt = FIELD_OPTIONS.find((o) => o.type === field.type);
                return (
                  <div key={field.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <span className="shrink-0 text-slate-400">{opt?.icon}</span>
                    <input
                      value={field.label}
                      placeholder={opt?.label}
                      onChange={(e) => updateFieldLabel(field.id, e.target.value)}
                      className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-400"
                    />
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="shrink-0 text-slate-300 hover:text-rose-400"
                      aria-label="Remove field"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}

              {/* Add Field button + dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition"
                  style={{ borderColor: PURPLE, color: PURPLE }}
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
              if (file) setUploadedFileName(file.name);
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
                onClick={() => setDelivery("upload")}
                className="px-4 py-2 text-sm font-semibold transition"
                style={delivery === "upload" ? { backgroundColor: "#2563eb", color: "#fff" } : { backgroundColor: "transparent", color: "#475569" }}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setDelivery("redirect")}
                className="px-4 py-2 text-sm font-semibold transition"
                style={delivery === "redirect" ? { backgroundColor: "#2563eb", color: "#fff" } : { backgroundColor: "transparent", color: "#475569" }}
              >
                Redirect to URL
              </button>
            </div>
          </div>

          {/* Upload box */}
          {delivery === "upload" ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 py-10">
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
          ) : (
            <div className="mt-2">
              <label className="text-sm font-semibold text-slate-800" htmlFor="redirect-url">
                Redirect URL
              </label>
              <input
                id="redirect-url"
                type="url"
                placeholder="https://"
                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-[15px] outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <p className="text-sm text-slate-500">Options coming soon.</p>
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
              onClick={() => setActiveTab("product")}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              style={{ borderRadius: "8px" }}
            >
              Next
            </button>
          )}
          {activeTab === "product" && (
            <button
              type="button"
              onClick={() => setActiveTab("options")}
              className="bg-blue-600 px-12 py-3 text-sm font-bold text-white transition hover:bg-blue-400"
              style={{ borderRadius: "8px" }}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
