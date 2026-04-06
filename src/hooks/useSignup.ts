"use client";
import { useCallback, useState } from "react";

export type SignupPayload = {
  username: string;
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  password: string;
};

type UsernameAvailabilityResult = {
  available: boolean;
  message?: string;
};

type SignupResult = {
  success: boolean;
  message: string;
};

const MAIN_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";

type SignupContext = {
  searchParams?: URLSearchParams;
};

const extractTracking = (searchParams?: URLSearchParams) => {
  if (!searchParams) return {};

  const utmSource = searchParams.get("utm_source");
  const utmMedium = searchParams.get("utm_medium");
  const utmCampaign = searchParams.get("utm_campaign");
  const refUser = searchParams.get("ref");
  const discountCode = searchParams.get("code");
  const trialDays = searchParams.get("trialDays") ?? searchParams.get("trial_days");

  const trialDaysNumber = trialDays ? Number.parseInt(trialDays, 10) : undefined;
  const explicitTrialDays =
    trialDaysNumber === 14 || trialDaysNumber === 30 ? trialDaysNumber : undefined;

  const experiments: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    experiments[key] = value;
  }

  return {
    ...(utmSource ? { utm_source: utmSource } : {}),
    ...(utmMedium ? { utm_medium: utmMedium } : {}),
    ...(utmCampaign ? { utm_campaign: utmCampaign } : {}),
    ...(refUser ? { ref_user: refUser } : {}),
    ...(discountCode ? { discount_code: discountCode } : {}),
    ...(explicitTrialDays ? { explicit_trial_days: explicitTrialDays } : {}),
    ...(Object.keys(experiments).length > 0 ? { experiments } : {}),
  };
};

const parseErrorMessage = (data: Record<string, unknown>, fallback: string) => {
  const message = data.message;
  const error = data.error;
  if (typeof message === "string" && message.trim()) return message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
};

export default function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [checkingUsername, setCheckingUsername] = useState(false);

  const signup = async (
    form: SignupPayload,
    context?: SignupContext
  ): Promise<SignupResult> => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = {
        username: form.username.trim(),
        full_name: form.fullName.trim(),
        email: form.email.trim(),
        phone_number: form.phoneNumber,
        country_code: form.countryCode,
        password: form.password,
        timezone,
        ...extractTracking(context?.searchParams),
      };

      const registerResponse = await fetch(
        `${MAIN_API_BASE_URL}/v1/authentication/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const registerData = (await registerResponse
        .json()
        .catch(() => ({}))) as Record<string, unknown>;

      // Fallback for local backend shape
      if (!registerResponse.ok) {
        const fallbackResponse = await fetch(`${MAIN_API_BASE_URL}/api/auth/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const fallbackData = (await fallbackResponse
          .json()
          .catch(() => ({}))) as Record<string, unknown>;

        if (!fallbackResponse.ok) {
          throw new Error(parseErrorMessage(fallbackData, "Signup failed"));
        }

        const fallbackMessage = parseErrorMessage(
          fallbackData,
          "Your account was created successfully."
        );
        setSuccessMessage(fallbackMessage);
        return { success: true, message: fallbackMessage };
      }

      const token = registerData.token;
      if (typeof token === "string" && token) {
        localStorage.setItem("auth_token", token);
      }

      const message = parseErrorMessage(
        registerData,
        "Your account was created successfully."
      );
      setSuccessMessage(message);
      return { success: true, message };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const checkUsernameAvailability = useCallback(async (
    username: string,
    email?: string
  ): Promise<UsernameAvailabilityResult> => {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 5) {
      return { available: false, message: "Username must be at least 5 characters." };
    }

    try {
      setCheckingUsername(true);
      const mainResponse = await fetch(
        `${MAIN_API_BASE_URL}/v1/authentication/check-unique-taken`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: trimmedUsername, ...(email ? { email: email.trim() } : {}) }),
        }
      );

      const mainData = (await mainResponse
        .json()
        .catch(() => ({}))) as Record<string, unknown>;

      if (mainResponse.ok) {
        const explicitAvailable = mainData.available;
        if (typeof explicitAvailable === "boolean") {
          return { available: explicitAvailable };
        }

        const usernameTaken = mainData.username_taken;
        if (typeof usernameTaken === "boolean") {
          return {
            available: !usernameTaken,
            message: usernameTaken ? "This username is taken." : undefined,
          };
        }

        const isTaken = mainData.usernameTaken;
        if (typeof isTaken === "boolean") {
          return {
            available: !isTaken,
            message: isTaken ? "This username is taken." : undefined,
          };
        }
      }

      const fallbackRes = await fetch(`${MAIN_API_BASE_URL}/api/auth/check-username`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: trimmedUsername, email: email?.trim() }),
      });

      if (!fallbackRes.ok) {
        return { available: true };
      }

      const data = await fallbackRes.json().catch(() => ({}));
      if (typeof data.available === "boolean") {
        return {
          available: data.available,
          message: data.available ? undefined : data.message || "This username is taken.",
        };
      }

      // Compatibility fallback for APIs returning { usernameTaken: boolean }
      if (typeof data.usernameTaken === "boolean") {
        return {
          available: !data.usernameTaken,
          message: data.usernameTaken
            ? data.message || "This username is taken."
            : undefined,
        };
      }

      return { available: true };
    } catch {
      // Do not block signup when availability API is unreachable
      return { available: true };
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  return {
    signup,
    loading,
    error,
    successMessage,
    checkUsernameAvailability,
    checkingUsername,
  };
}