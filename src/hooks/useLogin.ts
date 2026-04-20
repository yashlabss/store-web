"use client";

import { useState } from "react";
import { API_AUTH_BASE } from "../lib/api";
import { networkErrorMessage } from "../lib/networkError";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResult = {
  success: boolean;
  message: string;
};

type ApiErrorBody = {
  message?: string;
  error?: string;
};

function parseMessage(data: ApiErrorBody, fallback: string) {
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  return fallback;
}

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const login = async (form: LoginPayload): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const res = await fetch(`${API_AUTH_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as ApiErrorBody & {
        token?: string;
      };

      if (!res.ok) {
        throw new Error(parseMessage(data, "Login failed."));
      }

      if (typeof data.token === "string" && data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      const message = parseMessage(data, "Signed in successfully.");
      setSuccessMessage(message);
      return { success: true, message };
    } catch (err: unknown) {
      const message = networkErrorMessage(err);
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error, successMessage };
}
