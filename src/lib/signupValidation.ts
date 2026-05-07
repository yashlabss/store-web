import parsePhoneNumberFromString from "libphonenumber-js";

/** Letters (any language) and spaces only — for full name. */
const NAME_ONLY = /^[\p{L}\s]+$/u;

export function validateUsername(raw: string): string | undefined {
  const u = raw.trim();
  if (!u) return "Username is required.";
  if (/\s/.test(raw)) return "Username cannot contain spaces.";
  if (u.length < 3 || u.length > 32)
    return "Username must be between 3 and 32 characters.";
  return undefined;
}

export function validateFullName(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return "Full name is required.";
  if (!NAME_ONLY.test(raw)) {
    return "Use only letters and spaces (no numbers or special characters).";
  }
  return undefined;
}

/** Name on public store lead forms — allows hyphens and apostrophes. */
const LEAD_DISPLAY_NAME = /^[\p{L}\s'.-]+$/u;

export function validateLeadDisplayName(raw: string): string | undefined {
  const t = raw.trim();
  if (!t) return "Please enter your name.";
  if (t.length < 2) return "Name must be at least 2 characters.";
  if (t.length > 120) return "Name must be at most 120 characters.";
  if (!LEAD_DISPLAY_NAME.test(t)) {
    return "Use only letters, spaces, hyphens, and apostrophes.";
  }
  return undefined;
}

/**
 * Remove all whitespace (start, middle, end). Uses Unicode-aware `\s` (with `u`)
 * plus explicit separators some browsers still let through in `type="email"` fields.
 */
export function sanitizeEmailInput(value: string): string {
  return value
    .replace(/\s/gu, "")
    .replace(/[\uFEFF\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\u200B-\u200D\u2060]/g, "");
}

/** Practical email check — no spaces, must look like a valid address. */
export function validateEmail(raw: string): string | undefined {
  const t = sanitizeEmailInput(raw);
  if (!t) return "Email is required.";
  if (t.length > 254) return "Email is too long.";
  const local = t.split("@")[0];
  const domain = t.split("@")[1];
  if (!local || !domain || t.split("@").length !== 2)
    return "Enter a valid email address.";
  if (local.startsWith(".") || local.endsWith("."))
    return "Enter a valid email address.";
  if (!domain.includes(".")) return "Enter a valid email address.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t))
    return "Enter a valid email address.";
  return undefined;
}

export function validatePhone(
  nationalDigitsOnly: string,
  dialPrefix: string
): string | undefined {
  const digits = nationalDigitsOnly.replace(/\D/g, "");
  if (!digits) return "Phone number is required.";
  const dial = dialPrefix.trim();
  if (!dial.startsWith("+")) return "Invalid country code.";
  const full = `${dial}${digits}`;
  const parsed = parsePhoneNumberFromString(full);
  if (!parsed || !parsed.isValid()) {
    return "Enter a valid phone number for the selected country.";
  }
  return undefined;
}

function parseLeadPhoneFreeform(raw: string) {
  const t = raw.trim();
  if (!t) return undefined;
  let parsed = parsePhoneNumberFromString(t);
  if (parsed?.isValid()) return parsed;
  for (const region of ["IN", "US", "GB", "AU"] as const) {
    parsed = parsePhoneNumberFromString(t, region);
    if (parsed?.isValid()) return parsed;
  }
  return undefined;
}

/** Phone typed in a single field (with or without +country). Used on public store lead forms. */
export function validateLeadPhoneFreeform(raw: string): string | undefined {
  if (!raw.trim()) return "Phone number is required.";
  if (!parseLeadPhoneFreeform(raw)) {
    return "Enter a valid phone number (include country code, e.g. +91…).";
  }
  return undefined;
}

export function normalizeLeadPhoneFreeform(raw: string): string | null {
  const parsed = parseLeadPhoneFreeform(raw);
  return parsed?.format("E.164") ?? null;
}

export function validatePassword(p: string): string | undefined {
  if (!p) return "Password is required.";
  if (/\s/.test(p)) return "Password cannot contain spaces.";
  if (p.length < 4 || p.length > 8)
    return "Password must be between 4 and 8 characters.";
  if (!/[a-z]/.test(p))
    return "Password must include a lowercase letter.";
  if (!/[A-Z]/.test(p))
    return "Password must include an uppercase letter.";
  if (!/\d/.test(p)) return "Password must include a number.";
  if (!/[^A-Za-z0-9]/.test(p))
    return "Password must include a special character.";
  return undefined;
}
