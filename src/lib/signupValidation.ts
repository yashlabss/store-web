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
  if (dial !== "+91") return "Only Indian mobile numbers are supported.";
  if (digits.length !== 10) return "For India (+91), phone number must be exactly 10 digits.";
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return "Indian mobile number must start with 6, 7, 8, or 9.";
  }
  const full = `${dial}${digits}`;
  const parsed = parsePhoneNumberFromString(full);
  if (!parsed || !parsed.isValid()) {
    return "Enter a valid Indian mobile number.";
  }
  return undefined;
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
