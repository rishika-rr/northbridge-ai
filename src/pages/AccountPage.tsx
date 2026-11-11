import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { KeyRound } from "lucide-react";

import { useAuth } from "../auth/context";
import { ROLE_LABELS } from "../auth/permissions";
import Notice from "../components/ui/Notice";
import { Button, Card, Field, PageHeader } from "../components/ui/controls";
import { changePassword } from "../services/api";
import type { Role } from "../services/api";
import { describeError } from "../services/http";

const MIN_PASSWORD = 10;

const ROLE_SUMMARY: Record<Role, string> = {
  reader: "You can ask questions and see the documents shared with you.",
  document_manager:
    "You can ask questions, upload and delete documents, and choose who can search them.",
  administrator:
    "You can do everything a document manager can, and also manage users and read the audit log.",
};

export default function AccountPage() {
  const { user, signOut } = useAuth();

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const change = useMutation({
    mutationFn: () => changePassword(current, next),
    onError: (err) => setError(describeError(err)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!current) {
      setError("Enter your current password.");
      return;
    }
    if (next.length < MIN_PASSWORD) {
      setError(`The new password must be at least ${MIN_PASSWORD} characters long.`);
      return;
    }
    if (next !== confirm) {
      setError("The new password and its confirmation don't match.");
      return;
    }
    if (next === current) {
      setError("Choose a new password that differs from the current one.");
      return;
    }
    change.mutate();
  }

  if (!user) return null;

  return (
    <div className="space-y-10 pb-24">
      <PageHeader title="Account" description="Your profile and password." />

      <Card className="p-8">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-[13px] text-zinc-500">Username</dt>
            <dd className="mt-1 font-medium break-all">{user.username}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-zinc-500">Role</dt>
            <dd className="mt-1 font-medium">{ROLE_LABELS[user.role]}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-zinc-500">Organisation</dt>
            <dd className="mt-1 font-medium break-all">{user.tenant_id}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[14px] leading-6 text-zinc-400">{ROLE_SUMMARY[user.role]}</p>
      </Card>

      <Card className="p-8">
        <h2 className="text-xl font-semibold">Change password</h2>

        {change.isSuccess ? (
          <div className="mt-6 space-y-5">
            <Notice tone="success">
              Your password was changed and all your sessions were signed out. Sign in again with the
              new password.
            </Notice>
            <Button onClick={() => void signOut()}>Go to sign-in</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 max-w-[420px] space-y-5">
            <Field
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              disabled={change.isPending}
            />
            <Field
              label="New password"
              type="password"
              autoComplete="new-password"
              hint={`At least ${MIN_PASSWORD} characters`}
              value={next}
              onChange={(e) => setNext(e.target.value)}
              disabled={change.isPending}
            />
            <Field
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={change.isPending}
            />

            {error && <Notice>{error}</Notice>}

            <Button type="submit" disabled={change.isPending}>
              <KeyRound size={17} aria-hidden />
              {change.isPending ? "Changing…" : "Change password"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
