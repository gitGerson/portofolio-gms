"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "../auth-actions";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signInAction,
    null,
  );

  return (
    <form action={formAction} className="mt-5 flex flex-col gap-3">
      <input type="hidden" name="redirect" value={redirectTo} />
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-muted">
          Email
        </label>
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="w-full rounded-[11px] border border-line-strong bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
          placeholder="admin@goldstar.id"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-muted">
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-[11px] border border-line-strong bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-forest"
          placeholder="••••••••"
        />
      </div>

      {state?.error ? (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-[12.5px] font-semibold text-danger">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 h-11 rounded-[12px] bg-forest text-sm font-bold text-white transition-colors hover:bg-forest-dark disabled:opacity-70"
      >
        {pending ? "Memproses…" : "Masuk"}
      </button>
    </form>
  );
}
