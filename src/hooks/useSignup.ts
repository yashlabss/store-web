"use client";

import { useState } from "react";
import { API_AUTH_BASE } from "../lib/api";
import { networkErrorMessage as formatFetchError } from "../lib/networkError";

export type SignupPayload = {
  username: string;
  full_name: string;
  email: string;
  password: string;
  country_code: string;
  phone: string;
};

type SignupResult = {
  success: boolean;
  message: string;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
  detail?: string;
};

function parseMessage(data: ApiErrorBody & Record<string, unknown>, fallback: string) {
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;
  return fallback;
}

export default function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const signup = async (form: SignupPayload): Promise<SignupResult> => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const res = await fetch(`${API_AUTH_BASE}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          password: form.password,
          country_code: form.country_code.trim(),
          phone: form.phone.trim(),
        }),
      });

      const data = (await res.json().catch(() => ({}))) as ApiErrorBody & {
        token?: string;
      };

      if (!res.ok) {
        throw new Error(parseMessage(data, "Could not create account."));
      }

      if (typeof data.token === "string" && data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      const message = parseMessage(data, "Account created successfully.");
      setSuccessMessage(message);
      return { success: true, message };
    } catch (err: unknown) {
      const message = formatFetchError(err);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, successMessage };
}
