"use client";

import { useState } from "react";

type LoginPayload = {
  emailOrUsername: string;
  password: string;
};

type LoginResult = {
  success: boolean;
  message: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5001";
const AUTH_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_AUTH_BASE_URL ?? API_BASE_URL;

const parseErrorMessage = (data: Record<string, unknown>, fallback: string) => {
  const message = data.message;
  const error = data.error;
  if (typeof message === "string" && message.trim()) return message;
  if (typeof error === "string" && error.trim()) return error;
  return fallback;
};

export default function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const login = async (form: LoginPayload): Promise<LoginResult> => {
    try {
      setLoading(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        email_or_username: form.emailOrUsername.trim(),
        password: form.password,
        version: 2,
      };

      const refResponse = await fetch(`${AUTH_API_BASE_URL}/v1/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const refData = (await refResponse
        .json()
        .catch(() => ({}))) as Record<string, unknown>;

      let responseData = refData;
      if (!refResponse.ok) {
        const fallbackResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const fallbackData = (await fallbackResponse
          .json()
          .catch(() => ({}))) as Record<string, unknown>;
        responseData = fallbackData;

        if (!fallbackResponse.ok) {
          throw new Error(
            parseErrorMessage(
              fallbackData,
              "We couldn't find that username/password combo in our system!"
            )
          );
        }
      }

      const token = responseData.token;
      if (typeof token === "string" && token) {
        localStorage.setItem("auth_token", token);
      }

      const accessToken = responseData.accessToken;
      if (typeof accessToken === "string" && accessToken) {
        localStorage.setItem("access_token", accessToken);
      }

      const refreshToken = responseData.refreshToken;
      if (typeof refreshToken === "string" && refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      const message = parseErrorMessage(responseData, "Login successful.");
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

  return { login, loading, error, successMessage };
}
