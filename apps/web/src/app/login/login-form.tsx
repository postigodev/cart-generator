"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction, type LoginActionState } from "./actions";

const INITIAL_STATE: LoginActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="inline-flex min-h-12 items-center justify-center rounded-full bg-[color:var(--forest)] px-6 text-sm font-semibold text-[color:var(--paper)] transition hover:bg-[color:var(--forest-strong)] disabled:cursor-not-allowed disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, INITIAL_STATE);

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-[color:var(--forest-strong)]">
          Email
        </span>
        <input
          className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 text-[color:var(--ink)] outline-none ring-0 transition placeholder:text-[color:var(--ink-soft)] focus:border-[color:var(--olive)]"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-[color:var(--forest-strong)]">
          Password
        </span>
        <input
          className="min-h-12 rounded-2xl border border-[color:var(--line)] bg-white/80 px-4 text-[color:var(--ink)] outline-none ring-0 transition placeholder:text-[color:var(--ink-soft)] focus:border-[color:var(--olive)]"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Your password"
          required
        />
      </label>

      {state.error ? (
        <p className="rounded-2xl border border-[color:var(--clay)]/20 bg-[color:var(--clay)]/10 px-4 py-3 text-sm text-[color:var(--clay)]">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
