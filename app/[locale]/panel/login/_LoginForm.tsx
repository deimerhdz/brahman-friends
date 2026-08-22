"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/i18n/t";

export function LoginForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: {
    email: string;
    password: string;
    submit: string;
    failed: string;
  };
}) {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/panel/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setLoading(false);
    if (!response.ok) {
      setError(true);
      return;
    }
    router.push(`/${locale}/panel/modelos`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span>{labels.email}</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span>{labels.password}</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded border border-gray-300 px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-red-600">{labels.failed}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded bg-brand px-4 py-2 text-white disabled:opacity-50"
      >
        {labels.submit}
      </button>
    </form>
  );
}
