import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "../auth/context";
import { ROLE_LABELS } from "../auth/permissions";
import Notice from "../components/ui/Notice";
import { Badge, Button, Card, Field, PageHeader, Select } from "../components/ui/controls";
import { formatDateTime } from "../lib/format";
import { createUser, getAuditEvents, getUsers, updateUser } from "../services/api";
import type { AuditEvent, Role, User } from "../services/api";
import { describeError } from "../services/http";

const USERS_KEY = ["admin", "users"];
const ROLES: Role[] = ["reader", "document_manager", "administrator"];
const MIN_PASSWORD = 10;

type Tab = "users" | "audit";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");

  return (
    <div className="space-y-8 pb-24">
      <PageHeader
        title="Administration"
        description="Manage the people in your organisation and review security-relevant activity."
      />

      <div role="tablist" aria-label="Administration sections" className="flex gap-2">
        {(
          [
            ["users", "Users"],
            ["audit", "Audit log"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`h-10 rounded-xl px-5 text-[14px] font-medium transition ${
              tab === id
                ? "border border-blue-500/20 bg-blue-500/[0.06] text-white"
                : "text-zinc-500 hover:bg-white/[0.03] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "users" ? <UsersPanel /> : <AuditPanel />}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------- users

function UsersPanel() {
  const users = useQuery({ queryKey: USERS_KEY, queryFn: getUsers });

  return (
    <div className="space-y-8">
      <CreateUserForm />

      <section aria-labelledby="users-heading">
        <h2 id="users-heading" className="mb-5 text-xl font-semibold">
          Users
        </h2>

        {users.isPending && (
          <p role="status" className="text-zinc-500">
            Loading users…
          </p>
        )}

        {users.isError && (
          <Notice
            action={
              <Button variant="secondary" small onClick={() => void users.refetch()}>
                Try again
              </Button>
            }
          >
            <p className="font-medium">The user list couldn't be loaded.</p>
            <p className="mt-1">{describeError(users.error)}</p>
          </Notice>
        )}

        <ul className="space-y-3">
          {users.data?.map((user) => (
            <UserRow key={user.id} user={user} />
          ))}
        </ul>
      </section>
    </div>
  );
}

function CreateUserForm() {
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("reader");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createUser(username.trim(), password, role),
    onSuccess: (user) => {
      toast.success(`${user.username} was created as ${ROLE_LABELS[user.role]}.`);
      setUsername("");
      setPassword("");
      setRole("reader");
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (err) => setError(describeError(err)),
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!/^[A-Za-z0-9._@-]{3,64}$/.test(username.trim())) {
      setError("Usernames are 3–64 characters: letters, digits, and . _ @ - only.");
      return;
    }
    if (password.length < MIN_PASSWORD) {
      setError(`The password must be at least ${MIN_PASSWORD} characters long.`);
      return;
    }
    create.mutate();
  }

  return (
    <Card className="p-8">
      <h2 className="text-xl font-semibold">Add a user</h2>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Field
            label="Username"
            name="new-username"
            autoComplete="off"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={create.isPending}
          />
          <Field
            label="Initial password"
            name="new-password"
            type="password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD} characters`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={create.isPending}
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            disabled={create.isPending}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
        </div>

        {error && <Notice>{error}</Notice>}

        <Button type="submit" disabled={create.isPending}>
          <UserPlus size={17} aria-hidden />
          {create.isPending ? "Creating…" : "Create user"}
        </Button>
      </form>
    </Card>
  );
}

function UserRow({ user }: { user: User }) {
  const { user: me } = useAuth();
  const queryClient = useQueryClient();
  const isMe = me?.id === user.id;

  const [resetting, setResetting] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const update = useMutation({
    mutationFn: (changes: { role?: Role; is_active?: boolean; password?: string }) =>
      updateUser(user.id, changes),
    onSuccess: (updated, changes) => {
      setError(null);
      if (changes.password) {
        setResetting(false);
        setNewPassword("");
        toast.success(`Password reset for ${updated.username}. They have been signed out.`);
      } else if (changes.is_active !== undefined) {
        toast.success(
          updated.is_active
            ? `${updated.username} can sign in again.`
            : `${updated.username} was deactivated and signed out.`
        );
      } else {
        toast.success(`${updated.username} is now ${ROLE_LABELS[updated.role]}.`);
      }
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
    onError: (err) => {
      setError(describeError(err));
      void queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });

  function submitReset(event: FormEvent) {
    event.preventDefault();
    if (newPassword.length < MIN_PASSWORD) {
      setError(`The password must be at least ${MIN_PASSWORD} characters long.`);
      return;
    }
    update.mutate({ password: newPassword });
  }

  return (
    <li className="rounded-2xl border border-white/5 bg-white/[0.02] px-6 py-5">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="min-w-0">
          <p className="font-medium break-all">
            {user.username}
            {isMe && <span className="ml-2 text-[13px] font-normal text-zinc-500">(you)</span>}
          </p>
          <p className="mt-0.5 text-sm text-zinc-500">Added {formatDateTime(user.created_at)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={user.is_active ? "green" : "zinc"}>
            {user.is_active ? "Active" : "Deactivated"}
          </Badge>

          <label>
            <span className="sr-only">Role of {user.username}</span>
            <select
              value={user.role}
              disabled={update.isPending}
              onChange={(e) => update.mutate({ role: e.target.value as Role })}
              className="
              h-9 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-[13px] text-zinc-200
              outline-none focus:border-blue-500/50 disabled:opacity-50 [&>option]:bg-zinc-900
              "
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </label>

          <Button
            variant="secondary"
            small
            disabled={update.isPending}
            onClick={() => {
              setResetting((open) => !open);
              setError(null);
            }}
          >
            Reset password
          </Button>

          <Button
            variant={user.is_active ? "danger" : "secondary"}
            small
            disabled={update.isPending}
            onClick={() => update.mutate({ is_active: !user.is_active })}
          >
            {user.is_active ? "Deactivate" : "Reactivate"}
          </Button>
        </div>
      </div>

      {resetting && (
        <form onSubmit={submitReset} noValidate className="mt-5 flex flex-wrap items-end gap-3">
          <div className="w-72">
            <Field
              label={`New password for ${user.username}`}
              type="password"
              autoComplete="new-password"
              hint={`At least ${MIN_PASSWORD} characters. Their current sessions end immediately.`}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={update.isPending}
            />
          </div>
          <Button type="submit" small disabled={update.isPending} className="mb-[26px]">
            {update.isPending ? "Saving…" : "Set password"}
          </Button>
        </form>
      )}

      {error && (
        <div className="mt-4">
          <Notice>{error}</Notice>
        </div>
      )}
    </li>
  );
}

// ------------------------------------------------------------------- audit

const ACTION_LABELS: Record<string, string> = {
  "auth.login": "Sign-in",
  "auth.password_change": "Password change",
  "access.denied": "Access denied",
  "user.bootstrap": "First administrator created",
  "user.create": "User created",
  "user.update": "User changed",
  "document.ingest": "Document ingested",
  "document.ingest_batch": "Documents uploaded",
  "document.delete": "Document deleted",
  "document.visibility_change": "Document sharing changed",
  "document.retention_delete": "Document removed by retention",
};

const OUTCOME_TONES: Record<string, "green" | "red" | "amber" | "zinc"> = {
  success: "green",
  failure: "red",
  denied: "red",
  partial: "amber",
};

function AuditPanel() {
  const [action, setAction] = useState("");

  const audit = useQuery({
    queryKey: ["admin", "audit", action],
    queryFn: () => getAuditEvents(action || undefined),
    staleTime: 0,
  });

  return (
    <section aria-labelledby="audit-heading" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="audit-heading" className="text-xl font-semibold">
            Audit log
          </h2>
          <p className="mt-1 text-[13px] text-zinc-500">
            Most recent first, up to 200 events. Times are shown in your local time zone.
          </p>
        </div>

        <div className="flex items-end gap-3">
          <div className="w-64">
            <Select label="Show" value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="">All activity</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Button variant="secondary" onClick={() => void audit.refetch()} disabled={audit.isFetching}>
            <RefreshCw size={15} aria-hidden className={audit.isFetching ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </div>

      {audit.isPending && (
        <p role="status" className="text-zinc-500">
          Loading audit events…
        </p>
      )}

      {audit.isError && (
        <Notice
          action={
            <Button variant="secondary" small onClick={() => void audit.refetch()}>
              Try again
            </Button>
          }
        >
          <p className="font-medium">The audit log couldn't be loaded.</p>
          <p className="mt-1">{describeError(audit.error)}</p>
        </Notice>
      )}

      {audit.data && audit.data.length === 0 && (
        <p className="text-zinc-500">No matching events.</p>
      )}

      {audit.data && audit.data.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white/[0.03] text-zinc-400">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">When</th>
                <th scope="col" className="px-5 py-3 font-medium">Who</th>
                <th scope="col" className="px-5 py-3 font-medium">What</th>
                <th scope="col" className="px-5 py-3 font-medium">Outcome</th>
                <th scope="col" className="px-5 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {audit.data.map((event) => (
                <AuditRow key={event.id} event={event} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AuditRow({ event }: { event: AuditEvent }) {
  return (
    <tr className="align-top text-zinc-300">
      <td className="whitespace-nowrap px-5 py-3 text-zinc-400">{formatDateTime(event.ts)}</td>
      <td className="px-5 py-3 break-all">{event.actor_name ?? "System"}</td>
      <td className="px-5 py-3">{ACTION_LABELS[event.action] ?? event.action}</td>
      <td className="px-5 py-3">
        <Badge tone={OUTCOME_TONES[event.outcome] ?? "zinc"}>{event.outcome}</Badge>
      </td>
      <td className="px-5 py-3 text-zinc-400">
        {event.detail && <p className="break-words">{event.detail}</p>}
        {event.target && <p className="break-all text-zinc-500">Target: {event.target}</p>}
        {!event.detail && !event.target && "–"}
      </td>
    </tr>
  );
}
