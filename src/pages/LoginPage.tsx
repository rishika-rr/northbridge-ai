import { useState } from "react";
import type { FormEvent } from "react";
import { LogIn } from "lucide-react";

import { useAuth } from "../auth/context";
import NorthbridgeLogo from "../components/branding/NorthbridgeLogo";
import Notice from "../components/ui/Notice";
import { Button, Field } from "../components/ui/controls";
import { describeError } from "../services/http";

export default function LoginPage() {
  const { signIn, sessionEnded } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await signIn(username.trim(), password);
    } catch (err) {
      setError(describeError(err));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="flex flex-col items-center text-center">
          <NorthbridgeLogo />
          <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.03em] text-white">
            Sign in to Northbridge AI
          </h1>
          <p className="mt-2 text-[15px] text-zinc-500">
            Search the company knowledge you have access to.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-9 space-y-5 rounded-3xl border border-white/5 bg-white/[0.025] p-8"
        >
          {sessionEnded && !error && (
            <Notice tone="info">Your session has ended. Sign in again to continue.</Notice>
          )}
          {error && <Notice>{error}</Notice>}

          <Field
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={submitting}
          />
          <Field
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
          />

          <Button type="submit" disabled={submitting} className="w-full">
            <LogIn size={17} aria-hidden />
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-zinc-600">
          No account? Ask your administrator to create one.
        </p>
      </div>
    </div>
  );
}
